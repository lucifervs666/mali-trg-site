import fs from 'fs';

const BLOB_PATHNAME = 'mali-trg/menu-overrides.json';
const LOCAL_PATH = '/tmp/mali-trg-menu-overrides.json';

const hasBlob = !!process.env.BLOB_READ_WRITE_TOKEN;

export const storageMode = hasBlob ? 'blob' : 'local-fallback';

export async function getOverrides() {
  if (hasBlob) {
    try {
      const { head } = await import('@vercel/blob');
      const info = await head(BLOB_PATHNAME).catch(() => null);
      if (!info) return {};
      const res = await fetch(info.url, { cache: 'no-store' });
      if (!res.ok) return {};
      return await res.json();
    } catch {
      return {};
    }
  }
  try {
    return JSON.parse(fs.readFileSync(LOCAL_PATH, 'utf8'));
  } catch {
    return {};
  }
}

export async function saveOverrides(overrides) {
  const json = JSON.stringify(overrides, null, 2);
  if (hasBlob) {
    const { put } = await import('@vercel/blob');
    await put(BLOB_PATHNAME, json, {
      access: 'public',
      contentType: 'application/json',
      addRandomSuffix: false,
      allowOverwrite: true,
    });
    return;
  }
  fs.writeFileSync(LOCAL_PATH, json, 'utf8');
}
