// Core financial formulas for projections

// Calculate customer count at a given month with churn
export function calculateCustomers(startingCustomers, monthlyNewCustomers, monthlyChurnRate, month) {
  // Churn compounds: Customers_n = (Customers_n-1 + New) * (1 - churn)
  let customers = startingCustomers

  for (let m = 1; m <= month; m++) {
    customers = (customers + monthlyNewCustomers) * (1 - monthlyChurnRate / 100)
  }

  return Math.max(0, customers)
}

// Calculate monthly revenue
export function calculateMonthlyRevenue(customers, pricePerCustomer, billingCycle) {
  const monthlyPrice = billingCycle === 'annual' ? pricePerCustomer / 12 : pricePerCustomer
  return customers * monthlyPrice
}

// Calculate monthly costs
export function calculateMonthlyCosts(fixedCosts, customers, variableCostPerCustomer, cac, newCustomers) {
  const variableCosts = customers * variableCostPerCustomer
  const acquisitionCosts = newCustomers * cac
  return fixedCosts + variableCosts + acquisitionCosts
}

// Calculate gross margin (before fixed costs and CAC)
export function calculateGrossMarginPerCustomer(pricePerCustomer, variableCostPerCustomer) {
  return pricePerCustomer - variableCostPerCustomer
}

// Calculate LTV (Lifetime Value)
export function calculateLTV(arpu, monthlyChurnPercent) {
  if (monthlyChurnPercent === 0) return Infinity
  return arpu / (monthlyChurnPercent / 100)
}

// Calculate LTV:CAC ratio
export function calculateLTVtoCACRatio(ltv, cac) {
  if (cac === 0) return Infinity
  return ltv / cac
}

// Calculate monthly profit/loss
export function calculateMonthlyProfit(revenue, costs) {
  return revenue - costs
}

// Calculate net margin percentage
export function calculateNetMargin(revenue, costs) {
  if (revenue === 0) return 0
  return ((revenue - costs) / revenue) * 100
}
