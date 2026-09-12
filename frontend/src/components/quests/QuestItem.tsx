import { useEffect, useId, useRef, useState, type KeyboardEvent } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { soundFx } from '../../lib/audio'
import type { Task } from '../../types/rpg'

interface QuestItemProps {
  quest: Task
  onComplete: (taskId: number) => Promise<void> | void
  onDelete?: (taskId: number) => Promise<void> | void
  disabled?: boolean
}

// Map quest keywords to thematic RPG category icons & attribute bonuses
function getQuestMeta(title: string, difficulty: number) {
  const t = title.toLowerCase()
  if (t.includes('read') || t.includes('book') || t.includes('study') || t.includes('learn')) {
    return { icon: '📖', bonus: '+10 Intelligence', color: 'text-blue-400' }
  }
  if (t.includes('gym') || t.includes('workout') || t.includes('run') || t.includes('exercise') || t.includes('water')) {
    return { icon: '🏋️', bonus: '+15 Strength', color: 'text-ember' }
  }
  if (t.includes('code') || t.includes('build') || t.includes('dev') || t.includes('project')) {
    return { icon: '💻', bonus: '+15 Intelligence', color: 'text-cyan-400' }
  }
  if (t.includes('meditat') || t.includes('sleep') || t.includes('rest')) {
    return { icon: '🧘', bonus: '+10 Discipline', color: 'text-purple-400' }
  }
  return { icon: '⚔️', bonus: `+${difficulty * 5} Mastery`, color: 'text-gold' }
}

