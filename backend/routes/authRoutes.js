// Note: API /api/auth - các endpoint xác thực và duyệt tài khoản.
const express = require('express');
const router = express.Router();
const {
  dangKyDoiTac,
  dangNhapDoiTac,
  dangNhapKhachHang,
  dangKyKhachHang,
  dangXuat
} = require('../controllers/authController');

// UC01: Đăng ký tài khoản đối tác
router.post('/dang-ky-doi-tac', dangKyDoiTac);

// UC02: Đăng nhập tài khoản đối tác
router.post('/dang-nhap-doi-tac', dangNhapDoiTac);

// UC03: Đăng nhập tài khoản khách hàng
router.post('/dang-nhap-khach-hang', dangNhapKhachHang);

// UC04: Đăng ký tài khoản khách hàng
router.post('/dang-ky-khach-hang', dangKyKhachHang);

// UC05: Đăng xuất tài khoản
router.post('/dang-xuat', dangXuat);

module.exports = router;