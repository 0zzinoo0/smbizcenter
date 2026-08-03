import crypto from 'node:crypto';

const enc = (value) => Buffer.from(value).toString('base64url');
const dec = (value) => Buffer.from(value, 'base64url').toString('utf8');

function secret() {
  return process.env.ADMIN_SECRET || process.env.ADMIN_PASSWORD || '';
}

export function createToken(username) {
  const payload = enc(JSON.stringify({ username, exp: Date.now() + 8 * 60 * 60 * 1000 }));
  const signature = crypto.createHmac('sha256', secret()).update(payload).digest('base64url');
  return `${payload}.${signature}`;
}

export function verifyToken(header = '') {
  if (!secret()) return false;
  const token = header.replace(/^Bearer\s+/i, '');
  const [payload, signature] = token.split('.');
  if (!payload || !signature) return false;
  const expected = crypto.createHmac('sha256', secret()).update(payload).digest('base64url');
  if (signature.length !== expected.length || !crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) return false;
  try {
    const data = JSON.parse(dec(payload));
    return data.exp > Date.now();
  } catch {
    return false;
  }
}

export function json(statusCode, body) {
  return {
    statusCode,
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' },
    body: JSON.stringify(body)
  };
}
