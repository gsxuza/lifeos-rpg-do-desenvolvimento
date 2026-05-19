import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

/**
 * Dynamic Difficulty Adjustment (DDA) engine.
 * Analyzes the user's quest completion history to calibrate difficulty.
 * Returns a multiplier: < 1 = easier, > 1 = harder.
 */
function calculateDDA(recentQuests) {
  if (!recentQuests || recentQuests.length === 0) return 1.0;
  const completed = recentQuests.filter(q => q.status === 'completed').length;
  const total = recentQuests.length;
  const completionRate = completed / total;

  // Flow state thresholds
  if (completionRate >= 0.9) return 1.3;   // Very high success → increase challenge
  if (completionRate >= 0.7) return 1.1;   // Good → slight increase
  if (completionRate >= 0.5) return 1.0;   // Balanced → maintain
  if (completionRate >= 0.3) return 0.8;   // Struggling → reduce difficulty
  return 0.6;                              // Failing a lot → significantly easier
}

function applyDDA(baseXp, multiplier) {
  return Math.round(baseXp * multiplier / 10) * 10; // round to nearest 10
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch user profile and context data in parallel
    const [profiles, recentQuests, recentTransactions, recentProjects] = await Promise.all([
      base44.entities.UserProfile.list(),
      base44.entities.Quest.filter({}, '-created_date', 20),
      base44.entities.Transaction.list('-date', 30),
      base44.entities.Project.filter({ status: 'doing' }, '-created_date', 5),
    ]);

    const profile = profiles[0];
    if (!profile) {
      return Response.json({ error: 'Profile not found' }, { status: 404 });
    }

    // Calculate DDA multiplier
    const ddaMultiplier = calculateDDA(recentQuests);

    // Build financial context
    const now = new Date();
    const thisMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const monthExpenses = recentTransactions
      .filter(t => t.type === 'expense' && t.date?.startsWith(thisMonth))
      .reduce((s, t) => s + (t.amount || 0), 0);
    const monthIncome = recentTransactions
      .filter(t => t.type === 'income' && t.date?.startsWith(thisMonth))
      .reduce((s, t) => s + (t.amount || 0), 0);
    const lazerExpenses = recentTransactions
      .filter(t => t.type === 'expense' && (t.category === 'lazer' || t.category === 'alimentacao') && t.date?.startsWith(thisMonth))
      .reduce((s, t) => s + (t.amount || 0), 0);

    const spendingLimit = (profile.spending_limits?.lazer || 500) + (profile.spending_limits?.alimentacao || 1200);
    const overSpending = lazerExpenses > spendingLimit * 0.8;
    const savingsRate = monthIncome > 0 ? ((monthIncome - monthExpenses) / monthIncome * 100).toFixed(0) : 0;

    // Delete today's existing AI-generated quests to regenerate fresh
    const todayStr = now.toISOString().split('T')[0];
    const todayQuests = recentQuests.filter(q => q.created_date?.startsWith(todayStr));
    for (const q of todayQuests) {
      await base44.entities.Quest.delete(q.id);
    }

    // Build LLM prompt with full context
    const prompt = `Você é uma IA mentora de estilo de vida (LifeOS) que gera missões diárias altamente personalizadas.

PERFIL DO USUÁRIO:
- Arquétipo: ${profile.archetype || 'Hábitos Saudáveis'}
- Nível: ${profile.level || 1} | XP: ${profile.xp || 0}
- Energia atual: ${profile.energy || 80}%
- Streak de dias: ${profile.streak_days || 0}
- Tom preferido da IA: ${profile.ai_tone || 'motivador'}
- Horas disponíveis por dia: ${profile.daily_hours || 1}h

CONTEXTO FINANCEIRO DO MÊS:
- Receita: R$ ${monthIncome.toFixed(2)}
- Gastos totais: R$ ${monthExpenses.toFixed(2)}
- Lazer + Alimentação: R$ ${lazerExpenses.toFixed(2)} (limite: R$ ${spendingLimit.toFixed(2)})
- Taxa de poupança: ${savingsRate}%
- Situação: ${overSpending ? 'ALERTA: gastos de lazer/alimentação acima de 80% do limite' : 'Gastos controlados'}

PROJETOS EM ANDAMENTO: ${recentProjects.map(p => p.title).join(', ') || 'Nenhum'}

MOTOR DDA (Ajuste Dinâmico de Dificuldade):
- Multiplicador de XP: ${ddaMultiplier} (${ddaMultiplier > 1 ? 'usuário bem-sucedido → aumento de desafio' : ddaMultiplier < 1 ? 'usuário com dificuldades → redução de exigência' : 'equilíbrio mantido'})

REGRAS DE GERAÇÃO:
1. Gere EXATAMENTE 3 missões diárias e 1 missão semanal
2. Se gastos excessivos detectados: a missão financeira DEVE ser de contenção (cozinhar em casa, cancelar assinaturas, etc.)
3. Se energia < 50%: inclua uma missão de recuperação (descanso, meditação)
4. Adapte o título ao arquétipo: ${profile.archetype === 'Poupador' ? 'linguagem financeira' : profile.archetype === 'Transição de Carreira' ? 'linguagem de crescimento profissional' : 'linguagem de bem-estar e hábitos'}
5. XP base por missão diária: 100. Aplique multiplicador DDA: ${ddaMultiplier}x → XP final = ${applyDDA(100, ddaMultiplier)}
6. XP base por missão semanal: 300. Com DDA: ${applyDDA(300, ddaMultiplier)}
7. Missões devem ser específicas, mensuráveis e realizáveis em ${profile.daily_hours || 1}h`;

    const result = await base44.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: 'object',
        properties: {
          quests: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                title: { type: 'string' },
                description: { type: 'string' },
                type: { type: 'string', enum: ['daily', 'weekly'] },
                pillar: { type: 'string', enum: ['financeiro', 'profissional', 'pessoal'] },
                xp_reward: { type: 'number' },
                icon: { type: 'string' },
                target: { type: 'number' },
              },
            },
          },
          dda_message: { type: 'string' },
        },
      },
    });

    // Persist generated quests
    const createdQuests = [];
    for (const q of (result.quests || [])) {
      const created = await base44.entities.Quest.create({
        title: q.title,
        description: q.description || '',
        type: q.type || 'daily',
        pillar: q.pillar || 'pessoal',
        xp_reward: q.xp_reward || applyDDA(100, ddaMultiplier),
        icon: q.icon || '⚡',
        target: q.target || 1,
        progress: 0,
        status: 'active',
        expires_at: new Date(now.getFullYear(), now.getMonth(), now.getDate() + (q.type === 'weekly' ? 7 : 1)).toISOString().split('T')[0],
      });
      createdQuests.push(created);
    }

    return Response.json({
      success: true,
      quests_generated: createdQuests.length,
      dda_multiplier: ddaMultiplier,
      dda_message: result.dda_message || '',
      quests: createdQuests,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});