import { useGameStore } from '../../store/gameStore'

export function TopHeader() {
  const { profile, coins, shopItems } = useGameStore()

  const level = profile?.current_level ?? 1
  const streak = profile?.current_streak ?? 0
  const equippedCount = shopItems.filter((i) => i.isEquipped).length

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening'
  const heroName = profile?.username ? profile.username.toUpperCase() : 'ASHEN HERO'

  return (
    <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#262018] pb-4">
      {/* Hero Identity */}
      <div>
        <p className="font-mono text-[11px] tracking-widest text-muted uppercase">
          {greeting}, Soulbearer
        </p>
        <div className="flex items-center gap-3 mt-0.5">
          <h2 className="font-display text-2xl sm:text-3xl font-black tracking-wide text-parchment">
            {heroName}
          </h2>
          <span className="rounded-full border border-gold/40 bg-gold/10 px-2.5 py-0.5 font-mono text-xs font-bold text-gold shadow-[0_0_10px_rgba(226,179,104,0.15)]">
            Lv. {level}
          </span>
        </div>
      </div>

      {/* Primary Status Capsules (Streak & Treasury) */}
      <div className="flex items-center gap-2.5">
        {/* Bonfire Streak Capsule */}
        <div className="flex items-center gap-2 rounded-xl border border-ember/30 bg-[#16100c] px-3.5 py-2 shadow-sm">
          <span className="text-base animate-flame">🔥</span>
          <div>
            <p className="font-mono text-[9px] uppercase tracking-wider text-muted">STREAK</p>
            <p className="font-mono text-xs font-bold text-ember">{streak} Days</p>
          </div>
        </div>

        {/* Treasury Coins Capsule */}
        <div className="flex items-center gap-2 rounded-xl border border-gold/30 bg-[#16120c] px-3.5 py-2 shadow-sm">
          <span className="text-base">🪙</span>
          <div>
            <p className="font-mono text-[9px] uppercase tracking-wider text-muted">COINS</p>
            <p className="font-mono text-xs font-bold text-gold-bright">{coins}</p>
          </div>
        </div>

        {/* Gear Count Pill */}
        {equippedCount > 0 && (
          <div className="hidden md:flex items-center gap-1.5 rounded-xl border border-[#2e261d] bg-[#120f0c] px-3 py-2 text-xs font-mono text-muted">
            <span>🛡️</span>
            <span>{equippedCount} Gear</span>
          </div>
        )}
      </div>
    </header>
  )
}

