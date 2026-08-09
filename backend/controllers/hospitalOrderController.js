const mongoose = require('mongoose');
const DonDangKy = require('../models/DonDangKy');
const KhoMau = require('../models/KhoMau');
const TaiKhoan = require('../models/TaiKhoan');
const BenhVienHopTac = require('../models/BenhVienHopTac');
const LichSuNhapXuat = require('../models/LichSuNhapXuat');

// Lấy danh sách đơn đăng ký của bệnh viện
exports.getHospitalOrders = async (req, res) => {
  try {
    const userEmail = req.user?.Email || req.user?.email;
    const userMaTK = req.user?.maTaiKhoan || req.user?.MaTaiKhoan || req.user?.id;
    const userMaBV = req.user?.MaBenhVien || req.user?.maBenhVien || req.user?.MaTaiKhoanBenhVien;

    const hospitalDoc = await BenhVienHopTac.findOne({
      $or: [
        { Email: userEmail },
        { MaBenhVien: userMaBV },
        { MaTaiKhoanBenhVien: userMaBV },
        { MaBenhVien: userMaTK },
        { MaTaiKhoanBenhVien: userMaTK }
      ]
    }).lean();

    const idsToSearch = new Set();
    if (hospitalDoc?.MaBenhVien) idsToSearch.add(hospitalDoc.MaBenhVien);
    if (hospitalDoc?.MaTaiKhoanBenhVien) idsToSearch.add(hospitalDoc.MaTaiKhoanBenhVien);
    if (userMaBV) idsToSearch.add(userMaBV);
    if (userMaTK) idsToSearch.add(userMaTK);

    const accountDoc = await TaiKhoan.findOne({
      $or: [{ Email: userEmail }, { MaTaiKhoan: userMaTK }]
    }).lean();

    if (accountDoc?.MaBenhVien) idsToSearch.add(accountDoc.MaBenhVien);
    if (accountDoc?.MaTaiKhoanBenhVien) idsToSearch.add(accountDoc.MaTaiKhoanBenhVien);

    const finalIds = Array.from(idsToSearch).filter(Boolean);

    if (finalIds.length === 0) {
      return res.status(401).json({ success: false, message: 'Không thể xác định bệnh viện từ thông tin đăng nhập.' });
    }

    const orders = await DonDangKy.find({
      $or: [{ MaBenhVien: { $in: finalIds } }, { MaTaiKhoanBenhVien: { $in: finalIds } }]
    })
      .sort({ createdAt: -1 })
      .lean();

    return res.json({ success: true, data: orders });
  } catch (error) {
    console.error('Lỗi lấy danh sách đơn của bệnh viện:', error);
    return res.status(500).json({ success: false, message: 'Lỗi máy chủ', error: error.message });
  }
};

