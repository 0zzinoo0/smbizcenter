import { getStore } from '@netlify/blobs';
import { verifyToken, json } from './_auth.js';

const IMAGE_LIMIT = 8 * 1024 * 1024;
const VIDEO_LIMIT = 45 * 1024 * 1024;
const allowedVideo = new Set(['video/mp4', 'video/webm', 'video/quicktime']);

export default async (request) => {
  if (request.method !== 'POST') return json(405, { error: 'POST만 허용됩니다.' });
  if (!verifyToken(request.headers.get('authorization') || '')) return json(401, { error: '로그인이 만료되었습니다.' });
  try {
    const { filename, contentType, data } = await request.json();
    const isImage = contentType?.startsWith('image/');
    const isVideo = allowedVideo.has(contentType);
    if (!data || (!isImage && !isVideo)) return json(400, { error: 'JPG·PNG·WEBP 이미지 또는 MP4·WEBM·MOV 동영상만 업로드할 수 있습니다.' });
    const buffer = Buffer.from(data, 'base64');
    const limit = isVideo ? VIDEO_LIMIT : IMAGE_LIMIT;
    if (buffer.length > limit) return json(413, { error: isVideo ? '동영상은 45MB 이하로 올려 주세요.' : '이미지는 8MB 이하로 올려 주세요.' });
    const safe = String(filename || (isVideo ? 'video' : 'image')).replace(/[^a-zA-Z0-9._-]/g, '_');
    const key = `${Date.now()}-${safe}`;
    const store = getStore('smbiz-media');
    await store.set(key, buffer, { metadata: { contentType } });
    return json(200, { url: `/.netlify/functions/media?id=${encodeURIComponent(key)}`, type: isVideo ? 'video' : 'image' });
  } catch (error) {
    return json(500, { error: '파일 업로드에 실패했습니다.', detail: error.message });
  }
};
