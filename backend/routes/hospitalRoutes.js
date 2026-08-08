const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');

// Import trực tiếp từ hospitalOrderController
const {
  getHospitalInventory,
  getHospitalOrders,
  approveOrder,
  rejectOrder
} = require('../controllers/hospitalOrderController');

const { getHospitalProfile } = require('../controllers/hospitalController');

// Route Lấy thông tin Bệnh viện
router.get('/profile', authMiddleware, getHospitalProfile);

// Route Kho máu (BM21)
router.get('/inventory', authMiddleware, getHospitalInventory);

// Route Danh sách đơn đăng ký (UC26)
router.get('/orders', authMiddleware, getHospitalOrders);

// Route Duyệt & Từ chối đơn
router.put('/orders/:id/approve', authMiddleware, approveOrder);
router.put('/orders/:id/reject', authMiddleware, rejectOrder);

module.exports = router;