import { NextResponse } from 'next/server';
import { getOverrides, saveOverrides, storageMode } from '../../../lib/blob-store';
import { applyPrices } from '../../../lib/menu-store';
import { isAuthedRequest } from '../../../lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  const overrides = await getOverrides();
  return NextResponse.json({ menu: applyPrices(overrides), overrides, storageMode });
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
  if (!body || typeof body.overrides !== 'object' || body.overrides === null) {
    return NextResponse.json({ error: 'invalid body' }, { status: 400 });
  }

  const clean = {};
  for (const [id, rawValue] of Object.entries(body.overrides)) {
    const value = String(rawValue).trim().replace(',', '.');
    if (!/^\d+(\.\d{1,2})?$/.test(value)) continue;
    clean[id] = value;
  }

  await saveOverrides(clean);
  return NextResponse.json({ ok: true, storageMode });
}
