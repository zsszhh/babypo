const express = require('express')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { JWT_SECRET } = require('../middleware/auth')
const { AppError } = require('../middleware/errorHandler')

const router = express.Router()

const PASSWORD_HASH = bcrypt.hashSync(process.env.PASSWORD || '123456', 10)
const TOKEN_EXPIRES = parseInt(process.env.TOKEN_EXPIRES) || 31536000

// POST /auth/login
router.post('/login', (req, res) => {
  const { password } = req.body
  if (!password || !bcrypt.compareSync(password, PASSWORD_HASH)) {
    throw new AppError(401, '密码错误')
  }

  const token = jwt.sign({ role: 'family' }, JWT_SECRET, { expiresIn: TOKEN_EXPIRES })

  res.json({
    success: true,
    data: { token, expiresIn: TOKEN_EXPIRES }
  })
})

// POST /auth/verify
router.post('/verify', (req, res) => {
  const { token } = req.body
  try {
    jwt.verify(token || req.headers.authorization?.split(' ')[1], JWT_SECRET)
    res.json({
      success: true,
      data: { valid: true }
    })
  } catch {
    throw new AppError(401, 'token 无效或已过期')
  }
})

module.exports = router
