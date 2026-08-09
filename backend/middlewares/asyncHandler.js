// Middleware helper to wrap async route handlers and forward errors to Express error handling.
module.exports = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};
