const express = require('express');
const router = express.Router();
const { registerDonate, registerReceive } = require('../controllers/bloodController');

// Route Đăng ký hiến máu
router.post('/register-donate', registerDonate);

// Route Đăng ký nhận máu
router.post('/register-receive', registerReceive);

module.exports = router;