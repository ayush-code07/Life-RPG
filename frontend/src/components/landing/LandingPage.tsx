import { PixelHeroSprite } from '../character/PixelHeroSprite'
import { soundFx } from '../../lib/audio'

interface LandingPageProps {
  onOpenAuth: (mode: 'signin' | 'signup') => void
}

export function LandingPage({ onOpenAuth }: LandingPageProps) {
  const handleAuth = (mode: 'signin' | 'signup') => {
    soundFx.playClick()
    onOpenAuth(mode)
  }

  return (
    <div className="min-h-screen bg-[#0a0908] text-parchment selection:bg-gold/30 selection:text-gold-bright overflow-x-hidden">
      {/* Background ambient lighting */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-gradient-to-b from-ember/15 via-gold/5 to-transparent blur-3xl opacity-60" />
        <div className="absolute bottom-1/4 left-10 w-96 h-96 bg-purple-900/10 rounded-full blur-3xl" />
        <div className="absolute top-1/3 right-10 w-96 h-96 bg-ember/10 rounded-full blur-3xl" />
      </div>

      {/* Top Sticky Navigation Bar */}
      <header className="sticky top-0 z-40 border-b border-[#262018]/80 bg-[#0e0c0a]/90 backdrop-blur-md px-4 sm:px-8 py-3.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-gold/40 bg-[#1c1813] shadow-[0_0_15px_rgba(226,179,104,0.2)]">
              <span className="text-xl animate-flame">🔥</span>
            </div>
            <div>
              <span className="font-display text-base sm:text-lg font-bold tracking-wider text-gold-gradient">
                ASHEN PATH
              </span>
              <p className="text-[9px] tracking-[0.25em] uppercase text-muted">
                Chronicles of Ash
              </p>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-6 font-mono text-xs text-muted" aria-label="Landing page sections">
            <a href="#features" className="hover:text-parchment transition-colors">
              QUESTS
            </a>
            <a href="#boss-raids" className="hover:text-parchment transition-colors">
              BOSS RAIDS
            </a>
            <a href="#attributes" className="hover:text-parchment transition-colors">
              ATTRIBUTES
            </a>
            <a href="#bazaar" className="hover:text-parchment transition-colors">
              BAZAAR
            </a>
          </nav>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => handleAuth('signin')}
              className="rounded-xl border border-[#2e261d] bg-[#14110e] px-4 py-2 font-display text-xs font-bold text-parchment hover:border-gold/40 hover:text-gold active:scale-95 transition-all"
            >
              SIGN IN
            </button>
            <button
              type="button"
              onClick={() => handleAuth('signup')}
              className="rounded-xl border border-gold/50 bg-gradient-to-r from-gold to-gold-bright px-4 py-2 font-display text-xs font-bold text-[#0a0908] shadow-[0_0_20px_rgba(226,179,104,0.3)] hover:brightness-110 active:scale-95 transition-all"
            >
              START QUEST
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 px-4 sm:px-6 lg:px-8 pt-16 pb-20 max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-12">
        <div className="flex-1 text-center lg:text-left space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/10 px-4 py-1.5 text-xs font-mono text-gold shadow-sm">
            <span className="animate-flame">🔥</span>
            <span>GAMIFIED REAL-WORLD PRODUCTIVITY ENGINE</span>
          </div>

          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.1] text-parchment">
            Turn Real-World Habits Into <span className="text-gold-gradient">Legendary RPG Conquests</span>
          </h1>

          <p className="text-sm sm:text-base text-muted max-w-2xl leading-relaxed mx-auto lg:mx-0">
            Conquer your daily workout routines, deep study sprints, and coding habits. Earn XP, gain character stat mastery across 6 attributes, unlock live pixel gear, and slay multi-tier Abyss World Bosses with your real-life completed work.
          </p>

          <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-2">
            <button
              type="button"
              onClick={() => handleAuth('signup')}
              className="flex items-center gap-2.5 rounded-2xl border border-gold bg-gradient-to-r from-gold via-gold-bright to-gold px-7 py-4 font-display text-sm font-bold uppercase tracking-wider text-[#0a0908] shadow-[0_0_30px_rgba(226,179,104,0.35)] hover:scale-105 active:scale-95 transition-all"
            >
              <span>⚔️ BEGIN YOUR HERO JOURNEY</span>
              <span>→</span>
            </button>

            <button
              type="button"
              onClick={() => handleAuth('signin')}
              className="rounded-2xl border border-[#382d20] bg-[#14110e]/90 px-6 py-4 font-display text-sm font-bold uppercase tracking-wider text-parchment hover:border-gold/50 hover:bg-[#1a1410] active:scale-95 transition-all"
            >
              ENTER GUILD (LOGIN)
            </button>
          </div>

          <div className="pt-4 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-xs text-muted font-mono">
            <div className="flex items-center gap-2">
              <span className="text-moss">✓</span>
              <span>1 Slash per 50 XP (Work-to-Earn)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-moss">✓</span>
              <span>Atomic PostgreSQL Progression</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-moss">✓</span>
              <span>Flame Streak Bonuses</span>
            </div>
          </div>
        </div>

        {/* Live Interactive Hero Showcase Visual Card */}
        <div className="flex-1 w-full max-w-md">
          <div className="relative rounded-3xl border border-gold/30 bg-gradient-to-b from-[#1c1611] via-[#14100c] to-[#0d0a08] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.6)]">
            {/* Top Showcase Banner */}
            <div className="flex items-center justify-between border-b border-[#262018] pb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl border-2 border-purple-500/40 bg-gradient-to-b from-purple-950/60 to-purple-900/20 shadow-[0_0_20px_rgba(168,85,247,0.2)]">
                  <PixelHeroSprite size={56} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-moss shadow-[0_0_8px_#48bb78]" />
                    <h3 className="font-display text-sm font-bold text-parchment">ASHEN HERO</h3>
                  </div>
                  <p className="font-mono text-xs text-gold font-bold">Level 12 • Soulbearer</p>
                  <p className="font-mono text-[10px] text-muted">Crown of Sovereignty + Sunfire Blade</p>
                </div>
              </div>
              <div className="text-right">
                <span className="rounded border border-ember/30 bg-ember/10 px-2 py-0.5 font-mono text-xs font-bold text-ember">
                  🔥 8d Streak
                </span>
                <p className="mt-1 font-mono text-xs text-gold">🪙 25 Coins</p>
              </div>
            </div>

            {/* Simulated Live Quests on Hero Card */}
            <div className="mt-5 space-y-2.5">
              <p className="font-mono text-[10px] uppercase tracking-wider text-muted">ACTIVE REALM TRIALS</p>
              
              <div className="flex items-center justify-between rounded-xl border border-[#2e261d] bg-[#0f0d0a] p-3">
                <div className="flex items-center gap-2.5">
                  <span className="text-lg">🏋️</span>
                  <div>
                    <p className="font-display text-xs font-bold text-parchment">Heavy Squats & Core Sprint</p>
                    <p className="font-mono text-[10px] text-amber-300">+60 XP • +30 Strength • 1 Coin</p>
                  </div>
                </div>
                <span className="rounded-lg border border-moss/40 bg-moss/10 px-2 py-1 font-mono text-[10px] font-bold text-moss">
                  ✓ READY
                </span>
              </div>

              <div className="flex items-center justify-between rounded-xl border border-[#2e261d] bg-[#0f0d0a] p-3">
                <div className="flex items-center gap-2.5">
                  <span className="text-lg">💻</span>
                  <div>
                    <p className="font-display text-xs font-bold text-parchment">Ship Next Feature Module</p>
                    <p className="font-mono text-[10px] text-blue-300">+100 XP • +50 Intellect • 2 Coins</p>
                  </div>
                </div>
                <span className="rounded-lg border border-gold/40 bg-gold/10 px-2 py-1 font-mono text-[10px] font-bold text-gold">
                  ⚡ 2 Slashes
                </span>
              </div>
            </div>

            {/* Boss Raid Target Preview */}
            <div className="mt-5 rounded-2xl border border-red-900/50 bg-gradient-to-r from-red-950/30 to-[#120a0a] p-3.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-display font-bold text-red-300">👹 CORRUPTED BEHEMOTH</span>
                <span className="font-mono font-bold text-red-400">240 / 400 HP</span>
              </div>
              <div className="mt-2 h-2 w-full rounded-full bg-[#1c0d0d] overflow-hidden">
                <div className="h-full bg-gradient-to-r from-red-600 to-amber-500 rounded-full" style={{ width: '60%' }} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Pillars Grid Section */}
      <section id="features" className="relative z-10 px-4 sm:px-6 lg:px-8 py-20 bg-[#0d0b09]/80 border-t border-[#262018]">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <span className="font-mono text-xs uppercase tracking-widest text-gold">CORE GAMEPLAY MECHANICS</span>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-parchment">
              How Ashen Path Transforms Your Daily Habits
            </h2>
            <p className="text-sm text-muted">
              Built on battle-tested gamification principles and atomic RPG systems.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {/* Feature 1 */}
            <div className="rounded-2xl border border-[#2e261d] bg-[#14110e] p-6 space-y-4 hover:border-gold/40 transition-colors">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-gold/30 bg-gold/10 text-2xl">
                📜
              </div>
              <h3 className="font-display text-lg font-bold text-parchment">Notice Board Quests</h3>
              <p className="text-xs text-muted leading-relaxed">
                Inscribe daily tasks with multi-tag categorization (Work, Gym, Study, Chores, Others) and daily recurring reminders.
              </p>
            </div>

            {/* Feature 2 */}
            <div id="boss-raids" className="rounded-2xl border border-[#2e261d] bg-[#14110e] p-6 space-y-4 hover:border-red-500/40 transition-colors">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-red-500/30 bg-red-950/40 text-2xl">
                👹
              </div>
              <h3 className="font-display text-lg font-bold text-parchment">Abyss World Bosses</h3>
              <p className="text-xs text-muted leading-relaxed">
                Slashes are earned only from real completed work (1 slash per 50 XP). Strike down 4 multi-tier bosses for gold and fame.
              </p>
            </div>

            {/* Feature 3 */}
            <div id="attributes" className="rounded-2xl border border-[#2e261d] bg-[#14110e] p-6 space-y-4 hover:border-blue-500/40 transition-colors">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-blue-500/30 bg-blue-950/40 text-2xl">
                ⚔️
              </div>
              <h3 className="font-display text-lg font-bold text-parchment">6 Core Attributes</h3>
              <p className="text-xs text-muted leading-relaxed">
                Level up Strength, Intellect, Discipline, Agility, Vitality, and Charisma dynamically with specialized trial completions.
              </p>
            </div>

            {/* Feature 4 */}
            <div id="bazaar" className="rounded-2xl border border-[#2e261d] bg-[#14110e] p-6 space-y-4 hover:border-amber-500/40 transition-colors">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-amber-500/30 bg-amber-950/40 text-2xl">
                🪙
              </div>
              <h3 className="font-display text-lg font-bold text-parchment">Bazaar & Armory</h3>
              <p className="text-xs text-muted leading-relaxed">
                Spend earned coins on 1-week, 1-month, and legendary 1-year gear that attaches live onto your hero pixel character.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Bottom CTA Banner */}
      <section className="relative z-10 px-4 sm:px-6 lg:px-8 py-20 max-w-5xl mx-auto text-center space-y-6">
        <div className="rounded-3xl border border-gold/40 bg-gradient-to-r from-gold/15 via-[#1a140e] to-gold/15 p-8 sm:p-12 shadow-[0_0_50px_rgba(226,179,104,0.15)] space-y-6">
          <span className="text-4xl animate-bounce inline-block">👑</span>
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-parchment">
            Inscribe Your Soul into the Chronicles of Ash
          </h2>
          <p className="text-sm text-muted max-w-xl mx-auto">
            Create your account now, choose your daily quests, and begin leveling up your real-life stats today.
          </p>
          <div className="pt-2">
            <button
              type="button"
              onClick={() => handleAuth('signup')}
              className="rounded-2xl border border-gold bg-gold px-8 py-4 font-display text-sm font-bold uppercase tracking-wider text-[#0a0908] shadow-[0_0_25px_rgba(226,179,104,0.4)] hover:scale-105 active:scale-95 transition-all"
            >
              CREATE YOUR HERO ACCOUNT
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#262018] bg-[#070605] py-8 text-center text-xs text-muted font-mono space-y-1.5">
        <div className="flex items-center justify-center gap-2">
          <span>🔥</span>
          <span className="text-parchment font-bold">ASHEN PATH</span>
          <span>•</span>
          <span>CHRONICLES OF ASH</span>
        </div>
        <p className="text-parchment/90 font-medium">
          Ayush Jagnani • Made with coffee and love ☕❤️
        </p>
        <p className="text-[10px] text-muted/70">
          © 2026 Ashen Path. Turn your commitments into legendary conquests.
        </p>
      </footer>
    </div>
  )
}
