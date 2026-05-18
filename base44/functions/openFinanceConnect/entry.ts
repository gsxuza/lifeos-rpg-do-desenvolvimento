import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

/**
 * POST /openFinanceConnect
 * Returns a Pluggy connectToken to open the bank-linking widget.
 * Requires PLUGGY_CLIENT_ID and PLUGGY_CLIENT_SECRET env secrets.
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const clientId = Deno.env.get('PLUGGY_CLIENT_ID');
    const clientSecret = Deno.env.get('PLUGGY_CLIENT_SECRET');

    if (!clientId || !clientSecret) {
      return Response.json({
        error: 'Credenciais Pluggy não configuradas. Adicione PLUGGY_CLIENT_ID e PLUGGY_CLIENT_SECRET nas variáveis de ambiente.'
      }, { status: 503 });
    }

    // Step 1: Get API key from Pluggy
    const authRes = await fetch('https://api.pluggy.ai/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ clientId, clientSecret }),
    });

    if (!authRes.ok) {
      const text = await authRes.text();
      return Response.json({ error: `Pluggy auth falhou: ${text}` }, { status: 502 });
    }
    const { apiKey } = await authRes.json();

    // Step 2: Create connect token tied to this user
    const tokenRes = await fetch('https://api.pluggy.ai/connect_token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-API-KEY': apiKey },
      body: JSON.stringify({ clientUserId: user.id }),
    });

    if (!tokenRes.ok) {
      const text = await tokenRes.text();
      return Response.json({ error: `Connect token falhou: ${text}` }, { status: 502 });
    }

    const { accessToken } = await tokenRes.json();
    return Response.json({ connectToken: accessToken, userId: user.id });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});