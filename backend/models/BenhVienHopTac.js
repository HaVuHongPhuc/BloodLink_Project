const mongoose = require('mongoose');

const BenhVienHopTacSchema = new mongoose.Schema({
  MaBenhVien: {
    type: String,
    required: true,
    unique: true,
    ref: 'TaiKhoanBenhVien'
  },
  MaTaiKhoanBenhVien: {
    type: String,
    default: null
  },
  TenBenhVien: {
    type: String,
    required: true
  },
  DiaChiBenhVien: {
    type: String,
    required: true
  },
  TenNguoiLienHe: {
    type: String,
    required: true
  },
  SoDienThoaiLienHe: {
    type: String,
    required: true,
    match: [/^0[0-9]{9,10}$/, 'Số điện thoại không hợp lệ']
  },
  Email: {
    type: String,
    required: true,
    match: [/^\S+@\S+\.\S+$/, 'Email không hợp lệ']
  },
  TrangThai: {
    type: String,
    enum: ['dang hop tac', 'ngung hoat dong'],
    default: 'dang hop tac'
  }
}, {
  timestamps: true,
  collection: 'BenhVienHopTac'
});

module.exports = mongoose.model('BenhVienHopTac', BenhVienHopTacSchema);