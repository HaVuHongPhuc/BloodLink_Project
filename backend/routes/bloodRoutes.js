// Note: API /api/blood - các endpoint hiến, nhận, tồn kho và thống kê máu.
const express = require('express');
const controller = require('../controllers/bloodController');
const router = express.Router();

router.use(controller.notImplemented);

module.exports = router;