import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { LinkedInAPI } from "../integrations/linkedin/index.js";
import { loadTokens } from "../integrations/linkedin/tokenStore.js";

const LINKEDIN_AUTH_URL = 'https://www.linkedin.com/oauth/v2/authorization';
const LINKEDIN_TOKEN_URL = 'https://www.linkedin.com/oauth/v2/accessToken';
const LINKEDIN_USERINFO_URL = 'https://api.linkedin.com/v2/userinfo';

function getRedirectUri(request: FastifyRequest, app: string): string {
  const protocol = request.headers['x-forwarded-proto'] || 'http';
  const host = request.headers['x-forwarded-host'] || request.headers.host;
  return `${protocol}://${host}/admin/linkedin/callback/${app}`;
}

export function registerAdminRoutes(fastify: FastifyInstance, _: any, done: () => void) {

  // Admin page
  fastify.get('/linkedin', async (request: FastifyRequest, reply: FastifyReply) => {
    const tokens = loadTokens();
    const generalConnected = !!(tokens?.general?.access_token);
    const cmConnected = !!(tokens?.community_management?.access_token);
    const personUrn = tokens?.person_urn || process.env.LINKEDIN_PERSON_URN || '';
    const query = request.query as Record<string, string>;

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>LinkedIn Integration — Admin</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #1a1a2e; color: #eee; min-height: 100vh; display: flex; align-items: center; justify-content: center; }
    .container { max-width: 600px; width: 100%; padding: 2rem; }
    h1 { font-size: 1.5rem; margin-bottom: 0.5rem; }
    .subtitle { color: #888; margin-bottom: 2rem; }
    .card { background: #16213e; border-radius: 12px; padding: 1.5rem; margin-bottom: 1rem; border: 1px solid #0f3460; }
    .card h2 { font-size: 1.1rem; margin-bottom: 0.25rem; }
    .card p { color: #999; font-size: 0.85rem; margin-bottom: 1rem; }
    .status { display: inline-block; padding: 0.25rem 0.75rem; border-radius: 20px; font-size: 0.8rem; font-weight: 600; margin-bottom: 1rem; }
    .status.connected { background: #064e3b; color: #34d399; }
    .status.disconnected { background: #7f1d1d; color: #fca5a5; }
    .btn { display: inline-block; padding: 0.6rem 1.25rem; border-radius: 8px; font-size: 0.9rem; font-weight: 600; text-decoration: none; cursor: pointer; border: none; }
    .btn-linkedin { background: #0A66C2; color: #fff; }
    .btn-linkedin:hover { background: #004182; }
    .info { background: #1e293b; border-radius: 8px; padding: 1rem; margin-top: 1.5rem; border: 1px solid #334155; }
    .info label { font-size: 0.75rem; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.05em; }
    .info .value { font-family: monospace; font-size: 0.85rem; color: #e2e8f0; margin-top: 0.25rem; word-break: break-all; }
    .msg { padding: 0.75rem 1rem; border-radius: 8px; margin-bottom: 1rem; font-size: 0.85rem; }
    .msg.success { background: #064e3b; color: #34d399; border: 1px solid #065f46; }
    .msg.error { background: #7f1d1d; color: #fca5a5; border: 1px solid #991b1b; }
  </style>
</head>
<body>
  <div class="container">
    <h1>&#128279; LinkedIn Integration</h1>
    <p class="subtitle">Connect your LinkedIn apps to enable live chat integration</p>

    ${query.success ? `<div class="msg success">&#9989; ${query.app === 'cm' ? 'Community Management' : 'General'} app connected successfully!</div>` : ''}
    ${query.error ? `<div class="msg error">&#10060; Error: ${query.error}</div>` : ''}

    <div class="card">
      <h2>General App</h2>
      <p>Share on LinkedIn &mdash; used for posting command replies to comments</p>
      <span class="status ${generalConnected ? 'connected' : 'disconnected'}">${generalConnected ? '&#9679; Connected' : '&#9675; Not Connected'}</span>
      <br>
      <a class="btn btn-linkedin" href="/admin/linkedin/auth/general">${generalConnected ? 'Reconnect' : 'Connect'} General App</a>
    </div>

    <div class="card">
      <h2>Community Management App</h2>
      <p>Required for reading comments, posts, and profiles during live streams</p>
      <span class="status ${cmConnected ? 'connected' : 'disconnected'}">${cmConnected ? '&#9679; Connected' : '&#9675; Not Connected'}</span>
      <br>
      <a class="btn btn-linkedin" href="/admin/linkedin/auth/cm">${cmConnected ? 'Reconnect' : 'Connect'} CM App</a>
    </div>

    ${personUrn ? `
    <div class="info">
      <label>Person URN (auto-detected)</label>
      <div class="value">${personUrn}</div>
    </div>` : ''}
  </div>
</body>
</html>`;

    reply.type('text/html').send(html);
  });

  // Start OAuth flow for general app
  fastify.get('/linkedin/auth/general', async (request: FastifyRequest, reply: FastifyReply) => {
    const clientId = process.env.LINKEDIN_CLIENT_ID;
    if (!clientId) {
      return reply.redirect('/admin/linkedin?error=LINKEDIN_CLIENT_ID+not+set+in+env');
    }

    const redirectUri = getRedirectUri(request, 'general');
    const scopes = 'openid profile w_member_social';
    const state = `general_${Date.now()}`;

    const url = `${LINKEDIN_AUTH_URL}?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scopes)}&state=${state}`;
    return reply.redirect(url);
  });

  // Start OAuth flow for CM app
  fastify.get('/linkedin/auth/cm', async (request: FastifyRequest, reply: FastifyReply) => {
    const clientId = process.env.LINKEDIN_CM_CLIENT_ID;
    if (!clientId) {
      return reply.redirect('/admin/linkedin?error=LINKEDIN_CM_CLIENT_ID+not+set+in+env');
    }

    const redirectUri = getRedirectUri(request, 'cm');
    const scopes = 'r_organization_social w_organization_social';
    const state = `cm_${Date.now()}`;

    const url = `${LINKEDIN_AUTH_URL}?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scopes)}&state=${state}`;
    return reply.redirect(url);
  });

  // OAuth callback for general app
  fastify.get('/linkedin/callback/general', async (request: FastifyRequest, reply: FastifyReply) => {
    const { code, error } = request.query as { code?: string; error?: string };

    if (error || !code) {
      return reply.redirect(`/admin/linkedin?error=${error || 'no_code'}`);
    }

    try {
      const clientId = process.env.LINKEDIN_CLIENT_ID!;
      const clientSecret = process.env.LINKEDIN_CLIENT_SECRET!;
      const redirectUri = getRedirectUri(request, 'general');

      const tokenResponse = await fetch(LINKEDIN_TOKEN_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          grant_type: 'authorization_code',
          code,
          client_id: clientId,
          client_secret: clientSecret,
          redirect_uri: redirectUri
        })
      });

      if (!tokenResponse.ok) {
        const err = await tokenResponse.text();
        console.error('LinkedIn general token exchange failed:', err);
        return reply.redirect('/admin/linkedin?error=token_exchange_failed');
      }

      const tokenData = await tokenResponse.json();

      // Fetch person URN via userinfo
      const userinfoResponse = await fetch(LINKEDIN_USERINFO_URL, {
        headers: { 'Authorization': `Bearer ${tokenData.access_token}` }
      });

      let personUrn: string | undefined;
      if (userinfoResponse.ok) {
        const userinfo = await userinfoResponse.json();
        personUrn = `urn:li:person:${userinfo.sub}`;
        console.log(`LinkedIn Person URN resolved: ${personUrn}`);
      }

      LinkedInAPI.setGeneralTokens(tokenData.access_token, tokenData.refresh_token || '', personUrn);
      return reply.redirect('/admin/linkedin?success=true&app=general');
    } catch (err) {
      console.error('LinkedIn general OAuth callback error:', err);
      return reply.redirect('/admin/linkedin?error=callback_failed');
    }
  });

  // OAuth callback for CM app
  fastify.get('/linkedin/callback/cm', async (request: FastifyRequest, reply: FastifyReply) => {
    const { code, error } = request.query as { code?: string; error?: string };

    if (error || !code) {
      return reply.redirect(`/admin/linkedin?error=${error || 'no_code'}`);
    }

    try {
      const clientId = process.env.LINKEDIN_CM_CLIENT_ID!;
      const clientSecret = process.env.LINKEDIN_CM_CLIENT_SECRET!;
      const redirectUri = getRedirectUri(request, 'cm');

      const tokenResponse = await fetch(LINKEDIN_TOKEN_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          grant_type: 'authorization_code',
          code,
          client_id: clientId,
          client_secret: clientSecret,
          redirect_uri: redirectUri
        })
      });

      if (!tokenResponse.ok) {
        const err = await tokenResponse.text();
        console.error('LinkedIn CM token exchange failed:', err);
        return reply.redirect('/admin/linkedin?error=token_exchange_failed');
      }

      const tokenData = await tokenResponse.json();
      LinkedInAPI.setCmTokens(tokenData.access_token, tokenData.refresh_token || '');
      return reply.redirect('/admin/linkedin?success=true&app=cm');
    } catch (err) {
      console.error('LinkedIn CM OAuth callback error:', err);
      return reply.redirect('/admin/linkedin?error=callback_failed');
    }
  });

  done();
}
