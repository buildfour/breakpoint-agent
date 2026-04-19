import express from 'express'
import { listSessions, saveSession, compareSessions } from '../controllers/analysisController.js'

const router = express.Router()

// GET /api/sessions - List all sessions
router.get('/', listSessions)

// POST /api/sessions/:id/save - Save session results
router.post('/:id/save', saveSession)

// GET /api/sessions/compare?ids=id1,id2 - Compare two sessions
router.get('/compare', compareSessions)

export default router
