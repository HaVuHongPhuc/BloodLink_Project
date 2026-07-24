// Note: API /api/auth - các endpoint xác thực và duyệt tài khoản.
const express = require('express');
const controller = require('../controllers/authController');
const router = express.Router();

router.post('/register', controller.register);
router.post('/login', controller.login);
router.patch('/hospitals/:id/approve', controller.approveHospital);

module.exports = router;