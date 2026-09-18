// Maps friendly, stable names used in the site's code to the actual
// pathnames of the photos Aleksa uploaded into the project's private
// Vercel Blob store. Update this map any time a photo is replaced —
// the site code itself never needs to change.
const PHOTO_MAP = {
  'exterior.jpg': 'IMG_1308.jpeg',
  'bar-1.jpg': 'IMG_1309.jpeg',
  'bar-2.jpg': 'IMG_1310.jpeg',
  'bar-3.jpg': 'IMG_1311.jpeg',
  'terrace.jpg': 'IMG_1313.jpeg',
};

// The private Blob store's hostname (from the URLs Aleksa uploaded the
// photos to). Private blobs require an Authorization header, so they're
// fetched here server-side (where BLOB_READ_WRITE_TOKEN is available)
// and streamed back to the browser rather than linked directly.
const BLOB_HOST = 'kvchzxpausnbwmas.private.blob.vercel-storage.com';

export async function GET(request, { params }) {
  const { name } = params;
  const pathname = PHOTO_MAP[name];
  const token = process.env.BLOB_READ_WRITE_TOKEN;

  if (!pathname) {
    return new Response('Not found', { status: 404 });
  }
  if (!token) {
    return new Response('Photo storage not configured', { status: 503 });
  }

  try {
    const upstream = await fetch(`https://${BLOB_HOST}/${pathname}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!upstream.ok || !upstream.body) {
      return new Response('Not found', { status: 404 });
    }

    return new Response(upstream.body, {
      headers: {
        'Content-Type': upstream.headers.get('content-type') || 'image/jpeg',
        'Cache-Control': 'public, max-age=86400, s-maxage=604800, immutable',
      },
    });
  } catch (err) {
    return new Response('Photo unavailable', { status: 502 });
  }
}
