// Note: BM07 - Danh sách bệnh viện hợp tác.
const mongoose = require('mongoose');

const HospitalListSchema = new mongoose.Schema({

  MaBenhVien: { 
    type: String, 
    required: true, 
    unique: true,
    maxlength: 20 
  }, 

  TenBenhVien: { 
    type: String, 
    required: true, 
    maxlength: 50
  }, 

  DiaChiBenhVien: { 
    type: String, 
    required: true, 
    maxlength: 100
  }, 

  TenNguoiLienHe: { 
    type: String, 
    required: true, 
    maxlength: 50
  }, 

  SoDienThoaiLienHe: { 
    type: String, 
    required: true, 
    maxlength: 11
  }, 

  Email: { 
    type: String, 
    required: true, 
    match: [/^\S+@\S+\.\S+$/, 'Email không hợp lệ'],
    maxlength: 50
  }, 

  TrangThai: { 
    type: String, 
    enum: ['Đang hợp tác', 'Ngừng hơp tác','dang hop tac', 'ngung hop tac'], 
    default: 'Đang hợp tác', 
    maxlength: 20
  } 
}, {
  timestamps: true,
  collection: 'BenhVienHopTac'
});

module.exports = mongoose.model('HospitalList', HospitalListSchema);