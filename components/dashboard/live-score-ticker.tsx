"use client"

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Flame, TrendingUp, TrendingDown, Zap, Volume2, VolumeX } from 'lucide-react'

interface LiveScoreTickerProps {
  team1: { name: string; shortName: string; logo: string; score: number; wickets: number; overs: number }
  team2: { name: string; shortName: string; logo: string; score: number; wickets: number; overs: number }
  target: number
  isLive: boolean
}

export function LiveScoreTicker({ team1, team2, target, isLive }: LiveScoreTickerProps) {
  const [displayScore, setDisplayScore] = useState(team1.score)
  const [lastEvent, setLastEvent] = useState<string | null>(null)
  const [scoreFlash, setScoreFlash] = useState(false)
  const [momentum, setMomentum] = useState<'hot' | 'cold' | 'neutral'>('neutral')
  const [recentRuns, setRecentRuns] = useState<number[]>([])
  const [soundEnabled, setSoundEnabled] = useState(true)
  const prevScoreRef = useRef(team1.score)

  // Format overs display properly
  const formatOvers = (overs: number): string => {
    const fullOvers = Math.floor(overs)
    const balls = Math.round((overs - fullOvers) * 10)
    return `${fullOvers}.${balls}`
  }

  // Animate score changes
  useEffect(() => {
    const scoreDiff = team1.score - prevScoreRef.current
    
    if (scoreDiff > 0) {
      setScoreFlash(true)
      
      // Update recent runs for momentum calculation
      setRecentRuns(prev => {
        const newRuns = [...prev, scoreDiff].slice(-6)
        const total = newRuns.reduce((a, b) => a + b, 0)
        if (total >= 20) setMomentum('hot')
        else if (total <= 6) setMomentum('cold')
        else setMomentum('neutral')
        return newRuns
      })
      
      // Show event
      if (scoreDiff === 4) setLastEvent('FOUR!')
      else if (scoreDiff === 6) setLastEvent('SIX!')
      else if (scoreDiff === 1) setLastEvent('+1')
      else if (scoreDiff === 2) setLastEvent('+2')
      else if (scoreDiff === 3) setLastEvent('+3')
      else setLastEvent(`+${scoreDiff}`)
      
      // Animate counting up
      const steps = Math.min(scoreDiff, 10)
      const increment = scoreDiff / steps
      let current = displayScore
      
      const counter = setInterval(() => {
        current += increment
        if (current >= team1.score) {
          setDisplayScore(team1.score)
          clearInterval(counter)
        } else {
          setDisplayScore(Math.floor(current))
        }
      }, 40)

      setTimeout(() => setScoreFlash(false), 500)
      setTimeout(() => setLastEvent(null), 2000)
      
      prevScoreRef.current = team1.score
      return () => clearInterval(counter)
    } else if (team1.wickets > prevScoreRef.current) {
      // Wicket fell
      setLastEvent('WICKET!')
      setRecentRuns(prev => [...prev, 0].slice(-6))
      setMomentum('cold')
      setTimeout(() => setLastEvent(null), 2000)
    }
    
    prevScoreRef.current = team1.score
  }, [team1.score, team1.wickets, displayScore])

  const runsNeeded = target - team1.score
  const fullOvers = Math.floor(team1.overs)
  const balls = Math.round((team1.overs - fullOvers) * 10)
  const totalBallsBowled = fullOvers * 6 + balls
  const ballsRemaining = 120 - totalBallsBowled
  const reqRate = ballsRemaining > 0 ? (runsNeeded / ballsRemaining) * 6 : 0
  const currentRunRate = totalBallsBowled > 0 ? (team1.score / totalBallsBowled) * 6 : 0
  const progressPercent = Math.min((team1.score / target) * 100, 100)

  return (
    <div className="relative rounded-2xl overflow-hidden">
      {/* Animated background glow based on momentum */}
      <motion.div 
        className={`absolute inset-0 ${
          momentum === 'hot' ? 'bg-gradient-to-r from-orange-600/20 via-transparent to-orange-600/20' :
          momentum === 'cold' ? 'bg-gradient-to-r from-blue-600/20 via-transparent to-blue-600/20' :
          'bg-gradient-to-r from-blue-600/10 via-transparent to-yellow-500/10'
        }`}
        animate={momentum === 'hot' ? { opacity: [0.5, 0.8, 0.5] } : {}}
        transition={{ duration: 1, repeat: Infinity }}
      />
      
      <div className="relative bg-card/80 backdrop-blur-md border border-border/50 p-4">
        <div className="flex items-center justify-between gap-4">
          {/* Batting Team */}
          <div className="flex items-center gap-4">
            <motion.div 
              className="relative"
              animate={scoreFlash ? { scale: [1, 1.15, 1] } : {}}
              transition={{ duration: 0.3 }}
            >
              <img 
                src={team1.logo} 
                alt={team1.name}
                className="w-14 h-14 object-contain"
              />
              {isLive && (
                <motion.div
                  className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                />
              )}
              {/* Momentum indicator */}
              {momentum === 'hot' && (
                <motion.div
                  className="absolute -bottom-1 left-1/2 -translate-x-1/2"
                  animate={{ y: [0, -3, 0] }}
                  transition={{ duration: 0.5, repeat: Infinity }}
                >
                  <Flame className="w-4 h-4 text-orange-500" />
                </motion.div>
              )}
            </motion.div>
            
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-bold text-blue-400">{team1.shortName}</span>
                {momentum === 'hot' && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-orange-500/20 text-orange-400 font-bold flex items-center gap-1">
                    <Flame className="w-3 h-3" /> HOT
                  </span>
                )}
              </div>
              <div className="flex items-baseline gap-2">
                <motion.span 
                  className={`text-5xl font-black tabular-nums transition-colors ${
                    scoreFlash ? 'text-primary' : ''
                  }`}
                  key={displayScore}
                >
                  {displayScore}
                </motion.span>
                <span className="text-3xl text-muted-foreground font-bold">/{team1.wickets}</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                <span className="font-mono">{formatOvers(team1.overs)} ov</span>
                <span className="text-xs px-2 py-0.5 rounded bg-muted/50">
                  CRR: <span className="font-bold text-foreground">{currentRunRate.toFixed(2)}</span>
                </span>
              </div>
            </div>
          </div>

          {/* Center - Match Status & Events */}
          <div className="flex-1 max-w-xs text-center relative min-h-[70px]">
            {/* Event overlay - positioned absolutely to not affect layout */}
            <AnimatePresence>
              {lastEvent && (
                <motion.div
                  key={lastEvent}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="absolute inset-0 flex items-center justify-center z-10"
                >
                  <span className={`text-4xl font-black ${
                    lastEvent === 'FOUR!' ? 'text-emerald-400' :
                    lastEvent === 'SIX!' ? 'text-purple-400' :
                    lastEvent === 'WICKET!' ? 'text-red-500' :
                    'text-blue-400'
                  }`}>
                    {lastEvent}
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
            
            {/* Always render the status - just fade opacity when event shows */}
            <div 
              className="space-y-2 transition-opacity duration-200"
              style={{ opacity: lastEvent ? 0.3 : 1 }}
            >
                <div className="flex items-center justify-center gap-2">
                  <span className="text-2xl font-black text-primary">{runsNeeded}</span>
                  <span className="text-muted-foreground">runs from</span>
                  <span className="text-2xl font-black text-accent">{ballsRemaining}</span>
                  <span className="text-muted-foreground">balls</span>
                </div>
                <div className="flex items-center justify-center gap-2 text-sm">
                  <span className={`flex items-center gap-1 ${reqRate > currentRunRate ? 'text-red-400' : 'text-emerald-400'}`}>
                    {reqRate > currentRunRate ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                    RRR: {reqRate.toFixed(2)}
                  </span>
                </div>
            </div>

            
          </div>

          {/* Bowling Team / Target */}
          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="flex items-center gap-2 justify-end mb-1">
                <span className="text-sm font-bold text-yellow-400">{team2.shortName}</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted/50 text-muted-foreground">Target</span>
              </div>
              <div className="flex items-baseline gap-2 justify-end">
                <span className="text-3xl font-black tabular-nums">{team2.score}</span>
                <span className="text-xl text-muted-foreground">/{team2.wickets}</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">(20 ov)</p>
            </div>
            <img 
              src={team2.logo} 
              alt={team2.name}
              className="w-12 h-12 object-contain opacity-60"
            />
          </div>
        </div>

        {/* Progress bar with markers */}
        <div className="mt-4 relative">
          <div className="h-3 bg-muted/30 rounded-full overflow-hidden">
            <motion.div
              className={`h-full rounded-full ${
                progressPercent > 90 ? 'bg-gradient-to-r from-emerald-600 to-emerald-400' :
                progressPercent > 50 ? 'bg-gradient-to-r from-blue-600 to-blue-400' :
                'bg-gradient-to-r from-orange-600 to-orange-400'
              }`}
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
          {/* Milestone markers */}
          <div className="absolute top-0 left-[25%] w-0.5 h-3 bg-white/20" />
          <div className="absolute top-0 left-[50%] w-0.5 h-3 bg-white/30" />
          <div className="absolute top-0 left-[75%] w-0.5 h-3 bg-white/20" />
          
          <div className="flex justify-between mt-1.5 text-[10px] text-muted-foreground">
            <span>0</span>
            <span>{Math.floor(target * 0.25)}</span>
            <span>{Math.floor(target * 0.5)}</span>
            <span>{Math.floor(target * 0.75)}</span>
            <span>{target}</span>
          </div>
        </div>

        {/* Sound toggle */}
        <button
          onClick={() => setSoundEnabled(!soundEnabled)}
          className="absolute top-3 right-3 p-1.5 rounded-full bg-muted/30 hover:bg-muted/50 transition-colors"
        >
          {soundEnabled ? (
            <Volume2 className="w-4 h-4 text-muted-foreground" />
          ) : (
            <VolumeX className="w-4 h-4 text-muted-foreground" />
          )}
        </button>
      </div>
    </div>
  )
}
