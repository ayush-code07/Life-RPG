import { useGameStore } from '../../store/gameStore'

const RARITY_COLORS: Record<string, { border: string; bg: string; text: string }> = {
  common: { border: 'border-gray-700', bg: 'bg-gray-900/40', text: 'text-gray-300' },
  rare: { border: 'border-blue-700/60', bg: 'bg-blue-950/30', text: 'text-blue-400' },
  epic: { border: 'border-purple-700/60', bg: 'bg-purple-950/30', text: 'text-purple-400' },
  legendary: { border: 'border-amber-500/70', bg: 'bg-amber-950/40', text: 'text-amber-300' },
}

export function ArmoryView() {
  const { inventory } = useGameStore()

  const defaultItems = [
    {
      id: 1,
      name: 'Ashen Greatsword',
      type: 'Weapon',
      desc: 'Heavy blade forged in the primordial kiln. Scales with Strength.',
      rarity: 'epic',
      equipped: true,
      icon: '🗡️',
    },
    {
      id: 2,
      name: 'Flask of Crimson Embers',
      type: 'Consumable',
      desc: 'Restores stamina and clears cognitive fatigue upon drinking.',
      rarity: 'rare',
      equipped: false,
      icon: '🧪',
    },
    {
      id: 3,
      name: 'Ring of Daily Resolve',
      type: 'Relic',
      desc: 'Grants +10% bonus XP on quests completed before noon.',
      rarity: 'legendary',
      equipped: true,
      icon: '💍',
    },
    {
      id: 4,
      name: 'Cinder Cloak',
      type: 'Armor',
      desc: 'Woven from flame-retardant ash threads. Shields against burnout.',
      rarity: 'rare',
      equipped: false,
      icon: '🥋',
    },
    {
      id: 5,
      name: 'Scroll of Ancient Wisdom',
      type: 'Tome',
      desc: 'Contains forgotten paradigms from master codex scribes.',
      rarity: 'common',
      equipped: false,
      icon: '📜',
    },
  ]

  const items = inventory.length > 0 ? inventory : defaultItems

  return (
    <div className="space-y-6">
      <header className="border-b border-[#262018] pb-3">
        <h2 className="font-display text-2xl font-bold tracking-wide text-parchment">
          ARMORY & VAULT
        </h2>
        <p className="text-xs text-muted">
          Equip relics, weapons, and consumables discovered through quest streaks and progression.
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item: any) => {
          const rarity = (item.rarity || 'common').toLowerCase()
          const style = RARITY_COLORS[rarity] || RARITY_COLORS.common
          return (
            <div
              key={item.id || item.inventory_id}
              className={`relative rounded-xl border ${style.border} ${style.bg} p-4 shadow-md transition-all hover:scale-[1.02]`}
            >
              {item.equipped && (
                <span className="absolute right-3 top-3 rounded border border-gold/40 bg-gold/15 px-2 py-0.5 font-mono text-[9px] font-bold uppercase tracking-wider text-gold">
                  EQUIPPED
                </span>
              )}

              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border border-[#382d20] bg-[#100d0a] text-2xl">
                  {item.icon || '🗡️'}
                </div>

                <div>
                  <h3 className={`font-display text-sm font-bold ${style.text}`}>
                    {item.name || item.item_name}
                  </h3>
                  <p className="text-[10px] font-mono uppercase tracking-wider text-muted">
                    {item.type || item.item_type} • {rarity}
                  </p>
                </div>
              </div>

              <p className="mt-3 text-xs text-muted">
                {item.desc || item.description}
              </p>
            </div>
          )
        })}
      </div>
    </div>
  )
}
