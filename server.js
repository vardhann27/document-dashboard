const express = require('express');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const db = require('./database');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// SSE clients list
let clients = [];

// SSE endpoint - frontend connects here for real-time notifications
app.get('/events', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  clients.push(res);

  req.on('close', () => {
    clients = clients.filter(c => c !== res);
  });
});

// Send notification to all connected clients
function sendNotification(notification) {
  clients.forEach(client => {
    client.write(`data: ${JSON.stringify(notification)}\n\n`);
  });
}

// Multer storage config - saves files to /uploads folder
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, 'uploads')),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});

const upload = multer({ storage });

// Upload endpoint
app.post('/upload', upload.array('files'), (req, res) => {
  const files = req.files;
  const uploaddate = new Date().toISOString();

  files.forEach(file => {
    db.run(
      `INSERT INTO files (filename, originalname, size, uploaddate, status) VALUES (?, ?, ?, ?, ?)`,
      [file.filename, file.originalname, file.size, uploaddate, 'complete']
    );
  });

  // If more than 3 files, save a notification
  if (files.length > 3) {
    const message = `${files.length} files uploaded successfully`;
    const timestamp = new Date().toISOString();

    db.run(
      `INSERT INTO notifications (message, type, timestamp, isread) VALUES (?, ?, ?, ?)`,
      [message, 'success', timestamp, 0],
      function () {
        const notification = { id: this.lastID, message, type: 'success', timestamp, isread: 0 };
        sendNotification(notification);
      }
    );
  }

  res.json({ success: true, count: files.length });
});

// Get all files
app.get('/files', (req, res) => {
  db.all(`SELECT * FROM files ORDER BY uploaddate DESC`, [], (err, rows) => {
    res.json(rows || []);
  });
});

// Get all notifications
app.get('/notifications', (req, res) => {
  db.all(`SELECT * FROM notifications ORDER BY timestamp DESC`, [], (err, rows) => {
    res.json(rows || []);
  });
});

// Mark all notifications as read
app.put('/notifications/read-all', (req, res) => {
  db.run(`UPDATE notifications SET isread = 1`, [], () => {
    res.json({ success: true });
  });
});

// Mark one notification as read
app.put('/notifications/:id/read', (req, res) => {
  db.run(`UPDATE notifications SET isread = 1 WHERE id = ?`, [req.params.id], () => {
    res.json({ success: true });
  });
});


// Download a file
app.get('/download/:filename', (req, res) => {
  const filepath = path.join(__dirname, 'uploads', req.params.filename);
  res.download(filepath);
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${3000}`);
});