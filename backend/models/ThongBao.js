const mongoose = require('mongoose');

const ThongBaoSchema = new mongoose.Schema({
  MaThongBao: {
    type: String,
    required: true,
    unique: true,
    default: () => 'TB' + String(Date.now()).slice(-9)
  },
  MaBenhVien: {
    type: String,
    required: true,
    ref: 'TaiKhoanBenhVien'
  },
  MaTaiKhoan: {
    type: String,
    required: true,
    ref: 'TaiKhoan'
  },
  TenBenhVien: {
    type: String,
    required: true
  },
  NoiDung: {
    type: String,
    required: true,
    trim: true
  },
  NgayGui: {
    type: Date,
    default: Date.now
  },
  TrangThai: {
    type: String,
    enum: ['da gui', 'da xem', 'da dong y', 'da tu choi'],
    default: 'da gui'
  },
  LoaiThongBao: {
    type: String,
    enum: ['yeu cau hien mau', 'thong bao chung'],
    default: 'yeu cau hien mau'
  }
}, {
  timestamps: true,
  collection: 'ThongBao'
});

module.exports = mongoose.model('ThongBao', ThongBaoSchema);