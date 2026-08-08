const KhoMau = require('../models/KhoMau');
const BenhVienHopTac = require('../models/BenhVienHopTac');
const TaiKhoan = require('../models/TaiKhoan');

// Lấy danh sách kho máu riêng của bệnh viện đang đăng nhập
exports.getHospitalInventory = async (req, res) => {
  try {
    const userEmail = req.user?.Email || req.user?.email;
    const userMaTK = req.user?.MaTaiKhoan || req.user?.maTaiKhoan || req.user?.id;
    const userMaBV = req.user?.MaBenhVien || req.user?.maBenhVien || req.user?.MaTaiKhoanBenhVien;

    // 1. Tìm thông tin Bệnh viện trong bảng BenhVienHopTac theo Email hoặc Mã
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

    // Tìm thêm trong TaiKhoan nếu có liên kết
    const accountDoc = await TaiKhoan.findOne({
      $or: [{ Email: userEmail }, { MaTaiKhoan: userMaTK }]
    }).lean();

    if (accountDoc) {
      if (accountDoc.MaBenhVien) idsToSearch.add(accountDoc.MaBenhVien);
      if (accountDoc.MaTaiKhoanBenhVien) idsToSearch.add(accountDoc.MaTaiKhoanBenhVien);
    }

    const finalIds = Array.from(idsToSearch).filter(Boolean);

    // 2. Truy vấn tất cả túi máu khớp với các Mã Bệnh Viện tìm được (bao gồm BV215855527)
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