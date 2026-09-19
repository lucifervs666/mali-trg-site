'use client';
import { useEffect, useState } from 'react';

function sameName(v) {
return { me: v, en: v, it: v, ru: v };
}

function slug(s) {
return (
String(s)
.toLowerCase()
.normalize('NFKD')
.replace(/[\u0300-\u036f]/g, '')
.replace(/[^a-z0-9]+/g, '-')
.replace(/(^-|-$)/g, '') || 'cat'
);
}

function uniqueCatId(menu, name) {
const base = slug(name);
let id = base;
let n = 2;
while (menu.some((c) => c.id === id)) {
id = `${base}-${n}`;
n += 1;
}
return id;
}

function newItemId() {
return `item-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
}

// Key used in the newItem/newSubgroup draft state for a group's own "add
// item" row — keeps flat-category drafts (keyed just by catId) and
// group drafts (keyed by catId+groupIndex) from colliding.
function groupKey(catId, groupIdx) {
return `${catId}:${groupIdx}`;
}

export default function AdminPanel() {
const [menu, setMenu] = useState([]);
const [original, setOriginal] = useState('');
const [status, setStatus] = useState('');
const [storageMode, setStorageMode] = useState('');
const [loading, setLoading] = useState(true);
const [newCatName, setNewCatName] = useState('');
const [newCatHasGroups, setNewCatHasGroups] = useState(false);
const [newCatSubgroupName, setNewCatSubgroupName] = useState('');
const [newItem, setNewItem] = useState({});
const [newSubgroup, setNewSubgroup] = useState({});

useEffect(() => {
fetch('/api/menu', { cache: 'no-store' })
.then((r) => r.json())
.then((data) => {
setMenu(data.menu || []);
setOriginal(JSON.stringify(data.menu || []));
setStorageMode(data.storageMode || '');
setLoading(false);
});
}, []);

const dirty = JSON.stringify(menu) !== original;

async function save() {
setStatus('Saving…');
const res = await fetch('/api/menu', {
method: 'PUT',
headers: { 'Content-Type': 'application/json' },
body: JSON.stringify({ menu }),
});
let data = null;
try {
data = await res.json();
} catch {
// non-JSON error page — data stays null, we still show a status below
}
if (res.ok) {
setOriginal(JSON.stringify(menu));
if (data && data.savedTo === 'local-fallback') {
setStorageMode('local-fallback');
setStatus(
data.error
? `Saved for now, but permanent storage failed (${data.error}) — ask Claude to reconnect Vercel Blob storage.`
: "Saved — but only temporarily, permanent storage isn't connected yet."
);
} else {
setStatus('Saved ✓');
setTimeout(() => setStatus(''), 2500);
}
} else if (res.status === 401) {
setStatus('Session expired — please log in again.');
} else {
setStatus(data && data.message ? `Failed to save: ${data.message}` : 'Failed to save.');
}
}

async function logout() {
await fetch('/api/admin/logout', { method: 'POST' });
window.location.reload();
}

function updatePrice(catId, itemId, value, groupIdx) {
setMenu((m) =>
m.map((cat) => {
if (cat.id !== catId) return cat;
if (groupIdx != null) {
return {
...cat,
groups: cat.groups.map((g, gi) =>
gi !== groupIdx
? g
: { ...g, items: g.items.map((it) => (it.id === itemId ? { ...it, price: value } : it)) }
),
};
}
return { ...cat, items: cat.items.map((it) => (it.id === itemId ? { ...it, price: value } : it)) };
})
);
}

function removeItem(catId, itemId, groupIdx) {
setMenu((m) =>
m.map((cat) => {
if (cat.id !== catId) return cat;
if (groupIdx != null) {
return {
...cat,
groups: cat.groups.map((g, gi) =>
gi !== groupIdx ? g : { ...g, items: g.items.filter((it) => it.id !== itemId) }
),
};
}
return { ...cat, items: cat.items.filter((it) => it.id !== itemId) };
})
);
}

function removeCategory(catId) {
if (typeof window !== 'undefined' && !window.confirm('Delete this whole category and all its items?')) return;
setMenu((m) => m.filter((c) => c.id !== catId));
}

function removeGroup(catId, groupIdx) {
if (typeof window !== 'undefined' && !window.confirm('Delete this whole sub-group and all its items?')) return;
setMenu((m) =>
m.map((cat) => {
if (cat.id !== catId || !cat.groups) return cat;
const groups = cat.groups.filter((_, gi) => gi !== groupIdx);
// If that was the last sub-group, fall back to a plain (flat) category
// instead of leaving it with an empty groups array.
if (groups.length === 0) {
const { groups: _drop, ...rest } = cat;
return { ...rest, items: [] };
}
return { ...cat, groups };
})
);
}

function addItem(catId) {
const draft = newItem[catId] || {};
const name = (draft.name || '').trim();
const price = (draft.price || '').trim().replace(',', '.');
if (!name || !/^\d+(\.\d{1,2})?$/.test(price)) {
setStatus('Enter an item name and a valid price (e.g. 2.50) first.');
return;
}
setMenu((m) =>
m.map((cat) =>
cat.id !== catId
? cat
: {
...cat,
items: [
...(cat.items || []),
{
id: newItemId(),
name: sameName(name),
price,
...(draft.size && draft.size.trim() ? { size: draft.size.trim() } : {}),
},
],
}
)
);
setNewItem((s) => ({ ...s, [catId]: { name: '', size: '', price: '' } }));
setStatus('');
}

function addItemToGroup(catId, groupIdx) {
const key = groupKey(catId, groupIdx);
const draft = newItem[key] || {};
const name = (draft.name || '').trim();
const price = (draft.price || '').trim().replace(',', '.');
if (!name || !/^\d+(\.\d{1,2})?$/.test(price)) {
setStatus('Enter an item name and a valid price (e.g. 2.50) first.');
return;
}
setMenu((m) =>
m.map((cat) => {
if (cat.id !== catId || !cat.groups) return cat;
return {
...cat,
groups: cat.groups.map((g, gi) =>
gi !== groupIdx
? g
: {
...g,
items: [
...g.items,
{
id: newItemId(),
name: sameName(name),
price,
...(draft.size && draft.size.trim() ? { size: draft.size.trim() } : {}),
},
],
}
),
};
})
);
setNewItem((s) => ({ ...s, [key]: { name: '', size: '', price: '' } }));
setStatus('');
}

function addSubgroup(catId) {
const name = (newSubgroup[catId] || '').trim();
if (!name) return;
setMenu((m) =>
m.map((cat) => {
if (cat.id !== catId) return cat;
const existingGroups = cat.groups || [];
return { ...cat, groups: [...existingGroups, { label: sameName(name), items: [] }] };
})
);
setNewSubgroup((s) => ({ ...s, [catId]: '' }));
}

function addCategory() {
const name = newCatName.trim();
if (!name) return;
const id = uniqueCatId(menu, name);
if (newCatHasGroups) {
const subgroupName = newCatSubgroupName.trim() || 'Grupa 1';
setMenu((m) => [...m, { id, name: sameName(name), groups: [{ label: sameName(subgroupName), items: [] }] }]);
} else {
setMenu((m) => [...m, { id, name: sameName(name), items: [] }]);
}
setNewCatName('');
setNewCatSubgroupName('');
setNewCatHasGroups(false);
}

if (loading) return <p className="admin-loading">Loading menu…</p>;

return (
<div className="admin-panel">
<div className="admin-toolbar">
<button className="btn primary" onClick={save} disabled={!dirty}>
Save changes
</button>
<span className="admin-status">{status}</span>
<button className="btn ghost" onClick={logout} type="button">
Log out
</button>
</div>

{storageMode !== 'blob' ? (
<p className="admin-warning">
Permanent storage isn&apos;t fully connected yet — menu changes save for the current
server instance, but may reset the next time the site redeploys or after long
inactivity. Ask Claude to finish connecting Vercel Blob storage (Storage tab in the
Vercel dashboard) so edits persist for good.
</p>
) : null}

{menu.map((cat) => (
<div className="admin-cat" key={cat.id}>
<div className="admin-cat-head">
<h2>{cat.name.me}</h2>
<button
className="admin-remove"
type="button"
onClick={() => removeCategory(cat.id)}
title="Delete category"
>
Delete category
</button>
</div>

{cat.groups ? (
<>
{cat.groups.map((g, gi) => (
<div key={gi} className="admin-subgroup">
<div className="admin-group-head">
<h3 className="admin-group">{g.label.me}</h3>
<button
className="admin-remove"
type="button"
onClick={() => removeGroup(cat.id, gi)}
title="Delete sub-group"
>
Delete sub-group
</button>
</div>

{g.items.map((it) => (
<div className="admin-row" key={it.id}>
<span className="admin-name">
{it.name.me}
{it.size ? ` (${it.size})` : ''}
</span>
<div className="admin-price-wrap">
<input
className="admin-price"
value={it.price}
onChange={(e) => updatePrice(cat.id, it.id, e.target.value, gi)}
/>
<span>€</span>
</div>
<button
className="admin-remove"
type="button"
onClick={() => removeItem(cat.id, it.id, gi)}
title="Remove item"
>
×
</button>
</div>
))}

<div className="admin-row admin-add-row">
<input
className="admin-add-name"
placeholder="New item name"
value={newItem[groupKey(cat.id, gi)]?.name || ''}
onChange={(e) =>
setNewItem((s) => ({
...s,
[groupKey(cat.id, gi)]: { ...s[groupKey(cat.id, gi)], name: e.target.value },
}))
}
/>
<input
className="admin-add-size"
placeholder="Size (optional)"
value={newItem[groupKey(cat.id, gi)]?.size || ''}
onChange={(e) =>
setNewItem((s) => ({
...s,
[groupKey(cat.id, gi)]: { ...s[groupKey(cat.id, gi)], size: e.target.value },
}))
}
/>
<div className="admin-price-wrap">
<input
className="admin-price"
placeholder="0.00"
value={newItem[groupKey(cat.id, gi)]?.price || ''}
onChange={(e) =>
setNewItem((s) => ({
...s,
[groupKey(cat.id, gi)]: { ...s[groupKey(cat.id, gi)], price: e.target.value },
}))
}
/>
<span>€</span>
</div>
<button
className="btn ghost admin-add-btn"
type="button"
onClick={() => addItemToGroup(cat.id, gi)}
>
+ Add item
</button>
</div>
</div>
))}

<div className="admin-row admin-add-row admin-add-subgroup-row">
<input
className="admin-add-name"
placeholder="New sub-group name, e.g. Toplo/Hladno"
value={newSubgroup[cat.id] || ''}
onChange={(e) => setNewSubgroup((s) => ({ ...s, [cat.id]: e.target.value }))}
/>
<button className="btn ghost admin-add-btn" type="button" onClick={() => addSubgroup(cat.id)}>
+ Add sub-group
</button>
</div>
</>
) : (
<>
{cat.items.map((it) => (
<div className="admin-row" key={it.id}>
<span className="admin-name">
{it.name.me}
{it.size ? ` (${it.size})` : ''}
</span>
<div className="admin-price-wrap">
<input
className="admin-price"
value={it.price}
onChange={(e) => updatePrice(cat.id, it.id, e.target.value)}
/>
<span>€</span>
</div>
<button
className="admin-remove"
type="button"
onClick={() => removeItem(cat.id, it.id)}
title="Remove item"
>
×
</button>
</div>
))}

<div className="admin-row admin-add-row">
<input
className="admin-add-name"
placeholder="New item name"
value={newItem[cat.id]?.name || ''}
onChange={(e) =>
setNewItem((s) => ({ ...s, [cat.id]: { ...s[cat.id], name: e.target.value } }))
}
/>
<input
className="admin-add-size"
placeholder="Size (optional)"
value={newItem[cat.id]?.size || ''}
onChange={(e) =>
setNewItem((s) => ({ ...s, [cat.id]: { ...s[cat.id], size: e.target.value } }))
}
/>
<div className="admin-price-wrap">
<input
className="admin-price"
placeholder="0.00"
value={newItem[cat.id]?.price || ''}
onChange={(e) =>
setNewItem((s) => ({ ...s, [cat.id]: { ...s[cat.id], price: e.target.value } }))
}
/>
<span>€</span>
</div>
<button className="btn ghost admin-add-btn" type="button" onClick={() => addItem(cat.id)}>
+ Add item
</button>
</div>

<div className="admin-row admin-add-row admin-add-subgroup-row">
<input
className="admin-add-name"
placeholder="New sub-group name, e.g. Flaširana/Točena"
value={newSubgroup[cat.id] || ''}
onChange={(e) => setNewSubgroup((s) => ({ ...s, [cat.id]: e.target.value }))}
/>
<button className="btn ghost admin-add-btn" type="button" onClick={() => addSubgroup(cat.id)}>
+ Add sub-group
</button>
</div>
</>
)}
</div>
))}

<div className="admin-cat admin-add-cat">
<h2>Add a new category</h2>
<div className="admin-row admin-add-row">
<input
className="admin-add-name"
placeholder="e.g. Deserti, Hrana, Dodatna pića"
value={newCatName}
onChange={(e) => setNewCatName(e.target.value)}
/>
<button className="btn ghost admin-add-btn" type="button" onClick={addCategory}>
+ Add category
</button>
</div>
<label className="admin-checkbox-row">
<input
type="checkbox"
checked={newCatHasGroups}
onChange={(e) => setNewCatHasGroups(e.target.checked)}
/>
<span>Has sub-groups, like &quot;Piva&quot; (Flaširana / Točena)</span>
</label>
{newCatHasGroups ? (
<input
className="admin-add-name admin-new-subgroup-name"
placeholder="First sub-group name, e.g. Flaširana"
value={newCatSubgroupName}
onChange={(e) => setNewCatSubgroupName(e.target.value)}
/>
) : null}
<p className="admin-hint">
New categories, sub-groups, and items show the same name in all four languages until
translated — just ask Claude to translate specific new entries whenever you like.
</p>
</div>

<div className="admin-toolbar admin-toolbar-bottom">
<button className="btn primary" onClick={save} disabled={!dirty}>
Save changes
</button>
<span className="admin-status">{status}</span>
</div>
</div>
);
}
