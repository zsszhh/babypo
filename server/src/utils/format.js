/**
 * 将数据库行对象格式化为 API 响应的记录格式（驼峰命名）
 */
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

/**
 * 将数据库行对象格式化为 API 响应的宝宝格式（驼峰命名）
 */
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

module.exports = { formatRecord, formatBaby }
