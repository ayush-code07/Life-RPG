import { useGameStore } from '../../store/gameStore'

const ATTRIBUTE_ICONS: Record<string, string> = {
  Strength: '💪',
  Dexterity: '⚡',
  Intelligence: '🧠',
  Vitality: '❤️',
  Wisdom: '🔮',
  Discipline: '🛡️',
}

export function AttributesView() {
  const { attributes, profile } = useGameStore()

  const defaultAttrs = [
    { name: 'Strength', val: 18, xp: 45, max: 100, desc: 'Physical power and heavy weapon scaling' },
    { name: 'Dexterity', val: 14, xp: 20, max: 100, desc: 'Agility, critical precision, and reflex rate' },
    { name: 'Intelligence', val: 22, xp: 75, max: 100, desc: 'Arcane mastery, learning speed, and focus depth' },
    { name: 'Vitality', val: 16, xp: 30, max: 100, desc: 'Endurance, sleep hygiene, and recovery' },
    { name: 'Wisdom', val: 19, xp: 60, max: 100, desc: 'Long-term vision, intuition, and mental clarity' },
    { name: 'Discipline', val: 24, xp: 90, max: 100, desc: 'Consistency, habit adherence, and willpower' },
  ]

  const displayList = attributes.length > 0
    ? attributes.map((a) => ({
        name: a.attribute_name ?? `Attribute ${a.attribute_id}`,
        val: a.attribute_value,
        xp: a.attribute_xp % 100,
        max: 100,
        desc: a.description ?? 'Core discipline mastery metric',
      }))
    : defaultAttrs

  return (
    <div className="space-y-6">
      <header className="border-b border-[#262018] pb-3">
        <h2 className="font-display text-2xl font-bold tracking-wide text-parchment">
          STAT MASTERY & ATTRIBUTES
        </h2>
        <p className="text-xs text-muted">
          Your lifelong stats forge the foundation of your character's combat & life power.
        </p>
      </header>

      {/* Attributes Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {displayList.map((attr) => {
          const icon = ATTRIBUTE_ICONS[attr.name] ?? '⚔️'
          return (
            <div
              key={attr.name}
              className="rounded-xl border border-[#2e261d] bg-[#14110e] p-4 shadow-md transition-all hover:border-gold/40 hover:bg-[#181410]"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="text-xl">{icon}</span>
                  <div>
                    <h3 className="font-display text-sm font-bold text-parchment">
                      {attr.name}
                    </h3>
                    <p className="text-[10px] text-muted-dark uppercase tracking-wider font-mono">
                      Tier {Math.floor(attr.val / 10) + 1}
                    </p>
                  </div>
                </div>

                <span className="font-mono text-lg font-black text-gold">
                  {attr.val}
                </span>
              </div>

              <p className="mt-2.5 text-xs text-muted line-clamp-2">
                {attr.desc}
              </p>

              {/* Stat Progress Bar */}
              <div className="mt-3 space-y-1">
                <div className="flex justify-between text-[10px] font-mono text-muted">
                  <span>PROGRESS</span>
                  <span>{attr.xp} / {attr.max} XP</span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-[#0c0a08] overflow-hidden border border-[#2e261d]">
                  <div
                    className="h-full bg-gradient-to-r from-gold-deep via-gold to-gold-bright transition-all duration-500"
                    style={{ width: `${(attr.xp / attr.max) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
