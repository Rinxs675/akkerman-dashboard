import React, { useState, useEffect } from 'react';
import { Newspaper, Clock, ChevronLeft, ChevronRight, Maximize2, X } from 'lucide-react';

export default function SlideNews({ news = [], reportDate }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [fullImage, setFullImage] = useState(null);

  // Filter active news
  const activeNews = news.filter(item => {
    const now = new Date();
    const start = new Date(item.start_date);
    const end = new Date(item.end_date);
    return now >= start && now <= end;
  });

  useEffect(() => {
    if (activeNews.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % activeNews.length);
    }, 30000);
    return () => clearInterval(interval);
  }, [activeNews]);

  if (activeNews.length === 0) return null;

  const current = activeNews[currentIndex] || activeNews[0];

  const formatDate = (isoStr) => {
    if (!isoStr) return '';
    try {
      const d = new Date(isoStr);
      return d.toLocaleString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    } catch (e) {
      return isoStr;
    }
  };

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
          НОВОСТИ
        </span>
        <span style={{
          flex: 1,
          fontSize: 'clamp(1.8rem, 3.2vw, 3rem)',
          fontWeight: 800,
          color: '#1A2B48',
          textAlign: 'center',
          lineHeight: 1.15,
        }}>
          КОРПОРАТИВНЫЕ ОБЪЯВЛЕНИЯ
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
        {/* Main News Card */}
        <div style={{
          flex: 1,
          background: 'rgba(255,255,255,0.65)',
          borderRadius: '16px',
          border: '1px solid rgba(255,255,255,0.8)',
          boxShadow: '0 8px 24px rgba(0,0,0,0.06)',
          display: 'flex',
          flexDirection: 'column',
          padding: '16px',
          overflow: 'hidden',
          minHeight: 0,
          position: 'relative'
        }}>
          {/* Top Expiration Badge */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            marginBottom: '12px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Newspaper size={20} color="#0369A1" />
              <span style={{ fontWeight: 800, fontSize: '1rem', color: '#1E293B' }}>
                {current.title || 'Актуальная новость'}
              </span>
            </div>

            <div style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              background: '#E0F2FE', color: '#0369A1', border: '1px solid #7DD3FC',
              padding: '4px 12px', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 700
            }}>
              <Clock size={14} />
              <span>Показ до: {formatDate(current.end_date)}</span>
            </div>
          </div>

          {/* Banner Image Container */}
          <div style={{
            flex: 1, minHeight: 0, background: '#FFFFFF', borderRadius: '12px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            position: 'relative', overflow: 'hidden', border: '1px solid rgba(0,0,0,0.06)'
          }}>
            {current.image_path ? (
              <img
                src={current.image_path}
                alt={current.title}
                style={{ width: '100%', height: '100%', objectFit: 'contain', cursor: 'pointer' }}
                onClick={() => setFullImage(current.image_path)}
              />
            ) : (
              <span style={{ color: '#94A3B8' }}>Изображение отсутствует</span>
            )}

            <button
              onClick={() => setFullImage(current.image_path)}
              style={{
                position: 'absolute', bottom: '12px', right: '12px', background: 'rgba(30, 41, 59, 0.85)',
                color: '#FFF', border: 'none', padding: '6px 12px',
                borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px',
                fontSize: '0.78rem', fontWeight: 600
              }}
            >
              <Maximize2 size={14} /> Открыть
            </button>

            {/* Cycle arrows */}
            {activeNews.length > 1 && (
              <>
                <button
                  onClick={() => setCurrentIndex(prev => (prev - 1 + activeNews.length) % activeNews.length)}
                  style={{
                    position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)',
                    background: 'rgba(30, 41, 59, 0.8)', color: '#fff', border: 'none',
                    width: '38px', height: '38px', borderRadius: '50%', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}
                >
                  <ChevronLeft size={22} />
                </button>
                <button
                  onClick={() => setCurrentIndex(prev => (prev + 1) % activeNews.length)}
                  style={{
                    position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
                    background: 'rgba(30, 41, 59, 0.8)', color: '#fff', border: 'none',
                    width: '38px', height: '38px', borderRadius: '50%', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}
                >
                  <ChevronRight size={22} />
                </button>
              </>
            )}
          </div>

          {current.description && (
            <p style={{ marginTop: '12px', marginBottom: 0, fontSize: '0.88rem', color: '#334155', lineHeight: 1.4, fontWeight: 500 }}>
              {current.description}
            </p>
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

      {/* Lightbox Modal */}
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
            style={{ maxWidth: '95vw', maxHeight: '92vh', objectFit: 'contain', borderRadius: '8px' }}
          />
        </div>
      )}
    </div>
  );
}
