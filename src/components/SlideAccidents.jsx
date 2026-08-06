import React from 'react';

export default function SlideAccidents({ data, incidents = [], reportDate }) {
  // Extract or calculate stats counts
  const safetyStats = data?.safety || { microTraumas: 5, incidents: 8, accidents: 12 };

  // Filter incidents for each category
  const microIncidents = incidents.filter(i => (i.category || '').toLowerCase().includes('микро'));
  const accidentIncidents = incidents.filter(i => {
    const c = (i.category || '').toLowerCase();
    return c.includes('несчастн') || c.includes('происшестви') || c.includes('статистик');
  });
  const dtpIncidents = incidents.filter(i => {
    const c = (i.category || '').toLowerCase();
    return c.includes('дтп') || c.includes('инцидент');
  });

  // Determine displayed image for each card
  const imgMicro = microIncidents[0]?.image_path || '/samples/incident_7.svg';
  const imgAccident = accidentIncidents[0]?.image_path || incidents[1]?.image_path || '/samples/incident_4_fall.svg';
  const imgDtp = dtpIncidents[0]?.image_path || incidents[2]?.image_path || '/samples/incident_7.svg';

  // Count priority: uploaded item count > category length > default stats
  const countMicro = microIncidents[0]?.count !== undefined 
    ? microIncidents[0].count 
    : (microIncidents.length > 0 ? microIncidents.length : (safetyStats.microTraumas || 5));

  const countAccident = accidentIncidents[0]?.count !== undefined 
    ? accidentIncidents[0].count 
    : (accidentIncidents.length > 0 ? accidentIncidents.length : (safetyStats.incidents || 8));

  const countDtp = dtpIncidents[0]?.count !== undefined 
    ? dtpIncidents[0].count 
    : (dtpIncidents.length > 0 ? dtpIncidents.length : (safetyStats.accidents || 12));

  const displayDate = reportDate || '05 августа 2026 г.';

  return (
    <div style={{
      width: '100%',
      height: '100%',
      background: 'linear-gradient(135deg, #E6ECF5 0%, #EFF4FA 100%)',
      display: 'flex',
      flexDirection: 'column',
      fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
      padding: '2vh 3vw',
      boxSizing: 'border-box',
      overflow: 'hidden',
    }}>
      {/* ── Header ── */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '1.5vh',
        flexShrink: 0,
      }}>
        {/* Red Left Pill */}
        <div style={{
          background: '#E53935',
          color: '#FFFFFF',
          fontSize: 'clamp(1rem, 1.4vw, 1.4rem)',
          fontWeight: 900,
          padding: '6px 18px',
          borderRadius: '12px',
          letterSpacing: '0.5px',
          boxShadow: '0 4px 12px rgba(229, 57, 53, 0.3)',
          flexShrink: 0,
        }}>
          УОТэиПБ
        </div>

        {/* Center Main Title */}
        <h1 style={{
          flex: 1,
          fontSize: 'clamp(1.8rem, 3vw, 3rem)',
          fontWeight: 900,
          color: '#111827',
          textAlign: 'center',
          lineHeight: 1.1,
          margin: 0,
          letterSpacing: '1px',
          fontFamily: "'Inter', system-ui, sans-serif",
        }}>
          СТАТИСТИКА ПРОИСШЕСТВИЙ
        </h1>

        {/* Right Date */}
        <div style={{
          fontSize: 'clamp(1rem, 1.4vw, 1.4rem)',
          fontWeight: 700,
          color: '#1E293B',
          textAlign: 'right',
          flexShrink: 0,
          minWidth: '180px',
          fontFamily: "'Inter', system-ui, sans-serif",
        }}>
          {displayDate}
        </div>
      </div>

      {/* ── 3 Column Cards Body ── */}
      <div style={{
        flex: 1,
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '1.5vw',
        minHeight: 0,
        overflow: 'hidden',
      }}>
        {/* ── Column 1: МИКРОТРАВМЫ ── */}
        <div style={cardStyle}>
          <div style={{ padding: '14px 16px 8px 16px', flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0, overflow: 'hidden' }}>
            <h2 style={cardTitleStyle}>МИКРОТРАВМЫ</h2>

            {/* Red Count Badge */}
            <div style={redBadgeStyle}>
              <span style={{ fontSize: '2.2rem', fontWeight: 900, lineHeight: 1 }}>{countMicro}</span>
              <span style={{ fontSize: '0.8rem', fontWeight: 700, marginTop: '2px' }}>происшествий</span>
            </div>

            {/* Full Image Container */}
            <div style={imageBoxStyle}>
              <img src={imgMicro} alt="Микротравмы" style={imageStyle} />
            </div>
          </div>

          {/* Bottom Red-White Hazard Stripe */}
          <div style={stripeStyle} />
        </div>

        {/* ── Column 2: СТАТИСТИКА ПРОИСШЕСТВИЙ ── */}
        <div style={cardStyle}>
          <div style={{ padding: '14px 16px 8px 16px', flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0, overflow: 'hidden' }}>
            <h2 style={cardTitleStyle}>СТАТИСТИКА ПРОИСШЕСТВИЙ</h2>

            {/* Red Count Badge */}
            <div style={redBadgeStyle}>
              <span style={{ fontSize: '2.2rem', fontWeight: 900, lineHeight: 1 }}>{countAccident}</span>
              <span style={{ fontSize: '0.8rem', fontWeight: 700, marginTop: '2px' }}>происшествий</span>
            </div>

            {/* Full Image Container */}
            <div style={imageBoxStyle}>
              <img src={imgAccident} alt="Статистика происшествий" style={imageStyle} />
            </div>
          </div>

          {/* Bottom Red-White Hazard Stripe */}
          <div style={stripeStyle} />
        </div>

        {/* ── Column 3: ДТП, ПРОИСШЕСТВИЯ, ИНЦИДЕНТЫ ── */}
        <div style={cardStyle}>
          <div style={{ padding: '14px 16px 8px 16px', flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0, overflow: 'hidden' }}>
            <h2 style={cardTitleStyle}>ДТП, ПРОИСШЕСТВИЯ, ИНЦИДЕНТЫ</h2>

            {/* Red Count Badge */}
            <div style={redBadgeStyle}>
              <span style={{ fontSize: '2.2rem', fontWeight: 900, lineHeight: 1 }}>{countDtp}</span>
              <span style={{ fontSize: '0.8rem', fontWeight: 700, marginTop: '2px' }}>происшествий</span>
            </div>

            {/* Full Image Container */}
            <div style={imageBoxStyle}>
              <img src={imgDtp} alt="ДТП, происшествия, инциденты" style={imageStyle} />
            </div>
          </div>

          {/* Bottom Red-White Hazard Stripe */}
          <div style={stripeStyle} />
        </div>
      </div>

      {/* ── Footer ── */}
      <div style={{
        textAlign: 'center',
        fontSize: '0.8rem',
        color: '#64748B',
        fontWeight: 600,
        marginTop: '1vh',
        flexShrink: 0,
      }}>
        Все данные актуальны на {displayDate}
      </div>
    </div>
  );
}

