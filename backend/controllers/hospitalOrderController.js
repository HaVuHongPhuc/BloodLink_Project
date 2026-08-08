const mongoose = require('mongoose');
const DonDangKy = require('../models/DonDangKy');
const KhoMau = require('../models/KhoMau');
const TaiKhoan = require('../models/TaiKhoan');
const BenhVienHopTac = require('../models/BenhVienHopTac');

// 1. LẤY DỮ LIỆU KHO MÁU CỦA BỆNH VIỆN DẠNG BM21
exports.getHospitalInventory = async (req, res) => {
  try {
    const userEmail = req.user?.Email || req.user?.email;
    const userMaTK = req.user?.MaTaiKhoan || req.user?.maTaiKhoan || req.user?.id;
    const userMaBV = req.user?.MaBenhVien || req.user?.maBenhVien || req.user?.MaTaiKhoanBenhVien;

    // Tìm thông tin Bệnh viện trong bảng BenhVienHopTac
    const hospitalDoc = await BenhVienHopTac.findOne({
      $or: [
        { Email: userEmail },
        { MaBenhVien: userMaBV },
        { MaBenhVien: userMaTK },
        { MaTaiKhoanBenhVien: userMaTK }
      ]
    }).lean();

    const idsToSearch = new Set();
    if (hospitalDoc?.MaBenhVien) idsToSearch.add(hospitalDoc.MaBenhVien);
    if (hospitalDoc?.MaTaiKhoanBenhVien) idsToSearch.add(hospitalDoc.MaTaiKhoanBenhVien);
    if (userMaBV) idsToSearch.add(userMaBV);
    if (userMaTK) idsToSearch.add(userMaTK);

    const finalIds = Array.from(idsToSearch).filter(Boolean);

    // Lấy tất cả các túi máu thuộc mã bệnh viện này
    const inventoryItems = await KhoMau.find({
      MaBenhVien: { $in: finalIds }
    })
      .sort({ createdAt: -1 })
      .lean();

    return res.json({
      success: true,
      data: inventoryItems
    });
  } catch (error) {
    console.error('Lỗi lấy dữ liệu kho máu:', error);
    return res.status(500).json({ success: false, message: 'Lỗi máy chủ', error: error.message });
  }
};

// 2. BR28: LẤY DANH SÁCH ĐƠN ĐĂNG KÝ GỬI TỚI BỆNH VIỆN
exports.getHospitalOrders = async (req, res) => {
  try {
    const userEmail = req.user?.Email || req.user?.email;
    const userMaTK = req.user?.MaTaiKhoan || req.user?.maTaiKhoan || req.user?.id;
    const userMaBV = req.user?.MaBenhVien || req.user?.maBenhVien || req.user?.MaTaiKhoanBenhVien;

    const hospitalDoc = await BenhVienHopTac.findOne({
      $or: [
        { Email: userEmail },
        { MaBenhVien: userMaBV },
        { MaBenhVien: userMaTK },
        { MaTaiKhoanBenhVien: userMaTK }
      ]
    }).lean();

    const idsToSearch = new Set();
    if (hospitalDoc?.MaBenhVien) idsToSearch.add(hospitalDoc.MaBenhVien);
    if (hospitalDoc?.MaTaiKhoanBenhVien) idsToSearch.add(hospitalDoc.MaTaiKhoanBenhVien);
    if (userMaBV) idsToSearch.add(userMaBV);
    if (userMaTK) idsToSearch.add(userMaTK);

    const finalIds = Array.from(idsToSearch).filter(Boolean);

    const orders = await DonDangKy.find({
      $or: [
        { MaBenhVien: { $in: finalIds } },
        { MaTaiKhoanBenhVien: { $in: finalIds } }
      ]
    })
      .sort({ createdAt: -1 })
      .lean();

    return res.json({
      success: true,
      data: orders
    });
  } catch (error) {
    console.error('Lỗi khi lấy danh sách đơn của bệnh viện:', error);
    return res.status(500).json({ success: false, message: 'Lỗi máy chủ', error: error.message });
  }
};

