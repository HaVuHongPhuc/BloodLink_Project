// Note: API /api/urgent-news - quản lý tin khẩn cấp BM05 và BM06.
const express = require("express");
const router = express.Router();

const controller = require("../controllers/urgentNewsController");

router.get("/", controller.getAll);

router.get("/:id", controller.getOne);

// UC14
router.post("/", controller.createUrgentNews);

// UC15
router.put("/:id", controller.updateNews);

// UC16
router.delete("/:id", controller.deleteNews);

module.exports = router;