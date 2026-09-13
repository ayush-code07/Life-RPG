import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useGameStore } from '../../store/gameStore'
import { BOSS_TIERS } from '../../lib/bosses'

export function BossArenaView() {
  const {
    boss,
    bossTier,
    bossVictoryReward,
    heroComboCharge,
    slashCharges,
    combatLog,
    shopItems,
    useSlashCharge,
    unleashLimitBreak,
    claimBossVictory,
    dismissBossVictory,
  } = useGameStore()

  const [floatingDamage, setFloatingDamage] = useState<{ id: number; damage: number; x: number } | null>(null)

  const maxHp = boss.maxHp || 400
  const currentHp = boss.currentHp ?? 240
  const hpPercent = Math.max(0, Math.min(100, Math.round((currentHp / maxHp) * 100)))
  const isEnraged = hpPercent <= 40 && hpPercent > 0
  const equippedWeapon = shopItems.find((i) => i.isEquipped && i.type === 'weapon')

  const triggerDamageNumber = (dmg: number) => {
    const randomX = Math.floor(Math.random() * 80) - 40
    setFloatingDamage({ id: Date.now(), damage: dmg, x: randomX })
    setTimeout(() => setFloatingDamage(null), 1200)
  }

  const handleHeroSlash = () => {
    if (slashCharges <= 0 || currentHp <= 0) return
    const baseDmg = 35 + (equippedWeapon ? 30 : 0)
    triggerDamageNumber(baseDmg)
    useSlashCharge()
  }

  const handleLimitBreak = () => {
    if (heroComboCharge < 100) return
    const limitDmg = Math.round(maxHp * 0.35)
    triggerDamageNumber(limitDmg)
    unleashLimitBreak()
  }

  const elementTheme = {
    void: { border: 'border-purple-500/60', text: 'text-purple-400', badge: 'bg-purple-950/70 border-purple-500/50 text-purple-300', glow: 'shadow-[0_0_40px_rgba(168,85,247,0.3)]' },
    fire: { border: 'border-ember/70', text: 'text-ember', badge: 'bg-red-950/70 border-red-500/50 text-red-300', glow: 'shadow-[0_0_40px_rgba(230,92,36,0.35)]' },
    astral: { border: 'border-cyan-500/70', text: 'text-cyan-400', badge: 'bg-cyan-950/70 border-cyan-500/50 text-cyan-300', glow: 'shadow-[0_0_40px_rgba(34,211,238,0.35)]' },
    gold: { border: 'border-gold/80', text: 'text-gold', badge: 'bg-amber-950/70 border-amber-500/50 text-amber-300', glow: 'shadow-[0_0_50px_rgba(245,158,11,0.4)]' },
  }[boss.element || 'void']

  return (
    <div className="space-y-6">
      {/* Top Arena Header */}
      <header className="flex flex-wrap items-center justify-between gap-4 border-b border-[#262018] pb-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="font-display text-2xl sm:text-3xl font-black tracking-wide text-parchment">
              ABYSS RAID ARENA
            </h2>
            <span className="rounded border border-red-500/40 bg-red-950/60 px-2 py-0.5 font-mono text-[10px] font-bold text-red-400 uppercase tracking-wider animate-pulse">
              LIVE WORLD BOSS
            </span>
          </div>
          <p className="mt-1 text-xs text-muted">
            Slay cosmic titans by completing real-world quests. Every victory claims royal bounties and unlocks higher tiers.
          </p>
        </div>

        {/* Boss Tier Progression Badges */}
        <div className="flex items-center gap-1.5 rounded-xl border border-[#2e261d] bg-[#120f0c] p-1.5 font-mono text-xs">
          {BOSS_TIERS.map((tier) => (
            <div
              key={tier.id}
              className={`rounded-lg px-2.5 py-1 text-[11px] font-bold transition-all ${
                tier.tier === bossTier
                  ? 'border border-gold/50 bg-gold/15 text-gold shadow-[0_0_10px_rgba(226,179,104,0.3)]'
                  : tier.tier < bossTier
                    ? 'border border-emerald-500/30 bg-emerald-950/30 text-emerald-400'
                    : 'text-muted border border-transparent opacity-40'
              }`}
            >
              T{tier.tier} {tier.tier === bossTier ? '⚡ LIVE' : tier.tier < bossTier ? '✓ SLAIN' : '🔒'}
            </div>
          ))}
        </div>
      </header>

      {/* Main Boss Encounter Display */}
      <div className={`relative overflow-hidden rounded-3xl border-2 ${elementTheme.border} bg-gradient-to-b from-[#181310] via-[#100c09] to-[#0a0806] p-6 sm:p-8 ${elementTheme.glow}`}>
        {/* Background Atmosphere Radial Glow */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(226,179,104,0.08)_0%,_transparent_70%)] pointer-events-none" />

        <div className="relative flex flex-col md:flex-row items-center gap-8 z-10">
          {/* Left: Giant Animated Boss Visage & Floating Damage Overlay */}
          <div className="relative flex flex-col items-center">
            <motion.div
              animate={{
                y: [0, -10, 0],
                scale: isEnraged ? [1, 1.05, 1] : [1, 1.02, 1],
              }}
              transition={{
                repeat: Infinity,
                duration: isEnraged ? 1.4 : 3,
                ease: 'easeInOut',
              }}
              className={`relative flex h-44 w-44 sm:h-52 sm:w-52 items-center justify-center rounded-3xl border-2 ${isEnraged ? 'border-red-500 shadow-[0_0_40px_rgba(239,68,68,0.5)]' : elementTheme.border} bg-[#0c0907] text-8xl shadow-2xl`}
            >
              <span>{boss.avatar}</span>

              {/* Floating Damage Numbers */}
              <AnimatePresence>
                {floatingDamage && (
                  <motion.div
                    key={floatingDamage.id}
                    initial={{ opacity: 1, y: 0, scale: 0.8, x: floatingDamage.x }}
                    animate={{ opacity: 0, y: -70, scale: 1.4 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 1, ease: 'easeOut' }}
                    className="absolute -top-6 font-display text-3xl font-black text-red-500 drop-shadow-[0_0_12px_rgba(239,68,68,0.9)] pointer-events-none z-30"
                  >
                    -{floatingDamage.damage} HP!
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Enrage Aura Icon */}
              {isEnraged && (
                <span className="absolute -top-3 -right-3 rounded-full border border-red-500 bg-red-950 px-2.5 py-0.5 font-mono text-[10px] font-black text-red-400 shadow-[0_0_15px_#ef4444] animate-pulse">
                  🔥 ENRAGED
                </span>
              )}
            </motion.div>

            <span className={`mt-3 rounded-full border px-3 py-0.5 font-mono text-[10px] font-bold uppercase tracking-widest ${elementTheme.badge}`}>
              TIER {boss.tier} • {boss.element.toUpperCase()} ELEMENT
            </span>
          </div>

          {/* Right: Boss Health, Threat Meter & Details */}
          <div className="flex-1 w-full space-y-4">
            <div>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className={`font-display text-2xl sm:text-3xl font-black tracking-wide ${elementTheme.text}`}>
                  {boss.name}
                </h3>
                <span className="font-mono text-xs font-bold text-gold">
                  Bounty: +{boss.bountyCoins} 🪙 / +{boss.bountyXp} XP
                </span>
              </div>
              <p className="font-display text-xs font-semibold text-muted uppercase tracking-wider">
                {boss.title}
              </p>
            </div>

            {/* Boss HP Bar */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between font-mono text-xs">
                <span className="font-bold text-parchment">BOSS VITALITY</span>
                <span className={isEnraged ? 'font-black text-red-400 animate-pulse' : 'text-parchment'}>
                  {currentHp} / {maxHp} HP ({hpPercent}%)
                </span>
              </div>
              <div className="relative h-5 w-full overflow-hidden rounded-full border-2 border-[#2e261d] bg-[#0c0a08] p-0.5">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    isEnraged
                      ? 'bg-gradient-to-r from-red-600 via-orange-500 to-red-500 shadow-[0_0_15px_#ef4444]'
                      : 'bg-gradient-to-r from-[#8b2500] via-[#e65c24] to-[#ffd175] shadow-[0_0_10px_rgba(230,92,36,0.6)]'
                  }`}
                  style={{ width: `${hpPercent}%` }}
                />
              </div>
            </div>

            {/* Boss Lore & Weakness */}
            <p className="text-xs text-muted leading-relaxed italic border-l-2 border-gold/30 pl-3">
              "{boss.lore}"
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-1 text-xs font-mono">
              <div className="rounded-xl border border-gold/20 bg-[#120e0a] px-3 py-1.5 text-muted">
                <span>🛡️ Weakness: </span>
                <strong className="text-parchment">{boss.weakness}</strong>
              </div>
              {equippedWeapon && (
                <div className="rounded-xl border border-blue-500/30 bg-blue-950/30 px-3 py-1.5 text-blue-300">
                  <span>⚔️ Equipped Gear: </span>
                  <strong>{equippedWeapon.name} (+30 Strike)</strong>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Hero Combat Actions & Instant Strike Hub */}
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-12 items-start">
        {/* Left 7 Cols: Combat Actions & Quest Attack List */}
        <div className="lg:col-span-7 space-y-4">
          {/* Work-Earned Hero Slash Arsenal Card */}
          <div className="rounded-2xl border border-gold/40 bg-gradient-to-br from-[#18130e] via-[#120e0a] to-[#0c0906] p-5 space-y-3.5 shadow-lg">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#262018] pb-2.5">
              <div className="flex items-center gap-2">
                <span className="text-base text-gold">⚔️</span>
                <h4 className="font-display text-xs font-bold text-parchment tracking-wider uppercase">
                  WORK-EARNED HERO SLASH
                </h4>
              </div>
              <div className="flex items-center gap-1.5">
                <span className={`rounded-lg px-2.5 py-0.5 font-mono text-xs font-black ${
                  slashCharges > 0
                    ? 'border border-gold/50 bg-gold/20 text-gold shadow-[0_0_10px_rgba(226,179,104,0.3)]'
                    : 'border border-[#2e261d] bg-[#120f0c] text-muted'
                }`}>
                  {slashCharges} {slashCharges === 1 ? 'CHARGE' : 'CHARGES'} READY
                </span>
              </div>
            </div>

            <p className="text-[11px] text-muted leading-relaxed">
              Slash charges are forged solely through your real-world discipline (<strong className="text-gold">1 charge per 50 XP earned</strong>). Complete active quests below or in your Sanctuary to arm your blade!
            </p>

            <button
              type="button"
              onClick={handleHeroSlash}
              disabled={slashCharges <= 0 || currentHp <= 0}
              className={`w-full flex items-center justify-center gap-2.5 rounded-xl border py-3.5 px-4 font-display text-xs font-black uppercase tracking-wider transition-all ${
                slashCharges > 0 && currentHp > 0
                  ? 'border-gold bg-gradient-to-r from-ember via-gold-bright to-gold text-black shadow-[0_0_20px_rgba(226,179,104,0.4)] hover:brightness-110 active:scale-95 cursor-pointer'
                  : 'border-[#262018] bg-[#0d0b09] text-muted opacity-50 cursor-not-allowed'
              }`}
            >
              <span>⚔️</span>
              {slashCharges > 0 && currentHp > 0
                ? `UNLEASH HERO SLASH (DEALS -${35 + (equippedWeapon ? 30 : 0)} HP) • [${slashCharges} AVAILABLE]`
                : '🔒 NO SLASH CHARGES (COMPLETE WORK/QUESTS TO EARN)'}
            </button>
          </div>

          {/* Hero Limit Break Gauge */}
          <div className="rounded-2xl border border-gold/30 bg-[#14110e] p-5 space-y-3">
            <div className="flex items-center justify-between font-mono text-xs">
              <div className="flex items-center gap-2">
                <span className="text-gold">⚡</span>
                <span className="font-display font-bold text-parchment tracking-wider uppercase">HERO COMBO LIMIT BREAK</span>
              </div>
              <span className="font-bold text-gold">{heroComboCharge}% / 100%</span>
            </div>

            <div className="h-3 w-full overflow-hidden rounded-full border border-[#2e261d] bg-[#0c0a08] p-0.5">
              <div
                className="h-full rounded-full bg-gradient-to-r from-amber-500 via-yellow-400 to-gold shadow-[0_0_12px_rgba(226,179,104,0.6)] transition-all duration-300"
                style={{ width: `${heroComboCharge}%` }}
              />
            </div>

            <button
              type="button"
              onClick={handleLimitBreak}
              disabled={heroComboCharge < 100 || currentHp <= 0}
              className={`w-full rounded-xl border py-3 px-4 font-display text-xs font-black uppercase tracking-wider transition-all ${
                heroComboCharge >= 100 && currentHp > 0
                  ? 'border-gold bg-gradient-to-r from-gold via-gold-bright to-gold text-black shadow-[0_0_20px_rgba(226,179,104,0.5)] hover:brightness-110 active:scale-95 animate-pulse cursor-pointer'
                  : 'border-[#262018] bg-[#0d0b09] text-muted opacity-40 cursor-not-allowed'
              }`}
            >
              ⚡ UNLEASH SOLAR ARCANE CLEAVE (DEALS 35% BOSS HP)
            </button>
          </div>
        </div>

        {/* Right 5 Cols: Live Combat Chronicle Log */}
        <div className="lg:col-span-5 rounded-2xl border border-[#2e261d] bg-[#120f0c] p-5 space-y-3">
          <div className="flex items-center justify-between border-b border-[#262018] pb-2.5">
            <h4 className="font-display text-xs font-bold text-parchment uppercase tracking-wider">
              📜 BATTLE CHRONICLE LOG
            </h4>
            <span className="font-mono text-[10px] text-muted">Real-time strikes</span>
          </div>

          <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
            {combatLog.map((log) => (
              <div
                key={log.id}
                className={`rounded-xl border p-2.5 text-xs font-mono transition-all ${
                  log.type === 'victory'
                    ? 'border-gold/50 bg-gold/15 text-gold font-bold shadow-[0_0_10px_rgba(226,179,104,0.2)]'
                    : log.type === 'limit_break'
                      ? 'border-cyan-500/50 bg-cyan-950/40 text-cyan-300 font-bold'
                      : 'border-[#221b14] bg-[#15110d] text-muted'
                }`}
              >
                <div className="flex items-center justify-between text-[10px] text-muted/70 mb-0.5">
                  <span>{log.type.toUpperCase()}</span>
                  <span>{log.timestamp}</span>
                </div>
                <p className="text-parchment leading-snug">{log.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* World Boss Victory Celebration Modal */}
      <AnimatePresence>
        {bossVictoryReward && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={dismissBossVictory}
              className="fixed inset-0 bg-black/85 backdrop-blur-md"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.85, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.85, y: 20 }}
              className="relative w-full max-w-md overflow-hidden rounded-3xl border-2 border-gold/80 bg-gradient-to-b from-[#241a0d] via-[#161008] to-[#0a0704] p-8 text-center shadow-[0_0_50px_rgba(226,179,104,0.4)] z-10 space-y-5"
            >
              <span className="rounded-full border border-gold/40 bg-gold/15 px-3 py-1 font-mono text-xs font-bold uppercase tracking-widest text-gold">
                👑 WORLD BOSS SLAIN!
              </span>

              <div className="text-7xl py-2">🏆</div>

              <div>
                <h3 className="font-display text-2xl font-black text-parchment uppercase">
                  {bossVictoryReward.boss.name} VANQUISHED
                </h3>
                <p className="mt-1 text-xs text-muted leading-relaxed">
                  Your relentless daily discipline dealt the final blow. The abyss reels and grants you ancient royal treasure!
                </p>
              </div>

              <div className="flex items-center justify-center gap-4 rounded-xl border border-gold/30 bg-[#0e0a06] p-3 font-mono text-sm">
                <div className="text-gold font-bold">+{bossVictoryReward.coins} Gold Coins</div>
                <div className="text-emerald-400 font-bold">+{bossVictoryReward.xp} Character XP</div>
              </div>

              <button
                type="button"
                onClick={claimBossVictory}
                className="w-full rounded-2xl border border-gold/60 bg-gradient-to-r from-gold via-gold-bright to-gold px-6 py-3.5 font-display text-sm font-black uppercase tracking-wider text-black shadow-[0_0_20px_rgba(226,179,104,0.4)] hover:brightness-110 active:scale-95 transition-all"
              >
                🏆 CLAIM BOUNTY & AWAKEN NEXT BOSS
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
