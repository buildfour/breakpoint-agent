import express from 'express'
import { generateInputAssist, getFieldLabel } from '../ai/inputAssist.js'

const router = express.Router()

// POST /api/ai/input-assist - Get AI context for input field
router.post('/input-assist', async (req, res, next) => {
  try {
    const { fieldName, value, businessType } = req.body

    if (!fieldName || value === undefined || !businessType) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Missing required fields: fieldName, value, businessType'
        }
      })
    }

    const fieldLabel = getFieldLabel(fieldName)
    const result = await generateInputAssist(fieldLabel, value, businessType)

    if (result.success) {
      res.json({
        success: true,
        data: {
          fieldName,
          note: result.data
        }
      })
    } else {
      // Return error but don't fail the request - input assist is optional
      res.json({
        success: false,
        data: {
          fieldName,
          note: null
        },
        error: result.error
      })
    }
  } catch (error) {
    next(error)
  }
})

export default router
