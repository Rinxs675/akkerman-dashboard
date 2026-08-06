import React from 'react';

export default function SlideSafety({ data, reportDate }) {
  const safety = data?.safety || { microTraumas: 2, incidents: 7, accidents: 0 };

  return (
    <div style={{
      width: '100%',
      height: '100%',
      background: 'linear-gradient(135deg, #DCE2EC 0%, #E2E8F0 50%, #D1D8E6 100%)',
      display: 'flex',
      flexDirection: 'column',
      fontFamily: "'Inter', 'Segoe UI', sans-serif",
      padding: '3vh 4vw 3vh 4vw',
      boxSizing: 'border-box',
      overflow: 'hidden',
    }}>
      {/* ── Header ── */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        marginBottom: '3vh',
        flexShrink: 0,
      }}>
        <span style={{
          fontSize: 'clamp(1.5rem, 2.5vw, 2.2rem)',
          fontWeight: 900,
          color: '#1E293B',
          minWidth: '110px',
          flexShrink: 0,
        }}>
          ОТ и ПБ
        </span>
        <span style={{
          flex: 1,
          fontSize: 'clamp(1.8rem, 3.2vw, 3rem)',
          fontWeight: 800,
          color: '#1A2B48',
          textAlign: 'center',
          lineHeight: 1.15,
        }}>
          СТАТИСТИКА ПРОИСШЕСТВИЙ
        </span>
        <span style={{
          fontSize: 'clamp(1.1rem, 1.6vw, 1.5rem)',
          fontWeight: 600,
          color: '#475569',
          minWidth: '220px',
          textAlign: 'right',
          flexShrink: 0,
        }}>
          {reportDate}
        </span>
      </div>

      {/* ── Body ── */}
      <div style={{
        flex: 1,
        display: 'flex',
        gap: '3vw',
        minHeight: 0,
        overflow: 'hidden',
      }}>
        {/* Safety Cards Grid */}
        <div style={{
          flex: 1,
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '2vw',
          alignItems: 'center',
        }}>
          {/* Card 1 */}
          <div style={{
            background: 'rgba(255,255,255,0.65)',
            borderRadius: '16px',
            padding: '4vh 2vw',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 8px 24px rgba(0,0,0,0.06)',
            border: '1px solid rgba(255,255,255,0.8)',
            textAlign: 'center',
          }}>
            <h2 style={{ fontSize: 'clamp(1.1rem, 1.6vw, 1.6rem)', fontWeight: 800, color: '#1E293B', marginBottom: '2vh' }}>
              МИКРОТРАВМЫ
            </h2>
            <div style={{ fontSize: 'clamp(4rem, 7vw, 7rem)', fontWeight: 900, color: '#F59E0B', lineHeight: 1 }}>
              {safety.microTraumas}
            </div>
          </div>

          {/* Card 2 */}
          <div style={{
            background: 'rgba(255,255,255,0.65)',
            borderRadius: '16px',
            padding: '4vh 2vw',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 8px 24px rgba(0,0,0,0.06)',
            border: '1px solid rgba(255,255,255,0.8)',
            textAlign: 'center',
          }}>
            <h2 style={{ fontSize: 'clamp(1.1rem, 1.6vw, 1.6rem)', fontWeight: 800, color: '#1E293B', marginBottom: '2vh' }}>
              ДТП, ПРОИСШЕСТВИЯ, ИНЦИДЕНТЫ
            </h2>
            <div style={{ fontSize: 'clamp(4rem, 7vw, 7rem)', fontWeight: 900, color: '#06B6D4', lineHeight: 1 }}>
              {safety.incidents}
            </div>
          </div>

          {/* Card 3 */}
          <div style={{
            background: 'rgba(255,255,255,0.65)',
            borderRadius: '16px',
            padding: '4vh 2vw',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 8px 24px rgba(0,0,0,0.06)',
            border: '1px solid rgba(255,255,255,0.8)',
            textAlign: 'center',
          }}>
            <h2 style={{ fontSize: 'clamp(1.1rem, 1.6vw, 1.6rem)', fontWeight: 800, color: '#1E293B', marginBottom: '2vh' }}>
              НЕСЧАСТНЫЕ СЛУЧАИ
            </h2>
            <div style={{ fontSize: 'clamp(4rem, 7vw, 7rem)', fontWeight: 900, color: safety.accidents > 0 ? '#EF4444' : '#10B981', lineHeight: 1 }}>
              {safety.accidents}
            </div>
          </div>
        </div>

        {/* Logo column */}
        <div style={{
          width: 'clamp(200px, 22vw, 320px)',
          flexShrink: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '3vh',
          overflow: 'hidden',
        }}>
          <img
            src="/emblem_logo.png"
            alt="Emblem"
            style={{
              width: 'clamp(160px, 18vw, 260px)',
              height: 'clamp(160px, 18vw, 260px)',
              objectFit: 'contain',
              flexShrink: 0,
            }}
          />
          <img
            src="/akkermann_logo.png"
            alt="AKKERMANN"
            style={{
              width: 'clamp(180px, 20vw, 280px)',
              height: 'auto',
              maxHeight: '8vh',
              objectFit: 'contain',
              flexShrink: 0,
            }}
          />
        </div>
      </div>
    </div>
  );
}

