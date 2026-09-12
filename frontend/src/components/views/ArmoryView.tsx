import { useGameStore } from '../../store/gameStore'

const RARITY_COLORS: Record<string, { border: string; bg: string; text: string }> = {
  common: { border: 'border-gray-700', bg: 'bg-gray-900/40', text: 'text-gray-300' },
  rare: { border: 'border-blue-700/60', bg: 'bg-blue-950/30', text: 'text-blue-400' },
  epic: { border: 'border-purple-700/60', bg: 'bg-purple-950/30', text: 'text-purple-400' },
  legendary: { border: 'border-amber-500/70', bg: 'bg-amber-950/40', text: 'text-amber-300' },
}

export function ArmoryView() {
  const { inventory, shopItems, equipItem, setActiveTab } = useGameStore()

  // Combined purchased gear and inventory
  const purchasedGear = shopItems.filter((i) => i.isPurchased)
  const items = purchasedGear.length > 0 ? purchasedGear : shopItems.slice(0, 3)

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-4 border-b border-[#262018] pb-3">
        <div>
          <h2 className="font-display text-2xl font-bold tracking-wide text-parchment">
            ARMORY & VAULT
          </h2>
          <p className="text-xs text-muted">
            Manage your unlocked hero gear, weapons, cloaks, and active equipment.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setActiveTab('rewards')}
          className="flex items-center gap-2 rounded-xl border border-gold/40 bg-gold/15 px-4 py-2 font-display text-xs font-bold uppercase tracking-wider text-gold hover:bg-gold/25 transition-all shadow-[0_0_15px_rgba(226,179,104,0.15)]"
        >
          <span>🪙</span>
          <span>VISIT REWARDS BAZAAR</span>
        </button>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item: any) => {
          const rarity = (item.rarity || 'common').toLowerCase()
          const style = RARITY_COLORS[rarity] || RARITY_COLORS.common
          const isEquipped = item.isEquipped

          return (
            <div
              key={item.id || item.inventory_id}
              className={`relative flex flex-col justify-between rounded-xl border ${style.border} ${style.bg} p-4 shadow-md transition-all hover:scale-[1.02]`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] uppercase text-muted">
                    {item.type || item.item_type} • {rarity}
                  </span>
                  {isEquipped && (
                    <span className="rounded border border-moss/40 bg-moss/15 px-2 py-0.5 font-mono text-[9px] font-bold uppercase tracking-wider text-moss">
                      ✓ WEARING
                    </span>
                  )}
                </div>

                <div className="mt-3 flex items-center gap-3">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border border-[#382d20] bg-[#100d0a] text-2xl shadow-inner">
                    {item.icon || '🗡️'}
                  </div>

                  <div>
                    <h3 className={`font-display text-sm font-bold ${style.text}`}>
                      {item.name || item.item_name}
                    </h3>
                    <p className="font-mono text-[10px] text-moss">
                      {item.statBonus || '+10 Combat Power'}
                    </p>
                  </div>
                </div>

                <p className="mt-3 text-xs text-muted leading-relaxed">
                  {item.desc || item.description}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-[#262018] flex items-center justify-end">
                <button
                  type="button"
                  onClick={() => equipItem(item.id)}
                  className={`rounded-lg px-3 py-1 font-display text-xs font-bold uppercase tracking-wider transition-all ${
                    isEquipped
                      ? 'border border-moss/40 bg-moss/20 text-moss'
                      : 'border border-gold/30 bg-gold/10 text-gold hover:bg-gold/20'
                  }`}
                >
                  {isEquipped ? 'UNEQUIP' : 'EQUIP'}
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
