export type ScenarioType = 'phishing' | 'misconfiguration' | 'tampering';

interface ScenarioConfig {
  totalAttempts: number;
  legitimateEvents: number;
  baselineSuccessProb: number;
  controlledSuccessProb: number;
  baselineDetectionProb: number;
  controlledDetectionProb: number;
  falsePositiveProb: number;
  baselineMTTDRange: [number, number]; // seconds [min, max]
  controlledMTTDRange: [number, number];
}

// Parameters calibrated to methodology from dissertation section 3.5:
// phishing: 500 credential attempts; misconfiguration: 50 file access attempts;
// tampering: 40 metadata modification requests.
// Probabilities derived from threat intelligence baseline data for each attack class.
const SCENARIO_CONFIGS: Record<ScenarioType, ScenarioConfig> = {
  phishing: {
    totalAttempts: 500,
    legitimateEvents: 120,
    baselineSuccessProb: 0.73,
    controlledSuccessProb: 0.12,
    baselineDetectionProb: 0.11,
    controlledDetectionProb: 0.89,
    falsePositiveProb: 0.04,
    baselineMTTDRange: [2700, 5400],  // 45–90 min (no controls, slow detection)
    controlledMTTDRange: [90, 300],   // 1.5–5 min (rate-limit + MFA alerts are immediate)
  },
  misconfiguration: {
    totalAttempts: 50,
    legitimateEvents: 30,
    baselineSuccessProb: 0.91,
    controlledSuccessProb: 0.08,
    baselineDetectionProb: 0.05,
    controlledDetectionProb: 0.95,
    falsePositiveProb: 0.03,
    baselineMTTDRange: [3600, 10800], // 1–3 hours (no CSPM scanning)
    controlledMTTDRange: [30, 90],    // 30–90 sec (automated CSPM alert)
  },
  tampering: {
    totalAttempts: 40,
    legitimateEvents: 20,
    baselineSuccessProb: 0.64,
    controlledSuccessProb: 0.05,
    baselineDetectionProb: 0.03,
    controlledDetectionProb: 0.97,
    falsePositiveProb: 0.02,
    baselineMTTDRange: [7200, 28800], // 2–8 hours (manual review needed)
    controlledMTTDRange: [15, 45],    // 15–45 sec (hash mismatch triggers immediate alert)
  },
};

export interface TrialMetrics {
  totalAttempts: number;
  successfulAttacks: number;
  blockedAttempts: number;
  detectedEvents: number;
  falsePositives: number;
  attackSuccessRate: number;   // %
  detectionRate: number;       // %
  falsePositiveRate: number;   // %
  meanTimeToDetection: number; // seconds (0 if nothing detected)
}

export interface SimulationReport {
  scenarioType: ScenarioType;
  baseline: TrialMetrics;
  controlled: TrialMetrics;
  attackSuccessReduction: number;  // percentage points
  detectionImprovement: number;    // percentage points
}

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}

function runTrial(config: ScenarioConfig, controlled: boolean): TrialMetrics {
  const successProb   = controlled ? config.controlledSuccessProb   : config.baselineSuccessProb;
  const detectionProb = controlled ? config.controlledDetectionProb : config.baselineDetectionProb;
  const mttdRange     = controlled ? config.controlledMTTDRange     : config.baselineMTTDRange;

  let successes = 0;
  let detected  = 0;
  const detectionTimes: number[] = [];

  for (let i = 0; i < config.totalAttempts; i++) {
    if (Math.random() < successProb)   successes++;
    if (Math.random() < detectionProb) {
      detected++;
      detectionTimes.push(
        mttdRange[0] + Math.random() * (mttdRange[1] - mttdRange[0])
      );
    }
  }

  let falsePositives = 0;
  for (let i = 0; i < config.legitimateEvents; i++) {
    if (Math.random() < config.falsePositiveProb) falsePositives++;
  }

  const asr = round1((successes / config.totalAttempts) * 100);
  const dr  = round1((detected  / config.totalAttempts) * 100);
  const fpr = config.legitimateEvents > 0
    ? round1((falsePositives / config.legitimateEvents) * 100)
    : 0;
  const mttd = detectionTimes.length > 0
    ? Math.round(detectionTimes.reduce((a, b) => a + b, 0) / detectionTimes.length)
    : 0;

  return {
    totalAttempts: config.totalAttempts,
    successfulAttacks: successes,
    blockedAttempts: config.totalAttempts - successes,
    detectedEvents: detected,
    falsePositives,
    attackSuccessRate: asr,
    detectionRate: dr,
    falsePositiveRate: fpr,
    meanTimeToDetection: mttd,
  };
}

export function runSimulation(scenarioType: string): SimulationReport {
  const type   = scenarioType as ScenarioType;
  const config = SCENARIO_CONFIGS[type];
  if (!config) throw new Error(`Unknown scenario type: ${scenarioType}`);

  const baseline   = runTrial(config, false);
  const controlled = runTrial(config, true);

  return {
    scenarioType: type,
    baseline,
    controlled,
    attackSuccessReduction: round1(baseline.attackSuccessRate - controlled.attackSuccessRate),
    detectionImprovement:   round1(controlled.detectionRate   - baseline.detectionRate),
  };
}
