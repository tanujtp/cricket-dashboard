"use client"

import { useState } from 'react'

interface WagonWheelZone {
  zone: string
  runs: number
  shots: number
  angle: number
}

interface WagonWheelProps {
  data: WagonWheelZone[]
  batterName: string
}

export function WagonWheel({ data, batterName }: WagonWheelProps) {
  const [hoveredZone, setHoveredZone] = useState<WagonWheelZone | null>(null)
  const maxRuns = Math.max(...data.map(d => d.runs))
  const totalRuns = data.reduce((sum, d) => sum + d.runs, 0)

  return (
    <div className="relative w-full aspect-square max-w-[300px] mx-auto">
      {/* SVG Field */}
      <svg viewBox="0 0 200 200" className="w-full h-full">
        {/* Field circles */}
        <circle cx="100" cy="100" r="90" fill="none" stroke="currentColor" strokeOpacity="0.1" strokeWidth="0.5" />
        <circle cx="100" cy="100" r="60" fill="none" stroke="currentColor" strokeOpacity="0.1" strokeWidth="0.5" />
        <circle cx="100" cy="100" r="30" fill="none" stroke="currentColor" strokeOpacity="0.08" strokeWidth="0.5" />
        
        {/* Pitch in center */}
        <rect x="97" y="85" width="6" height="30" rx="1" fill="currentColor" fillOpacity="0.15" />
        
        {/* Scoring zones */}
        {data.map((zone, i) => {
          const normalizedRuns = zone.runs / maxRuns
          const length = 25 + normalizedRuns * 55 // Min 25, max 80
          const angleRad = ((zone.angle - 90) * Math.PI) / 180
          const endX = 100 + Math.cos(angleRad) * length
          const endY = 100 + Math.sin(angleRad) * length
          const isHovered = hoveredZone?.zone === zone.zone
          
          return (
            <g key={zone.zone}>
              {/* Zone line */}
              <line
                x1="100"
                y1="100"
                x2={endX}
                y2={endY}
                stroke={isHovered ? 'var(--primary)' : 'var(--accent)'}
                strokeWidth={isHovered ? 3 : 2}
                strokeLinecap="round"
                className="transition-all duration-300"
                style={{
                  filter: isHovered ? 'drop-shadow(0 0 6px var(--primary))' : 'none'
                }}
              />
              
              {/* Endpoint circle */}
              <circle
                cx={endX}
                cy={endY}
                r={isHovered ? 6 : 4}
                fill={isHovered ? 'var(--primary)' : 'var(--accent)'}
                className="transition-all duration-300 cursor-pointer"
                onMouseEnter={() => setHoveredZone(zone)}
                onMouseLeave={() => setHoveredZone(null)}
              />
              
              {/* Runs label */}
              {zone.runs > 10 && (
                <text
                  x={100 + Math.cos(angleRad) * (length + 12)}
                  y={100 + Math.sin(angleRad) * (length + 12)}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="text-[8px] font-bold fill-current opacity-60"
                >
                  {zone.runs}
                </text>
              )}
            </g>
          )
        })}
        
        {/* Center batter indicator */}
        <circle cx="100" cy="100" r="4" fill="var(--primary)" />
      </svg>

      {/* Tooltip */}
      {hoveredZone && (
        <div 
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 
                     bg-card/95 backdrop-blur-md rounded-xl p-3 shadow-xl border border-border
                     pointer-events-none z-10 min-w-[120px] animate-scale-in"
        >
          <p className="text-xs font-bold text-primary mb-1">{hoveredZone.zone}</p>
          <div className="flex justify-between gap-4">
            <span className="text-xs text-muted-foreground">Runs</span>
            <span className="text-sm font-black">{hoveredZone.runs}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-xs text-muted-foreground">Shots</span>
            <span className="text-sm font-bold">{hoveredZone.shots}</span>
          </div>
        </div>
      )}

      {/* Stats overlay */}
      <div className="absolute bottom-0 left-0 right-0 flex justify-between items-end px-2">
        <div>
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Total</p>
          <p className="text-lg font-black">{totalRuns}</p>
        </div>
        <div className="text-right">
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{batterName}</p>
          <p className="text-xs text-muted-foreground">{data.length} zones</p>
        </div>
      </div>
    </div>
  )
}
