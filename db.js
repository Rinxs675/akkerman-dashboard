import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_PATH = path.join(__dirname, 'database.sqlite');
const JSON_DB_PATH = path.join(__dirname, 'database.json');

let sqliteDb = null;
let useJsonDb = false;

// Fallback JSON DB State
let jsonStore = {
  excel_files: [],
  incidents: [],
  news: []
};

// Try initializing SQLite3 native binding dynamically
try {
  const sqlite3Module = await import('sqlite3');
  const sqlite3 = sqlite3Module.default || sqlite3Module;
  sqliteDb = new sqlite3.Database(DB_PATH, (err) => {
    if (err) {
      console.warn('[Database] SQLite native error, switching to JSON DB:', err.message);
      enableJsonDbFallback();
    } else {
      console.log('[Database] Connected to SQLite database at', DB_PATH);
    }
  });
} catch (err) {
  console.warn('[Database] Native sqlite3 module failed to load (GLIBC incompatibility). Falling back to JSON database:', err.message);
  enableJsonDbFallback();
}

function enableJsonDbFallback() {
  useJsonDb = true;
  if (fs.existsSync(JSON_DB_PATH)) {
    try {
      jsonStore = JSON.parse(fs.readFileSync(JSON_DB_PATH, 'utf8'));
      console.log('[Database] Loaded JSON database fallback successfully.');
    } catch (e) {
      console.error('[Database] Failed to read JSON database fallback:', e);
    }
  } else {
    saveJsonDb();
  }
}

function saveJsonDb() {
  try {
    fs.writeFileSync(JSON_DB_PATH, JSON.stringify(jsonStore, null, 2));
  } catch (e) {
    console.error('[Database] Failed to save JSON database:', e);
  }
}

// Promise helpers for DB queries
export function dbRun(sql, params = []) {
  if (useJsonDb || !sqliteDb) {
    return handleJsonRun(sql, params);
  }
  return new Promise((resolve, reject) => {
    sqliteDb.run(sql, params, function (err) {
      if (err) reject(err);
      else resolve(this);
    });
  });
}

