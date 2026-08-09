// Note: BM05, BM06 - Tin đăng khẩn cấp của bệnh viện và lịch sử cập nhật tin.
const mongoose = require('mongoose');

const UrgentNewsSchema = new mongoose.Schema(
  {
     MaTin: {
        type: String,
        required: true,
        unique: true,
        maxlength: 10
    },

    MaBenhVien: {
        type: String,
        required: true,
      maxlength: 20
    },

    TenBenhVien: { 
      type: String,
      required: true, 
      maxlength: 255
    },

    SoDienThoaiBenhVien: { 
      type: String,
      required: true,
      maxlength: 15
    },

    Email: { 
      type: String,
      required: true,
      match: [/^\S+@\S+\.\S+$/, 'Email không hợp lệ'],
      maxlength: 255
    },

    NhomMau: { 
      type: String,
      required: true,
      enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
      maxlength: 5
    },

    SoLuong: { 
      type: Number,
      required: true,
    },

    MucDich: { 
      type: String,
      required: true,
      maxlength: 200
    },

    NgayDang: { 
      type: Date,
      required: true
    },

    GioDang: { 
      type: String,
      required: true
    },

    SoLuongDaNhan: {
        type: Number,
        required: true,
        default: 0,
    },
    
    TrangThai: { 
      type: String,
      required: true,
      enum: ['Đang hiển thị', 'Đã ẩn'],
      default: 'Đang hiển thị',
      maxlength: 20
    },
    
  },{ 
    timestamps: true,
    collection:"TinKhanCap" }
);

module.exports = mongoose.model('UrgentNews', UrgentNewsSchema);