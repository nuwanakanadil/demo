module.exports = function errorMiddleware(err, req, res, next) {
  const status = err.statusCode || err.status || 500;
  res.status(status).json({
    success: false,
    message: err.message || "Server error",
  });
};
