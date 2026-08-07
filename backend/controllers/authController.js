// NOTE: Chỉ chứa các hàm liên quan đến Xác thực / Đăng nhập / Đăng ký:
// dangKyKhachHang
// dangNhapKhachHang
// dangKyDoiTac
// dangNhapDoiTac
// dangXuat

const TaiKhoan = require('../models/TaiKhoan');
const TaiKhoanBenhVien = require('../models/TaiKhoanBenhVien');
const YeuCauDangKyDoiTac = require('../models/YeuCauDangKyDoiTac');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// UC01: Đăng ký tài khoản đối tác
exports.dangKyDoiTac = async (req, res) => {
  try {
    const { Email, MatKhau, ...rest } = req.body;
    
    const existing = await YeuCauDangKyDoiTac.findOne({ Email });
    if (existing) {
      return res.status(400).json({ message: 'MS25: Tài khoản đã tồn tại' });
    }
    
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(MatKhau, salt);
    
    const yeuCau = new YeuCauDangKyDoiTac({
      ...rest,
      Email,
      MatKhau: hashedPassword,
      TrangThai: 'cho xac thuc'
    });
    
    await yeuCau.save();
    res.status(201).json({ message: 'MS01: Đăng ký tài khoản thành công' });
  } catch (error) {
    res.status(400).json({ message: 'MS02: Vui lòng nhập đúng trường dữ liệu', error: error.message });
  }
};

