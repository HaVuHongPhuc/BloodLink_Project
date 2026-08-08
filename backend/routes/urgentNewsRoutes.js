const express = require("express");
const router = express.Router();
const controller = require("../controllers/urgentNewsController");

// 1. GET: Lấy tất cả tin khẩn cấp (Hàm getAll)
router.get("/", controller.getAll);

// 2. GET: Lấy 1 tin khẩn cấp theo ID (Hàm getOne)
router.get("/:id", controller.getOne);

// 3. POST: Đăng tin khẩn cấp (Hàm createUrgentNews)
router.post("/", controller.createUrgentNews);

// 4. PUT: Cập nhật tin khẩn cấp (Hàm updateNews)
router.put("/:id", controller.updateNews);

// 5. DELETE: Xóa (ẩn) tin khẩn cấp (Hàm deleteNews)
router.delete("/:id", controller.deleteNews);

module.exports = router;