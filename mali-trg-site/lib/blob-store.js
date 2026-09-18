import fs from 'fs';
import { seedMenu } from './menu-store';

const BLOB_PATHNAME = 'mali-trg/menu-full.json';
const LOCAL_PATH = '/tmp/mali-trg-menu-full.json';

const hasBlob = !!process.env.BLOB_READ_WRITE_TOKEN;

export const storageMode = hasBlob ? 'blob' : 'local-fallback';

export async function getMenu() {
  if (hasBlob) {
    try {
      const { head } = await import('@vercel/blob');
      const info = await head(BLOB_PATHNAME).catch(() => null);
      if (!info) return seedMenu();
      const res = await fetch(info.url, { cache: 'no-store' });
      if (!res.ok) return seedMenu();
      const data = await res.json();
      return Array.isArray(data) && data.length ? data : seedMenu();
    } catch {
      return seedMenu();
    }
  }
  try {
    const data = JSON.parse(fs.readFileSync(LOCAL_PATH, 'utf8'));
    return Array.isArray(data) && data.length ? data : seedMenu();
  } catch {
    return seedMenu();
  }
}

export async function saveMenu(menu) {
  const json = JSON.stringify(menu, null, 2);
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
