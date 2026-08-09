// Note: API /api/admin - các endpoint dành cho quản trị hệ thống.
const express = require('express');
const router = express.Router();
const {
  xacThucDoiTac,
  danhSachChoXacThuc,
  traCuuNguoiHienMau,
  traCuuNguoiNhanMau,
  getAllHospitals, 
  updateHospital,
  deleteHospital,
} = require('../controllers/adminController');
const authMiddleware = require('../middlewares/authMiddleware');

// UC06: Xác thực tài khoản đối tác (chỉ admin)
router.put('/xac-thuc-doi-tac', authMiddleware, xacThucDoiTac);

// Danh sách chờ xác thực (BM02) - (chỉ admin)
router.get('/danh-sach-cho-xac-thuc', authMiddleware, danhSachChoXacThuc);

// UC07: Tra cứu người hiến máu (chỉ admin)
router.get('/tra-cuu-nguoi-hien', authMiddleware, traCuuNguoiHienMau);

// UC08: Tra cứu người nhận máu (chỉ admin)
router.get('/tra-cuu-nguoi-nhan', authMiddleware, traCuuNguoiNhanMau);
router.get('/hospitals', authMiddleware, getAllHospitals);
router.put('/hospitals/:maBenhVien', authMiddleware, updateHospital);
router.delete('/hospitals/:maBenhVien', authMiddleware, deleteHospital);
router.get('/all-hospitals', authMiddleware, getAllHospitals);
module.exports = router;