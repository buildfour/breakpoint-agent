import { generateStreamingText, generateTextWithRetry } from './geminiClient.js'
import { isRateLimited, getRateLimitMessage, incrementRequestCount, markRateLimited } from './rateLimitHandler.js'
import { buildAnalysisContext, formatContextForPrompt } from './contextBuilder.js'
import { buildChatSystemPrompt, buildChatUserPrompt } from './prompts/chat.js'

// Generate chat response with analysis context
export async function generateChatResponse(userMessage, analysisId, sessions) {
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

    // Load analysis session
    const session = sessions.find(s => s.id === analysisId)
    if (!session) {
      return {
        success: false,
        data: null,
        error: {
          code: 'SESSION_NOT_FOUND',
          message: 'Analysis session not found',
          userMessage: 'Analysis not found. Please start a new analysis.'
        }
      }
    }

    // Build context
    const context = buildAnalysisContext(session)
    const formattedContext = formatContextForPrompt(context)

    // Build prompt
    const systemPrompt = buildChatSystemPrompt(formattedContext)
    const fullPrompt = `${systemPrompt}\n\nUser question: ${userMessage}`

    const result = await generateTextWithRetry(fullPrompt, {
      temperature: 0.7,
      maxOutputTokens: 500
    })

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
        userMessage: 'Unable to generate response. Please try again.'
      }
    }
  }
}

// Generate streaming chat response for real-time typewriter effect
export async function generateStreamingChatResponse(userMessage, analysisId, sessions) {
  if (isRateLimited()) {
    return {
      success: false,
      stream: null,
      error: {
        code: 'CAPACITY_REACHED',
        message: getRateLimitMessage(),
        isRateLimit: true
      }
    }
  }

  try {
    incrementRequestCount()

    const session = sessions.find(s => s.id === analysisId)
    if (!session) {
      return {
        success: false,
        stream: null,
        error: {
          code: 'SESSION_NOT_FOUND',
          message: 'Analysis session not found'
        }
      }
    }

    const context = buildAnalysisContext(session)
    const formattedContext = formatContextForPrompt(context)
    const systemPrompt = buildChatSystemPrompt(formattedContext)
    const fullPrompt = `${systemPrompt}\n\nUser question: ${userMessage}`

    const result = await generateStreamingText(fullPrompt, {
      temperature: 0.7,
      maxOutputTokens: 500
    })

    if (result.error?.isRateLimit) {
      markRateLimited()
    }

    return result
  } catch (error) {
    return {
      success: false,
      stream: null,
      error: {
        code: 'GENERATION_ERROR',
        message: error.message
      }
    }
  }
}
