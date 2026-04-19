// Build context from analysis for chat

export function buildAnalysisContext(session) {
  if (!session) return null

  const baseScenario = session.scenarios?.find(s => s.isBase)
  const topVulnerabilities = session.vulnerabilities?.slice(0, 5) || []

  const context = {
    businessType: session.inputs?.businessType,
    baseCase: baseScenario ? {
      breakEven: baseScenario.breakEven,
      ltvCac: baseScenario.ltvCac,
      netMargin: baseScenario.netMargin,
      mrr: baseScenario.mrr,
      revenue12mo: baseScenario.revenue12mo
    } : null,
    scenarioCount: session.scenarios?.length || 0,
    vulnerabilities: topVulnerabilities.map(v => ({
      assumption: v.assumption,
      impact: v.impact,
      consequence: v.consequence
    })),
    inputs: session.inputs,
    executiveSummary: session.executiveSummary
  }

  return context
}

// Format context as readable text for prompt
export function formatContextForPrompt(context) {
  if (!context) return 'No analysis context available.'

  let text = `Business Type: ${context.businessType}\n\n`

  text += `Base Case Results:\n`
  text += `- Break-Even: ${context.baseCase?.breakEven ? `Month ${context.baseCase.breakEven}` : 'Never within 24 months'}\n`
  text += `- LTV:CAC: ${context.baseCase?.ltvCac}\n`
  text += `- Net Margin: ${context.baseCase?.netMargin}%\n`
  text += `- MRR: $${context.baseCase?.mrr?.toLocaleString()}\n`
  text += `- 12-Month Revenue: $${context.baseCase?.revenue12mo?.toLocaleString()}\n\n`

  text += `Scenarios Tested: ${context.scenarioCount}\n\n`

  text += `Top Vulnerabilities:\n`
  context.vulnerabilities.forEach((v, i) => {
    text += `${i + 1}. ${v.assumption} (${v.impact} impact) - ${v.consequence}\n`
  })

  if (context.executiveSummary) {
    text += `\nExecutive Summary: ${context.executiveSummary}\n`
  }

  return text
}
