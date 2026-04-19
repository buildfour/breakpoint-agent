import { generateScenarios } from './scenarioEngine.js'
import { calculateProjection } from './projectionCalculator.js'
import { calculateBreakEven } from './breakEvenCalculator.js'

// Calculate sensitivity of break-even to a specific assumption change
export function calculateBreakEvenSensitivity(baseInputs, assumption, percentChange) {
  // Create modified inputs
  const modifiedInputs = {
    ...baseInputs,
    [assumption]: baseInputs[assumption] * (1 + percentChange / 100)
  }

  // Generate scenario and calculate projection
  const scenario = {
    id: 'sensitivity-test',
    inputs: modifiedInputs,
    isBase: false
  }

  const projection = calculateProjection(scenario)
  const breakEven = calculateBreakEven(projection, baseInputs.currentRunway)

  return breakEven
}

// Calculate delta in break-even for an assumption
export function calculateBreakEvenDelta(baseBreakEven, modifiedBreakEven) {
  // Handle null values (never breaks even)
  if (baseBreakEven === null && modifiedBreakEven === null) {
    return 0 // No change if both never break even
  }
  if (baseBreakEven === null) {
    return -999 // Improvement from never to something
  }
  if (modifiedBreakEven === null) {
    return 999 // Deterioration to never breaking even
  }

  return modifiedBreakEven - baseBreakEven
}

// Test multiple percent changes for an assumption
export function testAssumptionSensitivity(baseInputs, baseBreakEven, assumption, testPercentages = [25, 50]) {
  const deltas = []

  for (const pct of testPercentages) {
    const modifiedBreakEven = calculateBreakEvenSensitivity(baseInputs, assumption, pct)
    const delta = calculateBreakEvenDelta(baseBreakEven, modifiedBreakEven)

    deltas.push({
      percentChange: pct,
      modifiedBreakEven,
      delta
    })
  }

  // Return average absolute delta as impact measure
  const avgDelta = deltas.reduce((sum, d) => sum + Math.abs(d.delta), 0) / deltas.length
  const maxDelta = Math.max(...deltas.map(d => Math.abs(d.delta)))

  return {
    avgDelta,
    maxDelta,
    tests: deltas
  }
}

// Get all testable assumptions from inputs
export function getTestableAssumptions(inputs) {
  return [
    { key: 'monthlyChurn', label: 'Monthly Churn Rate', unit: '%' },
    { key: 'cac', label: 'Customer Acquisition Cost', unit: '$' },
    { key: 'pricing', label: 'Pricing', unit: '$' },
    { key: 'fixedCosts', label: 'Fixed Costs', unit: '$' },
    { key: 'monthlyNewCustomers', label: 'Monthly New Customers', unit: '' },
    { key: 'variableCostPerUnit', label: 'Variable Cost per Unit', unit: '$' }
  ]
}
