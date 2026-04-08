'use client'

import { useState } from 'react'
import type { PlayerContext as PlayerContextType } from '@/types/cricket'
import { ChevronRight, Zap, Shield, Anchor, AlertTriangle, Flame } from 'lucide-react'

interface PlayerContextProps {
  batter: PlayerContextType
  nonStriker: PlayerContextType
  bowler: PlayerContextType
}

function IntentBadge({ intent }: { intent: PlayerContextType['intentSignature'] }) {
  const config = {
    aggressor: { label: 'AGG', icon: Zap, color: 'bg-red-500/20 text-red-400 border-red-500/30' },
    stabilizer: { label: 'STB', icon: Shield, color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' },
    anchor: { label: 'ANC', icon: Anchor, color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
    panic: { label: 'PRS', icon: AlertTriangle, color: 'bg-amber-500/20 text-amber-400 border-amber-500/30' },
  }
  const { label, icon: Icon, color } = config[intent]

  return (
    <div className={`flex items-center gap-1 px-2 py-1 rounded-md border text-[10px] font-bold ${color}`}>
      <Icon className="h-3 w-3" />
      {label}
    </div>
  )
}

function FormDots({ form }: { form: number[] }) {
  return (
    <div className="flex items-center gap-0.5">
      {form.slice(-5).map((score, i) => (
        <div
          key={i}
          className={`w-1.5 h-1.5 rounded-full ${
            score >= 70 ? 'bg-emerald-400' : score >= 40 ? 'bg-amber-400' : 'bg-red-400'
          }`}
        />
      ))}
    </div>
  )
}

function CompactPlayerCard({ 
  player, 
  type, 
  isExpanded, 
  onToggle 
}: { 
  player: PlayerContextType
  type: 'batter' | 'bowler' | 'non-striker'
  isExpanded: boolean
  onToggle: () => void
}) {
  const isBatter = type !== 'bowler'
  const isOnStrike = type === 'batter'

  return (
    <div 
      className={`rounded-xl overflow-hidden bg-card/50 backdrop-blur border transition-all duration-300 cursor-pointer hover:bg-card/70 ${
        isOnStrike ? 'border-primary/30' : 'border-white/5'
      }`}
      onClick={onToggle}
    >
      <div className="p-4">
        {/* Top Row - Name & Intent */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            {isOnStrike && <Flame className="h-4 w-4 text-orange-400" />}
            <span className="font-black text-lg">{player.name}</span>
            {isOnStrike && <span className="text-primary">*</span>}
          </div>
          <IntentBadge intent={player.intentSignature} />
        </div>

        {/* Main Stats Row */}
        <div className="flex items-end justify-between">
          {isBatter ? (
            <>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-black tabular-nums">{player.currentStats.runs}</span>
                <span className="text-sm text-muted-foreground">({player.currentStats.balls})</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">SR</p>
                  <p className="text-xl font-black tabular-nums text-primary">{player.currentStats.strikeRate?.toFixed(0)}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">4s/6s</p>
                  <p className="text-lg font-bold tabular-nums">{player.currentStats.fours}/{player.currentStats.sixes}</p>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-black tabular-nums text-red-400">{player.currentStats.wickets}</span>
                <span className="text-2xl text-muted-foreground">-</span>
                <span className="text-2xl font-bold tabular-nums">{((player.currentStats.economyRate ?? 0) * (player.currentStats.overs ?? 0)).toFixed(0)}</span>
                <span className="text-sm text-muted-foreground ml-1">({player.currentStats.overs} ov)</span>
              </div>
              <div className="text-right">
                <p className="text-xs text-muted-foreground">Econ</p>
                <p className="text-xl font-black tabular-nums">{player.currentStats.economyRate?.toFixed(1)}</p>
              </div>
            </>
          )}
        </div>

        {/* Bottom Row - Form & Expand */}
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/5">
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Form</span>
            <FormDots form={player.recentForm} />
          </div>
          <div className={`p-1 rounded transition-transform ${isExpanded ? 'rotate-90' : ''}`}>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </div>
        </div>
      </div>

      {/* Expanded Section */}
      {isExpanded && (
        <div className="px-4 pb-4 space-y-3 animate-in slide-in-from-top-2 duration-200">
          {/* Situational Stats for Batters */}
          {isBatter && player.situationalStats && (
            <div className="grid grid-cols-3 gap-2">
              <div className="p-2 rounded-lg bg-white/5 text-center">
                <p className="text-lg font-black text-amber-400">{player.situationalStats.powerplaySR}</p>
                <p className="text-[9px] text-muted-foreground uppercase">PP SR</p>
              </div>
              <div className="p-2 rounded-lg bg-white/5 text-center">
                <p className="text-lg font-black text-primary">{player.situationalStats.middleSR}</p>
                <p className="text-[9px] text-muted-foreground uppercase">Mid SR</p>
              </div>
              <div className="p-2 rounded-lg bg-white/5 text-center">
                <p className="text-lg font-black text-red-400">{player.situationalStats.deathSR}</p>
                <p className="text-[9px] text-muted-foreground uppercase">Death SR</p>
              </div>
            </div>
          )}

          {/* Venue Stats */}
          <div className="p-3 rounded-lg bg-white/5">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-2">At this venue</p>
            <div className="flex items-center gap-4 text-sm">
              <span className="font-bold">{player.venueHistory.matches}</span>
              <span className="text-muted-foreground">matches</span>
              {isBatter ? (
                <>
                  <span className="text-muted-foreground">|</span>
                  <span><span className="font-bold">{player.venueHistory.avg}</span> avg</span>
                  <span><span className="font-bold text-primary">{player.venueHistory.sr}</span> SR</span>
                </>
              ) : (
                <>
                  <span className="text-muted-foreground">|</span>
                  <span><span className="font-bold text-red-400">{player.venueHistory.wickets}</span> wkts</span>
                </>
              )}
            </div>
          </div>

          {/* Strengths/Weaknesses */}
          {player.strengthZones && player.weaknessZones && (
            <div className="flex gap-3 text-[10px]">
              <div className="flex-1">
                <p className="text-emerald-400 uppercase tracking-wider mb-1">Strong</p>
                <p className="text-muted-foreground">{player.strengthZones.join(', ')}</p>
              </div>
              <div className="flex-1">
                <p className="text-red-400 uppercase tracking-wider mb-1">Weak</p>
                <p className="text-muted-foreground">{player.weaknessZones.join(', ')}</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export function PlayerContext({ batter, nonStriker, bowler }: PlayerContextProps) {
  const [expandedCard, setExpandedCard] = useState<string | null>(null)

  return (
    <div className="space-y-3">
      <h3 className="text-lg font-black px-1">On Field</h3>
      <CompactPlayerCard 
        player={batter} 
        type="batter"
        isExpanded={expandedCard === 'batter'}
        onToggle={() => setExpandedCard(expandedCard === 'batter' ? null : 'batter')}
      />
      <CompactPlayerCard 
        player={nonStriker} 
        type="non-striker"
        isExpanded={expandedCard === 'non-striker'}
        onToggle={() => setExpandedCard(expandedCard === 'non-striker' ? null : 'non-striker')}
      />
      <CompactPlayerCard 
        player={bowler} 
        type="bowler"
        isExpanded={expandedCard === 'bowler'}
        onToggle={() => setExpandedCard(expandedCard === 'bowler' ? null : 'bowler')}
      />
    </div>
  )
}
