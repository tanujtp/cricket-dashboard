'use client'

import { useState } from 'react'
import Image from 'next/image'
import type { PitchData } from '@/types/cricket'
import { ChevronRight, Sparkles } from 'lucide-react'

interface PitchIntelligenceProps {
  pitch: PitchData
}

function MiniGauge({ value, label, color }: { value: number; label: string; color: string }) {
  return (
    <div className="flex flex-col items-center gap-1.5">
      <div className="relative w-14 h-14">
        <svg className="transform -rotate-90 w-full h-full">
          <circle
            cx="28"
            cy="28"
            r="24"
            fill="none"
            stroke="currentColor"
            strokeWidth="4"
            className="text-white/5"
          />
          <circle
            cx="28"
            cy="28"
            r="24"
            fill="none"
            stroke={color}
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray={150.8}
            strokeDashoffset={150.8 - (value / 100) * 150.8}
            className="transition-all duration-1000"
            style={{ filter: `drop-shadow(0 0 4px ${color})` }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-sm font-black tabular-nums">{value}</span>
        </div>
      </div>
      <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">{label}</span>
    </div>
  )
}

export function PitchIntelligence({ pitch }: PitchIntelligenceProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const { paceEffectiveness, spinEffectiveness, boundaryDifficulty, behavior } = pitch

  const getPaceColor = () => paceEffectiveness >= 60 ? '#22c55e' : paceEffectiveness >= 40 ? '#facc15' : '#ef4444'
  const getSpinColor = () => spinEffectiveness >= 60 ? '#22c55e' : spinEffectiveness >= 40 ? '#facc15' : '#ef4444'
  const getBoundaryColor = () => boundaryDifficulty >= 60 ? '#ef4444' : boundaryDifficulty >= 40 ? '#facc15' : '#22c55e'

  return (
    <div 
      className="group relative rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 hover:scale-[1.02]"
      onClick={() => setIsExpanded(!isExpanded)}
    >
      {/* Pitch Image Background */}
      <div className="absolute inset-0">
        <Image
          src="/images/pitch.jpg"
          alt="Cricket Pitch"
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-background/40" />
      </div>

      {/* Content */}
      <div className="relative p-5">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-black">Pitch Report</h3>
            <p className="text-xs text-muted-foreground">Narendra Modi Stadium</p>
          </div>
          <div className={`p-2 rounded-full bg-white/10 transition-transform duration-300 ${isExpanded ? 'rotate-90' : ''}`}>
            <ChevronRight className="h-4 w-4" />
          </div>
        </div>

        {/* AI Summary */}
        <div className="flex items-start gap-2 p-3 rounded-xl bg-white/5 border border-white/10 mb-4">
          <Sparkles className="h-4 w-4 text-primary mt-0.5 shrink-0" />
          <p className="text-sm leading-relaxed">{behavior}</p>
        </div>

        {/* Gauges */}
        <div className="flex items-center justify-around">
          <MiniGauge value={paceEffectiveness} label="Pace" color={getPaceColor()} />
          <MiniGauge value={spinEffectiveness} label="Spin" color={getSpinColor()} />
          <MiniGauge value={boundaryDifficulty} label="Boundary" color={getBoundaryColor()} />
        </div>

        {/* Expanded Content */}
        {isExpanded && (
          <div className="mt-4 pt-4 border-t border-white/10 space-y-3 animate-in slide-in-from-top-2 duration-200">
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-xl bg-white/5">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Venue Avg</p>
                <p className="text-xl font-black">{pitch.historicalAvg}</p>
              </div>
              <div className="p-3 rounded-xl bg-white/5">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Wickets by Pace</p>
                <p className="text-xl font-black">{pitch.wicketTypes.pace}%</p>
              </div>
            </div>
            <div className="p-3 rounded-xl bg-white/5">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-2">Wicket Distribution</p>
              <div className="flex gap-1 h-2 rounded-full overflow-hidden">
                <div className="bg-chart-1 transition-all" style={{ width: `${pitch.wicketTypes.pace}%` }} />
                <div className="bg-chart-2 transition-all" style={{ width: `${pitch.wicketTypes.spin}%` }} />
                <div className="bg-chart-3 transition-all" style={{ width: `${pitch.wicketTypes.runout}%` }} />
              </div>
              <div className="flex justify-between mt-2 text-[10px] text-muted-foreground">
                <span><span className="text-chart-1 font-bold">{pitch.wicketTypes.pace}%</span> Pace</span>
                <span><span className="text-chart-2 font-bold">{pitch.wicketTypes.spin}%</span> Spin</span>
                <span><span className="text-chart-3 font-bold">{pitch.wicketTypes.runout}%</span> Other</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
