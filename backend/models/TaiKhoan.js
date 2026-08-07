const mongoose = require('mongoose');

const taiKhoanSchema = new mongoose.Schema(
  {
    MaTaiKhoan: { type: String, unique: true },
    Email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    MatKhau: { type: String, required: true, select: false },
    VaiTro: { type: String, default: 'khach hang' },
    NgayThamGia: { type: Date, default: Date.now },
    TrangThai: { type: String, default: 'hoat dong' },
    
    HoTen: { type: String, default: '' },
    SoDienThoai: { type: String, default: '' },
    DiaChi: { type: String, default: '' },
    NhomMau: { type: String, default: '' },
    GioiTinh: { type: String, default: 'Nam' },
    NgaySinh: { type: Date, default: null },
    SoCCCD: { type: String, default: '' },
    
    NgayDangKyHienMauGanNhat: { type: Date, default: null },
    NgayHienGanNhat: { type: Date, default: null },
    LuotHien: { type: Number, default: 0 },
    NgayDangKyNhanMauGanNhat: { type: Date, default: null },
    LuotDangKyNhanMau: { type: Number, default: 0 }
  },
  { 
    timestamps: true,
    collection: 'TaiKhoan'
  }
);

module.exports = mongoose.models.TaiKhoan || mongoose.model('TaiKhoan', taiKhoanSchema, 'TaiKhoan');