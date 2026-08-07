const HospitalList = require("../models/HospitalList");

// GET: Lấy danh sách tất cả bệnh viện hợp tác
exports.getAll = async (req, res) => {
  try {
    const data = await HospitalList.find();
    res.status(200).json(data);
  } catch (err) {
    console.error("Lỗi getAll:", err.message);
    res.status(500).json({ message: err.message });
  }
};

// GET ID: Lấy chi tiết 1 bệnh viện theo ID
exports.getOne = async (req, res) => {
  try {
    const data = await HospitalList.findById(req.params.id);
    if (!data) {
      return res.status(404).json({ message: "Không tìm thấy bệnh viện." });
    }
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST: Thêm bệnh viện hợp tác mới
exports.create = async (req, res) => {
  try {
    const newHospital = new HospitalList(req.body);
    await newHospital.save();
    res.status(201).json({
      message: "Thêm bệnh viện hợp tác thành công",
      data: newHospital
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PUT: Cập nhật thông tin bệnh viện
exports.update = async (req, res) => {
  try {
    const updated = await HospitalList.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) {
      return res.status(404).json({ message: "Không tìm thấy bệnh viện để cập nhật." });
    }
    res.status(200).json({
      message: "Cập nhật thông tin bệnh viện thành công",
      data: updated
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// DELETE: Xóa bệnh viện
exports.remove = async (req, res) => {
  try {
    const deleted = await HospitalList.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: "Bệnh viện không tồn tại hoặc đã bị xóa." });
    }
    res.status(200).json({ message: "Xóa bệnh viện thành công" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};