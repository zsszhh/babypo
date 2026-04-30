const jwt = require('jsonwebtoken')
const { AppError } = require('./errorHandler')

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-in-production'

function authenticate(req, res, next) {
  const header = req.headers.authorization
  if (!header || !header.startsWith('Bearer ')) {
    throw new AppError(401, '未提供认证令牌')
  }

  const token = header.split(' ')[1]

  try {
    const decoded = jwt.verify(token, JWT_SECRET)
    req.user = decoded
    next()
  } catch (err) {
    throw new AppError(401, '令牌无效或已过期')
  }
}

module.exports = { authenticate, JWT_SECRET }
