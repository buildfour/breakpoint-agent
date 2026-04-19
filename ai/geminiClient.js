import { GoogleGenerativeAI } from '@google/generative-ai'
import dotenv from 'dotenv'

dotenv.config()

// Initialize Gemini client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)

// Model configuration
const MODEL_NAME = 'gemini-3-flash-preview'

// Get Gemini model instance
export function getModel(config = {}) {
  const defaultConfig = {
    temperature: 0.7,
    topP: 0.95,
    topK: 40,
    maxOutputTokens: 2048,
    ...config
  }

  return genAI.getGenerativeModel({
    model: MODEL_NAME,
    generationConfig: defaultConfig
  })
}

// Generate text from prompt
export async function generateText(prompt, config = {}) {
  try {
    const model = getModel(config)
    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text()

    return {
      success: true,
      data: text,
      error: null
    }
  } catch (error) {
    return handleGeminiError(error)
  }
}

// Generate streaming text (for chat and typewriter effects)
export async function generateStreamingText(prompt, config = {}) {
  try {
    const model = getModel(config)
    const result = await model.generateContentStream(prompt)

    return {
      success: true,
      stream: result.stream,
      error: null
    }
  } catch (error) {
    return handleGeminiError(error)
  }
}

// Handle Gemini API errors with user-friendly messages
function handleGeminiError(error) {
  console.error('Gemini API Error:', error)

  // Rate limit (429) - return user-friendly message
  if (error.status === 429 || error.message?.includes('RESOURCE_EXHAUSTED')) {
    return {
      success: false,
      data: null,
      error: {
        code: 'CAPACITY_REACHED',
        message: "We've hit our daily analysis capacity. Please check back tomorrow to continue testing your business model.",
        userMessage: "We've hit our daily analysis capacity. Please check back tomorrow to continue testing your business model.",
        isRateLimit: true
      }
    }
  }

  // Invalid API key
  if (error.status === 401 || error.status === 403) {
    return {
      success: false,
      data: null,
      error: {
        code: 'AUTH_ERROR',
        message: 'API authentication failed',
        userMessage: 'Unable to connect to AI service. Please try again later.'
      }
    }
  }

  // Network or timeout errors
  if (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT') {
    return {
      success: false,
      data: null,
      error: {
        code: 'NETWORK_ERROR',
        message: 'Network connection failed',
        userMessage: 'Connection issue. Please check your internet and try again.'
      }
    }
  }

  // Generic error
  return {
    success: false,
    data: null,
    error: {
      code: 'UNKNOWN_ERROR',
      message: error.message || 'An unexpected error occurred',
      userMessage: 'Something went wrong. Please try again in a moment.'
    }
  }
}

// Retry with exponential backoff for transient errors
export async function generateTextWithRetry(prompt, config = {}, maxRetries = 3) {
  let lastError = null

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    const result = await generateText(prompt, config)

    // Success
    if (result.success) {
      return result
    }

    // Don't retry rate limits or auth errors
    if (result.error?.isRateLimit || result.error?.code === 'AUTH_ERROR') {
      return result
    }

    // Save error and retry with backoff
    lastError = result.error
    if (attempt < maxRetries) {
      const backoffMs = Math.pow(2, attempt) * 1000 // 2s, 4s, 8s
      await new Promise(resolve => setTimeout(resolve, backoffMs))
    }
  }

  // All retries failed
  return {
    success: false,
    data: null,
    error: lastError
  }
}

// Test connection
export async function testConnection() {
  const result = await generateText('Say "OK" if you can read this.', {
    temperature: 0,
    maxOutputTokens: 10
  })

  return result.success
}
