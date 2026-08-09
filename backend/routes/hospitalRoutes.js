// backend/routes/hospitalRoutes.js
const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');

// Khuyên dùng: Middleware bọc lỗi bất đồng bộ (tránh crash server)
// Nếu chưa có file này, hãy xem hướng dẫn tạo ở mục 2 dưới đây.
// Nếu không muốn dùng, bạn có thể xóa dòng này và xóa asyncHandler(...) ở dưới.
const asyncHandler = require('../middlewares/asyncHandler'); 

// --- IMPORT CONTROLLERS ---

// 1. Kiểm tra kỹ đường dẫn file này có đúng không
const hospitalOrderController = require('../controllers/hospitalOrderController');

// 2. Kiểm tra kỹ đường dẫn file này có đúng không
const hospitalController = require('../controllers/hospitalController');
const inventoryController = require('../controllers/inventoryController');


// --- ĐỊNH NGHĨA ROUTES ---

// Route Lấy thông tin Bệnh viện
router.get(
    '/profile', 
    authMiddleware, 
    asyncHandler(hospitalController.getHospitalProfile)
);

// Route Kho máu (BM21)
router.get(
    '/inventory', 
    authMiddleware, 
    asyncHandler(inventoryController.getHospitalInventory)
);

// Route Danh sách đơn đăng ký (UC26)
router.get(
    '/orders', 
    authMiddleware, 
    asyncHandler(hospitalOrderController.getHospitalOrders)
);

// Route Duyệt đơn
router.put(
    '/orders/:id/approve', 
    authMiddleware, 
    asyncHandler(hospitalOrderController.approveOrder)
);

// Route Từ chối đơn
router.put(
    '/orders/:id/reject', 
    authMiddleware, 
    asyncHandler(hospitalOrderController.rejectOrder)
);

module.exports = router;