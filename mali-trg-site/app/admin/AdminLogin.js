'use client';
import { useState } from 'react';

export default function AdminLogin() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setLoading(true);
    setError('');
    const res = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    });
    setLoading(false);
    if (res.ok) {
      window.location.reload();
    } else {
      setError('Incorrect password.');
    }
  }

  return (
    <form className="admin-login" onSubmit={submit}>
      <label className="admin-field">
        <span>Password</span>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoFocus
        />
      </label>
      {error ? <p className="admin-error">{error}</p> : null}
      <button className="btn primary" type="submit" disabled={loading}>
        {loading ? 'Checking…' : 'Log in'}
      </button>
    </form>
  );
}
