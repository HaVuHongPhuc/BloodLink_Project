const mongoose = require('mongoose');

const TaiKhoanBenhVienSchema = new mongoose.Schema({
  MaBenhVien: {
    type: String,
    required: true,
    unique: true,
    default: () => 'BV' + String(Date.now()).slice(-9)
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
  NgayDangKy: {
    type: Date,
    default: Date.now
  },
  NgayThamGia: { type: Date },
  TrangThai: {
    type: String,
    enum: ['cho duyet', 'hoat dong', 'tam khoa'],
    default: 'cho duyet'
  }
}, {
  timestamps: true,
  collection: 'TaiKhoanBenhVien'
});

TaiKhoanBenhVienSchema.pre('save', function(next) {
  if (!this.MaBenhVien) {
    this.MaBenhVien = 'BV' + String(Date.now()).slice(-9);
  }
  if (!this.NgayThamGia && this.TrangThai === 'hoat dong') {
    this.NgayThamGia = new Date();
  }
  next();
});

module.exports = mongoose.model('TaiKhoanBenhVien', TaiKhoanBenhVienSchema);