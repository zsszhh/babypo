const express = require('express')
const { prepare } = require('../db/init')
const { authenticate } = require('../middleware/auth')
const { AppError } = require('../middleware/errorHandler')
const { formatRecord } = require('../utils/format')

const router = express.Router()

router.use(authenticate)

router.get('/', async (req, res) => {
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

  const limitVal = Number(limit) || 100
  const offsetVal = Number(offset) || 0

  const countRow = await prepare(`SELECT COUNT(*) as total FROM records ${where}`).get(params)
  const records = await prepare(`SELECT * FROM records ${where} ORDER BY timestamp DESC LIMIT ? OFFSET ?`).all([...params, limitVal, offsetVal])

  res.json({
    success: true,
    data: {
      records: records.map(formatRecord),
      total: countRow.total
    }
  })
})

router.get('/:id', async (req, res) => {
  const record = await prepare('SELECT * FROM records WHERE id = ? AND is_deleted = 0').get(req.params.id)
  if (!record) throw new AppError(404, '记录不存在')

  res.json({
    success: true,
    data: formatRecord(record)
  })
})

router.post('/', async (req, res) => {
  const { babyId = 1, timestamp, type, color, amount, note, operatorName } = req.body

  if (!timestamp || !type || !operatorName) {
    throw new AppError(400, '缺少必填字段：timestamp, type, operatorName')
  }

  const now = Date.now()
  const result = await prepare(`
    INSERT INTO records (baby_id, timestamp, type, color, amount, note, operator_name, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run([babyId, timestamp, type, color || null, amount || null, note || null, operatorName, now, now])

  const record = await prepare('SELECT * FROM records WHERE id = ?').get(result.lastID)

  res.status(201).json({
    success: true,
    data: formatRecord(record)
  })
})

router.put('/:id', async (req, res) => {
  const existing = await prepare('SELECT * FROM records WHERE id = ? AND is_deleted = 0').get(req.params.id)
  if (!existing) throw new AppError(404, '记录不存在')

  const { babyId, timestamp, type, color, amount, note, operatorName } = req.body

  await prepare(`
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

router.delete('/:id', async (req, res) => {
  const existing = await prepare('SELECT * FROM records WHERE id = ? AND is_deleted = 0').get(req.params.id)
  if (!existing) throw new AppError(404, '记录不存在')

  await prepare('UPDATE records SET is_deleted = 1, updated_at = ? WHERE id = ?').run([Date.now(), req.params.id])

  res.json({
    success: true,
    message: '记录删除成功'
  })
})

module.exports = router
