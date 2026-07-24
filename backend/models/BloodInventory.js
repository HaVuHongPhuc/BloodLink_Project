// Note: BM16 - Kho máu theo bệnh viện và nhóm máu, phục vụ quản lý tồn kho.
const mongoose = require('mongoose');

const bloodInventorySchema = new mongoose.Schema(
  {
    hospital: { type: mongoose.Schema.Types.ObjectId, ref: 'Hospital', required: true },
    bloodType: { type: String, required: true },
    quantity: { type: Number, default: 0, min: 0 },
    lastUpdatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  },
  { timestamps: true }
);

bloodInventorySchema.index({ hospital: 1, bloodType: 1 }, { unique: true });

module.exports = mongoose.model('BloodInventory', bloodInventorySchema);