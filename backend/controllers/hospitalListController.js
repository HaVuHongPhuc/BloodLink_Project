// backend/controllers/hospitalListController.js
const HospitalList = require('../models/HospitalList');

// Lấy danh sách bệnh viện hợp tác (chỉ hiển thị bệnh viện đang hợp tác)
exports.getAll = async (req, res) => {
  try {
    // Chỉ lấy các bệnh viện có TrangThai là "Đang hợp tác" hoặc "dang hop tac"
    const hospitals = await HospitalList.find({
      TrangThai: { $in: ["Đang hợp tác", "dang hop tac", "Đang hoạt động"] }
    });
    res.json(hospitals);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Lấy chi tiết một bệnh viện
exports.getOne = async (req, res) => {
  try {
    const hospital = await HospitalList.findById(req.params.id);
    if (!hospital) return res.status(404).json({ message: 'Không tìm thấy' });
    res.json(hospital);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// Thêm bệnh viện hợp tác
exports.create = async (req, res) => {
  try {
    const newHospital = new HospitalList(req.body);
    await newHospital.save();
    res.status(201).json(newHospital);
  } catch (error) {
    res.status(400).json({ message: 'Lỗi tạo mới', error: error.message });
  }
};

// Cập nhật bệnh viện hợp tác
exports.update = async (req, res) => {
  try {
    const updated = await HospitalList.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!updated) return res.status(404).json({ message: 'Không tìm thấy' });
    res.json(updated);
  } catch (error) {
    res.status(400).json({ message: 'Lỗi cập nhật', error: error.message });
  }
};

// Xóa bệnh viện khỏi danh sách hợp tác
exports.remove = async (req, res) => {
  try {
    const deleted = await HospitalList.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Không tìm thấy' });
    res.json({ message: 'Xóa thành công' });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi xóa', error: error.message });
  }
};