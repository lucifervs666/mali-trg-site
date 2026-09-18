import Link from 'next/link';
import Logo from '../../components/Logo';
import Ornament from '../../components/Ornament';
import Icon from '../../components/Icon';
import { dict } from '../../lib/i18n';

export function generateStaticParams() {
  return [{ lang: 'me' }, { lang: 'en' }, { lang: 'it' }, { lang: 'ru' }];
}

export function generateMetadata({ params }) {
  const t = dict[params.lang] || dict.me;
  return { title: `Mali Trg — ${t.tagline}` };
}

const ICONS = ['cup', 'glass', 'scoop'];

export default function Home({ params }) {
  const { lang } = params;
  const t = dict[lang] || dict.me;

  return (
    <>
      <section className="hero hero--photo">
        <div className="hero-bg">
          <img src="/api/photo/exterior.jpg" alt="" />
          <div className="hero-scrim" />
        </div>
        <div className="hero-content wrap">
          <Logo size="lg" kicker={t.kicker} onPhoto />
          <p className="tagline tagline--onphoto">{t.tagline}</p>
          <div className="ornament-row ornament-row--onphoto">
            <Ornament />
          </div>
          <p className="leadtext leadtext--onphoto">{t.lead}</p>
          <p className="motto motto--onphoto">{t.motto}</p>
          <div className="ctarow">
            <Link className="btn primary" href={`/${lang}/menu/`}>
              {t.ctaMenu}
            </Link>
            <Link className="btn ghost ghost--onphoto" href={`/${lang}/location/`}>
              {t.ctaLocation}
            </Link>
          </div>
        </div>
      </section>
      <div className="wrap">
        <section className="offers">
          {t.offers.map((o, i) => (
            <div className="offer" key={i}>
              <div className="offer-icon">
                <Icon name={ICONS[i] || 'cup'} />
              </div>
              <h3>{o.title}</h3>
              <p>{o.text}</p>
            </div>
          ))}
        </section>

        <section className="gallery">
          <div className="section-divider">
            <Ornament />
          </div>
          <h2 className="section-title gallery-title">{t.galleryTitle}</h2>
          <div className="gallery-grid">
            <img src="/api/photo/bar-1.jpg" alt={t.tagline} loading="lazy" />
            <img src="/api/photo/bar-3.jpg" alt={t.tagline} loading="lazy" />
            <img src="/api/photo/terrace.jpg" alt={t.tagline} loading="lazy" />
          </div>
        </section>
      </div>
    </>
  );
}
