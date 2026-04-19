// Calculate break-even point for a scenario

export function calculateBreakEven(monthlyData, currentRunway = 0) {
  if (!monthlyData || monthlyData.length === 0) {
    return null
  }

  // Find first month where cumulative revenue >= cumulative costs
  for (let i = 0; i < monthlyData.length; i++) {
    const month = monthlyData[i]

    if (month.cumulativeRevenue >= month.cumulativeCosts) {
      return month.month
    }
  }

  // Never reaches break-even within 24 months
  return null
}

// Calculate break-even with runway consideration
export function calculateBreakEvenWithRunway(monthlyData, currentRunway) {
  const breakEvenMonth = calculateBreakEven(monthlyData, currentRunway)

  if (!breakEvenMonth) {
    return {
      breakEvenMonth: null,
      runwayExhausted: true,
      monthsUntilRunwayEnd: currentRunway
    }
  }

  return {
    breakEvenMonth,
    runwayExhausted: breakEvenMonth > currentRunway,
    monthsUntilRunwayEnd: currentRunway
  }
}

// Calculate how much runway is consumed before break-even
export function calculateRunwayConsumption(monthlyData, currentRunway) {
  let totalBurn = 0

  for (let i = 0; i < monthlyData.length && i < currentRunway; i++) {
    const month = monthlyData[i]
    if (month.profit < 0) {
      totalBurn += Math.abs(month.profit)
    }
  }

  return {
    totalBurn: Math.round(totalBurn),
    monthsOfRunwayUsed: Math.min(monthlyData.length, currentRunway),
    runwayRemaining: Math.max(0, currentRunway - monthlyData.length)
  }
}

// Check if scenario is profitable
export function isProfitable(monthlyData) {
  const lastMonth = monthlyData[monthlyData.length - 1]
  return lastMonth.cumulativeProfit > 0
}

// Get financial health status
export function getFinancialHealth(breakEvenMonth, ltvCacRatio, netMargin) {
  if (!breakEvenMonth || breakEvenMonth > 24) {
    return 'failing'
  }

  if (breakEvenMonth <= 12 && ltvCacRatio >= 3 && netMargin >= 20) {
    return 'healthy'
  }

  if (breakEvenMonth <= 18 && ltvCacRatio >= 2.5 && netMargin >= 15) {
    return 'borderline'
  }

  return 'borderline'
}
