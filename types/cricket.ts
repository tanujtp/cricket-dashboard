// Team and Match Types
export interface Team {
  id: string
  name: string
  shortName: string
  primaryColor: string
  logo?: string
}

export interface MatchState {
  matchId: string
  venue: string
  teams: {
    batting: Team
    bowling: Team
  }
  score: {
    runs: number
    wickets: number
    overs: number
    balls: number
  }
  target?: number
  phase: 'powerplay' | 'middle' | 'death'
  requiredRate: number
  currentRate: number
  winProbability: {
    batting: number
    bowling: number
  }
  lastWicket?: {
    playerName: string
    runs: number
    balls: number
    over: number
  }
  partnership: {
    runs: number
    balls: number
  }
}

// Pitch Intelligence Types
export interface PitchData {
  paceEffectiveness: number // 0-100
  spinEffectiveness: number // 0-100
  boundaryDifficulty: number // 0-100
  behavior: string // Natural language summary
  historicalAvg: number // Average 1st innings score
  driftTimeline: PitchDriftPoint[]
  wicketTypes: {
    pace: number
    spin: number
    runout: number
  }
}

export interface PitchDriftPoint {
  over: number
  paceEffect: number
  spinEffect: number
  behavior: string
}

// Player Context Types
export type IntentSignature = 'aggressor' | 'stabilizer' | 'anchor' | 'panic'

export interface PlayerContext {
  id: string
  name: string
  role: 'batter' | 'bowler' | 'all-rounder'
  intentSignature: IntentSignature
  formIndex: number // 0-100
  currentStats: {
    runs?: number
    balls?: number
    fours?: number
    sixes?: number
    strikeRate?: number
    wickets?: number
    economyRate?: number
    overs?: number
  }
  situationalStats: {
    powerplaySR?: number
    middleSR?: number
    deathSR?: number
    chaseAvg?: number
    defendAvg?: number
    highPressureSR?: number
  }
  venueHistory: {
    matches: number
    runs?: number
    avg?: number
    sr?: number
    wickets?: number
    economy?: number
  }
  recentForm: number[] // Last 5 scores/figures (normalized 0-100)
  strengthZones?: string[]
  weaknessZones?: string[]
}

// Commentary Insight Types
export type InsightTag = 
  | 'bowling_strategy' 
  | 'batter_intent' 
  | 'field_setup' 
  | 'prediction' 
  | 'turning_point'
  | 'tactical'
  | 'pitch_observation'

export interface Insight {
  id: string
  over: number
  ball?: number
  tag: InsightTag
  summary: string
  impact?: string
  confidence?: 'high' | 'medium' | 'low'
  timestamp: Date
  relatedPlayer?: string
}

// Momentum and Pressure Types
export type MomentumEvent = 'wicket' | 'boundary' | 'six' | 'dot_sequence' | 'dropped_catch' | 'review'

export interface MomentumPoint {
  over: number
  pressure: number // 0-100 (batting team perspective)
  runRate: number
  cumulativeRuns: number
  event?: MomentumEvent
  eventDescription?: string
}

// Match Position Types
export interface MatchPosition {
  winProbability: number // Batting team win %
  truePosition: 'ahead' | 'behind' | 'even'
  situationSummary: string
  isIllusion: boolean
  illusionReason?: string
  turningPoints: TurningPoint[]
}

export interface TurningPoint {
  over: number
  description: string
  shift: number // Win probability shift (+/-)
}

// Ball-by-Ball Types (for detailed tracking)
export interface BallData {
  over: number
  ball: number
  runs: number
  extras?: number
  wicket?: boolean
  wicketType?: string
  batter: string
  bowler: string
  shotType?: string
  deliveryType?: string
  expectedRuns: number
  executionQuality: 'excellent' | 'good' | 'neutral' | 'poor'
}
