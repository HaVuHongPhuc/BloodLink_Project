// Note: Kiểm tra JWT và phân quyền Admin, Hospital, Customer trước controller.
const authMiddleware = (req, res, next) => {
  const authorization = req.headers.authorization;

  if (!authorization || !authorization.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Thiếu JWT token' });
  }

  // TODO: Giải mã và xác thực JWT bằng secret trong biến môi trường.
  req.user = { token: authorization.slice(7) };
  return next();
};

module.exports = authMiddleware;