import { useEffect, useId, useRef, useState, type KeyboardEvent } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { difficultyLabel } from '../../lib/progression'
import type { Task } from '../../types/rpg'

interface QuestItemProps {
  quest: Task
  onComplete: (taskId: number) => Promise<void> | void
  disabled?: boolean
}

export function QuestItem({ quest, onComplete, disabled }: QuestItemProps) {
  const reduceMotion = useReducedMotion()
  const titleId = useId()
  const [optimisticDone, setOptimisticDone] = useState(quest.status === 'completed')
  const [burst, setBurst] = useState(false)
  const [announcement, setAnnouncement] = useState('')
  const completingRef = useRef(false)

  useEffect(() => {
    if (quest.status === 'completed') setOptimisticDone(true)
  }, [quest.status])

  const done = optimisticDone || quest.status === 'completed'
  const checkboxLabel = done
    ? `${quest.title} completed`
    : `Complete quest ${quest.title}, reward ${quest.xp_reward} XP`

  async function complete() {
    if (done || disabled || completingRef.current) return
    completingRef.current = true

    setOptimisticDone(true)
    setBurst(true)
    setAnnouncement(`${quest.title} complete. Plus ${quest.xp_reward} experience points.`)

    try {
      await onComplete(quest.task_id)
    } catch {
      setOptimisticDone(false)
      setBurst(false)
      setAnnouncement(`Could not complete ${quest.title}. Quest restored.`)
    } finally {
      completingRef.current = false
      window.setTimeout(() => setBurst(false), reduceMotion ? 0 : 900)
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
      initial={false}
      animate={
        burst && !reduceMotion
          ? { scale: [1, 1.035, 1], x: [0, -4, 4, 0] }
          : { scale: 1, x: 0 }
      }
      transition={{ type: 'spring', stiffness: 520, damping: 16, mass: 0.6 }}
      className="relative rounded-xl border border-gold/15 bg-panel-raised"
    >
      <div className="flex items-start gap-3 p-4">
        <button
          type="button"
          role="checkbox"
          aria-checked={done}
          aria-labelledby={titleId}
          aria-label={checkboxLabel}
          disabled={done || disabled}
          onClick={() => void complete()}
          onKeyDown={handleKeyDown}
          className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-md border border-gold/50 bg-ink text-gold disabled:cursor-default"
        >
          {done && (
            <span aria-hidden="true" className="text-sm font-black">
              ✓
            </span>
          )}
        </button>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3
              id={titleId}
              className={`font-semibold text-parchment transition-colors ${done ? 'text-muted line-through decoration-gold/70 decoration-2' : ''}`}
            >
              {quest.title}
            </h3>
            <span className="rounded-full border border-gold/20 px-2 py-0.5 text-[11px] uppercase tracking-wide text-gold">
              {difficultyLabel(quest.difficulty)}
            </span>
          </div>
          {quest.description && (
            <p className={`mt-1 text-sm text-muted ${done ? 'line-through' : ''}`}>{quest.description}</p>
          )}
          <p className="mt-2 text-xs font-semibold text-ember">+{quest.xp_reward} XP</p>
        </div>
      </div>

      <AnimatePresence>
        {burst && (
          <motion.span
            aria-hidden="true"
            className="pointer-events-none absolute right-4 top-3 font-display text-lg font-bold text-moss"
            initial={reduceMotion ? { opacity: 1 } : { opacity: 0, y: 10, scale: 0.8 }}
            animate={{ opacity: 1, y: -18, scale: 1.05 }}
            exit={{ opacity: 0, y: -36 }}
            transition={{ type: 'spring', stiffness: 280, damping: 14 }}
          >
            +{quest.xp_reward} XP
          </motion.span>
        )}
      </AnimatePresence>

      <span className="sr-only" aria-live="polite">
        {announcement}
      </span>
    </motion.li>
  )
}
