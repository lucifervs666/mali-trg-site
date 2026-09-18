import { dict } from '../../../lib/i18n';
import { applyPrices } from '../../../lib/menu-store';
import { getOverrides } from '../../../lib/blob-store';

export const dynamic = 'force-dynamic';
export const dynamicParams = true;

export function generateMetadata({ params }) {
  const t = dict[params.lang] || dict.me;
  return { title: `Mali Trg — ${t.nav.menu}` };
}

function label(n, lang) {
  return n[lang] || n.me;
}

export default async function MenuPage({ params }) {
  const lang = params.lang;
  const overrides = await getOverrides();
  const menu = applyPrices(overrides);

  return (
    <>
      <div className="navwrap menunav">
        <nav className="pills">
          {menu.map((cat) => (
            <a key={cat.id} href={`#${cat.id}`}>
              {label(cat.name, lang)}
            </a>
          ))}
        </nav>
      </div>
      <div className="wrap">
        {menu.map((cat) => (
          <section className="cat" id={cat.id} key={cat.id}>
            <div className="cathead">
              <span className="bar" />
              <h2>{label(cat.name, lang)}</h2>
            </div>
            {cat.groups
              ? cat.groups.map((g, gi) => (
                  <div key={gi}>
                    <div className="group-label">{label(g.label, lang)}</div>
                    <ul className="items">
                      {g.items.map((it, ii) => (
                        <li className="item" key={ii}>
                          <span className="name">{label(it.name, lang)}</span>
                          {it.size ? <span className="size">{it.size}</span> : null}
                          <span className="dots" />
                          <span className="price">{it.price}&euro;</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))
              : (
                <ul className="items">
                  {cat.items.map((it, ii) => (
                    <li className="item" key={ii}>
                      <span className="name">{label(it.name, lang)}</span>
                      {it.size ? <span className="size">{it.size}</span> : null}
                      <span className="dots" />
                      <span className="price">{it.price}&euro;</span>
                    </li>
                  ))}
                </ul>
              )}
          </section>
        ))}
      </div>
    </>
  );
}
