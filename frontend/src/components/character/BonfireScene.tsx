import { useEffect, useRef } from 'react'
import { useGameStore } from '../../store/gameStore'

export function BonfireScene() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const { profile, championClass, resting, restAtBonfire } = useGameStore()

  const level = profile?.current_level ?? 12
  const currentXP = profile?.progress_xp ?? 320
  const neededXP = profile?.xp_needed_for_next ?? 500
  const progressPercent = Math.min(100, Math.max(0, Math.round((currentXP / neededXP) * 100)))

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

    const colors = ['#ffd175', '#ff9b53', '#e65c24', '#c83232']

    const createParticle = () => {
      // Fire origin around the sword/bonfire center (right-center of canvas)
      const fireX = width * 0.72 + (Math.random() * 24 - 12)
      const fireY = height * 0.78 + (Math.random() * 10 - 5)
      particles.push({
        x: fireX,
        y: fireY,
        vx: (Math.random() - 0.5) * 1.2,
        vy: -(Math.random() * 1.8 + 1.2),
        size: Math.random() * 2.5 + 1,
        alpha: Math.random() * 0.7 + 0.3,
        decay: Math.random() * 0.012 + 0.006,
        color: colors[Math.floor(Math.random() * colors.length)],
      })
    }

    const render = () => {
      ctx.clearRect(0, 0, width, height)

      // Spawn embers
      if (Math.random() < 0.65) createParticle()
      if (resting) {
        createParticle()
        createParticle()
      }

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i]
        p.x += p.vx + (Math.sin(p.y * 0.03) * 0.4)
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
        ctx.shadowBlur = 6
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
  }, [resting])

  return (
    <div className="flex flex-col gap-3">
      {/* Bonfire Canvas Viewport */}
      <div className="relative h-64 sm:h-72 w-full overflow-hidden rounded-2xl border border-[#382d20] bg-gradient-to-b from-[#0a0807] via-[#110d0a] to-[#1a140f] p-4 shadow-[0_12px_36px_rgba(0,0,0,0.5)]">
        {/* Background Blood Moon / Solar Eclipse */}
        <div className="absolute right-6 top-6 h-12 w-12 sm:h-14 sm:w-14">
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

        {/* Pixel Art Knight Character */}
        <div className="absolute bottom-6 left-12 sm:left-16 flex flex-col items-center z-20">
          <div className={`transition-transform duration-300 ${resting ? 'scale-95' : 'animate-knight-idle'}`}>
            <PixelKnight archetype={championClass} resting={resting} />
          </div>
          <div className="mt-2 rounded border border-[#2e261d] bg-[#100e0b] px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider text-gold">
            {championClass}
          </div>
        </div>

        {/* Bonfire & Plunged Coiled Sword */}
        <div className="absolute bottom-6 right-10 sm:right-16 flex flex-col items-center z-20">
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
              <svg viewBox="0 0 100 120" className="h-full w-full filter drop-shadow-[0_0_12px_#ff7738]">
                <defs>
                  <linearGradient id="fireGrad" x1="0%" y1="100%" x2="0%" y2="0%">
                    <stop offset="0%" stopColor="#801000" />
                    <stop offset="25%" stopColor="#e65c24" />
                    <stop offset="65%" stopColor="#ff9b53" />
                    <stop offset="100%" stopColor="#fff3b0" />
                  </linearGradient>
                </defs>
                <path
                  d="M50 0 C65 30 90 55 90 85 C90 105 72 120 50 120 C28 120 10 105 10 85 C10 55 35 30 50 0 Z"
                  fill="url(#fireGrad)"
                />
                <path
                  d="M50 30 C58 50 72 65 72 88 C72 102 62 112 50 112 C38 112 28 102 28 88 C28 65 42 50 50 30 Z"
                  fill="#ffe699"
                  opacity="0.85"
                />
              </svg>
            </div>

            {/* Ash & Wood Base */}
            <div className="h-3 w-16 rounded-full bg-[#18120d] border border-[#2b2017] shadow-[0_0_15px_#e65c24]" />
          </div>

          {/* Interactive REST AT BONFIRE Button Overlay */}
          <button
            type="button"
            onClick={restAtBonfire}
            className="mt-3 flex items-center gap-1.5 rounded-lg border border-gold/30 bg-[#14100c]/90 px-2.5 py-1 text-[11px] font-display font-bold tracking-wider text-gold hover:border-gold hover:bg-[#201912] shadow-[0_0_15px_rgba(226,179,104,0.15)] transition-all active:scale-95"
          >
            <span className="text-xs">🔥</span>
            <span>{resting ? 'RESTED' : 'REST AT BONFIRE'}</span>
          </button>
        </div>
      </div>

      {/* Level XP Progress Bar Card */}
      <div className="rounded-xl border border-[#382d20] bg-[#14110e] p-3.5 shadow-md">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="font-display text-sm font-bold tracking-wider text-parchment">
              LEVEL {level}
            </span>
            <span className="rounded bg-gold/15 px-1.5 py-0.5 font-mono text-[10px] font-bold text-gold">
              {progressPercent}%
            </span>
          </div>
          <span className="font-mono text-xs text-muted">
            <strong className="text-parchment font-semibold">{currentXP}</strong> / {neededXP} XP
          </span>
        </div>

        {/* Ember Textured Progress Bar */}
        <div className="relative h-4 w-full overflow-hidden rounded-full border border-[#2e261d] bg-[#0c0a08] p-0.5 shadow-inner">
          <div
            className="h-full rounded-full bg-gradient-to-r from-[#a83210] via-[#e65c24] to-[#ffd175] shadow-[0_0_12px_rgba(255,155,83,0.5)] transition-all duration-700 relative overflow-hidden"
            style={{ width: `${progressPercent}%` }}
          >
            {/* Striped Texture overlay */}
            <div className="absolute inset-0 bg-[repeating-linear-gradient(45deg,transparent,transparent_5px,rgba(0,0,0,0.25)_5px,rgba(0,0,0,0.25)_10px)]" />
          </div>
        </div>
      </div>
    </div>
  )
}