// 3. BR29: BỆNH VIỆN DUYỆT ĐƠN ĐĂNG KÝ
exports.approveOrder = async (req, res) => {
  try {
    const { id } = req.params;

    // Lấy mã bệnh viện từ user đang đăng nhập (đã được xác thực qua middleware)
    const hospitalId = req.user?.maBenhVien || req.user?.MaBenhVien || req.user?.MaTaiKhoanBenhVien;
    if (!hospitalId) {
      return res.status(401).json({ 
        success: false, 
        message: 'Không thể xác định mã bệnh viện từ thông tin đăng nhập của bạn.' 
      });
    }

    const order = await DonDangKy.findById(id);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy đơn đăng ký' });
    }

    // Chỉ cho phép duyệt các đơn đang chờ
    if (order.TrangThai !== 'Cho_Duyet' && order.TrangThai !== 'Cho_Xu_Ly') {
      return res.status(400).json({ success: false, message: 'Đơn này đã được xử lý trước đó.' });
    }

    const now = new Date();

    // ---- XỬ LÝ ĐƠN HIẾN MÁU ----
    if (order.LoaiDon === 'Hien') {
      if (!order.NhomMau || order.NhomMau.trim() === '') {
        return res.status(400).json({
          success: false,
          message: 'Không thể duyệt vì đơn hiến máu chưa có thông tin Nhóm Máu.'
        });
      }

      const hanSuDung = new Date();
      hanSuDung.setDate(now.getDate() + 42); // Máu có hạn sử dụng 42 ngày

      // 1. Tạo và lưu túi máu mới vào KhoMau của bệnh viện đang duyệt
      const newBloodUnit = new KhoMau({
        MaMau: `M${now.getTime().toString().slice(-9)}`,
        NhomMau: order.NhomMau.trim().toUpperCase(),
        SoLuong: 1, // Mặc định mỗi lần hiến là 1 đơn vị
        NgayNhap: now,
        HanSuDung: hanSuDung,
        TrangThai: 'Trong kho',
        MaBenhVien: hospitalId, // Lấy mã từ bệnh viện đang đăng nhập
        MaDon: order.MaDon
      });

      await newBloodUnit.save();

      // 2. Cập nhật profile người hiến máu
      await TaiKhoan.findOneAndUpdate(
        { $or: [{ MaTaiKhoan: order.MaTaiKhoan }, { Email: order.Email }] },
        {
          $inc: { LuotHien: 1 },
          $set: { NgayHienGanNhat: now, NgayDangKyHienMauGanNhat: now }
        }
      );
    }
    // ---- XỬ LÝ ĐƠN NHẬN MÁU ----
    else if (order.LoaiDon === 'Nhan') {
      if (order.NhomMauCan) {
        // Tìm 1 túi máu phù hợp trong kho của bệnh viện này
        const bloodBag = await KhoMau.findOne({
          MaBenhVien: hospitalId, // Chỉ tìm trong kho của bệnh viện đang đăng nhập
          NhomMau: order.NhomMauCan.trim().toUpperCase(),
          TrangThai: 'Trong kho'
        });

        // Nếu có túi máu phù hợp, cập nhật trạng thái
        if (bloodBag) {
          bloodBag.TrangThai = 'Da xuat';
          bloodBag.NgayXuat = now;
          await bloodBag.save();
        }
        // (Tùy chọn) Nếu không có, có thể thêm logic thông báo hoặc xử lý khác
      }
    }

    // Cuối cùng, cập nhật trạng thái đơn đăng ký là hoàn thành
    order.TrangThai = 'Hoan_Thanh';
    await order.save();

    return res.json({ success: true, message: 'Đã duyệt đơn thành công', data: order });
  } catch (error) {
    console.error('Lỗi khi duyệt đơn:', error);
    // Cung cấp thông tin lỗi chi tiết hơn trong môi trường dev
    const errorMessage = process.env.NODE_ENV === 'development' ? error.message : 'Lỗi máy chủ';
    return res.status(500).json({ success: false, message: errorMessage });
  }
};

// 4. BR30: BỆNH VIỆN TỪ CHỐI ĐƠN ĐĂNG KÝ
exports.rejectOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await DonDangKy.findById(id);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy đơn đăng ký' });
    }

    if (order.TrangThai !== 'Cho_Duyet' && order.TrangThai !== 'Cho_Xu_Ly') {
      return res.status(400).json({ success: false, message: 'Đơn này đã được xử lý trước đó.' });
    }

    // Đổi trạng thái đơn đăng ký thành chuẩn 'Tu_Choi'
    order.TrangThai = 'Tu_Choi';
    await order.save();

    return res.json({ success: true, message: 'Đã từ chối đơn thành công', data: order });
  } catch (error) {
    console.error('Lỗi khi từ chối đơn:', error);
    return res.status(500).json({ success: false, message: 'Lỗi máy chủ', error: error.message });
  }
};