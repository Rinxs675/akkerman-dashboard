import React, { useRef, useState, useEffect } from 'react';
import { Upload, Play, Pause, Maximize2, FileSpreadsheet, Wifi, WifiOff, ShieldAlert, Newspaper, Database, Pin, PinOff } from 'lucide-react';
import { ExcelHistoryModal, IncidentsModal, NewsModal } from './ManagementModals';

export default function HeaderNav({
  availableSheets, activeSheet, onSelectSheet,
  onFileUpload, isPlaying, onTogglePlay, onToggleFullscreen,
  currentSlide, totalSlides, fileName, syncStatus, onRefreshAll
}) {
  const fileInputRef = useRef(null);
  const [isHovered, setIsHovered] = useState(false);
  const [isPinned, setIsPinned] = useState(false);
  const [modalExcelOpen, setModalExcelOpen] = useState(false);
  const [modalIncidentsOpen, setModalIncidentsOpen] = useState(false);
  const [modalNewsOpen, setModalNewsOpen] = useState(false);

  const isConnected = syncStatus?.isConnected ?? false;
  const clientCount = syncStatus?.clientCount ?? 1;

  // Hover detection timeout
  const leaveTimeoutRef = useRef(null);
  const handleMouseEnter = () => {
    if (leaveTimeoutRef.current) clearTimeout(leaveTimeoutRef.current);
    setIsHovered(true);
  };
  const handleMouseLeave = () => {
    leaveTimeoutRef.current = setTimeout(() => {
      setIsHovered(false);
    }, 600);
  };

  const isVisible = isPinned || isHovered || modalExcelOpen || modalIncidentsOpen || modalNewsOpen;

  return (
    <>
      {/* ── Top Trigger Bar (Glowing hover region at top of viewport) ── */}
      <div
        onMouseEnter={handleMouseEnter}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          height: '14px',
          zIndex: 100,
          cursor: 'pointer',
          background: isVisible ? 'transparent' : 'linear-gradient(180deg, rgba(16,185,129,0.3) 0%, transparent 100%)',
          transition: 'all 0.3s ease',
        }}
      />

      {/* ── Auto-Hiding Navbar Header ── */}
      <header
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          height: '54px',
          background: 'rgba(15, 23, 42, 0.96)',
          color: '#fff',
          padding: '0 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid rgba(255, 255, 255, 0.12)',
          backdropFilter: 'blur(12px)',
          zIndex: 99,
          transform: isVisible ? 'translateY(0)' : 'translateY(-100%)',
          transition: 'transform 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
          boxShadow: isVisible ? '0 10px 30px rgba(0,0,0,0.5)' : 'none',
        }}
      >
        {/* Left Side: Active File Pill & Multi-Device Sync Indicator */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {/* Active File Badge */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            fontSize: '0.8rem', color: '#94A3B8',
            background: 'rgba(30, 41, 59, 0.8)', padding: '6px 12px',
            borderRadius: '6px', border: '1px solid rgba(255, 255, 255, 0.1)',
            maxWidth: '280px',
          }}>
            <FileSpreadsheet size={15} color="#10B981" />
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {fileName || 'Оперативные_сведения.xlsx'}
            </span>
          </div>

          {/* Sync Status Badge */}
          <div 
            title={isConnected ? `Сетевая синхронизация активна (${clientCount} устр.)` : 'Автономный режим (сервер недоступен)'}
            style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              fontSize: '0.78rem', fontWeight: 600,
              padding: '5px 10px', borderRadius: '6px',
              background: isConnected ? 'rgba(16, 185, 129, 0.12)' : 'rgba(245, 158, 11, 0.12)',
              color: isConnected ? '#34D399' : '#FBBF24',
              border: `1px solid ${isConnected ? 'rgba(16, 185, 129, 0.3)' : 'rgba(245, 158, 11, 0.3)'}`,
            }}
          >
            {isConnected ? (
              <>
                <Wifi size={14} style={{ filter: 'drop-shadow(0 0 4px #10B981)' }} />
                <span>Синхронизировано ({clientCount} {clientCount === 1 ? 'экран' : 'экрана'})</span>
              </>
            ) : (
              <>
                <WifiOff size={14} />
                <span>Локально</span>
              </>
            )}
          </div>
        </div>

        {/* Center: Slide Management Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {/* Excel DB Button */}
          <button
            onClick={() => setModalExcelOpen(true)}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '6px',
              background: 'rgba(30, 41, 59, 0.8)', color: '#38BDF8',
              border: '1px solid rgba(56, 189, 248, 0.3)', fontWeight: 600,
              fontSize: '0.78rem', padding: '6px 12px', borderRadius: '6px',
              cursor: 'pointer', height: '34px',
            }}
            title="Просмотреть историю загруженных Excel файлов в БД"
          >
            <Database size={14} /> База Excel
          </button>

          {/* Accidents Button */}
          <button
            onClick={() => setModalIncidentsOpen(true)}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '6px',
              background: 'rgba(239, 68, 68, 0.15)', color: '#FCA5A5',
              border: '1px solid rgba(239, 68, 68, 0.3)', fontWeight: 600,
              fontSize: '0.78rem', padding: '6px 12px', borderRadius: '6px',
              cursor: 'pointer', height: '34px',
            }}
            title="Управление бланками и карточками происшествий"
          >
            <ShieldAlert size={14} /> Происшествия
          </button>

          {/* News Button */}
          <button
            onClick={() => setModalNewsOpen(true)}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '6px',
              background: 'rgba(16, 185, 129, 0.15)', color: '#34D399',
              border: '1px solid rgba(16, 185, 129, 0.3)', fontWeight: 600,
              fontSize: '0.78rem', padding: '6px 12px', borderRadius: '6px',
              cursor: 'pointer', height: '34px',
            }}
            title="Загрузка новостей с ограниченным сроком показа"
          >
            <Newspaper size={14} /> Новости (Таймер)
          </button>
        </div>

        {/* Right Side: Primary Controls & Fullscreen */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {/* Hidden File Input */}
          <input
            type="file"
            ref={fileInputRef}
            accept=".xlsx,.xls"
            onChange={e => e.target.files[0] && onFileUpload(e.target.files[0])}
            style={{ display: 'none' }}
          />

          {/* Upload Button */}
          <button
            onClick={() => fileInputRef.current?.click()}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '6px',
              background: '#10B981', color: '#fff', fontWeight: 600,
              fontSize: '0.8rem', padding: '6px 14px', borderRadius: '6px',
              border: 'none', cursor: 'pointer', height: '34px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
            }}
          >
            <Upload size={14} /> Загрузить Excel
          </button>

          {/* Play/Pause Button */}
          <button
            onClick={onTogglePlay}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '6px',
              background: isPlaying ? 'rgba(245,158,11,0.2)' : 'rgba(30, 41, 59, 0.8)',
              color: isPlaying ? '#FBBF24' : '#E2E8F0',
              border: `1px solid ${isPlaying ? 'rgba(245,158,11,0.5)' : 'rgba(255, 255, 255, 0.1)'}`,
              fontWeight: 600, fontSize: '0.8rem', padding: '6px 14px',
              borderRadius: '6px', cursor: 'pointer', height: '34px',
            }}
          >
            {isPlaying ? <Pause size={14} /> : <Play size={14} />}
            {isPlaying ? 'Пауза' : 'Старт'}
          </button>

          {/* Fullscreen Button */}
          <button
            onClick={onToggleFullscreen}
            style={{
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              background: 'rgba(30, 41, 59, 0.8)', color: '#E2E8F0',
              border: '1px solid rgba(255, 255, 255, 0.1)', width: '34px', height: '34px',
              borderRadius: '6px', cursor: 'pointer', flexShrink: 0,
            }}
            title="Полноэкранный режим"
          >
            <Maximize2 size={16} />
          </button>

          {/* Pin/Unpin Navbar Button */}
          <button
            onClick={() => setIsPinned(p => !p)}
            style={{
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              background: isPinned ? 'rgba(56, 189, 248, 0.25)' : 'rgba(30, 41, 59, 0.8)',
              color: isPinned ? '#38BDF8' : '#64748B',
              border: `1px solid ${isPinned ? 'rgba(56, 189, 248, 0.5)' : 'rgba(255, 255, 255, 0.1)'}`,
              width: '34px', height: '34px', borderRadius: '6px', cursor: 'pointer', flexShrink: 0,
            }}
            title={isPinned ? 'Открепить навбар (будет скрываться)' : 'Закрепить навбар на экране'}
          >
            {isPinned ? <Pin size={16} /> : <PinOff size={16} />}
          </button>

          {/* Slide Counter */}
          <div style={{
            fontSize: '0.8rem', fontWeight: 700, color: '#94A3B8',
            background: 'rgba(30, 41, 59, 0.8)', padding: '6px 12px',
            borderRadius: '6px', border: '1px solid rgba(255, 255, 255, 0.1)',
            height: '34px', display: 'inline-flex', alignItems: 'center',
          }}>
            {(currentSlide % totalSlides) + 1} / {totalSlides}
          </div>
        </div>
      </header>

      {/* Modals */}
      <ExcelHistoryModal
        isOpen={modalExcelOpen}
        onClose={() => setModalExcelOpen(false)}
        onSelectFile={() => { setModalExcelOpen(false); onRefreshAll && onRefreshAll(); }}
        activeFileName={fileName}
      />

      <IncidentsModal
        isOpen={modalIncidentsOpen}
        onClose={() => setModalIncidentsOpen(false)}
        onRefresh={onRefreshAll}
      />

      <NewsModal
        isOpen={modalNewsOpen}
        onClose={() => setModalNewsOpen(false)}
        onRefresh={onRefreshAll}
      />
    </>
  );
}
