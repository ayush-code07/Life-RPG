import { motion, useReducedMotion } from 'framer-motion'
import { xpBarPercent } from '../../lib/progression'

interface XpProgressBarProps {
  level: number
  progressXp: number
  xpNeeded: number
}

export function XpProgressBar({ level, progressXp, xpNeeded }: XpProgressBarProps) {
  const reduceMotion = useReducedMotion()
  const percent = xpBarPercent(progressXp, xpNeeded)
  const label = `Level ${level} experience: ${progressXp} of ${xpNeeded} XP`

  return (
    <div className="space-y-2">
      <div className="flex items-baseline justify-between gap-3 text-sm">
        <span className="font-semibold text-gold">Level {level}</span>
        <span className="tabular-nums text-muted">
          {progressXp} / {xpNeeded} XP
        </span>
      </div>
      <div className="h-3 overflow-hidden rounded-full bg-ink ring-1 ring-gold/25">
        <motion.div
          role="progressbar"
          aria-label={label}
          aria-valuemin={0}
          aria-valuemax={xpNeeded}
          aria-valuenow={progressXp}
          className="h-full origin-left rounded-full bg-linear-to-r from-ember to-gold"
          initial={false}
          animate={{ width: `${percent}%` }}
          transition={
            reduceMotion
              ? { duration: 0 }
              : { type: 'spring', stiffness: 140, damping: 18, mass: 0.8 }
          }
        />
      </div>
    </div>
  )
}
