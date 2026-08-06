import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import multer from 'multer';
import { initDatabase, dbRun, dbAll, dbGet } from './db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ extended: true, limit: '100mb' }));

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*', methods: ['GET', 'POST', 'DELETE'] },
  maxHttpBufferSize: 1e8
});

// Directories setup
const UPLOADS_DIR = path.join(__dirname, 'uploads');
const EXCEL_DIR = path.join(UPLOADS_DIR, 'excel');
const INCIDENTS_DIR = path.join(UPLOADS_DIR, 'incidents');
const NEWS_DIR = path.join(UPLOADS_DIR, 'news');

[UPLOADS_DIR, EXCEL_DIR, INCIDENTS_DIR, NEWS_DIR].forEach(dir => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

// Serve uploaded files statically
app.use('/uploads', express.static(UPLOADS_DIR));
app.use('/samples', express.static(path.join(__dirname, 'public', 'samples')));

// Multer storage configs
const storageIncident = multer.diskStorage({
  destination: (req, file, cb) => cb(null, INCIDENTS_DIR),
  filename: (req, file, cb) => cb(null, `incident_${Date.now()}_${path.basename(file.originalname)}`)
});
const uploadIncident = multer({ storage: storageIncident });

const storageNews = multer.diskStorage({
  destination: (req, file, cb) => cb(null, NEWS_DIR),
  filename: (req, file, cb) => cb(null, `news_${Date.now()}_${path.basename(file.originalname)}`)
});
const uploadNews = multer({ storage: storageNews });

const storageExcel = multer.diskStorage({
  destination: (req, file, cb) => cb(null, EXCEL_DIR),
  filename: (req, file, cb) => cb(null, `excel_${Date.now()}_${path.basename(file.originalname)}`)
});
const uploadExcelMulter = multer({ storage: storageExcel });

// Server State
let currentSyncState = {
  excelBuffer: null,
  fileName: 'Оперативные_сведения_АККЕРМАНН_TURON.xlsx',
  activeSheet: null,
  currentSlide: 0,
  isPlaying: true
};

// Initialize DB and load active excel file
initDatabase().then(async () => {
  try {
    const activeFile = await dbGet(`SELECT * FROM excel_files WHERE is_active = 1 ORDER BY id DESC LIMIT 1`);
    if (activeFile && fs.existsSync(activeFile.file_path)) {
      currentSyncState.excelBuffer = fs.readFileSync(activeFile.file_path);
      currentSyncState.fileName = activeFile.original_name;
      console.log(`[SyncServer] Loaded active Excel from SQLite DB: "${activeFile.original_name}"`);
    } else {
      // Fallback: search latest excel file in uploads/
      const latestPath = path.join(UPLOADS_DIR, 'latest_uploaded.xlsx');
      if (fs.existsSync(latestPath)) {
        currentSyncState.excelBuffer = fs.readFileSync(latestPath);
        console.log('[SyncServer] Loaded fallback latest_uploaded.xlsx');
      }
    }
  } catch (err) {
    console.error('[SyncServer] Error loading active Excel from DB:', err);
  }
});

// REST ENDPOINTS

// Status
app.get('/api/status', (req, res) => {
  res.json({
    status: 'ok',
    connectedClients: io.engine.clientsCount,
    hasUploadedExcel: !!currentSyncState.excelBuffer,
    fileName: currentSyncState.fileName,
    currentSlide: currentSyncState.currentSlide,
    isPlaying: currentSyncState.isPlaying
  });
});

// Download/Fetch current active excel file
app.get('/api/latest-excel', async (req, res) => {
  try {
    const activeFile = await dbGet(`SELECT * FROM excel_files WHERE is_active = 1 ORDER BY id DESC LIMIT 1`);
    if (activeFile && fs.existsSync(activeFile.file_path)) {
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      return res.sendFile(activeFile.file_path);
    }
    
    const fallbackPath = path.join(UPLOADS_DIR, 'latest_uploaded.xlsx');
    if (fs.existsSync(fallbackPath)) {
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      return res.sendFile(fallbackPath);
    }

    res.status(404).json({ error: 'No uploaded Excel file found' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get Excel History from DB
app.get('/api/excel-history', async (req, res) => {
  try {
    const files = await dbAll(`SELECT id, filename, original_name, file_size, uploaded_at, is_active FROM excel_files ORDER BY id DESC`);
    res.json(files);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Select active Excel file from DB
app.post('/api/excel-select/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const target = await dbGet(`SELECT * FROM excel_files WHERE id = ?`, [id]);
    if (!target) return res.status(404).json({ error: 'File not found' });

    await dbRun(`UPDATE excel_files SET is_active = 0`);
    await dbRun(`UPDATE excel_files SET is_active = 1 WHERE id = ?`, [id]);

    if (fs.existsSync(target.file_path)) {
      currentSyncState.excelBuffer = fs.readFileSync(target.file_path);
      currentSyncState.fileName = target.original_name;
    }

    io.emit('EXCEL_UPDATED', { fileName: target.original_name, timestamp: Date.now() });
    res.json({ success: true, fileName: target.original_name });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete Excel file from DB
app.delete('/api/excel-file/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const target = await dbGet(`SELECT * FROM excel_files WHERE id = ?`, [id]);
    if (target) {
      if (fs.existsSync(target.file_path)) {
        try { fs.unlinkSync(target.file_path); } catch (e) {}
      }
      await dbRun(`DELETE FROM excel_files WHERE id = ?`, [id]);
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Upload Excel file (REST endpoint supporting both Raw Binary and Multipart)
app.post('/api/upload', express.raw({ type: '*/*', limit: '100mb' }), async (req, res) => {
  try {
    const fileBuf = req.body;
    if (!fileBuf || !fileBuf.length) {
      return res.status(400).json({ error: 'No file data received' });
    }

    const rawHeaderName = req.headers['x-file-name'];
    const originalName = rawHeaderName ? decodeURIComponent(rawHeaderName) : 'Оперативные_сведения_АККЕРМАНН_TURON.xlsx';
    
    const savedFileName = `excel_${Date.now()}_${originalName.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
    const filePath = path.join(EXCEL_DIR, savedFileName);

    fs.writeFileSync(filePath, fileBuf);

    // Update active status in SQLite
    await dbRun(`UPDATE excel_files SET is_active = 0`);
    await dbRun(
      `INSERT INTO excel_files (filename, original_name, file_path, file_size, is_active) VALUES (?, ?, ?, ?, 1)`,
      [savedFileName, originalName, filePath, fileBuf.length]
    );

    currentSyncState.excelBuffer = fileBuf;
    currentSyncState.fileName = originalName;

    console.log(`[SyncServer] Excel saved to DB & disk: "${originalName}" (${fileBuf.length} bytes)`);

    io.emit('EXCEL_UPDATED', { fileName: originalName, timestamp: Date.now() });

    res.json({ success: true, fileName: originalName });
  } catch (err) {
    console.error('[SyncServer] Upload error:', err);
    res.status(500).json({ error: err.message });
  }
});

// --- INCIDENTS ENDPOINTS ---

// Get all incidents
app.get('/api/incidents', async (req, res) => {
  try {
    const rows = await dbAll(`SELECT * FROM incidents ORDER BY id DESC`);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Upload incident notification image
app.post('/api/incidents', uploadIncident.single('image'), async (req, res) => {
  try {
    const { title, number, category, date_str, location, description, count } = req.body;
    if (!req.file) {
      return res.status(400).json({ error: 'No image uploaded' });
    }

    const imagePath = `/uploads/incidents/${req.file.filename}`;
    const incidentCount = count ? parseInt(count, 10) : 1;

    const result = await dbRun(
      `INSERT INTO incidents (title, number, category, date_str, location, description, image_path, count) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        title || category || 'Уведомление о происшествии',
        number || '',
        category || 'Происшествие',
        date_str || new Date().toLocaleString('ru-RU'),
        location || 'Объект предприятия',
        description || '',
        imagePath,
        incidentCount
      ]
    );

    io.emit('INCIDENTS_UPDATED', { timestamp: Date.now() });
    res.json({ success: true, id: result.lastID, imagePath });
  } catch (err) {
    console.error('[SyncServer] Incident upload error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Delete incident
app.delete('/api/incidents/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const target = await dbGet(`SELECT * FROM incidents WHERE id = ?`, [id]);
    if (target) {
      if (target.image_path.startsWith('/uploads/')) {
        const fullPath = path.join(__dirname, target.image_path);
        if (fs.existsSync(fullPath)) {
          try { fs.unlinkSync(fullPath); } catch (e) {}
        }
      }
      await dbRun(`DELETE FROM incidents WHERE id = ?`, [id]);
      io.emit('INCIDENTS_UPDATED', { timestamp: Date.now() });
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- NEWS ENDPOINTS ---

// Get all news
app.get('/api/news', async (req, res) => {
  try {
    const rows = await dbAll(`SELECT * FROM news ORDER BY id DESC`);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get active news (current time between start_date and end_date)
app.get('/api/news/active', async (req, res) => {
  try {
    const rows = await dbAll(`SELECT * FROM news ORDER BY id DESC`);
    const now = new Date();
    const activeRows = rows.filter(item => {
      const start = new Date(item.start_date);
      const end = new Date(item.end_date);
      return now >= start && now <= end;
    });
    res.json(activeRows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Upload news item
app.post('/api/news', uploadNews.single('image'), async (req, res) => {
  try {
    const { title, description, start_date, end_date } = req.body;
    if (!req.file) {
      return res.status(400).json({ error: 'No image uploaded' });
    }

    const imagePath = `/uploads/news/${req.file.filename}`;
    const startStr = start_date || new Date().toISOString();
    const endStr = end_date || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

    const result = await dbRun(
      `INSERT INTO news (title, description, image_path, start_date, end_date) VALUES (?, ?, ?, ?, ?)`,
      [title || 'Новость', description || '', imagePath, startStr, endStr]
    );

    io.emit('NEWS_UPDATED', { timestamp: Date.now() });
    res.json({ success: true, id: result.lastID, imagePath });
  } catch (err) {
    console.error('[SyncServer] News upload error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Delete news item
app.delete('/api/news/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const target = await dbGet(`SELECT * FROM news WHERE id = ?`, [id]);
    if (target) {
      if (target.image_path.startsWith('/uploads/')) {
        const fullPath = path.join(__dirname, target.image_path);
        if (fs.existsSync(fullPath)) {
          try { fs.unlinkSync(fullPath); } catch (e) {}
        }
      }
      await dbRun(`DELETE FROM news WHERE id = ?`, [id]);
      io.emit('NEWS_UPDATED', { timestamp: Date.now() });
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// Serve static frontend build if dist directory exists
const DIST_DIR = path.join(__dirname, 'dist');
if (fs.existsSync(DIST_DIR)) {
  app.use(express.static(DIST_DIR));
  app.use((req, res, next) => {
    if (req.method === 'GET' && !req.path.startsWith('/api') && !req.path.startsWith('/uploads') && !req.path.startsWith('/samples')) {
      res.sendFile(path.join(DIST_DIR, 'index.html'));
    } else {
      next();
    }
  });
}

// Socket.IO real-time synchronization
io.on('connection', (socket) => {
  console.log(`[SyncServer] Client connected: ${socket.id} (Total online: ${io.engine.clientsCount})`);
  io.emit('CLIENT_COUNT', io.engine.clientsCount);

  socket.emit('INIT_STATE', {
    excelBuffer: currentSyncState.excelBuffer,
    fileName: currentSyncState.fileName,
    hasUploadedExcel: !!currentSyncState.excelBuffer
  });

  socket.on('EXCEL_UPLOAD', async (data) => {
    if (!data || !data.buffer) return;
    const fileBuf = Buffer.isBuffer(data.buffer) ? data.buffer : Buffer.from(data.buffer);
    const originalName = data.fileName || 'Оперативные_сведения_АККЕРМАНН_TURON.xlsx';
    
    currentSyncState.excelBuffer = fileBuf;
    currentSyncState.fileName = originalName;

    try {
      const savedFileName = `excel_${Date.now()}_${originalName.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
      const filePath = path.join(EXCEL_DIR, savedFileName);
      fs.writeFileSync(filePath, fileBuf);

      await dbRun(`UPDATE excel_files SET is_active = 0`);
      await dbRun(
        `INSERT INTO excel_files (filename, original_name, file_path, file_size, is_active) VALUES (?, ?, ?, ?, 1)`,
        [savedFileName, originalName, filePath, fileBuf.length]
      );
    } catch (e) {
      console.error('[SyncServer] Error saving excel to DB:', e);
    }

    io.emit('EXCEL_UPDATED', { fileName: originalName, timestamp: Date.now() });
  });

  socket.on('SHEET_CHANGE', (data) => {
    currentSyncState.activeSheet = data.activeSheet;
    socket.broadcast.emit('SHEET_SYNC', data);
  });

  socket.on('SLIDE_CHANGE', (data) => {
    currentSyncState.currentSlide = data.currentSlide;
    socket.broadcast.emit('SLIDE_SYNC', data);
  });

  socket.on('PLAY_TOGGLE', (data) => {
    currentSyncState.isPlaying = data.isPlaying;
    socket.broadcast.emit('PLAY_SYNC', data);
  });

  socket.on('disconnect', () => {
    console.log(`[SyncServer] Client disconnected: ${socket.id}`);
    io.emit('CLIENT_COUNT', io.engine.clientsCount);
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`==================================================`);
  console.log(`🚀 Akkermann Dashboard Sync Server running on port ${PORT}`);
  console.log(`🌐 Local: http://localhost:${PORT}`);
  console.log(`==================================================`);
});
