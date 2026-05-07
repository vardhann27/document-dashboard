const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./database.db');

db.serialize(() => {
  // Table to store uploaded file info
  db.run(`
    CREATE TABLE IF NOT EXISTS files (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      filename TEXT NOT NULL,
      originalname TEXT NOT NULL,
      size INTEGER NOT NULL,
      uploaddate TEXT NOT NULL,
      status TEXT DEFAULT 'complete'
    )
  `);

  // Table to store notifications
  db.run(`
    CREATE TABLE IF NOT EXISTS notifications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      message TEXT NOT NULL,
      type TEXT DEFAULT 'success',
      timestamp TEXT NOT NULL,
      isread INTEGER DEFAULT 0
    )
  `);
});

module.exports = db;