import { useEffect, useRef } from 'react'
import { useGameStore } from '../../store/gameStore'
import { PixelHeroSprite } from './PixelHeroSprite'

export function BonfireScene() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const { profile, resting, restAtBonfire } = useGameStore()
  const streak = profile?.current_streak ?? 1

  // Determine Flame Tier based on Daily Streak
  const flameTier =
    streak >= 14
      ? {
          name: 'Solar Ascendant',
          bonus: '+50% XP',
          badgeColor: 'border-yellow-500/60 bg-yellow-950/70 text-yellow-300',
          particleColors: ['#ffe600', '#ffd700', '#fff48d', '#ffffff'],
          fireGrad: ['#ff9900', '#ffcc00', '#ffe680', '#ffffff'],
          innerGrad: '#ffffff',
          dropShadow: '#ffd700',
          icon: '☀️',
        }
      : streak >= 7
      ? {
          name: 'Astral Blue Flame',
          bonus: '+25% XP',
          badgeColor: 'border-cyan-500/60 bg-cyan-950/70 text-cyan-300',
          particleColors: ['#38bdf8', '#818cf8', '#c084fc', '#e0e7ff'],
          fireGrad: ['#1e1b4b', '#3b82f6', '#60a5fa', '#a5f3fc'],
          innerGrad: '#e0f2fe',
          dropShadow: '#38bdf8',
          icon: '⚡',
        }
      : streak >= 3
      ? {
          name: 'Kindled Blaze',
          bonus: '+10% XP',
          badgeColor: 'border-amber-500/50 bg-amber-950/70 text-amber-300',
          particleColors: ['#ffd175', '#ff9b53', '#f59e0b', '#fbbf24'],
          fireGrad: ['#9a3412', '#ea580c', '#f59e0b', '#fde68a'],
          innerGrad: '#fef08a',
          dropShadow: '#f59e0b',
          icon: '🔥',
        }
      : {
          name: 'Novice Ember',
          bonus: '1.0x XP',
          badgeColor: 'border-gold/30 bg-gold/10 text-gold',
          particleColors: ['#ffd175', '#ff9b53', '#e65c24', '#c83232'],
          fireGrad: ['#801000', '#e65c24', '#ff9b53', '#fff3b0'],
          innerGrad: '#ffe699',
          dropShadow: '#ff7738',
          icon: '🔥',
        }

  // Animated Ember Particle Physics Canvas
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animationFrameId: number
    let width = (canvas.width = canvas.offsetWidth)
    let height = (canvas.height = canvas.offsetHeight)

    const handleResize = () => {
      if (!canvas) return
      width = canvas.width = canvas.offsetWidth
      height = canvas.height = canvas.offsetHeight
    }
    window.addEventListener('resize', handleResize)

    // Particle pool
    const particles: Array<{
      x: number
      y: number
      vx: number
      vy: number
      size: number
      alpha: number
      decay: number
      color: string
    }> = []

    const colors = flameTier.particleColors

    const createParticle = () => {
      const fireX = width * 0.72 + (Math.random() * 26 - 13)
      const fireY = height * 0.78 + (Math.random() * 10 - 5)
      particles.push({
        x: fireX,
        y: fireY,
        vx: (Math.random() - 0.5) * 1.4,
        vy: -(Math.random() * 2.2 + 1.2),
        size: Math.random() * 2.8 + 1,
        alpha: Math.random() * 0.75 + 0.25,
        decay: Math.random() * 0.012 + 0.006,
        color: colors[Math.floor(Math.random() * colors.length)],
      })
    }

    const render = () => {
      ctx.clearRect(0, 0, width, height)

      // Spawn embers
      if (Math.random() < 0.7) createParticle()
      if (resting || streak >= 7) {
        createParticle()
        createParticle()
      }

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i]
        p.x += p.vx + Math.sin(p.y * 0.03) * 0.4
        p.y += p.vy
        p.alpha -= p.decay

        if (p.alpha <= 0 || p.y < 0) {
          particles.splice(i, 1)
          continue
        }

        ctx.save()
        ctx.globalAlpha = p.alpha
        ctx.fillStyle = p.color
        ctx.shadowColor = p.color
        ctx.shadowBlur = 8
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx.fill()
        ctx.restore()
      }

      animationFrameId = requestAnimationFrame(render)
    }

    render()

    return () => {
      window.removeEventListener('resize', handleResize)
      cancelAnimationFrame(animationFrameId)
    }
  }, [resting, flameTier])

  return (
    <div className="relative h-full min-h-[300px] sm:min-h-[330px] w-full overflow-hidden rounded-2xl border border-[#382d20] bg-gradient-to-b from-[#0a0807] via-[#110d0a] to-[#1a140f] p-4 shadow-[0_12px_36px_rgba(0,0,0,0.5)] flex flex-col justify-between">
      {/* Top Header: Flame Evolution & Streak XP Multiplier */}
      <div className="relative z-20 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm">{flameTier.icon}</span>
          <span className={`rounded-full border px-2.5 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider ${flameTier.badgeColor}`}>
            {flameTier.name} • {flameTier.bonus}
          </span>
        </div>
      </div>

      {/* Background Blood Moon / Solar Eclipse */}
      <div className="absolute right-6 top-6 h-12 w-12 sm:h-14 sm:w-14 pointer-events-none">
        <div className="relative h-full w-full rounded-full bg-[#0d0a08] shadow-[0_0_20px_#e65c24,inset_-4px_-4px_12px_#ff9b53]">
          <div className="absolute -inset-0.5 rounded-full border border-ember opacity-80 animate-pulse" />
        </div>
      </div>

      {/* Stars / Dust in sky */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-transparent via-black/20 to-black/80 pointer-events-none" />

      {/* Particle Canvas for Dynamic Embers */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 h-full w-full pointer-events-none z-10"
      />

      {/* Ground Floor Silhouette */}
      <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-[#0e0b08] to-transparent border-b border-[#2e261d]" />
      <div className="absolute bottom-3 left-6 right-6 h-1 bg-[#1c1612] rounded-full opacity-60" />

      {/* Pixel Art Character Wearing Equipped Gear */}
      <div className="absolute bottom-6 left-8 sm:left-12 flex flex-col items-center z-20">
        {/* Floating Zzz when resting */}
        {resting && (
          <div className="absolute -top-7 -right-2 z-30 pointer-events-none select-none flex items-center gap-0.5 animate-bounce">
            <span className="font-display font-black text-sm text-amber-300 drop-shadow-[0_0_8px_rgba(251,191,36,0.9)]">Z</span>
            <span className="font-display font-bold text-xs text-yellow-200 drop-shadow-[0_0_6px_rgba(254,240,138,0.8)]">z</span>
            <span className="font-display font-medium text-[10px] text-sky-200">z</span>
            <span className="text-xs">💤</span>
          </div>
        )}

        <div
          className={`transition-all duration-500 ease-in-out ${
            resting
              ? 'translate-y-2.5 scale-90 rotate-6 opacity-95'
              : 'animate-knight-idle hover:scale-105'
          }`}
        >
          <PixelHeroSprite resting={resting} size={72} />
        </div>
        <div className="mt-2 rounded-full border border-[#2e261d] bg-[#100e0b]/90 px-3 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider text-gold shadow-sm flex items-center gap-1.5">
          <span className={`h-1.5 w-1.5 rounded-full ${resting ? 'bg-amber-400 animate-pulse' : 'bg-moss'}`} />
          <span>{profile?.username ?? 'HERO'}</span>
          {resting && <span className="text-[9px] text-amber-400 font-normal">(Asleep)</span>}
        </div>
      </div>

      {/* Beautified Sacred Bonfire & Plunged Coiled Sword */}
      <div className="absolute bottom-6 right-8 sm:right-14 flex flex-col items-center z-20">
        {/* Flame & Sword Visual */}
        <div className="relative flex flex-col items-center">
          {/* Radiant Ambient Floor Glow */}
          <div
            className="absolute -bottom-4 w-32 h-10 rounded-full blur-xl pointer-events-none opacity-80 transition-all duration-700"
            style={{
              background: `radial-gradient(ellipse, ${flameTier.dropShadow} 0%, transparent 70%)`,
            }}
          />

          {/* Coiled Ancient Dark Sword */}
          <div className="relative h-24 w-6 z-10 flex flex-col items-center pointer-events-none select-none">
            {/* Crown Pommel & Grip */}
            <div className="h-2 w-3 rounded-t-sm bg-[#e2d8ce] border border-[#f5efe6] shadow-[0_0_8px_rgba(255,255,255,0.4)]" />
            <div className="h-5 w-1.5 bg-gradient-to-b from-[#2d241e] via-[#4a3b2c] to-[#1f1712] border-x border-[#5c4a38]" />
            {/* Ornate Winged Crossguard */}
            <div className="h-2.5 w-9 rounded-sm bg-gradient-to-r from-[#5a4d3f] via-[#c4b5a5] to-[#5a4d3f] border border-[#e8ded1]/60 shadow-md flex items-center justify-center">
              <div className="h-1 w-1 rounded-full bg-amber-400 shadow-[0_0_6px_#f59e0b]" />
            </div>
            {/* Incandescent Sword Blade (Coiled into embers) */}
            <div className="h-16 w-2 bg-gradient-to-b from-[#f3f4f6] via-[#9ca3af] to-[#ea580c] rounded-b-sm border-x border-white/50 shadow-[0_0_10px_rgba(255,155,83,0.6)]" />
          </div>

          {/* Multi-layered Animated Bonfire Flame */}
          <div className="absolute -bottom-3 h-24 w-20 animate-flame z-20 pointer-events-none">
            <svg
              viewBox="0 0 100 130"
              className="h-full w-full overflow-visible"
              style={{ filter: `drop-shadow(0 0 18px ${flameTier.dropShadow})` }}
            >
              <defs>
                <linearGradient id="fireGradMain" x1="0%" y1="100%" x2="0%" y2="0%">
                  <stop offset="0%" stopColor={flameTier.fireGrad[0]} />
                  <stop offset="25%" stopColor={flameTier.fireGrad[1]} />
                  <stop offset="65%" stopColor={flameTier.fireGrad[2]} />
                  <stop offset="100%" stopColor={flameTier.fireGrad[3]} />
                </linearGradient>
                <linearGradient id="fireGradCore" x1="0%" y1="100%" x2="0%" y2="0%">
                  <stop offset="0%" stopColor="#f59e0b" />
                  <stop offset="50%" stopColor="#fef08a" />
                  <stop offset="100%" stopColor="#ffffff" />
                </linearGradient>
              </defs>
              {/* Outer Raging Flame Plume */}
              <path
                d="M50 0 C68 28 94 58 94 90 C94 114 74 130 50 130 C26 130 6 114 6 90 C6 58 32 28 50 0 Z"
                fill="url(#fireGradMain)"
              />
              {/* Mid Layer Flame Tongue */}
              <path
                d="M50 20 C62 42 78 68 78 96 C78 114 65 124 50 124 C35 124 22 114 22 96 C22 68 38 42 50 20 Z"
                fill="url(#fireGradMain)"
                opacity="0.9"
              />
              {/* Intense White-Hot Core Flame */}
              <path
                d="M50 45 C57 60 66 78 66 102 C66 115 58 122 50 122 C42 122 34 115 34 102 C34 78 43 60 50 45 Z"
                fill="url(#fireGradCore)"
                opacity="0.95"
              />
            </svg>
          </div>

          {/* Charred Fireplace Burning Oak Logs & Ash Bed */}
          <div className="relative z-25 mt-[-4px] flex items-center justify-center">
            {/* Left Log */}
            <div className="h-3 w-12 rounded-full bg-gradient-to-r from-[#1c120c] via-[#3d2617] to-[#1c120c] border border-[#5c3a21] shadow-inner rotate-[-16deg] translate-x-2" />
            {/* Right Log */}
            <div className="h-3 w-12 rounded-full bg-gradient-to-r from-[#1c120c] via-[#3d2617] to-[#1c120c] border border-[#5c3a21] shadow-inner rotate-[16deg] -translate-x-2" />
            {/* Glowing Charcoal Base with Glowing Cracks */}
            <div
              className="absolute -bottom-1 h-3 w-20 rounded-full bg-[#140e0a] border border-[#2b1b11]"
              style={{ boxShadow: `0 0 18px ${flameTier.dropShadow}` }}
            />
          </div>
        </div>

        {/* Interactive REST AT BONFIRE / WAKE UP Button */}
        <button
          type="button"
          onClick={restAtBonfire}
          className={`mt-4 flex items-center gap-2 rounded-xl border px-4 py-2 font-display text-xs font-bold uppercase tracking-wider transition-all active:scale-95 ${
            resting
              ? 'border-amber-400 bg-gradient-to-r from-amber-500/30 via-yellow-500/25 to-amber-500/30 text-amber-200 shadow-[0_0_25px_rgba(251,191,36,0.45)] hover:brightness-125'
              : 'border-gold/40 bg-[#15100c]/95 text-gold hover:border-gold hover:bg-[#221a13] shadow-[0_0_18px_rgba(226,179,104,0.2)]'
          }`}
        >
          <span className="text-sm animate-pulse">{resting ? '☀️' : '🔥'}</span>
          <span>{resting ? 'WAKE UP' : 'REST AT BONFIRE'}</span>
        </button>
      </div>
    </div>
  )
}
