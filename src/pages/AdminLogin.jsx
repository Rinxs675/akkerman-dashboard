import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock } from 'lucide-react';

export default function AdminLogin() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      });
      const data = await res.json();

      if (res.ok && data.token) {
        localStorage.setItem('adminToken', data.token);
        navigate('/admin');
      } else {
        setError(data.error || 'Ошибка авторизации');
      }
    } catch (err) {
      setError('Ошибка сети');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#030712' }}>
      <form onSubmit={handleLogin} style={{ background: 'rgba(30, 41, 59, 0.8)', padding: '40px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', width: '100%', maxWidth: '400px' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '24px' }}>
          <div style={{ background: 'rgba(16, 185, 129, 0.2)', padding: '16px', borderRadius: '50%' }}>
            <Lock size={32} color="#10B981" />
          </div>
        </div>
        <h2 style={{ color: '#fff', textAlign: 'center', marginBottom: '8px', fontSize: '1.5rem', fontWeight: 700 }}>Панель управления</h2>
        <p style={{ color: '#94A3B8', textAlign: 'center', marginBottom: '24px', fontSize: '0.9rem' }}>Введите пароль администратора</p>

        {error && (
          <div style={{ background: 'rgba(239, 68, 68, 0.2)', color: '#FCA5A5', padding: '12px', borderRadius: '6px', marginBottom: '16px', fontSize: '0.9rem', textAlign: 'center', border: '1px solid rgba(239,68,68,0.3)' }}>
            {error}
          </div>
        )}

        <input
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          placeholder="Пароль"
          style={{ width: '100%', padding: '12px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.1)', background: '#0F172A', color: '#fff', marginBottom: '24px', boxSizing: 'border-box' }}
        />

        <button
          type="submit"
          disabled={loading}
          style={{ width: '100%', padding: '12px', background: '#10B981', color: '#fff', fontWeight: 600, borderRadius: '6px', border: 'none', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1 }}
        >
          {loading ? 'Вход...' : 'Войти'}
        </button>
      </form>
    </div>
  );
}
