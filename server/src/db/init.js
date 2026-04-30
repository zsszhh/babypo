const path = require('path')
const fs = require('fs')
const sqlite3 = require('sqlite3').verbose()

const DB_PATH = process.env.DB_PATH || path.join(__dirname, '..', '..', 'data', 'babypoop.db')

let db = null

/**
 * 初始化数据库连接和表结构，确保默认数据插入完成
 * @returns {Promise<sqlite3.Database>} 数据库连接实例
 */
function initDb() {
  if (db) return Promise.resolve(db)

  return new Promise((resolve, reject) => {
    const dir = path.dirname(DB_PATH)
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }

    db = new sqlite3.Database(DB_PATH, (err) => {
      if (err) {
        console.error('数据库连接失败:', err)
        return reject(new Error('数据库连接失败: ' + err.message))
      }

      console.log('SQLite3 数据库连接成功')

      db.serialize(() => {
        db.run('PRAGMA foreign_keys = ON')

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

        db.run('INSERT OR IGNORE INTO babies (id, name, birthdate, created_at, updated_at) VALUES (1, \'宝宝\', 0, ?, ?)',
          [Date.now(), Date.now()],
          (err) => {
            if (err) {
              console.error('默认宝宝数据创建失败:', err.message)
            } else {
              console.log('默认宝宝数据已就绪')
            }
          }
        )
        console.log('数据库表初始化完成')
        resolve(db)
      })
    })
  })
}

function getDb() {
  if (!db) throw new Error('数据库未初始化，请先调用 initDb()')
  return db
}

function closeDb() {
  if (db) {
    db.close()
    db = null
  }
}

/**
 * 创建参数化查询的 Promise 包装
 */
function prepare(sql) {
  const stmt = db.prepare(sql)
  return {
    get(...params) {
      return new Promise((resolve, reject) => {
        stmt.get(...params, (err, row) => {
          if (err) reject(err)
          else resolve(row)
        })
      })
    },
    all(...params) {
      return new Promise((resolve, reject) => {
        stmt.all(...params, (err, rows) => {
          if (err) reject(err)
          else resolve(rows)
        })
      })
    },
    run(...params) {
      return new Promise((resolve, reject) => {
        stmt.run(...params, function(err) {
          if (err) reject(err)
          else resolve({ changes: this.changes, lastID: this.lastID })
        })
      })
    }
  }
}

module.exports = { initDb, getDb, closeDb, prepare }
