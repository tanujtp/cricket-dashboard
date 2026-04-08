"use client"

import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { LivePitch } from '@/components/dashboard/live-pitch'
import { MomentumGraph } from '@/components/dashboard/momentum-graph'
import { WinProbability } from '@/components/dashboard/win-probability'
import { WagonWheel } from '@/components/dashboard/wagon-wheel'
import { BallTimeline } from '@/components/dashboard/ball-timeline'
import { CricketAction } from '@/components/dashboard/cricket-action'
import { LiveScoreTicker } from '@/components/dashboard/live-score-ticker'
import { ThemeToggle } from '@/components/theme-toggle'
import {
  mockMatchState,
  mockPitchData,
  mockBatterOnStrike,
  mockCurrentBowler,
  mockMomentumData,
  mockMatchPosition,
  mockLastOver,
  mockWagonWheel,
  teamLogos,
} from '@/lib/mock-data'
import { Flame, Target, Shield, Zap, TrendingUp, TrendingDown, Sparkles, BarChart3 } from 'lucide-react'

export default function DashboardPage() {
  const [hoveredPlayer, setHoveredPlayer] = useState<'batter' | 'bowler' | null>(null)
  const [liveScore, setLiveScore] = useState({
    runs: mockMatchState.score.runs,
    wickets: mockMatchState.score.wickets,
    overs: mockMatchState.score.overs,
  })
  const [recentBalls, setRecentBalls] = useState(mockLastOver)

  // Helper to format overs properly (14.3, 14.4, 14.5 -> 15.0)
  const incrementOver = (currentOvers: number): number => {
    const fullOvers = Math.floor(currentOvers)
    const balls = Math.round((currentOvers - fullOvers) * 10)
    if (balls >= 5) {
      return fullOvers + 1
    }
    return fullOvers + (balls + 1) / 10
  }

  // Handle ball completion from cricket action
  const handleBallComplete = useCallback((outcome: string, runs: number) => {
    setLiveScore(prev => ({
      ...prev,
      runs: prev.runs + runs,
      wickets: outcome === 'wicket' ? prev.wickets + 1 : prev.wickets,
      overs: incrementOver(prev.overs),
    }))
    
    // Add to recent balls
    setRecentBalls(prev => {
      const newBall = {
        ball: (prev.length % 6) + 1,
        runs,
        type: outcome as 'dot' | 'single' | 'double' | 'boundary' | 'six' | 'wicket',
        batter: mockBatterOnStrike.name.split(' ')[1],
      }
      const updated = [...prev, newBall]
      return updated.slice(-6)
    })
  }, [])

  return (
    <div className="min-h-screen bg-background">
      {/* Theme Toggle */}
      <div className="fixed top-4 right-4 z-50">
        <ThemeToggle />
      </div>

      {/* Floating ambient glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <motion.div 
          className="absolute -top-40 -left-40 w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl"
          animate={{ y: [0, 20, 0], x: [0, 10, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div 
          className="absolute -bottom-40 -right-40 w-[500px] h-[500px] bg-accent/5 rounded-full blur-3xl"
          animate={{ y: [0, -20, 0], x: [0, -10, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
        />
      </div>

      <main className="relative max-w-7xl mx-auto px-4 py-4 space-y-4">
        {/* Header with branding */}
        <motion.header 
          className="flex items-center justify-between py-2"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            <span className="text-lg font-black gradient-text">Expert Layer</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            <span>IPL 2024 - Match 42</span>
          </div>
        </motion.header>

        {/* Live Score Ticker */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
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
        </motion.section>

        {/* Ball Timeline - Current Over */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <BallTimeline 
            over={Math.floor(liveScore.overs)} 
            balls={recentBalls} 
            bowlerName={mockCurrentBowler.name} 
          />
        </motion.section>

        {/* Main Content - Live Action (Large) + Side Panels */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Live Cricket Action - Full Width on Mobile, 8 cols on Desktop */}
          <motion.section 
            className="lg:col-span-8"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="rounded-2xl bg-card/50 backdrop-blur border border-border/50 overflow-hidden">
              <CricketAction onBallComplete={handleBallComplete} />
            </div>
          </motion.section>

          {/* Right Column - Win Probability & Players */}
          <motion.section 
            className="lg:col-span-4 space-y-4"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.25 }}
          >
            {/* Win Probability */}
            <WinProbability 
              position={mockMatchPosition}
              battingTeam={mockMatchState.teams.batting}
              bowlingTeam={mockMatchState.teams.bowling}
            />

            {/* Key Battle */}
            <motion.div 
              className="rounded-2xl bg-card/50 backdrop-blur border border-border/50 p-4"
              whileHover={{ scale: 1.01 }}
            >
              <div className="flex items-center gap-2 mb-3">
                <Zap className="w-4 h-4 text-primary animate-pulse" />
                <span className="text-sm font-bold">Key Battle</span>
              </div>
              
              <div className="flex items-center justify-between gap-3">
                <div className="text-center">
                  <div className="w-10 h-10 mx-auto rounded-full bg-blue-500/20 border border-blue-500/30 
                                flex items-center justify-center text-lg font-black text-blue-400 mb-1">
                    DW
                  </div>
                  <p className="text-xs font-bold">12(8)</p>
                </div>
                
                <div className="flex-1">
                  <div className="relative h-2 rounded-full bg-muted/30 overflow-hidden">
                    <motion.div 
                      className="absolute left-0 top-0 h-full bg-gradient-to-r from-blue-600 to-blue-400 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: '60%' }}
                      transition={{ duration: 1, delay: 0.5 }}
                    />
                  </div>
                  <p className="text-[10px] text-center text-muted-foreground mt-1">Warner leading</p>
                </div>
                
                <div className="text-center">
                  <div className="w-10 h-10 mx-auto rounded-full bg-yellow-500/20 border border-yellow-500/30 
                                flex items-center justify-center text-lg font-black text-yellow-400 mb-1">
                    RK
                  </div>
                  <p className="text-xs font-bold">1 wkt</p>
                </div>
              </div>
            </motion.div>
          </motion.section>
        </div>

        {/* Pitch Map & Wagon Wheel Side by Side */}
        <motion.section
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          {/* Pitch Map */}
          <div className="rounded-2xl bg-card/50 backdrop-blur border border-border/50 p-4">
            <div className="flex items-center gap-2 mb-4">
              <Target className="w-4 h-4 text-emerald-500" />
              <span className="text-sm font-bold">Pitch Map</span>
              <span className="text-[10px] text-muted-foreground ml-auto">Ball landing zones</span>
            </div>
            <LivePitch pitch={mockPitchData} />
          </div>

          {/* Wagon Wheel */}
          <div className="rounded-2xl bg-card/50 backdrop-blur border border-border/50 p-4">
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 className="w-4 h-4 text-purple-500" />
              <span className="text-sm font-bold">Wagon Wheel</span>
              <span className="text-[10px] text-muted-foreground ml-auto">Scoring zones</span>
            </div>
            <WagonWheel data={mockWagonWheel} batterName={mockBatterOnStrike.name.split(' ')[1]} />
          </div>
        </motion.section>

        {/* Player Cards Row */}
        <motion.section
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
        >
          {/* Batter Card */}
          <motion.div 
            className={`rounded-2xl bg-gradient-to-br from-blue-500/10 to-blue-600/5 border 
                       p-4 cursor-pointer transition-all duration-300 group
                       ${hoveredPlayer === 'batter' 
                         ? 'border-blue-500/50 shadow-[0_0_20px_rgba(59,130,246,0.15)]' 
                         : 'border-blue-500/20 hover:border-blue-500/40'}`}
            onMouseEnter={() => setHoveredPlayer('batter')}
            onMouseLeave={() => setHoveredPlayer(null)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <motion.span 
                  className="w-2 h-2 rounded-full bg-blue-500"
                  animate={{ scale: [1, 1.3, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                />
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400">On Strike</span>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 text-[10px] font-bold flex items-center gap-1">
                <Flame className="w-3 h-3" />
                Aggressor
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-lg font-black">{mockBatterOnStrike.name.split(' ')[1]}</h4>
                <p className="text-xs text-muted-foreground">{mockBatterOnStrike.name.split(' ')[0]}</p>
              </div>
              <div className="text-right">
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-black tabular-nums text-blue-400">{mockBatterOnStrike.currentStats.runs}</span>
                  <span className="text-muted-foreground">({mockBatterOnStrike.currentStats.balls})</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3 mt-2 pt-2 border-t border-blue-500/10 text-xs">
              <span><span className="font-bold">{mockBatterOnStrike.currentStats.fours}</span> 4s</span>
              <span><span className="font-bold">{mockBatterOnStrike.currentStats.sixes}</span> 6s</span>
              <span className="ml-auto">SR <span className="font-bold">{mockBatterOnStrike.currentStats.strikeRate?.toFixed(0)}</span></span>
            </div>
            
            <AnimatePresence>
              {hoveredPlayer === 'batter' && (
                <motion.div 
                  className="grid grid-cols-3 gap-2 text-center mt-3 pt-3 border-t border-blue-500/10"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <div>
                    <p className="text-[10px] text-muted-foreground">vs Spin</p>
                    <p className="text-sm font-bold">18(12)</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground">vs Pace</p>
                    <p className="text-sm font-bold">24(19)</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground">Venue Avg</p>
                    <p className="text-sm font-bold">44</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Bowler Card */}
          <motion.div 
            className={`rounded-2xl bg-gradient-to-br from-yellow-500/10 to-yellow-600/5 border 
                       p-4 cursor-pointer transition-all duration-300
                       ${hoveredPlayer === 'bowler' 
                         ? 'border-yellow-500/50 shadow-[0_0_20px_rgba(234,179,8,0.15)]' 
                         : 'border-yellow-500/20 hover:border-yellow-500/40'}`}
            onMouseEnter={() => setHoveredPlayer('bowler')}
            onMouseLeave={() => setHoveredPlayer(null)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-yellow-500" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-yellow-400">Bowling</span>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold flex items-center gap-1">
                <Target className="w-3 h-3" />
                Form 92
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-lg font-black">{mockCurrentBowler.name.split(' ')[1]}</h4>
                <p className="text-xs text-muted-foreground">{mockCurrentBowler.name.split(' ')[0]} - Leg Spin</p>
              </div>
              <div className="text-right">
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-black tabular-nums text-yellow-400">{mockCurrentBowler.currentStats.wickets}-{(mockCurrentBowler.currentStats.economyRate! * (mockCurrentBowler.currentStats.overs || 1)).toFixed(0)}</span>
                  <span className="text-muted-foreground">({mockCurrentBowler.currentStats.overs})</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-4 mt-2 pt-2 border-t border-yellow-500/10 text-xs">
              <span>Econ <span className="font-bold">{mockCurrentBowler.currentStats.economyRate?.toFixed(1)}</span></span>
              <span className="ml-auto">11 dots</span>
            </div>
            
            <AnimatePresence>
              {hoveredPlayer === 'bowler' && (
                <motion.div 
                  className="grid grid-cols-3 gap-2 text-center mt-3 pt-3 border-t border-yellow-500/10"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <div>
                    <p className="text-[10px] text-muted-foreground">This Spell</p>
                    <p className="text-sm font-bold">1-19</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground">vs Warner</p>
                    <p className="text-sm font-bold">12(8)</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground">Avg</p>
                    <p className="text-sm font-bold">24.5</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.section>

        {/* Momentum Graph */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <MomentumGraph data={mockMomentumData} compact={false} />
        </motion.section>

        {/* Turning Points */}
        <motion.section
          className="rounded-2xl bg-card/50 backdrop-blur border border-border/50 p-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
        >
          <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-4">Match Turning Points</h3>
          
          <div className="flex gap-4 overflow-x-auto pb-2 custom-scrollbar">
            {mockMatchPosition.turningPoints.map((tp, i) => (
              <motion.div
                key={i}
                className="flex-shrink-0 flex items-center gap-3 p-3 rounded-xl bg-muted/20 hover:bg-muted/30 
                         transition-colors cursor-pointer min-w-[200px]"
                whileHover={{ scale: 1.02, y: -2 }}
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0
                               ${tp.shift < 0 ? 'bg-red-500/20 text-red-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                  {tp.shift < 0 ? <TrendingDown className="w-5 h-5" /> : <TrendingUp className="w-5 h-5" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold">Over {tp.over}</span>
                    <span className={`text-xs font-bold ${tp.shift < 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                      {tp.shift > 0 ? '+' : ''}{tp.shift}%
                    </span>
                  </div>
                  <p className="text-[11px] text-muted-foreground line-clamp-2">{tp.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Footer */}
        <motion.footer 
          className="text-center py-4 text-xs text-muted-foreground"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          Expert Layer Scorecard - See how commentators think about the match
        </motion.footer>
      </main>
    </div>
  )
}
