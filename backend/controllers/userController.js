// chứa các hàm quản lý thông tin người dùng và tìm kiếm
const TaiKhoan = require('../models/TaiKhoan');
const bcrypt = require('bcryptjs');

// UC09: tìm kiếm người hiến máu phù hợp
const timNguoiHienMauPhuHop = async (req, res) => {
  try {
    const { nhomMau, location } = req.query;
    
    let query = {
      VaiTro: 'khach hang',
      NgayDangKyHienMauGanNhat: { $ne: null }
    };
    
    if (nhomMau) {
      query.NhomMau = nhomMau;
    }
    
    if (location) {
      query.DiaChi = { $regex: location, $options: 'i' };
    }
    
    const nguoiHien = await TaiKhoan.find(query)
      .select('MaTaiKhoan HoTen NhomMau GioiTinh NgaySinh SoDienThoai DiaChi NgayDangKyHienMauGanNhat NgayHienMauGanNhat LuotHien');
    
    const ketQua = nguoiHien.filter(nguoi => {
      const ngayHienGanNhat = nguoi.NgayHienMauGanNhat;
      if (!ngayHienGanNhat) return true;
      const diffDays = Math.floor((Date.now() - new Date(ngayHienGanNhat)) / (1000 * 60 * 60 * 24));
      return diffDays >= 84;
    });
    
    if (ketQua.length === 0) {
      return res.status(404).json({ message: 'MS10: Không tìm thấy kết quả phù hợp' });
    }
    
    res.json(ketQua);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// UC10: cập nhật hồ sơ cá nhân
const capNhatHoSoCaNhan = async (req, res) => {
  try {
    // lấy mã tài khoản từ token xác thực hoặc từ body
    const maTaiKhoan = req.user?.maTaiKhoan || req.body.maTaiKhoan;
    
    const khachHang = await TaiKhoan.findOne({ MaTaiKhoan: maTaiKhoan });
    if (!khachHang) {
      return res.status(404).json({ message: 'Không tìm thấy tài khoản' });
    }
    
    // hỗ trợ cả tên trường tiếng việt và tiếng anh từ frontend
    const updateData = {
      HoTen: req.body.HoTen !== undefined ? req.body.HoTen : req.body.fullName,
      SoDienThoai: req.body.SoDienThoai !== undefined ? req.body.SoDienThoai : req.body.phone,
      DiaChi: req.body.DiaChi !== undefined ? req.body.DiaChi : req.body.address,
      NhomMau: req.body.NhomMau !== undefined ? req.body.NhomMau : req.body.bloodType,
      GioiTinh: req.body.GioiTinh !== undefined ? req.body.GioiTinh : req.body.gender,
      NgaySinh: req.body.NgaySinh !== undefined ? req.body.NgaySinh : req.body.dob,
      SoCCCD: req.body.SoCCCD !== undefined ? req.body.SoCCCD : req.body.cccd
    };

    // loại bỏ các trường undefined
    Object.keys(updateData).forEach(key => updateData[key] === undefined && delete updateData[key]);
    
    const updated = await TaiKhoan.findOneAndUpdate(
      { MaTaiKhoan: maTaiKhoan },
      { $set: updateData },
      { new: true, runValidators: true }
    ).select('-MatKhau');
    
    res.json({
      message: 'MS20: Cập nhật thành công',
      data: updated,
      user: updated
    });
  } catch (error) {
    res.status(400).json({ message: 'MS02: Vui lòng nhập đúng trường dữ liệu', error: error.message });
  }
};

// lấy thông tin hồ sơ cá nhân
const getHoSoCaNhan = async (req, res) => {
  try {
    // lấy mã tài khoản từ params hoặc từ token xác thực
    const maTaiKhoan = req.params.maTaiKhoan || req.user?.maTaiKhoan;
    const khachHang = await TaiKhoan.findOne({ MaTaiKhoan: maTaiKhoan }).select('-MatKhau');
    if (!khachHang) {
      return res.status(404).json({ message: 'Không tìm thấy hồ sơ' });
    }
    res.json({ success: true, data: khachHang, ...khachHang.toObject() });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// đổi mật khẩu
const doiMatKhau = async (req, res) => {
  try {
    const maTaiKhoan = req.user?.maTaiKhoan || req.body.maTaiKhoan;
    const { matKhauCu, matKhauMoi } = req.body;
    
    const khachHang = await TaiKhoan.findOne({ MaTaiKhoan: maTaiKhoan }).select('+MatKhau');
    if (!khachHang) {
      return res.status(404).json({ message: 'Không tìm thấy tài khoản' });
    }
    
    const isMatch = await bcrypt.compare(matKhauCu, khachHang.MatKhau);
    if (!isMatch) {
      return res.status(401).json({ message: 'MS22: Vui lòng kiểm tra lại mật khẩu cũ' });
    }
    
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(matKhauMoi, salt);
    
    await TaiKhoan.findOneAndUpdate(
      { MaTaiKhoan: maTaiKhoan },
      { $set: { MatKhau: hashedPassword } }
    );
    
    res.json({ message: 'MS21: Đã đổi mật khẩu thành công' });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

module.exports = {
  timNguoiHienMauPhuHop,
  capNhatHoSoCaNhan,
  getHoSoCaNhan,
  doiMatKhau,
  getProfile: getHoSoCaNhan,
  updateProfile: capNhatHoSoCaNhan
};