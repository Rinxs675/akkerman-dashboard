import React from 'react';
import { formatNumber } from '../utils/excelParser';

export default function HorizontalBarChart({ title, plan, fact, dev }) {
  // Determine upper scaling bound. Add 25% padding (multiply by 1.25) 
  // so the max bar is 80% wide, leaving 20% room for the text label to prevent overflow.
  const rawMax = Math.max(plan, fact, 100);
  const maxVal = rawMax * 1.25;
  
  // Calculate width percentage relative to maxVal
  const getWidthPct = (val) => {
    if (val <= 0) return 0;
    return Math.min((val / maxVal) * 100, 100);
  };

  const isNegative = dev < 0;

  return (
    <div style={{
      width: '100%',
      height: '100%',
      display: 'grid',
      gridTemplateColumns: 'max-content 1fr',
      gridTemplateRows: 'auto repeat(3, 1fr)',
      columnGap: '16px',
      padding: '0.5vh 0.5vw 1vh 0.5vw',
      boxSizing: 'border-box',
    }}>
      {/* Chart Section Header */}
      <div style={{
        gridColumn: '2 / 3',
        fontSize: 'clamp(0.85rem, 1.1vw, 1.15rem)',
        fontWeight: 800,
        color: '#1E293B',
        marginBottom: '0.8vh',
        display: 'flex',
        alignItems: 'flex-end',
      }}>
        {title}
      </div>

      {/* ── Row 1: План ── */}
      <div style={{
        textAlign: 'right',
        fontSize: 'clamp(0.85rem, 1.1vw, 1.1rem)',
        fontWeight: 700,
        color: '#1E293B',
        whiteSpace: 'nowrap',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-end',
      }}>
        План
      </div>

      <div style={{ position: 'relative', height: '100%', display: 'flex', alignItems: 'center' }}>
        {/* Zero vertical guide line */}
        <div style={{ position: 'absolute', left: 0, top: '5%', bottom: '5%', width: '2px', background: '#64748B', zIndex: 2 }} />

        {/* Green bar */}
        <div style={{
          position: 'absolute',
          left: 0,
          top: '15%',
          bottom: '15%',
          width: `${getWidthPct(plan)}%`,
          background: '#5D9E53',
          borderRadius: '2px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minWidth: '50px',
        }}>
          <span style={{
            color: '#FFFFFF',
            fontWeight: 800,
            fontSize: 'clamp(0.95rem, 1.3vw, 1.35rem)',
            textShadow: '0 1px 2px rgba(0,0,0,0.3)',
          }}>
            {formatNumber(plan)}
          </span>
        </div>
      </div>

      {/* ── Row 2: Факт ── */}
      <div style={{
        textAlign: 'right',
        fontSize: 'clamp(0.85rem, 1.1vw, 1.1rem)',
        fontWeight: 700,
        color: '#1E293B',
        whiteSpace: 'nowrap',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-end',
      }}>
        Факт
      </div>

      <div style={{ position: 'relative', height: '100%', display: 'flex', alignItems: 'center' }}>
        {/* Zero vertical guide line */}
        <div style={{ position: 'absolute', left: 0, top: '5%', bottom: '5%', width: '2px', background: '#64748B', zIndex: 2 }} />

        {/* Dark Navy Blue bar */}
        <div style={{
          position: 'absolute',
          left: 0,
          top: '15%',
          bottom: '15%',
          width: `${getWidthPct(fact)}%`,
          background: '#1F3663',
          borderRadius: '2px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minWidth: '50px',
        }}>
          <span style={{
            color: '#FFFFFF',
            fontWeight: 800,
            fontSize: 'clamp(0.95rem, 1.3vw, 1.35rem)',
            textShadow: '0 1px 2px rgba(0,0,0,0.3)',
          }}>
            {formatNumber(fact)}
          </span>
        </div>
      </div>

      {/* ── Row 3: Отклонение ── */}
      <div style={{
        textAlign: 'right',
        fontSize: 'clamp(0.85rem, 1.1vw, 1.1rem)',
        fontWeight: 700,
        color: '#1E293B',
        whiteSpace: 'nowrap',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-end',
      }}>
        Отклонение
      </div>

      <div style={{ position: 'relative', height: '100%', display: 'flex', alignItems: 'center' }}>
        {/* Zero vertical guide line */}
        <div style={{ position: 'absolute', left: 0, top: '5%', bottom: '5%', width: '2px', background: '#64748B', zIndex: 2 }} />

        {/* Deviation bar */}
        <div style={{
          position: 'absolute',
          left: 0,
          top: '15%',
          bottom: '15%',
          width: `${Math.max(getWidthPct(Math.abs(dev)), 0.5)}%`,
          background: isNegative ? '#DC2626' : '#5D9E53',
          borderRadius: '2px',
          minWidth: '8px',
        }} />

        {/* Deviation text */}
        <div style={{
          position: 'absolute',
          left: `calc(${Math.max(getWidthPct(Math.abs(dev)), 0.5)}% + 8px)`,
          top: '15%',
          bottom: '15%',
          display: 'flex',
          alignItems: 'center',
        }}>
          <span style={{
            color: isNegative ? '#DC2626' : '#15803D',
            fontWeight: 800,
            fontSize: 'clamp(0.95rem, 1.3vw, 1.35rem)',
            whiteSpace: 'nowrap',
          }}>
            {isNegative ? '' : '+'}{formatNumber(dev)}
          </span>
        </div>
      </div>
    </div>
  );
}

