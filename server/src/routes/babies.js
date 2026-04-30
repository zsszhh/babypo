const express = require('express')
const { prepare, lastInsertId } = require('../db/init')
const { authenticate } = require('../middleware/auth')
const { AppError } = require('../middleware/errorHandler')

const router = express.Router()

router.use(authenticate)

// GET /babies
router.get('/', (req, res) => {
  const babies = prepare('SELECT * FROM babies ORDER BY id ASC').all()

  res.json({
    success: true,
    data: babies.map(formatBaby)
  })
})

// POST /babies
router.post('/', (req, res) => {
  const { name, birthdate, gender } = req.body

  if (!name || !birthdate) {
    throw new AppError(400, '缺少必填字段：name, birthdate')
  }

  const now = Date.now()
  prepare(`
    INSERT INTO babies (name, birthdate, gender, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?)
  `).run([name, birthdate, gender || null, now, now])

  const baby = prepare('SELECT * FROM babies WHERE id = ?').get(lastInsertId())

  res.status(201).json({
    success: true,
    data: formatBaby(baby)
  })
})

// PUT /babies/:id
router.put('/:id', (req, res) => {
  const existing = prepare('SELECT * FROM babies WHERE id = ?').get(req.params.id)
  if (!existing) throw new AppError(404, '宝宝不存在')

  const { name, birthdate, gender } = req.body

  prepare(`
    UPDATE babies SET name = ?, birthdate = ?, gender = ?, updated_at = ? WHERE id = ?
  `).run([
    name ?? existing.name,
    birthdate ?? existing.birthdate,
    gender !== undefined ? gender : existing.gender,
    Date.now(),
    req.params.id
  ])

  const baby = prepare('SELECT * FROM babies WHERE id = ?').get(req.params.id)

  res.json({
    success: true,
    data: formatBaby(baby)
  })
})

function formatBaby(row) {
  return {
    id: row.id,
    name: row.name,
    birthdate: row.birthdate,
    gender: row.gender,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  }
}

module.exports = router
