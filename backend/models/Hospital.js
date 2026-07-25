// Note: BM11 - Tài khoản và thông tin bệnh viện; dùng cho nghiệp vụ Hospital.
const mongoose = require('mongoose');

const hospitalSchema = new mongoose.Schema(
	{
		hospitalName: { type: String, required: true, trim: true },
		email: { type: String, required: true, unique: true, lowercase: true, trim: true },
		password: { type: String, required: true, select: false },
		phone: { type: String, trim: true },
		address: { type: String, trim: true },
		licenseNumber: { type: String, trim: true },
		role: { type: String, default: 'Hospital' },
		status: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' }
	},
	{ timestamps: true }
);

module.exports = mongoose.model('Hospital', hospitalSchema);