export function QuestItem({ quest, onComplete, onDelete, disabled }: QuestItemProps) {
  const titleId = useId()
  const [optimisticDone, setOptimisticDone] = useState(quest.status === 'completed')
  const [burst, setBurst] = useState(false)
  const completingRef = useRef(false)

  useEffect(() => {
    if (quest.status === 'completed') setOptimisticDone(true)
  }, [quest.status])

  const done = optimisticDone || quest.status === 'completed'
  const meta = getQuestMeta(quest.title, quest.difficulty)

  async function complete() {
    if (done || disabled || completingRef.current) return
    completingRef.current = true

    setOptimisticDone(true)
    setBurst(true)
    soundFx.playSwordSlash()
    soundFx.playBossHit()

    try {
      await onComplete(quest.task_id)
    } catch {
      setOptimisticDone(false)
      setBurst(false)
    } finally {
      completingRef.current = false
      window.setTimeout(() => setBurst(false), 900)
    }
  }

  function handleKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      void complete()
    }
  }

  return (
    <motion.li
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className={`group relative flex items-center justify-between rounded-xl border p-3.5 sm:p-4 transition-all ${
        done
          ? 'border-[#231d17] bg-[#0e0c0a]/60 opacity-60'
          : 'border-[#2e261d] bg-[#14110e] hover:border-gold/35 hover:bg-[#181410] shadow-[0_4px_16px_rgba(0,0,0,0.25)]'
      }`}
    >
      <div className="flex items-center gap-3.5 min-w-0 flex-1">
        {/* Custom Quest Checkbox */}
        <button
          type="button"
          role="checkbox"
          aria-checked={done}
          aria-labelledby={titleId}
          disabled={done || disabled}
          onClick={() => void complete()}
          onKeyDown={handleKeyDown}
          className={`grid h-6 w-6 shrink-0 place-items-center rounded border transition-all ${
            done
              ? 'border-moss/40 bg-moss/20 text-moss'
              : 'border-[#3d3327] bg-[#0d0b09] hover:border-gold hover:bg-gold/10'
          }`}
        >
          {done && <span className="text-xs font-bold">✓</span>}
        </button>

        {/* Category Icon Badge */}
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[#2e261d] bg-[#100d0a] text-base">
          <span>{meta.icon}</span>
        </div>

        {/* Quest Title and Reward Badges */}
        <div className="min-w-0 flex-1">
          <h4
            id={titleId}
            className={`font-display text-sm font-semibold tracking-wide transition-colors truncate ${
              done ? 'text-muted line-through decoration-gold/50' : 'text-parchment group-hover:text-parchment'
            }`}
          >
            {quest.title}
          </h4>

          <div className="mt-1 flex flex-wrap items-center gap-2 text-xs">
            <span className="rounded border border-ember/30 bg-ember/10 px-2 py-0.5 font-mono text-[11px] font-bold text-ember">
              +{quest.xp_reward} XP
            </span>
            <span className="text-muted-dark">•</span>
            <span className={`font-mono text-[11px] ${meta.color}`}>
              {meta.bonus}
            </span>
          </div>

          {/* Quest Tags */}
          {quest.tags && quest.tags.length > 0 && (
            <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
              {quest.tags.map((tag) => {
                const tagMap: Record<string, { icon: string; style: string }> = {
                  Work: { icon: '💼', style: 'border-blue-500/30 bg-blue-500/10 text-blue-300' },
                  Exercise: { icon: '🏃', style: 'border-orange-500/30 bg-orange-500/10 text-orange-300' },
                  'Health + Wellness': { icon: '🌿', style: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300' },
                  School: { icon: '📚', style: 'border-indigo-500/30 bg-indigo-500/10 text-indigo-300' },
                  Teams: { icon: '👥', style: 'border-purple-500/30 bg-purple-500/10 text-purple-300' },
                  Chores: { icon: '🧹', style: 'border-amber-500/30 bg-amber-500/10 text-amber-300' },
                  Creativity: { icon: '🎨', style: 'border-pink-500/30 bg-pink-500/10 text-pink-300' },
                }
                const m = tagMap[tag] ?? { icon: '🏷️', style: 'border-[#382d20] bg-[#1a1510] text-muted' }
                return (
                  <span
                    key={tag}
                    className={`inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 font-mono text-[10px] font-medium ${m.style}`}
                  >
                    <span>{m.icon}</span>
                    <span>{tag}</span>
                  </span>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Right Actions / Abandon & Completion Indicator */}
      <div className="flex items-center gap-2 pl-2">
        {onDelete && !done && (
          <button
            type="button"
            title="Abandon Quest"
            onClick={(e) => {
              e.stopPropagation()
              void onDelete(quest.task_id)
            }}
            className="opacity-0 group-hover:opacity-70 hover:!opacity-100 p-1.5 rounded-lg hover:bg-ember/15 text-muted hover:text-ember transition-all"
          >
            <span className="text-xs">🗑️</span>
          </button>
        )}
        <div className="text-muted-dark group-hover:translate-x-0.5 group-hover:text-gold transition-all">
          <span className="text-sm font-bold">›</span>
        </div>
      </div>

      {/* Floating XP & Coin Reward Burst Animation */}
      <AnimatePresence>
        {burst && (
          <div className="pointer-events-none absolute right-4 -top-3 z-30 flex flex-col items-end gap-1">
            <motion.span
              aria-hidden="true"
              className="font-display text-sm font-black text-moss drop-shadow-[0_0_12px_#48bb78]"
              initial={{ opacity: 0, y: 15, scale: 0.6 }}
              animate={{ opacity: 1, y: -15, scale: 1.2 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: 0.7 }}
            >
              +{quest.xp_reward} XP!
            </motion.span>
            <motion.span
              aria-hidden="true"
              className="font-mono text-xs font-black text-gold-bright drop-shadow-[0_0_10px_#fbbf24]"
              initial={{ opacity: 0, y: 10, scale: 0.6 }}
              animate={{ opacity: 1, y: -8, scale: 1.1 }}
              exit={{ opacity: 0, y: -25 }}
              transition={{ duration: 0.7, delay: 0.15 }}
            >
              +1 🪙 COIN!
            </motion.span>
          </div>
        )}
      </AnimatePresence>
    </motion.li>
  )
}
