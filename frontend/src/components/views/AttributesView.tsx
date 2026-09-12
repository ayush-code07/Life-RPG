import { useGameStore } from '../../store/gameStore'
import { ATTRIBUTE_CONFIG, type CoreAttributeName } from '../../lib/attributeMapping'

export function AttributesView() {
  const { attributes } = useGameStore()

  // 6 Core Attributes matching system design
  const coreAttributeOrder: CoreAttributeName[] = [
    'Strength',
    'Intellect',
    'Discipline',
    'Vitality',
    'Charisma',
    'Agility',
  ]

  const displayList = coreAttributeOrder.map((attrName, idx) => {
    const config = ATTRIBUTE_CONFIG[attrName]
    const found = attributes.find(
      (a) => a.attribute_name?.toLowerCase() === attrName.toLowerCase() || a.attribute_id === idx + 1
    )

    const val = found?.attribute_value ?? 10
    const xp = (found?.attribute_xp ?? 0) % 100
    const totalXp = found?.attribute_xp ?? 0
    const max = 100

    return {
      name: attrName,
      val,
      xp,
      totalXp,
      max,
      icon: config.icon,
      desc: found?.description || config.description,
      badgeColor: config.badgeColor,
      textColor: config.textColor,
      sampleTasks: config.sampleTasks,
      tier: Math.floor(val / 10) + 1,
    }
  })

  return (
    <div className="space-y-6">
      <header className="border-b border-[#262018] pb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h2 className="font-display text-2xl font-bold tracking-wide text-parchment flex items-center gap-2.5">
            <span>🛡️</span>
            <span>CHARACTER STAT MASTERY</span>
          </h2>
          <p className="text-xs text-muted">
            Complete real-world tasks to level up specific character attributes.
          </p>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto rounded-lg border border-gold/30 bg-gold/5 px-3 py-1.5 font-mono text-xs text-gold">
          <span>⚔️ Total Stats:</span>
          <span className="font-bold">{displayList.reduce((sum, a) => sum + a.val, 0)} Points</span>
        </div>
      </header>

      {/* Task Categorization Guide */}
      <div className="rounded-xl border border-[#2e261d] bg-[#120f0c] p-4 text-xs text-muted space-y-1">
        <p className="font-bold uppercase tracking-wider text-parchment font-display flex items-center gap-1.5">
          <span>💡</span> HOW TASKS LEVEL UP YOUR ATTRIBUTES
        </p>
        <p>
          Tasks are dynamically categorized by their tags (<span className="text-parchment font-mono">Work, School, Exercise, Chores, Teams, Health</span>) and title keywords (<span className="text-parchment font-mono">"Coding", "Gym", "Sleep", "Sprint"</span>). Higher difficulty tiers grant greater attribute XP gains.
        </p>
      </div>

      {/* Attributes Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {displayList.map((attr) => {
          return (
            <div
              key={attr.name}
              className="rounded-xl border border-[#2e261d] bg-[#14110e] p-4 shadow-md transition-all hover:border-gold/40 hover:bg-[#181410] flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="text-2xl">{attr.icon}</span>
                    <div>
                      <h3 className={`font-display text-base font-bold ${attr.textColor}`}>
                        {attr.name}
                      </h3>
                      <p className="text-[10px] text-muted-dark uppercase tracking-wider font-mono">
                        Rank / Tier {attr.tier}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="font-mono text-xl font-black text-gold">
                      {attr.val}
                    </span>
                    <span className="block text-[9px] font-mono text-muted uppercase">LVL</span>
                  </div>
                </div>

                <p className="mt-3 text-xs text-muted leading-relaxed">
                  {attr.desc}
                </p>

                {/* Level Up By */}
                <div className="mt-3 rounded-lg border border-[#262018] bg-[#0d0b09] p-2">
                  <p className="text-[10px] font-mono font-bold uppercase tracking-wider text-muted-dark mb-0.5">
                    📈 Level up by:
                  </p>
                  <p className="font-mono text-[11px] text-parchment">
                    {attr.sampleTasks}
                  </p>
                </div>
              </div>

              {/* Stat Progress Bar */}
              <div className="mt-4 space-y-1 pt-3 border-t border-[#221c16]">
                <div className="flex justify-between text-[10px] font-mono text-muted">
                  <span>PROGRESS TO NEXT LEVEL</span>
                  <span className="text-gold font-bold">{attr.xp} / {attr.max} XP</span>
                </div>
                <div className="h-2 w-full rounded-full bg-[#0c0a08] overflow-hidden border border-[#2e261d]">
                  <div
                    className="h-full bg-gradient-to-r from-gold-deep via-gold to-gold-bright transition-all duration-500 rounded-full"
                    style={{ width: `${(attr.xp / attr.max) * 100}%` }}
                  />
                </div>
                <div className="flex justify-between text-[9px] font-mono text-muted-dark pt-0.5">
                  <span>Total XP: {attr.totalXp}</span>
                  <span>+{100 - attr.xp} XP to LVL {attr.val + 1}</span>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
