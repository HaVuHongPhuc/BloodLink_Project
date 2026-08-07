// api /api/users - hồ sơ và thông tin tài khoản khách hàng
const express = require('express');
const router = express.Router();
const {
  timNguoiHienMauPhuHop,
  capNhatHoSoCaNhan,
  getHoSoCaNhan,
  doiMatKhau
} = require('../controllers/userController');
const authMiddleware = require('../middlewares/authMiddleware');

// uc09: tìm người hiến máu phù hợp (dành cho bệnh viện)
router.get('/tim-nguoi-hien-phu-hop', authMiddleware, timNguoiHienMauPhuHop);

// uc10: cập nhật hồ sơ cá nhân
router.put('/cap-nhat-ho-so', authMiddleware, capNhatHoSoCaNhan);

// lấy thông tin hồ sơ cá nhân theo mã tài khoản truyền trên tham số
router.get('/ho-so/:maTaiKhoan', authMiddleware, getHoSoCaNhan);

// tuyến đường hỗ trợ cho giao diện Cus_Profile lấy thông tin hồ sơ qua token
router.get('/profile', authMiddleware, getHoSoCaNhan);

// tuyến đường hỗ trợ cho giao diện Cus_Profile cập nhật hồ sơ qua token
router.put('/profile', authMiddleware, capNhatHoSoCaNhan);

// đổi mật khẩu
router.put('/doi-mat-khau', authMiddleware, doiMatKhau);

module.exports = router;