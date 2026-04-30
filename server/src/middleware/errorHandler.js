class AppError extends Error {
  constructor(status, message) {
    super(message)
    this.status = status
  }
}

function errorHandler(err, req, res, next) {
  console.error(err)

  const status = err.status || 500
  const message = status === 500 ? '服务器内部错误' : err.message

  res.status(status).json({
    success: false,
    message
  })
}

module.exports = { AppError, errorHandler }
