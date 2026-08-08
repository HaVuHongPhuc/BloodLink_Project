const express = require('express');
const router = express.Router();
const { getHospitalInventory } = require('../controllers/inventoryController');
const authMiddleware = require('../middlewares/authMiddleware');

// Route lấy kho máu của bệnh viện đang đăng nhập
router.get('/my-inventory', authMiddleware, getHospitalInventory);

module.exports = router;