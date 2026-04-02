# 🚀 CSV Background Processing System (Backend)

A scalable backend system to upload and process CSV files asynchronously using Bull Queue and Redis.

---

## 📌 Features

- Upload CSV file via API
- Background processing using Bull Queue
- Redis-backed job management
- Row-by-row streaming (memory efficient)
- Data validation using Zod
- Bulk insert into database (MongoDB)
- Job status tracking
- Error logging per row

---

## 🏗️ Architecture

Client → Express API → Bull Queue → Worker → MongoDB

- File uploaded via Multer
- Job added to Bull queue
- Worker processes CSV asynchronously
- Job status tracked via API

---

## 🛠️ Tech Stack

- Node.js
- Express.js
- Bull.js
- Redis
- Multer
- csv-parser
- MongoDB
- Zod

---

## ⚙️ Installation

```bash
git clone <backend-repo-url>
cd backend
npm install
