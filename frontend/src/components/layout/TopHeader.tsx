import { useGameStore } from '../../store/gameStore'
import { useAuthStore } from '../../store/authStore'

export function TopHeader() {
  const user = useAuthStore((state) => state.user)
  const { profile, coins, shopItems } = useGameStore()

  const level = profile?.current_level ?? 12
  const streak = profile?.current_streak ?? 7
  const equippedCount = shopItems.filter((i) => i.isEquipped).length

  // Determine greeting based on current time
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'GOOD MORNING,' : hour < 18 ? 'GOOD AFTERNOON,' : 'GOOD EVENING,'

  const heroName = profile?.username ? profile.username.toUpperCase() : 'ASHEN HERO'

  return (
    <header className="space-y-4 pb-2">
      {/* Top Meta Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#262018] pb-3 text-xs">
        <div className="flex items-center gap-2 text-muted">
          <span className="text-sm">🌙</span>
          <span className="font-mono uppercase tracking-wider text-parchment/90">
            MIDNIGHT ECLIPSE
          </span>
          <span className="text-muted-dark">•</span>
          <span className="font-mono text-[11px] text-muted">CYCLE XII</span>
        </div>

        {/* Top Right Stat Badges */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 rounded-full border border-ember/30 bg-ember/10 px-3 py-1 text-xs font-semibold text-ember">
            <span>🔥</span>
            <span className="font-mono">{streak}d</span>
          </div>
          <div className="flex items-center gap-1.5 rounded-full border border-gold/30 bg-gold/10 px-3 py-1 text-xs font-semibold text-gold">
            <span>🪙</span>
            <span className="font-mono">{coins} Coins</span>
          </div>
          <button
            type="button"
            aria-label="Alerts"
            className="flex h-7 w-7 items-center justify-center rounded-full border border-[#2e261d] bg-[#14110e] text-gold hover:border-gold/40 hover:bg-[#1f1914] transition-colors"
          >
            🔔
          </button>
        </div>
      </div>

      {/* Main Title Row */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="font-display text-xs tracking-[0.25em] text-muted uppercase">
            {greeting} —
          </p>
          <div className="flex flex-wrap items-center gap-3 pt-0.5">
            <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-wide text-parchment">
              {heroName}
            </h2>
            <span className="rounded-full border border-gold/40 bg-gold/10 px-3 py-0.5 font-mono text-xs font-bold text-gold shadow-[0_0_10px_rgba(226,179,104,0.15)]">
              Lv. {level}
            </span>
          </div>
          <p className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted">
            <span className="font-display font-semibold tracking-wider text-parchment/80">
              KEEPER OF THE KILN
            </span>
            <span className="text-muted-dark">•</span>
            <span className="rounded border border-gold/30 bg-gold/10 px-1.5 py-0.5 font-mono text-[10px] font-bold text-gold">
              {equippedCount} WEARABLES EQUIPPED
            </span>
          </p>
        </div>
      </div>
    </header>
  )
}
