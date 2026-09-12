import { useGameStore } from '../../store/gameStore'

export function BossRaidWidget() {
  const { boss } = useGameStore()
  const percent = Math.round((boss.currentHp / boss.maxHp) * 100)

  return (
    <div className="rounded-xl border border-[#3d1f1f] bg-gradient-to-r from-[#170e0e] via-[#1c1111] to-[#140c0c] p-4 shadow-[0_4px_24px_rgba(200,50,50,0.12)]">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Boss Skull Icon */}
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg border border-crimson/40 bg-[#120707] text-crimson shadow-[0_0_12px_rgba(200,50,50,0.2)]">
            <span className="text-lg">💀</span>
          </div>

          <div>
            <h3 className="font-display text-sm font-bold tracking-wider text-parchment">
              {boss.name}
            </h3>
            <p className="text-[11px] italic text-muted">
              {boss.title}
            </p>
          </div>
        </div>

        <div className="text-right">
          <span className="font-mono text-xs font-bold text-crimson">
            {boss.currentHp} / {boss.maxHp} HP
          </span>
        </div>
      </div>

      {/* Crimson Boss HP Bar */}
      <div className="mt-3 relative h-2.5 w-full overflow-hidden rounded-full border border-[#421a1a] bg-[#0c0505]">
        <div
          className="h-full rounded-full bg-gradient-to-r from-[#991b1b] via-[#dc2626] to-[#ef4444] shadow-[0_0_12px_rgba(239,68,68,0.6)] transition-all duration-500"
          style={{ width: `${percent}%` }}
        />
      </div>

      {/* Helper text */}
      <p className="mt-2 text-[10px] text-muted flex items-center gap-1.5">
        <span className="text-ember text-xs">🔥</span>
        <span>Complete quests to strike the beast with your weapon.</span>
      </p>
    </div>
  )
}
