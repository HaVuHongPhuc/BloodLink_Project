const mongoose = require('mongoose');

const khoMauSchema = new mongoose.Schema(
  {
    MaMau: { type: String, required: true, unique: true },
    NhomMau: { type: String, required: true },
    SoLuong: { type: Number, required: true, default: 1 },
    NgayNhap: { type: Date, default: Date.now },
    HanSuDung: { type: Date, required: true },
    NgayXuat: { type: Date, default: null },
    TrangThai: { type: String, default: 'Trong kho' },
    MaBenhVien: { type: String, required: true },
    MaDon: { type: String, default: null }
  },
  {
    timestamps: true,
    collection: 'KhoMau'
  }
);

module.exports = mongoose.models.KhoMau || mongoose.model('KhoMau', khoMauSchema, 'KhoMau');