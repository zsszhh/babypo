const express = require('express')
const { prepare } = require('../db/init')
const { authenticate } = require('../middleware/auth')

const router = express.Router()

router.use(authenticate)

const TYPE_NAMES = {
  type1: '坚果状', type2: '香肠状（凹凸）', type3: '香肠状（裂纹）',
  type4: '香肠状（光滑）', type5: '软团状', type6: '糊状', type7: '水样'
}
const COLOR_NAMES = { yellow: '黄色', green: '绿色', brown: '棕色', black: '黑色', red: '红色' }
const AMOUNT_NAMES = { small: '少量', medium: '中等', large: '大量' }

// GET /export/json
router.get('/json', (req, res) => {
  const records = prepare('SELECT * FROM records WHERE is_deleted = 0 ORDER BY timestamp DESC').all()
  const babies = prepare('SELECT * FROM babies').all()

  const data = {
    exportTime: new Date().toISOString(),
    babies: babies.map(formatBaby),
    records: records.map(formatRecord)
  }

  res.setHeader('Content-Type', 'application/json')
  res.setHeader('Content-Disposition', `attachment; filename=babypoop-export-${Date.now()}.json`)
  res.json(data)
})

// GET /export/csv
router.get('/csv', (req, res) => {
  const records = prepare('SELECT * FROM records WHERE is_deleted = 0 ORDER BY timestamp DESC').all()

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
  res.send('﻿' + csv)
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
