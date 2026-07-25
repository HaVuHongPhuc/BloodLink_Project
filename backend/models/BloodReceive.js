// Note: BM14 - Đơn đăng ký nhận máu, liên kết bệnh viện, người nhận và nhóm máu.
const mongoose = require('mongoose');

const bloodReceiveSchema = new mongoose.Schema(
  {
    requester: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    hospital: { type: mongoose.Schema.Types.ObjectId, ref: 'Hospital', required: true },
    bloodType: { type: String, required: true },
    amount: { type: Number, required: true, min: 1 },
    reason: { type: String, required: true, trim: true },
    status: { type: String, enum: ['Pending', 'Approved', 'Completed', 'Rejected'], default: 'Pending' }
  },
  { timestamps: true }
);

module.exports = mongoose.model('BloodReceive', bloodReceiveSchema);