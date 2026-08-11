import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Presentation, ShieldAlert } from 'lucide-react';

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div style={{
      height: '100vh',
      width: '100vw',
      background: 'radial-gradient(circle at center, #0F172A 0%, #020617 100%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#fff',
      padding: '20px',
      boxSizing: 'border-box'
    }}>
      
      <div style={{ marginBottom: '60px', textAlign: 'center' }}>
        <h1 style={{ 
          fontSize: '3.5rem', 
          fontWeight: 900, 
          margin: '0 0 16px 0',
          background: 'linear-gradient(to right, #38BDF8, #10B981)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          filter: 'drop-shadow(0 4px 20px rgba(16, 185, 129, 0.2))'
        }}>
          AKKERMANN
        </h1>
        <p style={{ fontSize: '1.2rem', color: '#94A3B8', margin: 0, fontWeight: 500 }}>
          Информационный Дашборд Производства
        </p>
      </div>

      <div style={{ 
        display: 'flex', 
        gap: '24px', 
        flexDirection: window.innerWidth < 600 ? 'column' : 'row',
        width: '100%',
        maxWidth: '800px'
      }}>
        {/* Public Slide Viewer Button */}
        <button
          onClick={() => navigate('/slides')}
          style={{
            flex: 1,
            background: 'rgba(30, 41, 59, 0.6)',
            border: '1px solid rgba(56, 189, 248, 0.3)',
            borderRadius: '16px',
            padding: '40px 20px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '16px',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            color: '#F8FAFC',
            boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = 'rgba(56, 189, 248, 0.15)';
            e.currentTarget.style.transform = 'translateY(-5px)';
            e.currentTarget.style.boxShadow = '0 20px 40px rgba(56, 189, 248, 0.2)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = 'rgba(30, 41, 59, 0.6)';
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 10px 30px rgba(0,0,0,0.3)';
          }}
        >
          <div style={{ background: 'rgba(56, 189, 248, 0.2)', padding: '20px', borderRadius: '50%' }}>
            <Presentation size={48} color="#38BDF8" />
          </div>
          <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700 }}>Просмотр Слайдов</h2>
          <p style={{ margin: 0, color: '#94A3B8', fontSize: '0.95rem', textAlign: 'center' }}>
            Запуск дашборда для телевизоров и информационных экранов в цехах.
          </p>
        </button>

        {/* Admin Panel Button */}
        <button
          onClick={() => navigate('/login')}
          style={{
            flex: 1,
            background: 'rgba(30, 41, 59, 0.6)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            borderRadius: '16px',
            padding: '40px 20px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '16px',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            color: '#F8FAFC',
            boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = 'rgba(16, 185, 129, 0.15)';
            e.currentTarget.style.transform = 'translateY(-5px)';
            e.currentTarget.style.boxShadow = '0 20px 40px rgba(16, 185, 129, 0.2)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = 'rgba(30, 41, 59, 0.6)';
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 10px 30px rgba(0,0,0,0.3)';
          }}
        >
          <div style={{ background: 'rgba(16, 185, 129, 0.2)', padding: '20px', borderRadius: '50%' }}>
            <ShieldAlert size={48} color="#10B981" />
          </div>
          <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700 }}>Панель Администратора</h2>
          <p style={{ margin: 0, color: '#94A3B8', fontSize: '0.95rem', textAlign: 'center' }}>
            Управление данными, новостями и происшествиями (требуется пароль).
          </p>
        </button>
      </div>

    </div>
  );
}
