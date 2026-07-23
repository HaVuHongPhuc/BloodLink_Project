const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');

// 1. Đọc file .env trước tiên
dotenv.config();

// 2. Import hàm connectDB từ file config/db.js
const connectDB = require('./config/db');

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// 3. Kết nối MongoDB
connectDB();

app.get('/', (req, res) => {
  res.send('API BloodLink đang chạy!');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server đang chạy trên port: ${PORT}`);
});