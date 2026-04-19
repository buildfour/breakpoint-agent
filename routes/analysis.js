import express from 'express'
import { createAnalysis, getAnalysis } from '../controllers/analysisController.js'

const router = express.Router()

// POST /api/analyze - Create new analysis
router.post('/', createAnalysis)

// GET /api/analysis/:id - Get analysis by ID
router.get('/:id', getAnalysis)

export default router
