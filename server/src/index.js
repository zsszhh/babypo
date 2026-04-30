require('express-async-errors')
require('dotenv').config()
const { initDb } = require('./db/init')
const app = require('./app')

const PORT = process.env.PORT || 3000

async function startServer() {
  try {
    await initDb()
    const server = app.listen(PORT, () => {
      console.log(`✓ BabyPoopTracker server running on port ${PORT}`)
    })

    const shutdown = () => {
      console.log('\n正在保存数据...')
      const { closeDb } = require('./db/init')
      closeDb()
      process.exit(0)
    }
    process.on('SIGINT', shutdown)
    process.on('SIGTERM', shutdown)
  } catch (err) {
    console.error('数据库初始化失败:', err)
    process.exit(1)
  }
}

startServer()
