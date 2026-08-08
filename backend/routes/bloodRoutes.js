const express = require('express');
const router = express.Router();
const { 
  registerDonate, 
  registerReceive, 
  getMyOrders, 
  getHospitals, 
  cancelOrder 
} = require('../controllers/bloodController');
const authMiddleware = require('../middlewares/authMiddleware');

// Route lấy danh sách bệnh viện hợp tác
router.get('/hospitals', getHospitals);

// Route lấy danh sách đơn đăng ký của khách hàng
router.get('/my-orders', authMiddleware, getMyOrders);

// Route hủy đơn đăng ký
router.put('/cancel-order/:id', authMiddleware, cancelOrder);

// Route đăng ký hiến / nhận máu
router.post('/register-donate', authMiddleware, registerDonate);
router.post('/register-receive', authMiddleware, registerReceive);

module.exports = router;