'use client'

import type { MomentumPoint } from '@/types/cricket'
import { Area, AreaChart, ResponsiveContainer, XAxis, YAxis, Tooltip, ReferenceLine, TooltipProps } from 'recharts'
import { TrendingUp, TrendingDown, Circle } from 'lucide-react'

interface MomentumGraphProps {
  data: MomentumPoint[]
  compact?: boolean
}

function CustomTooltip({ active, payload }: TooltipProps<number, string>) {
  if (!active || !payload?.length) return null

  const point = payload[0]?.payload as MomentumPoint | undefined
  if (!point) return null

  const eventColors: Record<string, string> = {
    wicket: 'text-red-400',
    boundary: 'text-emerald-400',
    six: 'text-purple-400',
  }

  return (
    <div className="rounded-xl bg-card/95 backdrop-blur-md p-4 shadow-xl border border-border min-w-[160px] animate-scale-in">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-bold">Over {point.over}</span>
        <span className="text-xs text-muted-foreground">{point.cumulativeRuns} runs</span>
      </div>
      
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            {point.pressure > 50 ? (
              <TrendingUp className="w-3 h-3 text-red-400" />
            ) : (
              <TrendingDown className="w-3 h-3 text-emerald-400" />
            )}
            Pressure
          </span>
          <span className={`text-sm font-black ${point.pressure > 60 ? 'text-red-400' : point.pressure < 40 ? 'text-emerald-400' : ''}`}>
            {point.pressure}
          </span>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">Run Rate</span>
          <span className="text-sm font-bold">{point.runRate.toFixed(2)}</span>
        </div>
      </div>
      
      {point.event && (
        <div className={`mt-3 pt-3 border-t border-border ${eventColors[point.event] || ''}`}>
          <div className="flex items-center gap-2">
            <Circle className="w-2 h-2 fill-current" />
            <span className="text-xs font-bold uppercase">{point.event}</span>
          </div>
          <p className="text-xs mt-1 text-foreground">{point.eventDescription}</p>
        </div>
      )}
    </div>
  )
}

export function MomentumGraph({ data, compact = false }: MomentumGraphProps) {
  const wicketOvers = data.filter(d => d.event === 'wicket').map(d => d.over)
  const boundaryOvers = data.filter(d => d.event === 'boundary' || d.event === 'six').map(d => d.over)

  if (compact) {
    return (
      <div className="h-16">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 5, right: 5, bottom: 0, left: 0 }}>
            <defs>
              <linearGradient id="pressureGradCompact" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--chart-4)" stopOpacity={0.4} />
                <stop offset="100%" stopColor="var(--chart-4)" stopOpacity={0} />
              </linearGradient>
            </defs>
            
            {wicketOvers.map((over) => (
              <ReferenceLine 
                key={over}
                x={over} 
                stroke="#ef4444" 
                strokeDasharray="2 2"
                strokeOpacity={0.4}
              />
            ))}

            <Area
              type="monotone"
              dataKey="pressure"
              stroke="var(--chart-4)"
              fill="url(#pressureGradCompact)"
              strokeWidth={1.5}
              dot={(props) => {
                const { cx, cy, payload } = props
                if (!payload?.event || payload.event !== 'wicket' || !cx || !cy) return <g />
                return (
                  <circle 
                    cx={cx} 
                    cy={cy} 
                    r={3} 
                    fill="#ef4444" 
                    stroke="var(--background)"
                    strokeWidth={1}
                  />
                )
              }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    )
  }

  return (
    <div className="rounded-2xl bg-card/50 backdrop-blur border border-border/50 overflow-hidden">
      <div className="p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-black">Match Momentum</h3>
            <p className="text-xs text-muted-foreground">Pressure intensity over time</p>
          </div>
          
          {/* Live pressure indicator */}
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full 
                          ${data[data.length - 1]?.pressure > 55 
                            ? 'bg-red-500/20 text-red-400' 
                            : 'bg-emerald-500/20 text-emerald-400'}`}>
            {data[data.length - 1]?.pressure > 55 ? (
              <TrendingUp className="w-4 h-4" />
            ) : (
              <TrendingDown className="w-4 h-4" />
            )}
            <span className="text-sm font-bold">{data[data.length - 1]?.pressure}</span>
          </div>
        </div>

        <div className="h-52">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 10, bottom: 0, left: -10 }}>
              <defs>
                <linearGradient id="pressureGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--chart-4)" stopOpacity={0.5} />
                  <stop offset="50%" stopColor="var(--chart-4)" stopOpacity={0.2} />
                  <stop offset="100%" stopColor="var(--chart-4)" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="runRateGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--chart-2)" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="var(--chart-2)" stopOpacity={0} />
                </linearGradient>
              </defs>
              
              <XAxis 
                dataKey="over" 
                tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis 
                domain={[0, 100]}
                tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }}
                axisLine={false}
                tickLine={false}
                width={30}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'var(--border)', strokeDasharray: '4 4' }} />
              
              {/* Wicket markers */}
              {wicketOvers.map((over) => (
                <ReferenceLine 
                  key={`w-${over}`}
                  x={over} 
                  stroke="#ef4444" 
                  strokeDasharray="4 4"
                  strokeOpacity={0.6}
                />
              ))}

              {/* Pressure area */}
              <Area
                type="monotone"
                dataKey="pressure"
                stroke="var(--chart-4)"
                fill="url(#pressureGrad)"
                strokeWidth={2.5}
                dot={(props) => {
                  const { cx, cy, payload, index } = props
                  if (!payload?.event || !cx || !cy) return <g />
                  
                  const colors: Record<string, string> = { 
                    wicket: '#ef4444', 
                    boundary: '#22c55e', 
                    six: '#a855f7' 
                  }
                  const size = payload.event === 'wicket' ? 6 : 5
                  
                  return (
                    <g>
                      <circle 
                        cx={cx} 
                        cy={cy} 
                        r={size + 4} 
                        fill={colors[payload.event] || '#666'} 
                        opacity={0.2}
                      />
                      <circle 
                        cx={cx} 
                        cy={cy} 
                        r={size} 
                        fill={colors[payload.event] || '#666'} 
                        stroke="var(--background)"
                        strokeWidth={2}
                        className="cursor-pointer"
                      />
                    </g>
                  )
                }}
                activeDot={{ r: 6, stroke: 'var(--background)', strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Legend */}
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-border/50">
          <div className="flex items-center gap-5">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <span className="text-xs text-muted-foreground">Wicket</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-emerald-500" />
              <span className="text-xs text-muted-foreground">Boundary</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-purple-500" />
              <span className="text-xs text-muted-foreground">Six</span>
            </div>
          </div>
          
          <p className="text-[10px] text-muted-foreground">Hover for details</p>
        </div>
      </div>
    </div>
  )
}
