// Note: UC05 - UC10 - đăng, sửa, xóa và lọc tin khẩn cấp.
const UrgentNews = require("../models/UrgentNews");

// GET
exports.getAll = async(req,res)=>{
    const data = await UrgentNews.find();
    res.json(data);
}

// GET ID
exports.getOne = async(req,res)=>{
    const data = await UrgentNews.findById(req.params.id);
    res.json(data);
}

// POST: Đăng tin khẩn cấp(UC17 / UC14)
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

       if (req.body.TenBenhVien) {
            news.TenBenhVien = req.body.TenBenhVien;}
            
        news.NhomMau = req.body.NhomMau;

        news.SoLuong = req.body.SoLuong;

        news.MucDich = req.body.MucDich;

        news.Email = req.body.Email;

        news.SoDienThoaiBenhVien = req.body.SoDienThoaiBenhVien;

        news.TrangThai = req.body.TrangThai;

        await news.save();

        res.json({

            message: "Cập nhật tin khẩn cấp thành công",

            data: news

        });

    }

    catch (err) {

        res.status(500).json(err);

    }

};

exports.deleteNews = async (req, res) => {

    try {

        const news = await UrgentNews.findById(req.params.id);

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

        if (news.SoLuongDaNhan >= news.SoLuong) {

            news.TrangThai = "Đã ẩn";

        }
    }

    catch (err) {

        res.status(500).json(err);

    }

};