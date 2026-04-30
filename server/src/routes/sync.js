const express = require('express')
const { prepare, lastInsertId } = require('../db/init')
const { authenticate } = require('../middleware/auth')

const router = express.Router()

router.use(authenticate)

// POST /sync/pull
router.post('/pull', (req, res) => {
  const { lastSyncTime = 0 } = req.body

  const records = prepare('SELECT * FROM records WHERE updated_at > ?').all([Number(lastSyncTime)])

  const deletedIds = records.filter(r => r.is_deleted).map(r => r.id)
  const activeRecords = records.filter(r => !r.is_deleted)

  res.json({
    success: true,
    data: {
      records: activeRecords.map(formatRecord),
      deletedIds,
      serverTime: Date.now()
    }
  })
})

// POST /sync/push
router.post('/push', (req, res) => {
  const { records = [] } = req.body

  const mapping = []

  for (const record of records) {
    if (record.id) {
      const existing = prepare('SELECT * FROM records WHERE id = ?').get(record.id)
      if (existing && record.updatedAt > existing.updated_at) {
        prepare(`
          UPDATE records SET baby_id = ?, timestamp = ?, type = ?, color = ?, amount = ?, note = ?, operator_name = ?, updated_at = ?
          WHERE id = ?
        `).run([
          record.babyId, record.timestamp, record.type,
          record.color || null, record.amount || null, record.note || null,
          record.operatorName, record.updatedAt, record.id
        ])
      }
    } else {
      prepare(`
        INSERT INTO records (baby_id, timestamp, type, color, amount, note, operator_name, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run([
        record.babyId, record.timestamp, record.type,
        record.color || null, record.amount || null, record.note || null,
        record.operatorName, record.createdAt || Date.now(), record.updatedAt || Date.now()
      ])
      if (record.localId) {
        mapping.push({ localId: record.localId, serverId: lastInsertId() })
      }
    }
  }

  res.json({
    success: true,
    data: { mapping }
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
