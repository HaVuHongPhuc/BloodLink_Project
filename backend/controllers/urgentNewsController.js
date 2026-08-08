// Note: UC05 - UC10 - đăng, sửa, xóa và lọc tin khẩn cấp.
const UrgentNews = require("../models/UrgentNews");

// 1. GET: Lấy danh sách tin khẩn cấp (Tự động ẩn tin đạt đủ máu hoặc đã đăng đủ 3 ngày)
exports.getAll = async (req, res) => {
  try {
    const today = new Date();
    const threeDaysAgo = new Date(today);
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

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
    const {
      MaBenhVien,
      TenBenhVien,
      SoDienThoaiBenhVien,
      Email,
      NhomMau,
      SoLuong,
      MucDich
    } = req.body;

    const emailRegex = /^\S+@\S+\.\S+$/;

    // 1. Kiểm tra dữ liệu đầu vào (MS02)
    if (
      !MaBenhVien || MaBenhVien.length > 10 ||
      !TenBenhVien || TenBenhVien.length > 50 ||
      !SoDienThoaiBenhVien || SoDienThoaiBenhVien.length < 10 || SoDienThoaiBenhVien.length > 11 ||
      !Email || !emailRegex.test(Email) || Email.length > 50 ||
      !NhomMau ||
      !SoLuong || Number(SoLuong) <= 0 ||
      !MucDich || MucDich.length > 200
    ) {
      return res.status(400).json({
        message: "Vui lòng nhập đúng trường dữ liệu"
      });
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