// UC02: Đăng nhập tài khoản đối tác
exports.dangNhapDoiTac = async (req, res) => {
  try {
    const { Email, MatKhau } = req.body;
    
    if (!Email || !MatKhau) {
      return res.status(400).json({ message: 'MS06: Vui lòng kiểm tra lại định dạng email' });
    }
    
    const benhVien = await TaiKhoanBenhVien.findOne({ Email }).select('+MatKhau');
    if (!benhVien) {
      return res.status(401).json({ message: 'MS08: Vui lòng đăng nhập bằng tài khoản đối tác' });
    }
    
    if (benhVien.TrangThai !== 'hoat dong') {
      return res.status(403).json({ message: 'Tài khoản chưa được kích hoạt hoặc đang bị khóa' });
    }
    
    const isMatch = await bcrypt.compare(MatKhau, benhVien.MatKhau);
    if (!isMatch) {
      return res.status(401).json({ message: 'MS07: Mật khẩu không đúng, Vui lòng thử lại' });
    }
    
    const token = jwt.sign(
      { id: benhVien._id, role: 'hospital', maBenhVien: benhVien.MaBenhVien },
      process.env.JWT_SECRET || 'secretkey',
      { expiresIn: '7d' }
    );
    
    res.json({
      message: 'MS05: Đăng nhập thành công',
      token,
      user: {
        maBenhVien: benhVien.MaBenhVien,
        tenBenhVien: benhVien.TenBenhVien,
        email: benhVien.Email,
        role: 'hospital'
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// UC03: Đăng nhập tài khoản khách hàng
exports.dangNhapKhachHang = async (req, res) => {
  try {
    const { Email, MatKhau } = req.body;
    
    if (!Email || !MatKhau) {
      return res.status(400).json({ message: 'MS06: Vui lòng kiểm tra lại định dạng email' });
    }
    
    // Thêm .select('+MatKhau') để Mongoose lấy mật khẩu đã mã hóa ra so sánh
    const khachHang = await TaiKhoan.findOne({ Email: Email.toLowerCase(), VaiTro: 'khach hang' }).select('+MatKhau');
    if (!khachHang) {
      return res.status(401).json({ message: 'MS19: Không tìm thấy tài khoản, vui lòng đăng nhập bằng tài khoản khác' });
    }

    if (khachHang.TrangThai !== 'hoat dong') {
      return res.status(403).json({ message: 'Tài khoản của bạn đang bị khóa bởi Admin' });
    }
    
    const isMatch = await bcrypt.compare(MatKhau, khachHang.MatKhau);
    if (!isMatch) {
      return res.status(401).json({ message: 'MS07: Mật khẩu không đúng, Vui lòng thử lại' });
    }
    
    const token = jwt.sign(
      { id: khachHang._id, role: 'customer', maTaiKhoan: khachHang.MaTaiKhoan },
      process.env.JWT_SECRET || 'secretkey',
      { expiresIn: '7d' }
    );
    
    res.json({
      message: 'MS05: Đăng nhập thành công',
      token,
      user: {
        maTaiKhoan: khachHang.MaTaiKhoan,
        hoTen: khachHang.HoTen,
        email: khachHang.Email,
        role: 'customer'
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// UC04: Đăng ký tài khoản khách hàng
exports.dangKyKhachHang = async (req, res) => {
  try {
    const { Email, MatKhau, XacNhanMatKhau, ...rest } = req.body;
    
    if (!Email || !Email.match(/^\S+@\S+\.\S+$/)) {
      return res.status(400).json({ message: 'MS06: Vui lòng kiểm tra lại định dạng email' });
    }
    
    if (MatKhau !== XacNhanMatKhau) {
      return res.status(400).json({ message: 'MS42: Mật khẩu xác nhận không đúng. Vui lòng nhập lại' });
    }
    
    const existing = await TaiKhoan.findOne({ Email: Email.toLowerCase() });
    if (existing) {
      return res.status(400).json({ message: 'MS25: Tài khoản đã tồn tại' });
    }
    
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(MatKhau, salt);
    
    const autoMaTK = `TK${Date.now().toString().slice(-8)}`;

    const khachHang = new TaiKhoan({
      ...rest,
      MaTaiKhoan: autoMaTK,
      Email: Email.toLowerCase(),
      MatKhau: hashedPassword,
      VaiTro: 'khach hang',
      TrangThai: 'hoat dong'
    });
    
    await khachHang.save();

    console.log('[DEBUG] Đã lưu thành công vào DB:', khachHang.db.name);
    console.log('[DEBUG] Đã lưu vào Collection:', khachHang.collection.name);

    res.status(201).json({ message: 'MS01: Đăng ký tài khoản thành công', data: khachHang });
  } catch (error) {
    console.error('Lỗi khi lưu TaiKhoan:', error);
    res.status(400).json({ message: 'MS02: Vui lòng nhập đúng trường dữ liệu', error: error.message });
  }
};

// UC05: Đăng xuất tài khoản
exports.dangXuat = async (req, res) => {
  try {
    res.json({ 
      message: 'Đăng xuất thành công',
      shouldClearToken: true
    });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// UC09: Tìm kiếm người hiến máu phù hợp
exports.timNguoiHienMauPhuHop = async (req, res) => {
  try {
    const { nhomMau, location } = req.query;
    
    let query = {
      VaiTro: 'khach hang',
      NgayDangKyHienMauGanNhat: { $ne: null }
    };
    
    if (nhomMau) {
      query.NhomMau = nhomMau;
    }
    
    if (location) {
      query.DiaChi = { $regex: location, $options: 'i' };
    }
    
    const nguoiHien = await TaiKhoan.find(query)
      .select('MaTaiKhoan HoTen NhomMau GioiTinh NgaySinh SoDienThoai DiaChi NgayDangKyHienMauGanNhat NgayHienMauGanNhat LuotHien');
    
    const ketQua = nguoiHien.filter(nguoi => {
      const ngayHienGanNhat = nguoi.NgayHienMauGanNhat;
      if (!ngayHienGanNhat) return true;
      const diffDays = Math.floor((Date.now() - new Date(ngayHienGanNhat)) / (1000 * 60 * 60 * 24));
      return diffDays >= 84;
    });
    
    if (ketQua.length === 0) {
      return res.status(404).json({ message: 'MS10: Không tìm thấy kết quả phù hợp' });
    }
    
    res.json(ketQua);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// UC10: Cập nhật hồ sơ cá nhân
exports.capNhatHoSoCaNhan = async (req, res) => {
  try {
    const { maTaiKhoan, ...updateData } = req.body;
    
    const khachHang = await TaiKhoan.findOne({ MaTaiKhoan: maTaiKhoan });
    if (!khachHang) {
      return res.status(404).json({ message: 'Không tìm thấy tài khoản' });
    }
    
    delete updateData.MatKhau;
    delete updateData.VaiTro;
    delete updateData.MaTaiKhoan;
    delete updateData.Email;
    
    const updated = await TaiKhoan.findOneAndUpdate(
      { MaTaiKhoan: maTaiKhoan },
      { $set: updateData },
      { new: true, runValidators: true }
    );
    
    res.json({
      message: 'MS20: Cập nhật thành công',
      user: updated
    });
  } catch (error) {
    res.status(400).json({ message: 'MS02: Vui lòng nhập đúng trường dữ liệu', error: error.message });
  }
};

// Lấy thông tin hồ sơ cá nhân
exports.getHoSoCaNhan = async (req, res) => {
  try {
    const { maTaiKhoan } = req.params;
    const khachHang = await TaiKhoan.findOne({ MaTaiKhoan: maTaiKhoan }).select('-MatKhau');
    if (!khachHang) {
      return res.status(404).json({ message: 'Không tìm thấy hồ sơ' });
    }
    res.json(khachHang);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// Đổi mật khẩu
exports.doiMatKhau = async (req, res) => {
  try {
    const { maTaiKhoan, matKhauCu, matKhauMoi } = req.body;
    
    const khachHang = await TaiKhoan.findOne({ MaTaiKhoan: maTaiKhoan });
    if (!khachHang) {
      return res.status(404).json({ message: 'Không tìm thấy tài khoản' });
    }
    
    const isMatch = await bcrypt.compare(matKhauCu, khachHang.MatKhau);
    if (!isMatch) {
      return res.status(401).json({ message: 'MS22: Vui lòng kiểm tra lại mật khẩu cũ' });
    }
    
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(matKhauMoi, salt);
    
    await TaiKhoan.findOneAndUpdate(
      { MaTaiKhoan: maTaiKhoan },
      { $set: { MatKhau: hashedPassword } }
    );
    
    res.json({ message: 'MS21: Đã đổi mật khẩu thành công' });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};