import {
  calculateCustomers,
  calculateMonthlyRevenue,
  calculateMonthlyCosts,
  calculateMonthlyProfit,
  calculateNetMargin
} from '../utils/formulas.js'

// Calculate 24-month projection for a scenario
export function calculateProjection(scenario) {
  const inputs = scenario.inputs
  const months = []

  let cumulativeRevenue = inputs.currentRevenue || 0
  let cumulativeCosts = 0

  for (let month = 1; month <= 24; month++) {
    // Calculate customers at this month (with churn)
    const customers = calculateCustomers(
      inputs.currentCustomers,
      inputs.monthlyNewCustomers,
      inputs.monthlyChurn,
      month
    )

    // Calculate revenue
    const revenue = calculateMonthlyRevenue(
      customers,
      inputs.pricing,
      inputs.billingCycle
    )

    // Calculate costs
    const costs = calculateMonthlyCosts(
      inputs.fixedCosts,
      customers,
      inputs.variableCostPerUnit,
      inputs.cac,
      inputs.monthlyNewCustomers
    )

    // Calculate profit/loss
    const profit = calculateMonthlyProfit(revenue, costs)
    const margin = calculateNetMargin(revenue, costs)

    // Update cumulatives
    cumulativeRevenue += revenue
    cumulativeCosts += costs

    months.push({
      month,
      customers: Math.round(customers),
      revenue: Math.round(revenue),
      costs: Math.round(costs),
      profit: Math.round(profit),
      margin: Math.round(margin * 100) / 100,
      cumulativeRevenue: Math.round(cumulativeRevenue),
      cumulativeCosts: Math.round(cumulativeCosts),
      cumulativeProfit: Math.round(cumulativeRevenue - cumulativeCosts)
    })
  }

  return months
}

// Calculate projections for all scenarios
export function calculateAllProjections(scenarios) {
  return scenarios.map(scenario => ({
    ...scenario,
    monthlyData: calculateProjection(scenario)
  }))
}

// Get summary metrics from projection
export function getProjectionSummary(monthlyData) {
  if (!monthlyData || monthlyData.length === 0) {
    return null
  }

  const month12 = monthlyData[11] // 12th month (0-indexed)
  const lastMonth = monthlyData[monthlyData.length - 1]

  return {
    mrr: monthlyData[monthlyData.length - 1]?.revenue || 0,
    revenue12mo: month12?.cumulativeRevenue || 0,
    netMargin: lastMonth?.margin || 0,
    finalCustomers: lastMonth?.customers || 0
  }
}
