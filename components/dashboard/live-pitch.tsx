"use client"

import { useEffect, useState, useRef } from 'react'
import type { PitchData } from '@/types/cricket'
import { Info } from 'lucide-react'

interface LivePitchProps {
  pitch: PitchData
}

// Ball landing zones
const deliveryTypes = [
  { name: 'Good Length', zone: { x: 50, y: 55 }, color: '#22c55e', description: 'Most effective area for spin' },
  { name: 'Short', zone: { x: 50, y: 35 }, color: '#f59e0b', description: 'Variable bounce zone' },
  { name: 'Yorker', zone: { x: 50, y: 85 }, color: '#ef4444', description: 'Death over weapon' },
  { name: 'Full', zone: { x: 50, y: 70 }, color: '#3b82f6', description: 'Drive-able length' },
  { name: 'Wide Off', zone: { x: 72, y: 60 }, color: '#8b5cf6', description: 'Testing outside edge' },
]

export function LivePitch({ pitch }: LivePitchProps) {
  const [ballPosition, setBallPosition] = useState({ x: 50, y: 10 })
  const [currentDelivery, setCurrentDelivery] = useState(deliveryTypes[0])
  const [showImpact, setShowImpact] = useState(false)
  const [recentBalls, setRecentBalls] = useState<Array<{ x: number; y: number; type: string; runs: number }>>([])
  const [hoveredBall, setHoveredBall] = useState<number | null>(null)
  const [showPitchInfo, setShowPitchInfo] = useState(false)
  const intervalRef = useRef<NodeJS.Timeout>()

  // Simulate ball deliveries
  useEffect(() => {
    const runTypes = [0, 0, 0, 1, 1, 2, 4, 6] // Weighted outcomes
    
    const simulateDelivery = () => {
      const delivery = deliveryTypes[Math.floor(Math.random() * deliveryTypes.length)]
      setCurrentDelivery(delivery)
      
      const landX = delivery.zone.x + (Math.random() - 0.5) * 12
      const landY = delivery.zone.y + (Math.random() - 0.5) * 8
      const runs = runTypes[Math.floor(Math.random() * runTypes.length)]

      setBallPosition({ x: 50, y: 5 })
      
      setTimeout(() => {
        setBallPosition({ x: landX, y: landY })
        setShowImpact(true)
        
        setRecentBalls(prev => {
          const newBalls = [...prev, { x: landX, y: landY, type: delivery.name, runs }]
          return newBalls.slice(-6)
        })
        
        setTimeout(() => setShowImpact(false), 1000)
      }, 600)
    }

    simulateDelivery()
    intervalRef.current = setInterval(simulateDelivery, 6000)
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [])

  return (
    <div className="space-y-4">
      {/* Pitch Visualization */}
      <div className="relative w-full aspect-[3/4] max-w-[260px] mx-auto">
        <svg viewBox="0 0 100 120" className="w-full h-full">
          {/* Definitions */}
          <defs>
            <linearGradient id="pitchGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#8B7355" stopOpacity="0.9" />
              <stop offset="50%" stopColor="#A0896C" stopOpacity="0.95" />
              <stop offset="100%" stopColor="#8B7355" stopOpacity="0.9" />
            </linearGradient>
            <filter id="glow">
              <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
            <filter id="shadow">
              <feDropShadow dx="0" dy="1" stdDeviation="1" floodOpacity="0.3"/>
            </filter>
          </defs>
          
          {/* Pitch surface */}
          <rect x="25" y="5" width="50" height="110" rx="2" fill="url(#pitchGradient)" className="opacity-85" />
          
          {/* Crease markings */}
          <line x1="25" y1="15" x2="75" y2="15" stroke="white" strokeWidth="0.8" opacity="0.8" />
          <line x1="25" y1="100" x2="75" y2="100" stroke="white" strokeWidth="0.8" opacity="0.8" />
          <line x1="50" y1="10" x2="50" y2="15" stroke="white" strokeWidth="0.5" opacity="0.5" />
          <line x1="50" y1="100" x2="50" y2="105" stroke="white" strokeWidth="0.5" opacity="0.5" />
          
          {/* Stumps - Bowler */}
          <g filter="url(#shadow)">
            <rect x="46" y="8" width="2" height="6" fill="#D4A574" rx="0.5" />
            <rect x="49" y="8" width="2" height="6" fill="#D4A574" rx="0.5" />
            <rect x="52" y="8" width="2" height="6" fill="#D4A574" rx="0.5" />
          </g>
          
          {/* Stumps - Batter */}
          <g filter="url(#shadow)">
            <rect x="46" y="102" width="2" height="6" fill="#D4A574" rx="0.5" />
            <rect x="49" y="102" width="2" height="6" fill="#D4A574" rx="0.5" />
            <rect x="52" y="102" width="2" height="6" fill="#D4A574" rx="0.5" />
          </g>
          
          {/* Length zone labels */}
          <text x="20" y="37" className="text-[5px] fill-current opacity-30" textAnchor="end">Short</text>
          <text x="20" y="57" className="text-[5px] fill-current opacity-30" textAnchor="end">Good</text>
          <text x="20" y="77" className="text-[5px] fill-current opacity-30" textAnchor="end">Full</text>
          
          {/* Length zone lines */}
          <line x1="28" y1="35" x2="72" y2="35" stroke="white" strokeWidth="0.3" opacity="0.2" strokeDasharray="2,2" />
          <line x1="28" y1="55" x2="72" y2="55" stroke="white" strokeWidth="0.3" opacity="0.2" strokeDasharray="2,2" />
          <line x1="28" y1="75" x2="72" y2="75" stroke="white" strokeWidth="0.3" opacity="0.2" strokeDasharray="2,2" />
          
          {/* Recent ball landing positions */}
          {recentBalls.map((ball, i) => (
            <g key={i}>
              <circle
                cx={ball.x}
                cy={ball.y}
                r={hoveredBall === i ? 5 : 3}
                fill={ball.runs === 4 ? '#22c55e' : ball.runs === 6 ? '#a855f7' : ball.runs === 0 ? '#6b7280' : '#3b82f6'}
                opacity={hoveredBall === i ? 1 : 0.6 - (i * 0.08)}
                className="cursor-pointer transition-all duration-200"
                onMouseEnter={() => setHoveredBall(i)}
                onMouseLeave={() => setHoveredBall(null)}
              />
              {hoveredBall === i && (
                <text
                  x={ball.x}
                  y={ball.y - 8}
                  textAnchor="middle"
                  className="text-[6px] fill-current font-bold"
                >
                  {ball.runs === 0 ? 'Dot' : ball.runs === 4 ? 'FOUR' : ball.runs === 6 ? 'SIX' : ball.runs}
                </text>
              )}
            </g>
          ))}
          
          {/* Impact ripple */}
          {showImpact && (
            <>
              <circle
                cx={ballPosition.x}
                cy={ballPosition.y}
                r={12}
                fill={currentDelivery.color}
                opacity={0.2}
                className="animate-ping"
              />
              <circle
                cx={ballPosition.x}
                cy={ballPosition.y}
                r={6}
                fill={currentDelivery.color}
                opacity={0.3}
              />
            </>
          )}
          
          {/* Animated ball */}
          <g className="transition-all duration-500 ease-out" style={{ transform: `translate(${ballPosition.x - 50}px, ${ballPosition.y - 50}px)` }}>
            <circle cx={50} cy={50} r={4} fill="#dc2626" filter="url(#glow)" />
            <ellipse cx={50} cy={50} rx={3.5} ry={1} fill="none" stroke="white" strokeWidth="0.6" />
          </g>
        </svg>

        {/* Live indicator */}
        <div className="absolute top-2 left-2 flex items-center gap-1.5 bg-red-500/20 backdrop-blur-sm px-2 py-1 rounded-full">
          <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
          <span className="text-[9px] font-bold text-red-400 uppercase tracking-wider">Live</span>
        </div>

        {/* Current delivery type */}
        <div 
          className="absolute top-2 right-2 bg-card/80 backdrop-blur-sm px-2 py-1 rounded-lg cursor-pointer
                     hover:bg-card transition-colors"
          onMouseEnter={() => setShowPitchInfo(true)}
          onMouseLeave={() => setShowPitchInfo(false)}
        >
          <span className="text-[9px] font-bold" style={{ color: currentDelivery.color }}>
            {currentDelivery.name}
          </span>
          
          {showPitchInfo && (
            <div className="absolute top-full right-0 mt-1 w-40 p-2 bg-card/95 backdrop-blur-md rounded-lg 
                          shadow-xl border border-border z-20 animate-scale-in">
              <p className="text-[10px] text-muted-foreground">{currentDelivery.description}</p>
            </div>
          )}
        </div>
      </div>

      {/* Pitch Stats */}
      <div className="grid grid-cols-3 gap-2">
        <div className="text-center p-2 rounded-lg bg-muted/30">
          <div className="flex items-center justify-center gap-1 mb-1">
            <div 
              className="w-2 h-2 rounded-full animate-pulse"
              style={{ backgroundColor: pitch.paceEffectiveness > 60 ? '#22c55e' : pitch.paceEffectiveness > 40 ? '#f59e0b' : '#ef4444' }}
            />
            <span className="text-[10px] text-muted-foreground uppercase">Pace</span>
          </div>
          <p className="text-lg font-black">{pitch.paceEffectiveness}%</p>
        </div>
        
        <div className="text-center p-2 rounded-lg bg-muted/30">
          <div className="flex items-center justify-center gap-1 mb-1">
            <div 
              className="w-2 h-2 rounded-full animate-pulse"
              style={{ backgroundColor: pitch.spinEffectiveness > 60 ? '#22c55e' : pitch.spinEffectiveness > 40 ? '#f59e0b' : '#ef4444' }}
            />
            <span className="text-[10px] text-muted-foreground uppercase">Spin</span>
          </div>
          <p className="text-lg font-black">{pitch.spinEffectiveness}%</p>
        </div>
        
        <div className="text-center p-2 rounded-lg bg-muted/30">
          <div className="flex items-center justify-center gap-1 mb-1">
            <div 
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: pitch.boundaryDifficulty > 60 ? '#ef4444' : pitch.boundaryDifficulty > 40 ? '#f59e0b' : '#22c55e' }}
            />
            <span className="text-[10px] text-muted-foreground uppercase">4s</span>
          </div>
          <p className="text-lg font-black">{100 - pitch.boundaryDifficulty}%</p>
        </div>
      </div>

      {/* Pitch behavior insight */}
      <div 
        className="p-3 rounded-xl bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/20
                   cursor-pointer hover:from-yellow-500/15 hover:to-orange-500/15 transition-colors group"
      >
        <div className="flex items-start gap-2">
          <Info className="w-4 h-4 text-yellow-500 flex-shrink-0 mt-0.5 group-hover:animate-pulse" />
          <p className="text-xs text-muted-foreground leading-relaxed">{pitch.behavior}</p>
        </div>
      </div>
    </div>
  )
}
