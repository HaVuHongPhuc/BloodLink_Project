// backend/models/LichSuNhapXuat.js
const mongoose = require('mongoose');

const lichSuNhapXuatSchema = new mongoose.Schema(
  {
    // Mã lịch sử tự sinh
    MaLichSu: { type: String, required: true, unique: true },

    // Hình thức giao dịch: 'Nhap' (khi hiến) hoặc 'Xuat' (khi nhận)
    HinhThuc: { type: String, required: true, enum: ['Nhap', 'Xuat'] },

    // Thời gian giao dịch (mặc định là lúc tạo)
    ThoiGian: { type: Date, default: Date.now },

    // Số lượng máu giao dịch (thường là 1 đơn vị)
    SoLuong: { type: Number, required: true, default: 1 },

    // Nhóm máu giao dịch
    NhomMau: { type: String, required: true },

    // Các tham chiếu quan trọng
    // 1. Liên kết tới Đơn đăng ký gốc
    MaDon: { type: String, required: true },

    // 2. Liên kết tới Bệnh viện thực hiện giao dịch này
    MaBenhVien: { type: String, required: true },
    MaTaiKhoanBenhVien: { type: String, default: null },

    // 3. (Tùy chọn) Liên kết tới mã túi máu cụ thể trong kho nếu có
    MaMau: { type: String, default: null },
    
    // Tên khách hàng (Hiến hoặc Nhận) để dễ tra cứu nhanh trên bảng
    HoTenKhachHang: { type: String, default: '' },
    
    GhiChu: { type: String, default: '' }
  },
  {
    // Tự động tạo updatedAt và createdAt
    timestamps: true, 
    // Đặt tên collection cụ thể trong MongoDB
    collection: 'LichSuNhapXuat'
  }
);

// Đảm bảo không tạo model đè lên model cũ nếu đã tồn tại
module.exports =
  mongoose.models.LichSuNhapXuat ||
  mongoose.model('LichSuNhapXuat', lichSuNhapXuatSchema);