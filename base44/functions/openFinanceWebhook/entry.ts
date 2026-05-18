import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

/**
 * Maps Pluggy category strings to our internal Transaction categories.
 */
function mapCategory(pluggyCategory) {
  const map = {
    'Food and Beverage': 'alimentacao',
    'Restaurants': 'alimentacao',
    'Transportation': 'transporte',
    'Entertainment': 'lazer',
    'Health': 'saude',
    'Education': 'educacao',
    'Investments': 'investimento',
    'Salary': 'salario',
    'Freelance': 'freelance',
  };
  return map[pluggyCategory] || 'outros';
}

/**
 * Core XP logic: maps a real transaction to XP earned/lost.
 * Expense on leisure/restaurants: -10 XP (supérfluo)
 * Expense on essentials: +5 XP (responsabilidade)
 * Income: +20 XP
 */
function processRealTransaction(transaction) {
  const { amount, category, description } = transaction;
  let xpEarned = 0;

  if (amount < 0) {
    if (category === 'lazer' || category === 'alimentacao') {
      xpEarned = -10;
    } else {
      xpEarned = 5;
    }
  } else {
    xpEarned = 20;
  }

  return { amount, category, description, xpEarned };
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();

    // Pluggy webhook payload: body.event === 'transactions/created' | 'transactions/updated'
    // body.data.transactions = array of transaction objects
    const rawTransactions = body?.data?.transactions || [];
    if (rawTransactions.length === 0) {
      return Response.json({ received: true, processed: 0 });
    }

    // Identify the user via clientUserId stored in the item
    const clientUserId = body?.data?.item?.clientUserId;

    let totalXp = 0;
    const created = [];

    for (const raw of rawTransactions) {
      const category = mapCategory(raw.category || '');
      const mapped = processRealTransaction({
        amount: raw.amount,
        category,
        description: raw.description || raw.descriptionRaw || '',
      });

      const txRecord = await base44.asServiceRole.entities.Transaction.create({
        description: mapped.description,
        amount: Math.abs(mapped.amount),
        type: mapped.amount < 0 ? 'expense' : 'income',
        category: mapped.category,
        date: (raw.date || new Date().toISOString()).split('T')[0],
        account: raw.accountId || 'Pluggy',
        xp_awarded: mapped.xpEarned,
      });

      totalXp += mapped.xpEarned;
      created.push(txRecord.id);
    }

    // Update XP on UserProfile for this user if we can find them
    if (clientUserId) {
      const profiles = await base44.asServiceRole.entities.UserProfile.filter({ created_by: clientUserId });
      if (profiles.length > 0) {
        const profile = profiles[0];
        const newXp = Math.max(0, (profile.xp || 0) + totalXp);
        const newWisdomXp = Math.max(0, (profile.wisdom_xp || 0) + totalXp);
        await base44.asServiceRole.entities.UserProfile.update(profile.id, {
          xp: newXp,
          wisdom_xp: newWisdomXp,
          open_finance_last_sync: new Date().toISOString(),
        });
      }
    }

    return Response.json({ received: true, processed: created.length, xpDelta: totalXp });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});