export function dbAll(sql, params = []) {
  if (useJsonDb || !sqliteDb) {
    return Promise.resolve(handleJsonAll(sql, params));
  }
  return new Promise((resolve, reject) => {
    sqliteDb.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
}

export function dbGet(sql, params = []) {
  if (useJsonDb || !sqliteDb) {
    return Promise.resolve(handleJsonGet(sql, params));
  }
  return new Promise((resolve, reject) => {
    sqliteDb.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
}

// JSON Fallback Handlers
function handleJsonRun(sql, params = []) {
  const cleanSql = sql.trim().toUpperCase();

  if (cleanSql.startsWith('CREATE TABLE')) {
    return Promise.resolve({ lastID: 0 });
  }

  if (cleanSql.startsWith('INSERT INTO EXCEL_FILES')) {
    if (params[3] === 1 || sql.includes('is_active = 1')) {
      jsonStore.excel_files.forEach(f => f.is_active = 0);
    }
    const newObj = {
      id: Date.now(),
      filename: params[0],
      original_name: params[1],
      file_path: params[2],
      file_size: params[3],
      uploaded_at: new Date().toISOString(),
      is_active: params[4] !== undefined ? params[4] : 1
    };
    jsonStore.excel_files.push(newObj);
    saveJsonDb();
    return Promise.resolve({ lastID: newObj.id });
  }

  if (cleanSql.startsWith('UPDATE EXCEL_FILES SET IS_ACTIVE = 0')) {
    jsonStore.excel_files.forEach(f => f.is_active = 0);
    saveJsonDb();
    return Promise.resolve({ changes: jsonStore.excel_files.length });
  }

  if (cleanSql.startsWith('UPDATE EXCEL_FILES SET IS_ACTIVE = 1')) {
    const id = params[0];
    jsonStore.excel_files.forEach(f => f.is_active = (f.id == id ? 1 : 0));
    saveJsonDb();
    return Promise.resolve({ changes: 1 });
  }

  if (cleanSql.startsWith('DELETE FROM EXCEL_FILES')) {
    const id = params[0];
    jsonStore.excel_files = jsonStore.excel_files.filter(f => f.id != id);
    saveJsonDb();
    return Promise.resolve({ changes: 1 });
  }

  if (cleanSql.startsWith('INSERT INTO INCIDENTS')) {
    const newObj = {
      id: Date.now(),
      title: params[0] || 'Уведомление о происшествии',
      number: params[1] || '',
      category: params[2] || 'Происшествие',
      date_str: params[3] || new Date().toLocaleString('ru-RU'),
      location: params[4] || '',
      description: params[5] || '',
      image_path: params[6] || '',
      count: params[7] !== undefined ? Number(params[7]) : 1,
      created_at: new Date().toISOString()
    };
    jsonStore.incidents.unshift(newObj);
    saveJsonDb();
    return Promise.resolve({ lastID: newObj.id });
  }

  if (cleanSql.startsWith('DELETE FROM INCIDENTS')) {
    const id = params[0];
    jsonStore.incidents = jsonStore.incidents.filter(i => i.id != id);
    saveJsonDb();
    return Promise.resolve({ changes: 1 });
  }

  if (cleanSql.startsWith('INSERT INTO NEWS')) {
    const newObj = {
      id: Date.now(),
      title: params[0] || 'Новость',
      description: params[1] || '',
      image_path: params[2] || '',
      start_date: params[3] || new Date().toISOString(),
      end_date: params[4] || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      created_at: new Date().toISOString()
    };
    jsonStore.news.unshift(newObj);
    saveJsonDb();
    return Promise.resolve({ lastID: newObj.id });
  }

  if (cleanSql.startsWith('DELETE FROM NEWS')) {
    const id = params[0];
    jsonStore.news = jsonStore.news.filter(n => n.id != id);
    saveJsonDb();
    return Promise.resolve({ changes: 1 });
  }

  return Promise.resolve({ changes: 0 });
}

function handleJsonAll(sql, params = []) {
  const cleanSql = sql.trim().toUpperCase();
  if (cleanSql.includes('FROM EXCEL_FILES')) {
    return [...jsonStore.excel_files].sort((a, b) => b.id - a.id);
  }
  if (cleanSql.includes('FROM INCIDENTS')) {
    return [...jsonStore.incidents];
  }
  if (cleanSql.includes('FROM NEWS')) {
    return [...jsonStore.news];
  }
  return [];
}

function handleJsonGet(sql, params = []) {
  const cleanSql = sql.trim().toUpperCase();
  if (cleanSql.includes('COUNT(*) AS COUNT FROM INCIDENTS')) {
    return { count: jsonStore.incidents.length };
  }
  if (cleanSql.includes('COUNT(*) AS COUNT FROM NEWS')) {
    return { count: jsonStore.news.length };
  }
  if (cleanSql.includes('FROM EXCEL_FILES WHERE IS_ACTIVE = 1')) {
    return jsonStore.excel_files.find(f => f.is_active === 1) || jsonStore.excel_files[0] || null;
  }
  if (cleanSql.includes('FROM EXCEL_FILES WHERE ID =')) {
    return jsonStore.excel_files.find(f => f.id == params[0]) || null;
  }
  if (cleanSql.includes('FROM INCIDENTS WHERE ID =')) {
    return jsonStore.incidents.find(i => i.id == params[0]) || null;
  }
  if (cleanSql.includes('FROM NEWS WHERE ID =')) {
    return jsonStore.news.find(n => n.id == params[0]) || null;
  }
  return null;
}

export async function initDatabase() {
  await dbRun(`
    CREATE TABLE IF NOT EXISTS excel_files (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      filename TEXT NOT NULL,
      original_name TEXT NOT NULL,
      file_path TEXT NOT NULL,
      file_size INTEGER NOT NULL,
      uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      is_active INTEGER DEFAULT 0
    )
  `);

  await dbRun(`
    CREATE TABLE IF NOT EXISTS incidents (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      number TEXT,
      category TEXT,
      date_str TEXT,
      location TEXT,
      description TEXT,
      image_path TEXT NOT NULL,
      count INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await dbRun(`
    CREATE TABLE IF NOT EXISTS news (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT,
      description TEXT,
      image_path TEXT NOT NULL,
      start_date TEXT NOT NULL,
      end_date TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Seed default incidents if empty
  const incidentCount = await dbGet(`SELECT COUNT(*) as count FROM incidents`);
  if (!incidentCount || incidentCount.count === 0) {
    console.log('[Database] Seeding sample incident notifications...');
    await dbRun(`
      INSERT INTO incidents (title, number, category, date_str, location, description, image_path, count)
      VALUES 
      (
        'Микротравмы', '7', 'Микротравмы', '09.07.2026 04:49',
        'Поселок Авангард', 'Касательное столкновение.',
        '/samples/incident_7.svg', 5
      ),
      (
        'Статистика происшествий', '4', 'Несчастные случаи', '20.06.2026 03:30',
        'Территория заказчика г. Ангрен', 'При спуске с цистерны автоцементовоза.',
        '/samples/incident_4_fall.svg', 8
      ),
      (
        'ДТП, происшествия, инциденты', '4', 'ДТП, происшествия, инциденты', '19.03.2026 15:10',
        'г. Ахангаран', 'Столкновение на перекрестке.',
        '/samples/incident_7.svg', 12
      )
    `);
  }

  // Seed default news if empty
  const newsCount = await dbGet(`SELECT COUNT(*) as count FROM news`);
  if (!newsCount || newsCount.count === 0) {
    const now = new Date();
    const future = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    await dbRun(`
      INSERT INTO news (title, description, image_path, start_date, end_date)
      VALUES (
        'Важное объявление по безопасности и ПДД',
        'Проводятся инструктажи и проверки соблюдения скоростного режима и правил безопасности на объектах предприятия.',
        '/samples/news_sample.svg',
        '${now.toISOString()}',
        '${future.toISOString()}'
      )
    `);
  }
}

export default sqliteDb;
