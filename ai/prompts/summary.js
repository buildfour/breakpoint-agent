// Prompt templates for executive summary and vulnerability narratives

export function buildExecutiveSummaryPrompt(analysis) {
  const baseScenario = analysis.scenarios.find(s => s.isBase)
  const topVulnerability = analysis.vulnerabilities[0]

  return `You are a business model analyst. Generate a concise executive summary of this business model stress test.

Business Type: ${analysis.inputs.businessType}
Base Case Break-Even: ${baseScenario.breakEven ? `Month ${baseScenario.breakEven}` : 'Never within 24 months'}
LTV:CAC Ratio: ${baseScenario.ltvCac}
Net Margin: ${baseScenario.netMargin}%
Top Vulnerability: ${topVulnerability.assumption} (${topVulnerability.impact} impact)

Requirements:
- Exactly 2-3 sentences
- First sentence: state overall model health and base case break-even
- Second sentence: identify the single biggest risk and its consequence
- Third sentence: recommend one priority action
- Use plain language, no jargon
- Be direct and actionable
- Focus on what matters most

Example:
"Your model reaches break-even in 18 months under base assumptions, but is highly sensitive to churn. If churn exceeds 4% monthly, profitability extends beyond 24 months. Validate churn with cohort analysis before scaling acquisition."

Generate the executive summary:`
}

export function buildVulnerabilityNarrativePrompt(vulnerability, inputs, baseBreakEven) {
  return `You are a business model advisor. Explain why this assumption is a vulnerability and what the user should do about it.

Assumption: ${vulnerability.assumption}
Impact Level: ${vulnerability.impact}
Impact Score: ${vulnerability.impactScore}
Confidence Level: ${vulnerability.confidence}
Consequence: ${vulnerability.consequence}
Current Value: ${inputs[vulnerability.assumptionKey]}
Base Break-Even: ${baseBreakEven ? `Month ${baseBreakEven}` : 'Never'}

Generate two parts:

1. FULL EXPLANATION (2-3 sentences):
- Why is this assumption risky?
- What happens if you're wrong about it?
- How does it affect the business model?

2. SUGGESTED ACTION (1-2 sentences):
- Specifically what should the user do to validate this assumption?
- What data should they collect?
- What analysis should they run?

Keep it practical and specific. Use plain language.

Example for "Churn Rate":
EXPLANATION: "Churn is your highest risk factor. Even a small increase compounds over time, dramatically extending time to profitability. Your model assumes 3% monthly churn, but early-stage businesses often see 4-6%."
ACTION: "Run cohort analysis on your first 90 days of customers. Track week-by-week retention. Validate your churn assumption before investing heavily in acquisition."

Generate the explanation and action:`
}