// ── Shared Card Styles ──
const cardStyle = {
  background: '#FFFFFF',
  borderRadius: '16px',
  boxShadow: '0 10px 30px rgba(0, 0, 0, 0.07)',
  border: '1px solid #E2E8F0',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
  overflow: 'hidden',
  minHeight: 0,
};

const cardTitleStyle = {
  fontSize: 'clamp(0.85rem, 1.1vw, 1.15rem)',
  fontWeight: 900,
  color: '#1E293B',
  margin: '0 0 8px 0',
  textAlign: 'center',
  letterSpacing: '0.3px',
  fontFamily: "'Inter', system-ui, sans-serif",
  flexShrink: 0,
};

const redBadgeStyle = {
  background: '#E53935',
  color: '#FFFFFF',
  borderRadius: '12px',
  padding: '6px 10px',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  marginBottom: '10px',
  boxShadow: '0 4px 12px rgba(229, 57, 53, 0.25)',
  flexShrink: 0,
};

const imageBoxStyle = {
  flex: 1,
  width: '100%',
  height: '100%',
  background: '#FFFFFF',
  borderRadius: '8px',
  border: '1px solid #E2E8F0',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  overflow: 'hidden',
  padding: '4px',
  minHeight: 0,
  boxSizing: 'border-box',
};

const imageStyle = {
  maxWidth: '100%',
  maxHeight: '100%',
  width: 'auto',
  height: 'auto',
  objectFit: 'contain',
  display: 'block',
};

const stripeStyle = {
  height: '12px',
  width: '100%',
  flexShrink: 0,
  background: 'repeating-linear-gradient(-45deg, #DC2626, #DC2626 12px, #FFFFFF 12px, #FFFFFF 24px)',
};
