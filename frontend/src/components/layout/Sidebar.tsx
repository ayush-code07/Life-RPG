import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuthStore } from '../../store/authStore'
import { useGameStore } from '../../store/gameStore'
import type { ActiveTab } from '../../types/rpg'

export function Sidebar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const signOut = useAuthStore((state) => state.signOut)
  const user = useAuthStore((state) => state.user)
  const preview = useAuthStore((state) => state.preview)
  const {
    profile,
    activeTab,
    sfxEnabled,
    crtEnabled,
    resting,
    coins,
    setActiveTab,
    toggleSfx,
    toggleCrt,
    restAtBonfire,
  } = useGameStore()

  const level = profile?.current_level ?? 1
  const streak = profile?.current_streak ?? 0

  const navItems: Array<{ id: ActiveTab; label: string; sub: string; icon: string }> = [
    {
      id: 'sanctuary',
      label: 'SANCTUARY',
      sub: 'Quests & Daily Trial',
      icon: '🛡️',
    },
    {
      id: 'boss_raid',
      label: 'ABYSS RAID',
      sub: 'World Boss Battle',
      icon: '💀',
    },
    {
      id: 'attributes',
      label: 'ATTRIBUTES',
      sub: 'Stats & Mastery',
      icon: '⚔️',
    },
    {
      id: 'rewards',
      label: 'REWARDS',
      sub: 'Bazaar & Wearables',
      icon: '🪙',
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
      sub: 'Rules, Feats & System',
      icon: '📜',
    },
  ]

  // Close mobile drawer on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && mobileMenuOpen) {
        setMobileMenuOpen(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [mobileMenuOpen])

  const handleNavSelect = (id: ActiveTab) => {
    setActiveTab(id)
    setMobileMenuOpen(false)
  }

  return (
    <>
      {/* ========================================================================= */}
      {/* 1. Mobile Top Header (Screens < lg)                                       */}
      {/* ========================================================================= */}
      <header className="lg:hidden flex items-center justify-between border-b border-[#262018] bg-[#0e0c0a]/95 px-4 py-3 shrink-0 z-40">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-gold/30 bg-panel-raised shadow-xs">
            <span className="text-base">🔥</span>
          </div>
          <div>
            <h1 className="font-display text-sm font-bold tracking-wider text-gold-gradient">
              ASHEN PATH
            </h1>
            <p className="text-[9px] tracking-[0.2em] uppercase text-muted">
              Lv. {level} Soulbearer
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 rounded-lg border border-gold/20 bg-[#14100c] px-2 py-1 font-mono text-xs font-bold text-gold">
            <span>🪙</span>
            <span>{coins}</span>
          </div>

          <button
            type="button"
            onClick={() => setMobileMenuOpen(true)}
            aria-label="Open sanctuary realm menu"
            aria-expanded={mobileMenuOpen}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#2e261d] bg-[#14100c] text-parchment hover:border-gold/40 active:scale-95 transition-all"
          >
            <span className="text-lg">☰</span>
          </button>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* 2. Mobile Drawer Navigation Overlay (Screens < lg)                         */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <div className="lg:hidden fixed inset-0 z-50 flex">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-xs"
              aria-hidden="true"
            />

            {/* Slide-in Drawer */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              role="dialog"
              aria-modal="true"
              aria-label="Mobile Navigation Menu"
              className="relative flex flex-col justify-between w-80 max-w-[85vw] h-full bg-[#0e0c0a] border-r border-[#262018] p-4 sm:p-5 shadow-2xl z-10 overflow-hidden"
            >
              {/* 1. TOP FIXED DRAWER SECTION */}
              <div className="shrink-0 space-y-4 pb-3">
                {/* Drawer Header with Close Button */}
                <div className="flex items-center justify-between border-b border-[#262018] pb-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-gold/30 bg-panel-raised">
                      <span className="text-lg">🔥</span>
                    </div>
                    <div>
                      <h2 className="font-display text-base font-bold text-gold-gradient">
                        ASHEN PATH
                      </h2>
                      <p className="text-[9px] tracking-[0.2em] uppercase text-muted">
                        Chronicles of Ash
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setMobileMenuOpen(false)}
                    aria-label="Close menu"
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#2e261d] text-muted hover:text-parchment active:scale-95"
                  >
                    ✕
                  </button>
                </div>

                {/* Hero Status Box */}
                <div className="rounded-xl border border-[#2e261d] bg-[#14110e] p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-gold shadow-[0_0_8px_#ffd175]" />
                      <span className="font-display text-xs font-semibold uppercase tracking-wider text-parchment">
                        {profile?.username ? profile.username.toUpperCase() : 'ASHEN HERO'}
                      </span>
                    </div>
                    <span className="rounded border border-gold/20 bg-gold/10 px-2 py-0.5 font-mono text-[11px] font-bold text-gold">
                      Lv. {level}
                    </span>
                  </div>
                  {profile?.active_badge && (
                    <p className="mt-1 font-mono text-[10px] text-gold/90 truncate">
                      {profile.active_badge}
                    </p>
                  )}
                  <div className="mt-2.5 flex items-center justify-between border-t border-[#262018] pt-2 text-xs">
                    <div className="flex items-center gap-1.5 text-muted">
                      <span className="text-gold">🪙</span>
                      <span className="font-mono font-medium text-parchment">{coins}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-muted">
                      <span className="text-ember">🔥</span>
                      <span className="font-mono font-medium text-parchment">{streak}d</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 2. MIDDLE SCROLLABLE DRAWER SECTION: Sanctuary Realm Nav Links */}
              <div className="flex-1 min-h-0 overflow-y-auto pr-1 my-1 realm-scrollbar">
                <p className="sticky top-0 z-10 bg-[#0e0c0a] py-1 mb-1.5 text-[10px] font-semibold uppercase tracking-[0.22em] text-muted">
                  Sanctuary Realm
                </p>
                <nav className="space-y-1" aria-label="Mobile main sections">
                  {navItems.map((item) => {
                    const isActive = activeTab === item.id
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => handleNavSelect(item.id)}
                        aria-current={isActive ? 'page' : undefined}
                        className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left transition-all ${
                          isActive
                            ? 'border border-gold/40 bg-gold/15 text-parchment shadow-sm'
                            : 'border border-transparent text-muted hover:bg-[#181410] hover:text-parchment'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="text-base">{item.icon}</span>
                          <div>
                            <p className={`font-display text-xs font-bold ${isActive ? 'text-gold' : 'text-parchment'}`}>
                              {item.label}
                            </p>
                            <p className="text-[10px] text-muted">{item.sub}</p>
                          </div>
                        </div>
                        <span className="text-xs text-gold">›</span>
                      </button>
                    )
                  })}
                </nav>
              </div>

              {/* 3. BOTTOM FIXED DRAWER CONTROLS & LOGOUT */}
              <div className="shrink-0 space-y-2.5 pt-3 border-t border-[#262018]">
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={toggleSfx}
                    className={`flex items-center justify-center gap-1.5 rounded-lg border px-2 py-1.5 font-mono text-[11px] font-semibold ${
                      sfxEnabled ? 'border-gold/30 bg-gold/10 text-gold' : 'border-[#2e261d] bg-[#14110e] text-muted'
                    }`}
                  >
                    <span>{sfxEnabled ? '🔊' : '🔇'}</span>
                    <span>SFX {sfxEnabled ? 'ON' : 'OFF'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={toggleCrt}
                    className={`flex items-center justify-center gap-1.5 rounded-lg border px-2 py-1.5 font-mono text-[11px] font-semibold ${
                      crtEnabled ? 'border-gold/30 bg-gold/10 text-gold' : 'border-[#2e261d] bg-[#14110e] text-muted'
                    }`}
                  >
                    <span>📺</span>
                    <span>CRT {crtEnabled ? 'ON' : 'OFF'}</span>
                  </button>
                </div>

                <button
                  type="button"
                  onClick={restAtBonfire}
                  disabled={resting}
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-ember/40 bg-gradient-to-r from-ember/20 via-[#2a140c] to-ember/20 px-3 py-2 font-display text-xs font-bold text-gold"
                >
                  <span className="animate-flame">🔥</span>
                  <span>{resting ? 'COMMUNING...' : 'REST AT BONFIRE'}</span>
                </button>

                <div className="flex items-center justify-between pt-1 text-[11px] text-muted">
                  <span className="truncate max-w-[150px]">{preview ? 'Guest Soul' : user?.email?.split('@')[0] ?? 'Ayush'}</span>
                  <button
                    type="button"
                    onClick={() => void signOut()}
                    className="font-mono font-semibold text-gold-deep hover:text-gold"
                  >
                    LOGOUT [→
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================================================= */}
      {/* 3. Desktop Permanent Sidebar (Screens >= lg)                               */}
      {/* ========================================================================= */}
      <aside
        aria-label="Desktop Sidebar Navigation"
        className="hidden lg:flex flex-col justify-between border-r border-[#262018] bg-[#0e0c0a]/95 p-4 sm:p-5 h-full lg:w-72 xl:w-80 shrink-0 z-30 overflow-hidden"
      >
        {/* 1. TOP FIXED SECTION: Brand & Character Card */}
        <div className="shrink-0 space-y-4 pb-3">
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
                  {profile?.username ? profile.username.toUpperCase() : 'ASHEN HERO'}
                </span>
              </div>
              <span className="rounded border border-gold/20 bg-gold/10 px-2 py-0.5 font-mono text-[11px] font-bold text-gold">
                Lv. {level}
              </span>
            </div>

            {profile?.active_badge && (
              <div className="mt-1.5 truncate">
                <span className="font-mono text-[10px] text-gold/90 font-medium">
                  {profile.active_badge}
                </span>
              </div>
            )}

            <div className="mt-3 flex items-center justify-between border-t border-[#262018] pt-2 text-xs">
              <div className="flex items-center gap-1.5 text-muted">
                <span className="text-gold">🪙</span>
                <span className="font-mono font-medium text-parchment">{coins}</span>
              </div>
              <div className="flex items-center gap-1.5 text-muted">
                <span className="text-ember">🔥</span>
                <span className="font-mono font-medium text-parchment">{streak}d</span>
              </div>
            </div>
          </div>
        </div>

        {/* 2. MIDDLE SCROLLABLE SECTION: Sanctuary Realm Nav Items */}
        <div className="flex-1 min-h-0 overflow-y-auto pr-1 my-1 realm-scrollbar">
          <p className="sticky top-0 z-10 bg-[#0e0c0a]/95 py-1 mb-1.5 text-[10px] font-semibold uppercase tracking-[0.22em] text-muted">
            Sanctuary Realm
          </p>
          <nav className="space-y-1.5" aria-label="Desktop main sections">
            {navItems.map((item) => {
              const isActive = activeTab === item.id
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveTab(item.id)}
                  aria-current={isActive ? 'page' : undefined}
                  className={`group flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 text-left transition-all ${
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

        {/* 3. BOTTOM FIXED SECTION: SFX/CRT toggles, Bonfire, Profile & Sign Out */}
        <div className="shrink-0 space-y-2.5 pt-3 border-t border-[#262018]">
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
          <div className="flex items-center justify-between pt-1.5 text-[11px] text-muted">
            <div className="flex items-center gap-1.5 truncate max-w-[150px]">
              <span className="h-1.5 w-1.5 rounded-full bg-moss" />
              <span className="truncate">{preview ? 'Guest Soul' : user?.email?.split('@')[0] ?? 'Ayush'}</span>
            </div>
            <button
              type="button"
              onClick={() => void signOut()}
              className="font-mono font-semibold text-gold-deep hover:text-gold hover:underline"
            >
              LOGOUT [→
            </button>
          </div>
        </div>
      </aside>

      {/* ========================================================================= */}
      {/* 4. Mobile Bottom Quick Nav Bar (Screens < lg)                              */}
      {/* ========================================================================= */}
      <nav
        aria-label="Mobile quick tab bar"
        className="lg:hidden fixed bottom-0 left-0 right-0 z-40 flex items-center justify-around border-t border-[#262018] bg-[#0c0a08]/95 px-2 py-2 backdrop-blur-md"
      >
        {navItems.map((item) => {
          const isActive = activeTab === item.id
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setActiveTab(item.id)}
              aria-current={isActive ? 'page' : undefined}
              className={`flex flex-col items-center justify-center rounded-xl p-1.5 min-w-[50px] transition-all ${
                isActive
                  ? 'border border-gold/40 bg-gold/15 text-gold shadow-xs'
                  : 'text-muted hover:text-parchment'
              }`}
            >
              <span className="text-base leading-none">{item.icon}</span>
              <span className="font-mono text-[9px] font-bold mt-1 tracking-tight truncate max-w-[56px]">
                {item.label}
              </span>
            </button>
          )
        })}
      </nav>
    </>
  )
}
