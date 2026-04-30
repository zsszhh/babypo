const express = require('express')
const { prepare } = require('../db/init')
const { authenticate } = require('../middleware/auth')
const { AppError } = require('../middleware/errorHandler')
const { formatBaby } = require('../utils/format')

const router = express.Router()

router.use(authenticate)

router.get('/', async (req, res) => {
  const babies = await prepare('SELECT * FROM babies ORDER BY id ASC').all()

  res.json({
    success: true,
    data: babies.map(formatBaby)
  })
})

router.post('/', async (req, res) => {
  const { name, birthdate, gender } = req.body

  if (!name || !birthdate) {
    throw new AppError(400, '缺少必填字段：name, birthdate')
  }

  const now = Date.now()
  const result = await prepare(`
    INSERT INTO babies (name, birthdate, gender, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?)
  `).run([name, birthdate, gender || null, now, now])

  const baby = await prepare('SELECT * FROM babies WHERE id = ?').get(result.lastID)

  res.status(201).json({
    success: true,
    data: formatBaby(baby)
  })
})

router.put('/:id', async (req, res) => {
  const existing = await prepare('SELECT * FROM babies WHERE id = ?').get(req.params.id)
  if (!existing) throw new AppError(404, '宝宝不存在')

  const { name, birthdate, gender } = req.body

  await prepare(`
    UPDATE babies SET name = ?, birthdate = ?, gender = ?, updated_at = ? WHERE id = ?
  `).run([
    name ?? existing.name,
    birthdate ?? existing.birthdate,
    gender !== undefined ? gender : existing.gender,
    Date.now(),
    req.params.id
  ])

  const baby = await prepare('SELECT * FROM babies WHERE id = ?').get(req.params.id)

  res.json({
    success: true,
    data: formatBaby(baby)
  })
})

module.exports = router
