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
    required: true,
    maxlength: 255
  },
  NguoiDaiDien: {
    type: String,
    required: true,
    maxlength: 255
  },
  DiaChiBenhVien: {
    type: String,
    required: true,
    maxlength: 255
  },
  MaSoThue: {
    type: String,
    required: true,
    unique: true,
    maxlength: 255
  },
  SoDienThoaiBenhVien: {
    type: String,
    required: true,
    maxlength: 15,
    match: [/^0[0-9]{9,14}$/, 'Số điện thoại không hợp lệ']
  },
  Email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Email không hợp lệ']
  },
  MatKhau: {
    type: String,
    required: true
  },
  GhiChu: { type: String, default: '', maxlength: 300 },
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

YeuCauDangKyDoiTacSchema.pre('save', function() {
  if (!this.MaDangKy) {
    this.MaDangKy = 'DK' + String(Date.now()).slice(-9);
  }
});

module.exports = mongoose.model('YeuCauDangKyDoiTac', YeuCauDangKyDoiTacSchema);