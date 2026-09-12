import { motion, useReducedMotion } from 'framer-motion'
import type { Profile, ProfileAttribute } from '../../types/rpg'
import { XpProgressBar } from './XpProgressBar'

interface CharacterProfileProps {
  profile: Profile
  attributes: ProfileAttribute[]
}

export function CharacterProfile({ profile, attributes }: CharacterProfileProps) {
  const reduceMotion = useReducedMotion()
  const initial = profile.username.slice(0, 1).toUpperCase() || 'H'

  return (
    <section
      aria-labelledby="character-heading"
      className="rounded-2xl border border-gold/20 bg-panel p-6 shadow-[0_12px_40px_rgba(0,0,0,0.28)]"
    >
      <header className="flex items-center gap-4">
        <motion.div
          aria-hidden="true"
          className="grid h-16 w-16 place-items-center rounded-2xl border border-gold/40 bg-panel-raised font-display text-2xl text-gold"
          animate={reduceMotion ? undefined : { boxShadow: ['0 0 0 rgba(232,184,109,0)', '0 0 24px rgba(232,184,109,0.35)', '0 0 0 rgba(232,184,109,0)'] }}
          transition={{ duration: 3.6, repeat: Infinity }}
        >
          {initial}
        </motion.div>
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-gold">Adventurer</p>
          <h2 id="character-heading" className="font-display text-2xl">
            {profile.username}
          </h2>
        </div>
      </header>

      <div className="mt-6">
        <XpProgressBar
          level={profile.current_level}
          progressXp={profile.progress_xp}
          xpNeeded={profile.xp_needed_for_next}
        />
        <p className="mt-2 text-xs text-muted">
          Lifetime XP {profile.total_xp.toLocaleString()} · Streak {profile.current_streak} days (best{' '}
          {profile.longest_streak})
        </p>
      </div>

      {attributes.length > 0 && (
        <ul className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-3" aria-label="Character attributes">
          {attributes.map((attr) => (
            <li
              key={attr.attribute_id}
              className="rounded-xl border border-gold/10 bg-ink/60 px-3 py-2"
            >
              <p className="text-[11px] uppercase tracking-wider text-muted">
                {attr.attribute_name ?? `Stat ${attr.attribute_id}`}
              </p>
              <p className="font-display text-lg text-gold">{attr.attribute_value}</p>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
