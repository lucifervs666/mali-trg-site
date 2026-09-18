import crypto from 'crypto';

export const COOKIE = 'mt_admin';
const MAX_AGE_MS = 12 * 60 * 60 * 1000; // 12 hours

function secret() {
  return process.env.ADMIN_PASSWORD || 'malitrg2026';
}

function sign(value) {
  return crypto.createHmac('sha256', secret()).update(value).digest('hex');
}

export function checkPassword(password) {
  return password === secret();
}

export function makeToken() {
  const ts = Date.now().toString();
  return `${ts}.${sign(ts)}`;
}

export function verifyToken(token) {
  if (!token) return false;
  const parts = token.split('.');
  if (parts.length !== 2) return false;
  const [ts, sig] = parts;
  if (sign(ts) !== sig) return false;
  if (Date.now() - Number(ts) > MAX_AGE_MS) return false;
  return true;
}

export function isAuthedRequest(request) {
  const cookieHeader = request.headers.get('cookie') || '';
  const match = cookieHeader.match(new RegExp(`${COOKIE}=([^;]+)`));
  return verifyToken(match ? decodeURIComponent(match[1]) : null);
}
