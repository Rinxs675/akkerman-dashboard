import React, { useState } from 'react';
import { Maximize2, X, AlertCircle } from 'lucide-react';

export default function SlideAccidents({ incidents = [], reportDate }) {
  const [fullImage, setFullImage] = useState(null);

  const categories = [
    { id: 'ALL', name: 'Все', color: '#1E293B', bg: '#E2E8F0' },
    { id: 'micro', name: 'Микротравмы', color: '#B45309', bg: '#FEF3C7' },
    { id: 'dtp', name: 'ДТП, происшествия, инциденты', color: '#0369A1', bg: '#E0F2FE' },
    { id: 'accident', name: 'Несчастные случаи', color: '#B91C1C', bg: '#FEE2E2' },
  ];

  // Helper to check item category
  const getItemCatObj = (inc) => {
    const text = (inc.category || '').toLowerCase();
    if (text.includes('микро')) return categories[1];
    if (text.includes('несчастн') || text.includes('травм')) return categories[3];
    return categories[2];
  };

  const count = incidents.length;
  let gridColumns = '1fr';
  if (count === 2) gridColumns = '1fr 1fr';
  else if (count === 3) gridColumns = '1fr 1fr 1fr';
  else if (count >= 4) gridColumns = 'repeat(auto-fit, minmax(280px, 1fr))';

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
      {/* ── Header (Identical to Slide 1, 2, 3) ── */}
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
          ПРОИСШЕСТВИЯ И НЕСЧАСТНЫЕ СЛУЧАИ
        </span>
        <span style={{
          fontSize: 'clamp(1.1rem, 1.6vw, 1.5rem)',
          fontWeight: 600,
          color: '#475569',
          minWidth: '220px',
          textAlign: 'right',
          flexShrink: 0,
        }}>
          {reportDate || new Date().toLocaleDateString('ru-RU')}
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
        {/* Main Content Column: Grid displaying ALL uploaded images */}
        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          minHeight: 0,
          overflow: 'hidden',
        }}>
          {!incidents || incidents.length === 0 ? (
            <div style={{
              flex: 1, background: 'rgba(255,255,255,0.45)', borderRadius: '16px',
              border: '1px solid rgba(255,255,255,0.6)', display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center', color: '#64748B'
            }}>
              <AlertCircle size={48} color="#94A3B8" />
              <p style={{ marginTop: '12px', fontWeight: 700, fontSize: '1.1rem' }}>Нет загруженных картинок происшествий</p>
            </div>
          ) : (
            <div style={{
              flex: 1, minHeight: 0, overflowY: 'auto',
              display: 'grid', gridTemplateColumns: gridColumns, gap: '16px', paddingRight: '4px'
            }}>
              {incidents.map((item, idx) => {
                const catObj = getItemCatObj(item);

                return (
                  <div
                    key={item.id || idx}
                    style={{
                      background: 'rgba(255,255,255,0.65)', borderRadius: '14px',
                      border: '1px solid rgba(255,255,255,0.8)',
                      display: 'flex', flexDirection: 'column', overflow: 'hidden',
                      boxShadow: '0 4px 16px rgba(0,0,0,0.06)', position: 'relative'
                    }}
                  >
                    {/* Header bar on card */}
                    <div style={{
                      padding: '8px 14px', background: 'rgba(255,255,255,0.85)',
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      borderBottom: '1px solid rgba(0,0,0,0.06)'
                    }}>
                      <span style={{
                        fontSize: '0.78rem', fontWeight: 800, color: catObj.color,
                        background: catObj.bg, padding: '3px 10px', borderRadius: '6px'
                      }}>
                        {item.category || catObj.name}
                      </span>
                      <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748B' }}>
                        {item.date_str}
                      </span>
                    </div>

                    {/* Image Area */}
                    <div
                      onClick={() => setFullImage(item.image_path)}
                      style={{
                        flex: 1, minHeight: count <= 2 ? '380px' : '220px', background: '#FFFFFF',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        position: 'relative', cursor: 'pointer', padding: '8px'
                      }}
                    >
                      <img
                        src={item.image_path}
                        alt={item.title || item.category}
                        style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                      />

                      <button
                        onClick={(e) => { e.stopPropagation(); setFullImage(item.image_path); }}
                        style={{
                          position: 'absolute', bottom: '10px', right: '10px', background: 'rgba(30, 41, 59, 0.85)',
                          color: '#FFF', border: 'none', padding: '6px 12px',
                          borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px',
                          fontSize: '0.78rem', fontWeight: 600
                        }}
                      >
                        <Maximize2 size={13} /> Открыть
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ── Logo Column (Identical to Slide 1, 2, 3) ── */}
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
            alt="MUSTAHKAM KELAJAK - AKKERMANN CEMENT"
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

      {/* Lightbox / Fullscreen Image Viewer */}
      {fullImage && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(3, 7, 18, 0.92)', zIndex: 1000,
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '30px'
        }}>
          <button
            onClick={() => setFullImage(null)}
            style={{
              position: 'absolute', top: '24px', right: '24px', background: 'rgba(255,255,255,0.2)',
              color: '#FFF', border: 'none', width: '44px', height: '44px', borderRadius: '50%',
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}
          >
            <X size={26} />
          </button>
          <img
            src={fullImage}
            alt="Fullscreen view"
            style={{ maxWidth: '95vw', maxHeight: '92vh', objectFit: 'contain', borderRadius: '8px', boxShadow: '0 0 50px rgba(0,0,0,0.8)' }}
          />
        </div>
      )}
    </div>
  );
}
