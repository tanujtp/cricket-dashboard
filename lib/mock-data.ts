import type {
  MatchState,
  PitchData,
  PlayerContext,
  Insight,
  MomentumPoint,
  MatchPosition,
} from '@/types/cricket'

// Team logos (new high-quality versions)
export const teamLogos = {
  gt: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/gujarat-titan-ifiDyxge0TctYiqkTnTOO94NT85ffx.jpeg',
  dc: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/delhi-capital-dAyxHTqfTlZH23WEtKtk59VlZu8iMR.jpg',
}

// Mock IPL Match: Gujarat Titans vs Delhi Capitals
export const mockMatchState: MatchState = {
  matchId: 'ipl-2024-gt-dc-42',
  venue: 'Narendra Modi Stadium, Ahmedabad',
  teams: {
    batting: {
      id: 'dc',
      name: 'Delhi Capitals',
      shortName: 'DC',
      primaryColor: '#004C93',
      logo: teamLogos.dc,
    },
    bowling: {
      id: 'gt',
      name: 'Gujarat Titans',
      shortName: 'GT',
      primaryColor: '#1C1C1C',
      logo: teamLogos.gt,
    },
  },
  score: {
    runs: 127,
    wickets: 3,
    overs: 14,
    balls: 2,
  },
  target: 186,
  phase: 'middle',
  requiredRate: 10.31,
  currentRate: 8.96,
  winProbability: {
    batting: 52,
    bowling: 48,
  },
  lastWicket: {
    playerName: 'Rishabh Pant',
    runs: 34,
    balls: 22,
    over: 12.4,
  },
  partnership: {
    runs: 28,
    balls: 19,
  },
}

export const mockPitchData: PitchData = {
  paceEffectiveness: 58,
  spinEffectiveness: 72,
  boundaryDifficulty: 65,
  behavior: 'Pitch slowing down — back-of-length deliveries holding up. Spin getting significant grip and turn. Dew yet to arrive.',
  historicalAvg: 178,
  driftTimeline: [
    { over: 1, paceEffect: 75, spinEffect: 45, behavior: 'Good pace, bounce' },
    { over: 4, paceEffect: 70, spinEffect: 52, behavior: 'Pace dropping slightly' },
    { over: 7, paceEffect: 62, spinEffect: 65, behavior: 'Spin coming into play' },
    { over: 10, paceEffect: 58, spinEffect: 70, behavior: 'Slowish, spin dominant' },
    { over: 14, paceEffect: 55, spinEffect: 75, behavior: 'Gripping, turn increasing' },
  ],
  wicketTypes: {
    pace: 35,
    spin: 55,
    runout: 10,
  },
}

export const mockBatterOnStrike: PlayerContext = {
  id: 'warner-1',
  name: 'David Warner',
  role: 'batter',
  intentSignature: 'aggressor',
  formIndex: 78,
  currentStats: {
    runs: 42,
    balls: 31,
    fours: 4,
    sixes: 2,
    strikeRate: 135.48,
  },
  situationalStats: {
    powerplaySR: 156,
    middleSR: 142,
    deathSR: 190,
    chaseAvg: 48.5,
    defendAvg: 38.2,
    highPressureSR: 168,
  },
  venueHistory: {
    matches: 8,
    runs: 312,
    avg: 44.57,
    sr: 148.57,
  },
  recentForm: [85, 45, 72, 90, 65],
  strengthZones: ['Short pitch', 'Full & wide', 'Leg side'],
  weaknessZones: ['Yorker', 'Off-stump channel'],
}

export const mockBatterNonStrike: PlayerContext = {
  id: 'axar-1',
  name: 'Axar Patel',
  role: 'batter',
  intentSignature: 'stabilizer',
  formIndex: 65,
  currentStats: {
    runs: 18,
    balls: 15,
    fours: 2,
    sixes: 0,
    strikeRate: 120.0,
  },
  situationalStats: {
    powerplaySR: 128,
    middleSR: 135,
    deathSR: 155,
    chaseAvg: 32.4,
    defendAvg: 28.8,
    highPressureSR: 142,
  },
  venueHistory: {
    matches: 5,
    runs: 145,
    avg: 36.25,
    sr: 138.1,
  },
  recentForm: [60, 55, 70, 48, 72],
  strengthZones: ['Pace on bat', 'Through covers'],
  weaknessZones: ['Slow spin', 'Short ball'],
}

