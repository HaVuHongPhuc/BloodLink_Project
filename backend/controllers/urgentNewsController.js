// Note: UC05 - UC10 - đăng, sửa, xóa và lọc tin khẩn cấp.
const UrgentNews = require("../models/UrgentNews");
const TaiKhoanBenhVien = require("../models/TaiKhoanBenhVien");
const { applyUrgentNewsDonationRegistration } = require("../utils/urgentNewsUtils");

const resolveHospitalProfile = async (req) => {
  const hospitalId = req.user?.maBenhVien || req.user?.MaBenhVien || req.user?.maTaiKhoanBenhVien || req.user?.MaTaiKhoanBenhVien;

  if (!hospitalId) return null;

  return TaiKhoanBenhVien.findOne({
    $or: [
      { MaBenhVien: hospitalId },
      { MaTaiKhoanBenhVien: hospitalId }
    ]
  }).lean();
};

// 1. GET: Lấy danh sách tin khẩn cấp (Tự động ẩn tin đạt đủ máu hoặc đã đăng đủ 3 ngày)
exports.getAll = async (req, res) => {
  try {
    const today = new Date();
    const threeDaysAgo = new Date(today);
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

    const hospitalList = await TaiKhoanBenhVien.find({}, { MaBenhVien: 1, TenBenhVien: 1, _id: 0 }).lean();
    const hospitalMap = new Map(
      hospitalList.map((hospital) => [String(hospital.MaBenhVien || '').toUpperCase(), String(hospital.TenBenhVien || '').trim()])
    );

    const allNews = await UrgentNews.find({}, { MaTin: 1, MaBenhVien: 1, TenBenhVien: 1 }).lean();
    const invalidNewsIds = allNews
      .filter((news) => {
        const code = String(news.MaBenhVien || '').toUpperCase();
        const hospitalName = hospitalMap.get(code);
        if (!hospitalName) return true;
        return String(news.TenBenhVien || '').trim() !== hospitalName;
      })
      .map((news) => news._id);

    if (invalidNewsIds.length > 0) {
      await UrgentNews.deleteMany({ _id: { $in: invalidNewsIds } });
    }

    // Tự động chuyển trạng thái sang "Đã ẩn" nếu ĐÃ ĐẠT ĐỦ SỐ LƯỢNG MÁU
    await UrgentNews.updateMany(
      {
        TrangThai: "Đang hiển thị",
        $expr: { $gte: ["$SoLuongDaNhan", "$SoLuong"] }
      },
      { $set: { TrangThai: "Đã ẩn" } }
    );

    // Tự động chuyển trạng thái sang "Đã ẩn" nếu ĐÃ ĐĂNG ĐỦ 3 NGÀY
    await UrgentNews.updateMany(
      {
        TrangThai: "Đang hiển thị",
        NgayDang: { $lte: threeDaysAgo }
      },
      { $set: { TrangThai: "Đã ẩn" } }
    );

    // Lấy tất cả tin khẩn cấp đang ở trạng thái "Đang hiển thị"
    const data = await UrgentNews.find({ TrangThai: "Đang hiển thị" }).sort({ createdAt: -1 });
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ message: err.message || "Lỗi hệ thống" });
  }
};

// 2. GET ID: Lấy 1 tin khẩn cấp theo ID 
exports.getOne = async (req, res) => {
  try {
    const data = await UrgentNews.findById(req.params.id);
    if (!data) {
      return res.status(404).json({
        message: "Không tìm thấy tin khẩn cấp"
      });
    }
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ message: err.message || "Lỗi hệ thống" });
  }
};

