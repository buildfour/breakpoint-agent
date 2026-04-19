import { generateTextWithRetry } from './geminiClient.js'
import { isRateLimited, getRateLimitMessage, incrementRequestCount, markRateLimited } from './rateLimitHandler.js'
import { buildInputAssistPrompt } from './prompts/inputAssist.js'

// Generate AI assist comment for an input field
export async function generateInputAssist(fieldName, value, businessType) {
  // Check if rate limited
  if (isRateLimited()) {
    return {
      success: false,
      data: null,
      error: {
        code: 'CAPACITY_REACHED',
        message: getRateLimitMessage(),
        isRateLimit: true
      }
    }
  }

  try {
    incrementRequestCount()

    const prompt = buildInputAssistPrompt(fieldName, value, businessType)

    const result = await generateTextWithRetry(prompt, {
      temperature: 0.7,
      maxOutputTokens: 150
    })

    // If rate limited, mark it
    if (result.error?.isRateLimit) {
      markRateLimited()
    }

    return result
  } catch (error) {
    return {
      success: false,
      data: null,
      error: {
        code: 'GENERATION_ERROR',
        message: error.message,
        userMessage: 'Unable to generate context note. You can continue without it.'
      }
    }
  }
}

// Get field label mapping
const FIELD_LABELS = {
  'pricing': 'Pricing per customer',
  'monthlyChurn': 'Monthly churn rate',
  'cac': 'Customer acquisition cost',
  'fixedCosts': 'Fixed monthly costs',
  'variableCostPerUnit': 'Variable cost per customer',
  'monthlyNewCustomers': 'Monthly new customers target',
  'currentRevenue': 'Current monthly revenue',
  'currentCustomers': 'Current customer count',
  'currentRunway': 'Current runway'
}

export function getFieldLabel(fieldName) {
  return FIELD_LABELS[fieldName] || fieldName
}
