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
    
    const benhVien = await TaiKhoanBenhVien.findOne({ Email });
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
    
    const khachHang = await TaiKhoan.findOne({ Email, VaiTro: 'khach hang' });
    if (!khachHang) {
      return res.status(401).json({ message: 'MS19: Không tìm thấy tài khoản, vui lòng đăng nhập bằng tài khoản khác' });
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
    
    const existing = await TaiKhoan.findOne({ Email });
    if (existing) {
      return res.status(400).json({ message: 'MS25: Tài khoản đã tồn tại' });
    }
    
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(MatKhau, salt);
    
    const khachHang = new TaiKhoan({
      ...rest,
      Email,
      MatKhau: hashedPassword,
      VaiTro: 'khach hang',
      TrangThai: 'hoat dong'
    });
    
    await khachHang.save();
    res.status(201).json({ message: 'MS01: Đăng ký tài khoản thành công' });
  } catch (error) {
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