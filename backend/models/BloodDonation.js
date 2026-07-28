// Note: BM13 - Đơn đăng ký hiến máu của khách hàng, phục vụ các UC hiến máu.
const mongoose = require('mongoose');

const bloodDonationSchema = new mongoose.Schema(
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
      maxlength: 255,
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
      required: [true, 'Ngày sinh không được để trống'],
      validate: {
        validator: function (v) {
          if (!v) return false;
          const today = new Date();
          let age = today.getFullYear() - v.getFullYear();
          const m = today.getMonth() - v.getMonth();
          if (m < 0 || (m === 0 && today.getDate() < v.getDate())) age--;
          return age >= 18;
        },
        message: 'Người đăng ký hiến máu phải đủ từ 18 tuổi trở lên'
      }
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
      required: [true, 'Nghề nghiệp không được để trống'],
      maxlength: 255
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
      maxlength: 50,
      validate: {
        validator: (v) => /^\S+@\S+\.\S+$/.test(v),
        message: 'Email không đúng định dạng (phải có @ và .)'
      }
    },
    NhomMau: {
      type: String,
      required: true,
      maxlength: 5
    },
    NgayHienGanNhat: {
      type: Date,
      default: null
    },
    UnderlyingMedicalCondition_Optional: {
      type: String,
      maxlength: 255,
      default: ''
    },
    TrangThaiDon: {
      type: String,
      required: true,
      enum: ['Cho_Duyet', 'Da_Duyet', 'Da_Tu_Choi'],
      default: 'Cho_Duyet'
    }
  },
  {
    timestamps: true,
    collection: 'PhieuDangKyHienMau' // Lưu vào Collection PhieuDangKyHienMau
  }
);

module.exports = mongoose.model('BloodDonation', bloodDonationSchema);