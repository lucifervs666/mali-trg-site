import { cookies } from 'next/headers';
import { verifyToken, COOKIE } from '../../lib/auth';
import AdminLogin from './AdminLogin';
import AdminPanel from './AdminPanel';

export const dynamic = 'force-dynamic';

export const metadata = { title: 'Mali Trg — Admin', robots: { index: false, follow: false } };

export default function AdminPage() {
  const token = cookies().get(COOKIE)?.value;
  const authed = verifyToken(token);

  return (
    <div className="wrap">
      <h1 className="page-title">Admin — Menu prices</h1>
      {authed ? <AdminPanel /> : <AdminLogin />}
    </div>
  );
}
