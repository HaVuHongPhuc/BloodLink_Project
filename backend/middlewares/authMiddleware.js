// Note: Kiểm tra JWT và phân quyền Admin, Hospital, Customer trước controller.
const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  const authorization = req.headers.authorization;

  if (!authorization || !authorization.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Thiếu JWT token' });
  }

  const token = authorization.slice(7);

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secretkey');
    req.user = {
      ...decoded,
      maTaiKhoan: decoded.maTaiKhoan || decoded.id,
      role: decoded.role
    };
    return next();
  } catch (error) {
    return res.status(401).json({ message: 'Token không hợp lệ hoặc đã hết hạn' });
  }
};

module.exports = authMiddleware;