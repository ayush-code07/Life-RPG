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
      <div className="absolute bottom-6 left-10 sm:left-14 flex flex-col items-center z-20">
        <div className={`transition-transform duration-300 ${resting ? 'scale-95' : 'animate-knight-idle'}`}>
          <PixelHeroSprite resting={resting} size={70} />
        </div>
        <div className="mt-2 rounded border border-[#2e261d] bg-[#100e0b] px-2.5 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider text-gold shadow-sm">
          {profile?.username ?? 'HERO'}
        </div>
      </div>

      {/* Bonfire & Plunged Coiled Sword */}
      <div className="absolute bottom-6 right-8 sm:right-14 flex flex-col items-center z-20">
        {/* Flame & Sword Visual */}
        <div className="relative flex flex-col items-center">
          {/* Sword Blade */}
          <div className="relative h-20 w-3 z-10 flex flex-col items-center">
            {/* Pommel / Crossguard */}
            <div className="h-2 w-7 rounded bg-[#9a9187] border border-[#d1c7bc] shadow-sm" />
            <div className="h-4 w-1.5 bg-[#4a3f35]" />
            {/* Blade */}
            <div className="h-14 w-2 bg-gradient-to-b from-[#e5e5e5] via-[#a39f99] to-[#ff7738] rounded-b-sm border-x border-[#f5f5f5]/40" />
          </div>

          {/* Bonfire Flame */}
          <div className="absolute -bottom-2 h-20 w-16 animate-flame z-20 pointer-events-none">
            <svg viewBox="0 0 100 120" className="h-full w-full" style={{ filter: `drop-shadow(0 0 14px ${flameTier.dropShadow})` }}>
              <defs>
                <linearGradient id="fireGrad" x1="0%" y1="100%" x2="0%" y2="0%">
                  <stop offset="0%" stopColor={flameTier.fireGrad[0]} />
                  <stop offset="25%" stopColor={flameTier.fireGrad[1]} />
                  <stop offset="65%" stopColor={flameTier.fireGrad[2]} />
                  <stop offset="100%" stopColor={flameTier.fireGrad[3]} />
                </linearGradient>
              </defs>
              <path
                d="M50 0 C65 30 90 55 90 85 C90 105 72 120 50 120 C28 120 10 105 10 85 C10 55 35 30 50 0 Z"
                fill="url(#fireGrad)"
              />
              <path
                d="M50 30 C58 50 72 65 72 88 C72 102 62 112 50 112 C38 112 28 102 28 88 C28 65 42 50 50 30 Z"
                fill={flameTier.innerGrad}
                opacity="0.85"
              />
            </svg>
          </div>

          {/* Ash & Wood Base */}
          <div className="h-3 w-16 rounded-full bg-[#18120d] border border-[#2b2017]" style={{ boxShadow: `0 0 15px ${flameTier.dropShadow}` }} />
        </div>

        {/* Interactive REST AT BONFIRE Button Overlay */}
        <button
          type="button"
          onClick={restAtBonfire}
          className="mt-3 flex items-center gap-1.5 rounded-lg border border-gold/30 bg-[#14100c]/90 px-3 py-1 text-[11px] font-display font-bold tracking-wider text-gold hover:border-gold hover:bg-[#201912] shadow-[0_0_15px_rgba(226,179,104,0.15)] transition-all active:scale-95"
        >
          <span className="text-xs">🔥</span>
          <span>{resting ? 'RESTED' : 'REST AT BONFIRE'}</span>
        </button>
      </div>
    </div>
  )
}
