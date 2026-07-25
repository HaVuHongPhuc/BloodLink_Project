// Note: BM02 - Phiếu đăng ký bệnh viện làm đối tác chờ quản trị viên xác thực.
const mongoose = require('mongoose');

const hospitalRequestSchema = new mongoose.Schema(
  {
    hospitalName: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    phone: { type: String, required: true, trim: true },
    address: { type: String, required: true, trim: true },
    licenseNumber: { type: String, required: true, trim: true },
    status: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' },
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    reviewedAt: Date
  },
  { timestamps: true }
);

module.exports = mongoose.model('HospitalRequest', hospitalRequestSchema);