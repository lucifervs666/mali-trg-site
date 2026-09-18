import { menu as baseMenu } from './menu-data';

function withIds(cat) {
  if (cat.groups) {
    return {
      id: cat.id,
      name: cat.name,
      groups: cat.groups.map((g, gi) => ({
        label: g.label,
        items: g.items.map((it, ii) => ({ ...it, id: `${cat.id}:${gi}:${ii}` })),
      })),
    };
  }
  return {
    id: cat.id,
    name: cat.name,
    items: cat.items.map((it, ii) => ({ ...it, id: `${cat.id}:${ii}` })),
  };
}

// The full, editable menu — seeded once from the hardcoded starter data in
// menu-data.js, then persisted (and from then on owned) by the admin panel.
export function seedMenu() {
  return baseMenu.map(withIds);
}
