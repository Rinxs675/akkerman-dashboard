import React, { useState, useEffect, useRef } from 'react';
import HeaderNav from '../components/HeaderNav';
import Slideshow from '../components/Slideshow';
import { parseExcelWorkbook } from '../utils/excelParser';
import { syncManager } from '../utils/syncManager';
import { AlertCircle } from 'lucide-react';

export default function Dashboard({ isAdmin = false }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [fileName, setFileName] = useState('Оперативные_сведения_АККЕРМАНН_TURON.xlsx');
  const [currentSlide, setCurrentSlide] = useState(0);
  const [totalSlides, setTotalSlides] = useState(4);
  const [isPlaying, setIsPlaying] = useState(true);
  const [rawBuffer, setRawBuffer] = useState(null);
  const [syncStatus, setSyncStatus] = useState({ isConnected: false, clientCount: 1 });
  const [incidents, setIncidents] = useState([]);
  const [news, setNews] = useState([]);

  const containerRef = useRef(null);

  const fetchLatestExcelData = async () => {
    try {
      const res = await fetch('/api/latest-excel');
      if (!res.ok) throw new Error('No uploaded file on server');
      const buf = await res.arrayBuffer();
      setRawBuffer(buf);
      const parsed = parseExcelWorkbook(buf);
      if (parsed.success) {
        setData(parsed);
        setError(null);
        return true;
      }
    } catch (e) {
      console.log('[App] Server excel not found, using default fallback:', e.message);
    }
    return false;
  };

  const fetchIncidents = async () => {
    try {
      const res = await fetch('/api/incidents');
      if (res.ok) {
        const data = await res.json();
        setIncidents(data);
      }
    } catch (e) {
      console.error('[App] Failed to fetch incidents:', e);
    }
  };

  const fetchNews = async () => {
    try {
      const res = await fetch('/api/news');
      if (res.ok) {
        const data = await res.json();
        setNews(data);
      }
    } catch (e) {
      console.error('[App] Failed to fetch news:', e);
    }
  };

  const fetchAllData = () => {
    fetchLatestExcelData();
    fetchIncidents();
    fetchNews();
  };

  // Load initial data
  useEffect(() => {
    fetchIncidents();
    fetchNews();
    fetchLatestExcelData().then(success => {
      if (!success) {
        fetch('/default_data.xlsx')
          .then(r => { if (!r.ok) throw new Error('Не удалось загрузить файл'); return r.arrayBuffer(); })
          .then(buf => {
            setRawBuffer(buf);
            const parsed = parseExcelWorkbook(buf);
            if (parsed.success) setData(parsed);
            else setError(parsed.error);
          })
          .catch(e => setError(e.message))
          .finally(() => setLoading(false));
      } else {
        setLoading(false);
      }
    });
  }, []);

  // Multi-device Socket Sync Initialization
  useEffect(() => {
    syncManager.init({
      onConnectionChange: (isConnected) => {
        setSyncStatus(prev => ({ ...prev, isConnected }));
      },
      onClientCount: (clientCount) => {
        setSyncStatus(prev => ({ ...prev, clientCount }));
      },
      onInitState: ({ fileName }) => {
        if (fileName) setFileName(fileName);
        fetchAllData();
      },
      onExcelUpdated: ({ fileName }) => {
        console.log('[App] New Excel file updated on server! Refetching...');
        if (fileName) setFileName(fileName);
        fetchLatestExcelData();
      },
      onIncidentsUpdated: () => {
        console.log('[App] Incidents updated on server! Refetching...');
        fetchIncidents();
      },
      onNewsUpdated: () => {
        console.log('[App] News updated on server! Refetching...');
        fetchNews();
      }
    });
  }, []);

  const handleFileUpload = (file) => {
    setLoading(true); setError(null); setFileName(file.name);
    const reader = new FileReader();
    reader.onload = async e => {
      const buf = e.target.result;
      setRawBuffer(buf);
      const parsed = parseExcelWorkbook(buf);
      if (parsed.success) {
        setData(parsed);
        // Upload Excel file to central server storage & broadcast update to all screens
        await syncManager.uploadExcel(buf, file.name);
      } else {
        setError('Ошибка парсинга: ' + parsed.error);
      }
      setLoading(false);
    };
    reader.onerror = () => { setError('Ошибка чтения файла'); setLoading(false); };
    reader.readAsArrayBuffer(file);
  };

  const handleSelectSheet = (sheetName) => {
    if (!rawBuffer) return;
    const parsed = parseExcelWorkbook(rawBuffer, sheetName);
    if (parsed.success) {
      setData(parsed);
    }
  };

  const handleSlideChange = (slideIndexOrFn) => {
    if (typeof slideIndexOrFn === 'function') {
      setCurrentSlide(prev => slideIndexOrFn(prev));
    } else {
      setCurrentSlide(slideIndexOrFn);
    }
  };

  const handleTogglePlay = () => {
    setIsPlaying(p => !p);
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) containerRef.current?.requestFullscreen().catch(console.error);
    else document.exitFullscreen().catch(console.error);
  };

  return (
    <div
      ref={containerRef}
      onDragOver={e => e.preventDefault()}
      onDrop={e => { e.preventDefault(); e.dataTransfer.files[0] && handleFileUpload(e.dataTransfer.files[0]); }}
      style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: '#030712', overflow: 'hidden' }}
    >
      <HeaderNav
        isAdmin={isAdmin}
        availableSheets={data?.availableSheets}
        activeSheet={data?.activeSheet}
        onSelectSheet={handleSelectSheet}
        onFileUpload={handleFileUpload}
        isPlaying={isPlaying}
        onTogglePlay={handleTogglePlay}
        onToggleFullscreen={toggleFullscreen}
        currentSlide={currentSlide}
        totalSlides={totalSlides}
        fileName={fileName}
        syncStatus={syncStatus}
        onRefreshAll={fetchAllData}
      />

      <div style={{ flex: 1, position: 'relative', minHeight: 0, display: 'flex', flexDirection: 'column' }}>
        {loading && (
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(3,7,18,0.85)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
            <div style={{ width: '56px', height: '56px', border: '4px solid #10B981', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
            <p style={{ color: '#10B981', marginTop: '16px', fontWeight: 600 }}>Загрузка данных...</p>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        )}

        {error && !loading && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'rgba(127,29,29,0.4)', border: '1px solid #991B1B', borderRadius: '12px', padding: '20px 24px', margin: 'auto', maxWidth: '500px', color: '#FCA5A5' }}>
            <AlertCircle size={28} color="#EF4444" />
            <div>
              <p style={{ fontWeight: 700, color: '#FEE2E2', marginBottom: '4px' }}>Ошибка обработки</p>
              <p style={{ fontSize: '0.85rem' }}>{error}</p>
            </div>
          </div>
        )}

        {!loading && !error && data && (
          <Slideshow
            data={data}
            incidents={incidents}
            news={news}
            currentSlide={currentSlide}
            onChangeSlide={handleSlideChange}
            isPlaying={isPlaying}
            onTotalSlidesChange={setTotalSlides}
          />
        )}
      </div>
    </div>
  );
}
