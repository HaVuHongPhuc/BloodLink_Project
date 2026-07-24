// Note: Kiểm tra dữ liệu đầu vào trước khi chuyển request vào controller.
const validateMiddleware = (schema) => (req, res, next) => {
  if (typeof schema === 'function' && !schema(req.body)) {
    return res.status(400).json({ message: 'Dữ liệu đầu vào không hợp lệ' });
  }

  return next();
};

module.exports = validateMiddleware;