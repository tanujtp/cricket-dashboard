'use client'

import type { MatchPosition as MatchPositionType, MatchState } from '@/types/cricket'
import { AlertTriangle, Zap } from 'lucide-react'

interface MatchPositionProps {
  position: MatchPositionType
  match: MatchState
}

export function MatchPosition({ position, match }: MatchPositionProps) {
  const { winProbability, situationSummary, truePosition, isIllusion, illusionReason, turningPoints } = position
  const battingTeam = match.teams.batting.shortName
  const bowlingTeam = match.teams.bowling.shortName

  const recentTurningPoint = turningPoints[turningPoints.length - 1]

  return (
    <div className="rounded-2xl bg-card/50 backdrop-blur border border-white/5 overflow-hidden">
      <div className="p-5">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-black">Game State</h3>
          <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
            truePosition === 'ahead' 
              ? 'bg-success/20 text-success' 
              : truePosition === 'behind'
              ? 'bg-destructive/20 text-destructive'
              : 'bg-warning/20 text-warning'
          }`}>
            {truePosition}
          </div>
        </div>

        {/* Win Probability Visual */}
        <div className="mb-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-bold">{battingTeam}</span>
            <span className="text-sm font-bold">{bowlingTeam}</span>
          </div>
          <div className="h-3 rounded-full overflow-hidden bg-white/5 flex">
            <div 
              className="h-full bg-gradient-to-r from-blue-600 to-blue-400 transition-all duration-1000"
              style={{ width: `${winProbability}%` }}
            />
            <div 
              className="h-full bg-gradient-to-l from-amber-500 to-amber-400 transition-all duration-1000"
              style={{ width: `${100 - winProbability}%` }}
            />
          </div>
          <div className="flex items-center justify-between mt-2">
            <span className="text-3xl font-black tabular-nums">{winProbability}%</span>
            <span className="text-3xl font-black tabular-nums text-muted-foreground">{100 - winProbability}%</span>
          </div>
        </div>

        {/* Situation Summary */}
        <div className="flex items-center gap-2 p-3 rounded-xl bg-white/5 border border-white/10">
          <Zap className="h-4 w-4 text-primary shrink-0" />
          <p className="text-sm font-medium">{situationSummary}</p>
        </div>

        {/* Illusion Alert */}
        {isIllusion && illusionReason && (
          <div className="mt-3 flex items-start gap-2 p-3 rounded-xl bg-warning/10 border border-warning/20">
            <AlertTriangle className="h-4 w-4 text-warning mt-0.5 shrink-0" />
            <div>
              <p className="text-[10px] font-bold text-warning uppercase tracking-wider mb-0.5">Looks Deceiving</p>
              <p className="text-sm text-muted-foreground">{illusionReason}</p>
            </div>
          </div>
        )}
      </div>

      {/* Turning Point */}
      {recentTurningPoint && (
        <div className="px-5 py-4 border-t border-white/5 bg-white/[0.02]">
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold mb-2">Momentum Shift</p>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold">{recentTurningPoint.description}</p>
              <p className="text-xs text-muted-foreground">Over {recentTurningPoint.over}</p>
            </div>
            <div className={`text-xl font-black ${recentTurningPoint.shift > 0 ? 'text-success' : 'text-destructive'}`}>
              {recentTurningPoint.shift > 0 ? '+' : ''}{recentTurningPoint.shift}%
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
