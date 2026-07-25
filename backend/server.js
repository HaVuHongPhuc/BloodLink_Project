const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');

// 1. Đọc file .env trước tiên
dotenv.config();

// 2. Import hàm connectDB từ file config/db.js
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const bloodRoutes = require('./routes/bloodRoutes');
const urgentNewsRoutes = require('./routes/urgentNewsRoutes');
const adminRoutes = require('./routes/adminRoutes');
const errorHandler = require('./middlewares/errorHandler');

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// 3. Kết nối MongoDB
connectDB();

app.get('/', (req, res) => {
  res.send('API BloodLink đang chạy!');
});

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/blood', bloodRoutes);
app.use('/api/urgent-news', urgentNewsRoutes);
app.use('/api/admin', adminRoutes);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server đang chạy trên port: ${PORT}`);
});