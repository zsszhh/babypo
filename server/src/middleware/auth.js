const jwt = require('jsonwebtoken')
const { AppError } = require('./errorHandler')

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-in-production'

if (JWT_SECRET === 'dev-secret-change-in-production') {
  console.warn('\n⚠️  警告：正在使用默认 JWT 密钥！请在生产环境中设置环境变量 JWT_SECRET\n')
}

/**
 * Express 中间件：验证 Bearer Token
 */
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

/**
 * 验证 token 并返回解码数据（用于非中间件场景，如导出接口的 query token）
 */
function verifyToken(token) {
  return jwt.verify(token, JWT_SECRET)
}

module.exports = { authenticate, verifyToken, JWT_SECRET }