// 3. BR29: BỆNH VIỆN DUYỆT ĐƠN ĐĂNG KÝ
exports.approveOrder = async (req, res) => {
  // >>> ĐÃ XÓA: Bắt đầu một Transaction <<<

  try {
    const { id } = req.params;

    const hospitalId = req.user?.maBenhVien || req.user?.MaBenhVien || req.user?.MaTaiKhoanBenhVien;
    if (!hospitalId) {
      return res.status(401).json({ 
        success: false, 
        message: 'Không thể xác định mã bệnh viện từ thông tin đăng nhập của bạn.' 
      });
    }

    // >>> ĐÃ XÓA: .session(session) <<<
    const order = await DonDangKy.findById(id); 

    if (!order) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy đơn đăng ký' });
    }

    if (order.TrangThai !== 'Cho_Duyet' && order.TrangThai !== 'Cho_Xu_Ly') {
      return res.status(400).json({ success: false, message: 'Đơn này đã được xử lý trước đó.' });
    }

    const now = new Date();
    let bloodBagInfo = null;

    if (order.LoaiDon === 'Hien') {
      if (!order.NhomMau || order.NhomMau.trim() === '') {
        return res.status(400).json({
          success: false,
          message: 'Không thể duyệt vì đơn hiến máu chưa có thông tin Nhóm Máu.'
        });
      }

      const nhomMauChuan = order.NhomMau.trim().toUpperCase();
      const autoMaMau = `M${now.getTime().toString().slice(-9)}`;
      const hanSuDung = new Date();
      hanSuDung.setDate(now.getDate() + 42);

      const newBloodUnit = new KhoMau({
        MaMau: autoMaMau,
        NhomMau: nhomMauChuan,
        SoLuong: 1, 
        NgayNhap: now,
        HanSuDung: hanSuDung,
        TrangThai: 'Trong kho',
        MaBenhVien: hospitalId, 
        MaDon: order.MaDon
      });

      // >>> ĐÃ XÓA: { session } <<<
      await newBloodUnit.save(); 

      await TaiKhoan.findOneAndUpdate(
        { $or: [{ MaTaiKhoan: order.MaTaiKhoan }, { Email: order.Email }] },
        {
          $inc: { LuotHien: 1 },
          $set: { NgayHienGanNhat: now, NgayDangKyHienMauGanNhat: now }
        },
        // >>> ĐÃ XÓA: { session } <<<
      );

      bloodBagInfo = {
        MaMau: autoMaMau,
        NhomMau: nhomMauChuan,
        HinhThuc: 'Nhap'
      };
    }
    else if (order.LoaiDon === 'Nhan') {
      if (!order.NhomMauCan || order.NhomMauCan.trim() === '') {
          return res.status(400).json({ success: false, message: 'Đơn nhận máu thiếu thông tin nhóm máu cần.' });
      }

      const nhomMauCanChuan = order.NhomMauCan.trim().toUpperCase();

      // >>> ĐÃ XÓA: .session(session) <<<
      const bloodBag = await KhoMau.findOne({
        MaBenhVien: hospitalId, 
        NhomMau: nhomMauCanChuan,
        TrangThai: 'Trong kho'
      }); 

      if (!bloodBag) {
        return res.status(400).json({ 
            success: false, 
            message: `Trong kho hiện tại không còn túi máu nào thuộc nhóm ${nhomMauCanChuan} để xuất.` 
        });
      }

      bloodBag.TrangThai = 'Da xuat';
      bloodBag.NgayXuat = now;
      // >>> ĐÃ XÓA: { session } <<<
      await bloodBag.save(); 

      bloodBagInfo = {
        MaMau: bloodBag.MaMau,
        NhomMau: nhomMauCanChuan,
        HinhThuc: 'Xuat'
      };
    }

    if (bloodBagInfo) {
      const rawHistoryCode = order.MaDon ? `${order.MaDon}-${now.getTime().toString().slice(-6)}` : now.getTime().toString().slice(-12);
      const autoMaLS = `LS${rawHistoryCode}`;
      const newHistory = new LichSuNhapXuat({
        MaLichSu: autoMaLS,
        MaMau: bloodBagInfo.MaMau,
        NhomMau: bloodBagInfo.NhomMau,
        SoLuong: 1,
        HinhThuc: bloodBagInfo.HinhThuc,
        ThoiGian: now,
        MaDon: order.MaDon,
        MaBenhVien: hospitalId,
        MaTaiKhoanBenhVien: hospitalId,
        HoTenKhachHang: order.HoTen || '',
        GhiChu: order.LoaiDon === 'Hien' ? 'Nhập máu từ đơn hiến máu' : 'Xuất máu cho đơn nhận máu'
      });
      
      console.log('Attempting to save history entry:', newHistory);
      await newHistory.save();
      console.log('Successfully saved history entry.');
    }

    order.TrangThai = 'Hoan_Thanh';
    // >>> ĐÃ XÓA: { session } <<<
    await order.save(); 

    // >>> ĐÃ XÓA: Hoàn tất Transaction <<<

    return res.json({ success: true, message: 'Đã duyệt đơn và ghi lịch sử thành công', data: order });
  } catch (error) {
    // >>> ĐÃ XÓA: huỷ bỏ Transaction <<<

    console.error('Lỗi khi duyệt đơn:', error);
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