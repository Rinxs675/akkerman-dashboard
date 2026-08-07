import React, { useState, useEffect } from 'react';
import { X, Upload, Database, ShieldAlert, Newspaper, Trash2, CheckCircle2, Calendar, Clock, FileSpreadsheet, Plus } from 'lucide-react';

export function ExcelHistoryModal({ isOpen, onClose, onSelectFile, activeFileName }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/excel-history');
      if (res.ok) {
        const data = await res.json();
        setHistory(data);
      }
    } catch (e) {
      console.error('Failed to fetch excel history:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) fetchHistory();
  }, [isOpen]);

  const handleSelect = async (id) => {
    try {
      const res = await fetch(`/api/excel-select/${id}`, { method: 'POST' });
      if (res.ok) {
        await fetchHistory();
        onSelectFile();
      }
    } catch (e) {
      console.error('Failed to select file:', e);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Удалить этот файл из базы данных?')) return;
    try {
      await fetch(`/api/excel-file/${id}`, { method: 'DELETE' });
      fetchHistory();
    } catch (e) {
      console.error('Failed to delete file:', e);
    }
  };

  if (!isOpen) return null;

  return (
    <div style={overlayStyle}>
      <div style={modalStyle}>
        <div style={headerStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Database size={22} color="#10B981" />
            <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800 }}>База сохраненных Excel файлов</h2>
          </div>
          <button onClick={onClose} style={closeBtnStyle}><X size={20} /></button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
          {loading ? (
            <p style={{ color: '#94A3B8', textAlign: 'center' }}>Загрузка списка из базы данных...</p>
          ) : history.length === 0 ? (
            <p style={{ color: '#94A3B8', textAlign: 'center' }}>В базе данных пока нет сохраненных Excel файлов.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {history.map(item => {
                const isActive = item.is_active === 1 || item.original_name === activeFileName;
                return (
                  <div
                    key={item.id}
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '14px 18px', borderRadius: '10px',
                      background: isActive ? 'rgba(16, 185, 129, 0.12)' : 'rgba(30, 41, 59, 0.5)',
                      border: `1px solid ${isActive ? 'rgba(16, 185, 129, 0.4)' : 'rgba(255, 255, 255, 0.08)'}`,
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
                      <FileSpreadsheet size={24} color={isActive ? '#34D399' : '#94A3B8'} />
                      <div style={{ minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontWeight: 700, fontSize: '0.92rem', color: '#F8FAFC', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                            {item.original_name}
                          </span>
                          {isActive && (
                            <span style={{ fontSize: '0.72rem', background: '#10B981', color: '#FFF', padding: '2px 8px', borderRadius: '10px', fontWeight: 800 }}>
                              АКТИВНЫЙ
                            </span>
                          )}
                        </div>
                        <span style={{ fontSize: '0.78rem', color: '#64748B' }}>
                          Загружен: {new Date(item.uploaded_at).toLocaleString('ru-RU')} • {(item.file_size / 1024).toFixed(1)} KB
                        </span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {!isActive && (
                        <button
                          onClick={() => handleSelect(item.id)}
                          style={{
                            background: '#10B981', color: '#FFF', border: 'none', padding: '6px 14px',
                            borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600
                          }}
                        >
                          Выбрать
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(item.id)}
                        style={{
                          background: 'rgba(239, 68, 68, 0.15)', color: '#FCA5A5', border: '1px solid rgba(239, 68, 68, 0.3)',
                          padding: '6px 10px', borderRadius: '6px', cursor: 'pointer'
                        }}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


export function IncidentsModal({ isOpen, onClose, onRefresh }) {
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [category, setCategory] = useState('ДТП, происшествия, инциденты');
  const [count, setCount] = useState('1');
  const [title, setTitle] = useState('');
  const [file, setFile] = useState(null);

  const fetchIncidents = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/incidents');
      if (res.ok) setIncidents(await res.json());
    } catch (e) {
      console.error('Error fetching incidents:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) fetchIncidents();
  }, [isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return alert('Пожалуйста, выберите картинку происшествия');

    setLoading(true);
    const formData = new FormData();
    formData.append('image', file);
    formData.append('category', category);
    formData.append('count', count || '1');
    formData.append('title', title || category);
    formData.append('date_str', new Date().toLocaleString('ru-RU'));

    try {
      const res = await fetch('/api/incidents', { method: 'POST', body: formData });
      if (res.ok) {
        setTitle(''); setFile(null); setCount('1');
        await fetchIncidents();
        onRefresh && onRefresh();
      }
    } catch (e) {
      console.error('Error uploading incident:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Удалить эту картинку происшествия?')) return;
    try {
      await fetch(`/api/incidents/${id}`, { method: 'DELETE' });
      await fetchIncidents();
      onRefresh && onRefresh();
    } catch (e) {
      console.error('Error deleting incident:', e);
    }
  };

  if (!isOpen) return null;

  return (
    <div style={overlayStyle}>
      <div style={{ ...modalStyle, maxWidth: '680px' }}>
        <div style={headerStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <ShieldAlert size={22} color="#EF4444" />
            <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800 }}>Загрузка картинок происшествий</h2>
          </div>
          <button onClick={onClose} style={closeBtnStyle}><X size={20} /></button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Simple Upload Form */}
          <form onSubmit={handleSubmit} style={{ background: 'rgba(30, 41, 59, 0.6)', padding: '20px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '1rem', color: '#F8FAFC', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Plus size={18} color="#10B981" /> Добавить новую картинку
            </h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '12px', marginBottom: '16px' }}>
              <div>
                <label style={{ ...labelStyle, fontSize: '0.85rem', fontWeight: 700, color: '#E2E8F0' }}>1. Выберите категорию:</label>
                <select 
                  style={{ ...inputStyle, padding: '10px 14px', fontSize: '0.95rem', fontWeight: 700, color: '#38BDF8', background: '#0F172A' }} 
                  value={category} 
                  onChange={e => setCategory(e.target.value)}
                >
                  <option value="Микротравмы">Микротравмы</option>
                  <option value="ДТП, происшествия, инциденты">ДТП, происшествия, инциденты</option>
                  <option value="Несчастные случаи">Несчастные случаи</option>
                </select>
              </div>

              <div>
                <label style={{ ...labelStyle, fontSize: '0.85rem', fontWeight: 700, color: '#E2E8F0' }}>2. Кол-во происшествий:</label>
                <input 
                  type="number" 
                  min="0" 
                  max="999" 
                  style={{ ...inputStyle, padding: '10px 14px', fontSize: '0.95rem', fontWeight: 800, color: '#EF4444', textAlign: 'center', background: '#0F172A' }} 
                  value={count} 
                  onChange={e => setCount(e.target.value)} 
                  required 
                />
              </div>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ ...labelStyle, fontSize: '0.85rem', fontWeight: 700, color: '#E2E8F0' }}>3. Выберите картинку (PNG, JPG, SVG):</label>
              <input 
                type="file" 
                accept="image/*" 
                onChange={e => setFile(e.target.files[0])} 
                required 
                style={{ color: '#F8FAFC', fontSize: '0.9rem', width: '100%', padding: '8px', background: 'rgba(15, 23, 42, 0.8)', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.15)' }} 
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={labelStyle}>Название или заголовок (необязательно):</label>
              <input style={inputStyle} value={title} onChange={e => setTitle(e.target.value)} placeholder="Например: Уведомление №7" />
            </div>

            <button type="submit" disabled={loading} style={{ width: '100%', background: loading ? '#64748B' : '#10B981', color: '#FFF', border: 'none', padding: '12px', borderRadius: '8px', fontWeight: 800, fontSize: '0.95rem', cursor: loading ? 'not-allowed' : 'pointer', boxShadow: loading ? 'none' : '0 4px 12px rgba(16, 185, 129, 0.3)' }}>
              {loading ? 'Идет загрузка...' : 'Загрузить в слайд происшествий'}
            </button>
          </form>

          {/* List of existing */}
          <div>
            <h4 style={{ margin: '0 0 12px 0', color: '#94A3B8' }}>Загруженные картинки по категориям ({incidents.length})</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {incidents.map(item => (
                <div key={item.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: 'rgba(15, 23, 42, 0.6)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <img src={item.image_path} alt="" style={{ width: '54px', height: '54px', objectFit: 'cover', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.1)' }} />
                    <div>
                      <div style={{ fontWeight: 800, color: '#F8FAFC', fontSize: '0.92rem' }}>{item.title || item.category}</div>
                      <div style={{ fontSize: '0.8rem', color: '#38BDF8', fontWeight: 600 }}>Категория: {item.category}</div>
                      <div style={{ fontSize: '0.75rem', color: '#64748B' }}>{item.date_str}</div>
                    </div>
                  </div>
                  <button onClick={() => handleDelete(item.id)} style={{ background: 'rgba(239,68,68,0.2)', color: '#FCA5A5', border: '1px solid rgba(239,68,68,0.3)', padding: '8px 12px', borderRadius: '6px', cursor: 'pointer' }}>
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


export function NewsModal({ isOpen, onClose, onRefresh }) {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [file, setFile] = useState(null);

  const fetchNews = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/news');
      if (res.ok) setNews(await res.json());
    } catch (e) {
      console.error('Error fetching news:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      // Set default start/end dates
      const now = new Date();
      const inThreeDays = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
      setStartDate(now.toISOString().slice(0, 16));
      setEndDate(inThreeDays.toISOString().slice(0, 16));
      fetchNews();
    }
  }, [isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return alert('Выберите картинку для новости');

    setLoading(true);
    const formData = new FormData();
    formData.append('image', file);
    formData.append('title', title);
    formData.append('description', description);
    formData.append('start_date', startDate ? new Date(startDate).toISOString() : new Date().toISOString());
    formData.append('end_date', endDate ? new Date(endDate).toISOString() : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString());

    try {
      const res = await fetch('/api/news', { method: 'POST', body: formData });
      if (res.ok) {
        setTitle(''); setDescription(''); setFile(null);
        await fetchNews();
        onRefresh && onRefresh();
      }
    } catch (e) {
      console.error('Error uploading news:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Удалить эту новость?')) return;
    try {
      await fetch(`/api/news/${id}`, { method: 'DELETE' });
      await fetchNews();
      onRefresh && onRefresh();
    } catch (e) {
      console.error('Error deleting news:', e);
    }
  };

  if (!isOpen) return null;

  return (
    <div style={overlayStyle}>
      <div style={{ ...modalStyle, maxWidth: '800px' }}>
        <div style={headerStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Newspaper size={22} color="#38BDF8" />
            <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800 }}>Управление новостями и таймером показа</h2>
          </div>
          <button onClick={onClose} style={closeBtnStyle}><X size={20} /></button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Upload Form */}
          <form onSubmit={handleSubmit} style={{ background: 'rgba(30, 41, 59, 0.6)', padding: '16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>
            <h3 style={{ margin: '0 0 14px 0', fontSize: '1rem', color: '#F8FAFC', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Plus size={18} color="#38BDF8" /> Загрузить новость с ограничением по времени
            </h3>
            
            <div style={{ marginBottom: '12px' }}>
              <label style={labelStyle}>Заголовок новости</label>
              <input style={inputStyle} value={title} onChange={e => setTitle(e.target.value)} placeholder="Название новости или объявления" />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
              <div>
                <label style={labelStyle}>Дата и время НАЧАЛА показа</label>
                <input type="datetime-local" style={inputStyle} value={startDate} onChange={e => setStartDate(e.target.value)} required />
              </div>
              <div>
                <label style={labelStyle}>Дата и время ОКОНЧАНИЯ показа (Исчезнет после)</label>
                <input type="datetime-local" style={inputStyle} value={endDate} onChange={e => setEndDate(e.target.value)} required />
              </div>
            </div>

            <div style={{ marginBottom: '12px' }}>
              <label style={labelStyle}>Подробное описание (опционально)</label>
              <textarea style={{ ...inputStyle, height: '50px', resize: 'vertical' }} value={description} onChange={e => setDescription(e.target.value)} placeholder="Текст объявления..." />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <label style={labelStyle}>Картинка баннера новости (PNG, JPG, SVG)</label>
                <input type="file" accept="image/*" onChange={e => setFile(e.target.files[0])} required style={{ color: '#94A3B8', fontSize: '0.85rem' }} />
              </div>
              <button type="submit" disabled={loading} style={{ background: loading ? '#475569' : '#38BDF8', color: loading ? '#94A3B8' : '#0F172A', border: 'none', padding: '8px 18px', borderRadius: '8px', fontWeight: 800, cursor: loading ? 'not-allowed' : 'pointer' }}>
                {loading ? 'Отправка...' : 'Опубликовать'}
              </button>
            </div>
          </form>

          {/* List of News */}
          <div>
            <h4 style={{ margin: '0 0 10px 0', color: '#94A3B8' }}>Список новостей ({news.length})</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {news.map(item => {
                const now = new Date();
                const start = new Date(item.start_date);
                const end = new Date(item.end_date);
                const isActive = now >= start && now <= end;

                return (
                  <div key={item.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px', background: isActive ? 'rgba(56, 189, 248, 0.1)' : 'rgba(15, 23, 42, 0.6)', borderRadius: '8px', border: `1px solid ${isActive ? 'rgba(56, 189, 248, 0.3)' : 'rgba(255,255,255,0.05)'}` }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <img src={item.image_path} alt="" style={{ width: '60px', height: '40px', objectFit: 'cover', borderRadius: '6px' }} />
                      <div>
                        <div style={{ fontWeight: 700, color: '#F8FAFC', display: 'flex', alignItems: 'center', gap: '8px' }}>
                          {item.title || 'Новость'}
                          <span style={{ fontSize: '0.7rem', padding: '2px 8px', borderRadius: '6px', background: isActive ? '#10B981' : '#64748B', color: '#FFF' }}>
                            {isActive ? 'АКТИВНА' : now < start ? 'ЗАПЛАНИРОВАНА' : 'ИСТЕК СРОК'}
                          </span>
                        </div>
                        <div style={{ fontSize: '0.78rem', color: '#94A3B8' }}>
                          Период: {new Date(item.start_date).toLocaleString('ru-RU')} — {new Date(item.end_date).toLocaleString('ru-RU')}
                        </div>
                      </div>
                    </div>
                    <button onClick={() => handleDelete(item.id)} style={{ background: 'rgba(239,68,68,0.2)', color: '#FCA5A5', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer' }}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


// Shared modal styles
const overlayStyle = {
  position: 'fixed', inset: 0, background: 'rgba(3, 7, 18, 0.85)', backdropFilter: 'blur(8px)',
  zIndex: 999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px'
};

const modalStyle = {
  width: '100%', maxWidth: '680px', maxHeight: '85vh', background: '#0F172A',
  borderRadius: '16px', border: '1px solid rgba(255, 255, 255, 0.15)',
  display: 'flex', flexDirection: 'column', color: '#F8FAFC', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)'
};

const headerStyle = {
  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
  padding: '16px 20px', borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
};

const closeBtnStyle = {
  background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer', padding: '4px'
};

const labelStyle = {
  display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#94A3B8', marginBottom: '4px'
};

const inputStyle = {
  width: '100%', padding: '8px 12px', borderRadius: '6px', background: 'rgba(15, 23, 42, 0.8)',
  border: '1px solid rgba(255, 255, 255, 0.15)', color: '#FFF', fontSize: '0.85rem', boxSizing: 'border-box'
};
