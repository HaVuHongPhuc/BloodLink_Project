const TaiKhoanBenhVien = require('../models/TaiKhoanBenhVien');


exports.getHospitalProfile = async (req, res) => {
  try {
    const { maBenhVien } = req.user;
    const hospital = await TaiKhoanBenhVien.findOne({ MaBenhVien: maBenhVien })
      .select('-MatKhau');
    if (!hospital) {
      return res.status(404).json({ message: 'Không tìm thấy bệnh viện' });
    }
    res.json(hospital);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};