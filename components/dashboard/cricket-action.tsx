"use client"

import { useEffect, useState, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

type BallOutcome = 'dot' | 'single' | 'double' | 'three' | 'four' | 'six' | 'wicket' | 'wide' | 'noball' | 'review'

interface LiveScoreData {
  runs: number
  wickets: number
  overs: string
  target: number
  battingTeam: string
  bowlingTeam: string
}

interface BallHistoryItem {
  ball: number
  runs: number
  type: 'dot' | 'single' | 'double' | 'boundary' | 'six' | 'wicket'
  batter: string
}

interface CricketActionProps {
  onBallComplete?: (outcome: BallOutcome, runs: number) => void
  liveScore?: LiveScoreData
  recentBalls?: BallHistoryItem[]
}

const OUTCOMES: { type: BallOutcome; runs: number; weight: number; commentary: string[]; detail: string[] }[] = [
  { type: 'dot', runs: 0, weight: 30, 
    commentary: ['Defended!', 'No run', 'Beaten!', 'Good length, no run', 'Blocked safely'],
    detail: ['Solid defence, no run', 'Beaten outside off', 'Good length, played to cover', 'Left alone, on the bounce'] },
  { type: 'single', runs: 1, weight: 28, 
    commentary: ['Quick single!', 'Pushed for one', 'Turned away for one', 'Smart running'],
    detail: ['Pushed to mid-off, quick single', 'Worked to leg side for one', 'Dabbed down to third man'] },
  { type: 'double', runs: 2, weight: 12, 
    commentary: ['Two runs!', 'Well placed, coming back', 'Good running, two'],
    detail: ['Driven through covers, two runs', 'Pulled to deep midwicket, easy two'] },
  { type: 'three', runs: 3, weight: 2, 
    commentary: ['Excellent running! Three taken', 'All three, great hustle'],
    detail: ['Miss-field at boundary, three taken'] },
  { type: 'four', runs: 4, weight: 14, 
    commentary: ['FOUR! Brilliant shot!', 'Races to the boundary!', 'FOUR! Timed to perfection!', 'That\'s dispatched!'],
    detail: ['Cover drive, beats the fielder', 'Pull shot, races to the fence', 'Cut shot, through point'] },
  { type: 'six', runs: 6, weight: 5, 
    commentary: ['MASSIVE SIX!', 'Into the stands!', 'SIX! What a hit!', 'That\'s gone all the way!'],
    detail: ['Launched over long-on!', 'Slog sweep into the crowd!', 'Straight down the ground, huge!'] },
  { type: 'wicket', runs: 0, weight: 3, 
    commentary: ['OUT! Bowled him!', 'GONE! Caught behind!', 'WICKET! LBW!', 'OUT! Caught at deep!'],
    detail: ['Stumps shattered!', 'Edge caught by keeper', 'Plumb in front, given out'] },
  { type: 'wide', runs: 1, weight: 3, 
    commentary: ['Wide ball!', 'Too wide outside off', 'Signalled wide'],
    detail: ['Down the leg side, wide called'] },
  { type: 'noball', runs: 1, weight: 2, 
    commentary: ['No ball! Overstepped', 'Free hit coming up!'],
    detail: ['Front foot no ball, free hit next'] },
  { type: 'review', runs: 0, weight: 1, 
    commentary: ['Review taken! Checking for LBW...', 'DRS! Third umpire checking...'],
    detail: ['Checking for bat, ultra-edge'] },
]

// Sound effects using Web Audio API
const useSoundEffects = () => {
  const audioContextRef = useRef<AudioContext | null>(null)

  const playSound = useCallback((type: 'four' | 'six' | 'wicket' | 'cheer' | 'review') => {
    if (typeof window === 'undefined') return
    
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
    }
    const ctx = audioContextRef.current
    if (ctx.state === 'suspended') ctx.resume()
    
    const oscillator = ctx.createOscillator()
    const gainNode = ctx.createGain()
    
    oscillator.connect(gainNode)
    gainNode.connect(ctx.destination)
    
    gainNode.gain.setValueAtTime(0.3, ctx.currentTime)
    
    switch (type) {
      case 'four':
        // Exciting ascending fanfare for FOUR
        oscillator.type = 'sine'
        gainNode.gain.setValueAtTime(0.4, ctx.currentTime)
        oscillator.frequency.setValueAtTime(392, ctx.currentTime) // G4
        oscillator.frequency.setValueAtTime(494, ctx.currentTime + 0.08) // B4
        oscillator.frequency.setValueAtTime(587, ctx.currentTime + 0.16) // D5
        oscillator.frequency.setValueAtTime(784, ctx.currentTime + 0.24) // G5
        gainNode.gain.setValueAtTime(0.5, ctx.currentTime + 0.24)
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.6)
        break
      case 'six':
        // Triumphant stadium roar effect for SIX
        oscillator.type = 'sine'
        gainNode.gain.setValueAtTime(0.5, ctx.currentTime)
        oscillator.frequency.setValueAtTime(262, ctx.currentTime) // C4
        oscillator.frequency.setValueAtTime(330, ctx.currentTime + 0.08) // E4
        oscillator.frequency.setValueAtTime(392, ctx.currentTime + 0.15) // G4
        oscillator.frequency.setValueAtTime(523, ctx.currentTime + 0.22) // C5
        oscillator.frequency.setValueAtTime(659, ctx.currentTime + 0.3) // E5
        oscillator.frequency.setValueAtTime(784, ctx.currentTime + 0.38) // G5
        oscillator.frequency.setValueAtTime(1047, ctx.currentTime + 0.46) // C6
        gainNode.gain.setValueAtTime(0.6, ctx.currentTime + 0.46)
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 1)
        break
      case 'wicket':
        // Dramatic descending tone for wicket
        oscillator.type = 'triangle'
        gainNode.gain.setValueAtTime(0.4, ctx.currentTime)
        oscillator.frequency.setValueAtTime(440, ctx.currentTime) // A4
        oscillator.frequency.setValueAtTime(370, ctx.currentTime + 0.12) // F#4
        oscillator.frequency.setValueAtTime(294, ctx.currentTime + 0.24) // D4
        oscillator.frequency.setValueAtTime(220, ctx.currentTime + 0.36) // A3
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.6)
        break
      case 'review':
        // Suspenseful beeping for DRS
        oscillator.type = 'square'
        gainNode.gain.setValueAtTime(0.2, ctx.currentTime)
        oscillator.frequency.setValueAtTime(880, ctx.currentTime)
        gainNode.gain.setValueAtTime(0.01, ctx.currentTime + 0.1)
        gainNode.gain.setValueAtTime(0.2, ctx.currentTime + 0.2)
        gainNode.gain.setValueAtTime(0.01, ctx.currentTime + 0.3)
        gainNode.gain.setValueAtTime(0.3, ctx.currentTime + 0.4)
        oscillator.frequency.setValueAtTime(1100, ctx.currentTime + 0.4)
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.8)
        break
      case 'cheer':
        // Quick crowd cheer
        oscillator.type = 'sawtooth'
        gainNode.gain.setValueAtTime(0.15, ctx.currentTime)
        oscillator.frequency.setValueAtTime(500, ctx.currentTime)
        oscillator.frequency.linearRampToValueAtTime(800, ctx.currentTime + 0.1)
        oscillator.frequency.linearRampToValueAtTime(600, ctx.currentTime + 0.2)
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3)
        break
    }
    
    oscillator.start(ctx.currentTime)
    oscillator.stop(ctx.currentTime + 1)
  }, [])

  return { playSound }
}

