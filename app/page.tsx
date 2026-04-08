"use client"

import { useState, useCallback, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { LivePitch } from '@/components/dashboard/live-pitch'
import { MomentumGraph } from '@/components/dashboard/momentum-graph'
import { WinProbability } from '@/components/dashboard/win-probability'
import { WagonWheel } from '@/components/dashboard/wagon-wheel'
import { CricketAction } from '@/components/dashboard/cricket-action'
import { LiveScoreTicker } from '@/components/dashboard/live-score-ticker'
import { ThemeToggle } from '@/components/theme-toggle'
import {
  mockMatchState,
  mockPitchData,
  mockBatterOnStrike,
  mockBatterNonStrike,
  mockCurrentBowler,
  mockMomentumData,
  mockMatchPosition,
  mockWagonWheel,
  teamLogos,
} from '@/lib/mock-data'
import { Flame, Target, Zap, BarChart3, TrendingUp, TrendingDown, User, ChevronDown, ChevronUp } from 'lucide-react'
import { AreaChart, Area, ResponsiveContainer, Tooltip, LineChart, Line, XAxis, YAxis, Legend, ReferenceLine } from 'recharts'

// Team Analysis - Over by Over comparison
const teamAnalysisData = [
  { over: 1, dc: 8, gt: 12, dcWickets: 0, gtWickets: 0 },
  { over: 2, dc: 7, gt: 6, dcWickets: 0, gtWickets: 0 },
  { over: 3, dc: 12, gt: 9, dcWickets: 1, gtWickets: 0 },
  { over: 4, dc: 4, gt: 14, dcWickets: 0, gtWickets: 1 },
  { over: 5, dc: 11, gt: 8, dcWickets: 0, gtWickets: 0 },
  { over: 6, dc: 15, gt: 11, dcWickets: 1, gtWickets: 0 }, // Powerplay ends
  { over: 7, dc: 6, gt: 7, dcWickets: 0, gtWickets: 0 },
  { over: 8, dc: 9, gt: 10, dcWickets: 0, gtWickets: 1 },
  { over: 9, dc: 7, gt: 8, dcWickets: 0, gtWickets: 0 },
  { over: 10, dc: 8, gt: 12, dcWickets: 0, gtWickets: 1 },
  { over: 11, dc: 10, gt: 9, dcWickets: 1, gtWickets: 0 },
  { over: 12, dc: 8, gt: 11, dcWickets: 0, gtWickets: 1 },
  { over: 13, dc: 6, gt: 14, dcWickets: 0, gtWickets: 0 },
  { over: 14, dc: 6, gt: 10, dcWickets: 0, gtWickets: 1 }, // Current over for DC
]

// Yet to bat/bowl data
const yetToBat = [
  { name: 'Tristan Stubbs', role: 'Batsman' },
  { name: 'Rovman Powell', role: 'All-rounder' },
  { name: 'Kuldeep Yadav', role: 'Bowler' },
  { name: 'Anrich Nortje', role: 'Bowler' },
  { name: 'Mukesh Kumar', role: 'Bowler' },
]

const allBowlers = [
  { name: 'Rashid Khan', overs: 3, runs: 19, wickets: 1, economy: 6.33, current: true },
  { name: 'Mohammed Shami', overs: 3, runs: 28, wickets: 1, economy: 9.33, current: false },
  { name: 'Mohit Sharma', overs: 3, runs: 32, wickets: 0, economy: 10.67, current: false },
  { name: 'Hardik Pandya', overs: 3, runs: 24, wickets: 1, economy: 8.0, current: false },
  { name: 'Noor Ahmad', overs: 2, runs: 18, wickets: 0, economy: 9.0, current: false },
]

export default function DashboardPage() {
  const [hoveredPlayer, setHoveredPlayer] = useState<'batter' | 'bowler' | 'nonstriker' | null>(null)
  // Initial state - start of over 15 (14.0 completed)
  const [liveScore, setLiveScore] = useState({
    runs: 127,
    wickets: 3,
    overs: 14.0, // Start of a fresh over
  })
  // Start with empty over - balls will be added as they're played
  const [recentBalls, setRecentBalls] = useState<{ball: number; runs: number; type: 'dot' | 'single' | 'double' | 'boundary' | 'six' | 'wicket'; batter: string}[]>([])
  const [currentBallOutcome, setCurrentBallOutcome] = useState<string | null>(null)
  const [showAllPlayers, setShowAllPlayers] = useState(false)
  const mainRef = useRef<HTMLDivElement>(null)

  // Helper to format overs properly
  const incrementOver = (currentOvers: number): number => {
    const fullOvers = Math.floor(currentOvers)
    const balls = Math.round((currentOvers - fullOvers) * 10)
    if (balls >= 5) {
      return fullOvers + 1
    }
    return fullOvers + (balls + 1) / 10
  }

  const formatOvers = (overs: number): string => {
    const fullOvers = Math.floor(overs)
    const balls = Math.round((overs - fullOvers) * 10)
    return `${fullOvers}.${balls}`
  }

  // Handle ball completion - synced with cricket action
  const handleBallComplete = useCallback((outcome: string, runs: number) => {
    setCurrentBallOutcome(outcome)
    
    setLiveScore(prev => ({
      ...prev,
      runs: prev.runs + runs,
      wickets: outcome === 'wicket' ? prev.wickets + 1 : prev.wickets,
      overs: incrementOver(prev.overs),
    }))
    
    // Map outcome to ball type
    const typeMap: Record<string, 'dot' | 'single' | 'double' | 'boundary' | 'six' | 'wicket'> = {
      'dot': 'dot',
      'single': 'single',
      'double': 'double',
      'three': 'double',
      'four': 'boundary',
      'six': 'six',
      'wicket': 'wicket',
      'wide': 'single',
      'noball': 'single',
    }
    
    setRecentBalls(prev => {
      // If over is complete (6 balls), reset for new over
      if (prev.length >= 6) {
        return [{
          ball: 1,
          runs,
          type: typeMap[outcome] || 'dot',
          batter: mockBatterOnStrike.name.split(' ')[1],
        }]
      }
      // Otherwise add to current over
      const newBall = {
        ball: prev.length + 1,
        runs,
        type: typeMap[outcome] || 'dot',
        batter: mockBatterOnStrike.name.split(' ')[1],
      }
      return [...prev, newBall]
    })
    
    // Clear outcome after delay
    setTimeout(() => setCurrentBallOutcome(null), 3000)
  }, [])

  // Mini performance chart data
  const batterChartData = [
    { over: 1, runs: 8 }, { over: 2, runs: 4 }, { over: 3, runs: 12 },
    { over: 4, runs: 6 }, { over: 5, runs: 15 }, { over: 6, runs: 10 },
  ]
  
  const nonStrikerChartData = [
    { over: 1, runs: 4 }, { over: 2, runs: 2 }, { over: 3, runs: 6 },
    { over: 4, runs: 3 }, { over: 5, runs: 2 }, { over: 6, runs: 1 },
  ]
  
  const bowlerChartData = [
    { over: 12, runs: 8, wickets: 0, balls: '12.1-12.6' }, 
    { over: 13, runs: 4, wickets: 1, balls: '13.1-13.6' },
    { over: 14, runs: 7, wickets: 0, balls: '14.1-14.2 (current)' },
  ]

  // Calculate over stats - synced with liveScore
  const fullOvers = Math.floor(liveScore.overs)
  const ballsInOver = Math.round((liveScore.overs - fullOvers) * 10)
  const currentOver = ballsInOver === 0 ? fullOvers + 1 : fullOvers + 1 // Current over number
  const overTotal = recentBalls.reduce((sum, b) => sum + b.runs, 0)
  const dotsInOver = recentBalls.filter(b => b.type === 'dot').length
  const thisOverWickets = recentBalls.filter(b => b.type === 'wicket').length

  return (
    <div className="min-h-screen bg-background overflow-x-hidden" ref={mainRef}>
      {/* Theme Toggle */}
      <div className="fixed top-3 right-3 z-50">
        <ThemeToggle />
      </div>

      {/* Floating ambient glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-40 -left-40 w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl opacity-50" />
        <div className="absolute -bottom-40 -right-40 w-[500px] h-[500px] bg-accent/5 rounded-full blur-3xl opacity-50" />
      </div>

      <main className="relative max-w-7xl mx-auto px-3 py-2 space-y-2">
        {/* Live Score Ticker */}
        <LiveScoreTicker
          team1={{
            name: 'Delhi Capitals',
            shortName: 'DC',
            logo: teamLogos.dc,
            score: liveScore.runs,
            wickets: liveScore.wickets,
            overs: liveScore.overs,
          }}
          team2={{
            name: 'Gujarat Titans',
            shortName: 'GT',
            logo: teamLogos.gt,
            score: mockMatchState.target - 1,
            wickets: 6,
            overs: 20,
          }}
          target={mockMatchState.target}
          isLive={true}
        />

        {/* Compact Over Section with Bowler Stats */}
        <div className="rounded-xl bg-card/50 backdrop-blur border border-border/50 px-3 py-2">
          <div className="flex items-center justify-between flex-wrap gap-2">
            {/* Over info with bowler stats */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-black">Over {currentOver}</span>
                <span className="text-[10px] text-muted-foreground">|</span>
                <span className="text-xs font-medium text-yellow-500">{mockCurrentBowler.name.split(' ')[1]}</span>
              </div>
              <div className="flex items-center gap-2 px-2 py-0.5 rounded-full bg-yellow-500/10 border border-yellow-500/20">
                <span className="text-[10px] text-yellow-400 font-bold">
                  {mockCurrentBowler.currentStats.wickets + thisOverWickets}-{mockCurrentBowler.currentStats.runs + overTotal}
                </span>
                <span className="text-[9px] text-muted-foreground">
                  ({mockCurrentBowler.currentStats.overs}.{recentBalls.length} ov)
                </span>
              </div>
            </div>
            
            {/* Ball by ball - inline */}
            <div className="flex items-center gap-1">
              {recentBalls.map((ball, i) => {
                const isLatest = i === recentBalls.length - 1 && currentBallOutcome
                return (
                  <div
                    key={i}
                    className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs border transition-transform ${
                      isLatest ? 'scale-110' : ''
                    } ${
                      ball.type === 'boundary' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50' :
                      ball.type === 'six' ? 'bg-purple-500/20 text-purple-400 border-purple-500/50' :
                      ball.type === 'wicket' ? 'bg-red-500/20 text-red-400 border-red-500/50' :
                      ball.type === 'dot' ? 'bg-muted/50 text-muted-foreground border-muted/50' :
                      'bg-blue-500/20 text-blue-400 border-blue-500/50'
                    }`}
                  >
                    {ball.type === 'wicket' ? 'W' : ball.type === 'dot' ? '•' : ball.runs}
                  </div>
                )
              })}
              {Array.from({ length: Math.max(0, 6 - recentBalls.length) }).map((_, i) => (
                <div key={`empty-${i}`} className="w-7 h-7 rounded-full border border-dashed border-muted/20" />
              ))}
            </div>
            
            {/* Over stats */}
            <div className="flex items-center gap-3">
              <span className="text-[10px] text-muted-foreground">{dotsInOver} dots</span>
              <div className="flex items-center gap-1">
                <span className="text-lg font-black text-primary tabular-nums">{overTotal}</span>
                <span className="text-[10px] text-muted-foreground">runs</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
          {/* Live Cricket Action */}
          <div className="lg:col-span-8">
            <div className="rounded-2xl bg-card/50 backdrop-blur border border-border/50 overflow-hidden">
              <CricketAction 
                onBallComplete={handleBallComplete} 
                liveScore={{
                  runs: liveScore.runs,
                  wickets: liveScore.wickets,
                  overs: formatOvers(liveScore.overs),
                  target: mockMatchState.target,
                  battingTeam: 'DC',
                  bowlingTeam: 'GT',
                }}
                recentBalls={recentBalls}
              />
            </div>
          </div>

          {/* Right Column */}
          <div className="lg:col-span-4 space-y-2">
            {/* Win Probability */}
            <WinProbability 
              position={mockMatchPosition}
              battingTeam={mockMatchState.teams.batting}
              bowlingTeam={mockMatchState.teams.bowling}
            />

            {/* Key Battle */}
            <div className="rounded-xl bg-card/50 backdrop-blur border border-border/50 p-3">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="w-3 h-3 text-primary" />
                <span className="text-xs font-bold">Key Battle</span>
              </div>
              
              <div className="flex items-center justify-between gap-2">
                <div className="text-center">
                  <div className="w-8 h-8 mx-auto rounded-full bg-blue-500/20 border border-blue-500/30 
                                flex items-center justify-center text-sm font-black text-blue-400">
                    DW
                  </div>
                  <p className="text-[10px] font-bold mt-1">12(8)</p>
                </div>
                
                <div className="flex-1">
                  <div className="relative h-1.5 rounded-full bg-muted/30 overflow-hidden">
                    <div 
                      className="absolute left-0 top-0 h-full bg-gradient-to-r from-blue-600 to-blue-400 rounded-full transition-all duration-1000"
                      style={{ width: '60%' }}
                    />
                  </div>
                  <p className="text-[9px] text-center text-muted-foreground mt-1">Warner leading</p>
                </div>
                
                <div className="text-center">
                  <div className="w-8 h-8 mx-auto rounded-full bg-yellow-500/20 border border-yellow-500/30 
                                flex items-center justify-center text-sm font-black text-yellow-400">
                    RK
                  </div>
                  <p className="text-[10px] font-bold mt-1">1 wkt</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Pitch Map & Wagon Wheel Side by Side */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="rounded-xl bg-card/50 backdrop-blur border border-border/50 p-3">
            <div className="flex items-center gap-2 mb-3">
              <Target className="w-3 h-3 text-emerald-500" />
              <span className="text-xs font-bold">Pitch Map</span>
            </div>
            <LivePitch pitch={mockPitchData} />
          </div>

          <div className="rounded-xl bg-card/50 backdrop-blur border border-border/50 p-3">
            <div className="flex items-center gap-2 mb-3">
              <BarChart3 className="w-3 h-3 text-purple-500" />
              <span className="text-xs font-bold">Wagon Wheel</span>
            </div>
            <WagonWheel data={mockWagonWheel} batterName={mockBatterOnStrike.name.split(' ')[1]} />
          </div>
        </div>

        {/* Player Cards - Striker, Non-Striker, Bowler */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* On Strike Batter */}
          <div 
            className={`rounded-xl bg-gradient-to-br from-blue-500/10 to-blue-600/5 border p-3 cursor-pointer transition-all duration-200
                       ${hoveredPlayer === 'batter' 
                         ? 'border-blue-500/50 shadow-lg shadow-blue-500/10' 
                         : 'border-blue-500/20 hover:border-blue-500/40'}`}
            onMouseEnter={() => setHoveredPlayer('batter')}
            onMouseLeave={() => setHoveredPlayer(null)}
          >
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                <span className="text-[9px] font-bold uppercase tracking-wider text-blue-400">On Strike</span>
              </div>
              <span className="px-1.5 py-0.5 rounded-full bg-red-500/20 text-red-400 text-[9px] font-bold flex items-center gap-0.5">
                <Flame className="w-2.5 h-2.5" />
                Aggressor
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-black">{mockBatterOnStrike.name.split(' ')[1]}</h4>
                <p className="text-[10px] text-muted-foreground">{mockBatterOnStrike.name.split(' ')[0]}</p>
              </div>
              <div className="text-right">
                <span className="text-2xl font-black tabular-nums text-blue-400">{mockBatterOnStrike.currentStats.runs}</span>
                <span className="text-xs text-muted-foreground">({mockBatterOnStrike.currentStats.balls})</span>
              </div>
            </div>
            
            {/* Mini Performance Graph with Tooltip */}
            <div className="h-10 mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={batterChartData}>
                  <defs>
                    <linearGradient id="batterGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop key="batter-stop-0" offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                      <stop key="batter-stop-1" offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <Tooltip 
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="bg-card/95 backdrop-blur px-2 py-1 rounded text-[10px] border border-border shadow-lg">
                            <p className="font-bold">{payload[0].value} runs</p>
                            <p className="text-muted-foreground">Over {payload[0].payload.over}</p>
                          </div>
                        )
                      }
                      return null
                    }}
                  />
                  <Area type="monotone" dataKey="runs" stroke="#3b82f6" strokeWidth={1.5} fill="url(#batterGradient)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            
            <div className="flex items-center gap-2 mt-1 pt-1 border-t border-blue-500/10 text-[10px]">
              <span><span className="font-bold">{mockBatterOnStrike.currentStats.fours}</span> 4s</span>
              <span><span className="font-bold">{mockBatterOnStrike.currentStats.sixes}</span> 6s</span>
              <span className="ml-auto">SR <span className="font-bold">{mockBatterOnStrike.currentStats.strikeRate?.toFixed(0)}</span></span>
            </div>
            
            {hoveredPlayer === 'batter' && (
              <div className="grid grid-cols-3 gap-1 text-center mt-2 pt-2 border-t border-blue-500/10 animate-in fade-in duration-200">
                <div>
                  <p className="text-[9px] text-muted-foreground">vs Spin</p>
                  <p className="text-xs font-bold">18(12)</p>
                </div>
                <div>
                  <p className="text-[9px] text-muted-foreground">vs Pace</p>
                  <p className="text-xs font-bold">24(19)</p>
                </div>
                <div>
                  <p className="text-[9px] text-muted-foreground">Venue</p>
                  <p className="text-xs font-bold">Avg 44</p>
                </div>
              </div>
            )}
          </div>

          {/* Non-Striker Batter */}
          <div 
            className={`rounded-xl bg-gradient-to-br from-cyan-500/10 to-cyan-600/5 border p-3 cursor-pointer transition-all duration-200
                       ${hoveredPlayer === 'nonstriker' 
                         ? 'border-cyan-500/50 shadow-lg shadow-cyan-500/10' 
                         : 'border-cyan-500/20 hover:border-cyan-500/40'}`}
            onMouseEnter={() => setHoveredPlayer('nonstriker')}
            onMouseLeave={() => setHoveredPlayer(null)}
          >
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-500/50" />
                <span className="text-[9px] font-bold uppercase tracking-wider text-cyan-400">Non-Strike</span>
              </div>
              <span className="px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[9px] font-bold flex items-center gap-0.5">
                <Target className="w-2.5 h-2.5" />
                Stabilizer
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-black">{mockBatterNonStrike.name.split(' ')[1]}</h4>
                <p className="text-[10px] text-muted-foreground">{mockBatterNonStrike.name.split(' ')[0]}</p>
              </div>
              <div className="text-right">
                <span className="text-2xl font-black tabular-nums text-cyan-400">{mockBatterNonStrike.currentStats.runs}</span>
                <span className="text-xs text-muted-foreground">({mockBatterNonStrike.currentStats.balls})</span>
              </div>
            </div>
            
            {/* Mini Performance Graph */}
            <div className="h-10 mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={nonStrikerChartData}>
                  <defs>
                    <linearGradient id="nonstrikerGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop key="nonstriker-stop-0" offset="5%" stopColor="#06b6d4" stopOpacity={0.3}/>
                      <stop key="nonstriker-stop-1" offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <Tooltip 
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="bg-card/95 backdrop-blur px-2 py-1 rounded text-[10px] border border-border shadow-lg">
                            <p className="font-bold">{payload[0].value} runs</p>
                            <p className="text-muted-foreground">Over {payload[0].payload.over}</p>
                          </div>
                        )
                      }
                      return null
                    }}
                  />
                  <Area type="monotone" dataKey="runs" stroke="#06b6d4" strokeWidth={1.5} fill="url(#nonstrikerGradient)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            
            <div className="flex items-center gap-2 mt-1 pt-1 border-t border-cyan-500/10 text-[10px]">
              <span><span className="font-bold">{mockBatterNonStrike.currentStats.fours}</span> 4s</span>
              <span><span className="font-bold">{mockBatterNonStrike.currentStats.sixes}</span> 6s</span>
              <span className="ml-auto">SR <span className="font-bold">{mockBatterNonStrike.currentStats.strikeRate?.toFixed(0)}</span></span>
            </div>
            
            {hoveredPlayer === 'nonstriker' && (
              <div className="grid grid-cols-3 gap-1 text-center mt-2 pt-2 border-t border-cyan-500/10 animate-in fade-in duration-200">
                <div>
                  <p className="text-[9px] text-muted-foreground">vs Spin</p>
                  <p className="text-xs font-bold">8(7)</p>
                </div>
                <div>
                  <p className="text-[9px] text-muted-foreground">vs Pace</p>
                  <p className="text-xs font-bold">10(8)</p>
                </div>
                <div>
                  <p className="text-[9px] text-muted-foreground">Venue</p>
                  <p className="text-xs font-bold">Avg 36</p>
                </div>
              </div>
            )}
          </div>

          {/* Bowler Card */}
          <div 
            className={`rounded-xl bg-gradient-to-br from-yellow-500/10 to-yellow-600/5 border p-3 cursor-pointer transition-all duration-200
                       ${hoveredPlayer === 'bowler' 
                         ? 'border-yellow-500/50 shadow-lg shadow-yellow-500/10' 
                         : 'border-yellow-500/20 hover:border-yellow-500/40'}`}
            onMouseEnter={() => setHoveredPlayer('bowler')}
            onMouseLeave={() => setHoveredPlayer(null)}
          >
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-yellow-500" />
                <span className="text-[9px] font-bold uppercase tracking-wider text-yellow-400">Bowling</span>
              </div>
              <span className="px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[9px] font-bold">
                Form 92
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-black">{mockCurrentBowler.name.split(' ')[1]}</h4>
                <p className="text-[10px] text-muted-foreground">Leg Spin</p>
              </div>
              <div className="text-right">
                <span className="text-2xl font-black tabular-nums text-yellow-400">
                  {mockCurrentBowler.currentStats.wickets + thisOverWickets}-{mockCurrentBowler.currentStats.runs + overTotal}
                </span>
                <span className="text-xs text-muted-foreground">({mockCurrentBowler.currentStats.overs}.{recentBalls.length})</span>
              </div>
            </div>
            
            {/* Mini Performance Graph - Over by Over with Tooltip */}
            <div className="h-10 mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={bowlerChartData}>
                  <defs>
                    <linearGradient id="bowlerGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop key="bowler-stop-0" offset="5%" stopColor="#eab308" stopOpacity={0.3}/>
                      <stop key="bowler-stop-1" offset="95%" stopColor="#eab308" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <Tooltip 
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload
                        return (
                          <div className="bg-card/95 backdrop-blur px-2 py-1 rounded text-[10px] border border-border shadow-lg">
                            <p className="font-bold text-yellow-400">Over {data.over}</p>
                            <p>{data.runs} runs conceded</p>
                            {data.wickets > 0 && <p className="text-red-400">{data.wickets} wicket{data.wickets > 1 ? 's' : ''}</p>}
                            <p className="text-muted-foreground text-[9px]">{data.balls}</p>
                          </div>
                        )
                      }
                      return null
                    }}
                  />
                  <Area type="monotone" dataKey="runs" stroke="#eab308" strokeWidth={1.5} fill="url(#bowlerGradient)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            
            <div className="flex items-center gap-3 mt-1 pt-1 border-t border-yellow-500/10 text-[10px]">
              <span>Econ <span className="font-bold">{((mockCurrentBowler.currentStats.runs + overTotal) / (mockCurrentBowler.currentStats.overs + recentBalls.length / 6)).toFixed(1)}</span></span>
              <span className="ml-auto">{dotsInOver + 8} dots</span>
            </div>
            
            {hoveredPlayer === 'bowler' && (
              <div className="grid grid-cols-3 gap-1 text-center mt-2 pt-2 border-t border-yellow-500/10 animate-in fade-in duration-200">
                <div>
                  <p className="text-[9px] text-muted-foreground">This Over</p>
                  <p className="text-xs font-bold">{thisOverWickets}-{overTotal}</p>
                </div>
                <div>
                  <p className="text-[9px] text-muted-foreground">vs Warner</p>
                  <p className="text-xs font-bold">12(8)</p>
                </div>
                <div>
                  <p className="text-[9px] text-muted-foreground">Career</p>
                  <p className="text-xs font-bold">Avg 20</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* All Players Section - Expandable */}
        <div className="rounded-xl bg-card/50 backdrop-blur border border-border/50 overflow-hidden">
          <button 
            className="w-full px-3 py-2 flex items-center justify-between hover:bg-muted/20 transition-colors"
            onClick={() => setShowAllPlayers(!showAllPlayers)}
          >
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">All Players</span>
            {showAllPlayers ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
          
          {showAllPlayers && (
            <div className="px-3 pb-3 grid grid-cols-1 md:grid-cols-2 gap-3 animate-in slide-in-from-top-2 duration-200">
              {/* Yet to Bat */}
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2">Yet to Bat</p>
                <div className="space-y-1">
                  {yetToBat.map((player, i) => (
                    <div key={i} className="flex items-center gap-2 p-2 rounded-lg bg-muted/20 hover:bg-muted/30 transition-colors">
                      <User className="w-3 h-3 text-muted-foreground" />
                      <span className="text-xs font-medium">{player.name}</span>
                      <span className="text-[9px] text-muted-foreground ml-auto">{player.role}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* All Bowlers */}
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2">Bowlers</p>
                <div className="space-y-1">
                  {allBowlers.map((bowler, i) => (
                    <div 
                      key={i} 
                      className={`flex items-center gap-2 p-2 rounded-lg transition-colors ${
                        bowler.current ? 'bg-yellow-500/10 border border-yellow-500/20' : 'bg-muted/20 hover:bg-muted/30'
                      }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${bowler.current ? 'bg-yellow-500' : 'bg-muted-foreground/30'}`} />
                      <span className="text-xs font-medium">{bowler.name}</span>
                      <div className="ml-auto flex items-center gap-2 text-[10px]">
                        <span className="font-bold">{bowler.wickets}-{bowler.runs}</span>
                        <span className="text-muted-foreground">({bowler.overs} ov)</span>
                        <span className="text-muted-foreground">Econ {bowler.economy.toFixed(1)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Team Analysis - Over by Over Comparison */}
        <div className="rounded-xl bg-card/50 backdrop-blur border border-border/50 p-3">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-primary" />
              <span className="text-xs font-bold uppercase tracking-wider">Team Analysis</span>
            </div>
            <div className="flex items-center gap-3 text-[10px]">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded bg-blue-500" />
                <span>DC (Batting)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded bg-yellow-500" />
                <span>GT (Bowled First)</span>
              </div>
            </div>
          </div>
          
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={teamAnalysisData}>
                <XAxis 
                  dataKey="over" 
                  tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                  tickLine={false}
                  axisLine={{ stroke: 'hsl(var(--border))' }}
                />
                <YAxis 
                  tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                  tickLine={false}
                  axisLine={false}
                  width={25}
                />
                <Tooltip 
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      const dcData = payload.find(p => p.dataKey === 'dc')
                      const gtData = payload.find(p => p.dataKey === 'gt')
                      const over = teamAnalysisData.find(d => d.over === label)
                      return (
                        <div className="bg-card/95 backdrop-blur px-3 py-2 rounded-lg text-xs border border-border shadow-lg">
                          <p className="font-bold mb-1">Over {label}</p>
                          <div className="space-y-1">
                            <p className="text-blue-400">
                              DC: {dcData?.value} runs 
                              {over?.dcWickets ? <span className="text-red-400 ml-1">({over.dcWickets}W)</span> : ''}
                            </p>
                            <p className="text-yellow-400">
                              GT: {gtData?.value} runs
                              {over?.gtWickets ? <span className="text-red-400 ml-1">({over.gtWickets}W)</span> : ''}
                            </p>
                          </div>
                          {label === 6 && <p className="text-muted-foreground text-[10px] mt-1 pt-1 border-t border-border">End of Powerplay</p>}
                        </div>
                      )
                    }
                    return null
                  }}
                />
                <ReferenceLine x={6} stroke="hsl(var(--muted-foreground))" strokeDasharray="3 3" />
                <Line 
                  type="monotone" 
                  dataKey="dc" 
                  stroke="#3b82f6" 
                  strokeWidth={2}
                  dot={{ fill: '#3b82f6', r: 3 }}
                  activeDot={{ r: 5 }}
                  isAnimationActive={true}
                />
                <Line 
                  type="monotone" 
                  dataKey="gt" 
                  stroke="#eab308" 
                  strokeWidth={2}
                  dot={{ fill: '#eab308', r: 3 }}
                  activeDot={{ r: 5 }}
                  isAnimationActive={true}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          
          {/* Summary stats */}
          <div className="flex items-center justify-around mt-3 pt-3 border-t border-border/50 text-center">
            <div>
              <p className="text-[10px] text-muted-foreground">Powerplay</p>
              <p className="text-sm">
                <span className="font-bold text-blue-400">57/2</span>
                <span className="text-muted-foreground mx-1">vs</span>
                <span className="font-bold text-yellow-400">60/1</span>
              </p>
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground">Middle Overs (7-14)</p>
              <p className="text-sm">
                <span className="font-bold text-blue-400">60/1</span>
                <span className="text-muted-foreground mx-1">vs</span>
                <span className="font-bold text-yellow-400">81/4</span>
              </p>
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground">Run Rate Diff</p>
              <p className={`text-sm font-bold ${-0.64 < 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                -0.64
              </p>
            </div>
          </div>
        </div>

        {/* Momentum Graph */}
        <MomentumGraph data={mockMomentumData} compact={false} />

        {/* Turning Points */}
        <div className="rounded-xl bg-card/50 backdrop-blur border border-border/50 p-3">
          <h3 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-3">Match Turning Points</h3>
          
          <div className="flex gap-3 overflow-x-auto pb-1 custom-scrollbar">
            {mockMatchPosition.turningPoints.map((tp, i) => (
              <div
                key={i}
                className="flex-shrink-0 flex items-center gap-2 p-2 rounded-lg bg-muted/20 hover:bg-muted/30 
                         transition-colors cursor-pointer min-w-[180px]"
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0
                               ${tp.shift < 0 ? 'bg-red-500/20 text-red-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                  {tp.shift < 0 ? <TrendingDown className="w-4 h-4" /> : <TrendingUp className="w-4 h-4" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <span className="text-[10px] font-bold">Over {tp.over}</span>
                    <span className={`text-[10px] font-bold ${tp.shift < 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                      {tp.shift > 0 ? '+' : ''}{tp.shift}%
                    </span>
                  </div>
                  <p className="text-[9px] text-muted-foreground line-clamp-2">{tp.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <footer className="text-center py-3 text-[10px] text-muted-foreground">
          Expert Layer Scorecard - See how commentators think about the match
        </footer>
      </main>
    </div>
  )
}