export const mockCurrentBowler: PlayerContext = {
  id: 'rashid-1',
  name: 'Rashid Khan',
  role: 'bowler',
  intentSignature: 'aggressor',
  formIndex: 92,
  currentStats: {
    wickets: 1,
    overs: 3,
    economyRate: 6.33,
  },
  situationalStats: {
    powerplaySR: undefined,
    middleSR: undefined,
    deathSR: undefined,
  },
  venueHistory: {
    matches: 15,
    wickets: 24,
    economy: 6.8,
  },
  recentForm: [95, 88, 75, 92, 85],
  strengthZones: ['Wrong-un', 'Googly variation'],
  weaknessZones: ['Full toss under pressure'],
}

export const mockInsights: Insight[] = [
  {
    id: 'ins-1',
    over: 14.2,
    tag: 'bowling_strategy',
    summary: 'Rashid bowling into the pitch, making it hard to time. Forcing Warner to manufacture pace.',
    impact: 'Reduces boundary probability by ~40%',
    confidence: 'high',
    timestamp: new Date(),
    relatedPlayer: 'Rashid Khan',
  },
  {
    id: 'ins-2',
    over: 14.1,
    tag: 'batter_intent',
    summary: 'Warner looking to target leg side — field spread suggests GT anticipating this.',
    confidence: 'medium',
    timestamp: new Date(),
    relatedPlayer: 'David Warner',
  },
  {
    id: 'ins-3',
    over: 13.6,
    tag: 'pitch_observation',
    summary: 'Ball gripping more than earlier overs. Batters need to watch for turn.',
    confidence: 'high',
    timestamp: new Date(),
  },
  {
    id: 'ins-4',
    over: 12.4,
    tag: 'turning_point',
    summary: 'Pant wicket shifts momentum. DC need 59 off 34 — equation tightening.',
    impact: 'Win probability shifted 12% towards GT',
    confidence: 'high',
    timestamp: new Date(),
    relatedPlayer: 'Rishabh Pant',
  },
  {
    id: 'ins-5',
    over: 12.1,
    tag: 'field_setup',
    summary: 'Deep point and deep square leg in — GT expecting cross-bat shots. Warner may target straight.',
    confidence: 'medium',
    timestamp: new Date(),
  },
  {
    id: 'ins-6',
    over: 11.3,
    tag: 'prediction',
    summary: 'If DC lose another wicket in next 2 overs, required rate climbs above 12 — recovery unlikely.',
    confidence: 'high',
    timestamp: new Date(),
  },
  {
    id: 'ins-7',
    over: 10.5,
    tag: 'tactical',
    summary: 'Shami brought back despite expensive first spell — GT backing pace variations over spin.',
    confidence: 'medium',
    timestamp: new Date(),
    relatedPlayer: 'Mohammed Shami',
  },
  {
    id: 'ins-8',
    over: 9.2,
    tag: 'batter_intent',
    summary: 'Pant shifted to consolidation mode after quick start — SR dropped from 180 to 154.',
    confidence: 'high',
    timestamp: new Date(),
    relatedPlayer: 'Rishabh Pant',
  },
]

export const mockMomentumData: MomentumPoint[] = [
  { over: 1, pressure: 55, runRate: 8.0, cumulativeRuns: 8 },
  { over: 2, pressure: 48, runRate: 9.5, cumulativeRuns: 19, event: 'boundary', eventDescription: 'Warner 4' },
  { over: 3, pressure: 42, runRate: 10.3, cumulativeRuns: 31 },
  { over: 4, pressure: 38, runRate: 11.0, cumulativeRuns: 44, event: 'six', eventDescription: 'Pant 6' },
  { over: 5, pressure: 35, runRate: 10.8, cumulativeRuns: 54 },
  { over: 6, pressure: 40, runRate: 9.5, cumulativeRuns: 57, event: 'wicket', eventDescription: 'Shaw out' },
  { over: 7, pressure: 52, runRate: 8.7, cumulativeRuns: 61 },
  { over: 8, pressure: 48, runRate: 9.0, cumulativeRuns: 72, event: 'boundary', eventDescription: 'Pant 4' },
  { over: 9, pressure: 45, runRate: 9.2, cumulativeRuns: 83 },
  { over: 10, pressure: 50, runRate: 8.8, cumulativeRuns: 88, event: 'wicket', eventDescription: 'Marsh out' },
  { over: 11, pressure: 58, runRate: 8.5, cumulativeRuns: 94 },
  { over: 12, pressure: 55, runRate: 9.1, cumulativeRuns: 109, event: 'six', eventDescription: 'Warner 6' },
  { over: 13, pressure: 68, runRate: 8.4, cumulativeRuns: 117, event: 'wicket', eventDescription: 'Pant out' },
  { over: 14, pressure: 62, runRate: 8.9, cumulativeRuns: 127 },
]

