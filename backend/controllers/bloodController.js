const BloodDonation = require('../models/BloodDonation');
const BloodReceive = require('../models/BloodReceive');

const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const registerDonate = async (req, res) => {
  try {
    const {
      maDon, HovaTen, GioiTinh, DayofBirth, CCCDorPASSPORT,
      NgheNghiep, addressOnCCCD, CurrentResidence, PhoneNumber,
      Email, NhomMau, NgayHienGanNhat, UnderlyingMedicalCondition_Optional
    } = req.body;

    const normalizedName = (HovaTen || '').trim();
    const normalizedCCCD = (CCCDorPASSPORT || '').trim();
    const normalizedOccupation = (NgheNghiep || '').trim();
    const normalizedAddressCCCD = (addressOnCCCD || '').trim();
    const normalizedResidence = (CurrentResidence || '').trim();
    const normalizedPhone = (PhoneNumber || '').trim();
    const normalizedEmail = (Email || '').trim();
    const normalizedBloodGroup = (NhomMau || '').trim();

    // 1. Kiểm tra trùng đơn hiến
    const existingDonationByInfo = await BloodDonation.findOne({
      CCCDorPASSPORT: normalizedCCCD,
      HovaTen: { $regex: new RegExp(`^${escapeRegExp(normalizedName)}$`, 'i') }
    });

    if (existingDonationByInfo) {
      return res.status(409).json({
        success: false,
        code: 'DUPLICATE_DONATION',
        message: 'Thông tin này đang ở trạng thái "hiến máu"'
      });
    }

    // 2. Kiểm tra trùng CCCD
    const existingDonationByCCCD = await BloodDonation.findOne({
      CCCDorPASSPORT: normalizedCCCD
    });

    if (existingDonationByCCCD) {
      return res.status(409).json({
        success: false,
        code: 'DUPLICATE_CCCD',
        message: 'Chứng minh nhân dân/Passport đã được sử dụng'
      });
    }

    // 3. Đối soát chéo đơn nhận máu (Bọc try-catch riêng để tránh dừng luồng)
    let warningMessage = null;
    try {
      if (BloodReceive) {
        const dualCheck = await BloodReceive.findOne({
          CCCDorPASSPORT: normalizedCCCD,
          HovaTen: { $regex: new RegExp(`^${escapeRegExp(normalizedName)}$`, 'i') }
        });
        if (dualCheck) {
          warningMessage = `Khách hàng ${normalizedName} (CCCD: ${normalizedCCCD}) hiện cũng đang có đơn đăng ký nhận máu trên hệ thống!`;
        }
      }
    } catch (checkErr) {
      console.log('Loi khi doi soat cheo BloodReceive:', checkErr.message);
    }

    // 4. Khởi tạo và Lưu vào Database
    const newDonation = new BloodDonation({
      maDon: maDon || `DK${Date.now().toString().slice(-8)}`,
      HovaTen: normalizedName,
      GioiTinh: GioiTinh === 'Nữ' ? 'Nu' : GioiTinh, // Chuyển Nữ thành Nu nếu cần
      DayofBirth: DayofBirth ? new Date(DayofBirth) : null,
      CCCDorPASSPORT: normalizedCCCD,
      NgheNghiep: normalizedOccupation,
      addressOnCCCD: normalizedAddressCCCD,
      CurrentResidence: normalizedResidence,
      PhoneNumber: normalizedPhone,
      Email: normalizedEmail,
      NhomMau: normalizedBloodGroup,
      NgayHienGanNhat: NgayHienGanNhat ? new Date(NgayHienGanNhat) : null,
      UnderlyingMedicalCondition_Optional: UnderlyingMedicalCondition_Optional || '',
      TrangThaiDon: 'Cho_Duyet'
    });

    await newDonation.save();

    return res.status(201).json({
      success: true,
      message: 'Đăng ký hiến máu thành công!',
      warningMessage: warningMessage,
      data: newDonation
    });

  } catch (error) {
    // In trực tiếp lỗi ra Terminal Backend để dễ theo dõi
    console.error('LOI THUC SU KHI LUU DON:', error);

    if (error.code === 11000 || (error.name === 'MongoServerError' && error.message.includes('duplicate key'))) {
      return res.status(409).json({
        success: false,
        code: 'DUPLICATE_CCCD',
        message: 'Chứng minh nhân dân/Passport đã được sử dụng'
      });
    }

    // Trả về câu thông báo lỗi
    return res.status(500).json({
      success: false,
      message: `Lỗi DB: ${error.message}`
    });
  }
};

