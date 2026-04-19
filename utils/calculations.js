// Financial calculation helper functions

// Convert monthly churn to annual churn
export function monthlyToAnnualChurn(monthlyChurnPercent) {
  return (1 - Math.pow(1 - monthlyChurnPercent / 100, 12)) * 100
}

// Calculate Lifetime Value
export function calculateLTV(arpu, monthlyChurnPercent) {
  if (monthlyChurnPercent === 0) return Infinity
  return arpu / (monthlyChurnPercent / 100)
}

// Calculate LTV:CAC ratio
export function calculateLTVCAC(ltv, cac) {
  if (cac === 0) return Infinity
  return ltv / cac
}

// Calculate gross margin percentage
export function calculateGrossMargin(revenue, costs) {
  if (revenue === 0) return 0
  return ((revenue - costs) / revenue) * 100
}

// Apply percentage change to a value
export function applyPercentageChange(value, percentChange) {
  return value * (1 + percentChange / 100)
}

// Parse numeric input (handles string or number)
export function parseNumeric(value, defaultValue = 0) {
  const num = parseFloat(value)
  return isNaN(num) ? defaultValue : num
}

// Format currency
export function formatCurrency(value) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value)
}

// Format percentage
export function formatPercentage(value, decimals = 1) {
  return `${value.toFixed(decimals)}%`
}
