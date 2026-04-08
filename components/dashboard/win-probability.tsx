"use client"

import { useEffect, useState } from 'react'
import { AlertTriangle } from 'lucide-react'
import type { MatchPosition } from '@/types/cricket'

interface WinProbabilityProps {
  position: MatchPosition
  battingTeam: { shortName: string; primaryColor: string }
  bowlingTeam: { shortName: string; primaryColor: string }
}

export function WinProbability({ position, battingTeam, bowlingTeam }: WinProbabilityProps) {
  const [animatedProb, setAnimatedProb] = useState(50)
  const [showTooltip, setShowTooltip] = useState(false)

  useEffect(() => {
    // Animate from 50 to actual value
    const duration = 1500
    const startTime = Date.now()
    const startValue = 50
    const endValue = position.winProbability

    const animate = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / duration, 1)
      // Easing function
      const eased = 1 - Math.pow(1 - progress, 3)
      setAnimatedProb(startValue + (endValue - startValue) * eased)

      if (progress < 1) {
        requestAnimationFrame(animate)
      }
    }
    requestAnimationFrame(animate)
  }, [position.winProbability])

  const circumference = 2 * Math.PI * 45
  const battingOffset = circumference - (animatedProb / 100) * circumference

  return (
    <div className="rounded-2xl bg-card/50 backdrop-blur border border-border/50 p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Win Probability</h3>
        {position.isIllusion && (
          <button
            className="flex items-center gap-1 px-2 py-1 rounded-full bg-yellow-500/20 text-yellow-500 text-[10px] font-bold
                       hover:bg-yellow-500/30 transition-colors relative"
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
          >
            <AlertTriangle className="w-3 h-3" />
            Illusion Detected
            
            {/* Tooltip */}
            {showTooltip && (
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 
                            bg-card/95 backdrop-blur-md rounded-xl shadow-xl border border-border
                            text-left z-20 animate-scale-in">
                <p className="text-xs text-foreground leading-relaxed">{position.illusionReason}</p>
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 
                              w-2 h-2 bg-card rotate-45 border-r border-b border-border" />
              </div>
            )}
          </button>
        )}
      </div>

      <div className="flex items-center gap-6">
        {/* Circular gauge */}
        <div className="relative w-32 h-32 flex-shrink-0">
          <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
            {/* Background circle */}
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="currentColor"
              strokeOpacity="0.1"
              strokeWidth="8"
            />
            
            {/* Bowling team arc (yellow/GT) */}
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="#eab308"
              strokeWidth="8"
              strokeLinecap="round"
              className="transition-all duration-1000"
            />
            
            {/* Batting team arc (blue/DC) */}
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="#3b82f6"
              strokeWidth="8"
              strokeDasharray={circumference}
              strokeDashoffset={battingOffset}
              strokeLinecap="round"
              className="transition-all duration-1000"
              style={{
                filter: 'drop-shadow(0 0 6px #3b82f6)'
              }}
            />
          </svg>
          
          {/* Center text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-black tabular-nums">{Math.round(animatedProb)}%</span>
            <span className="text-[10px] text-muted-foreground font-medium">{battingTeam.shortName}</span>
          </div>
        </div>

        {/* Team breakdown */}
        <div className="flex-1 space-y-3">
          {/* Batting team */}
          <div className="group cursor-pointer">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-500" />
                <span className="text-sm font-bold">{battingTeam.shortName}</span>
              </div>
              <span className="text-lg font-black tabular-nums">{Math.round(animatedProb)}%</span>
            </div>
            <div className="h-2 rounded-full bg-muted/50 overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-blue-600 to-blue-400 rounded-full transition-all duration-1000
                           group-hover:shadow-[0_0_12px_rgba(59,130,246,0.5)]"
                style={{ width: `${animatedProb}%` }}
              />
            </div>
          </div>

          {/* Bowling team */}
          <div className="group cursor-pointer">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-yellow-500" />
                <span className="text-sm font-bold">{bowlingTeam.shortName}</span>
              </div>
              <span className="text-lg font-black tabular-nums">{Math.round(100 - animatedProb)}%</span>
            </div>
            <div className="h-2 rounded-full bg-muted/50 overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-yellow-600 to-yellow-400 rounded-full transition-all duration-1000
                           group-hover:shadow-[0_0_12px_rgba(234,179,8,0.5)]"
                style={{ width: `${100 - animatedProb}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Situation summary */}
      <div className="mt-4 pt-4 border-t border-border/50">
        <p className="text-sm text-muted-foreground leading-relaxed">{position.situationSummary}</p>
      </div>
    </div>
  )
}
