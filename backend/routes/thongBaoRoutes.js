const express = require('express');
const router = express.Router();
const {
  guiThongBao,
  xemThongBao,
  phanHoiThongBao,
  getThongBaoBenhVien
} = require('../controllers/thongBaoController');
const authMiddleware = require('../middlewares/authMiddleware');

// UC09: Gửi thông báo (bệnh viện)
router.post('/gui', authMiddleware, guiThongBao);

// UC10: Xem thông báo của khách hàng
router.get('/khach-hang/:maTaiKhoan', authMiddleware, xemThongBao);

// UC11: Phản hồi thông báo
router.put('/phan-hoi', authMiddleware, phanHoiThongBao);

// Lấy thông báo của bệnh viện
router.get('/benh-vien/:maBenhVien', authMiddleware, getThongBaoBenhVien);

module.exports = router;