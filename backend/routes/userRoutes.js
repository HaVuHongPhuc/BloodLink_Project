// Note: API /api/users - hồ sơ và thông tin tài khoản khách hàng.
const express = require('express');
const controller = require('../controllers/userController');
const router = express.Router();

router.patch('/profile', controller.updateProfile);
router.patch('/password', controller.changePassword);

module.exports = router;