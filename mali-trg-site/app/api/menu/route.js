import { NextResponse } from 'next/server';
import { getMenu, saveMenu, storageMode } from '../../../lib/blob-store';
import { isAuthedRequest } from '../../../lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  const menu = await getMenu();
  return NextResponse.json({ menu, storageMode });
}

function cleanPrice(raw) {
  const value = String(raw).trim().replace(',', '.');
  return /^\d+(\.\d{1,2})?$/.test(value) ? value : null;
}

function sanitizeItems(items) {
  const out = [];
  for (const it of items) {
    if (!it || typeof it !== 'object') continue;
    const price = cleanPrice(it.price);
    if (price == null) continue;
    const rawName = it.name && typeof it.name === 'object' ? it.name : { me: String(it.name || '') };
    const label = String(rawName.me || rawName.en || '').trim();
    if (!label) continue;
    const name = {
      me: String(rawName.me || label),
      en: String(rawName.en || label),
      it: String(rawName.it || label),
      ru: String(rawName.ru || label),
    };
    const entry = { id: String(it.id || `item-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`), name, price };
    if (it.size) entry.size = String(it.size).slice(0, 20);
    out.push(entry);
  }
  return out;
}

function sanitizeMenu(input) {
  if (!Array.isArray(input)) return null;
  const out = [];
  const seenIds = new Set();
  for (const cat of input) {
    if (!cat || typeof cat !== 'object') continue;
    let id = String(cat.id || '').trim();
    if (!id || seenIds.has(id)) continue;
    seenIds.add(id);
    const rawName = cat.name && typeof cat.name === 'object' ? cat.name : { me: id };
    const label = String(rawName.me || rawName.en || id);
    const name = {
      me: String(rawName.me || label),
      en: String(rawName.en || label),
      it: String(rawName.it || label),
      ru: String(rawName.ru || label),
    };
    if (Array.isArray(cat.groups)) {
      const groups = cat.groups.map((g) => {
        const rawLabel = g && g.label && typeof g.label === 'object' ? g.label : { me: '' };
        return {
          label: {
            me: String(rawLabel.me || ''),
            en: String(rawLabel.en || rawLabel.me || ''),
            it: String(rawLabel.it || rawLabel.me || ''),
            ru: String(rawLabel.ru || rawLabel.me || ''),
          },
          items: Array.isArray(g && g.items) ? sanitizeItems(g.items) : [],
        };
      });
      out.push({ id, name, groups });
    } else {
      out.push({ id, name, items: Array.isArray(cat.items) ? sanitizeItems(cat.items) : [] });
    }
  }
  return out;
}

export async function PUT(request) {
  if (!isAuthedRequest(request)) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'invalid json' }, { status: 400 });
  }
  const clean = sanitizeMenu(body && body.menu);
  if (!clean) {
    return NextResponse.json({ error: 'invalid body' }, { status: 400 });
  }

  await saveMenu(clean);
  return NextResponse.json({ ok: true, storageMode });
}
