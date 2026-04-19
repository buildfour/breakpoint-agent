// Prompt templates for input assist AI

export function buildInputAssistPrompt(fieldName, value, businessType) {
  const basePrompt = `You are a business model advisor. A user building a ${businessType} business model is entering their assumptions. Provide a brief, helpful context note about the value they entered.

Field: ${fieldName}
Value: ${value}
Business Type: ${businessType}

Requirements:
- 1-2 sentences maximum
- Include industry benchmark or typical range when relevant
- Be specific and actionable
- Use plain language, no jargon
- Don't be judgmental or discouraging
- Focus on what the number means and how it compares to typical ranges

Example responses:
- For monthly churn 3%: "At 3% monthly, approximately 31% of customers leave annually. Median for early SaaS is 2-5%."
- For CAC $150: "Your CAC is moderate for B2B SaaS. Typical ranges are $100-300 for SMB, $500-2000 for enterprise."
- For pricing $49/month: "At $49 monthly, your annual revenue per customer is $588. This positions you in the mid-tier SaaS range."

Provide the context note:`

  return basePrompt
}

export function buildBenchmarkPrompt(businessType) {
  return `What are the typical ranges for key metrics in ${businessType} businesses? Provide brief benchmarks for:
- Monthly churn rate
- Customer acquisition cost (CAC)
- Pricing ranges
- LTV:CAC ratio targets
- Gross margin expectations

Keep each metric to one sentence.`
}
