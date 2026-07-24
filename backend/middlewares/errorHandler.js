// Note: Xử lý lỗi tập trung và chuẩn hóa phản hồi lỗi MS01 - MS46.
const errorHandler = (error, req, res, next) => {
  const statusCode = error.statusCode || 500;
  res.status(statusCode).json({
    code: error.code || 'MS01',
    message: error.message || 'Đã xảy ra lỗi trong hệ thống'
  });
};

module.exports = errorHandler;