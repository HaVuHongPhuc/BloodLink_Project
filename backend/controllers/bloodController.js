const mongoose = require('mongoose');
const DonDangKy = require('../models/DonDangKy');
const TaiKhoan = require('../models/TaiKhoan');
const BenhVienHopTac = require('../models/BenhVienHopTac');
const UrgentNews = require('../models/UrgentNews');
const { applyUrgentNewsDonationRegistration } = require('../utils/urgentNewsUtils');

const waitForDb = async () => {
  if (mongoose.connection.readyState === 1) return true;
  await mongoose.connection.asPromise();
  return mongoose.connection.readyState === 1;
};

const getUserAccount = async (req, fallbackEmail) => {
  const tokenMaTaiKhoan = req.user?.maTaiKhoan || req.user?.MaTaiKhoan || req.user?.id;
  const email = fallbackEmail || req.user?.Email || req.user?.email;

  return TaiKhoan.findOne({
    $or: [
      { MaTaiKhoan: tokenMaTaiKhoan },
      { Email: email },
      { Email: fallbackEmail }
    ]
  });
};

const getHospitalIdentifier = (req, body = {}) => {
  return body.MaTaiKhoanBenhVien || body.maTaiKhoanBenhVien || body.MaBenhVien || body.maBenhVien || req.user?.maTaiKhoanBenhVien || req.user?.MaTaiKhoanBenhVien || req.user?.maBenhVien || req.user?.MaBenhVien || null;
};

// Lấy danh sách bệnh viện hợp tác đang hoạt động
exports.getHospitals = async (req, res) => {
  try {
    const hospitals = await BenhVienHopTac.find({ TrangThai: { $in: ['dang hop tac', 'Đang hoạt động', 'Đang hợp tác'] } }).lean();
    return res.json({ success: true, data: hospitals });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Lỗi lấy danh sách bệnh viện', error: error.message });
  }
};

// Lấy danh sách đơn đăng ký của tài khoản cá nhân
exports.getMyOrders = async (req, res) => {
  try {
    const tokenMaTaiKhoan = req.user?.maTaiKhoan || req.user?.MaTaiKhoan || req.user?.id;
    const email = req.user?.Email || req.user?.email;

    const orders = await DonDangKy.find({
      $or: [
        { MaTaiKhoan: tokenMaTaiKhoan },
        { Email: email }
      ]
    }).sort({ createdAt: -1 }).lean();

    return res.json({ success: true, data: orders });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Lỗi lấy danh sách đơn đăng ký', error: error.message });
  }
};

// BỔ SUNG: Hủy đơn đăng ký của khách hàng
exports.cancelOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const tokenMaTaiKhoan = req.user?.maTaiKhoan || req.user?.MaTaiKhoan || req.user?.id;
    const email = req.user?.Email || req.user?.email;

    const don = await DonDangKy.findOne({
      _id: id,
      $or: [
        { MaTaiKhoan: tokenMaTaiKhoan },
        { Email: email }
      ]
    });

    if (!don) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy đơn đăng ký' });
    }

    if (don.TrangThai !== 'Cho_Duyet' && don.TrangThai !== 'Cho_Xu_Ly') {
      return res.status(400).json({ success: false, message: 'Đơn đăng ký không thể hủy ở trạng thái hiện tại' });
    }

    don.TrangThai = 'Da_Huy';
    await don.save();

    if (don.LoaiDon === 'Hien') {
      try {
        const query = don.MaTaiKhoan ? { MaTaiKhoan: don.MaTaiKhoan } : { Email: don.Email };
        const otherPendingDonation = await DonDangKy.findOne({
          ...query,
          LoaiDon: 'Hien',
          TrangThai: { $in: ['Cho_Duyet', 'Cho_Xu_Ly'] },
          _id: { $ne: don._id }
        });

        if (!otherPendingDonation) {
          await TaiKhoan.findOneAndUpdate(query, {
            $unset: {
              NgayHienGanNhat: 1,
              NgayDangKyHienMauGanNhat: 1
            }
          });
        }
      } catch (updateError) {
        console.error('Lỗi khi cập nhật lại ngày hiến máu sau khi hủy đơn:', updateError);
      }
    }

    return res.json({
      success: true,
      message: 'Đã hủy đơn đăng ký'
    });
  } catch (error) {
    console.error('Lỗi khi hủy đơn đăng ký:', error);
    return res.status(500).json({ success: false, message: 'Lỗi máy chủ', error: error.message });
  }
};

