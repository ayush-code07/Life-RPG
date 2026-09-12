import { useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useGameStore } from '../../store/gameStore'
import { PixelHeroSprite } from '../character/PixelHeroSprite'

export function CelebrationModal() {
  const { celebration, dismissCelebration } = useGameStore()
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  // Canvas confetti & gold sparkle explosion
  useEffect(() => {
    if (!celebration) return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animationFrameId: number
    const width = (canvas.width = window.innerWidth)
    const height = (canvas.height = window.innerHeight)

    const colors = ['#fbbf24', '#f59e0b', '#ef4444', '#38bdf8', '#34d399', '#ffffff', '#ffd175']
    const particles = Array.from({ length: 90 }, () => ({
      x: width / 2 + (Math.random() * 100 - 50),
      y: height / 2 + (Math.random() * 60 - 30),
      vx: (Math.random() - 0.5) * 14,
      vy: (Math.random() - 0.7) * 16,
      size: Math.random() * 5 + 3,
      alpha: 1,
      decay: Math.random() * 0.015 + 0.008,
      rotation: Math.random() * 360,
      vRot: (Math.random() - 0.5) * 10,
      color: colors[Math.floor(Math.random() * colors.length)],
      isStar: Math.random() > 0.5,
    }))

    const render = () => {
      ctx.clearRect(0, 0, width, height)

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i]
        p.x += p.vx
        p.y += p.vy
        p.vy += 0.35 // gravity
        p.vx *= 0.98
        p.rotation += p.vRot
        p.alpha -= p.decay

        if (p.alpha <= 0 || p.y > height) {
          particles.splice(i, 1)
          continue
        }

        ctx.save()
        ctx.globalAlpha = Math.max(0, p.alpha)
        ctx.fillStyle = p.color
        ctx.shadowColor = p.color
        ctx.shadowBlur = 10
        ctx.translate(p.x, p.y)
        ctx.rotate((p.rotation * Math.PI) / 180)

        if (p.isStar) {
          ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size)
        } else {
          ctx.beginPath()
          ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2)
          ctx.fill()
        }
        ctx.restore()
      }

      if (particles.length > 0) {
        animationFrameId = requestAnimationFrame(render)
      }
    }

    render()

    return () => {
      cancelAnimationFrame(animationFrameId)
    }
  }, [celebration])

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && celebration) {
        dismissCelebration()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [celebration, dismissCelebration])

  if (!celebration) return null

  const isLevelUp = celebration.type === 'LEVEL_UP'
  const isItem = celebration.type === 'ITEM_PURCHASED'

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
        {/* Fullscreen Canvas Confetti */}
        <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none z-10" />

        {/* Modal Window */}
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-labelledby="celebration-heading"
          initial={{ opacity: 0, scale: 0.8, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.85, y: -20 }}
          transition={{ type: 'spring', damping: 20, stiffness: 280 }}
          className="relative z-20 w-full max-w-md overflow-hidden rounded-3xl border-2 border-gold/60 bg-gradient-to-b from-[#1c140d] via-[#140f0a] to-[#0d0a07] p-6 text-center shadow-[0_0_60px_rgba(226,179,104,0.35)]"
        >
          {/* Radiant Radial Background Glow */}
          <div className="absolute -top-24 left-1/2 -translate-x-1/2 h-64 w-64 rounded-full bg-gold/15 blur-3xl pointer-events-none" />

          {/* ================= LEVEL UP CELEBRATION ================= */}
          {isLevelUp && (
            <div className="space-y-5">
              {/* Header Title & Stars */}
              <div className="space-y-1">
                <div className="flex items-center justify-center gap-2 text-2xl animate-bounce">
                  <span>✨</span>
                  <span className="font-display text-xs font-bold tracking-[0.3em] uppercase text-gold">
                    SACRED ASCENSION
                  </span>
                  <span>✨</span>
                </div>
                <h3 id="celebration-heading" className="font-display text-3xl sm:text-4xl font-black tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-gold-bright to-amber-400 drop-shadow-[0_2px_10px_rgba(251,191,36,0.5)]">
                  LEVEL UP!
                </h3>
                <p className="font-mono text-sm font-bold text-parchment">
                  Level {celebration.level} Reached
                </p>
              </div>

              {/* Character Avatar Cheer Box */}
              <div className="relative mx-auto flex h-32 w-32 items-center justify-center rounded-2xl border-2 border-gold/50 bg-gradient-to-b from-[#2a1b10] to-[#120c06] p-2 shadow-[0_0_30px_rgba(226,179,104,0.3)]">
                <div className="animate-bounce">
                  <PixelHeroSprite pose="cheer" size={88} />
                </div>
                <span className="absolute -bottom-2 rounded-full border border-gold/60 bg-[#140f09] px-3 py-0.5 font-mono text-[10px] font-bold text-gold">
                  Lv. {celebration.level}
                </span>
              </div>

              {/* Rewards Claim Summary */}
              <div className="rounded-2xl border border-gold/30 bg-[#18110a] p-4 text-left space-y-2.5">
                <p className="font-display text-xs font-bold uppercase tracking-wider text-parchment border-b border-[#2e2418] pb-1.5">
                  🌟 Rewards Earned:
                </p>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted flex items-center gap-1.5">
                    <span>🪙</span>
                    <strong className="text-parchment">Treasury Bonus:</strong>
                  </span>
                  <span className="font-mono font-bold text-gold-bright">
                    +{celebration.coinsEarned ?? 10} Gold Coins
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted flex items-center gap-1.5">
                    <span>⚔️</span>
                    <strong className="text-parchment">Boss Strike Power:</strong>
                  </span>
                  <span className="font-mono font-bold text-moss">+15% Lethality</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted flex items-center gap-1.5">
                    <span>🔥</span>
                    <strong className="text-parchment">Sacred Kiln Flame:</strong>
                  </span>
                  <span className="font-mono font-bold text-ember">Kindled</span>
                </div>
              </div>

              {/* Claim Action Button */}
              <button
                type="button"
                onClick={dismissCelebration}
                className="w-full rounded-2xl border border-gold/60 bg-gradient-to-r from-[#d97706] via-[#fbbf24] to-[#d97706] py-3.5 font-display text-sm font-bold uppercase tracking-wider text-[#0a0908] shadow-[0_0_25px_rgba(251,191,36,0.4)] hover:brightness-110 active:scale-95 transition-all"
              >
                CLAIM REWARDS & CONTINUE [↵]
              </button>
            </div>
          )}

          {/* ================= ITEM PURCHASED CELEBRATION ================= */}
          {isItem && celebration.item && (
            <div className="space-y-5">
              {/* Header Title */}
              <div className="space-y-1">
                <div className="flex items-center justify-center gap-2 text-2xl animate-bounce">
                  <span>🪙</span>
                  <span className="font-display text-xs font-bold tracking-[0.3em] uppercase text-gold">
                    BAZAAR UNLOCK
                  </span>
                  <span>🪙</span>
                </div>
                <h3 className="font-display text-2xl sm:text-3xl font-black tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-gold-bright to-amber-400 drop-shadow-[0_2px_10px_rgba(251,191,36,0.4)]">
                  GEAR UNLOCKED & EQUIPPED!
                </h3>
                <p className="font-mono text-sm font-semibold text-parchment">
                  {celebration.item.name}
                </p>
              </div>

              {/* Item Showcase & Avatar Preview Row */}
              <div className="grid grid-cols-2 gap-3">
                {/* Item Icon */}
                <div className="flex flex-col items-center justify-center rounded-2xl border border-gold/40 bg-[#18110a] p-3 shadow-inner">
                  <span className="text-4xl animate-pulse">{celebration.item.icon}</span>
                  <span className="mt-1 font-mono text-[10px] uppercase text-gold font-bold">
                    {celebration.item.type}
                  </span>
                </div>

                {/* Hero Avatar Wearing New Gear */}
                <div className="flex flex-col items-center justify-center rounded-2xl border border-gold/40 bg-[#18110a] p-3 shadow-inner">
                  <PixelHeroSprite size={68} />
                  <span className="mt-1 font-mono text-[10px] text-moss font-bold">
                    ✓ WEARING
                  </span>
                </div>
              </div>

              {/* Stat Bonus Box */}
              <div className="rounded-2xl border border-[#382d20] bg-[#120d08] p-3.5 text-left space-y-1">
                <p className="font-mono text-xs text-muted">
                  <strong className="text-parchment">Bonus:</strong>{' '}
                  <span className="text-moss font-bold">{celebration.item.statBonus}</span>
                </p>
                <p className="text-[11px] text-muted-dark leading-relaxed">
                  {celebration.item.description}
                </p>
              </div>

              {/* Action Button */}
              <button
                type="button"
                onClick={dismissCelebration}
                className="w-full rounded-2xl border border-gold/60 bg-gradient-to-r from-[#d97706] via-[#fbbf24] to-[#d97706] py-3.5 font-display text-sm font-bold uppercase tracking-wider text-[#0a0908] shadow-[0_0_25px_rgba(251,191,36,0.4)] hover:brightness-110 active:scale-95 transition-all"
              >
                STRIDE FORTH [↵]
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
