import { useState } from 'react'
import { soundFx } from '../../lib/audio'

const AXIOMS = [
  '“Let the embers temper the blade. Stand firm against the fading light.”',
  '“The kiln demands devotion, not perfection. Rekindle the spark each dawn.”',
  '“Even the greatest bonfire began from a solitary cinder.”',
  '“In the depths of the abyss, discipline is the only torch that endures.”',
  '“Master the craft, heed the oath, and conquer the behemoths within.”',
]

export function AxiomBanner() {
  const [index, setIndex] = useState(0)

  const handleNext = () => {
    soundFx.playClick()
    setIndex((prev) => (prev + 1) % AXIOMS.length)
  }

  return (
    <div
      onClick={handleNext}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && handleNext()}
      className="group relative flex cursor-pointer items-center justify-between rounded-xl border border-[#382d20] bg-gradient-to-r from-[#17130f] via-[#1a1511] to-[#14100c] p-3.5 sm:p-4 shadow-[0_4px_20px_rgba(0,0,0,0.3)] transition-all hover:border-gold/40 hover:shadow-[0_0_20px_rgba(226,179,104,0.1)]"
    >
      <div className="flex items-center gap-3.5">
        {/* Ancient Compass Rune Icon */}
        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg border border-gold/30 bg-[#100d0a] shadow-inner text-gold">
          <svg
            className="h-6 w-6 text-gold group-hover:rotate-45 transition-transform duration-500"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <circle cx="12" cy="12" r="9" stroke="currentColor" strokeDasharray="3 3" />
            <circle cx="12" cy="12" r="4" stroke="currentColor" />
            <path d="M12 3v3M12 18v3M3 12h3M18 12h3" stroke="currentColor" />
            <path d="M6.34 6.34l2.12 2.12M15.54 15.54l2.12 2.12M6.34 17.66l2.12-2.12M15.54 8.46l2.12-2.12" stroke="currentColor" strokeWidth="1" />
          </svg>
        </div>

        <div>
          <div className="flex items-center gap-2">
            <span className="font-display text-[10px] font-bold tracking-[0.2em] text-gold uppercase">
              AXIOM INSCRIPTION
            </span>
            <span className="text-muted-dark">•</span>
            <span className="text-[10px] tracking-wider text-muted font-mono uppercase">
              CONSULT ANCIENT CODEX
            </span>
          </div>
          <p className="mt-0.5 font-display text-xs sm:text-sm italic text-parchment/90">
            {AXIOMS[index]}
          </p>
        </div>
      </div>

      <div className="pl-3 text-muted-dark group-hover:translate-x-1 group-hover:text-gold transition-all">
        <span className="text-base font-bold">›</span>
      </div>
    </div>
  )
}
