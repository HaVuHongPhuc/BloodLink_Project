// Note: BM12 - Tài khoản khách hàng; dùng cho UC01, UC02, UC17, UC18.
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    MaTaiKhoan: { type: String, unique: true },
    Email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    MatKhau: { type: String, required: true, select: false },
    VaiTro: { type: String, default: 'khach hang' },
    NgayThamGia: { type: Date, default: Date.now },
    TrangThai: { type: String, default: 'hoat dong' }, // Mặc định hoạt động
    
    // Các trường thông tin cá nhân (Ban đầu để trống, cập nhật sau trong Profile)
    HoTen: { type: String, default: '' },
    SoDienThoai: { type: String, default: '' },
    DiaChi: { type: String, default: '' },
    NhomMau: { type: String, default: '' },
    GioiTinh: { type: String, default: 'Nam' },
    NgaySinh: { type: Date, default: null },
    SoCCCD: { type: String, default: '' },
    
    // Các trường thống kê hiến / nhận máu
    NgayDangKyHienMauGanNhat: { type: Date, default: null },
    NgayHienGanNhat: { type: Date, default: null },
    LuotHien: { type: Number, default: 0 },
    NgayDangKyNhanMauGanNhat: { type: Date, default: null },
    LuotDangKyNhanMau: { type: Number, default: 0 }
  },
  { collection: 'TaiKhoan' }
);

module.exports = mongoose.model('User', userSchema, 'TaiKhoan');
