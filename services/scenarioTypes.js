// Scenario type definitions and generation rules

export const SCENARIO_TYPES = {
  BASE: 'base',
  STRESS: 'stress',
  OPTIMISTIC: 'optimistic',
  COMBINED: 'combined',
  CUSTOM: 'custom'
}

// Stress scenario templates
export const STRESS_TEMPLATES = [
  {
    id: 'churn-25',
    name: 'Churn +25%',
    modifications: { monthlyChurn: 25 }
  },
  {
    id: 'churn-50',
    name: 'Churn +50%',
    modifications: { monthlyChurn: 50 }
  },
  {
    id: 'churn-100',
    name: 'Churn +100%',
    modifications: { monthlyChurn: 100 }
  },
  {
    id: 'cac-30',
    name: 'CAC +30%',
    modifications: { cac: 30 }
  },
  {
    id: 'cac-60',
    name: 'CAC +60%',
    modifications: { cac: 60 }
  },
  {
    id: 'cac-100',
    name: 'CAC Doubles',
    modifications: { cac: 100 }
  },
  {
    id: 'pricing-10',
    name: 'Pricing -10%',
    modifications: { pricing: -10 }
  },
  {
    id: 'pricing-20',
    name: 'Pricing -20%',
    modifications: { pricing: -20 }
  },
  {
    id: 'pricing-30',
    name: 'Pricing -30%',
    modifications: { pricing: -30 }
  },
  {
    id: 'conversion-20',
    name: 'Conversion -20%',
    modifications: { monthlyNewCustomers: -20 }
  }
]

// Optimistic scenario templates
export const OPTIMISTIC_TEMPLATES = [
  {
    id: 'churn-neg-30',
    name: 'Churn -30%',
    modifications: { monthlyChurn: -30 }
  },
  {
    id: 'cac-neg-30',
    name: 'CAC -30%',
    modifications: { cac: -30 }
  },
  {
    id: 'growth-50',
    name: 'Growth +50%',
    modifications: { monthlyNewCustomers: 50 }
  }
]

// Combined stress scenarios (business type specific)
export const COMBINED_STRESS_TEMPLATES = {
  saas: [
    {
      id: 'saas-worst',
      name: 'SaaS Worst Case',
      modifications: { monthlyChurn: 50, cac: 60 }
    },
    {
      id: 'saas-price-pressure',
      name: 'Price Pressure + Churn',
      modifications: { pricing: -20, monthlyChurn: 40 }
    }
  ],
  ecommerce: [
    {
      id: 'ecom-worst',
      name: 'E-Com Worst Case',
      modifications: { cac: 80, pricing: -25 }
    },
    {
      id: 'ecom-slow-growth',
      name: 'Slow Growth + High CAC',
      modifications: { monthlyNewCustomers: -30, cac: 50 }
    }
  ],
  marketplace: [
    {
      id: 'market-chicken-egg',
      name: 'Chicken-Egg Problem',
      modifications: { monthlyNewCustomers: -50, cac: 100 }
    }
  ],
  default: [
    {
      id: 'combined-worst',
      name: 'Combined Worst Case',
      modifications: { monthlyChurn: 60, cac: 80, pricing: -20 }
    }
  ]
}

// Select scenarios based on business type
export function selectScenariosForBusinessType(businessType) {
  const selected = {
    stress: [],
    optimistic: [],
    combined: []
  }

  // Select stress scenarios based on business type
  if (businessType === 'saas' || businessType === 'subscription') {
    // Focus on churn and CAC for subscription businesses
    selected.stress.push(...STRESS_TEMPLATES.filter(t =>
      t.id.includes('churn') || t.id.includes('cac')
    ).slice(0, 4))
  } else if (businessType === 'ecommerce' || businessType === 'physical') {
    // Focus on CAC and pricing for transactional businesses
    selected.stress.push(...STRESS_TEMPLATES.filter(t =>
      t.id.includes('cac') || t.id.includes('pricing')
    ).slice(0, 4))
  } else {
    // General mix for other types
    selected.stress.push(
      STRESS_TEMPLATES.find(t => t.id === 'churn-50'),
      STRESS_TEMPLATES.find(t => t.id === 'cac-60'),
      STRESS_TEMPLATES.find(t => t.id === 'pricing-20'),
      STRESS_TEMPLATES.find(t => t.id === 'conversion-20')
    )
  }

  // All businesses get optimistic scenarios
  selected.optimistic.push(...OPTIMISTIC_TEMPLATES)

  // Combined stress based on business type
  const combinedTemplates = COMBINED_STRESS_TEMPLATES[businessType] || COMBINED_STRESS_TEMPLATES.default
  selected.combined.push(...combinedTemplates)

  return selected
}
