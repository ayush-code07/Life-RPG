import { useState } from 'react'
import { soundFx } from '../../lib/audio'
import { useGameStore } from '../../store/gameStore'
import { PixelHeroSprite } from '../character/PixelHeroSprite'
import type { ShopItem } from '../../types/rpg'

type ShopFilter = 'all' | 'weapon' | 'armor' | 'cloak' | 'shield' | 'relic'

const RARITY_THEMES: Record<string, { border: string; bg: string; badge: string; text: string }> = {
  common: {
    border: 'border-[#382d20]',
    bg: 'bg-[#14110e]',
    badge: 'border-[#4a3f35] bg-[#1a140f] text-gray-300',
    text: 'text-parchment',
  },
  rare: {
    border: 'border-blue-700/50 shadow-[0_0_15px_rgba(59,130,246,0.15)]',
    bg: 'bg-gradient-to-b from-[#111726] to-[#0e1017]',
    badge: 'border-blue-500/40 bg-blue-950/60 text-blue-400',
    text: 'text-blue-300',
  },
  epic: {
    border: 'border-purple-600/50 shadow-[0_0_15px_rgba(168,85,247,0.15)]',
    bg: 'bg-gradient-to-b from-[#1a1126] to-[#120e17]',
    badge: 'border-purple-500/40 bg-purple-950/60 text-purple-400',
    text: 'text-purple-300',
  },
  legendary: {
    border: 'border-amber-500/60 shadow-[0_0_20px_rgba(245,158,11,0.2)]',
    bg: 'bg-gradient-to-b from-[#24170c] via-[#1c120a] to-[#120c06]',
    badge: 'border-amber-500/50 bg-amber-950/70 text-amber-300',
    text: 'text-amber-300',
  },
}

