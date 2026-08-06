import React, { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import SlideUOK from './SlideUOK';
import SlideUPC from './SlideUPC';
import SlideOIUC from './SlideOIUC';
import SlideAccidents from './SlideAccidents';
import SlideNews from './SlideNews';

export default function Slideshow({ data, incidents = [], news = [], currentSlide, onChangeSlide, isPlaying, onTotalSlidesChange }) {
  // 1. МЕМОИЗАЦИЯ ВЫЧИСЛЕНИЙ: Оптимизируем фильтрацию новостей (исключаем пересчет при каждом рендере)
  const activeNews = useMemo(() => {
    return news.filter(item => {
      const now = new Date();
      const start = new Date(item.start_date);
      const end = new Date(item.end_date);
      return now >= start && now <= end;
    });
  }, [news]);

  // 2. ИЗБЕЖАНИЕ ЛИШНИХ РЕНДЕРОВ: Оборачиваем сборку слайдов в useMemo
  const slides = useMemo(() => {
    const baseSlides = [
      { id: 'uok', Component: SlideUOK, title: 'УОК — Производство Клинкера', props: { data, reportDate: data?.reportDate } },
      { id: 'upc', Component: SlideUPC, title: 'УПЦ — Производство Цемента', props: { data, reportDate: data?.reportDate } },
      { id: 'oiuc', Component: SlideOIUC, title: 'УОиУЦ — Отгрузка цемента', props: { data, reportDate: data?.reportDate } },
      { id: 'accidents', Component: SlideAccidents, title: 'ОТ и ПБ — Уведомления о происшествиях', props: { incidents, reportDate: data?.reportDate } },
    ];
    
    if (activeNews.length > 0) {
      baseSlides.push({
        id: 'news',
        Component: SlideNews,
        title: 'Новости и объявления AKKERMANN',
        props: { news: activeNews, reportDate: data?.reportDate }
      });
    }
    return baseSlides;
  }, [data, incidents, activeNews]);

  const [showControls, setShowControls] = useState(true);
  const totalSlides = slides.length;
  const activeIndex = currentSlide % totalSlides;

  // 3. STABLE CLOSURES: Оборачиваем функции навигации в useCallback для предотвращения утечек
  const nextSlide = useCallback(() => {
    onChangeSlide((activeIndex + 1) % totalSlides);
  }, [activeIndex, totalSlides, onChangeSlide]);

  const prevSlide = useCallback(() => {
    onChangeSlide((activeIndex - 1 + totalSlides) % totalSlides);
  }, [activeIndex, totalSlides, onChangeSlide]);

  // 4. ИСПРАВЛЕНИЕ ЗАВИСИМОСТЕЙ: onTotalSlidesChange добавлен в dependency array
  useEffect(() => {
    if (onTotalSlidesChange) {
      onTotalSlidesChange(totalSlides);
    }
  }, [totalSlides, onTotalSlidesChange]);

  // 5. ИСПРАВЛЕНИЕ RACE CONDITIONS: Стабильные функции в EventListeners
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowRight') nextSlide();
      else if (e.key === ' ') { e.preventDefault(); nextSlide(); } // Блокируем скролл при пробеле
      else if (e.key === 'ArrowLeft') prevSlide();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [nextSlide, prevSlide]);

  // 6. ИСПРАВЛЕНИЕ ТАЙМЕРА: Используем useRef для безопасного сброса интервала
  const timerRef = useRef(null);
  useEffect(() => {
    if (!isPlaying) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }
    timerRef.current = setInterval(() => {
      nextSlide();
    }, 30000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, nextSlide]);

  // 7. ИСПРАВЛЕНИЕ УТЕЧКИ ПАМЯТИ ПРИ ДЕМОНТАЖЕ: Обработка первой загрузки и отписок
  useEffect(() => {
    let timeout;
    const handleMouseMove = () => {
      setShowControls(true);
      clearTimeout(timeout);
      timeout = setTimeout(() => setShowControls(false), 3500);
    };
    
    // Прячем интерфейс через 3.5с после загрузки, если мышь не двигалась
    timeout = setTimeout(() => setShowControls(false), 3500);
    
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
      {/* Контейнер слайда */}
      <div style={{
        width: '100%',
        height: '100%',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <ActiveComponent {...activeSlide.props} />
      </div>

      {/* Адаптивная левая кнопка (Responsive) */}
      <button
        onClick={prevSlide}
        style={{
          position: 'absolute', 
          left: 'clamp(10px, 3vw, 20px)', 
          top: '50%', 
          transform: 'translateY(-50%)',
          background: 'rgba(15,23,42,0.75)', 
          border: '1px solid rgba(255,255,255,0.2)',
          color: '#fff', 
          width: 'clamp(40px, 6vw, 52px)', 
          height: 'clamp(40px, 6vw, 52px)', 
          borderRadius: '50%', 
          cursor: 'pointer',
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          backdropFilter: 'blur(6px)',
          opacity: showControls ? 1 : 0, 
          transition: 'all 0.3s ease',
          pointerEvents: showControls ? 'auto' : 'none', 
          zIndex: 40,
        }}
        title="Предыдущий слайд"
      >
        <ChevronLeft style={{ width: 'clamp(20px, 4vw, 30px)', height: 'clamp(20px, 4vw, 30px)' }} />
      </button>

      {/* Адаптивная правая кнопка (Responsive) */}
      <button
        onClick={nextSlide}
        style={{
          position: 'absolute', 
          right: 'clamp(10px, 3vw, 20px)', 
          top: '50%', 
          transform: 'translateY(-50%)',
          background: 'rgba(15,23,42,0.75)', 
          border: '1px solid rgba(255,255,255,0.2)',
          color: '#fff', 
          width: 'clamp(40px, 6vw, 52px)', 
          height: 'clamp(40px, 6vw, 52px)', 
          borderRadius: '50%', 
          cursor: 'pointer',
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          backdropFilter: 'blur(6px)',
          opacity: showControls ? 1 : 0, 
          transition: 'all 0.3s ease',
          pointerEvents: showControls ? 'auto' : 'none', 
          zIndex: 40,
        }}
        title="Следующий слайд"
      >
        <ChevronRight style={{ width: 'clamp(20px, 4vw, 30px)', height: 'clamp(20px, 4vw, 30px)' }} />
      </button>

      {/* Адаптивная панель индикаторов (Dots Overlay) */}
      <div style={{
        position: 'absolute', 
        bottom: 'clamp(15px, 4vw, 30px)', 
        left: '50%', 
        transform: 'translateX(-50%)',
        display: 'flex', 
        gap: 'clamp(6px, 1.5vw, 10px)', 
        background: 'rgba(15,23,42,0.75)', 
        padding: 'clamp(6px, 1.5vw, 8px) clamp(12px, 2.5vw, 16px)',
        borderRadius: '9999px', 
        backdropFilter: 'blur(8px)', 
        border: '1px solid rgba(255,255,255,0.15)',
        opacity: showControls ? 1 : 0, 
        transition: 'all 0.3s ease',
        pointerEvents: showControls ? 'auto' : 'none', 
        zIndex: 40,
      }}>
        {slides.map((s, i) => (
          <button
            key={s.id}
            onClick={() => onChangeSlide(i)}
            title={s.title}
            style={{
              border: 'none', 
              cursor: 'pointer', 
              borderRadius: '9999px',
              width: activeIndex === i ? 'clamp(24px, 5vw, 32px)' : 'clamp(8px, 2vw, 10px)', 
              height: 'clamp(8px, 2vw, 10px)',
              background: activeIndex === i ? '#10B981' : '#64748B',
              transition: 'all 0.3s ease', 
              padding: 0,
            }}
          />
        ))}
      </div>
    </div>
  );
}
