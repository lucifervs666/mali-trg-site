'use client';
import { useEffect } from 'react';
import Link from 'next/link';

export default function RootIndex() {
  useEffect(() => {
    window.location.replace('/me/');
  }, []);
  return (
    <main
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'var(--font-sans), system-ui, sans-serif',
      }}
    >
      <Link href="/me/">Mali Trg &rarr;</Link>
    </main>
  );
}
