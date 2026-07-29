const mongoose = require('mongoose');

const TaiKhoanSchema = new mongoose.Schema({
  MaTaiKhoan: {
    type: String,
    required: true,
    unique: true,
    default: () => 'TK' + String(Date.now()).slice(-9)
  },
  Email: {
    type: String,
    required: true,
    unique: true,
    match: [/^\S+@\S+\.\S+$/, 'Email không hợp lệ']
  },
  MatKhau: {
    type: String,
    required: true
  },
  VaiTro: {
    type: String,
    enum: ['khach hang', 'quan tri he thong'],
    required: true,
    default: 'khach hang'
  },
  NgayThamGia: {
    type: Date,
    default: Date.now
  },
  TrangThai: {
    type: String,
    enum: ['hoat dong', 'khoa', 'cho xac thuc'],
    default: 'hoat dong'
  },
  HoTen: { type: String, default: '' },
  SoDienThoai: { type: String, default: '' },
  DiaChi: { type: String, default: '' },
  NhomMau: { 
    type: String, 
    enum: ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-', ''],
    default: ''
  },
  GioiTinh: { type: String, enum: ['Nam', 'Nu', ''], default: '' },
  NgaySinh: { type: Date },
  SoCCCD: { type: String, default: '' },
  NgayDangKyHienMauGanNhat: { type: Date },
  NgayHienMauGanNhat: { type: Date },
  LuotHien: { type: Number, default: 0 },
  NgayDangKyNhanMauGanNhat: { type: Date },
  LuotDangKyNhanMau: { type: Number, default: 0 }
}, {
  timestamps: true,
  collection: 'TaiKhoan'
});

TaiKhoanSchema.pre('save', function(next) {
  if (!this.MaTaiKhoan) {
    this.MaTaiKhoan = 'TK' + String(Date.now()).slice(-9);
  }
  next();
});

module.exports = mongoose.model('TaiKhoan', TaiKhoanSchema);