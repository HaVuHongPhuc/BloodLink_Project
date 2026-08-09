const TaiKhoanBenhVien = require('../models/TaiKhoanBenhVien');


exports.getHospitalProfile = async (req, res) => {
  try {
    const { maBenhVien } = req.user;
    const hospital = await TaiKhoanBenhVien.findOne({ MaBenhVien: maBenhVien })
      .select('-MatKhau');
    if (!hospital) {
      return res.status(404).json({ message: 'Không tìm thấy bệnh viện' });
    }
    res.json(hospital);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};
exports.timNguoiHienMauPhuHop = async (req, res) => {
  try {
    const { nhomMau, location } = req.query;

    // Kiểm tra dữ liệu đầu vào
    if (!nhomMau && !location) {
      // Nếu không có bộ lọc, lấy tất cả người hiến sẵn sàng
      // nhưng vẫn kiểm tra có đủ dữ liệu không
    }

    // Xây dựng query tìm khách hàng
    let query = {
      VaiTro: 'khach hang',
      NgayDangKyHienMauGanNhat: { $ne: null } // Có ngày đăng ký hiến
    };

    if (nhomMau) {
      query.NhomMau = nhomMau;
    }

    if (location) {
      query.DiaChi = { $regex: location, $options: 'i' };
    }

    // Lấy danh sách người hiến
    const nguoiHien = await TaiKhoan.find(query)
      .select('MaTaiKhoan HoTen NhomMau GioiTinh NgaySinh SoDienThoai DiaChi NgayDangKyHienMauGanNhat NgayHienMauGanNhat LuotHien');

    // Kiểm tra nếu không có dữ liệu -> MS09
    if (!nguoiHien || nguoiHien.length === 0) {
      return res.status(404).json({ 
        success: false,
        message: 'Không đủ dữ liệu để tìm kiếm' 
      });
    }

    // Lọc người hiến có trạng thái sẵn sàng theo BR09, BR10
    const ketQua = nguoiHien.filter(nguoi => {
      const ngayHienGanNhat = nguoi.NgayHienMauGanNhat;
      const luotHien = nguoi.LuotHien || 0;
      
      // BR10: Người hiến mới (lượt hiến = 0) cần có ngày đăng ký hiến
      if (luotHien === 0) {
        return nguoi.NgayDangKyHienMauGanNhat !== null;
      }
      
      // BR09: Người hiến cũ cần ngày hiến cách hiện tại >= 12 tuần (84 ngày)
      if (ngayHienGanNhat) {
        const diffDays = Math.floor((Date.now() - new Date(ngayHienGanNhat)) / (1000 * 60 * 60 * 24));
        return diffDays >= 84;
      }
      
      return false;
    });

    // Nếu không có kết quả phù hợp -> MS10
    if (ketQua.length === 0) {
      return res.status(404).json({ 
        success: false,
        message: 'Không tìm thấy kết quả phù hợp' 
      });
    }

    // Thêm trạng thái sẵn sàng cho từng người
    const result = ketQua.map(nguoi => {
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

    res.json({
      success: true,
      data: result,
      count: result.length
    });
  } catch (error) {
    console.error('Lỗi tìm kiếm người hiến:', error);
    res.status(500).json({ 
      success: false,
      message: 'Lỗi server', 
      error: error.message 
    });
  }
};