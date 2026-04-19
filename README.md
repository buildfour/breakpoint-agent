# BreakPoint Agent

AI-powered business model stress-testing engine. Feed it your assumptions — pricing, churn, CAC, costs, growth — and it systematically breaks them to show you where your model is fragile, where it's resilient, and what path leads to profitability.

## What it does

BreakPoint Agent takes a set of business model inputs and runs them through a multi-stage analysis pipeline:

1. **Scenario Generation** — Produces 10-15 scenarios across four types: base case, stress tests (adverse shifts), optimistic cases, and combined stress (multiple variables failing simultaneously)
2. **24-Month Financial Projections** — Calculates revenue trajectories, break-even points, LTV:CAC ratios, and gross margins for every scenario
3. **Vulnerability Ranking** — Ranks each assumption by its impact on break-even timing using delta analysis
4. **AI Narrative Layer** — Uses Google Gemini to generate executive summaries, plain-language vulnerability explanations, contextual input suggestions, and follow-up Q&A chat

## Architecture

```
ai/                    # Gemini integration layer
  geminiClient.js        Core API client with retry + streaming
  chatHandler.js         Contextual Q&A about analysis results
  inputAssist.js         Real-time field-level suggestions
  summaryGenerator.js    Executive summary generation
  vulnerabilityNarrator.js  Plain-language risk explanations
  contextBuilder.js      Formats analysis data for AI prompts
  rateLimitHandler.js    24-hour quota tracking
  prompts/               Prompt templates

services/              # Business logic engine
  scenarioEngine.js      Generates stress/optimistic/combined scenarios
  scenarioTypes.js       Scenario templates per business type
  vulnerabilityRanker.js Ranks assumptions by break-even impact
  sensitivityAnalysis.js Tests assumption sensitivity (25%/50% shifts)
  projectionCalculator.js 24-month P&L projections
  breakEvenCalculator.js Break-even month + financial health

controllers/           # Orchestration
  analysisController.js  Main pipeline: inputs -> scenarios -> projections -> AI

utils/                 # Financial formulas
  formulas.js            LTV, CAC ratio, margins, unit economics
  calculations.js        Utility calculation functions
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/analyze` | Run full analysis on business model inputs |
| GET | `/api/analysis/:id` | Fetch completed analysis results |
| POST | `/api/chat` | Contextual Q&A about results (supports streaming) |
| POST | `/api/ai/input-assist` | Get AI suggestions for input fields |
| GET | `/api/sessions` | List saved analysis sessions |
| GET | `/api/health` | Health check |

## Quick Start

```bash
# Clone
git clone https://github.com/buildfour/breakpoint-agent.git
cd breakpoint-agent

# Configure
cp .env.example .env
# Add your GEMINI_API_KEY to .env

# Install & run
npm install
npm run dev
```

The server starts on port 3001 by default.

## Example Request

```bash
curl -X POST http://localhost:3001/api/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "businessType": "saas",
    "inputs": {
      "pricing": 49,
      "monthlyChurn": 0.05,
      "cac": 200,
      "fixedCosts": 15000,
      "variableCostPerUnit": 5,
      "monthlyNewCustomers": 50,
      "billingCycle": "monthly"
    }
  }'
```

## Tech Stack

- **Runtime:** Node.js + Express
- **AI:** Google Gemini (gemini-3-flash-preview)
- **Language:** JavaScript (ES modules)
- **Dependencies:** Minimal — express, cors, dotenv, @google/generative-ai

## License

GPL-3.0 — see [LICENSE](LICENSE) for details.
