// Note: BM05, BM06 - Tin đăng khẩn cấp của bệnh viện và lịch sử cập nhật tin.
const mongoose = require('mongoose');

const urgentNewsSchema = new mongoose.Schema(
  {
    hospital: { type: mongoose.Schema.Types.ObjectId, ref: 'Hospital', required: true },
    bloodType: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1 },
    purpose: { type: String, required: true, trim: true },
    receivedQuantity: { type: Number, default: 0, min: 0 },
    status: { type: String, enum: ['Active', 'Fulfilled', 'Expired', 'Cancelled'], default: 'Active' },
    expiresAt: Date
  },
  { timestamps: true }
);

module.exports = mongoose.model('UrgentNews', urgentNewsSchema);