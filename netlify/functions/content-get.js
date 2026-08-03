import { getStore } from '@netlify/blobs';
import { json } from './_auth.js';

export default async (request) => {
  if (request.method !== 'GET') return json(405, { error: 'GET만 허용됩니다.' });
  try {
    const store = getStore('smbiz-cms');
    const data = await store.get('site-content', { type: 'json' });
    if (!data) return json(404, { error: '저장된 관리자 콘텐츠가 아직 없습니다.' });
    return json(200, data);
  } catch (error) {
    return json(500, { error: '콘텐츠를 불러오지 못했습니다.', detail: error.message });
  }
};
