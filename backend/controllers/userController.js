// Note: UC17, UC18 - cập nhật hồ sơ khách hàng và đổi mật khẩu.
const updateProfile = (req, res) => res.status(501).json({ message: 'UC cập nhật hồ sơ đang chờ triển khai' });
const changePassword = (req, res) => res.status(501).json({ message: 'UC đổi mật khẩu đang chờ triển khai' });

module.exports = { updateProfile, changePassword };