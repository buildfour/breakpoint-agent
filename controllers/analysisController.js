import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'
import { generateScenarios } from '../services/scenarioEngine.js'
import { calculateAllProjections, getProjectionSummary } from '../services/projectionCalculator.js'
import { calculateBreakEven, getFinancialHealth } from '../services/breakEvenCalculator.js'
import { calculateLTV, calculateLTVtoCACRatio } from '../utils/formulas.js'
import { rankVulnerabilities, getVulnerabilitySummary } from '../services/vulnerabilityRanker.js'
import { generateExecutiveSummary, generateFallbackSummary } from '../ai/summaryGenerator.js'
import { generateAllVulnerabilityNarratives, enrichVulnerabilities } from '../ai/vulnerabilityNarrator.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const STORAGE_PATH = path.join(__dirname, '../storage/sessions.json')

// Read sessions from file
async function readSessions() {
  try {
    const data = await fs.readFile(STORAGE_PATH, 'utf-8')
    return JSON.parse(data)
  } catch (error) {
    // If file doesn't exist or is invalid, return empty array
    return []
  }
}

// Write sessions to file
async function writeSessions(sessions) {
  await fs.writeFile(STORAGE_PATH, JSON.stringify(sessions, null, 2), 'utf-8')
}

// Generate unique ID
function generateId() {
  return `analysis-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

export async function createAnalysis(req, res, next) {
  try {
    const { inputs, confidence } = req.body

    if (!inputs || !inputs.businessType) {
      return res.status(400).json({
        success: false,
        error: { message: 'Invalid input data' }
      })
    }

    // Generate scenarios
    const scenarios = generateScenarios(inputs)

    // Calculate projections for all scenarios
    const scenariosWithProjections = calculateAllProjections(scenarios)

    // Calculate break-even and metrics for each scenario
    const results = scenariosWithProjections.map(scenario => {
      const breakEven = calculateBreakEven(scenario.monthlyData, inputs.currentRunway)
      const summary = getProjectionSummary(scenario.monthlyData)
      const ltv = calculateLTV(scenario.inputs.pricing, scenario.inputs.monthlyChurn)
      const ltvCac = calculateLTVtoCACRatio(ltv, scenario.inputs.cac)
      const health = getFinancialHealth(breakEven, ltvCac, summary.netMargin)

      return {
        ...scenario,
        breakEven,
        ltvCac: ltvCac.toFixed(1) + ':1',
        health,
        ...summary
      }
    })

    // Calculate vulnerability ranking
    const baseScenario = results.find(s => s.isBase)
    const vulnerabilities = rankVulnerabilities(
      baseScenario,
      baseScenario.breakEven,
      inputs,
      confidence
    )

    const vulnerabilitySummary = getVulnerabilitySummary(vulnerabilities)

    // Generate AI executive summary
    let executiveSummary
    try {
      const summaryResult = await generateExecutiveSummary({
        inputs,
        scenarios: results,
        vulnerabilities
      })

      executiveSummary = summaryResult.success
        ? summaryResult.data
        : generateFallbackSummary({ scenarios: results, vulnerabilities })
    } catch (summaryErr) {
      console.error('Summary generation failed:', summaryErr)
      try {
        executiveSummary = generateFallbackSummary({ scenarios: results, vulnerabilities })
      } catch {
        executiveSummary = 'Analysis complete. Review your scenarios below.'
      }
    }

    // Create analysis session
    const analysisId = generateId()

    // Generate AI narratives for top vulnerabilities (async, doesn't block response)
    generateAllVulnerabilityNarratives(vulnerabilities, inputs, baseScenario.breakEven)
      .then(narratives => {
        const enrichedVulns = enrichVulnerabilities(vulnerabilities, narratives)
        readSessions().then(sessions => {
          const sessionIndex = sessions.findIndex(s => s.id === analysisId)
          if (sessionIndex !== -1) {
            sessions[sessionIndex].vulnerabilities = enrichedVulns
            writeSessions(sessions)
          }
        })
      })
      .catch(err => console.error('Vulnerability narrative generation failed:', err))
    const session = {
      id: analysisId,
      inputs,
      confidence,
      scenarios: results,
      vulnerabilities,
      vulnerabilitySummary,
      executiveSummary,
      status: 'completed',
      createdAt: new Date().toISOString(),
      lastModified: new Date().toISOString()
    }

    // Save to storage
    const sessions = await readSessions()
    sessions.push(session)
    await writeSessions(sessions)

    res.json({
      success: true,
      data: {
        analysisId,
        status: 'completed',
        scenarioCount: results.length
      }
    })
  } catch (error) {
    next(error)
  }
}

export async function getAnalysis(req, res, next) {
  try {
    const { id } = req.params
    const sessions = await readSessions()
    const session = sessions.find(s => s.id === id)

    if (!session) {
      return res.status(404).json({
        success: false,
        error: { message: 'Analysis not found' }
      })
    }

    res.json({
      success: true,
      data: session
    })
  } catch (error) {
    next(error)
  }
}

export async function listSessions(req, res, next) {
  try {
    const sessions = await readSessions()

    const sessionList = sessions.map(s => {
      const baseScenario = s.scenarios?.find(sc => sc.isBase)
      const topVuln = s.vulnerabilities?.[0]
      return {
        id: s.id,
        businessName: s.inputs?.businessType || 'Untitled',
        businessType: s.inputs?.businessType,
        lastModified: s.lastModified,
        createdAt: s.createdAt,
        status: s.status,
        breakEven: baseScenario?.breakEven,
        ltvCac: baseScenario?.ltvCac,
        highestRisk: topVuln?.assumption,
        sparkLineData: baseScenario?.monthlyData?.slice(0, 12).map(d => ({ revenue: d.revenue })) || []
      }
    })

    // Sort by last modified (newest first)
    sessionList.sort((a, b) => new Date(b.lastModified) - new Date(a.lastModified))

    res.json({
      success: true,
      data: sessionList
    })
  } catch (error) {
    next(error)
  }
}

export async function saveSession(req, res, next) {
  try {
    const { id } = req.params
    const { results, businessName } = req.body

    const sessions = await readSessions()
    const sessionIndex = sessions.findIndex(s => s.id === id)

    if (sessionIndex === -1) {
      return res.status(404).json({
        success: false,
        error: { message: 'Session not found' }
      })
    }

    // Update session with results
    sessions[sessionIndex] = {
      ...sessions[sessionIndex],
      results,
      businessName: businessName || sessions[sessionIndex].businessName,
      status: 'completed',
      lastModified: new Date().toISOString()
    }

    await writeSessions(sessions)

    res.json({
      success: true,
      data: sessions[sessionIndex]
    })
  } catch (error) {
    next(error)
  }
}

export async function compareSessions(req, res, next) {
  try {
    const { ids } = req.query

    if (!ids) {
      return res.status(400).json({
        success: false,
        error: { message: 'Session IDs required' }
      })
    }

    const sessionIds = ids.split(',')
    if (sessionIds.length !== 2) {
      return res.status(400).json({
        success: false,
        error: { message: 'Exactly 2 session IDs required for comparison' }
      })
    }

    const sessions = await readSessions()
    const comparison = sessionIds.map(id => sessions.find(s => s.id === id)).filter(Boolean)

    if (comparison.length !== 2) {
      return res.status(404).json({
        success: false,
        error: { message: 'One or both sessions not found' }
      })
    }

    res.json({
      success: true,
      data: {
        sessionA: comparison[0],
        sessionB: comparison[1]
      }
    })
  } catch (error) {
    next(error)
  }
}