// Đăng ký hiến máu
exports.registerDonate = async (req, res) => {
  try {
    const {
      MaDon,
      HoTen,
      GioiTinh,
      NgaySinh,
      SoCCCD,
      SoDienThoai,
      Email,
      DiaChi,
      NhomMau,
      NgayHienGanNhat,
      BenhNen
    } = req.body;

    const userDoc = await getUserAccount(req, Email);
    const autoMaTaiKhoan = userDoc ? userDoc.MaTaiKhoan : req.user?.maTaiKhoan || req.user?.MaTaiKhoan || req.user?.id;
    const hospitalId = getHospitalIdentifier(req, req.body);

    if (!autoMaTaiKhoan) {
      return res.status(400).json({ success: false, message: 'Không tìm thấy Mã tài khoản trong cơ sở dữ liệu' });
    }

    if (!hospitalId) {
      return res.status(400).json({ success: false, message: 'Vui lòng chọn Bệnh viện tiếp nhận' });
    }

        const now = new Date();
    const autoMaDon = MaDon || `D${now.getTime().toString().slice(-9)}`;
    // Ưu tiên ngày hiến máu gần nhất từ DB, nếu không có thì lấy từ form
    const sourceDate = userDoc?.NgayHienGanNhat || NgayHienGanNhat;
    const ngayHienFormat = sourceDate ? new Date(sourceDate) : null;

    const dbReady = await waitForDb();
    if (!dbReady) {
      return res.status(503).json({ success: false, message: 'Database chưa sẵn sàng' });
    }

    const donMoi = new DonDangKy({
      MaDon: autoMaDon,
      LoaiDon: 'Hien',
      MaTaiKhoan: autoMaTaiKhoan,
      MaBenhVien: hospitalId,
      MaTaiKhoanBenhVien: hospitalId,
      HoTen,
      GioiTinh: GioiTinh || 'Nam',
      NgaySinh: NgaySinh || null,
      SoDienThoai,
      Email: Email || req.user?.Email || req.user?.email,
      DiaChi: DiaChi || '',
      SoCCCD,
      NhomMau: NhomMau || '',
      NgayHienGanNhat: ngayHienFormat,
      BenhNen: BenhNen || 'Không có bệnh nền',
      TrangThai: 'Cho_Duyet'
    });

    await donMoi.save();

    if (req.body.urgentNewsId) {
      try {
        const urgentNews = await UrgentNews.findById(req.body.urgentNewsId);
        if (urgentNews && urgentNews.TrangThai === 'Đang hiển thị') {
          const updatedNews = applyUrgentNewsDonationRegistration(urgentNews, 1);
          urgentNews.SoLuongDaNhan = updatedNews.SoLuongDaNhan;
          urgentNews.TrangThai = updatedNews.TrangThai;
          await urgentNews.save();
        }
      } catch (urgentNewsError) {
        console.error('Lỗi khi cập nhật tin khẩn cấp sau đăng ký hiến máu:', urgentNewsError);
      }
    }

    const taiKhoanUpdate = {
      NgayDangKyHienMauGanNhat: now,
    };

    // Chỉ cập nhật ngày hiến máu gần nhất vào tài khoản nếu trong DB chưa có
    if (!userDoc?.NgayHienGanNhat && ngayHienFormat) {
      taiKhoanUpdate.NgayHienGanNhat = ngayHienFormat;
    }

    await TaiKhoan.findOneAndUpdate(
      { MaTaiKhoan: autoMaTaiKhoan },
      { $set: taiKhoanUpdate }
    );

    return res.status(201).json({
      success: true,
      message: 'Đã đăng ký đơn thành công',
      data: donMoi
    });
  } catch (error) {
    console.error('Lỗi khi lưu đơn đăng ký hiến máu:', error);
    return res.status(500).json({ message: 'Lỗi máy chủ', error: error.message });
  }
};

