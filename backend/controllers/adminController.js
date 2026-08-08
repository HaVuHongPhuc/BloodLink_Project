const YeuCauDangKyDoiTac = require('../models/YeuCauDangKyDoiTac');
const TaiKhoanBenhVien = require('../models/TaiKhoanBenhVien');
const BenhVienHopTac = require('../models/BenhVienHopTac');
const TaiKhoan = require('../models/TaiKhoan');
const bcrypt = require('bcryptjs');

// UC06: Xác thực tài khoản đối tác
exports.xacThucDoiTac = async (req, res) => {
  try {
    const { maDangKy, action } = req.body;
    
    const yeuCau = await YeuCauDangKyDoiTac.findOne({ MaDangKy: maDangKy });
    if (!yeuCau) {
      return res.status(404).json({ message: 'Không tìm thấy yêu cầu' });
    }
    
    if (yeuCau.TrangThai !== 'cho xac thuc') {
      return res.status(400).json({ message: 'Yêu cầu đã được xử lý' });
    }
    
    if (action === 'duyet') {
      const randomPassword = Math.random().toString(36).slice(-8);
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(randomPassword, salt);
      
      const benhVien = new TaiKhoanBenhVien({
        Email: yeuCau.Email,
        MatKhau: hashedPassword,
        TenBenhVien: yeuCau.TenBenhVien,
        NguoiDaiDien: yeuCau.NguoiDaiDien,
        DiaChiBenhVien: yeuCau.DiaChiBenhVien,
        MaSoThue: yeuCau.MaSoThue,
        SoDienThoaiBenhVien: yeuCau.SoDienThoaiBenhVien,
        TrangThai: 'hoat dong',
        NgayThamGia: new Date()
      });
      await benhVien.save();
      
      const hopTac = new BenhVienHopTac({
        MaBenhVien: benhVien.MaBenhVien,
        TenBenhVien: yeuCau.TenBenhVien,
        DiaChiBenhVien: yeuCau.DiaChiBenhVien,
        TenNguoiLienHe: yeuCau.NguoiDaiDien,
        SoDienThoaiLienHe: yeuCau.SoDienThoaiBenhVien,
        Email: yeuCau.Email,
        TrangThai: 'dang hop tac'
      });
      await hopTac.save();
      
      yeuCau.TrangThai = 'da duyet';
      await yeuCau.save();
      
      res.json({
        message: 'MS03: Đã tạo tài khoản',
        matKhauTamThoi: randomPassword,
        maBenhVien: benhVien.MaBenhVien
      });
      
    } else if (action === 'tu_choi') {
      yeuCau.TrangThai = 'tu choi';
      await yeuCau.save();
      res.json({ message: 'MS04: Đã từ chối yêu cầu' });
    }
    
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// Danh sách yêu cầu chờ xác thực (BM02)
exports.danhSachChoXacThuc = async (req, res) => {
  try {
    const danhSach = await YeuCauDangKyDoiTac.find({ TrangThai: 'cho xac thuc' })
      .sort({ NgayDangKy: -1 });
    res.json(danhSach);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// UC07: Tra cứu danh sách người hiến máu
exports.traCuuNguoiHienMau = async (req, res) => {
  try {
    const { keyword } = req.query;
    
    const query = {
      VaiTro: 'khach hang',
      NgayDangKyHienMauGanNhat: { $ne: null }
    };
    
    if (keyword) {
      query.$or = [
        { HoTen: { $regex: keyword, $options: 'i' } },
        { Email: { $regex: keyword, $options: 'i' } },
        { SoDienThoai: { $regex: keyword, $options: 'i' } }
      ];
    }
    
    const nguoiHien = await TaiKhoan.find(query)
      .select('MaTaiKhoan HoTen NhomMau GioiTinh NgaySinh SoDienThoai DiaChi NgayDangKyHienMauGanNhat NgayHienMauGanNhat LuotHien');
    
    const result = nguoiHien.map(nguoi => {
      const ngayHienGanNhat = nguoi.NgayHienMauGanNhat;
      let trangThai = 'Chưa sẵn sàng';
      if (!ngayHienGanNhat) {
        trangThai = 'Sẵn sàng';
      } else {
        const diffDays = Math.floor((Date.now() - new Date(ngayHienGanNhat)) / (1000 * 60 * 60 * 24));
        trangThai = diffDays >= 84 ? 'Sẵn sàng' : 'Chưa sẵn sàng';
      }
      return { ...nguoi.toObject(), trangThai };
    });
    
    if (result.length === 0) {
      return res.status(404).json({ message: 'MS10: Không tìm thấy kết quả phù hợp' });
    }
    
    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// UC08: Tra cứu danh sách người nhận máu
exports.traCuuNguoiNhanMau = async (req, res) => {
  try {
    const { keyword } = req.query;
    
    const query = {
      VaiTro: 'khach hang',
      NgayDangKyNhanMauGanNhat: { $ne: null }
    };
    
    if (keyword) {
      query.$or = [
        { HoTen: { $regex: keyword, $options: 'i' } },
        { Email: { $regex: keyword, $options: 'i' } },
        { SoDienThoai: { $regex: keyword, $options: 'i' } }
      ];
    }
    
    const nguoiNhan = await TaiKhoan.find(query)
      .select('MaTaiKhoan HoTen NhomMau GioiTinh NgaySinh SoDienThoai DiaChi NgayDangKyNhanMauGanNhat LuotDangKyNhanMau');
    
    if (nguoiNhan.length === 0) {
      return res.status(404).json({ message: 'MS10: Không tìm thấy kết quả phù hợp' });
    }
    
    res.json(nguoiNhan);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};
// Lấy danh sách bệnh viện hợp tác
exports.getAllHospitals = async (req, res) => {
  try {
    const hospitals = await TaiKhoanBenhVien.find()
      .select('MaBenhVien MaTaiKhoanBenhVien TenBenhVien DiaChiBenhVien NguoiDaiDien SoDienThoaiBenhVien Email TrangThai');
    res.json(hospitals);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// Cập nhật bệnh viện hợp tác
exports.updateHospital = async (req, res) => {
  try {
    const { maBenhVien } = req.params;
    const updateData = req.body;
    
    const updated = await BenhVienHopTac.findOneAndUpdate(
      { MaBenhVien: maBenhVien },
      { $set: updateData },
      { new: true, runValidators: true }
    );
    
    if (!updated) {
      return res.status(404).json({ message: 'Không tìm thấy bệnh viện' });
    }
    
    res.json({ message: 'MS10: Cập nhật thành công', data: updated });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// Xóa bệnh viện hợp tác (chỉ khi ngừng hoạt động)
exports.deleteHospital = async (req, res) => {
  try {
    const { maBenhVien } = req.params;
    
    const hospital = await BenhVienHopTac.findOne({ MaBenhVien: maBenhVien });
    if (!hospital) {
      return res.status(404).json({ message: 'Không tìm thấy bệnh viện' });
    }
    
    if (hospital.TrangThai === 'đang hợp tác') {
      return res.status(400).json({ message: 'MS46: Bệnh viện vẫn đang hoạt động, không thể xóa' });
    }
    
    await BenhVienHopTac.findOneAndDelete({ MaBenhVien: maBenhVien });
    res.json({ message: 'MS45: Xóa tài khoản bệnh viện hợp tác thành công' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};