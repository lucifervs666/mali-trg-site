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

// Always tries to persist and never throws. Returns where the menu actually
// ended up (`savedTo`) and, if the permanent Blob store failed, the real
// error message — so the admin UI can tell Aleksa exactly what's wrong
// instead of a bare "failed to save".
export async function saveMenu(menu) {
  const json = JSON.stringify(menu, null, 2);

  if (hasBlob) {
    try {
      const { put } = await import('@vercel/blob');
      await put(BLOB_PATHNAME, json, {
        access: 'public',
        contentType: 'application/json',
        addRandomSuffix: false,
        allowOverwrite: true,
      });
      return { savedTo: 'blob' };
    } catch (err) {
      try {
        fs.writeFileSync(LOCAL_PATH, json, 'utf8');
      } catch {
        // best effort only — we still report the original blob error below
      }
      return { savedTo: 'local-fallback', error: err && err.message ? err.message : String(err) };
    }
  }

  fs.writeFileSync(LOCAL_PATH, json, 'utf8');
  return { savedTo: 'local-fallback' };
}
