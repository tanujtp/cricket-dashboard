"use client"

import { useState } from 'react'

interface BallEvent {
  ball: number
  runs: number
  type: 'dot' | 'single' | 'double' | 'boundary' | 'six' | 'wicket'
  batter: string
}

interface BallTimelineProps {
  over: number
  balls: BallEvent[]
  bowlerName: string
}

export function BallTimeline({ over, balls, bowlerName }: BallTimelineProps) {
  const [hoveredBall, setHoveredBall] = useState<number | null>(null)
  const overTotal = balls.reduce((sum, b) => sum + b.runs, 0)

  const getBallStyle = (type: BallEvent['type'], runs: number) => {
    switch (type) {
      case 'dot':
        return 'bg-muted/60 text-muted-foreground border-muted'
      case 'single':
      case 'double':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/50'
      case 'boundary':
        return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50 shadow-[0_0_10px_rgba(34,197,94,0.3)]'
      case 'six':
        return 'bg-purple-500/20 text-purple-400 border-purple-500/50 shadow-[0_0_10px_rgba(168,85,247,0.3)]'
      case 'wicket':
        return 'bg-red-500/20 text-red-400 border-red-500/50 shadow-[0_0_10px_rgba(239,68,68,0.3)]'
      default:
        return 'bg-muted text-muted-foreground border-muted'
    }
  }

  const getBallContent = (type: BallEvent['type'], runs: number) => {
    if (type === 'wicket') return 'W'
    if (type === 'dot') return '.'
    return runs
  }

  return (
    <div className="rounded-xl bg-card/50 backdrop-blur border border-border/50 p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-lg font-black">Over {over}</span>
          <span className="text-xs text-muted-foreground">| {bowlerName}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-2xl font-black text-primary tabular-nums">{overTotal}</span>
          <span className="text-xs text-muted-foreground">runs</span>
        </div>
      </div>

      {/* Ball by ball visualization */}
      <div className="flex items-center gap-2">
        {balls.map((ball, i) => (
          <div key={i} className="relative">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-lg
                         border-2 cursor-pointer transition-all duration-200
                         ${getBallStyle(ball.type, ball.runs)}
                         ${hoveredBall === i ? 'scale-125 z-10' : 'hover:scale-110'}`}
              onMouseEnter={() => setHoveredBall(i)}
              onMouseLeave={() => setHoveredBall(null)}
            >
              {getBallContent(ball.type, ball.runs)}
            </div>
            
            {/* Tooltip */}
            {hoveredBall === i && (
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 
                            bg-card/95 backdrop-blur-md rounded-lg p-2 shadow-xl border border-border
                            whitespace-nowrap z-20 animate-scale-in">
                <p className="text-xs font-bold">{ball.batter}</p>
                <p className="text-[10px] text-muted-foreground">
                  {ball.type === 'boundary' ? 'FOUR' : 
                   ball.type === 'six' ? 'SIX' : 
                   ball.type === 'wicket' ? 'OUT' : 
                   ball.type === 'dot' ? 'No run' : 
                   `${ball.runs} run${ball.runs > 1 ? 's' : ''}`}
                </p>
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 
                              w-2 h-2 bg-card rotate-45 border-r border-b border-border" />
              </div>
            )}
          </div>
        ))}

        {/* Empty slots for remaining balls */}
        {Array.from({ length: 6 - balls.length }).map((_, i) => (
          <div
            key={`empty-${i}`}
            className="w-10 h-10 rounded-full border-2 border-dashed border-muted/30 
                       flex items-center justify-center text-muted/30 text-lg"
          >
            -
          </div>
        ))}
      </div>

      {/* Run rate indicator */}
      <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/50">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="text-[10px] text-muted-foreground">{balls.filter(b => b.type === 'boundary').length} fours</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-purple-500" />
            <span className="text-[10px] text-muted-foreground">{balls.filter(b => b.type === 'six').length} sixes</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-muted" />
            <span className="text-[10px] text-muted-foreground">{balls.filter(b => b.type === 'dot').length} dots</span>
          </div>
        </div>
        <span className="text-xs text-muted-foreground">
          {balls.filter(b => b.type === 'dot').length > 3 && 'Pressure building'}
          {balls.filter(b => ['boundary', 'six'].includes(b.type)).length >= 2 && 'Boundaries flowing'}
        </span>
      </div>
    </div>
  )
}
