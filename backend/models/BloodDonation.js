// Note: BM13 - Đơn đăng ký hiến máu của khách hàng, phục vụ các UC hiến máu.
const mongoose = require('mongoose');

const bloodDonationSchema = new mongoose.Schema(
  {
    donor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    bloodType: { type: String, required: true },
    amount: { type: Number, required: true, min: 1 },
    donationDate: Date,
    status: { type: String, enum: ['Pending', 'Approved', 'Completed', 'Cancelled'], default: 'Pending' },
    notes: String
  },
  { timestamps: true }
);

module.exports = mongoose.model('BloodDonation', bloodDonationSchema);