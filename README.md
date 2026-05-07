# 📁 DocDash — Document Management Dashboard

A full-stack Document Management Dashboard built with Node.js, Express, SQLite, and vanilla HTML/CSS/JS.

---

## Features

- 📤 Upload single or multiple PDF files
- 📊 Real-time progress bar for each file individually
- 🔔 Smart notifications for bulk uploads (more than 3 files)
- 📡 Real-time notifications using Server-Sent Events (SSE)
- 🗄️ Persistent notification center with unread badge
- ✅ Mark notifications as read individually or all at once
- 📋 Document list with name, size, upload date and download option
- 💾 All data stored in SQLite database

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | HTML, CSS, JavaScript |
| Backend | Node.js + Express |
| Database | SQLite |
| File Storage | Local disk (uploads folder) |
| Real-time | Server-Sent Events (SSE) |

---

## Database Schema

### files table
| Column | Type | Description |
|--------|------|-------------|
| id | INTEGER | Primary key |
| filename | TEXT | Saved filename on disk |
| originalname | TEXT | Original uploaded filename |
| size | INTEGER | File size in bytes |
| uploaddate | TEXT | Upload timestamp |
| status | TEXT | Upload status |

### notifications table
| Column | Type | Description |
|--------|------|-------------|
| id | INTEGER | Primary key |
| message | TEXT | Notification message |
| type | TEXT | success / error / info |
| timestamp | TEXT | When notification was created |
| isread | INTEGER | 0 = unread, 1 = read |

---

## How to Run Locally

### 1. Clone the repository
```bash
git clone https://github.com/vardhann27/document-dashboard.git
cd document-dashboard
```

### 2. Install dependencies
```bash
npm install
```

### 3. Create uploads folder
```bash
mkdir uploads
```

### 4. Start the server
```bash
node server.js
```

### 5. Open in browser
http://localhost:3000

---

## How to Use

1. Click **Choose Files** or drag and drop PDF files into the upload zone
2. Watch the **progress bar** fill up for each file
3. If you upload more than 3 files at once — a **toast notification** appears
4. Once upload completes — files appear in the **Uploaded Documents** table
5. Click the **🔔 bell icon** to see all notifications
6. Click **⬇ Download** to download any uploaded file

---

## Project Structure

document-dashboard/
├── public/
│   ├── index.html      # Main UI
│   ├── style.css       # Styling
│   └── app.js          # Frontend logic
├── uploads/            # Uploaded PDFs stored here
├── database.js         # SQLite database setup
├── server.js           # Express backend
├── package.json
└── README.md