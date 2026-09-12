import { useGameStore } from '../../store/gameStore'

export function HeroStatsPanel() {
  const { profile, attributes } = useGameStore()

  const level = profile?.current_level ?? 12
  const currentXP = profile?.progress_xp ?? 320
  const neededXP = profile?.xp_needed_for_next ?? 500
  const progressPercent = Math.min(100, Math.max(0, Math.round((currentXP / neededXP) * 100)))

  const abilities = [
    {
      name: 'STRENGTH',
      icon: '⚔️',
      matchKey: 'strength',
      matchId: 1,
      defaultVal: 18,
      defaultXp: 45,
      barColor: 'from-[#e65c24] to-[#ffd175]',
      textColor: 'text-amber-300',
    },
    {
      name: 'INTELLECT',
      icon: '🧠',
      matchKey: 'intellect',
      matchId: 2,
      defaultVal: 22,
      defaultXp: 75,
      barColor: 'from-[#2563eb] to-[#60a5fa]',
      textColor: 'text-blue-300',
    },
    {
      name: 'VITALITY',
      icon: '❤️',
      matchKey: 'vitality',
      matchId: 5,
      defaultVal: 16,
      defaultXp: 30,
      barColor: 'from-[#e11d48] to-[#fb7185]',
      textColor: 'text-rose-300',
    },
    {
      name: 'FOCUS',
      icon: '✨',
      matchKey: 'discipline',
      matchId: 3,
      defaultVal: 24,
      defaultXp: 90,
      barColor: 'from-[#ca8a04] to-[#fef08a]',
      textColor: 'text-yellow-300',
    },
  ]

  return (
    <div className="flex flex-col justify-between h-full gap-3">
      {/* Level XP Progress Bar Card */}
      <div className="rounded-2xl border border-[#382d20] bg-[#14110e] p-4 shadow-md">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="font-display text-sm sm:text-base font-bold tracking-wider text-parchment">
              LEVEL {level}
            </span>
            <span className="rounded bg-gold/15 px-2 py-0.5 font-mono text-[11px] font-bold text-gold">
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

      {/* Four Core Abilities Card */}
      <div className="rounded-2xl border border-[#382d20] bg-[#14110e] p-4 shadow-md flex-1 flex flex-col justify-between space-y-3">
        <div className="flex items-center justify-between border-b border-[#262018] pb-2">
          <div className="flex items-center gap-2">
            <span className="text-base">🛡️</span>
            <h4 className="font-display text-xs sm:text-sm font-bold uppercase tracking-wider text-parchment">
              CORE ABILITIES
            </h4>
          </div>
          <span className="font-mono text-[10px] text-muted-dark uppercase tracking-wider">MASTERY</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 flex-1 items-center">
          {abilities.map((ability) => {
            const found = (attributes || []).find(
              (a) =>
                a.attribute_name?.toLowerCase().includes(ability.matchKey) ||
                a.attribute_name?.toLowerCase().includes(ability.name.toLowerCase()) ||
                a.attribute_id === ability.matchId
            )
            const val = found?.attribute_value ?? ability.defaultVal
            const xp = (found?.attribute_xp ?? ability.defaultXp) % 100
            const max = 100

            return (
              <div
                key={ability.name}
                className="group rounded-xl border border-[#262018] bg-[#0e0c0a] p-3 transition-all hover:border-gold/40 hover:bg-[#16120e] flex flex-col justify-between"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-base select-none">{ability.icon}</span>
                    <span className={`font-display text-xs font-bold tracking-wider ${ability.textColor}`}>
                      {ability.name}
                    </span>
                  </div>
                  <span className="font-mono text-xs font-black text-gold">
                    LVL {val}
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="space-y-1">
                  <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-[#181410] border border-[#2e261d]">
                    <div
                      className={`h-full rounded-full bg-gradient-to-r ${ability.barColor} transition-all duration-500`}
                      style={{ width: `${(xp / max) * 100}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[9px] font-mono text-muted-dark">
                    <span>PROGRESS</span>
                    <span>{xp} / {max} XP</span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
