const express = require('express')
const { prepare } = require('../db/init')
const { authenticate } = require('../middleware/auth')

const router = express.Router()

router.use(authenticate)

// GET /statistics/summary
router.get('/summary', (req, res) => {
  const { baby_id = 1, days = 7 } = req.query

  const since = Date.now() - Number(days) * 24 * 60 * 60 * 1000

  const rows = prepare(`
    SELECT type, color, COUNT(*) as count
    FROM records
    WHERE baby_id = ? AND timestamp >= ? AND is_deleted = 0
    GROUP BY type, color
  `).all([Number(baby_id), since])

  const totalCount = rows.reduce((sum, r) => sum + r.count, 0)

  const typeDistribution = { type1: 0, type2: 0, type3: 0, type4: 0, type5: 0, type6: 0, type7: 0 }
  const colorDistribution = {}

  for (const row of rows) {
    if (typeDistribution[row.type] !== undefined) {
      typeDistribution[row.type] += row.count
    }
    if (row.color) {
      colorDistribution[row.color] = (colorDistribution[row.color] || 0) + row.count
    }
  }

  res.json({
    success: true,
    data: {
      totalCount,
      avgPerDay: Number((totalCount / Number(days)).toFixed(1)),
      typeDistribution,
      colorDistribution
    }
  })
})

module.exports = router
