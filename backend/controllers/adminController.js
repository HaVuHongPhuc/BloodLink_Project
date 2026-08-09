const YeuCauDangKyDoiTac = require('../models/YeuCauDangKyDoiTac');
const TaiKhoanBenhVien = require('../models/TaiKhoanBenhVien');
const BenhVienHopTac = require('../models/BenhVienHopTac');
const TaiKhoan = require('../models/TaiKhoan');
const DonDangKy = require('../models/DonDangKy');
const bcrypt = require('bcryptjs');

const parseDateFlexible = (value) => {
  if (!value) return null;
  const raw = String(value).trim();

  const dmyMatch = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(raw);
  if (dmyMatch) {
    const day = Number(dmyMatch[1]);
    const month = Number(dmyMatch[2]);
    const year = Number(dmyMatch[3]);
    const parsed = new Date(year, month - 1, day);
    if (
      Number.isNaN(parsed.getTime()) ||
      parsed.getFullYear() !== year ||
      parsed.getMonth() !== month - 1 ||
      parsed.getDate() !== day
    ) {
      return null;
    }
    return parsed;
  }

  const isoMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(raw);
  if (isoMatch) {
    const year = Number(isoMatch[1]);
    const month = Number(isoMatch[2]);
    const day = Number(isoMatch[3]);
    const parsed = new Date(year, month - 1, day);
    if (
      Number.isNaN(parsed.getTime()) ||
      parsed.getFullYear() !== year ||
      parsed.getMonth() !== month - 1 ||
      parsed.getDate() !== day
    ) {
      return null;
    }
    return parsed;
  }

  return null;
};

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
      
      yeuCau.TrangThai = 'da duyet';
      await yeuCau.save();
      
      res.json({
        message: 'Đã tạo tài khoản',
        matKhauTamThoi: randomPassword,
        maBenhVien: benhVien.MaBenhVien
      });
      
    } else if (action === 'tu_choi') {
      yeuCau.TrangThai = 'tu choi';
      await yeuCau.save();
      res.json({ message: 'Đã từ chối yêu cầu' });
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
    const { keyword, startDate, endDate } = req.query;

    const query = {
      LoaiDon: 'Hien'
    };

    const parsedStart = parseDateFlexible(startDate);
    const parsedEnd = parseDateFlexible(endDate);

    if ((startDate && !parsedStart) || (endDate && !parsedEnd)) {
      return res.status(400).json({ message: 'Vui lòng nhập ngày theo định dạng dd/mm/yyyy' });
    }

    if (parsedStart || parsedEnd) {
      query.createdAt = {};
      if (parsedStart) {
        parsedStart.setHours(0, 0, 0, 0);
        query.createdAt.$gte = parsedStart;
      }
      if (parsedEnd) {
        parsedEnd.setHours(23, 59, 59, 999);
        query.createdAt.$lte = parsedEnd;
      }
      if (query.createdAt.$gte && query.createdAt.$lte && query.createdAt.$gte > query.createdAt.$lte) {
        return res.status(400).json({ message: 'Ngày bắt đầu không được lớn hơn ngày kết thúc' });
      }
    }

    if (keyword) {
      query.$or = [
        { HoTen: { $regex: keyword, $options: 'i' } },
        { Email: { $regex: keyword, $options: 'i' } },
        { SoDienThoai: { $regex: keyword, $options: 'i' } },
        { MaDon: { $regex: keyword, $options: 'i' } }
      ];
    }

    const donHien = await DonDangKy.find(query)
      .sort({ createdAt: -1 })
      .lean();

    if (donHien.length === 0) {
      return res.status(404).json({ message: 'MS10: Không tìm thấy kết quả phù hợp' });
    }

    res.json(donHien);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// UC08: Tra cứu danh sách người nhận máu
exports.traCuuNguoiNhanMau = async (req, res) => {
  try {
    const { keyword, startDate, endDate } = req.query;

    const query = {
      LoaiDon: 'Nhan'
    };

    const parsedStart = parseDateFlexible(startDate);
    const parsedEnd = parseDateFlexible(endDate);

    if ((startDate && !parsedStart) || (endDate && !parsedEnd)) {
      return res.status(400).json({ message: 'Vui lòng nhập ngày theo định dạng dd/mm/yyyy' });
    }

    if (parsedStart || parsedEnd) {
      query.createdAt = {};
      if (parsedStart) {
        parsedStart.setHours(0, 0, 0, 0);
        query.createdAt.$gte = parsedStart;
      }
      if (parsedEnd) {
        parsedEnd.setHours(23, 59, 59, 999);
        query.createdAt.$lte = parsedEnd;
      }
      if (query.createdAt.$gte && query.createdAt.$lte && query.createdAt.$gte > query.createdAt.$lte) {
        return res.status(400).json({ message: 'Ngày bắt đầu không được lớn hơn ngày kết thúc' });
      }
    }

    if (keyword) {
      query.$or = [
        { HoTen: { $regex: keyword, $options: 'i' } },
        { Email: { $regex: keyword, $options: 'i' } },
        { SoDienThoai: { $regex: keyword, $options: 'i' } },
        { MaDon: { $regex: keyword, $options: 'i' } }
      ];
    }

    const nguoiNhan = await DonDangKy.find(query)
      .sort({ createdAt: -1 })
      .lean();

    if (nguoiNhan.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy kết quả phù hợp' });
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
    const hospitals = await BenhVienHopTac.find()
      .select('MaBenhVien TenBenhVien DiaChiBenhVien TenNguoiLienHe SoDienThoaiLienHe Email TrangThai');
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
    
    res.json({ message: 'Cập nhật thành công', data: updated });
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
    
    if (hospital.TrangThai === 'dang hop tac') {
      return res.status(400).json({ message: 'Bệnh viện vẫn đang hoạt động, không thể xóa' });
    }
    
    await BenhVienHopTac.findOneAndDelete({ MaBenhVien: maBenhVien });
    res.json({ message: 'Xóa tài khoản bệnh viện hợp tác thành công' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};