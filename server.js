import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3001

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  })
})

// API routes
import analysisRoutes from './routes/analysis.js'
import sessionsRoutes from './routes/sessions.js'
import aiRoutes from './routes/ai.js'
import vulnerabilitiesRoutes from './routes/vulnerabilities.js'
import chatRoutes from './routes/chat.js'

app.use('/api/analyze', analysisRoutes)
app.use('/api/sessions', sessionsRoutes)
app.use('/api/ai', aiRoutes)
app.use('/api/vulnerabilities', vulnerabilitiesRoutes)
app.use('/api/chat', chatRoutes)

// Error handling
app.use(notFoundHandler)
app.use(errorHandler)

app.listen(PORT, () => {
  console.log(`✓ BreakPoint server running on port ${PORT}`)
  console.log(`✓ Environment: ${process.env.NODE_ENV || 'development'}`)
  console.log(`✓ Health check: http://localhost:${PORT}/api/health`)
})
