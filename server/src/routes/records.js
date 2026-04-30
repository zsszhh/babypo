const express = require('express')
const { prepare, lastInsertId } = require('../db/init')
const { authenticate } = require('../middleware/auth')
const { AppError } = require('../middleware/errorHandler')

const router = express.Router()

router.use(authenticate)

// GET /records
router.get('/', (req, res) => {
  const { baby_id = 1, limit = 100, offset = 0, start_date, end_date } = req.query

  let where = 'WHERE is_deleted = 0 AND baby_id = ?'
  const params = [Number(baby_id)]

  if (start_date) {
    where += ' AND timestamp >= ?'
    params.push(Number(start_date))
  }
  if (end_date) {
    where += ' AND timestamp <= ?'
    params.push(Number(end_date))
  }

  const countRow = prepare(`SELECT COUNT(*) as total FROM records ${where}`).get(params)
  const records = prepare(`SELECT * FROM records ${where} ORDER BY timestamp DESC LIMIT ? OFFSET ?`).all([...params, Number(limit), Number(offset)])

  res.json({
    success: true,
    data: {
      records: records.map(formatRecord),
      total: countRow.total
    }
  })
})

// GET /records/:id
router.get('/:id', (req, res) => {
  const record = prepare('SELECT * FROM records WHERE id = ? AND is_deleted = 0').get(req.params.id)
  if (!record) throw new AppError(404, '记录不存在')

  res.json({
    success: true,
    data: formatRecord(record)
  })
})

// POST /records
router.post('/', (req, res) => {
  const { babyId = 1, timestamp, type, color, amount, note, operatorName } = req.body

  if (!timestamp || !type || !operatorName) {
    throw new AppError(400, '缺少必填字段：timestamp, type, operatorName')
  }

  const now = Date.now()
  prepare(`
    INSERT INTO records (baby_id, timestamp, type, color, amount, note, operator_name, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run([babyId, timestamp, type, color || null, amount || null, note || null, operatorName, now, now])

  const record = prepare('SELECT * FROM records WHERE id = ?').get(lastInsertId())

  res.status(201).json({
    success: true,
    data: formatRecord(record)
  })
})

// PUT /records/:id
router.put('/:id', (req, res) => {
  const existing = prepare('SELECT * FROM records WHERE id = ? AND is_deleted = 0').get(req.params.id)
  if (!existing) throw new AppError(404, '记录不存在')

  const { babyId, timestamp, type, color, amount, note, operatorName } = req.body

  prepare(`
    UPDATE records SET baby_id = ?, timestamp = ?, type = ?, color = ?, amount = ?, note = ?, operator_name = ?, updated_at = ?
    WHERE id = ?
  `).run([
    babyId ?? existing.baby_id,
    timestamp ?? existing.timestamp,
    type ?? existing.type,
    color !== undefined ? color : existing.color,
    amount !== undefined ? amount : existing.amount,
    note !== undefined ? note : existing.note,
    operatorName ?? existing.operator_name,
    Date.now(),
    req.params.id
  ])

  res.json({
    success: true,
    message: '记录更新成功'
  })
})

// DELETE /records/:id
router.delete('/:id', (req, res) => {
  const existing = prepare('SELECT * FROM records WHERE id = ? AND is_deleted = 0').get(req.params.id)
  if (!existing) throw new AppError(404, '记录不存在')

  prepare('UPDATE records SET is_deleted = 1, updated_at = ? WHERE id = ?').run([Date.now(), req.params.id])

  res.json({
    success: true,
    message: '记录删除成功'
  })
})

function formatRecord(row) {
  return {
    id: row.id,
    babyId: row.baby_id,
    timestamp: row.timestamp,
    type: row.type,
    color: row.color,
    amount: row.amount,
    note: row.note,
    operatorName: row.operator_name,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  }
}

module.exports = router
