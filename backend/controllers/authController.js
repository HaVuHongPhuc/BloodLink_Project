// Note: UC01, UC02, UC03, UC15, UC16 - đăng ký, đăng nhập và duyệt tài khoản.
const register = (req, res) => res.status(501).json({ message: 'UC đăng ký đang chờ triển khai' });
const login = (req, res) => res.status(501).json({ message: 'UC đăng nhập đang chờ triển khai' });
const approveHospital = (req, res) => res.status(501).json({ message: 'UC duyệt bệnh viện đang chờ triển khai' });

module.exports = { register, login, approveHospital };