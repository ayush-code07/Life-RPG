export type LootType = 'coins' | 'potion' | 'gem' | 'scroll' | 'relic'

export interface LootReward {
  id: string
  name: string
  type: LootType
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
  icon: string
  description: string
  rewardCoins?: number
  rewardXP?: number
  rewardAttribute?: { name: string; xp: number }
}

const POSSIBLE_LOOT: LootReward[] = [
  {
    id: 'loot_coins_small',
    name: 'Purse of Ashen Coins',
    type: 'coins',
    rarity: 'common',
    icon: '🪙',
    description: 'A leather drawstring coin purse with freshly minted coins.',
    rewardCoins: 5,
    rewardXP: 15,
  },
  {
    id: 'loot_coins_large',
    name: 'Sunken Treasure Chest',
    type: 'coins',
    rarity: 'rare',
    icon: '💰',
    description: 'An ancient ironbound chest filled with heavy gold coins.',
    rewardCoins: 15,
    rewardXP: 40,
  },
  {
    id: 'loot_coins_jackpot',
    name: "Dragon's Royal Bounty",
    type: 'coins',
    rarity: 'legendary',
    icon: '👑',
    description: 'A glimmering hoard of dragon-tempered solid gold bullion!',
    rewardCoins: 35,
    rewardXP: 100,
  },
  {
    id: 'loot_potion_focus',
    name: 'Elixir of Deep Focus',
    type: 'potion',
    rarity: 'rare',
    icon: '🧪',
    description: 'Distilled mental clarity that sharpens discipline and habits.',
    rewardCoins: 3,
    rewardXP: 30,
    rewardAttribute: { name: 'Discipline', xp: 35 },
  },
  {
    id: 'loot_potion_might',
    name: 'Sunfire Titan Draught',
    type: 'potion',
    rarity: 'rare',
    icon: '🍷',
    description: 'Infused with volcanic embers to fuel physical power and muscle recovery.',
    rewardCoins: 3,
    rewardXP: 30,
    rewardAttribute: { name: 'Strength', xp: 35 },
  },
  {
    id: 'loot_potion_arcane',
    name: 'Essence of Arcane Insight',
    type: 'potion',
    rarity: 'epic',
    icon: '🔮',
    description: 'A glowing cyan vial that accelerates coding, study, and problem solving.',
    rewardCoins: 5,
    rewardXP: 50,
    rewardAttribute: { name: 'Intellect', xp: 50 },
  },
  {
    id: 'loot_gem_starlight',
    name: 'Celestial Starlight Shard',
    type: 'gem',
    rarity: 'epic',
    icon: '💎',
    description: 'A fallen star fragment radiating pure luminescent character XP.',
    rewardCoins: 10,
    rewardXP: 75,
  },
  {
    id: 'loot_scroll_ancient',
    name: 'Codex of the First Flame',
    type: 'scroll',
    rarity: 'legendary',
    icon: '📜',
    description: 'Ancient sacred scriptures containing the lost secrets of habit mastery.',
    rewardCoins: 20,
    rewardXP: 150,
    rewardAttribute: { name: 'Discipline', xp: 75 },
  },
]

/**
 * Calculates whether a completed task drops mystery RPG loot based on difficulty tier.
 */
export function rollForLootDrop(difficulty: number = 1): LootReward | null {
  // Chance thresholds: Tier 1: 30%, Tier 2: 45%, Tier 3: 60%, Tier 4: 75%, Tier 5: 90%
  const chance = Math.min(0.9, 0.2 + difficulty * 0.15)
  const roll = Math.random()

  if (roll > chance) return null

  // Weighted rarity pick based on difficulty
  let pool = POSSIBLE_LOOT
  if (difficulty >= 4) {
    pool = POSSIBLE_LOOT.filter((l) => l.rarity === 'epic' || l.rarity === 'legendary' || l.rarity === 'rare')
  } else if (difficulty <= 2) {
    pool = POSSIBLE_LOOT.filter((l) => l.rarity === 'common' || l.rarity === 'rare')
  }

  const selected = pool[Math.floor(Math.random() * pool.length)]
  return selected
}
