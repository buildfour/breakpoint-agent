import { generateTextWithRetry } from './geminiClient.js'
import { isRateLimited, getRateLimitMessage, incrementRequestCount, markRateLimited } from './rateLimitHandler.js'
import { buildExecutiveSummaryPrompt } from './prompts/summary.js'

// Generate executive summary for analysis
export async function generateExecutiveSummary(analysis) {
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

    const prompt = buildExecutiveSummaryPrompt(analysis)

    const result = await generateTextWithRetry(prompt, {
      temperature: 0.7,
      maxOutputTokens: 1024
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
        userMessage: 'Unable to generate summary. The analysis data is still available.'
      }
    }
  }
}

// Generate fallback summary (used when AI unavailable)
export function generateFallbackSummary(analysis) {
  const baseScenario = analysis.scenarios.find(s => s.isBase)
  const topVulnerability = analysis.vulnerabilities[0]

  const breakEvenText = baseScenario.breakEven
    ? `reaches break-even in ${baseScenario.breakEven} months`
    : 'does not reach break-even within 24 months'

  const healthText = baseScenario.health === 'healthy'
    ? 'shows strong fundamentals'
    : baseScenario.health === 'borderline'
    ? 'shows moderate risk'
    : 'shows significant challenges'

  return `Your business model ${breakEvenText} and ${healthText}. The highest vulnerability is ${topVulnerability.assumption} (${topVulnerability.impact} impact). Focus on validating this assumption before scaling.`
}
