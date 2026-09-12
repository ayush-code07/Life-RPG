import type { BossEntity } from '../types/rpg'

export const BOSS_TIERS: BossEntity[] = [
  {
    id: 'corrupted_behemoth',
    tier: 1,
    name: 'CORRUPTED BEHEMOTH',
    title: 'Scourge of the Ashen Waste',
    avatar: '👹',
    lore: 'A towering obsidian titan manifestation of lethargy and forgotten commitments. Its stone core pulses with heavy void corruption.',
    maxHp: 400,
    currentHp: 240,
    isDefeated: false,
    bountyCoins: 50,
    bountyXp: 250,
    element: 'void',
    weakness: 'Disciplined Daily Quests',
  },
  {
    id: 'ignis_wyrm',
    tier: 2,
    name: 'IGNIS WYRM DREADNOUGHT',
    title: 'Lord of the Magma Caverns',
    avatar: '🐉',
    lore: 'An ancient volcanic serpentine dragon coiled beneath the earth, spewing liquid magma at all who hesitate in their daily trials.',
    maxHp: 800,
    currentHp: 800,
    isDefeated: false,
    bountyCoins: 100,
    bountyXp: 500,
    element: 'fire',
    weakness: 'Strength & Heavy Gym Trials',
  },
  {
    id: 'astral_sovereign',
    tier: 3,
    name: 'ASTRAL VOID SOVEREIGN',
    title: 'Devourer of Starlight',
    avatar: '👾',
    lore: 'A multi-dimensional cosmic entity that warps focus and mental clarity into chaos and distraction.',
    maxHp: 1400,
    currentHp: 1400,
    isDefeated: false,
    bountyCoins: 175,
    bountyXp: 850,
    element: 'astral',
    weakness: 'Intellect & Deep Study Sprints',
  },
  {
    id: 'archdemon_belial',
    tier: 4,
    name: 'GILDED ARCH-DEMON BELIAL',
    title: 'Emperor of the False Sun',
    avatar: '👿',
    lore: 'The apex tyrant of the Abyss who tests the ultimate unbroken will of the Soulbearer.',
    maxHp: 2200,
    currentHp: 2200,
    isDefeated: false,
    bountyCoins: 250,
    bountyXp: 1400,
    element: 'gold',
    weakness: 'Unbroken 7-Day Flame Streaks',
  },
]

export const getStoredBossTier = (userId?: string): number => {
  if (typeof window === 'undefined') return 1
  const key = userId ? `ashen_boss_tier_${userId}` : 'ashen_boss_tier'
  const val = localStorage.getItem(key)
  return val !== null ? parseInt(val, 10) : 1
}

export const getStoredBossHp = (bossId: string, maxHp: number, userId?: string): number => {
  if (typeof window === 'undefined') return maxHp
  const key = userId ? `ashen_boss_hp_${bossId}_${userId}` : `ashen_boss_hp_${bossId}`
  const val = localStorage.getItem(key)
  return val !== null ? parseInt(val, 10) : maxHp
}
