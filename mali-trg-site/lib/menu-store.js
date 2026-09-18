import { menu as baseMenu } from './menu-data';

export function itemId(catId, idx, groupIdx) {
  return groupIdx != null ? `${catId}:${groupIdx}:${idx}` : `${catId}:${idx}`;
}

export function flattenPrices(menuData = baseMenu) {
  const prices = {};
  menuData.forEach((cat) => {
    if (cat.groups) {
      cat.groups.forEach((g, gi) => {
        g.items.forEach((it, ii) => {
          prices[itemId(cat.id, ii, gi)] = it.price;
        });
      });
    } else {
      cat.items.forEach((it, ii) => {
        prices[itemId(cat.id, ii)] = it.price;
      });
    }
  });
  return prices;
}

export function applyPrices(overrides = {}) {
  return baseMenu.map((cat) => {
    if (cat.groups) {
      return {
        ...cat,
        groups: cat.groups.map((g, gi) => ({
          ...g,
          items: g.items.map((it, ii) => {
            const id = itemId(cat.id, ii, gi);
            return overrides[id] != null ? { ...it, price: overrides[id] } : it;
          }),
        })),
      };
    }
    return {
      ...cat,
      items: cat.items.map((it, ii) => {
        const id = itemId(cat.id, ii);
        return overrides[id] != null ? { ...it, price: overrides[id] } : it;
      }),
    };
  });
}