// ---------------------------------------------------------------------------------------------------------------------

const registerReceive = async (req, res) => {
  try {
    const {
      maDon, HovaTen, GioiTinh, DayofBirth, CCCDorPASSPORT,
      NgheNghiep, addressOnCCCD, CurrentResidence, PhoneNumber,
      Email, NhomMau, UnderlyingMedicalCondition_Optional
    } = req.body;

    const normalizedName = (HovaTen || '').trim();
    const normalizedCCCD = (CCCDorPASSPORT || '').trim();
    const normalizedOccupation = (NgheNghiep || '').trim();
    const normalizedAddressCCCD = (addressOnCCCD || '').trim();
    const normalizedResidence = (CurrentResidence || '').trim();
    const normalizedPhone = (PhoneNumber || '').trim();
    const normalizedEmail = (Email || '').trim();
    const normalizedBloodGroup = (NhomMau || '').trim();
    const normalizedCondition = (UnderlyingMedicalCondition_Optional || '').trim();

    // 1. Kiểm tra đơn nhận máu đã tồn tại hay chưa
    const existingReceive = await BloodReceive.findOne({
      CCCDorPASSPORT: normalizedCCCD,
      Status: 'Cho_Xu_Ly'
    });

    if (existingReceive) {
      return res.status(409).json({
        success: false,
        code: 'DUPLICATE_RECEIVE',
        message: 'Bệnh nhân này đã có một đơn đăng ký nhận máu đang chờ xử lý'
      });
    }

    // 2. Đối soát chéo đơn hiến máu
    let warningMessage = null;
    try {
      if (BloodDonation) {
        const dualCheck = await BloodDonation.findOne({
          CCCDorPASSPORT: normalizedCCCD,
          HovaTen: { $regex: new RegExp(`^${escapeRegExp(normalizedName)}$`, 'i') }
        });
        if (dualCheck) {
          warningMessage = `Hệ thống ghi nhận khách hàng ${normalizedName} (CCCD: ${normalizedCCCD}) hiện cũng đang có đơn đăng ký HIẾN MÁU.`;
        }
      }
    } catch (checkErr) {
      console.log('Lỗi khi đối soát chéo BloodDonation:', checkErr.message);
    }

    // 3. Khởi tạo và Lưu vào Collection PhieuDangKyNhanMau
    const newReceive = new BloodReceive({
      maDon: maDon || `RN${Date.now().toString().slice(-8)}`,
      HovaTen: normalizedName,
      GioiTinh: GioiTinh === 'Nữ' ? 'Nu' : GioiTinh,
      DayofBirth: DayofBirth ? new Date(DayofBirth) : null,
      CCCDorPASSPORT: normalizedCCCD,
      NgheNghiep: normalizedOccupation,
      addressOnCCCD: normalizedAddressCCCD,
      CurrentResidence: normalizedResidence,
      PhoneNumber: normalizedPhone,
      Email: normalizedEmail,
      NhomMau: normalizedBloodGroup,
      UnderlyingMedicalCondition_Optional: normalizedCondition,
      Status: 'Cho_Xu_Ly'
    });

    await newReceive.save();

    return res.status(201).json({
      success: true,
      message: 'Đăng ký nhận máu thành công!',
      warningMessage: warningMessage,
      data: newReceive
    });

  } catch (error) {
    console.error('Lỗi khi lưu đơn đăng ký nhận máu:', error);

    if (error.code === 11000 || (error.name === 'MongoServerError' && error.message.includes('duplicate key'))) {
      return res.status(409).json({
        success: false,
        code: 'DUPLICATE_KEY',
        message: 'Mã đơn hoặc Chứng minh nhân dân/Passport bị trùng lặp'
      });
    }

    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((val) => val.message);
      return res.status(400).json({
        success: false,
        code: 'VALIDATION_ERROR',
        message: messages.join(', ')
      });
    }

    return res.status(500).json({
      success: false,
      message: `Lỗi DB: ${error.message}`
    });
  }
};

module.exports = {
  registerDonate,
  registerReceive
};