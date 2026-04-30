const path = require('path')
const fs = require('fs')
const initSqlJs = require('sql.js')

const DB_PATH = process.env.DB_PATH || path.join(__dirname, '..', '..', 'data', 'babypoop.db')

let db = null
let _lastInsertId = 0

async function initDb() {
  if (db) return db

  const SQL = await initSqlJs()
  const dir = path.dirname(DB_PATH)

  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }

  if (fs.existsSync(DB_PATH)) {
    const buffer = fs.readFileSync(DB_PATH)
    db = new SQL.Database(buffer)
  } else {
    db = new SQL.Database()
  }

  db.run('PRAGMA foreign_keys = ON')
  initTables()
  return db
}

function getDb() {
  if (!db) throw new Error('数据库未初始化，请先调用 initDb()')
  return db
}

function initTables() {
  db.run(`
    CREATE TABLE IF NOT EXISTS babies (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      birthdate INTEGER NOT NULL,
      gender TEXT,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    )
  `)
  db.run(`
    CREATE TABLE IF NOT EXISTS records (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      baby_id INTEGER NOT NULL DEFAULT 1,
      timestamp INTEGER NOT NULL,
      type TEXT NOT NULL,
      color TEXT,
      amount TEXT,
      note TEXT,
      operator_name TEXT NOT NULL,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL,
      is_deleted INTEGER NOT NULL DEFAULT 0,
      FOREIGN KEY (baby_id) REFERENCES babies(id)
    )
  `)

  db.run('CREATE INDEX IF NOT EXISTS idx_records_baby_id ON records(baby_id)')
  db.run('CREATE INDEX IF NOT EXISTS idx_records_timestamp ON records(timestamp)')
  db.run('CREATE INDEX IF NOT EXISTS idx_records_updated_at ON records(updated_at)')

  // 默认宝宝
  const existing = db.exec('SELECT id FROM babies WHERE id = 1')
  if (existing.length === 0 || existing[0].values.length === 0) {
    const now = Date.now()
    db.run('INSERT INTO babies (id, name, birthdate, created_at, updated_at) VALUES (?, ?, ?, ?, ?)',
      [1, '宝宝', now, now, now])
  }

  saveDb()
}

function saveDb() {
  const data = db.export()
  fs.writeFileSync(DB_PATH, Buffer.from(data))
}

// 查询包装器，兼容 better-sqlite3 风格
function prepare(sql) {
  const stmt = db.prepare(sql)
  return {
    get(...params) {
      const flat = params.flat()
      if (flat.length === 0) {
        const hasRow = stmt.step()
        const result = hasRow ? stmt.getAsObject() : undefined
        stmt.free()
        return result
      }
      const result = stmt.getAsObject(flat)
      stmt.free()
      return result && Object.keys(result).length ? result : undefined
    },
    all(...params) {
      const flat = params.flat()
      if (flat.length > 0) stmt.bind(flat)
      const rows = []
      while (stmt.step()) {
        rows.push(stmt.getAsObject())
      }
      stmt.free()
      return rows
    },
    run(...params) {
      const flat = params.flat()
      stmt.run(flat)
      stmt.free()
      _lastInsertId = db.exec('SELECT last_insert_rowid()')[0].values[0][0]
      saveDb()
      return { changes: db.getRowsModified() }
    }
  }
}

function lastInsertId() {
  return _lastInsertId
}

function closeDb() {
  if (db) {
    saveDb()
    db.close()
    db = null
  }
}

module.exports = { initDb, getDb, saveDb, closeDb, prepare, lastInsertId }
