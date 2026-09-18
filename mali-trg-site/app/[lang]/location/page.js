import { dict } from '../../../lib/i18n';

export function generateStaticParams() {
  return [{ lang: 'me' }, { lang: 'en' }, { lang: 'it' }, { lang: 'ru' }];
}

export function generateMetadata({ params }) {
  const t = dict[params.lang] || dict.me;
  return { title: `Mali Trg — ${t.locationTitle}` };
}

export default function LocationPage({ params }) {
  const t = dict[params.lang] || dict.me;

  return (
    <div className="wrap">
      <h1 className="page-title">{t.locationTitle}</h1>
      <div className="location-photo">
        <img src="/api/photo/exterior.jpg" alt={t.locationTitle} loading="lazy" />
      </div>
      <p className="prose center-note">{t.centerNote}</p>
      <div className="infogrid">
        <div className="infobox">
          <h3>{t.addressLabel}</h3>
          <p>{t.address}</p>
          {t.addressNote ? <p className="note">{t.addressNote}</p> : null}
        </div>
        <div className="infobox">
          <h3>{t.hoursLabel}</h3>
          <p>{t.hours}</p>
        </div>
      </div>
      <div className="mapbox">
        <iframe
          title="Mali Trg map"
          loading="lazy"
          src="https://www.google.com/maps?q=Novaka+Milo%C5%A1eva+20%2C+Podgorica%2C+Montenegro&output=embed"
        />
      </div>
    </div>
  );
}