// Đăng ký nhận máu
exports.registerReceive = async (req, res) => {
  try {
    const {
      MaDon,
      HoTen,
      GioiTinh,
      NgaySinh,
      SoCCCD,
      SoDienThoai,
      Email,
      DiaChi,
      NhomMauCan,
      SoLuong,
      MucDich,
      NoiNhanMau
    } = req.body;

    const userDoc = await getUserAccount(req, Email);
    const autoMaTaiKhoan = userDoc ? userDoc.MaTaiKhoan : req.user?.maTaiKhoan || req.user?.MaTaiKhoan || req.user?.id;
    const hospitalId = getHospitalIdentifier(req, req.body);

    if (!autoMaTaiKhoan) {
      return res.status(400).json({ success: false, message: 'Không tìm thấy Mã tài khoản trong cơ sở dữ liệu' });
    }

    if (!hospitalId) {
      return res.status(400).json({ success: false, message: 'Vui lòng chọn nơi nhận máu' });
    }

    if (!NhomMauCan || !NhomMauCan.trim()) {
      return res.status(400).json({ success: false, message: 'Vui lòng chọn nhóm máu cần' });
    }

    if (!MucDich || !MucDich.trim()) {
      return res.status(400).json({ success: false, message: 'Vui lòng điền mục đích nhận máu' });
    }

    if (!NoiNhanMau || !NoiNhanMau.trim()) {
      return res.status(400).json({ success: false, message: 'Vui lòng chọn nơi nhận máu' });
    }

    const soLuongValue = Number(SoLuong);
    if (!soLuongValue || soLuongValue <= 0) {
      return res.status(400).json({ success: false, message: 'Vui lòng nhập số lượng máu cần' });
    }

    const now = new Date();
    const autoMaDon = MaDon || `R${now.getTime().toString().slice(-9)}`;

    const dbReady = await waitForDb();
    if (!dbReady) {
      return res.status(503).json({ success: false, message: 'Database chưa sẵn sàng' });
    }

    const donMoi = new DonDangKy({
      MaDon: autoMaDon,
      LoaiDon: 'Nhan',
      MaTaiKhoan: autoMaTaiKhoan,
      MaBenhVien: hospitalId,
      MaTaiKhoanBenhVien: hospitalId,
      HoTen,
      GioiTinh: GioiTinh || 'Nam',
      NgaySinh: NgaySinh || null,
      SoDienThoai,
      Email: Email || req.user?.Email || req.user?.email,
      DiaChi: DiaChi || '',
      SoCCCD,
      NhomMauCan: NhomMauCan.trim(),
      SoLuong: soLuongValue,
      MucDich: MucDich.trim(),
      NoiNhanMau: NoiNhanMau.trim() || '',
      TrangThai: 'Cho_Duyet'
    });

    await donMoi.save();

    await TaiKhoan.findOneAndUpdate(
      { MaTaiKhoan: autoMaTaiKhoan },
      {
        $set: {
          NgayDangKyNhanMauGanNhat: now,
          LuotDangKyNhanMau: (userDoc?.LuotDangKyNhanMau || 0) + 1
        }
      }
    );

    return res.status(201).json({
      success: true,
      message: 'Đã đăng ký đơn nhận máu thành công',
      data: donMoi
    });
  } catch (error) {
    console.error('Lỗi khi lưu đơn đăng ký nhận máu:', error);
    return res.status(500).json({ message: 'Lỗi máy chủ', error: error.message });
  }
};