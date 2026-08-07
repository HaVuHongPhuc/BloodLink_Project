// Note: API /api/users - hồ sơ và thông tin tài khoản khách hàng.
const express = require('express');
const router = express.Router();
const {
  timNguoiHienMauPhuHop,
  capNhatHoSoCaNhan,
  getHoSoCaNhan,
  doiMatKhau
} = require('../controllers/userController');
const authMiddleware = require('../middlewares/authMiddleware');

// UC09: Tìm người hiến máu phù hợp (cho bệnh viện)
router.get('/tim-nguoi-hien-phu-hop', authMiddleware, timNguoiHienMauPhuHop);

// UC10: Cập nhật hồ sơ cá nhân
router.put('/cap-nhat-ho-so', authMiddleware, capNhatHoSoCaNhan);

// Lấy thông tin hồ sơ cá nhân
router.get('/ho-so/:maTaiKhoan', authMiddleware, getHoSoCaNhan);
//Đổi mật khẩu
router.put('/doi-mat-khau', authMiddleware, doiMatKhau);
module.exports = router;