// 3. POST: Đăng tin khẩn cấp (UC17 / UC14)
exports.createUrgentNews = async (req, res) => {
  try {
    const hospitalProfile = await resolveHospitalProfile(req);
    const MaBenhVien = req.body.MaBenhVien || hospitalProfile?.MaBenhVien;
    const TenBenhVien = req.body.TenBenhVien || hospitalProfile?.TenBenhVien;
    const SoDienThoaiBenhVien = req.body.SoDienThoaiBenhVien || hospitalProfile?.SoDienThoaiBenhVien;
    const Email = req.body.Email || hospitalProfile?.Email;
    const { NhomMau, SoLuong, MucDich } = req.body;

    const emailRegex = /^\S+@\S+\.\S+$/;
    const allowedBloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

    if (!MaBenhVien) {
      return res.status(400).json({ message: 'Thiếu mã bệnh viện' });
    }

    if (MaBenhVien.length > 20) {
      return res.status(400).json({ message: 'Mã bệnh viện không được vượt quá 20 ký tự' });
    }

    if (!TenBenhVien || !TenBenhVien.trim()) {
      return res.status(400).json({ message: 'Thiếu tên bệnh viện' });
    }

    if (TenBenhVien.length > 255) {
      return res.status(400).json({ message: 'Tên bệnh viện không được vượt quá 255 ký tự' });
    }

    if (!SoDienThoaiBenhVien || !SoDienThoaiBenhVien.trim()) {
      return res.status(400).json({ message: 'Thiếu số điện thoại bệnh viện' });
    }

    if (SoDienThoaiBenhVien.length < 10 || SoDienThoaiBenhVien.length > 15) {
      return res.status(400).json({ message: 'Số điện thoại bệnh viện phải có độ dài từ 10 đến 15 chữ số' });
    }

    if (!Email || !Email.trim()) {
      return res.status(400).json({ message: 'Thiếu email bệnh viện' });
    }

    if (!emailRegex.test(Email)) {
      return res.status(400).json({ message: 'Email bệnh viện không hợp lệ' });
    }

    if (Email.length > 255) {
      return res.status(400).json({ message: 'Email bệnh viện không được vượt quá 255 ký tự' });
    }

    if (!NhomMau) {
      return res.status(400).json({ message: 'Vui lòng chọn nhóm máu' });
    }

    if (!allowedBloodGroups.includes(NhomMau)) {
      return res.status(400).json({ message: 'Nhóm máu không hợp lệ' });
    }

    if (!SoLuong || Number(SoLuong) <= 0) {
      return res.status(400).json({ message: 'Số lượng phải lớn hơn 0' });
    }

    if (!MucDich || !MucDich.trim()) {
      return res.status(400).json({ message: 'Thiếu mục đích đăng tin' });
    }

    if (MucDich.length > 200) {
      return res.status(400).json({ message: 'Mục đích không được vượt quá 200 ký tự' });
    }

    // 2. Kiểm tra giới hạn 100 tin (MS43 / BR16)
    const total = await UrgentNews.countDocuments({
      MaBenhVien,
      TrangThai: "Đang hiển thị"
    });

    if (total >= 100) {
      return res.status(400).json({
        message: "Tin khẩn cấp đã vượt mất giới hạn đăng"
      });
    }

    // 3. Kiểm tra trùng tin khẩn cấp (MS44 / BR16)
    const duplicate = await UrgentNews.findOne({
      MaBenhVien,
      NhomMau,
      MucDich: MucDich.trim(),
      SoLuong: Number(SoLuong),
      TrangThai: "Đang hiển thị"
    });

    if (duplicate) {
      return res.status(400).json({
        message: "Tin khẩn cấp đã tồn tại"
      });
    }

    const today = new Date();
    const maTinAuto = "TKC" + Math.floor(100000 + Math.random() * 900000);

    const news = new UrgentNews({
      MaTin: maTinAuto,
      MaBenhVien,
      TenBenhVien,
      SoDienThoaiBenhVien,
      Email,
      NhomMau,
      SoLuong: Number(SoLuong),
      MucDich: MucDich.trim(),
      NgayDang: today,
      GioDang: today.toLocaleTimeString("vi-VN", { hour: '2-digit', minute: '2-digit' }),
      SoLuongDaNhan: 0,
      TrangThai: "Đang hiển thị"
    });

    await news.save();

    res.status(201).json({
      message: "Đăng tin khẩn cấp thành công",
      data: news
    });

  } catch (err) {
    res.status(500).json({ message: err.message || "Lỗi hệ thống" });
  }
};

// 4. PUT: Cập nhật tin khẩn cấp
exports.updateNews = async (req, res) => {
  try {
    const news = await UrgentNews.findById(req.params.id);

    if (!news) {
      return res.status(404).json({
        message: "Không tìm thấy tin."
      });
    }

    if (
      !req.body.NhomMau ||
      !req.body.SoLuong ||
      !req.body.MucDich
    ) {
      return res.status(400).json({
        message: "Vui lòng nhập đúng trường dữ liệu"
      });
    }

    const duplicate = await UrgentNews.findOne({
      _id: { $ne: news._id },
      MaBenhVien: news.MaBenhVien,
      NhomMau: req.body.NhomMau,
      MucDich: req.body.MucDich,
      TrangThai: "Đang hiển thị"
    });

    if (duplicate) {
      return res.status(400).json({
        message: "Tin khẩn cấp đã tồn tại."
      });
    }

    // Cập nhật thông tin bệnh viện nếu có truyền lên
    if (req.body.TenBenhVien) news.TenBenhVien = req.body.TenBenhVien;
    if (req.body.SoDienThoaiBenhVien) news.SoDienThoaiBenhVien = req.body.SoDienThoaiBenhVien;
    if (req.body.Email) news.Email = req.body.Email;

    news.NhomMau = req.body.NhomMau;
    news.SoLuong = Number(req.body.SoLuong);
    news.MucDich = req.body.MucDich;

    if (req.body.SoLuongDaNhan !== undefined) {
      news.SoLuongDaNhan = Number(req.body.SoLuongDaNhan);
    }

    if (req.body.TrangThai) {
      news.TrangThai = req.body.TrangThai;
    }

    // Tự động chuyển sang "Đã ẩn" nếu số lượng nhận đã đạt đủ nhu cầu
    if (news.SoLuongDaNhan >= news.SoLuong) {
      news.TrangThai = "Đã ẩn";
    }

    await news.save();

    res.json({
      message: "Cập nhật tin khẩn cấp thành công",
      data: news
    });

  } catch (err) {
    res.status(500).json({ message: err.message || "Lỗi hệ thống" });
  }
};

// 5. DELETE: Xóa (ẩn) tin khẩn cấp
exports.deleteNews = async (req, res) => {
  try {
    const news = await UrgentNews.findById(req.params.id);

    if (!news) {
      return res.status(404).json({
        message: "Không tìm thấy tin khẩn cấp"
      });
    }

    if (news.TrangThai === "Đã ẩn") {
      return res.status(400).json({
        message: "Tin khẩn cấp đã được xóa trước đó"
      });
    }

    news.TrangThai = "Đã ẩn";
    await news.save();

    res.json({
      message: "Xóa tin khẩn cấp thành công"
    });

  } catch (err) {
    res.status(500).json({ message: err.message || "Lỗi hệ thống" });
  }
};