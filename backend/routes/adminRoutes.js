// Note: API /api/admin - các endpoint dành cho quản trị hệ thống.
const express = require('express');
const controller = require('../controllers/adminController');
const router = express.Router();

router.use(controller.notImplemented);

module.exports = router;