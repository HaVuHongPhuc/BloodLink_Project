const express = require('express');
const router = express.Router();
const { getHospitalProfile } = require('../controllers/hospitalController');
const authMiddleware = require('../middlewares/authMiddleware');

// Lấy thông tin bệnh viện của token hiện tại
router.get('/profile', authMiddleware, getHospitalProfile);

module.exports = router;