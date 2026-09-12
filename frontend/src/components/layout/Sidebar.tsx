import { useAuthStore } from '../../store/authStore'
import { useGameStore } from '../../store/gameStore'
import type { ActiveTab } from '../../types/rpg'

export function Sidebar() {
  const signOut = useAuthStore((state) => state.signOut)
  const user = useAuthStore((state) => state.user)
  const preview = useAuthStore((state) => state.preview)
  const {
    profile,
    activeTab,
    championClass,
    sfxEnabled,
    crtEnabled,
    resting,
    setActiveTab,
    toggleSfx,
    toggleCrt,
    restAtBonfire,
  } = useGameStore()

  const level = profile?.current_level ?? 12
  const streak = profile?.current_streak ?? 7
  const gold = Math.max(120, (profile?.total_xp ?? 0) + 240)

  const navItems: Array<{ id: ActiveTab; label: string; sub: string; icon: string }> = [
    {
      id: 'sanctuary',
      label: 'SANCTUARY',
      sub: 'Quests & Daily Trial',
      icon: '🛡️',
    },
    {
      id: 'attributes',
      label: 'ATTRIBUTES',
      sub: 'Stats & Mastery',
      icon: '⚔️',
    },
    {
      id: 'armory',
      label: 'ARMORY',
      sub: 'Vault & Relics',
      icon: '🎒',
    },
    {
      id: 'chronicles',
      label: 'CHRONICLES',
      sub: 'Codex, Feats & System',
      icon: '📜',
    },
  ]

  return (
    <aside
      aria-label="Sidebar Navigation"
      className="flex flex-col justify-between border-r border-[#262018] bg-[#0e0c0a]/95 p-4 sm:p-5 lg:min-h-screen lg:w-72 xl:w-80"
    >
      <div className="space-y-6">
        {/* Brand Header */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-gold/30 bg-panel-raised shadow-[0_0_15px_rgba(226,179,104,0.15)]">
            <span className="text-xl">🔥</span>
          </div>
          <div>
            <h1 className="font-display text-lg font-bold tracking-wider text-gold-gradient">
              ASHEN PATH
            </h1>
            <p className="text-[10px] tracking-[0.25em] uppercase text-muted">
              Chronicles of Ash
            </p>
          </div>
        </div>

        {/* Character Quick Card */}
        <div className="rounded-xl border border-[#2e261d] bg-[#14110e] p-3.5 shadow-inner">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-gold shadow-[0_0_8px_#ffd175]" />
              <span className="font-display text-xs font-semibold uppercase tracking-wider text-parchment">
                {championClass}
              </span>
            </div>
            <span className="rounded border border-gold/20 bg-gold/10 px-2 py-0.5 font-mono text-[11px] font-bold text-gold">
              Lv. {level}
            </span>
          </div>

          <div className="mt-3 flex items-center justify-between border-t border-[#262018] pt-2 text-xs">
            <div className="flex items-center gap-1.5 text-muted">
              <span className="text-gold">🪙</span>
              <span className="font-mono font-medium text-parchment">{gold}</span>
            </div>
            <div className="flex items-center gap-1.5 text-muted">
              <span className="text-ember">🔥</span>
              <span className="font-mono font-medium text-parchment">{streak}d</span>
            </div>
          </div>
        </div>

        {/* Navigation Menu */}
        <div>
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-muted">
            Sanctuary Realm
          </p>
          <nav className="space-y-1.5" aria-label="Main sections">
            {navItems.map((item) => {
              const isActive = activeTab === item.id
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveTab(item.id)}
                  className={`group flex w-full items-center justify-between rounded-xl px-3.5 py-3 text-left transition-all ${
                    isActive
                      ? 'border border-gold/40 bg-gradient-to-r from-gold/15 to-transparent text-parchment shadow-[0_0_15px_rgba(226,179,104,0.08)]'
                      : 'border border-transparent text-muted hover:border-[#2e261d] hover:bg-[#181410] hover:text-parchment'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-lg opacity-85 group-hover:scale-110 transition-transform">
                      {item.icon}
                    </span>
                    <div>
                      <p
                        className={`font-display text-xs font-bold tracking-wider ${
                          isActive ? 'text-gold' : 'text-parchment'
                        }`}
                      >
                        {item.label}
                      </p>
                      <p className="text-[10px] text-muted">{item.sub}</p>
                    </div>
                  </div>
                  <span
                    className={`text-xs transition-transform ${
                      isActive ? 'translate-x-0.5 text-gold' : 'text-muted-dark opacity-0 group-hover:opacity-100'
                    }`}
                  >
                    ›
                  </span>
                </button>
              )
            })}
          </nav>
        </div>
      </div>

      {/* Sidebar Footer Controls */}
      <div className="mt-8 space-y-3 pt-4 border-t border-[#262018]">
        {/* SFX and CRT Toggles */}
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={toggleSfx}
            className={`flex items-center justify-center gap-1.5 rounded-lg border px-2.5 py-1.5 font-mono text-[11px] font-semibold transition-colors ${
              sfxEnabled
                ? 'border-gold/30 bg-gold/10 text-gold'
                : 'border-[#2e261d] bg-[#14110e] text-muted'
            }`}
          >
            <span>{sfxEnabled ? '🔊' : '🔇'}</span>
            <span>SFX {sfxEnabled ? 'ON' : 'OFF'}</span>
          </button>
          <button
            type="button"
            onClick={toggleCrt}
            className={`flex items-center justify-center gap-1.5 rounded-lg border px-2.5 py-1.5 font-mono text-[11px] font-semibold transition-colors ${
              crtEnabled
                ? 'border-gold/30 bg-gold/10 text-gold'
                : 'border-[#2e261d] bg-[#14110e] text-muted'
            }`}
          >
            <span>📺</span>
            <span>CRT {crtEnabled ? 'ON' : 'OFF'}</span>
          </button>
        </div>

        {/* Rest at Bonfire Action Button */}
        <button
          type="button"
          onClick={restAtBonfire}
          disabled={resting}
          className={`flex w-full items-center justify-center gap-2 rounded-xl border border-ember/40 bg-gradient-to-r from-ember/20 via-[#2a140c] to-ember/20 px-3 py-2.5 font-display text-xs font-bold tracking-wider text-gold shadow-[0_0_20px_rgba(230,92,36,0.15)] transition-all hover:border-ember/70 hover:shadow-[0_0_25px_rgba(230,92,36,0.25)] active:scale-95 ${
            resting ? 'animate-pulse' : ''
          }`}
        >
          <span className="text-base animate-flame">🔥</span>
          <span>{resting ? 'COMMUNING WITH EMBERS...' : 'REST AT BONFIRE'}</span>
        </button>

        {/* User Status and Sign Out */}
        <div className="flex items-center justify-between pt-2 text-[11px] text-muted">
          <div className="flex items-center gap-1.5 truncate max-w-[150px]">
            <span className="h-1.5 w-1.5 rounded-full bg-moss" />
            <span className="truncate">{preview ? 'Guest Soul' : user?.email?.split('@')[0] ?? 'Ayush'}</span>
          </div>
          <button
            type="button"
            onClick={() => void signOut()}
            className="font-mono text-gold-deep hover:text-gold hover:underline"
          >
            LOGOUT [→
          </button>
        </div>
      </div>
    </aside>
  )
}
