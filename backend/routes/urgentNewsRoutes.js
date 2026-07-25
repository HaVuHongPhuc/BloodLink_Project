// Note: API /api/urgent-news - quản lý tin khẩn cấp BM05 và BM06.
const express = require('express');
const controller = require('../controllers/urgentNewsController');
const router = express.Router();

router.use(controller.notImplemented);

module.exports = router;