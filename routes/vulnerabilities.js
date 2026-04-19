import express from 'express'
import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const STORAGE_PATH = path.join(__dirname, '../storage/sessions.json')

const router = express.Router()

// GET /api/vulnerabilities/:analysisId - Get enriched vulnerabilities
router.get('/:analysisId', async (req, res, next) => {
  try {
    const { analysisId } = req.params

    const data = await fs.readFile(STORAGE_PATH, 'utf-8')
    const sessions = JSON.parse(data)
    const session = sessions.find(s => s.id === analysisId)

    if (!session) {
      return res.status(404).json({
        success: false,
        error: { message: 'Analysis not found' }
      })
    }

    res.json({
      success: true,
      data: {
        vulnerabilities: session.vulnerabilities,
        vulnerabilitySummary: session.vulnerabilitySummary
      }
    })
  } catch (error) {
    next(error)
  }
})

export default router
