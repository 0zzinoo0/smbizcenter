import { getStore } from '@netlify/blobs';
import { verifyToken, json } from './_auth.js';

export default async (request) => {
  if (request.method !== 'POST') return json(405, { error: 'POST만 허용됩니다.' });
  if (!verifyToken(request.headers.get('authorization') || '')) return json(401, { error: '로그인이 만료되었습니다. 다시 로그인해 주세요.' });
  try {
    const content = await request.json();
    if (!content || typeof content !== 'object' || !content.company || !content.home) return json(400, { error: '콘텐츠 형식이 올바르지 않습니다.' });
    const store = getStore('smbiz-cms');
    await store.setJSON('site-content', content);
    return json(200, { ok: true, savedAt: new Date().toISOString() });
  } catch (error) {
    return json(500, { error: '저장하지 못했습니다.', detail: error.message });
  }
};
