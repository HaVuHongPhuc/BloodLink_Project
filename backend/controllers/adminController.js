// Note: UC27, UC31, UC32, UC33 - quản trị tài khoản, dữ liệu và báo cáo hệ thống.
const notImplemented = (req, res) => res.status(501).json({ message: 'Nghiệp vụ quản trị đang chờ triển khai' });

module.exports = { notImplemented };