// Note: Ghi nhật ký hoạt động hệ thống; có thể thay bằng thư viện logger khi triển khai production.
const logger = {
  info: (...messages) => console.log('[INFO]', ...messages),
  warn: (...messages) => console.warn('[WARN]', ...messages),
  error: (...messages) => console.error('[ERROR]', ...messages)
};

module.exports = logger;