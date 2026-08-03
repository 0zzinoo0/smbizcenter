import { getStore } from '@netlify/blobs';
import { verifyToken, json } from './_auth.js';

export default async (request) => {
  if (request.method !== 'POST') return json(405, { error: 'POST만 허용됩니다.' });
  if (!verifyToken(request.headers.get('authorization') || '')) return json(401, { error: '로그인이 만료되었습니다.' });
  try {
    const { filename, contentType, data } = await request.json();
    if (!data || !contentType?.startsWith('image/')) return json(400, { error: '이미지 파일만 업로드할 수 있습니다.' });
    const buffer = Buffer.from(data, 'base64');
    if (buffer.length > 3 * 1024 * 1024) return json(413, { error: '이미지는 3MB 이하로 올려 주세요.' });
    const safe = String(filename || 'image').replace(/[^a-zA-Z0-9._-]/g, '_');
    const key = `${Date.now()}-${safe}`;
    const store = getStore('smbiz-media');
    await store.set(key, buffer, { metadata: { contentType } });
    return json(200, { url: `/.netlify/functions/media?id=${encodeURIComponent(key)}` });
  } catch (error) {
    return json(500, { error: '이미지 업로드에 실패했습니다.', detail: error.message });
  }
};
