import React from 'react';
import HorizontalBarChart from './HorizontalBarChart';

function SlideTemplate({ label, title, daily = {}, monthly = {}, reportDate }) {
  const dPlan = daily?.plan || 0;
  const dFact = daily?.fact || 0;
  const dDev = daily?.deviation ?? (dFact - dPlan);

  const mPlan = monthly?.plan || 0;
  const mFact = monthly?.fact || 0;
  const mDev = monthly?.deviation ?? (mFact - mPlan);

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
        marginBottom: '2vh',
        flexShrink: 0,
      }}>
        <span style={{
          fontSize: 'clamp(1.5rem, 2.5vw, 2.2rem)',
          fontWeight: 900,
          color: '#1E293B',
          minWidth: '110px',
          flexShrink: 0,
        }}>
          {label}
        </span>
        <span style={{
          flex: 1,
          fontSize: 'clamp(1.8rem, 3.2vw, 3rem)',
          fontWeight: 800,
          color: '#1A2B48',
          textAlign: 'center',
          lineHeight: 1.15,
        }}>
          {title}
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

        {/* Charts column */}
        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          gap: '2vh',
          minHeight: 0,
          overflow: 'hidden',
        }}>

          {/* ── Chart 1: Daily ── */}
          <div style={{
            flex: 1,
            background: 'rgba(255,255,255,0.45)',
            borderRadius: '12px',
            overflow: 'hidden',
            padding: '1.2vh 1.5vw 1vh 1vw',
            minHeight: 0,
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
            border: '1px solid rgba(255,255,255,0.6)',
          }}>
            <HorizontalBarChart
              title="Суточный отчет (тонн)"
              plan={dPlan}
              fact={dFact}
              dev={dDev}
            />
          </div>

          {/* ── Chart 2: Monthly ── */}
          <div style={{
            flex: 1,
            background: 'rgba(255,255,255,0.45)',
            borderRadius: '12px',
            overflow: 'hidden',
            padding: '1.2vh 1.5vw 1vh 1vw',
            minHeight: 0,
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
            border: '1px solid rgba(255,255,255,0.6)',
          }}>
            <HorizontalBarChart
              title="Месячный отчет (тонн)"
              plan={mPlan}
              fact={mFact}
              dev={mDev}
            />
          </div>
        </div>


        {/* ── Logo column ── */}
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
          {/* Round Emblem Badge */}
          <img
            src="/emblem_logo.png"
            alt="MUSTAHKAM KELAJAK - AKKERMANN CEMENT"
            style={{
              width: 'clamp(160px, 18vw, 260px)',
              height: 'clamp(160px, 18vw, 260px)',
              objectFit: 'contain',
              flexShrink: 0,
            }}
          />

          {/* Text Logo */}
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

export default SlideTemplate;
