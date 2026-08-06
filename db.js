import sqlite3 from 'sqlite3';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_PATH = path.join(__dirname, 'database.sqlite');

const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) {
    console.error('[Database] Failed to connect to SQLite:', err.message);
  } else {
    console.log('[Database] Connected to SQLite database at', DB_PATH);
  }
});

// Helper for promise-based queries
export function dbRun(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) reject(err);
      else resolve(this);
    });
  });
}

export function dbAll(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
}

export function dbGet(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
}

export async function initDatabase() {
  // 1. Excel files table
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

  // 2. Incidents table
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
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // 3. News table
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

  // Seed default incidents if table is empty
  const incidentCount = await dbGet(`SELECT COUNT(*) as count FROM incidents`);
  if (incidentCount.count === 0) {
    console.log('[Database] Seeding sample incident notifications...');
    await dbRun(`
      INSERT INTO incidents (title, number, category, date_str, location, description, image_path)
      VALUES 
      (
        'ДТП с автоцементовозом',
        '7',
        'Дорожно-транспортное происшествие',
        '09.07.2026 04:49',
        'Поселок Авангард',
        'Касательное столкновение цементовоза с транспортным средством другого участника движения. Пострадавшим оказана помощь.',
        '/samples/incident_7.svg'
      ),
      (
        'Спуск с лестницы цистерны',
        '4',
        'Несчастный случай',
        '20.06.2026 03:30',
        'Территория заказчика г. Ангрен',
        'При спуске с цистерны автоцементовоза водитель потерял равновесие и получил травму руки.',
        '/samples/incident_4_fall.svg'
      ),
      (
        'Столкновение на перекрестке',
        '4',
        'Дорожно-транспортное происшествие',
        '19.03.2026 15:10',
        'г. Ахангаран',
        'Нарушение приоритета проезда перекрестка неравнозначных дорог. Пострадавшие доставлены в мед. учреждение.',
        '/samples/incident_7.svg'
      )
    `);
  }

  // Seed default sample news if empty
  const newsCount = await dbGet(`SELECT COUNT(*) as count FROM news`);
  if (newsCount.count === 0) {
    const now = new Date();
    const future = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days ahead
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

export default db;
