import { getStore } from '@netlify/blobs';

export default async (request) => {
  const id = new URL(request.url).searchParams.get('id');
  if (!id) return new Response('Not found', { status: 404 });
  const store = getStore('smbiz-media');
  const entry = await store.getWithMetadata(id, { type: 'arrayBuffer' });
  if (!entry) return new Response('Not found', { status: 404 });
  return new Response(entry.data, {
    status: 200,
    headers: {
      'content-type': entry.metadata?.contentType || 'application/octet-stream',
      'cache-control': 'public, max-age=31536000, immutable'
    }
  });
};
