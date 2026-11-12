// RedLoveBD push relay (Cloudflare Worker, free plan).
// App calls POST /push { id } with its Firebase ID token. We verify the token, read the
// notification doc, and send an FCM push to the receiver's devices.
// Settings needed: variable PROJECT_ID (e.g. redlovebd-123) and secret SA_JSON (Firebase service-account key JSON).

const CORS = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'Content-Type, Authorization', 'Access-Control-Allow-Methods': 'POST, OPTIONS' };
const json = (o, status = 200) => new Response(JSON.stringify(o), { status, headers: { 'Content-Type': 'application/json', ...CORS } });
const enc = new TextEncoder();
const b64u = (buf) => btoa(String.fromCharCode(...new Uint8Array(buf))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
const b64uBytes = (s) => { s = s.replace(/-/g, '+').replace(/_/g, '/'); while (s.length % 4) s += '='; return Uint8Array.from(atob(s), (c) => c.charCodeAt(0)); };
const b64uJson = (s) => JSON.parse(new TextDecoder().decode(b64uBytes(s)));

async function verifyIdToken(token, projectId) {
  const [h, p, sig] = String(token || '').split('.');
  if (!h || !p || !sig) throw new Error('bad token');
  const head = b64uJson(h), claims = b64uJson(p), now = Math.floor(Date.now() / 1000);
  if (head.alg !== 'RS256') throw new Error('bad alg');
  if (claims.aud !== projectId || claims.iss !== 'https://securetoken.google.com/' + projectId) throw new Error('bad claims');
  if (!claims.sub || claims.exp < now || claims.iat > now + 300) throw new Error('expired');
  const jwks = await (await fetch('https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com', { cf: { cacheTtl: 3600, cacheEverything: true } })).json();
  const jwk = jwks.keys.find((k) => k.kid === head.kid);
  if (!jwk) throw new Error('unknown key');
  const key = await crypto.subtle.importKey('jwk', jwk, { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' }, false, ['verify']);
  const ok = await crypto.subtle.verify('RSASSA-PKCS1-v1_5', key, b64uBytes(sig), enc.encode(h + '.' + p));
  if (!ok) throw new Error('bad signature');
  return claims.sub;
}

let cached = null;
async function accessToken(sa) {
  const now = Math.floor(Date.now() / 1000);
  if (cached && cached.exp > now + 60) return cached.token;
  const header = b64u(enc.encode(JSON.stringify({ alg: 'RS256', typ: 'JWT' })));
  const claim = b64u(enc.encode(JSON.stringify({ iss: sa.client_email, scope: 'https://www.googleapis.com/auth/datastore https://www.googleapis.com/auth/firebase.messaging', aud: 'https://oauth2.googleapis.com/token', iat: now, exp: now + 3600 })));
  const der = Uint8Array.from(atob(sa.private_key.replace(/-----[^-]+-----/g, '').replace(/\s/g, '')), (c) => c.charCodeAt(0));
  const key = await crypto.subtle.importKey('pkcs8', der, { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' }, false, ['sign']);
  const sig = b64u(await crypto.subtle.sign('RSASSA-PKCS1-v1_5', key, enc.encode(header + '.' + claim)));
  const r = await fetch('https://oauth2.googleapis.com/token', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: 'grant_type=urn%3Aietf%3Aparams%3Aoauth%3Agrant-type%3Ajwt-bearer&assertion=' + header + '.' + claim + '.' + sig });
  const j = await r.json();
  if (!j.access_token) throw new Error('oauth failed');
  cached = { token: j.access_token, exp: now + 3000 };
  return cached.token;
}

const TEXT = {
  request: (n) => n + ' আপনাকে যোগাযোগের অনুরোধ পাঠিয়েছেন',
  accepted: (n) => n + ' আপনার অনুরোধ গ্রহণ করেছেন',
  declined: (n) => n + ' আপনার অনুরোধ গ্রহণ করেননি',
};

export default {
  async fetch(req, env) {
    if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: CORS });
    if (req.method !== 'POST') return json({ ok: true, service: 'redlovebd-push' });
    try {
      const projectId = env.PROJECT_ID || 'redlovebd-123';
      const sa = JSON.parse(env.SA_JSON);
      const uid = await verifyIdToken((req.headers.get('Authorization') || '').replace(/^Bearer /, ''), projectId);
      const { id } = await req.json();
      if (!id || /[\/\s]/.test(id)) return json({ error: 'bad id' }, 400);
      const at = await accessToken(sa);
      const auth = { Authorization: 'Bearer ' + at };
      const base = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents`;

      const nr = await fetch(`${base}/notifications/${id}`, { headers: auth });
      if (!nr.ok) return json({ error: 'not found' }, 404);
      const f = (await nr.json()).fields || {};
      const s = (k) => f[k]?.stringValue || '';
      if (s('fromUid') !== uid) return json({ error: 'forbidden' }, 403);
      if (f.pushed?.booleanValue) return json({ ok: true, skipped: 'already' });
      if (Date.now() - Number(f.createdAt?.integerValue || f.createdAt?.doubleValue || 0) > 120000) return json({ error: 'too old' }, 400);
      const kind = TEXT[s('kind')] ? s('kind') : 'request';
      const toUid = s('toUid');
      if (!toUid || toUid === uid) return json({ error: 'bad target' }, 400);

      await fetch(`${base}/notifications/${id}?updateMask.fieldPaths=pushed`, { method: 'PATCH', headers: { ...auth, 'Content-Type': 'application/json' }, body: JSON.stringify({ fields: { pushed: { booleanValue: true } } }) });

      const dr = await fetch(`${base}/users/${toUid}/devices?pageSize=20`, { headers: auth });
      const tokens = ((await dr.json()).documents || []).map((d) => d.fields?.token?.stringValue).filter(Boolean);
      let sent = 0;
      for (const token of tokens) {
        const r = await fetch(`https://fcm.googleapis.com/v1/projects/${projectId}/messages:send`, {
          method: 'POST', headers: { ...auth, 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: { token, notification: { title: 'RedLoveBD 🩸', body: TEXT[kind](s('fromName') || 'কেউ') }, data: { kind }, android: { priority: 'HIGH' } } }),
        });
        if (r.ok) sent++;
        else if (r.status === 404 || r.status === 400) await fetch(`${base}/users/${toUid}/devices/${encodeURIComponent(token)}`, { method: 'DELETE', headers: auth });
      }
      return json({ ok: true, sent });
    } catch (e) {
      return json({ error: String(e.message || e) }, 401);
    }
  },
};
