const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database.db');

db.serialize(() => {
  console.log('Files:');
  db.all('SELECT id, filename, originalname, size, uploaddate FROM files ORDER BY id DESC', [], (err, rows) => {
    if (err) { console.error(err); return; }
    console.log(rows);
  });

  console.log('\nNotifications:');
  db.all('SELECT id, message, timestamp FROM notifications ORDER BY id DESC', [], (err, rows) => {
    if (err) { console.error(err); return; }
    console.log(rows);
    db.close();
  });
});
