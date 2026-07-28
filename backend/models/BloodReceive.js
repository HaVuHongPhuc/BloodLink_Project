// Note: BM14 - Đơn đăng ký nhận máu, liên kết bệnh viện, người nhận và nhóm máu.
const mongoose = require('mongoose');

const bloodReceiveSchema = new mongoose.Schema(
  {
    maDon: {
      type: String,
      required: [true, 'Mã đơn không được để trống'],
      unique: true,
      maxlength: 10
    },
    HovaTen: {
      type: String,
      required: [true, 'Họ và tên không được để trống'],
      maxlength: 100,
      validate: {
        validator: (v) => !/\d/.test(v),
        message: 'Họ tên chỉ chứa ký tự chữ, không chứa số'
      }
    },
    GioiTinh: {
      type: String,
      required: true,
      enum: ['Nam', 'Nu']
    },
    DayofBirth: {
      type: Date,
      required: [true, 'Ngày sinh không được để trống']
    },
    CCCDorPASSPORT: {
      type: String,
      required: [true, 'Số CCCD/Passport là bắt buộc'],
      validate: {
        validator: (v) => /^([0-9]{12}|[A-Za-z0-9]{9})$/.test(v),
        message: 'CCCD phải đúng 12 chữ số hoặc Hộ chiếu 9 ký tự'
      }
    },
    NgheNghiep: {
      type: String,
      maxlength: 255,
      default: ''
    },
    addressOnCCCD: {
      type: String,
      required: [true, 'Địa chỉ trên CCCD không được để trống'],
      maxlength: 255
    },
    CurrentResidence: {
      type: String,
      required: [true, 'Địa chỉ hiện tại không được để trống'],
      maxlength: 255
    },
    PhoneNumber: {
      type: String,
      required: [true, 'Số điện thoại không được để trống'],
      maxlength: 15,
      validate: {
        validator: (v) => /^0[0-9]{9}$/.test(v),
        message: 'Số điện thoại phải bắt đầu bằng số 0 và đúng 10 chữ số'
      }
    },
    Email: {
      type: String,
      required: [true, 'Email không được để trống'],
      maxlength: 255,
      validate: {
        validator: (v) => /^\S+@\S+\.\S+$/.test(v),
        message: 'Email không đúng định dạng (phải có @ và .)'
      }
    },
    NhomMau: {
      type: String,
      required: [true, 'Nhóm máu chỉ định là bắt buộc'],
      enum: ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'],
      maxlength: 5
    },
    UnderlyingMedicalCondition_Optional: {
      type: String,
      required: [true, 'Vui lòng ghi rõ bệnh lý hoặc lý do y khoa cần truyền máu'],
      maxlength: 255
    },
    Status: {
      type: String,
      required: true,
      enum: ['Cho_Xu_Ly', 'Da_Cap_Phat', 'Tu_Choi'],
      default: 'Cho_Xu_Ly'
    }
  },
  {
    timestamps: true,
    collection: 'PhieuDangKyNhanMau'
  }
);

module.exports = mongoose.model('BloodReceive', bloodReceiveSchema);