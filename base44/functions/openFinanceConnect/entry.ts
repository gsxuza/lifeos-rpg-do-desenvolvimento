import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const clientId = Deno.env.get('PLUGGY_CLIENT_ID');
    const clientSecret = Deno.env.get('PLUGGY_CLIENT_SECRET');

    // 1. Authenticate with Pluggy to get API key
    const authRes = await fetch('https://api.pluggy.ai/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ clientId, clientSecret }),
    });
    if (!authRes.ok) {
      const err = await authRes.text();
      return Response.json({ error: `Pluggy auth failed: ${err}` }, { status: 502 });
    }
    const { apiKey } = await authRes.json();

    // 2. Create a Connect Token for the widget
    const tokenRes = await fetch('https://api.pluggy.ai/connect_token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-API-KEY': apiKey },
      body: JSON.stringify({ clientUserId: user.id }),
    });
    if (!tokenRes.ok) {
      const err = await tokenRes.text();
      return Response.json({ error: `Connect token failed: ${err}` }, { status: 502 });
    }
    const { accessToken } = await tokenRes.json();

    return Response.json({ connectToken: accessToken });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});