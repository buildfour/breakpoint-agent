import { applyPercentageChange, parseNumeric } from '../utils/calculations.js'
import { SCENARIO_TYPES, selectScenariosForBusinessType } from './scenarioTypes.js'

// Generate all scenarios from user inputs
export function generateScenarios(inputs) {
  const scenarios = []

  // Parse inputs to numbers
  const parsedInputs = {
    businessType: inputs.businessType,
    pricing: parseNumeric(inputs.pricing),
    billingCycle: inputs.billingCycle || 'monthly',
    fixedCosts: parseNumeric(inputs.fixedCosts),
    variableCostPerUnit: parseNumeric(inputs.variableCostPerUnit),
    cac: parseNumeric(inputs.cac),
    monthlyNewCustomers: parseNumeric(inputs.monthlyNewCustomers),
    monthlyChurn: parseNumeric(inputs.monthlyChurn),
    currentRevenue: parseNumeric(inputs.currentRevenue),
    currentCustomers: parseNumeric(inputs.currentCustomers),
    currentRunway: parseNumeric(inputs.currentRunway)
  }

  // 1. Base Case - exact user inputs
  scenarios.push({
    id: 'base',
    name: 'Base Case',
    type: SCENARIO_TYPES.BASE,
    badge: 'Base',
    isBase: true,
    inputs: { ...parsedInputs }
  })

  // 2. Select scenario templates based on business type
  const selectedTemplates = selectScenariosForBusinessType(inputs.businessType)

  // 3. Generate stress scenarios
  selectedTemplates.stress.forEach(template => {
    const modifiedInputs = applyModifications(parsedInputs, template.modifications)
    scenarios.push({
      id: template.id,
      name: template.name,
      type: SCENARIO_TYPES.STRESS,
      badge: 'Stress',
      isBase: false,
      inputs: modifiedInputs,
      modifications: template.modifications
    })
  })

  // 4. Generate optimistic scenarios
  selectedTemplates.optimistic.forEach(template => {
    const modifiedInputs = applyModifications(parsedInputs, template.modifications)
    scenarios.push({
      id: template.id,
      name: template.name,
      type: SCENARIO_TYPES.OPTIMISTIC,
      badge: 'Optimistic',
      isBase: false,
      inputs: modifiedInputs,
      modifications: template.modifications
    })
  })

  // 5. Generate combined stress scenarios
  selectedTemplates.combined.forEach(template => {
    const modifiedInputs = applyModifications(parsedInputs, template.modifications)
    scenarios.push({
      id: template.id,
      name: template.name,
      type: SCENARIO_TYPES.COMBINED,
      badge: 'Combined',
      isBase: false,
      inputs: modifiedInputs,
      modifications: template.modifications
    })
  })

  return scenarios
}

// Apply modifications to inputs
function applyModifications(baseInputs, modifications) {
  const modified = { ...baseInputs }

  for (const [field, percentChange] of Object.entries(modifications)) {
    if (modified[field] !== undefined) {
      modified[field] = applyPercentageChange(modified[field], percentChange)
      // Round to 2 decimals for cleaner values
      modified[field] = Math.round(modified[field] * 100) / 100
    }
  }

  return modified
}

// Get scenario by ID from generated scenarios
export function getScenarioById(scenarios, scenarioId) {
  return scenarios.find(s => s.id === scenarioId)
}

// Count scenarios by type
export function countScenariosByType(scenarios) {
  return {
    total: scenarios.length,
    base: scenarios.filter(s => s.type === SCENARIO_TYPES.BASE).length,
    stress: scenarios.filter(s => s.type === SCENARIO_TYPES.STRESS).length,
    optimistic: scenarios.filter(s => s.type === SCENARIO_TYPES.OPTIMISTIC).length,
    combined: scenarios.filter(s => s.type === SCENARIO_TYPES.COMBINED).length,
    custom: scenarios.filter(s => s.type === SCENARIO_TYPES.CUSTOM).length
  }
}
