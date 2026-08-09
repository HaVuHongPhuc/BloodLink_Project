const mongoose = require('mongoose');

const TaiKhoanBenhVienSchema = new mongoose.Schema({
  MaBenhVien: {
    type: String,
    required: true,
    unique: true,
    default: () => 'BV' + String(Date.now()).slice(-9)
  },
  MaTaiKhoanBenhVien: {
    type: String,
    unique: true,
    sparse: true,
    default: () => 'TKBV' + String(Date.now()).slice(-9)
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

TaiKhoanBenhVienSchema.pre('save', function() {
  if (!this.MaBenhVien) {
    this.MaBenhVien = 'BV' + String(Date.now()).slice(-9);
  }
  if (!this.MaTaiKhoanBenhVien) {
    this.MaTaiKhoanBenhVien = 'TKBV' + String(Date.now()).slice(-9);
  }
  if (!this.NgayThamGia && this.TrangThai === 'hoat dong') {
    this.NgayThamGia = new Date();
  }
});

module.exports = mongoose.model('TaiKhoanBenhVien', TaiKhoanBenhVienSchema);