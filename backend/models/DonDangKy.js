// định nghĩa cấu trúc bảng DonDangKy khớp chính xác với mongodb
const mongoose = require('mongoose');

const donDangKySchema = new mongoose.Schema(
  {
    MaDon: { type: String, unique: true, required: true },
    LoaiDon: { type: String, required: true, default: 'Hien' }, // 'Hien' hoặc 'Nhan'
    MaTaiKhoan: { type: String, default: null },
    MaBenhVien: { type: String, default: null },
    MaTaiKhoanBenhVien: { type: String, default: null },
    HoTen: { type: String, required: true },
    GioiTinh: { type: String, default: 'Nam' },
    NgaySinh: { type: Date, default: null },
    SoDienThoai: { type: String, required: true },
    Email: { type: String, required: true },
    DiaChi: { type: String, default: '' },
    SoCCCD: { type: String, required: true },
    NhomMau: { type: String, default: '' },
    NgayHienGanNhat: { type: Date, default: null },
    BenhNen: { type: String, default: 'Không có bệnh nền' },
    MaTinDangKy: { type: String, default: null },
    TrangThai: { type: String, default: 'Cho_Duyet' },
    
    // các trường dành riêng cho đơn nhận máu
    NhomMauCan: { type: String, default: null },
    SoLuong: { type: Number, default: null },
    MucDich: { type: String, default: null },
    NoiNhanMau: { type: String, default: null }
  },
  {
    timestamps: true,
    collection: 'DonDangKy'
  }
);

const DonDangKy = mongoose.models.DonDangKy || mongoose.model('DonDangKy', donDangKySchema, 'DonDangKy');

module.exports = DonDangKy;