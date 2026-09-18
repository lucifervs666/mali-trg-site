'use client';
import { useEffect, useState } from 'react';
import { menu as baseMenu } from '../../lib/menu-data';

function idFor(catId, ii, gi) {
  return gi != null ? `${catId}:${gi}:${ii}` : `${catId}:${ii}`;
}

export default function AdminPanel() {
  const [overrides, setOverrides] = useState({});
  const [dirty, setDirty] = useState({});
  const [status, setStatus] = useState('');
  const [storageMode, setStorageMode] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/menu', { cache: 'no-store' })
      .then((r) => r.json())
      .then((data) => {
        setOverrides(data.overrides || {});
        setStorageMode(data.storageMode || '');
        setLoading(false);
      });
  }, []);

  function currentPrice(id, fallback) {
    if (id in dirty) return dirty[id];
    if (id in overrides) return overrides[id];
    return fallback;
  }

  function change(id, value) {
    setDirty((d) => ({ ...d, [id]: value }));
  }

  async function save() {
    setStatus('Saving…');
    const merged = { ...overrides, ...dirty };
    const res = await fetch('/api/menu', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ overrides: merged }),
    });
    if (res.ok) {
      setOverrides(merged);
      setDirty({});
      setStatus('Saved ✓');
      setTimeout(() => setStatus(''), 2500);
    } else if (res.status === 401) {
      setStatus('Session expired — please log in again.');
    } else {
      setStatus('Failed to save.');
    }
  }

  async function logout() {
    await fetch('/api/admin/logout', { method: 'POST' });
    window.location.reload();
  }

  if (loading) return <p className="admin-loading">Loading menu…</p>;

  const dirtyCount = Object.keys(dirty).length;

  return (
    <div className="admin-panel">
      <div className="admin-toolbar">
        <button className="btn primary" onClick={save} disabled={dirtyCount === 0}>
          Save changes{dirtyCount ? ` (${dirtyCount})` : ''}
        </button>
        <span className="admin-status">{status}</span>
        <button className="btn ghost" onClick={logout} type="button">
          Log out
        </button>
      </div>

      {storageMode !== 'blob' ? (
        <p className="admin-warning">
          Permanent storage isn&apos;t fully connected yet — price changes save for the current
          server instance, but may reset the next time the site redeploys or after long
          inactivity. Ask Claude to finish connecting Vercel Blob storage (Storage tab in the
          Vercel dashboard) so edits persist for good.
        </p>
      ) : null}

      {baseMenu.map((cat) => (
        <div className="admin-cat" key={cat.id}>
          <h2>{cat.name.me}</h2>
          {cat.groups
            ? cat.groups.map((g, gi) => (
                <div key={gi}>
                  <h3 className="admin-group">{g.label.me}</h3>
                  {g.items.map((it, ii) => {
                    const id = idFor(cat.id, ii, gi);
                    return (
                      <div className="admin-row" key={id}>
                        <span className="admin-name">
                          {it.name.me}
                          {it.size ? ` (${it.size})` : ''}
                        </span>
                        <div className="admin-price-wrap">
                          <input
                            className="admin-price"
                            value={currentPrice(id, it.price)}
                            onChange={(e) => change(id, e.target.value)}
                          />
                          <span>€</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))
            : cat.items.map((it, ii) => {
                const id = idFor(cat.id, ii);
                return (
                  <div className="admin-row" key={id}>
                    <span className="admin-name">
                      {it.name.me}
                      {it.size ? ` (${it.size})` : ''}
                    </span>
                    <div className="admin-price-wrap">
                      <input
                        className="admin-price"
                        value={currentPrice(id, it.price)}
                        onChange={(e) => change(id, e.target.value)}
                      />
                      <span>€</span>
                    </div>
                  </div>
                );
              })}
        </div>
      ))}

      <div className="admin-toolbar admin-toolbar-bottom">
        <button className="btn primary" onClick={save} disabled={dirtyCount === 0}>
          Save changes{dirtyCount ? ` (${dirtyCount})` : ''}
        </button>
        <span className="admin-status">{status}</span>
      </div>
    </div>
  );
}