// Crisp Pixel Art Knight Sprite Generator
function PixelKnight({ archetype, resting }: { archetype: string; resting: boolean }) {
  // Knight Pixel Matrix (16x16 grid visual)
  return (
    <svg
      width="64"
      height="64"
      viewBox="0 0 16 16"
      className="pixelated"
      style={{ imageRendering: 'pixelated' }}
    >
      {/* Helmet & Plume */}
      <rect x="7" y="1" width="2" height="2" fill="#e65c24" />
      <rect x="6" y="3" width="4" height="4" fill="#9ca3af" />
      <rect x="7" y="4" width="2" height="1" fill="#1f2937" />
      <rect x="7" y="5" width="2" height="2" fill="#d1d5db" />

      {/* Shoulder Cape / Mantle */}
      <rect x="5" y="6" width="6" height="2" fill="#c83232" />
      <rect x="4" y="7" width="2" height="4" fill="#991b1b" />

      {/* Armor Torso */}
      <rect x="6" y="7" width="4" height="4" fill="#4b5563" />
      <rect x="7" y="8" width="2" height="2" fill="#9ca3af" />

      {/* Belt */}
      <rect x="6" y="11" width="4" height="1" fill="#78350f" />
      <rect x="7" y="11" width="2" height="1" fill="#e2b368" />

      {/* Legs / Greaves */}
      <rect x="6" y="12" width="1.5" height="3" fill="#374151" />
      <rect x="8.5" y="12" width="1.5" height="3" fill="#374151" />
      <rect x="5.5" y="14" width="2" height="2" fill="#1f2937" />
      <rect x="8.5" y="14" width="2" height="2" fill="#1f2937" />

      {/* Shield (Left Hand) */}
      <rect x="2" y="6" width="3" height="6" fill="#e5e7eb" />
      <rect x="3" y="7" width="1" height="4" fill="#3b82f6" />
      <rect x="2" y="11" width="3" height="1" fill="#9ca3af" />

      {/* Weapon (Right Hand) */}
      <rect x="11" y="5" width="1" height="8" fill="#d1d5db" />
      <rect x="10" y="8" width="3" height="1" fill="#e2b368" />
    </svg>
  )
}