export function CricketAction({ onBallComplete, liveScore, recentBalls = [] }: CricketActionProps) {
  const [phase, setPhase] = useState<'idle' | 'runup' | 'bowl' | 'hit' | 'result' | 'review'>('idle')
  const [outcome, setOutcome] = useState<BallOutcome>('dot')
  const [commentary, setCommentary] = useState<string>('')
  const [detail, setDetail] = useState<string>('')
  const [showCelebration, setShowCelebration] = useState(false)
  const [ballCount, setBallCount] = useState(0)
  const [umpireSignal, setUmpireSignal] = useState<'none' | 'four' | 'six' | 'out' | 'wide' | 'noball' | 'review' | 'notout'>('none')
  const [reviewResult, setReviewResult] = useState<'pending' | 'out' | 'notout' | null>(null)
  
  const { playSound } = useSoundEffects()

  const getRandomOutcome = useCallback(() => {
    const totalWeight = OUTCOMES.reduce((sum, o) => sum + o.weight, 0)
    let random = Math.random() * totalWeight
    for (const o of OUTCOMES) {
      random -= o.weight
      if (random <= 0) {
        const randomCommentary = o.commentary[Math.floor(Math.random() * o.commentary.length)]
        const randomDetail = o.detail[Math.floor(Math.random() * o.detail.length)]
        return { ...o, selectedCommentary: randomCommentary, selectedDetail: randomDetail }
      }
    }
    return { ...OUTCOMES[0], selectedCommentary: OUTCOMES[0].commentary[0], selectedDetail: OUTCOMES[0].detail[0] }
  }, [])

  const playBall = useCallback(() => {
    if (phase !== 'idle') return
    
    const result = getRandomOutcome()
    setOutcome(result.type)
    setCommentary(result.selectedCommentary)
    setDetail(result.selectedDetail)
    setUmpireSignal('none')
    setReviewResult(null)
    setPhase('runup')
    
    // Bowler run-up
    setTimeout(() => setPhase('bowl'), 800)
    // Ball bowled, batsman hits
    setTimeout(() => setPhase('hit'), 1200)
    // Show result
    setTimeout(() => {
      // Handle DRS Review
      if (result.type === 'review') {
        setPhase('review')
        setUmpireSignal('review')
        playSound('review')
        setReviewResult('pending')
        
        // Simulate review process
        setTimeout(() => {
          const isOut = Math.random() > 0.5
          setReviewResult(isOut ? 'out' : 'notout')
          setUmpireSignal(isOut ? 'out' : 'notout')
          if (isOut) {
            playSound('wicket')
            setShowCelebration(true)
            setTimeout(() => setShowCelebration(false), 2000)
onBallComplete?.('wicket', 0)
          }
          setBallCount(prev => prev + 1)
        }, 3000)
        
        setTimeout(() => {
          setPhase('idle')
          setUmpireSignal('none')
          setReviewResult(null)
        }, 6000)
        return
      }
      
      setPhase('result')
      
      // Set umpire signal and play sound
      if (result.type === 'four') {
        setUmpireSignal('four')
        playSound('four')
      } else if (result.type === 'six') {
        setUmpireSignal('six')
        playSound('six')
      } else if (result.type === 'wicket') {
        setUmpireSignal('out')
        playSound('wicket')
      } else if (result.type === 'wide') {
        setUmpireSignal('wide')
      } else if (result.type === 'noball') {
        setUmpireSignal('noball')
      }
      
      if (result.type === 'four' || result.type === 'six' || result.type === 'wicket') {
        setShowCelebration(true)
        setTimeout(() => setShowCelebration(false), 2000)
      }
      
      onBallComplete?.(result.type, result.runs)
      setBallCount(prev => prev + 1)
    }, 1600)
    
    // Reset (only for non-review)
    if (result.type !== 'review') {
      setTimeout(() => {
        setPhase('idle')
        setUmpireSignal('none')
      }, 4000)
    }
  }, [phase, getRandomOutcome, onBallComplete, playSound])

  // Start immediately on mount, then every 5 seconds
  useEffect(() => {
    // Immediate first ball with slight delay for DOM to be ready
    const immediate = setTimeout(() => playBall(), 500)
    // Then continue every 5 seconds
    const timer = setInterval(playBall, 5000)
    return () => {
      clearTimeout(immediate)
      clearInterval(timer)
    }
  }, []) // Empty deps - only run on mount

  const getBallColor = (o: BallOutcome) => {
    switch (o) {
      case 'four': return 'bg-emerald-500'
      case 'six': return 'bg-purple-500'
      case 'wicket': return 'bg-red-500'
      case 'wide': case 'noball': return 'bg-yellow-500'
      default: return 'bg-muted'
    }
  }

  return (
    <div className="relative w-full aspect-[16/9] rounded-2xl overflow-hidden bg-gradient-to-b from-emerald-900/30 to-emerald-950/50">
      {/* Stadium background */}
      <div className="absolute inset-0 bg-[url('/images/stadium.jpg')] bg-cover bg-center opacity-30" />
      
      {/* Crowd silhouette effect */}
      <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-black/40 to-transparent" />

      {/* Mini Scorecard Overlay - Top Left */}
      {liveScore && (
        <div className="absolute top-3 left-3 z-20">
          <motion.div 
            className="bg-black/70 backdrop-blur-md rounded-xl px-4 py-2 border border-white/10"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-blue-400">{liveScore.battingTeam}</span>
              <div className="flex items-baseline gap-1">
                <motion.span 
                  className="text-2xl font-black text-white tabular-nums"
                  key={liveScore.runs}
                  initial={{ scale: 1.2, color: '#22c55e' }}
                  animate={{ scale: 1, color: '#ffffff' }}
                  transition={{ duration: 0.3 }}
                >
                  {liveScore.runs}
                </motion.span>
                <span className="text-lg text-white/60">/{liveScore.wickets}</span>
              </div>
              <span className="text-xs text-white/50 font-mono">({liveScore.overs})</span>
            </div>
            <div className="text-[10px] text-white/40 mt-0.5">
              Need {liveScore.target - liveScore.runs} from {Math.max(0, 120 - (parseInt(liveScore.overs.split('.')[0]) * 6 + parseInt(liveScore.overs.split('.')[1] || '0')))} balls
            </div>
          </motion.div>
        </div>
      )}

      {/* Live indicator & Ball counter - Top Right */}
      <div className="absolute top-3 right-3 z-20 flex items-center gap-2">
        <div className="flex items-center gap-1.5 bg-black/70 backdrop-blur-md rounded-full px-3 py-1 border border-white/10">
          <motion.span 
            className="w-2 h-2 bg-red-500 rounded-full"
            animate={{ scale: [1, 1.3, 1], opacity: [1, 0.7, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
          />
          <span className="text-xs font-bold text-white">LIVE</span>
        </div>
        <div className="bg-black/70 backdrop-blur-md rounded-lg px-3 py-1 border border-white/10">
          <span className="text-xs text-white/60">Ball </span>
          <span className="text-sm font-bold text-white">#{ballCount}</span>
        </div>
      </div>
      
      {/* Pitch area */}
      <div className="absolute inset-x-0 bottom-0 h-[70%]">
        {/* Pitch strip */}
        <div className="absolute left-1/2 -translate-x-1/2 bottom-4 w-20 h-56 bg-gradient-to-b from-amber-700/60 to-amber-800/60 rounded-sm shadow-inner" />
        
        {/* Crease lines */}
        <div className="absolute left-1/2 -translate-x-1/2 bottom-12 w-28 h-0.5 bg-white/50" />
        <div className="absolute left-1/2 -translate-x-1/2 top-[25%] w-28 h-0.5 bg-white/50" />
        
        {/* Stumps - Bowler end */}
        <motion.div 
          className="absolute left-1/2 -translate-x-1/2 top-[20%]"
          animate={outcome === 'wicket' && phase === 'result' ? { x: [0, -5, 5, -3, 0], rotate: [0, -10, 10, 0] } : {}}
        >
          <div className="flex gap-1">
            <div className="w-1.5 h-8 bg-amber-200 rounded-t shadow" />
            <div className="w-1.5 h-8 bg-amber-200 rounded-t shadow" />
            <div className="w-1.5 h-8 bg-amber-200 rounded-t shadow" />
          </div>
          <div className="absolute -top-1 left-0 right-0 flex justify-center gap-2">
            <div className="w-3 h-1 bg-amber-100 rounded" />
            <div className="w-3 h-1 bg-amber-100 rounded" />
          </div>
        </motion.div>
        
        {/* Stumps - Batsman end */}
        <motion.div 
          className="absolute left-1/2 -translate-x-1/2 bottom-10"
          animate={outcome === 'wicket' && phase === 'result' ? { 
            x: [-2, 15, 25],
            rotate: [0, -45, -90],
            opacity: [1, 1, 0.5]
          } : {}}
          transition={{ duration: 0.6 }}
        >
          <div className="flex gap-1">
            <div className="w-2 h-10 bg-amber-200 rounded-t shadow" />
            <div className="w-2 h-10 bg-amber-200 rounded-t shadow" />
            <div className="w-2 h-10 bg-amber-200 rounded-t shadow" />
          </div>
          <div className="absolute -top-1.5 left-0 right-0 flex justify-center gap-2.5">
            <motion.div 
              className="w-4 h-1.5 bg-amber-100 rounded"
              animate={outcome === 'wicket' && phase === 'result' ? {
                y: [0, -20, 10],
                rotate: [0, 180, 360],
                opacity: [1, 1, 0]
              } : {}}
              transition={{ duration: 0.8 }}
            />
            <motion.div 
              className="w-4 h-1.5 bg-amber-100 rounded"
              animate={outcome === 'wicket' && phase === 'result' ? {
                y: [0, -15, 8],
                x: [0, 10, 15],
                rotate: [0, -180, -300],
                opacity: [1, 1, 0]
              } : {}}
              transition={{ duration: 0.8, delay: 0.05 }}
            />
          </div>
        </motion.div>

        {/* Bowler */}
        <motion.div
          className="absolute left-1/2"
          initial={{ top: '5%', x: '-50%', scale: 0.7 }}
          animate={{
            top: phase === 'runup' ? '25%' : phase === 'bowl' ? '32%' : '5%',
            scale: phase === 'runup' || phase === 'bowl' ? 1 : 0.7,
            x: phase === 'bowl' ? '-40%' : '-50%',
          }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
        >
          <div className="relative">
            <div className="w-8 h-14 bg-yellow-500 rounded-full flex flex-col items-center pt-2 shadow-lg">
              <div className="w-6 h-6 bg-amber-200 rounded-full shadow-inner" />
            </div>
            <motion.div
              className="absolute -right-4 top-6 origin-left"
              animate={{ rotate: phase === 'bowl' ? [0, -180, -360] : 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="w-5 h-2 bg-amber-200 rounded-full shadow" />
              {(phase === 'runup' || phase === 'idle') && (
                <div className="absolute -right-1 -top-1 w-3 h-3 bg-red-600 rounded-full shadow" />
              )}
            </motion.div>
            <div className="absolute -left-3 top-6 w-4 h-2 bg-amber-200 rounded-full rotate-[-20deg]" />
            {(phase === 'runup' || phase === 'bowl') && (
              <>
                <motion.div
                  className="absolute -bottom-3 left-1.5 w-2 h-6 bg-blue-900 rounded-full origin-top"
                  animate={{ rotate: [-35, 35, -35] }}
                  transition={{ duration: 0.2, repeat: Infinity }}
                />
                <motion.div
                  className="absolute -bottom-3 right-1.5 w-2 h-6 bg-blue-900 rounded-full origin-top"
                  animate={{ rotate: [35, -35, 35] }}
                  transition={{ duration: 0.2, repeat: Infinity }}
                />
              </>
            )}
            {phase !== 'runup' && phase !== 'bowl' && (
              <>
                <div className="absolute -bottom-4 left-1.5 w-2 h-5 bg-blue-900 rounded-full" />
                <div className="absolute -bottom-4 right-1.5 w-2 h-5 bg-blue-900 rounded-full" />
              </>
            )}
          </div>
        </motion.div>

        {/* Ball */}
        <motion.div
          className="absolute w-4 h-4"
          initial={{ left: '50%', top: '32%', opacity: 0, x: '-50%' }}
          animate={{
            left: phase === 'hit' || phase === 'result' ? 
              (outcome === 'six' ? '70%' : outcome === 'four' ? '75%' : 
               outcome === 'single' || outcome === 'double' || outcome === 'three' ? '60%' : '50%') : '50%',
            top: phase === 'bowl' ? '70%' : phase === 'hit' ? 
              (outcome === 'six' ? '5%' : outcome === 'four' ? '30%' : '55%') : '32%',
            opacity: phase === 'bowl' || phase === 'hit' || phase === 'result' ? 1 : 0,
            scale: outcome === 'six' && phase === 'hit' ? 1.8 : 1,
            x: '-50%',
          }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
        >
          <div className="w-full h-full rounded-full bg-gradient-to-br from-red-500 to-red-700 border-2 border-red-400 shadow-lg">
            <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-white/80 -translate-y-1/2 rounded" />
          </div>
        </motion.div>

        {/* Batsman */}
        <motion.div
          className="absolute left-1/2 bottom-[18%]"
          initial={{ x: '-50%' }}
          animate={{
            x: phase === 'hit' ? (outcome === 'six' || outcome === 'four' ? '-30%' : '-45%') : '-50%',
            rotate: phase === 'hit' ? (outcome === 'six' ? 60 : outcome === 'four' ? 45 : 20) : 0,
          }}
          transition={{ duration: 0.2 }}
        >
          <div className="relative">
            <div className="w-10 h-16 bg-blue-600 rounded-full flex flex-col items-center pt-2 shadow-lg">
              <div className="w-7 h-7 bg-blue-900 rounded-full relative shadow">
                <div className="absolute inset-1 bg-amber-200 rounded-full" />
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-2 border-2 border-blue-800 rounded-b" />
              </div>
            </div>
            <motion.div
              className="absolute -right-8 top-6 origin-left"
              animate={{ rotate: phase === 'hit' ? (outcome === 'six' ? -150 : outcome === 'four' ? -120 : -60) : -30 }}
              transition={{ duration: 0.15 }}
            >
              <div className="relative">
                <div className="w-14 h-3 bg-gradient-to-r from-amber-100 to-amber-200 rounded-sm shadow-md" />
                <div className="w-3 h-6 bg-amber-700 rounded-b ml-12 -mt-1 shadow" />
              </div>
            </motion.div>
            <div className="absolute -bottom-5 left-1 w-3 h-8 bg-white rounded-b shadow" />
            <div className="absolute -bottom-5 right-1 w-3 h-8 bg-white rounded-b shadow" />
            <div className="absolute -right-2 top-7 w-3 h-3 bg-white rounded-full" />
          </div>
        </motion.div>

        {/* Main Umpire */}
        <motion.div
          className="absolute right-[15%] top-[25%]"
          animate={{ scale: umpireSignal !== 'none' ? 1.15 : 1 }}
          transition={{ duration: 0.3 }}
        >
          <div className="relative">
            <div className="w-7 h-12 bg-white rounded-t-full flex flex-col items-center pt-1.5 shadow-lg">
              <div className="w-5 h-5 bg-amber-200 rounded-full shadow" />
            </div>
            <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-6 h-2.5 bg-gray-800 rounded-full shadow" />
            {/* Arms - Dynamic based on signal */}
            <motion.div
              className="absolute -left-4 top-5 w-5 h-2 bg-amber-200 rounded-full origin-right shadow"
              animate={{
                rotate: umpireSignal === 'four' ? 0 : umpireSignal === 'six' ? -90 : umpireSignal === 'wide' ? 0 : 30,
                x: umpireSignal === 'four' || umpireSignal === 'wide' ? -8 : 0,
                y: umpireSignal === 'out' ? -8 : 0,
              }}
              transition={{ duration: 0.3 }}
            />
            <motion.div
              className="absolute -right-4 top-5 w-5 h-2 bg-amber-200 rounded-full origin-left shadow"
              animate={{
                rotate: umpireSignal === 'four' ? 0 : umpireSignal === 'six' ? 90 : umpireSignal === 'wide' ? 0 : umpireSignal === 'out' ? -90 : -30,
                x: umpireSignal === 'four' || umpireSignal === 'wide' ? 8 : 0,
              }}
              transition={{ duration: 0.3 }}
            >
              {umpireSignal === 'out' && (
                <motion.div
                  className="absolute -top-4 right-0 w-2 h-5 bg-amber-200 rounded-t-full shadow"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                />
              )}
            </motion.div>
            <div className="absolute -bottom-4 left-1 w-2 h-5 bg-gray-800 rounded-b" />
            <div className="absolute -bottom-4 right-1 w-2 h-5 bg-gray-800 rounded-b" />
          </div>
          
          <AnimatePresence>
            {umpireSignal !== 'none' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap"
              >
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shadow
                  ${umpireSignal === 'four' ? 'bg-emerald-500 text-white' : 
                    umpireSignal === 'six' ? 'bg-purple-500 text-white' : 
                    umpireSignal === 'out' ? 'bg-red-500 text-white' : 
                    umpireSignal === 'wide' || umpireSignal === 'noball' ? 'bg-yellow-500 text-black' :
                    umpireSignal === 'review' ? 'bg-orange-500 text-white' :
                    umpireSignal === 'notout' ? 'bg-green-500 text-white' :
                    'bg-gray-500 text-white'}`}
                >
                  {umpireSignal === 'four' ? 'FOUR' : 
                   umpireSignal === 'six' ? 'SIX' : 
                   umpireSignal === 'out' ? 'OUT' : 
                   umpireSignal === 'wide' ? 'WIDE' :
                   umpireSignal === 'noball' ? 'NO BALL' :
                   umpireSignal === 'review' ? 'DRS' :
                   umpireSignal === 'notout' ? 'NOT OUT' : ''}
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Square Leg Umpire */}
        <motion.div className="absolute left-[12%] bottom-[35%]">
          <div className="relative scale-75">
            <div className="w-6 h-10 bg-white rounded-t-full flex flex-col items-center pt-1 shadow-lg">
              <div className="w-4 h-4 bg-amber-200 rounded-full" />
            </div>
            <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-5 h-2 bg-gray-800 rounded-full" />
            <div className="absolute -bottom-3 left-0.5 w-1.5 h-4 bg-gray-800 rounded-b" />
            <div className="absolute -bottom-3 right-0.5 w-1.5 h-4 bg-gray-800 rounded-b" />
          </div>
        </motion.div>

        {/* Third Umpire / TV Umpire Box */}
        <AnimatePresence>
          {phase === 'review' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="absolute left-[8%] top-[10%] w-28 h-20 rounded-lg bg-black/90 border-2 border-orange-500/50 overflow-hidden"
            >
              <div className="p-2 text-center">
                <p className="text-[8px] text-orange-400 font-bold mb-1">3RD UMPIRE</p>
                <motion.div
                  animate={reviewResult === 'pending' ? { opacity: [1, 0.3, 1] } : {}}
                  transition={{ duration: 0.8, repeat: reviewResult === 'pending' ? Infinity : 0 }}
                  className={`text-sm font-black ${
                    reviewResult === 'pending' ? 'text-orange-400' :
                    reviewResult === 'out' ? 'text-red-500' : 'text-green-500'
                  }`}
                >
                  {reviewResult === 'pending' ? 'CHECKING...' :
                   reviewResult === 'out' ? 'OUT!' : 'NOT OUT!'}
                </motion.div>
                {reviewResult === 'pending' && (
                  <motion.div 
                    className="mt-1 h-1 bg-muted rounded-full overflow-hidden"
                  >
                    <motion.div
                      className="h-full bg-orange-500"
                      initial={{ width: '0%' }}
                      animate={{ width: '100%' }}
                      transition={{ duration: 3 }}
                    />
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Celebration overlays */}
      <AnimatePresence>
        {showCelebration && outcome === 'six' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
          >
            <div className="relative">
              <motion.div
                className="text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-500 to-purple-400"
                style={{ textShadow: '0 0 40px rgba(168, 85, 247, 0.5)' }}
                animate={{ scale: [1, 1.2, 1], rotate: [0, -5, 5, 0] }}
                transition={{ duration: 0.5, repeat: 3 }}
              >
                SIX!
              </motion.div>
              {[...Array(16)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-3 h-3 rounded-full"
                  style={{ 
                    backgroundColor: ['#a855f7', '#22c55e', '#eab308', '#3b82f6', '#ec4899'][i % 5],
                    left: '50%',
                    top: '50%',
                  }}
                  initial={{ x: 0, y: 0, opacity: 1 }}
                  animate={{ 
                    x: Math.cos(i * 22.5 * Math.PI / 180) * 120,
                    y: Math.sin(i * 22.5 * Math.PI / 180) * 120,
                    opacity: 0,
                    scale: [1, 2.5, 0],
                  }}
                  transition={{ duration: 1.2, delay: i * 0.03 }}
                />
              ))}
            </div>
          </motion.div>
        )}

        {showCelebration && outcome === 'four' && (
          <motion.div
            initial={{ opacity: 0, x: -100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
          >
            <motion.div
              className="text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-500"
              style={{ textShadow: '0 0 30px rgba(34, 197, 94, 0.5)' }}
              animate={{ x: [0, 15, -15, 0] }}
              transition={{ duration: 0.3, repeat: 3 }}
            >
              FOUR!
            </motion.div>
          </motion.div>
        )}

        {showCelebration && outcome === 'wicket' && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex items-center justify-center pointer-events-none bg-red-900/20"
          >
            <motion.div
              className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-500"
              style={{ textShadow: '0 0 30px rgba(239, 68, 68, 0.5)' }}
              animate={{ scale: [1, 1.15, 1] }}
              transition={{ duration: 0.3, repeat: 3 }}
            >
              WICKET!
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Live indicator */}
      <div className="absolute top-3 left-3 flex items-center gap-2 bg-black/60 backdrop-blur-sm px-3 py-1.5 rounded-full">
        <motion.span
          className="w-2.5 h-2.5 bg-red-500 rounded-full"
          animate={{ scale: [1, 1.3, 1], opacity: [1, 0.7, 1] }}
          transition={{ duration: 1, repeat: Infinity }}
        />
        <span className="text-xs font-bold text-white uppercase tracking-wider">Live Action</span>
      </div>

      {/* Ball count */}
      <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-sm px-3 py-1.5 rounded-full">
        <span className="text-xs font-bold text-white">Ball #{ballCount + 1}</span>
      </div>

      {/* Commentary Box - Shows what happened */}
      <AnimatePresence mode="wait">
        {commentary && phase !== 'idle' && (
          <motion.div
            key={commentary}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute bottom-16 left-1/2 -translate-x-1/2 max-w-[80%]"
          >
            <div className="bg-black/80 backdrop-blur-sm px-4 py-2 rounded-xl border border-white/10 text-center">
              <p className="text-sm font-bold text-white">{commentary}</p>
              {detail && phase === 'result' && (
                <p className="text-xs text-white/60 mt-1">{detail}</p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Ball History - Use passed recentBalls for sync */}
      <div className="absolute bottom-3 left-3 flex items-center gap-1.5">
        <span className="text-[10px] text-white/60 mr-1">This Over:</span>
        {recentBalls.map((b, i) => (
          <motion.div
            key={i}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className={`w-6 h-6 rounded-full flex items-center justify-center ${
              b.type === 'boundary' ? 'bg-emerald-500' :
              b.type === 'six' ? 'bg-purple-500' :
              b.type === 'wicket' ? 'bg-red-500' :
              b.type === 'dot' ? 'bg-gray-500' :
              'bg-blue-500'
            }`}
          >
            <span className="text-[10px] font-bold text-white">
              {b.type === 'wicket' ? 'W' : b.type === 'dot' ? '•' : b.runs}
            </span>
          </motion.div>
        ))}
        {/* Show empty slots for remaining balls */}
        {Array.from({ length: Math.max(0, 6 - recentBalls.length) }).map((_, i) => (
          <div key={`empty-${i}`} className="w-6 h-6 rounded-full border border-white/20 border-dashed" />
        ))}
      </div>

      {/* Current phase indicator */}
      <div className="absolute bottom-3 right-3 flex items-center gap-2">
        <span className={`text-[10px] font-bold px-2 py-1 rounded-full transition-colors ${
          phase === 'runup' ? 'bg-yellow-500/80 text-black' :
          phase === 'bowl' ? 'bg-orange-500/80 text-white' :
          phase === 'hit' ? 'bg-blue-500/80 text-white' :
          phase === 'result' ? 'bg-emerald-500/80 text-white' :
          phase === 'review' ? 'bg-orange-500/80 text-white animate-pulse' :
          'bg-gray-500/50 text-white'
        }`}>
          {phase === 'idle' ? 'Ready' : 
           phase === 'runup' ? 'Run-up' : 
           phase === 'bowl' ? 'Bowling' : 
           phase === 'hit' ? 'Shot!' : 
           phase === 'review' ? 'DRS Review' :
           'Result'}
        </span>
      </div>
    </div>
  )
}
