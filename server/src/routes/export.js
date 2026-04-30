const express = require('express')
const { prepare } = require('../db/init')
const { authenticate, verifyToken } = require('../middleware/auth')
const { formatRecord, formatBaby } = require('../utils/format')

const router = express.Router()

const TYPE_NAMES = {
  type1: '坚果状', type2: '香肠状（凹凸）', type3: '香肠状（裂纹）',
  type4: '香肠状（光滑）', type5: '软团状', type6: '糊状', type7: '水样'
}
const COLOR_NAMES = { yellow: '黄色', green: '绿色', brown: '棕色', black: '黑色', red: '红色' }
const AMOUNT_NAMES = { small: '少量', medium: '中等', large: '大量' }

/**
 * 导出接口认证中间件：支持 Header Bearer token 和 query token 两种方式
 * App 端 uni.downloadFile 无法设置自定义 Header，只能通过 query 传 token
 */
function exportAuth(req, res, next) {
  const authHeader = req.headers.authorization
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authenticate(req, res, next)
  }

  const token = req.query.token
  if (!token) {
    return res.status(401).json({ success: false, message: '未提供认证信息' })
  }

  try {
    const decoded = verifyToken(token)
    req.user = decoded
    next()
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Token 无效或已过期' })
  }
}

router.get('/json', exportAuth, async (req, res) => {
  const { baby_id } = req.query
  let query = 'SELECT * FROM records WHERE is_deleted = 0'
  const params = []
  if (baby_id) {
    query += ' AND baby_id = ?'
    params.push(Number(baby_id))
  }
  query += ' ORDER BY timestamp DESC'

  const records = await prepare(query).all(params)
  const babies = await prepare('SELECT * FROM babies').all()

  const data = {
    exportTime: new Date().toISOString(),
    babies: babies.map(formatBaby),
    records: records.map(formatRecord)
  }

  res.setHeader('Content-Type', 'application/json')
  res.setHeader('Content-Disposition', `attachment; filename=babypoop-export-${Date.now()}.json`)
  res.json(data)
})

router.get('/csv', exportAuth, async (req, res) => {
  const { baby_id } = req.query
  let query = 'SELECT * FROM records WHERE is_deleted = 0'
  const params = []
  if (baby_id) {
    query += ' AND baby_id = ?'
    params.push(Number(baby_id))
  }
  query += ' ORDER BY timestamp DESC'

  const records = await prepare(query).all(params)

  const headers = ['时间', '类型', '类型名称', '颜色', '排便量', '操作人', '备注']
  const csvRows = records.map(r => [
    new Date(r.timestamp).toLocaleString('zh-CN'),
    r.type,
    TYPE_NAMES[r.type] || '',
    COLOR_NAMES[r.color] || r.color || '',
    AMOUNT_NAMES[r.amount] || r.amount || '',
    r.operator_name,
    (r.note || '').replace(/,/g, '，')
  ])

  const csv = [headers.join(','), ...csvRows.map(r => r.join(','))].join('\n')

  res.setHeader('Content-Type', 'text/csv; charset=utf-8')
  res.setHeader('Content-Disposition', `attachment; filename=babypoop-export-${Date.now()}.csv`)
  res.send('\uFEFF' + csv)
})

module.exports = router
