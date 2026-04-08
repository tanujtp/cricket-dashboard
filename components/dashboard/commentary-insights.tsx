'use client'

import { useState } from 'react'
import type { Insight, InsightTag } from '@/types/cricket'
import { formatInsightTag, getInsightTagColor } from '@/lib/mock-data'
import { ChevronDown, ChevronUp, Sparkles, Target, Brain, Flag, Lightbulb, Map, Flame } from 'lucide-react'

interface CommentaryInsightsProps {
  insights: Insight[]
}

const tagIcons: Record<InsightTag, React.ElementType> = {
  bowling_strategy: Target,
  batter_intent: Brain,
  field_setup: Map,
  prediction: Lightbulb,
  turning_point: Flag,
  tactical: Sparkles,
  pitch_observation: Flame,
}

function InsightCard({ insight, isExpanded, onToggle }: { 
  insight: Insight
  isExpanded: boolean
  onToggle: () => void
}) {
  const TagIcon = tagIcons[insight.tag]
  const isTurningPoint = insight.tag === 'turning_point'

  return (
    <div 
      className={`rounded-xl overflow-hidden bg-card/50 backdrop-blur border transition-all duration-200 cursor-pointer hover:bg-card/70 ${
        isTurningPoint ? 'border-red-500/30' : 'border-white/5'
      }`}
      onClick={onToggle}
    >
      {isTurningPoint && (
        <div className="h-0.5 bg-gradient-to-r from-red-500 to-orange-500" />
      )}
      
      <div className="p-3">
        <div className="flex items-start gap-3">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
            isTurningPoint ? 'bg-red-500/20' : 'bg-primary/10'
          }`}>
            <TagIcon className={`h-4 w-4 ${isTurningPoint ? 'text-red-400' : 'text-primary'}`} />
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className={`text-[10px] font-bold uppercase tracking-wider ${getInsightTagColor(insight.tag).split(' ')[1]}`}>
                {formatInsightTag(insight.tag)}
              </span>
              <span className="text-[10px] text-muted-foreground">Ov {insight.over}</span>
            </div>
            <p className="text-sm leading-relaxed">{insight.summary}</p>
          </div>
          
          <div className="shrink-0">
            {isExpanded ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
          </div>
        </div>

        {isExpanded && insight.impact && (
          <div className="mt-3 pt-3 border-t border-white/5">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Impact</p>
            <p className="text-sm font-medium text-primary">{insight.impact}</p>
          </div>
        )}
      </div>
    </div>
  )
}

export function CommentaryInsights({ insights }: CommentaryInsightsProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [filter, setFilter] = useState<InsightTag | 'all'>('all')

  const filteredInsights = filter === 'all' ? insights : insights.filter(i => i.tag === filter)
  const uniqueTags = Array.from(new Set(insights.map(i => i.tag)))

  return (
    <div className="rounded-2xl bg-card/50 backdrop-blur border border-white/5 overflow-hidden h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-white/5">
        <h3 className="text-lg font-black">Expert Insights</h3>
        <p className="text-xs text-muted-foreground">{filteredInsights.length} observations</p>
      </div>

      {/* Filter Pills */}
      <div className="px-4 py-3 border-b border-white/5 flex gap-2 overflow-x-auto">
        <button
          onClick={() => setFilter('all')}
          className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
            filter === 'all' ? 'bg-primary text-primary-foreground' : 'bg-white/5 text-muted-foreground hover:bg-white/10'
          }`}
        >
          All
        </button>
        {uniqueTags.map((tag) => (
          <button
            key={tag}
            onClick={() => setFilter(tag)}
            className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
              filter === tag ? 'bg-primary text-primary-foreground' : 'bg-white/5 text-muted-foreground hover:bg-white/10'
            }`}
          >
            {formatInsightTag(tag)}
          </button>
        ))}
      </div>

      {/* Insights List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {filteredInsights.map((insight) => (
          <InsightCard
            key={insight.id}
            insight={insight}
            isExpanded={expandedId === insight.id}
            onToggle={() => setExpandedId(expandedId === insight.id ? null : insight.id)}
          />
        ))}
      </div>
    </div>
  )
}
