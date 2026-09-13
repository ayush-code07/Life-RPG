import { useEffect, useId, useRef, useState, type KeyboardEvent } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { soundFx } from '../../lib/audio'
import { categorizeTaskAttributes } from '../../lib/attributeMapping'
import type { Task } from '../../types/rpg'

interface QuestItemProps {
  quest: Task
  onComplete: (taskId: number) => Promise<void> | void
  onEdit?: (quest: Task) => void
  onDelete?: (taskId: number) => Promise<void> | void
  disabled?: boolean
}

export function QuestItem({ quest, onComplete, onEdit, onDelete, disabled }: QuestItemProps) {
  const titleId = useId()
  const [optimisticDone, setOptimisticDone] = useState(quest.status === 'completed')
  const [burst, setBurst] = useState(false)
  const completingRef = useRef(false)

  useEffect(() => {
    if (quest.status === 'completed') setOptimisticDone(true)
  }, [quest.status])

  const done = optimisticDone || quest.status === 'completed'
  const attrRewards = categorizeTaskAttributes(quest.title, quest.tags, quest.difficulty)
  const primaryIcon = attrRewards[0]?.icon ?? '⚔️'

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
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[#2e261d] bg-[#100d0a] text-base shadow-inner">
          <span>{primaryIcon}</span>
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

          <div className="mt-1 flex flex-wrap items-center gap-1.5 text-xs">
            <span className="rounded border border-ember/30 bg-ember/10 px-2 py-0.5 font-mono text-[11px] font-bold text-ember">
              +{quest.xp_reward} XP
            </span>
            <span className="text-muted-dark">•</span>
            {attrRewards.map((reward) => (
              <span
                key={reward.attributeName}
                className={`rounded border px-1.5 py-0.5 font-mono text-[10px] font-semibold flex items-center gap-1 ${reward.badgeColor}`}
              >
                <span>{reward.icon}</span>
                <span>+{reward.xpValue} {reward.attributeName}</span>
              </span>
            ))}
          </div>

          {/* Quest Tags & Daily Reminder Badge */}
          <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
            {quest.remind_daily && (
              <span className="inline-flex items-center gap-1 rounded-md border border-gold/50 bg-gold/15 px-1.5 py-0.5 font-mono text-[10px] font-bold text-gold shadow-[0_0_8px_rgba(226,179,104,0.2)]">
                <span>⏰</span>
                <span>Daily</span>
              </span>
            )}
            {quest.tags && quest.tags.length > 0 && quest.tags.map((tag) => {
              const tagMap: Record<string, { icon: string; style: string }> = {
                Work: { icon: '💼', style: 'border-blue-500/30 bg-blue-500/10 text-blue-300' },
                Exercise: { icon: '🏃', style: 'border-orange-500/30 bg-orange-500/10 text-orange-300' },
                'Health + Wellness': { icon: '🌿', style: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300' },
                School: { icon: '📚', style: 'border-indigo-500/30 bg-indigo-500/10 text-indigo-300' },
                Teams: { icon: '👥', style: 'border-purple-500/30 bg-purple-500/10 text-purple-300' },
                Chores: { icon: '🧹', style: 'border-amber-500/30 bg-amber-500/10 text-amber-300' },
                Creativity: { icon: '🎨', style: 'border-pink-500/30 bg-pink-500/10 text-pink-300' },
                Others: { icon: '✨', style: 'border-cyan-500/30 bg-cyan-500/10 text-cyan-300' },
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
        </div>
      </div>

      {/* Right Actions / Edit, Abandon & Completion Indicator */}
      <div className="flex items-center gap-1.5 pl-2">
        {onEdit && !done && (
          <button
            type="button"
            title="Edit Quest"
            onClick={(e) => {
              e.stopPropagation()
              soundFx.playClick()
              onEdit(quest)
            }}
            className="opacity-0 group-hover:opacity-70 hover:!opacity-100 p-1.5 rounded-lg hover:bg-gold/15 text-muted hover:text-gold transition-all"
          >
            <span className="text-xs">✏️</span>
          </button>
        )}
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

      {/* Floating XP & Coin & Attribute Reward Burst Animation */}
      <AnimatePresence>
        {burst && (
          <div className="pointer-events-none absolute right-4 -top-5 z-30 flex flex-col items-end gap-1">
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
            {attrRewards.slice(0, 1).map((r) => (
              <motion.span
                key={r.attributeName}
                aria-hidden="true"
                className={`font-mono text-xs font-black drop-shadow-[0_0_10px_rgba(0,0,0,0.9)] ${r.textColor}`}
                initial={{ opacity: 0, y: 5, scale: 0.6 }}
                animate={{ opacity: 1, y: -2, scale: 1.1 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.7, delay: 0.25 }}
              >
                +{r.xpValue} {r.attributeName} XP!
              </motion.span>
            ))}
          </div>
        )}
      </AnimatePresence>
    </motion.li>
  )
}
