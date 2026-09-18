import Link from 'next/link';
import Logo from '../../components/Logo';
import LangSwitcher from '../../components/LangSwitcher';
import { dict } from '../../lib/i18n';

export function generateStaticParams() {
  return [{ lang: 'me' }, { lang: 'en' }, { lang: 'it' }, { lang: 'ru' }];
}

export default function LangLayout({ children, params }) {
  const { lang } = params;
  const t = dict[lang] || dict.me;

  return (
    <>
      <header className="site">
        <div className="headrow">
          <Link href={`/${lang}/`}>
            <Logo size="sm" />
          </Link>
          <nav className="mainnav">
            <Link href={`/${lang}/`}>{t.nav.home}</Link>
            <Link href={`/${lang}/menu/`}>{t.nav.menu}</Link>
            <Link href={`/${lang}/about/`}>{t.nav.about}</Link>
            <Link href={`/${lang}/location/`}>{t.nav.location}</Link>
          </nav>
          <LangSwitcher current={lang} />
        </div>
      </header>
      <main>{children}</main>
      <footer className="site">
        <div className="wrap">
          <p>
            <span className="brasstext">Mali Trg</span> — {t.tagline}
          </p>
          <p>{t.footerNote}</p>
        </div>
      </footer>
    </>
  );
}
