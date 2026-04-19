// Rate limit tracking and handling

const rateLimitState = {
  isRateLimited: false,
  rateLimitUntil: null,
  requestCount: 0,
  lastReset: Date.now()
}

// Check if currently rate limited
export function isRateLimited() {
  if (rateLimitState.isRateLimited && rateLimitState.rateLimitUntil) {
    if (Date.now() < rateLimitState.rateLimitUntil) {
      return true
    } else {
      // Rate limit expired, reset
      resetRateLimit()
      return false
    }
  }
  return false
}

// Mark as rate limited
export function markRateLimited(durationMs = 24 * 60 * 60 * 1000) {
  rateLimitState.isRateLimited = true
  rateLimitState.rateLimitUntil = Date.now() + durationMs
}

// Reset rate limit status
export function resetRateLimit() {
  rateLimitState.isRateLimited = false
  rateLimitState.rateLimitUntil = null
}

// Get user-friendly rate limit message
export function getRateLimitMessage() {
  const resetTime = rateLimitState.rateLimitUntil
  if (resetTime) {
    const resetDate = new Date(resetTime)
    const tomorrow = resetDate.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    })
    return `We've hit our daily analysis capacity. Please check back on ${tomorrow} to continue testing your business model.`
  }
  return "We've hit our daily analysis capacity. Please check back tomorrow to continue testing your business model."
}

// Increment request counter
export function incrementRequestCount() {
  rateLimitState.requestCount++

  // Reset counter every hour
  const hoursSinceReset = (Date.now() - rateLimitState.lastReset) / (1000 * 60 * 60)
  if (hoursSinceReset >= 1) {
    rateLimitState.requestCount = 1
    rateLimitState.lastReset = Date.now()
  }
}

// Get rate limit status
export function getRateLimitStatus() {
  return {
    isRateLimited: rateLimitState.isRateLimited,
    rateLimitUntil: rateLimitState.rateLimitUntil,
    requestCount: rateLimitState.requestCount,
    message: isRateLimited() ? getRateLimitMessage() : null
  }
}
