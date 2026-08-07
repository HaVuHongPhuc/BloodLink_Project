const TaiKhoan = require('../models/TaiKhoan');
const bcrypt = require('bcryptjs');

// UC09: Tìm kiếm người hiến máu phù hợp
exports.timNguoiHienMauPhuHop = async (req, res) => {
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

// UC10: Cập nhật hồ sơ cá nhân
exports.capNhatHoSoCaNhan = async (req, res) => {
  try {
    const { maTaiKhoan, ...updateData } = req.body;
    
    const khachHang = await TaiKhoan.findOne({ MaTaiKhoan: maTaiKhoan });
    if (!khachHang) {
      return res.status(404).json({ message: 'Không tìm thấy tài khoản' });
    }
    
    delete updateData.MatKhau;
    delete updateData.VaiTro;
    delete updateData.MaTaiKhoan;
    delete updateData.Email;
    
    const updated = await TaiKhoan.findOneAndUpdate(
      { MaTaiKhoan: maTaiKhoan },
      { $set: updateData },
      { new: true, runValidators: true }
    );
    
    res.json({
      message: 'MS20: Cập nhật thành công',
      user: updated
    });
  } catch (error) {
    res.status(400).json({ message: 'MS02: Vui lòng nhập đúng trường dữ liệu', error: error.message });
  }
};

// Lấy thông tin hồ sơ cá nhân
exports.getHoSoCaNhan = async (req, res) => {
  try {
    const { maTaiKhoan } = req.params;
    const khachHang = await TaiKhoan.findOne({ MaTaiKhoan: maTaiKhoan }).select('-MatKhau');
    if (!khachHang) {
      return res.status(404).json({ message: 'Không tìm thấy hồ sơ' });
    }
    res.json(khachHang);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// Đổi mật khẩu
exports.doiMatKhau = async (req, res) => {
  try {
    const { maTaiKhoan, matKhauCu, matKhauMoi } = req.body;
    
    const khachHang = await TaiKhoan.findOne({ MaTaiKhoan: maTaiKhoan });
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