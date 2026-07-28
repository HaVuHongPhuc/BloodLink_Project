const mongoose = require('mongoose');

const YeuCauDangKyDoiTacSchema = new mongoose.Schema({
  MaDangKy: {
    type: String,
    required: true,
    unique: true,
    default: () => 'DK' + String(Date.now()).slice(-9)
  },
  TenBenhVien: {
    type: String,
    required: true
  },
  NguoiDaiDien: {
    type: String,
    required: true
  },
  DiaChiBenhVien: {
    type: String,
    required: true
  },
  MaSoThue: {
    type: String,
    required: true,
    unique: true
  },
  SoDienThoaiBenhVien: {
    type: String,
    required: true,
    match: [/^0[0-9]{9,10}$/, 'Số điện thoại không hợp lệ']
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
  GhiChu: { type: String, default: '' },
  NgayDangKy: {
    type: Date,
    default: Date.now
  },
  TrangThai: {
    type: String,
    enum: ['cho xac thuc', 'da duyet', 'tu choi'],
    default: 'cho xac thuc'
  }
}, {
  timestamps: true,
  collection: 'YeuCauDangKyDoiTac'
});

YeuCauDangKyDoiTacSchema.pre('save', function(next) {
  if (!this.MaDangKy) {
    this.MaDangKy = 'DK' + String(Date.now()).slice(-9);
  }
  next();
});

module.exports = mongoose.model('YeuCauDangKyDoiTac', YeuCauDangKyDoiTacSchema);