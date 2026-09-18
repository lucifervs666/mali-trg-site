import { PT_Serif, PT_Sans } from 'next/font/google';
import './globals.css';

const ptSerif = PT_Serif({
  subsets: ['latin', 'cyrillic'],
  weight: ['400', '700'],
  style: ['normal', 'italic'],
  variable: '--font-serif',
  display: 'swap',
});

const ptSans = PT_Sans({
  subsets: ['latin', 'cyrillic'],
  weight: ['400', '700'],
  variable: '--font-sans',
  display: 'swap',
});

export const metadata = {
  title: 'Mali Trg',
  description: 'Kafe bar u centru Podgorice.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="sr" className={`${ptSerif.variable} ${ptSans.variable}`}>
      <body>{children}</body>
    </html>
  );
}
