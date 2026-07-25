// Note: BM12 - Tài khoản khách hàng; dùng cho UC01, UC02, UC17, UC18.
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
	{
		fullName: { type: String, required: true, trim: true },
		email: { type: String, required: true, unique: true, lowercase: true, trim: true },
		password: { type: String, required: true, select: false },
		phone: { type: String, trim: true },
		dateOfBirth: Date,
		bloodType: String,
		role: { type: String, enum: ['Customer', 'Admin'], default: 'Customer' },
		isActive: { type: Boolean, default: true }
	},
	{ timestamps: true }
);

module.exports = mongoose.model('User', userSchema);
