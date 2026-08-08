const ThongBao = require('../models/ThongBao');
const TaiKhoan = require('../models/TaiKhoan');

// UC09: Gửi thông báo yêu cầu hiến máu
exports.guiThongBao = async (req, res) => {
  try {
    const { maTaiKhoan, noiDung, maBenhVien, tenBenhVien } = req.body;

    // Kiểm tra khách hàng tồn tại
    const khachHang = await TaiKhoan.findOne({ MaTaiKhoan: maTaiKhoan });
    if (!khachHang) {
      return res.status(404).json({ message: 'Không tìm thấy khách hàng' });
    }

    // Kiểm tra nội dung không được trống (BR11)
    if (!noiDung || noiDung.trim() === '') {
      return res.status(400).json({ message: 'MS40: Vui lòng điền nội dung thông báo' });
    }

    const thongBao = new ThongBao({
      MaBenhVien: maBenhVien,
      MaTaiKhoan: maTaiKhoan,
      TenBenhVien: tenBenhVien,
      NoiDung: noiDung.trim(),
      TrangThai: 'da gui',
      LoaiThongBao: 'yeu cau hien mau'
    });

    await thongBao.save();

    res.status(201).json({
      message: 'Gửi thông báo thành công',
      data: thongBao
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// UC10: Xem thông báo (lấy danh sách thông báo của khách hàng)
exports.xemThongBao = async (req, res) => {
  try {
    const { maTaiKhoan } = req.params;

    const danhSach = await ThongBao.find({ MaTaiKhoan: maTaiKhoan })
      .sort({ NgayGui: -1 });

    if (danhSach.length === 0) {
      return res.status(404).json({ message: 'MS47: Hiện tại không có thông báo nào' });
    }

    // Cập nhật trạng thái thành "đã xem" (BR12)
    await ThongBao.updateMany(
      { MaTaiKhoan: maTaiKhoan, TrangThai: 'da gui' },
      { $set: { TrangThai: 'da xem' } }
    );

    res.json({
      message: 'Lấy danh sách thông báo thành công',
      data: danhSach
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// UC11: Phản hồi thông báo (đồng ý hoặc từ chối)
exports.phanHoiThongBao = async (req, res) => {
  try {
    const { maThongBao, phanHoi } = req.body; // phanHoi: 'dong y' hoac 'tu choi'

    const thongBao = await ThongBao.findOne({ MaThongBao: maThongBao });
    if (!thongBao) {
      return res.status(404).json({ message: 'Không tìm thấy thông báo' });
    }

    // Kiểm tra đã phản hồi trước đó (BR13)
    if (thongBao.TrangThai === 'da dong y' || thongBao.TrangThai === 'da tu choi') {
      return res.status(400).json({ message: 'MS49: Thông báo đã được gửi phản hồi trước đó' });
    }

    // Chỉ cho phép phản hồi khi đã xem
    if (thongBao.TrangThai !== 'da xem') {
      return res.status(400).json({ message: 'Vui lòng xem thông báo trước khi phản hồi' });
    }

    const trangThaiMoi = phanHoi === 'dong y' ? 'da dong y' : 'da tu choi';
    thongBao.TrangThai = trangThaiMoi;
    await thongBao.save();

    res.json({
      message: 'MS48: Đã gửi phản hồi',
      data: thongBao
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// Lấy danh sách thông báo của bệnh viện (đã gửi)
exports.getThongBaoBenhVien = async (req, res) => {
  try {
    const { maBenhVien } = req.params;

    const danhSach = await ThongBao.find({ MaBenhVien: maBenhVien })
      .sort({ NgayGui: -1 });

    res.json({
      data: danhSach,
      count: danhSach.length
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};