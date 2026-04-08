'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import type { MatchState } from '@/types/cricket'
import { Radio, MapPin, Clock } from 'lucide-react'

interface HeroSectionProps {
  match: MatchState
}

function AnimatedNumber({ value }: { value: number }) {
  const [display, setDisplay] = useState(0)
  
  useEffect(() => {
    const duration = 1000
    const steps = 30
    const increment = value / steps
    let current = 0
    
    const timer = setInterval(() => {
      current += increment
      if (current >= value) {
        setDisplay(value)
        clearInterval(timer)
      } else {
        setDisplay(Math.floor(current))
      }
    }, duration / steps)
    
    return () => clearInterval(timer)
  }, [value])
  
  return <span>{display}</span>
}

export function HeroSection({ match }: HeroSectionProps) {
  const { teams, score, target, venue, phase } = match
  const runsNeeded = target ? target - score.runs : 0
  const ballsRemaining = target ? (120 - (score.overs * 6 + score.balls)) : 0

  return (
    <div className="relative w-full h-[420px] sm:h-[480px] rounded-3xl overflow-hidden">
      {/* Stadium Background */}
      <div className="absolute inset-0">
        <Image
          src="/images/stadium.jpg"
          alt="Cricket Stadium"
          fill
          className="object-cover"
          priority
        />
        {/* Gradient Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-background/40 via-transparent to-background/40" />
      </div>

      {/* Live Badge */}
      <div className="absolute top-4 left-4 sm:top-6 sm:left-6 z-10">
        <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-red-500/20 backdrop-blur-md border border-red-500/30">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
          </span>
          <span className="text-xs font-bold text-red-400 uppercase tracking-wider">Live</span>
        </div>
      </div>

      {/* Venue & Time */}
      <div className="absolute top-4 right-4 sm:top-6 sm:right-6 z-10 flex items-center gap-3">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/10">
          <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="text-xs font-medium text-foreground/80">{venue.split(',')[0]}</span>
        </div>
      </div>

      {/* Main Content */}
      <div className="absolute inset-0 flex flex-col justify-end p-6 sm:p-8">
        {/* Teams Face-off */}
        <div className="flex items-center justify-between gap-4 mb-6">
          {/* Batting Team */}
          <div className="flex items-center gap-4 animate-slide-in-left">
            <div className="relative">
              <div className="absolute -inset-2 bg-gradient-to-br from-blue-500/30 to-red-500/30 rounded-2xl blur-xl opacity-60" />
              <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden bg-white/5 backdrop-blur border border-white/20 p-2">
                {teams.batting.logo && (
                  <Image 
                    src={teams.batting.logo} 
                    alt={teams.batting.name}
                    fill
                    className="object-contain p-1"
                  />
                )}
              </div>
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-1">Batting</p>
              <h2 className="text-xl sm:text-2xl font-black">{teams.batting.shortName}</h2>
            </div>
          </div>

          {/* VS Badge */}
          <div className="hidden sm:flex flex-col items-center gap-1">
            <div className="w-12 h-12 rounded-full bg-white/5 backdrop-blur border border-white/10 flex items-center justify-center">
              <span className="text-sm font-bold text-muted-foreground">VS</span>
            </div>
          </div>

          {/* Bowling Team */}
          <div className="flex items-center gap-4 flex-row-reverse animate-slide-in-right">
            <div className="relative">
              <div className="absolute -inset-2 bg-gradient-to-br from-yellow-500/30 to-gray-500/30 rounded-2xl blur-xl opacity-60" />
              <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden bg-white/5 backdrop-blur border border-white/20 p-2">
                {teams.bowling.logo && (
                  <Image 
                    src={teams.bowling.logo} 
                    alt={teams.bowling.name}
                    fill
                    className="object-contain p-1"
                  />
                )}
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-1">Bowling</p>
              <h2 className="text-xl sm:text-2xl font-black">{teams.bowling.shortName}</h2>
            </div>
          </div>
        </div>

        {/* Score Display */}
        <div className="text-center mb-6">
          <div className="inline-flex items-baseline gap-2">
            <span className="text-6xl sm:text-8xl font-black tabular-nums tracking-tighter">
              <AnimatedNumber value={score.runs} />
            </span>
            <span className="text-4xl sm:text-5xl font-bold text-muted-foreground">/</span>
            <span className="text-4xl sm:text-5xl font-bold text-muted-foreground">{score.wickets}</span>
          </div>
          <p className="text-lg sm:text-xl text-muted-foreground font-semibold mt-1 tabular-nums">
            {score.overs}.{score.balls} overs
          </p>
        </div>

        {/* Chase Info Bar */}
        {target && (
          <div className="flex items-center justify-center gap-6 sm:gap-12">
            <div className="text-center">
              <p className="text-3xl sm:text-4xl font-black text-primary tabular-nums">{runsNeeded}</p>
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">runs needed</p>
            </div>
            <div className="w-px h-12 bg-border" />
            <div className="text-center">
              <p className="text-3xl sm:text-4xl font-black tabular-nums">{ballsRemaining}</p>
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">balls left</p>
            </div>
            <div className="w-px h-12 bg-border" />
            <div className="text-center">
              <p className="text-3xl sm:text-4xl font-black text-accent tabular-nums">{match.requiredRate.toFixed(1)}</p>
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">req. rate</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
