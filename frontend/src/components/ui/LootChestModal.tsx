import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { soundFx } from '../../lib/audio'
import type { LootReward } from '../../lib/lootDrops'

interface LootChestModalProps {
  loot: LootReward | null
  isOpen: boolean
  onClose: () => void
  onClaim: (loot: LootReward) => void
}

const RARITY_COLORS: Record<string, { border: string; glow: string; text: string; badge: string; bg: string }> = {
  common: {
    border: 'border-[#4a3f35]',
    glow: 'shadow-[0_0_20px_rgba(200,180,150,0.2)]',
    text: 'text-parchment',
    badge: 'border-[#4a3f35] bg-[#1a140f] text-gray-300',
    bg: 'from-[#1a1511] to-[#0d0a08]',
  },
  rare: {
    border: 'border-blue-500/60',
    glow: 'shadow-[0_0_35px_rgba(59,130,246,0.35)]',
    text: 'text-blue-300',
    badge: 'border-blue-500/50 bg-blue-950/70 text-blue-300',
    bg: 'from-[#11192b] to-[#090d17]',
  },
  epic: {
    border: 'border-purple-500/70',
    glow: 'shadow-[0_0_40px_rgba(168,85,247,0.4)]',
    text: 'text-purple-300',
    badge: 'border-purple-500/50 bg-purple-950/70 text-purple-300',
    bg: 'from-[#1e112d] to-[#0e0717]',
  },
  legendary: {
    border: 'border-amber-500/80',
    glow: 'shadow-[0_0_50px_rgba(245,158,11,0.5)]',
    text: 'text-amber-300',
    badge: 'border-amber-500/60 bg-amber-950/80 text-amber-300',
    bg: 'from-[#2a1708] via-[#1c1005] to-[#0e0802]',
  },
}

export function LootChestModal({ loot, isOpen, onClose, onClaim }: LootChestModalProps) {
  const [opened, setOpened] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setOpened(false)
      soundFx.playChestOpen()
    }
  }, [isOpen])

  if (!loot) return null

  const rarity = RARITY_COLORS[loot.rarity] || RARITY_COLORS.common

  const handleOpen = () => {
    soundFx.playPurchaseSound()
    setOpened(true)
  }

  const handleClaim = () => {
    soundFx.playCoinSound()
    onClaim(loot)
    onClose()
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop Blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/85 backdrop-blur-md"
          />

          {/* Dialog Card */}
          <motion.div
            role="dialog"
            aria-modal="true"
            initial={{ opacity: 0, scale: 0.85, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.85, y: 20 }}
            transition={{ type: 'spring', damping: 22, stiffness: 320 }}
            className={`relative w-full max-w-md overflow-hidden rounded-3xl border-2 ${rarity.border} bg-gradient-to-b ${rarity.bg} p-6 sm:p-8 text-center ${rarity.glow} z-10`}
          >
            {/* Ambient Beams of Light behind chest */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(226,179,104,0.15)_0%,_transparent_70%)] pointer-events-none" />

            {!opened ? (
              /* State 1: Locked Mystery Chest */
              <div className="relative space-y-5">
                <span className="rounded-full border border-gold/40 bg-gold/15 px-3 py-1 font-mono text-[11px] font-bold uppercase tracking-widest text-gold shadow-sm">
                  🎁 MYSTERY LOOT DISCOVERED!
                </span>

                <motion.div
                  animate={{
                    y: [0, -8, 0],
                    rotate: [-1, 1, -1],
                  }}
                  transition={{
                    repeat: Infinity,
                    duration: 2.2,
                    ease: 'easeInOut',
                  }}
                  className="py-4"
                >
                  <div className="mx-auto flex h-28 w-28 items-center justify-center rounded-2xl border-2 border-gold/50 bg-[#14100c] text-6xl shadow-[0_0_30px_rgba(226,179,104,0.3)]">
                    📦
                  </div>
                </motion.div>

                <div>
                  <h3 className="font-display text-xl font-black tracking-wide text-parchment uppercase">
                    ANCIENT RELIC CHEST
                  </h3>
                  <p className="mt-1 text-xs text-muted">
                    Your heroic victory unearthed an ancient treasure cache. Crack the seal to reveal its contents!
                  </p>
                </div>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={handleOpen}
                    className="w-full rounded-2xl border border-gold/60 bg-gradient-to-r from-gold via-gold-bright to-gold px-6 py-3.5 font-display text-sm font-black uppercase tracking-wider text-[#0a0908] shadow-[0_0_25px_rgba(226,179,104,0.4)] hover:brightness-110 active:scale-95 transition-all"
                  >
                    ✨ UNSEAL TREASURE CHEST ✨
                  </button>
                </div>
              </div>
            ) : (
              /* State 2: Loot Revealed */
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative space-y-4"
              >
                <div className="flex items-center justify-center gap-2">
                  <span
                    className={`rounded-full border px-3 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider ${rarity.badge}`}
                  >
                    {loot.rarity} LOOT
                  </span>
                </div>

                {/* Animated Loot Icon */}
                <motion.div
                  initial={{ scale: 0, rotate: -20 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: 'spring', damping: 15 }}
                  className="py-2"
                >
                  <div className="mx-auto flex h-28 w-28 items-center justify-center rounded-2xl border-2 border-gold/50 bg-[#120f0c] text-6xl shadow-[0_0_35px_rgba(226,179,104,0.35)]">
                    {loot.icon}
                  </div>
                </motion.div>

                <div>
                  <h3 className={`font-display text-2xl font-black tracking-wide ${rarity.text}`}>
                    {loot.name}
                  </h3>
                  <p className="mt-1 text-xs text-muted max-w-xs mx-auto leading-relaxed">
                    {loot.description}
                  </p>
                </div>

                {/* Reward Bonuses Pill */}
                <div className="rounded-xl border border-[#2e261d] bg-[#0c0a08] p-3 flex flex-wrap items-center justify-center gap-3">
                  {loot.rewardCoins && (
                    <div className="flex items-center gap-1.5 font-mono text-xs font-bold text-gold">
                      <span>🪙</span>
                      <span>+{loot.rewardCoins} Gold Coins</span>
                    </div>
                  )}
                  {loot.rewardXP && (
                    <div className="flex items-center gap-1.5 font-mono text-xs font-bold text-emerald-400">
                      <span>⚡</span>
                      <span>+{loot.rewardXP} Bonus XP</span>
                    </div>
                  )}
                  {loot.rewardAttribute && (
                    <div className="flex items-center gap-1.5 font-mono text-xs font-bold text-blue-300">
                      <span>📈</span>
                      <span>+{loot.rewardAttribute.xp} {loot.rewardAttribute.name} XP</span>
                    </div>
                  )}
                </div>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={handleClaim}
                    className="w-full rounded-2xl border border-gold/60 bg-gradient-to-r from-gold via-gold-bright to-gold px-6 py-3.5 font-display text-sm font-black uppercase tracking-wider text-[#0a0908] shadow-[0_0_25px_rgba(226,179,104,0.4)] hover:brightness-110 active:scale-95 transition-all"
                  >
                    🏆 CLAIM TO TREASURY
                  </button>
                </div>
              </motion.div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
