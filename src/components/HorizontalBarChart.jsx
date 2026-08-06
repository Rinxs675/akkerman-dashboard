import React from 'react';
import { formatNumber } from '../utils/excelParser';

export default function HorizontalBarChart({ title, plan, fact, dev }) {
  // Determine upper scaling bound (e.g. max of plan and fact)
  const maxVal = Math.max(plan, fact, 100);
  
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
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      padding: '0.5vh 0.5vw',
      boxSizing: 'border-box',
    }}>
      {/* Chart Section Header */}
      <div style={{
        fontSize: 'clamp(0.85rem, 1.1vw, 1.15rem)',
        fontWeight: 800,
        color: '#1E293B',
        marginLeft: '154px',
        marginBottom: '0.5vh',
      }}>
        {title}
      </div>

      {/* Main Chart Grid Body */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-evenly',
        position: 'relative',
      }}>

        {/* ── Row 1: План ── */}
        <div style={{ display: 'flex', alignItems: 'center', height: '32%', width: '100%' }}>
          <div style={{
            width: '140px',
            textAlign: 'right',
            paddingRight: '14px',
            fontSize: 'clamp(0.85rem, 1.1vw, 1.1rem)',
            fontWeight: 700,
            color: '#1E293B',
            flexShrink: 0,
            whiteSpace: 'nowrap',
          }}>
            План
          </div>

          <div style={{ flex: 1, height: '100%', position: 'relative', display: 'flex', alignItems: 'center' }}>
            {/* Zero vertical guide line */}
            <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '2px', background: '#64748B', zIndex: 2 }} />

            {/* Green bar */}
            <div style={{
              position: 'absolute',
              left: 0,
              top: '10%',
              bottom: '10%',
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
        </div>

        {/* ── Row 2: Факт ── */}
        <div style={{ display: 'flex', alignItems: 'center', height: '32%', width: '100%' }}>
          <div style={{
            width: '140px',
            textAlign: 'right',
            paddingRight: '14px',
            fontSize: 'clamp(0.85rem, 1.1vw, 1.1rem)',
            fontWeight: 700,
            color: '#1E293B',
            flexShrink: 0,
            whiteSpace: 'nowrap',
          }}>
            Факт
          </div>

          <div style={{ flex: 1, height: '100%', position: 'relative', display: 'flex', alignItems: 'center' }}>
            {/* Zero vertical guide line */}
            <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '2px', background: '#64748B', zIndex: 2 }} />

            {/* Dark Navy Blue bar */}
            <div style={{
              position: 'absolute',
              left: 0,
              top: '10%',
              bottom: '10%',
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
        </div>

        {/* ── Row 3: Отклонение ── */}
        <div style={{ display: 'flex', alignItems: 'center', height: '32%', width: '100%' }}>
          <div style={{
            width: '140px',
            textAlign: 'right',
            paddingRight: '14px',
            fontSize: 'clamp(0.85rem, 1.1vw, 1.1rem)',
            fontWeight: 700,
            color: '#1E293B',
            flexShrink: 0,
            whiteSpace: 'nowrap',
          }}>
            Отклонение
          </div>

          <div style={{ flex: 1, height: '100%', position: 'relative', display: 'flex', alignItems: 'center' }}>
            {/* Zero vertical guide line */}
            <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '2px', background: '#64748B', zIndex: 2 }} />

            <div style={{
              position: 'absolute',
              left: 0,
              top: '10%',
              bottom: '10%',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}>
              <div style={{
                width: `${Math.max(getWidthPct(Math.abs(dev)), 0.5)}%`,
                height: '100%',
                background: isNegative ? '#DC2626' : '#5D9E53',
                borderRadius: '2px',
                minWidth: '8px',
              }} />
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


      </div>
    </div>
  );
}