export const mockMatchPosition: MatchPosition = {
  winProbability: 52,
  truePosition: 'behind',
  situationSummary: 'DC slightly behind — required rate climbing but Warner presence keeps chase alive. Next 3 overs critical.',
  isIllusion: true,
  illusionReason: 'Score looks competitive at 127/3, but DC below par by ~8 runs given pitch easing with dew expected.',
  turningPoints: [
    {
      over: 6,
      description: 'Shaw wicket in powerplay broke momentum',
      shift: -8,
    },
    {
      over: 13,
      description: 'Pant dismissal when set — major momentum shift',
      shift: -12,
    },
  ],
}

// Ball-by-ball data for current over
export const mockBallByBall: import('@/types/cricket').BallData[] = [
  { over: 14, ball: 1, runs: 1, batter: 'Warner', bowler: 'Rashid', shotType: 'Sweep', deliveryType: 'Googly', expectedRuns: 1.2, executionQuality: 'good' },
  { over: 14, ball: 2, runs: 0, batter: 'Axar', bowler: 'Rashid', shotType: 'Defend', deliveryType: 'Leg-spin', expectedRuns: 0.8, executionQuality: 'excellent' },
]

// Last over breakdown
export const mockLastOver = [
  { ball: 1, runs: 0, type: 'dot', batter: 'Warner' },
  { ball: 2, runs: 4, type: 'boundary', batter: 'Warner' },
  { ball: 3, runs: 1, type: 'single', batter: 'Axar' },
  { ball: 4, runs: 0, type: 'dot', batter: 'Axar' },
  { ball: 5, runs: 2, type: 'double', batter: 'Warner' },
  { ball: 6, runs: 1, type: 'single', batter: 'Warner' },
]

// Wagon wheel data (scoring zones)
export const mockWagonWheel = [
  { zone: 'Third Man', runs: 12, shots: 3, angle: -60 },
  { zone: 'Point', runs: 8, shots: 4, angle: -30 },
  { zone: 'Cover', runs: 18, shots: 6, angle: 0 },
  { zone: 'Mid-off', runs: 5, shots: 2, angle: 30 },
  { zone: 'Straight', runs: 22, shots: 5, angle: 60 },
  { zone: 'Mid-on', runs: 8, shots: 3, angle: 90 },
  { zone: 'Mid-wicket', runs: 28, shots: 7, angle: 120 },
  { zone: 'Square Leg', runs: 15, shots: 4, angle: 150 },
  { zone: 'Fine Leg', runs: 11, shots: 3, angle: 180 },
]

// Helper to get phase color
export function getPhaseColor(phase: MatchState['phase']): string {
  switch (phase) {
    case 'powerplay':
      return 'var(--chart-1)'
    case 'middle':
      return 'var(--chart-2)'
    case 'death':
      return 'var(--chart-5)'
    default:
      return 'var(--muted)'
  }
}

// Helper to get intent color
export function getIntentColor(intent: PlayerContext['intentSignature']): string {
  switch (intent) {
    case 'aggressor':
      return 'hsl(0 84% 60%)'
    case 'stabilizer':
      return 'hsl(142 76% 36%)'
    case 'anchor':
      return 'hsl(217 91% 60%)'
    case 'panic':
      return 'hsl(45 93% 47%)'
    default:
      return 'hsl(0 0% 50%)'
  }
}

// Helper to get insight tag color
export function getInsightTagColor(tag: Insight['tag']): string {
  switch (tag) {
    case 'bowling_strategy':
      return 'bg-blue-500/20 text-blue-400 border-blue-500/30'
    case 'batter_intent':
      return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
    case 'field_setup':
      return 'bg-amber-500/20 text-amber-400 border-amber-500/30'
    case 'prediction':
      return 'bg-purple-500/20 text-purple-400 border-purple-500/30'
    case 'turning_point':
      return 'bg-red-500/20 text-red-400 border-red-500/30'
    case 'tactical':
      return 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30'
    case 'pitch_observation':
      return 'bg-orange-500/20 text-orange-400 border-orange-500/30'
    default:
      return 'bg-muted text-muted-foreground'
  }
}

// Format insight tag for display
export function formatInsightTag(tag: Insight['tag']): string {
  return tag
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}
