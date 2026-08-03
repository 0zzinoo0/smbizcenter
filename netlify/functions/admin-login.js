import crypto from 'node:crypto';
import { createToken, json } from './_auth.js';

const equal = (a, b) => {
  const x = Buffer.from(String(a));
  const y = Buffer.from(String(b));
  return x.length === y.length && crypto.timingSafeEqual(x, y);
};

export default async (request) => {
  if (request.method !== 'POST') return json(405, { error: 'POST만 허용됩니다.' });
  const configuredUser = process.env.ADMIN_USER;
  const configuredPassword = process.env.ADMIN_PASSWORD;
  if (!configuredUser || !configuredPassword) return json(503, { error: 'Netlify 환경변수 ADMIN_USER와 ADMIN_PASSWORD를 먼저 설정해 주세요.' });
  try {
    const { username, password } = await request.json();
    if (!equal(username, configuredUser) || !equal(password, configuredPassword)) return json(401, { error: '아이디 또는 비밀번호가 올바르지 않습니다.' });
    return json(200, { token: createToken(configuredUser) });
  } catch {
    return json(400, { error: '요청 형식이 올바르지 않습니다.' });
  }
};
