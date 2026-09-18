import { dict } from '../../../lib/i18n';
import Ornament from '../../../components/Ornament';

export function generateStaticParams() {
  return [{ lang: 'me' }, { lang: 'en' }, { lang: 'it' }, { lang: 'ru' }];
}

export function generateMetadata({ params }) {
  const t = dict[params.lang] || dict.me;
  return { title: `Mali Trg — ${t.aboutTitle}` };
}

export default function AboutPage({ params }) {
  const t = dict[params.lang] || dict.me;

  return (
    <div className="wrap">
      <h1 className="page-title">{t.aboutTitle}</h1>
      <div className="about-grid">
        <div className="about-text">
          {t.aboutBody.map((p, i) => (
            <p className="prose" key={i}>
              {p}
            </p>
          ))}
          <div className="chips">
            {t.chips.map((c, i) => (
              <span className="chip" key={i}>
                {c}
              </span>
            ))}
          </div>
        </div>
        <div className="about-photo">
          <img src="/api/photo/bar-2.jpg" alt={t.aboutTitle} loading="lazy" />
        </div>
      </div>

      <div className="section-divider">
        <Ornament />
      </div>

      <h2 className="section-title">{t.podgoricaTitle}</h2>
      {t.podgoricaBody.map((p, i) => (
        <p className="prose" key={i}>
          {p}
        </p>
      ))}
      <div className="chips facts">
        {t.cityFacts.map((c, i) => (
          <span className="chip fact" key={i}>
            {c}
          </span>
        ))}
      </div>

      <div className="photo-strip">
        <img src="/api/photo/terrace.jpg" alt={t.podgoricaTitle} loading="lazy" />
        <img src="/api/photo/exterior.jpg" alt={t.podgoricaTitle} loading="lazy" />
      </div>
    </div>
  );
}
