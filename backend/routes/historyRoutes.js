const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const historyController = require('../controllers/historyController');

// Đường dẫn API lấy lịch sử nhập xuất máu của bệnh viện
router.get('/', authMiddleware, historyController.getBloodHistory);

module.exports = router;