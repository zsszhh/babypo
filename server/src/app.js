const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const morgan = require('morgan')

const authRoutes = require('./routes/auth')
const recordRoutes = require('./routes/records')
const babyRoutes = require('./routes/babies')
const syncRoutes = require('./routes/sync')
const statisticsRoutes = require('./routes/statistics')
const exportRoutes = require('./routes/export')
const { errorHandler } = require('./middleware/errorHandler')

const app = express()

app.use(helmet())
app.use(cors({
  origin: '*',
  exposedHeaders: ['content-disposition']
}))
app.use(morgan('short'))
app.use(express.json())

app.use('/api/v1/auth', authRoutes)
app.use('/api/v1/records', recordRoutes)
app.use('/api/v1/babies', babyRoutes)
app.use('/api/v1/sync', syncRoutes)
app.use('/api/v1/statistics', statisticsRoutes)
app.use('/api/v1/export', exportRoutes)

app.get('/api/v1/health', (req, res) => {
  res.json({ success: true, data: { status: 'ok' } })
})

app.use(errorHandler)

module.exports = app
