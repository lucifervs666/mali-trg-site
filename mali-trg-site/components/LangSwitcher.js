'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LANGS } from '../lib/i18n';

const LABELS = { me: 'CG', en: 'EN', it: 'IT', ru: 'RU' };

export default function LangSwitcher({ current }) {
  const pathname = usePathname() || '/';
  const parts = pathname.split('/').filter(Boolean);
  const rest = parts.slice(1).join('/');

  return (
    <div className="langswitch">
      {LANGS.map((code) => {
        const href = `/${code}/${rest}`;
        return (
          <Link key={code} href={href} className={code === current ? 'active' : ''}>
            {LABELS[code]}
          </Link>
        );
      })}
    </div>
  );
}
