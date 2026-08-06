import React, { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import SlideUOK from './SlideUOK';
import SlideUPC from './SlideUPC';
import SlideOIUC from './SlideOIUC';
import SlideAccidents from './SlideAccidents';
import SlideNews from './SlideNews';

export default function Slideshow({ data, incidents = [], news = [], currentSlide, onChangeSlide, isPlaying, onTotalSlidesChange }) {
  // Filter active news by current date/time
  const activeNews = news.filter(item => {
    const now = new Date();
    const start = new Date(item.start_date);
    const end = new Date(item.end_date);
    return now >= start && now <= end;
  });

  // Construct active slide list
  const slides = [
    { id: 'uok', Component: SlideUOK, title: 'УОК — Производство Клинкера', props: { data, reportDate: data?.reportDate } },
    { id: 'upc', Component: SlideUPC, title: 'УПЦ — Производство Цемента', props: { data, reportDate: data?.reportDate } },
    { id: 'oiuc', Component: SlideOIUC, title: 'УОиУЦ — Отгрузка цемента', props: { data, reportDate: data?.reportDate } },
    { id: 'accidents', Component: SlideAccidents, title: 'ОТ и ПБ — Уведомления о происшествиях', props: { incidents, reportDate: data?.reportDate } },
  ];

  // Include News slide ONLY if there are active news items
  if (activeNews.length > 0) {
    slides.push({
      id: 'news',
      Component: SlideNews,
      title: 'Новости и объявления AKKERMANN',
      props: { news: activeNews, reportDate: data?.reportDate }
    });
  }

  const [showControls, setShowControls] = useState(true);
  const totalSlides = slides.length;

  useEffect(() => {
    onTotalSlidesChange && onTotalSlidesChange(totalSlides);
  }, [totalSlides]);

  const activeIndex = currentSlide % totalSlides;

  const nextSlide = () => onChangeSlide((activeIndex + 1) % totalSlides);
  const prevSlide = () => onChangeSlide((activeIndex - 1 + totalSlides) % totalSlides);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowRight') nextSlide();
      else if (e.key === ' ') { e.preventDefault(); nextSlide(); }
      else if (e.key === 'ArrowLeft') prevSlide();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeIndex, totalSlides]);

  // Auto-advance timer (30 seconds per slide)
  useEffect(() => {
    if (!isPlaying) return;
    const id = setInterval(() => {
      onChangeSlide((activeIndex + 1) % totalSlides);
    }, 30000);
    return () => clearInterval(id);
  }, [isPlaying, activeIndex, totalSlides]);

  // Auto-hide controls on mouse inactivity
  useEffect(() => {
    let timeout;
    const handleMouseMove = () => {
      setShowControls(true);
      clearTimeout(timeout);
      timeout = setTimeout(() => setShowControls(false), 3500);
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      clearTimeout(timeout);
    };
  }, []);

  const activeSlide = slides[activeIndex] || slides[0];
  const ActiveComponent = activeSlide.Component;

  return (
    <div style={{
      flex: 1,
      width: '100%',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#0B0F19',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Slide viewport */}
      <div style={{
        width: '100%',
        height: '100%',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <ActiveComponent {...activeSlide.props} />
      </div>

      {/* Floating Prev Arrow */}
      <button
        onClick={prevSlide}
        style={{
          position: 'absolute', left: '20px', top: '50%', transform: 'translateY(-50%)',
          background: 'rgba(15,23,42,0.75)', border: '1px solid rgba(255,255,255,0.2)',
          color: '#fff', width: '52px', height: '52px', borderRadius: '50%', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(6px)',
          opacity: showControls ? 1 : 0, transition: 'opacity 0.3s ease',
          pointerEvents: showControls ? 'auto' : 'none', zIndex: 40,
        }}
        title="Предыдущий слайд"
      >
        <ChevronLeft size={30} />
      </button>

      {/* Floating Next Arrow */}
      <button
        onClick={nextSlide}
        style={{
          position: 'absolute', right: '20px', top: '50%', transform: 'translateY(-50%)',
          background: 'rgba(15,23,42,0.75)', border: '1px solid rgba(255,255,255,0.2)',
          color: '#fff', width: '52px', height: '52px', borderRadius: '50%', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(6px)',
          opacity: showControls ? 1 : 0, transition: 'opacity 0.3s ease',
          pointerEvents: showControls ? 'auto' : 'none', zIndex: 40,
        }}
        title="Следующий слайд"
      >
        <ChevronRight size={30} />
      </button>

      {/* Floating Dots Overlay */}
      <div style={{
        position: 'absolute', bottom: '20px', left: '50%', transform: 'translateX(-50%)',
        display: 'flex', gap: '10px', background: 'rgba(15,23,42,0.75)', padding: '8px 16px',
        borderRadius: '9999px', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.15)',
        opacity: showControls ? 1 : 0, transition: 'opacity 0.3s ease',
        pointerEvents: showControls ? 'auto' : 'none', zIndex: 40,
      }}>
        {slides.map((s, i) => (
          <button
            key={s.id}
            onClick={() => onChangeSlide(i)}
            title={s.title}
            style={{
              border: 'none', cursor: 'pointer', borderRadius: '9999px',
              width: activeIndex === i ? '32px' : '10px', height: '10px',
              background: activeIndex === i ? '#10B981' : '#64748B',
              transition: 'all 0.3s ease', padding: 0,
            }}
          />
        ))}
      </div>
    </div>
  );
}