export function RewardsView() {
  const [filter, setFilter] = useState<ShopFilter>('all')
  const { coins, shopItems, buyItem, equipItem, profile } = useGameStore()

  const level = profile?.current_level ?? 3
  const equippedCount = shopItems.filter((i) => i.isEquipped).length

  const filteredItems = shopItems.filter((item) => {
    if (filter === 'all') return true
    return item.type === filter
  })

  return (
    <div className="space-y-6">
      {/* Header with Prominent Coin Balance */}
      <header className="flex flex-wrap items-center justify-between gap-4 border-b border-[#262018] pb-4">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="text-2xl">🪙</span>
            <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-wide text-parchment">
              ROYAL BAZAAR & REWARDS
            </h2>
          </div>
          <p className="mt-1 text-xs text-muted">
            Earn coins by completing quests (+1 coin) and leveling up (+10 coins). Purchase gear to equip and customize your character sprite!
          </p>
        </div>

        {/* Player Treasury Counter */}
        <div className="flex items-center gap-3 rounded-2xl border border-gold/40 bg-gradient-to-r from-gold/15 to-transparent px-5 py-3 shadow-[0_0_20px_rgba(226,179,104,0.15)]">
          <span className="text-2xl animate-bounce">🪙</span>
          <div>
            <p className="font-mono text-[10px] uppercase tracking-wider text-muted">YOUR TREASURY</p>
            <p className="font-mono text-xl sm:text-2xl font-black text-gold-bright">{coins} Coins</p>
          </div>
        </div>
      </header>

      {/* Hero Live Dressing Pedestal & Intro */}
      <div className="rounded-2xl border border-[#382d20] bg-gradient-to-r from-[#14110e] via-[#1a1510] to-[#120f0c] p-4 sm:p-5 shadow-lg flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          {/* Avatar Pedestal Box (Lilac & Dark Fantasy Frame) */}
          <div className="flex flex-col items-center">
            <div className="relative flex h-28 w-28 items-center justify-center rounded-2xl border-2 border-[#584568] bg-gradient-to-b from-[#2a1d38] to-[#150f1d] p-2 shadow-[0_0_20px_rgba(147,112,219,0.25)]">
              <PixelHeroSprite size={90} />
            </div>
            <span className="mt-1.5 font-mono text-xs font-bold text-parchment">
              Lvl. {level}
            </span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-moss shadow-[0_0_8px_#48bb78]" />
              <h3 className="font-display text-base font-bold text-parchment uppercase tracking-wider">
                {profile?.username ? profile.username.toUpperCase() : 'ASHEN HERO'}
              </h3>
            </div>
            <p className="mt-1 text-xs text-muted max-w-md leading-relaxed">
              Items purchased from the bazaar are instantly worn on your character sprite. Equip swords, horned helmets, buckler shields, pet companions, and armor!
            </p>
            <div className="mt-2.5 flex items-center gap-3 font-mono text-xs text-gold">
              <span className="rounded bg-gold/10 px-2 py-0.5 border border-gold/20">
                🛡️ {equippedCount} Wearables Equipped
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className="flex items-center gap-1.5 rounded-xl border border-[#2e261d] bg-[#100e0b] p-1.5 overflow-x-auto">
        {(['all', 'weapon', 'armor', 'cloak', 'shield', 'relic'] as ShopFilter[]).map((f) => {
          const isSelected = filter === f
          return (
            <button
              key={f}
              type="button"
              onClick={() => {
                soundFx.playClick()
                setFilter(f)
              }}
              className={`rounded-lg px-3.5 py-1.5 font-mono text-xs font-bold uppercase transition-all ${
                isSelected
                  ? 'border border-gold/40 bg-gold text-[#0a0908] shadow-[0_0_12px_rgba(226,179,104,0.3)]'
                  : 'text-muted hover:text-parchment hover:bg-[#181410]'
              }`}
            >
              {f === 'all' ? '✨ ALL WEARABLES' : f}
            </button>
          )
        })}
      </div>

      {/* Shop Gear Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filteredItems.map((item) => {
          const theme = RARITY_THEMES[item.rarity] || RARITY_THEMES.common
          const canAfford = coins >= item.price
          const isPurchased = item.isPurchased
          const isEquipped = item.isEquipped

          return (
            <div
              key={item.id}
              className={`relative flex flex-col justify-between rounded-2xl border ${theme.border} ${theme.bg} p-4.5 shadow-lg transition-all hover:scale-[1.02]`}
            >
              <div>
                {/* Rarity and Type Header */}
                <div className="flex items-center justify-between gap-2">
                  <span
                    className={`rounded-full border px-2 py-0.5 font-mono text-[9px] font-bold uppercase tracking-wider ${theme.badge}`}
                  >
                    {item.rarity}
                  </span>
                  <span className="font-mono text-[10px] uppercase text-muted">
                    {item.type}
                  </span>
                </div>

                {/* Item Icon and Name */}
                <div className="mt-3 flex items-center gap-3">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border border-[#382d20] bg-[#0c0a08] text-3xl shadow-inner">
                    {item.icon}
                  </div>
                  <div>
                    <h3 className={`font-display text-sm font-bold ${theme.text}`}>
                      {item.name}
                    </h3>
                    <p className="mt-0.5 font-mono text-[10px] text-moss font-semibold">
                      {item.statBonus}
                    </p>
                  </div>
                </div>

                <p className="mt-3 text-xs text-muted leading-relaxed">
                  {item.description}
                </p>
              </div>

              {/* Price & Action Button Row */}
              <div className="mt-4 pt-3 border-t border-[#262018] flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 rounded-lg bg-[#0c0a08] border border-[#2a221a] px-2.5 py-1">
                  <span className="text-sm">🪙</span>
                  <span className="font-mono text-sm font-bold text-gold">
                    {isPurchased ? 'Owned' : `${item.price}`}
                  </span>
                </div>

                {isPurchased ? (
                  <button
                    type="button"
                    onClick={() => equipItem(item.id)}
                    className={`rounded-xl px-3.5 py-1.5 font-display text-xs font-bold uppercase tracking-wider transition-all active:scale-95 ${
                      isEquipped
                        ? 'border border-moss/50 bg-moss/20 text-moss shadow-[0_0_10px_rgba(72,187,120,0.2)]'
                        : 'border border-gold/40 bg-gold/15 text-gold hover:bg-gold/25'
                    }`}
                  >
                    {isEquipped ? '✓ WEARING' : 'EQUIP'}
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled={!canAfford}
                    onClick={() => buyItem(item.id)}
                    className={`rounded-xl px-3.5 py-1.5 font-display text-xs font-bold uppercase tracking-wider transition-all active:scale-95 ${
                      canAfford
                        ? 'border border-gold/50 bg-gold text-[#0a0908] hover:bg-gold-bright shadow-[0_0_15px_rgba(226,179,104,0.3)]'
                        : 'border-[#2e261d] bg-[#14110e] text-muted opacity-50 cursor-not-allowed'
                    }`}
                  >
                    {canAfford ? 'PURCHASE' : 'NEED COINS'}
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
