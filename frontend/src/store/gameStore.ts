import { create } from 'zustand'
import { rpgApi, ApiError } from '../lib/api'
import { applyXPGain, applyAttributeXPGain } from '../lib/progression'
import { categorizeTaskAttributes } from '../lib/attributeMapping'
import { soundFx } from '../lib/audio'
import { PREVIEW_TOKEN, previewAttributes, previewProfile, previewTasks } from '../lib/previewData'
import { useAuthStore } from './authStore'
import type { ShopItem } from '../types/rpg'

export const INITIAL_SHOP_ITEMS: ShopItem[] = [
  // ==========================================
  // --- WEAPONS & COMBAT GEAR ---
  // ==========================================
  {
    id: 1,
    name: 'Silver Adventurer Sword',
    type: 'weapon',
    price: 35, // ~1 Week
    description: 'Forged tempered iron shortsword. Adds clean strike damage to your character.',
    rarity: 'rare',
    icon: '🗡️',
    statBonus: '+15 Strength • +30 Boss Strike',
    isPurchased: false,
    isEquipped: false,
  },
  {
    id: 8,
    name: 'Lantern Halberd Polearm',
    type: 'weapon',
    price: 190, // ~1 Month
    description: 'Ancient wooden polearm featuring an incandescent ember lantern on a brass hook.',
    rarity: 'epic',
    icon: '🏮',
    statBonus: '+35 Mastery • Dark Vision',
    isPurchased: false,
    isEquipped: false,
  },
  {
    id: 12,
    name: 'Sunfire Greatsword',
    type: 'weapon',
    price: 600, // ~3 Months
    description: 'A colossal two-handed blade bathed in eternal solar flame.',
    rarity: 'legendary',
    icon: '⚔️',
    statBonus: '+50 Strength • Sunbeam Cleave',
    isPurchased: false,
    isEquipped: false,
  },
  {
    id: 13,
    name: 'Excalibur of the Sun God',
    type: 'weapon',
    price: 2500, // ~1 Year
    description: 'Forged through 365 days of unbroken mortal discipline. Radiates blinding solar rays and celestial fury.',
    rarity: 'legendary',
    icon: '✨',
    statBonus: '+120 Strength • +200 Boss Strike • Solar Flare',
    isPurchased: false,
    isEquipped: false,
  },

  // ==========================================
  // --- ARMOR, HELMETS & CLOAKS ---
  // ==========================================
  {
    id: 2,
    name: 'Viking Horned Helmet',
    type: 'armor',
    price: 20, // ~5 Days
    description: 'Hardened leather and iron cap flanked by twin bull horns.',
    rarity: 'common',
    icon: '🪖',
    statBonus: '+8 Focus • +5 Vitality',
    isPurchased: false,
    isEquipped: false,
  },
  {
    id: 5,
    name: 'Leather Bandit Vest',
    type: 'armor',
    price: 15, // ~3-4 Days
    description: 'Supple stitched leather doublet providing swift agile movement.',
    rarity: 'common',
    icon: '🥋',
    statBonus: '+10 Agility • +5 Focus',
    isPurchased: false,
    isEquipped: false,
  },
  {
    id: 6,
    name: 'Spirit Ghost Mask',
    type: 'armor',
    price: 150, // ~1 Month
    description: 'Mystic phantom visage that stares through cognitive illusions.',
    rarity: 'epic',
    icon: '🎭',
    statBonus: '+20 Intellect • +15 Focus',
    isPurchased: false,
    isEquipped: false,
  },
  {
    id: 9,
    name: 'Royal Knight Steel Plate',
    type: 'armor',
    price: 220, // ~1 Month
    description: 'Ceremonial blue steel heavy plate armor with fortified pauldrons.',
    rarity: 'epic',
    icon: '🛡️',
    statBonus: '+30 Strength • +25 Vitality',
    isPurchased: false,
    isEquipped: false,
  },
  {
    id: 10,
    name: 'Crown of Sovereignty',
    type: 'armor',
    price: 800, // ~4 Months
    description: 'Golden crown set with glowing ruby jewels for masters of daily trials.',
    rarity: 'legendary',
    icon: '👑',
    statBonus: '+40 All Attributes • Sovereign Glow',
    isPurchased: false,
    isEquipped: false,
  },
  {
    id: 11,
    name: 'Cloak of the Sovereign',
    type: 'cloak',
    price: 45, // ~1-1.5 Weeks
    description: 'Crimson velvet mantle with gold trim that flows with momentum.',
    rarity: 'rare',
    icon: '🧣',
    statBonus: '+15 Mastery • 2x Streak Aura',
    isPurchased: false,
    isEquipped: false,
  },
  {
    id: 15,
    name: "Emperor's Astral Regalia",
    type: 'armor',
    price: 3200, // ~1 Year
    description: 'The divine ceremonial armor of the Immortal Ashen Emperor. Consecrated by a full year of unbroken habit trials.',
    rarity: 'legendary',
    icon: '🌌',
    statBonus: '+180 All Attributes • Immortal Aura',
    isPurchased: false,
    isEquipped: false,
  },

  // ==========================================
  // --- SHIELDS & RELICS ---
  // ==========================================
  {
    id: 3,
    name: 'Round Buckler Shield',
    type: 'shield',
    price: 25, // ~1 Week
    description: 'Solid oak round shield reinforced with a polished brass boss.',
    rarity: 'rare',
    icon: '🛡️',
    statBonus: '+12 Vitality • +10 Defense',
    isPurchased: false,
    isEquipped: false,
  },
  {
    id: 4,
    name: 'Crimson Health Potion',
    type: 'relic',
    price: 15, // ~3-4 Days
    description: 'Glows with restorative life essence hitched directly to your adventurer belt.',
    rarity: 'common',
    icon: '🧪',
    statBonus: '+15 Max Stamina • Fast Regen',
    isPurchased: false,
    isEquipped: false,
  },
  {
    id: 7,
    name: 'Companion Ghost Wisp',
    type: 'relic',
    price: 180, // ~1 Month
    description: 'A cute blue floating spectral pet hovering loyally beside your shoulder.',
    rarity: 'epic',
    icon: '👻',
    statBonus: '+25 Discipline • Spirit Glow',
    isPurchased: false,
    isEquipped: false,
  },
  {
    id: 14,
    name: 'Aegis of the Eternal Immortal',
    type: 'shield',
    price: 2800, // ~1 Year
    description: 'A legendary starmetal aegis carved from celestial stardust. Requires a year of triumph over life trials.',
    rarity: 'legendary',
    icon: '🔰',
    statBonus: '+150 Vitality • Absolute Guard',
    isPurchased: false,
    isEquipped: false,
  },

  // ==========================================
  // --- VIRTUAL THEMES ---
  // ==========================================
  {
    id: 20,
    name: 'Midnight Ember Theme',
    type: 'theme',
    price: 0,
    description: 'Deep obsidian shadows with glowing ember particles and solar eclipse accents.',
    rarity: 'common',
    icon: '🔥',
    statBonus: 'Theme: Dark Medieval Bonfire',
    themeClass: 'theme-midnight-ember',
    isPurchased: true,
    isEquipped: true,
  },
  {
    id: 21,
    name: 'Emerald Sanctuary Theme',
    type: 'theme',
    price: 35, // ~1 Week
    description: 'Verdant forest tones, soothing emerald ambient lighting, and calm vitality vibes.',
    rarity: 'rare',
    icon: '🌿',
    statBonus: 'Theme: Jade Forest & Serenity',
    themeClass: 'theme-emerald-sanctuary',
    isPurchased: false,
    isEquipped: false,
  },
  {
    id: 22,
    name: 'Astral Void Theme',
    type: 'theme',
    price: 150, // ~1 Month
    description: 'Deep cosmic starlight with pulsing stellar dust and arcane mystic ambiance.',
    rarity: 'epic',
    icon: '🌌',
    statBonus: 'Theme: Cosmic Constellations',
    themeClass: 'theme-astral-void',
    isPurchased: false,
    isEquipped: false,
  },
  {
    id: 23,
    name: 'Bloodforged Abyss Theme',
    type: 'theme',
    price: 220, // ~1 Month
    description: 'Fierce volcanic magma aesthetic with crimson rune flames and heavy boss aura.',
    rarity: 'epic',
    icon: '🌋',
    statBonus: 'Theme: Volcanic Crimson Magma',
    themeClass: 'theme-bloodforged-abyss',
    isPurchased: false,
    isEquipped: false,
  },
  {
    id: 24,
    name: 'Ascendant Sol Theme',
    type: 'theme',
    price: 750, // ~4 Months
    description: 'Gilded palace radiance with radiant solar rays and celebratory gold lighting.',
    rarity: 'legendary',
    icon: '☀️',
    statBonus: 'Theme: Radiant Gilded Palace',
    themeClass: 'theme-ascendant-sol',
    isPurchased: false,
    isEquipped: false,
  },
  {
    id: 25,
    name: 'Celestial Genesis Theme',
    type: 'theme',
    price: 3000, // ~1 Year
    description: 'Transcendent cosmic realm of newborn galaxies, prismatic nebulae, and eternal starlight.',
    rarity: 'legendary',
    icon: '🌠',
    statBonus: 'Theme: Celestial Genesis & Aurora',
    themeClass: 'theme-celestial-genesis',
    isPurchased: false,
    isEquipped: false,
  },

  // ==========================================
  // --- PROFILE BADGES & TITLES ---
  // ==========================================
  {
    id: 30,
    name: 'Vanquisher Crest',
    type: 'badge',
    price: 25, // ~1 Week
    description: 'Display the title "⚔️ Vanquisher of the Dark" proudly across your profile and top banner.',
    rarity: 'rare',
    icon: '⚔️',
    statBonus: 'Title: ⚔️ Vanquisher of the Dark',
    badgeTitle: '⚔️ Vanquisher of the Dark',
    isPurchased: false,
    isEquipped: false,
  },
  {
    id: 31,
    name: 'Archmage Crest',
    type: 'badge',
    price: 35, // ~1 Week
    description: 'Bestowed upon master coders, deep thinkers, and dedicated lifelong learners.',
    rarity: 'rare',
    icon: '🧠',
    statBonus: 'Title: 🧠 Archmage Scholar',
    badgeTitle: '🧠 Archmage Scholar',
    isPurchased: false,
    isEquipped: false,
  },
  {
    id: 32,
    name: 'Iron Sentinel Crest',
    type: 'badge',
    price: 120, // ~3 Weeks
    description: 'Unwavering focus, morning discipline adherence, and unbreakable resilience.',
    rarity: 'epic',
    icon: '🛡️',
    statBonus: 'Title: 🛡️ Iron Sentinel',
    badgeTitle: '🛡️ Iron Sentinel',
    isPurchased: false,
    isEquipped: false,
  },
  {
    id: 33,
    name: 'Flamekeeper Crest',
    type: 'badge',
    price: 180, // ~1 Month
    description: 'The sacred guardian of the eternal embers who never lets the bonfire die out.',
    rarity: 'epic',
    icon: '🔥',
    statBonus: 'Title: 🔥 Flamekeeper',
    badgeTitle: '🔥 Flamekeeper',
    isPurchased: false,
    isEquipped: false,
  },
  {
    id: 34,
    name: 'Mythic Conqueror Crest',
    type: 'badge',
    price: 600, // ~3 Months
    description: 'The highest honor for apex adventurers who conquer impossible daily trials.',
    rarity: 'legendary',
    icon: '👑',
    statBonus: 'Title: 👑 Mythic Conqueror',
    badgeTitle: '👑 Mythic Conqueror',
    isPurchased: false,
    isEquipped: false,
  },
  {
    id: 35,
    name: 'Diamond Will Crest',
    type: 'badge',
    price: 1000, // ~5-6 Months
    description: 'A flawless diamond badge symbolizing zero missed daily quests and iron fortitude.',
    rarity: 'legendary',
    icon: '💎',
    statBonus: 'Title: 💎 Diamond Will',
    badgeTitle: '💎 Diamond Will',
    isPurchased: false,
    isEquipped: false,
  },
  {
    id: 36,
    name: 'Godking of the Ashen Realm',
    type: 'badge',
    price: 3500, // ~1 Year
    description: 'Bestowed only upon true immortals who dedicated 365 days of relentless self-evolution.',
    rarity: 'legendary',
    icon: '🌌',
    statBonus: 'Title: 👑 Godking of the Ashen Realm',
    badgeTitle: '👑 Godking of the Ashen Realm',
    isPurchased: false,
    isEquipped: false,
  },
]

import { rollForLootDrop, type LootReward } from '../lib/lootDrops'
import { INITIAL_ACHIEVEMENTS, type Achievement } from '../lib/achievements'
import { BOSS_TIERS, getStoredBossTier, getStoredBossHp } from '../lib/bosses'
import type {
  ActiveTab,
  BossEntity,
  InventoryItem,
  Profile,
  ProfileAttribute,
  StreakInfo,
  Task,
  TaskCompletionResponse,
} from '../types/rpg'

export interface CombatLogEntry {
  id: string
  text: string
  damage: number
  type: 'player_hit' | 'boss_hit' | 'limit_break' | 'victory'
  timestamp: string
}

export interface CelebrationState {
  type: 'LEVEL_UP' | 'ITEM_PURCHASED'
  level?: number
  coinsEarned?: number
  item?: ShopItem
}

interface GameState {
  profile: Profile | null
  attributes: ProfileAttribute[]
  tasks: Task[]
  inventory: InventoryItem[]
  shopItems: ShopItem[]
  coins: number
  streakInfo: StreakInfo | null
  activeTab: ActiveTab
  sfxEnabled: boolean
  crtEnabled: boolean
  resting: boolean
  boss: BossEntity
  bossTier: number
  bossVictoryReward: { boss: BossEntity; coins: number; xp: number } | null
  heroComboCharge: number
  slashCharges: number
  combatLog: CombatLogEntry[]
  loading: boolean
  syncing: boolean
  error: string | null
  lastCompletion: TaskCompletionResponse | null
  celebration: CelebrationState | null
  lootDrop: LootReward | null
  achievements: Achievement[]
  bgmPlaying: boolean

  // Actions
  hydrate: (accessToken: string) => Promise<void>
  completeQuest: (accessToken: string, taskId: number) => Promise<TaskCompletionResponse>
  addQuest: (
    accessToken: string,
    input: { title: string; description?: string; difficulty: 1 | 2 | 3 | 4 | 5; tags?: string[]; remind_daily?: boolean }
  ) => Promise<void>
  updateQuest: (
    accessToken: string,
    taskId: number,
    updates: { title?: string; description?: string; difficulty?: 1 | 2 | 3 | 4 | 5; tags?: string[]; remind_daily?: boolean }
  ) => Promise<void>
  deleteQuest: (accessToken: string, taskId: number) => Promise<void>
  buyItem: (itemId: number) => boolean
  equipItem: (itemId: number) => void
  setActiveTab: (tab: ActiveTab) => void
  toggleSfx: () => void
  toggleCrt: () => void
  toggleBgm: () => void
  restAtBonfire: () => void
  dismissCelebration: () => void
  triggerCelebration: (data: CelebrationState) => void
  dismissLootDrop: () => void
  claimLootDrop: (loot: LootReward) => void
  claimAchievement: (achievementId: string) => void
  strikeBoss: (damage: number, sourceTitle: string) => void
  useSlashCharge: () => boolean
  unleashLimitBreak: () => void
  claimBossVictory: () => void
  dismissBossVictory: () => void
  clearError: () => void
  reset: () => void
}

const XP_BY_DIFFICULTY: Record<1 | 2 | 3 | 4 | 5, number> = {
  1: 25,
  2: 50,
  3: 90,
  4: 150,
  5: 250,
}

const getInitialBoss = (userId?: string): { boss: BossEntity; tier: number } => {
  const tier = getStoredBossTier(userId)
  const base = BOSS_TIERS.find((b) => b.tier === tier) || BOSS_TIERS[0]
  const currentHp = getStoredBossHp(base.id, base.maxHp, userId)
  return {
    tier,
    boss: {
      ...base,
      currentHp,
      isDefeated: currentHp <= 0,
    },
  }
}

function applyCompletionToProfile(current: Profile | null, result: TaskCompletionResponse): Profile | null {
  if (!current) return current
  return {
    ...current,
    current_level: result.profile.current_level,
    total_xp: result.profile.total_xp,
    progress_xp: result.profile.progress_xp,
    xp_needed_for_next: result.profile.xp_needed_for_next,
    current_streak: result.profile.current_streak,
    longest_streak: result.profile.longest_streak,
    last_activity_date: result.profile.last_activity_date,
  }
}

const getStoredCoins = (userId?: string): number => {
  if (typeof window === 'undefined') return 25
  const key = userId ? `ashen_coins_${userId}` : 'ashen_coins'
  const val = localStorage.getItem(key)
  return val !== null ? parseInt(val, 10) : 25
}

export const getStoredSlashCharges = (userId?: string): number => {
  if (typeof window === 'undefined') return 2
  const key = userId ? `ashen_slash_charges_${userId}` : 'ashen_slash_charges'
  const val = localStorage.getItem(key)
  return val !== null ? parseInt(val, 10) : 2
}

const getStoredAchievements = (userId?: string): Achievement[] => {
  if (typeof window === 'undefined') return INITIAL_ACHIEVEMENTS
  try {
    const key = userId ? `ashen_feats_${userId}` : 'ashen_feats_v2'
    const val = localStorage.getItem(key)
    if (!val) return INITIAL_ACHIEVEMENTS
    const stored: Achievement[] = JSON.parse(val)
    return INITIAL_ACHIEVEMENTS.map((item) => {
      const match = stored.find((s) => s.id === item.id)
      return match
        ? {
            ...item,
            progress: match.progress ?? item.progress,
            isUnlocked: match.isUnlocked ?? item.isUnlocked,
            unlockedAt: match.unlockedAt ?? item.unlockedAt,
          }
        : item
    })
  } catch {
    return INITIAL_ACHIEVEMENTS
  }
}

export function getItemSlot(item: ShopItem): string {
  if (item.type === 'theme') return 'theme'
  if (item.type === 'badge') return 'badge'
  if (item.type === 'weapon') return 'weapon'
  if (item.type === 'shield') return 'shield'
  if (item.type === 'cloak') return 'cloak'
  if (item.id === 2 || item.id === 6 || item.id === 10) return 'head' // Helmets, Masks, Crowns
  if (item.id === 5 || item.id === 9) return 'chest' // Vests, Chestplates
  if (item.id === 4) return 'belt' // Potion vial
  if (item.id === 7) return 'pet' // Wisp companion
  return item.type
}

function sanitizeEquippedSlots(items: ShopItem[]): ShopItem[] {
  const seenSlots = new Set<string>()
  return items.map((item) => {
    if (!item.isEquipped) return item
    const slot = getItemSlot(item)
    if (seenSlots.has(slot)) {
      return { ...item, isEquipped: false }
    }
    seenSlots.add(slot)
    return item
  })
}

const getStoredShopItems = (userId?: string): ShopItem[] => {
  if (typeof window === 'undefined') return INITIAL_SHOP_ITEMS
  try {
    const key = userId ? `ashen_shop_items_${userId}` : 'ashen_shop_items_v4'
    const val = localStorage.getItem(key)
    if (!val) return INITIAL_SHOP_ITEMS
    const stored: ShopItem[] = JSON.parse(val)
    const raw = INITIAL_SHOP_ITEMS.map((item) => {
      const match = stored.find((s) => s.id === item.id)
      return match
        ? {
            ...item,
            isPurchased: match.isPurchased ?? item.isPurchased,
            isEquipped: match.isEquipped ?? item.isEquipped,
          }
        : item
    })
    return sanitizeEquippedSlots(raw)
  } catch {
    return INITIAL_SHOP_ITEMS
  }
}

function parseTaskTags(task: Task): Task {
  if (task.tags && task.tags.length > 0) return task
  if (task.description && task.description.startsWith('[TAGS:')) {
    const match = task.description.match(/^\[TAGS:([^\]]+)\]\s*(.*)$/)
    if (match) {
      const tags = match[1].split(',').map((t) => t.trim()).filter(Boolean)
      return {
        ...task,
        tags,
        description: match[2] || null,
      }
    }
  }
  return task
}

function checkAchievementsProgress(
  currentList: Achievement[],
  stats: {
    tasksCompletedDelta?: number
    categoryTrial?: string
    currentStreak?: number
    currentLevel?: number
    coins?: number
    boughtItem?: boolean
    equippedShader?: boolean
  },
  userId?: string
): Achievement[] {
  let changed = false
  const updated = currentList.map((ach) => {
    let newProgress = ach.progress
    let unlocked = ach.isUnlocked

    if (ach.id === 'first_blood' || ach.id === 'novice_striker' || ach.id === 'veteran_slayer') {
      if (stats.tasksCompletedDelta) {
        newProgress = Math.min(ach.maxProgress, newProgress + stats.tasksCompletedDelta)
      }
    } else if (ach.id === 'coder_archmage' && stats.categoryTrial === 'Intellect') {
      newProgress = Math.min(ach.maxProgress, newProgress + 1)
    } else if (ach.id === 'iron_temple' && stats.categoryTrial === 'Strength') {
      newProgress = Math.min(ach.maxProgress, newProgress + 1)
    } else if (ach.id === 'vitality_monk' && stats.categoryTrial === 'Vitality') {
      newProgress = Math.min(ach.maxProgress, newProgress + 1)
    } else if (ach.id === 'kindled_streak' && stats.currentStreak !== undefined) {
      newProgress = Math.min(ach.maxProgress, stats.currentStreak)
    } else if (ach.id === 'unbroken_will' && stats.currentStreak !== undefined) {
      newProgress = Math.min(ach.maxProgress, stats.currentStreak)
    } else if (ach.id === 'sovereign_level' && stats.currentLevel !== undefined) {
      newProgress = Math.min(ach.maxProgress, stats.currentLevel)
    } else if (ach.id === 'patron_bazaar' && stats.boughtItem) {
      newProgress = 1
    } else if (ach.id === 'dragon_treasury' && stats.coins !== undefined) {
      newProgress = Math.min(ach.maxProgress, stats.coins)
    } else if (ach.id === 'master_shaders' && stats.equippedShader) {
      newProgress = 1
    }

    if (newProgress >= ach.maxProgress && !unlocked) {
      unlocked = true
      changed = true
      soundFx.playAchievementUnlock()
      return {
        ...ach,
        progress: newProgress,
        isUnlocked: true,
        unlockedAt: new Date().toISOString(),
      }
    }

    if (newProgress !== ach.progress) {
      changed = true
      return { ...ach, progress: newProgress }
    }
    return ach
  })

  if (changed && typeof window !== 'undefined') {
    const featsKey = userId ? `ashen_feats_${userId}` : 'ashen_feats_v2'
    localStorage.setItem(featsKey, JSON.stringify(updated))
  }
  return updated
}

const initialBossData = getInitialBoss()

export const useGameStore = create<GameState>((set, get) => ({
  profile: null,
  attributes: [],
  tasks: [],
  inventory: [],
  shopItems: getStoredShopItems(),
  coins: getStoredCoins(),
  achievements: getStoredAchievements(),
  lootDrop: null,
  bgmPlaying: false,
  streakInfo: null,
  activeTab: 'sanctuary',
  sfxEnabled: true,
  crtEnabled: false,
  resting: false,
  boss: initialBossData.boss,
  bossTier: initialBossData.tier,
  bossVictoryReward: null,
  heroComboCharge: 35,
  slashCharges: getStoredSlashCharges(),
  combatLog: [
    {
      id: 'log_init',
      text: '⚔️ Entered the Abyss Arena. The World Boss stirs!',
      damage: 0,
      type: 'boss_hit',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ],
  loading: false,
  syncing: false,
  error: null,
  lastCompletion: null,
  celebration: null,

  setActiveTab: (tab) => {
    soundFx.playClick()
    set({ activeTab: tab })
  },

  dismissCelebration: () => {
    soundFx.playClick()
    set({ celebration: null })
  },

  triggerCelebration: (data) => {
    if (data.type === 'LEVEL_UP') {
      soundFx.playLevelUp()
    } else if (data.type === 'ITEM_PURCHASED') {
      soundFx.playPurchaseSound()
    }
    set({ celebration: data })
  },

  dismissLootDrop: () => {
    soundFx.playClick()
    set({ lootDrop: null })
  },

  claimLootDrop: (loot: LootReward) => {
    const currentCoins = get().coins
    const addedCoins = loot.rewardCoins || 0
    const addedXP = loot.rewardXP || 0
    const newCoins = currentCoins + addedCoins

    const currentProfile = get().profile
    let updatedProfile = currentProfile
    if (currentProfile && addedXP > 0) {
      const gained = applyXPGain(currentProfile.current_level, currentProfile.total_xp, addedXP)
      updatedProfile = {
        ...currentProfile,
        current_level: gained.newLevel,
        total_xp: gained.newTotalXP,
        progress_xp: gained.progressXP,
        xp_needed_for_next: gained.xpNeededForNext,
        coins: newCoins,
      }
    } else if (currentProfile) {
      updatedProfile = { ...currentProfile, coins: newCoins }
    }

    let updatedAttributes = get().attributes
    if (loot.rewardAttribute) {
      const attrName = loot.rewardAttribute.name.toLowerCase()
      const attrXP = loot.rewardAttribute.xp
      updatedAttributes = updatedAttributes.map((attr) => {
        if ((attr.attribute_name ?? '').toLowerCase() === attrName) {
          const gained = applyAttributeXPGain(attr.attribute_value, Number(attr.attribute_xp), attrXP)
          return {
            ...attr,
            attribute_value: gained.newValue,
            attribute_xp: gained.newXP,
          }
        }
        return attr
      })
    }

    const userId = get().profile?.id
    if (typeof window !== 'undefined') {
      const coinKey = userId ? `ashen_coins_${userId}` : 'ashen_coins'
      localStorage.setItem(coinKey, String(newCoins))
    }

    const token = useAuthStore.getState().accessToken
    if (token && token !== PREVIEW_TOKEN) {
      rpgApi.updateProfile(token, { coins: newCoins }).catch(() => {})
    }

    const updatedAchievements = checkAchievementsProgress(
      get().achievements,
      { coins: newCoins },
      userId
    )

    set({
      coins: newCoins,
      profile: updatedProfile,
      attributes: updatedAttributes,
      achievements: updatedAchievements,
      lootDrop: null,
    })
  },

  claimAchievement: (achievementId: string) => {
    const currentAchievements = get().achievements
    const target = currentAchievements.find((a) => a.id === achievementId)
    if (!target || !target.isUnlocked) return

    soundFx.playAchievementUnlock()
    const addedCoins = target.rewardCoins
    const addedXP = target.rewardXP
    const newCoins = get().coins + addedCoins

    const currentProfile = get().profile
    let updatedProfile = currentProfile
    if (currentProfile && addedXP > 0) {
      const gained = applyXPGain(currentProfile.current_level, currentProfile.total_xp, addedXP)
      updatedProfile = {
        ...currentProfile,
        current_level: gained.newLevel,
        total_xp: gained.newTotalXP,
        progress_xp: gained.progressXP,
        xp_needed_for_next: gained.xpNeededForNext,
        coins: newCoins,
      }
    }

    const updatedAchievements = currentAchievements.map((a) =>
      a.id === achievementId ? { ...a, progress: a.maxProgress } : a
    )

    const userId = get().profile?.id
    if (typeof window !== 'undefined') {
      const coinKey = userId ? `ashen_coins_${userId}` : 'ashen_coins'
      const featsKey = userId ? `ashen_feats_${userId}` : 'ashen_feats_v2'
      localStorage.setItem(coinKey, String(newCoins))
      localStorage.setItem(featsKey, JSON.stringify(updatedAchievements))
    }

    set({
      coins: newCoins,
      profile: updatedProfile,
      achievements: updatedAchievements,
    })
  },

  toggleSfx: () => {
    const next = !get().sfxEnabled
    soundFx.enabled = next
    if (next) soundFx.playClick()
    set({ sfxEnabled: next })
  },

  toggleCrt: () => {
    soundFx.playClick()
    set((s) => ({ crtEnabled: !s.crtEnabled }))
  },

  toggleBgm: () => {
    const playing = soundFx.toggleBGM()
    set({ bgmPlaying: playing })
  },

  strikeBoss: (damage: number, sourceTitle: string) => {
    soundFx.playSwordSlash()
    soundFx.playBossHit()

    const currentBoss = get().boss
    const newHp = Math.max(0, currentBoss.currentHp - damage)
    const isSlayed = newHp === 0
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

    const newLogEntry: CombatLogEntry = {
      id: `log_${Date.now()}`,
      text: `🗡️ ${sourceTitle} struck ${currentBoss.name} for -${damage} HP!`,
      damage,
      type: 'player_hit',
      timestamp: timeStr,
    }

    const userId = get().profile?.id
    if (typeof window !== 'undefined') {
      const bossHpKey = userId ? `ashen_boss_hp_${currentBoss.id}_${userId}` : `ashen_boss_hp_${currentBoss.id}`
      localStorage.setItem(bossHpKey, String(newHp))
    }

    if (isSlayed) {
      soundFx.playVictoryFanfare()
      const victoryEntry: CombatLogEntry = {
        id: `log_vic_${Date.now()}`,
        text: `👑 VICTORY! ${currentBoss.name} has been vanquished!`,
        damage: 0,
        type: 'victory',
        timestamp: timeStr,
      }
      set({
        boss: { ...currentBoss, currentHp: 0, isDefeated: true },
        bossVictoryReward: {
          boss: currentBoss,
          coins: currentBoss.bountyCoins,
          xp: currentBoss.bountyXp,
        },
        combatLog: [victoryEntry, newLogEntry, ...get().combatLog.slice(0, 15)],
      })
    } else {
      set((s) => ({
        boss: { ...s.boss, currentHp: newHp },
        heroComboCharge: Math.min(100, s.heroComboCharge + 15),
        combatLog: [newLogEntry, ...s.combatLog.slice(0, 15)],
      }))
    }
  },

  useSlashCharge: () => {
    const charges = get().slashCharges
    const currentBoss = get().boss
    if (charges <= 0 || currentBoss.currentHp <= 0) return false

    soundFx.playSwordSlash()
    soundFx.playBossHit()

    const newCharges = charges - 1
    const userId = get().profile?.id
    if (typeof window !== 'undefined') {
      const slashKey = userId ? `ashen_slash_charges_${userId}` : 'ashen_slash_charges'
      localStorage.setItem(slashKey, String(newCharges))
    }

    const equippedWeapon = get().shopItems.find((i) => i.isEquipped && i.type === 'weapon')
    const damage = 35 + (equippedWeapon ? 30 : 0)
    const newHp = Math.max(0, currentBoss.currentHp - damage)
    const isSlayed = newHp === 0
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

    const logEntry: CombatLogEntry = {
      id: `log_slash_${Date.now()}`,
      text: `🗡️ Work-Earned Hero Slash struck ${currentBoss.name} for -${damage} HP! (1 charge used, ${newCharges} left)`,
      damage,
      type: 'player_hit',
      timestamp: timeStr,
    }

    if (typeof window !== 'undefined') {
      const bossHpKey = userId ? `ashen_boss_hp_${currentBoss.id}_${userId}` : `ashen_boss_hp_${currentBoss.id}`
      localStorage.setItem(bossHpKey, String(newHp))
    }

    if (isSlayed) {
      soundFx.playVictoryFanfare()
      const victoryEntry: CombatLogEntry = {
        id: `log_vic_${Date.now()}`,
        text: `👑 VICTORY! ${currentBoss.name} has been vanquished!`,
        damage: 0,
        type: 'victory',
        timestamp: timeStr,
      }
      set({
        slashCharges: newCharges,
        boss: { ...currentBoss, currentHp: 0, isDefeated: true },
        bossVictoryReward: {
          boss: currentBoss,
          coins: currentBoss.bountyCoins,
          xp: currentBoss.bountyXp,
        },
        heroComboCharge: 100,
        combatLog: [victoryEntry, logEntry, ...get().combatLog.slice(0, 15)],
      })
    } else {
      set((s) => ({
        slashCharges: newCharges,
        boss: { ...s.boss, currentHp: newHp },
        heroComboCharge: Math.min(100, s.heroComboCharge + 15),
        combatLog: [logEntry, ...s.combatLog.slice(0, 15)],
      }))
    }
    return true
  },

  unleashLimitBreak: () => {
    if (get().heroComboCharge < 100) return
    soundFx.playSpellBurst()
    soundFx.playBossHit()

    const currentBoss = get().boss
    const damage = Math.round(currentBoss.maxHp * 0.35) // Deals 35% of boss max HP
    const newHp = Math.max(0, currentBoss.currentHp - damage)
    const isSlayed = newHp === 0
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

    const limitLogEntry: CombatLogEntry = {
      id: `log_limit_${Date.now()}`,
      text: `⚡ HERO LIMIT BREAK: Solar Arcane Cleave dealt massive -${damage} HP to ${currentBoss.name}!`,
      damage,
      type: 'limit_break',
      timestamp: timeStr,
    }

    const userId = get().profile?.id
    if (typeof window !== 'undefined') {
      const bossHpKey = userId ? `ashen_boss_hp_${currentBoss.id}_${userId}` : `ashen_boss_hp_${currentBoss.id}`
      localStorage.setItem(bossHpKey, String(newHp))
    }

    if (isSlayed) {
      soundFx.playVictoryFanfare()
      set({
        boss: { ...currentBoss, currentHp: 0, isDefeated: true },
        heroComboCharge: 0,
        bossVictoryReward: {
          boss: currentBoss,
          coins: currentBoss.bountyCoins,
          xp: currentBoss.bountyXp,
        },
        combatLog: [limitLogEntry, ...get().combatLog.slice(0, 15)],
      })
    } else {
      set((s) => ({
        boss: { ...s.boss, currentHp: newHp },
        heroComboCharge: 0,
        combatLog: [limitLogEntry, ...s.combatLog.slice(0, 15)],
      }))
    }
  },

  dismissBossVictory: () => {
    soundFx.playClick()
    set({ bossVictoryReward: null })
  },

  claimBossVictory: () => {
    const reward = get().bossVictoryReward
    if (!reward) return

    soundFx.playPurchaseSound()
    const addedCoins = reward.coins
    const addedXP = reward.xp
    const newCoins = get().coins + addedCoins

    const currentProfile = get().profile
    let updatedProfile = currentProfile
    if (currentProfile) {
      const gained = applyXPGain(currentProfile.current_level, currentProfile.total_xp, addedXP)
      updatedProfile = {
        ...currentProfile,
        current_level: gained.newLevel,
        total_xp: gained.newTotalXP,
        progress_xp: gained.progressXP,
        xp_needed_for_next: gained.xpNeededForNext,
        coins: newCoins,
      }
    }

    // Advance to next boss tier
    const nextTier = (reward.boss.tier % BOSS_TIERS.length) + 1
    const nextBossBase = BOSS_TIERS.find((b) => b.tier === nextTier) || BOSS_TIERS[0]
    const nextBoss: BossEntity = {
      ...nextBossBase,
      currentHp: nextBossBase.maxHp,
      isDefeated: false,
    }

    const userId = get().profile?.id
    if (typeof window !== 'undefined') {
      const coinKey = userId ? `ashen_coins_${userId}` : 'ashen_coins'
      const tierKey = userId ? `ashen_boss_tier_${userId}` : 'ashen_boss_tier'
      const bossHpKey = userId ? `ashen_boss_hp_${nextBoss.id}_${userId}` : `ashen_boss_hp_${nextBoss.id}`
      localStorage.setItem(coinKey, String(newCoins))
      localStorage.setItem(tierKey, String(nextTier))
      localStorage.setItem(bossHpKey, String(nextBoss.maxHp))
    }

    const token = useAuthStore.getState().accessToken
    if (token && token !== PREVIEW_TOKEN) {
      rpgApi.updateProfile(token, { coins: newCoins }).catch(() => {})
    }

    set({
      coins: newCoins,
      profile: updatedProfile,
      boss: nextBoss,
      bossTier: nextTier,
      bossVictoryReward: null,
      heroComboCharge: 20,
      combatLog: [
        {
          id: `log_next_${Date.now()}`,
          text: `🔥 Tier ${nextTier} World Boss ${nextBoss.name} has emerged in the Abyss!`,
          damage: 0,
          type: 'boss_hit',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
        ...get().combatLog.slice(0, 10),
      ],
    })
  },

  restAtBonfire: () => {
    soundFx.playBonfireRest()
    set({ resting: true })
    setTimeout(() => {
      set({ resting: false })
    }, 1500)
  },

  buyItem: (itemId: number) => {
    const item = get().shopItems.find((i) => i.id === itemId)
    if (!item || item.isPurchased) return false
    const currentCoins = get().coins
    if (currentCoins < item.price) {
      set({ error: `Not enough gold coins! Requires ${item.price} coins.` })
      return false
    }

    const newCoins = currentCoins - item.price
    const targetSlot = getItemSlot(item)
    const updatedShop = get().shopItems.map((i) => {
      if (i.id === itemId) {
        return { ...i, isPurchased: true, isEquipped: true }
      }
      if (getItemSlot(i) === targetSlot) {
        return { ...i, isEquipped: false }
      }
      return i
    })

    // Add to inventory
    const newInvItem: InventoryItem = {
      inventory_id: Date.now(),
      profile_id: get().profile?.id ?? 'hero',
      item_id: item.id,
      item_name: item.name,
      item_type: item.type,
      description: item.description,
      rarity: item.rarity,
      quantity: 1,
      acquired_at: new Date().toISOString(),
      equipped: true,
    }

    soundFx.playPurchaseSound()
    const userId = get().profile?.id
    const activeTheme = item.type === 'theme' ? (item.themeClass || 'theme-midnight-ember') : get().profile?.active_theme
    const activeBadge = item.type === 'badge' ? (item.badgeTitle || item.name) : get().profile?.active_badge

    if (typeof window !== 'undefined') {
      const coinKey = userId ? `ashen_coins_${userId}` : 'ashen_coins'
      const shopKey = userId ? `ashen_shop_items_${userId}` : 'ashen_shop_items_v4'
      localStorage.setItem(coinKey, String(newCoins))
      localStorage.setItem(shopKey, JSON.stringify(updatedShop))
      if (item.type === 'theme') {
        localStorage.setItem(`ashen_theme_${userId || 'default'}`, activeTheme || 'theme-midnight-ember')
      }
      if (item.type === 'badge') {
        localStorage.setItem(`ashen_badge_${userId || 'default'}`, activeBadge || '')
      }
    }

    // Persist to PostgreSQL database in background
    const token = useAuthStore.getState().accessToken
    if (token && token !== PREVIEW_TOKEN) {
      rpgApi.updateProfile(token, {
        coins: newCoins,
        equipped_gear: updatedShop,
        active_theme: activeTheme,
        active_badge: activeBadge,
      }).catch(() => { })
    }

    const updatedAchievements = checkAchievementsProgress(
      get().achievements,
      { boughtItem: true, coins: newCoins },
      userId
    )

    set({
      coins: newCoins,
      shopItems: updatedShop,
      inventory: [newInvItem, ...get().inventory.map((inv) => {
        const matchingShop = get().shopItems.find((s) => s.id === inv.item_id)
        if (matchingShop && getItemSlot(matchingShop) === targetSlot) {
          return { ...inv, equipped: false }
        }
        return inv
      })],
      achievements: updatedAchievements,
      profile: get().profile ? {
        ...get().profile!,
        coins: newCoins,
        active_theme: activeTheme,
        active_badge: activeBadge,
      } : null,
      celebration: {
        type: 'ITEM_PURCHASED',
        item: { ...item, isPurchased: true, isEquipped: true },
      },
      error: null,
    })
    return true
  },

  equipItem: (itemId: number) => {
    soundFx.playClick()
    const target = get().shopItems.find((i) => i.id === itemId)
    if (!target || !target.isPurchased) return

    const nextEquipped = !target.isEquipped
    const targetSlot = getItemSlot(target)

    const updatedShop = get().shopItems.map((i) => {
      if (i.id === itemId) {
        return { ...i, isEquipped: nextEquipped }
      }
      if (nextEquipped && getItemSlot(i) === targetSlot) {
        return { ...i, isEquipped: false }
      }
      return i
    })

    const updatedInv = get().inventory.map((inv) => {
      if (inv.item_id === itemId) {
        return { ...inv, equipped: nextEquipped }
      }
      const matchItem = get().shopItems.find((s) => s.id === inv.item_id)
      if (nextEquipped && matchItem && getItemSlot(matchItem) === targetSlot) {
        return { ...inv, equipped: false }
      }
      return inv
    })

    let activeTheme = get().profile?.active_theme || 'theme-midnight-ember'
    if (target.type === 'theme') {
      activeTheme = nextEquipped ? (target.themeClass || 'theme-midnight-ember') : 'theme-midnight-ember'
    }

    let activeBadge = get().profile?.active_badge || ''
    if (target.type === 'badge') {
      activeBadge = nextEquipped ? (target.badgeTitle || target.name) : ''
    }

    const userId = get().profile?.id
    if (typeof window !== 'undefined') {
      const shopKey = userId ? `ashen_shop_items_${userId}` : 'ashen_shop_items_v4'
      localStorage.setItem(shopKey, JSON.stringify(updatedShop))
      if (target.type === 'theme') {
        localStorage.setItem(`ashen_theme_${userId || 'default'}`, activeTheme)
      }
      if (target.type === 'badge') {
        localStorage.setItem(`ashen_badge_${userId || 'default'}`, activeBadge)
      }
    }

    // Persist to PostgreSQL database in background
    const token = useAuthStore.getState().accessToken
    if (token && token !== PREVIEW_TOKEN) {
      rpgApi.updateProfile(token, {
        equipped_gear: updatedShop,
        active_theme: activeTheme,
        active_badge: activeBadge,
      }).catch(() => { })
    }

    const updatedAchievements = checkAchievementsProgress(
      get().achievements,
      { equippedShader: nextEquipped && (target.type === 'theme' || target.type === 'badge') },
      userId
    )

    set({
      shopItems: updatedShop,
      inventory: updatedInv,
      achievements: updatedAchievements,
      profile: get().profile ? {
        ...get().profile!,
        active_theme: activeTheme,
        active_badge: activeBadge,
      } : null,
    })
  },

  clearError: () => set({ error: null }),

  hydrate: async (accessToken) => {
    if (accessToken === PREVIEW_TOKEN) {
      const localCoins = getStoredCoins('preview')
      const localShop = getStoredShopItems('preview')
      const localSlashCharges = getStoredSlashCharges('preview')
      const localTheme = typeof window !== 'undefined' ? localStorage.getItem('ashen_theme_preview') || 'theme-midnight-ember' : 'theme-midnight-ember'
      const localBadge = typeof window !== 'undefined' ? localStorage.getItem('ashen_badge_preview') || '' : ''
      set({
        profile: { ...previewProfile, coins: localCoins, active_theme: localTheme, active_badge: localBadge },
        coins: localCoins,
        shopItems: localShop,
        slashCharges: localSlashCharges,
        tasks: previewTasks,
        attributes: previewAttributes,
        inventory: [
          {
            inventory_id: 1,
            profile_id: 'preview',
            item_id: 1,
            item_name: 'Silver Adventurer Sword',
            item_type: 'weapon',
            description: 'Forged tempered iron shortsword. Adds clean strike damage to your character.',
            rarity: 'rare',
            quantity: 1,
            acquired_at: new Date().toISOString(),
            equipped: true,
          },
        ],
        loading: false,
        error: null,
      })
      return
    }

    set({ loading: true, error: null })
    try {
      const [profile, tasks, attributes, streakInfo, inventory] = await Promise.all([
        rpgApi.getProfile(accessToken),
        rpgApi.getTasks(accessToken),
        rpgApi.getAttributes(accessToken).catch(() => [] as ProfileAttribute[]),
        rpgApi.getStreak(accessToken).catch(() => null),
        rpgApi.getInventory(accessToken).catch(() => [] as InventoryItem[]),
      ])

      // Sync coins & shop items from database profile for the authenticated user
      const userId = profile.id
      let syncedCoins = profile.coins !== undefined && profile.coins !== null ? profile.coins : getStoredCoins(userId)
      let syncedShop = getStoredShopItems(userId)
      const syncedSlashCharges = getStoredSlashCharges(userId)

      if (profile.coins !== undefined && profile.coins !== null) {
        syncedCoins = profile.coins
        if (typeof window !== 'undefined') {
          localStorage.setItem(`ashen_coins_${userId}`, String(syncedCoins))
        }
      }

      if (profile.equipped_gear && Array.isArray(profile.equipped_gear) && profile.equipped_gear.length > 0) {
        syncedShop = INITIAL_SHOP_ITEMS.map((item) => {
          const dbItem = profile.equipped_gear?.find((i: any) => i.id === item.id)
          return dbItem ? { ...item, isPurchased: !!dbItem.isPurchased, isEquipped: !!dbItem.isEquipped } : item
        })
        if (typeof window !== 'undefined') {
          localStorage.setItem(`ashen_shop_items_${userId}`, JSON.stringify(syncedShop))
        }
      }

      set({
        profile,
        coins: syncedCoins,
        shopItems: syncedShop,
        slashCharges: syncedSlashCharges,
        tasks: tasks.map(parseTaskTags),
        attributes,
        streakInfo,
        inventory,
        loading: false,
      })
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        void useAuthStore.getState().signOut()
        return
      }
      const message = error instanceof Error ? error.message : 'Failed to sync with the Life RPG API.'
      set({ error: message, loading: false })
    }
  },

  completeQuest: async (accessToken, taskId) => {
    const snapshot = get().tasks
    const target = snapshot.find((task) => task.task_id === taskId)
    if (!target) throw new Error('Quest not found.')

    soundFx.playBossHit()

    // Boss damage calculation with equipped weapon bonus
    const equippedWeapon = get().shopItems.find((i) => i.isEquipped && i.type === 'weapon')
    const weaponBonus = equippedWeapon ? 30 : 0
    const damage = Math.max(20, target.xp_reward) + weaponBonus
    const currentBoss = get().boss
    const newBossHp = Math.max(0, currentBoss.currentHp - damage)
    const isSlayed = newBossHp === 0
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

    const questCombatLog: CombatLogEntry = {
      id: `log_quest_${Date.now()}`,
      text: `⚔️ Completed "${target.title}" and slashed ${currentBoss.name} for -${damage} HP!`,
      damage,
      type: 'player_hit',
      timestamp: timeStr,
    }

    const userId = get().profile?.id
    if (typeof window !== 'undefined') {
      const bossHpKey = userId ? `ashen_boss_hp_${currentBoss.id}_${userId}` : `ashen_boss_hp_${currentBoss.id}`
      localStorage.setItem(bossHpKey, String(newBossHp))
    }

    if (isSlayed) {
      soundFx.playVictoryFanfare()
      const vicLog: CombatLogEntry = {
        id: `log_vic_${Date.now()}`,
        text: `👑 VICTORY! ${currentBoss.name} has been vanquished!`,
        damage: 0,
        type: 'victory',
        timestamp: timeStr,
      }
      set((s) => ({
        boss: { ...s.boss, currentHp: 0, isDefeated: true },
        bossVictoryReward: {
          boss: currentBoss,
          coins: currentBoss.bountyCoins,
          xp: currentBoss.bountyXp,
        },
        heroComboCharge: 100,
        combatLog: [vicLog, questCombatLog, ...s.combatLog.slice(0, 15)],
      }))
    } else {
      set((s) => ({
        boss: { ...s.boss, currentHp: newBossHp },
        heroComboCharge: Math.min(100, s.heroComboCharge + 25),
        combatLog: [questCombatLog, ...s.combatLog.slice(0, 15)],
      }))
    }

    set({
      syncing: true,
      error: null,
      tasks: snapshot.map((task) =>
        task.task_id === taskId ? { ...task, status: 'completed' } : task
      ),
    })

    try {
      const attrBonuses = categorizeTaskAttributes(target.title, target.tags, target.difficulty)
      const currentAttributes = get().attributes
      const updatedAttributes = currentAttributes.map((attr) => {
        const match = attrBonuses.find((b) => b.attributeName.toLowerCase() === (attr.attribute_name ?? '').toLowerCase())
        if (match) {
          const gained = applyAttributeXPGain(attr.attribute_value, Number(attr.attribute_xp), match.xpValue)
          return {
            ...attr,
            attribute_value: gained.newValue,
            attribute_xp: gained.newXP,
          }
        }
        return attr
      })

      // Determine flame evolution streak multiplier (Novice: 1.0x, Kindled: 1.1x, Astral: 1.25x, Solar: 1.5x)
      const currentStreak = get().profile?.current_streak ?? 0
      const streakMultiplier = currentStreak >= 14 ? 1.5 : currentStreak >= 7 ? 1.25 : currentStreak >= 3 ? 1.1 : 1.0
      const effectiveXp = Math.round(target.xp_reward * streakMultiplier)
      const droppedLoot = rollForLootDrop(target.difficulty)
      const mainAttr = attrBonuses.length > 0 ? attrBonuses[0].attributeName : ''

      if (accessToken === PREVIEW_TOKEN) {
        const current = get().profile ?? previewProfile
        const gained = applyXPGain(current.current_level, current.total_xp, effectiveXp)

        // Coins economy: +1 coin per task + 5 coins per level up
        const earnedCoins = 1 + (gained.levelsGained * 5)
        const updatedCoins = get().coins + earnedCoins
        const nextStreak = current.current_streak + 1

        // Slash Charges Economy: 1 slash per 50 XP gained from work
        const slashesEarned = Math.max(1, Math.floor(effectiveXp / 50))
        const updatedSlashCharges = get().slashCharges + slashesEarned

        if (typeof window !== 'undefined') {
          localStorage.setItem('ashen_coins', String(updatedCoins))
          localStorage.setItem('ashen_slash_charges', String(updatedSlashCharges))
        }

        soundFx.playCoinSound()
        if (gained.levelsGained > 0) {
          setTimeout(() => soundFx.playLevelUp(), 400)
        }

        const updatedAchievements = checkAchievementsProgress(
          get().achievements,
          {
            tasksCompletedDelta: 1,
            categoryTrial: mainAttr,
            currentStreak: nextStreak,
            currentLevel: gained.newLevel,
            coins: updatedCoins,
          },
          'preview'
        )

        const result: TaskCompletionResponse = {
          message: gained.levelsGained > 0
            ? `🎉 Level Up! (+${gained.levelsGained * 5} Coins, +${slashesEarned} Hero Slashes)`
            : streakMultiplier > 1.0
              ? `Quest complete. +${effectiveXp} XP (${streakMultiplier}x Flame Streak Bonus!) • +${slashesEarned} Hero Slash`
              : `Quest complete. (+1 Coin, +${slashesEarned} Hero Slash)`,
          task: { task_id: target.task_id, title: target.title, xp_awarded: effectiveXp },
          profile: {
            id: current.id,
            current_level: gained.newLevel,
            total_xp: gained.newTotalXP,
            levels_gained: gained.levelsGained,
            progress_xp: gained.progressXP,
            xp_needed_for_next: gained.xpNeededForNext,
            current_streak: nextStreak,
            longest_streak: Math.max(current.longest_streak, nextStreak),
            last_activity_date: new Date().toISOString().slice(0, 10),
          },
        }

        set({
          coins: updatedCoins,
          slashCharges: updatedSlashCharges,
          attributes: updatedAttributes,
          achievements: updatedAchievements,
          lootDrop: droppedLoot,
          lastCompletion: result,
          celebration: gained.levelsGained > 0 ? {
            type: 'LEVEL_UP',
            level: gained.newLevel,
            coinsEarned: gained.levelsGained * 5,
          } : null,
          syncing: false,
          profile: applyCompletionToProfile(current, result),
        })
        return result
      }

      const result = await rpgApi.completeTask(accessToken, taskId)

      // Coins economy: +1 coin per task + 5 coins per level up
      const levelsGained = result.profile.levels_gained || 0
      const earnedCoins = 1 + (levelsGained * 5)
      const updatedCoins = get().coins + earnedCoins
      const userId = get().profile?.id

      // Slash Charges Economy: 1 slash per 50 XP gained from work
      const slashesEarned = Math.max(1, Math.floor(effectiveXp / 50))
      const updatedSlashCharges = get().slashCharges + slashesEarned

      if (typeof window !== 'undefined') {
        const coinKey = userId ? `ashen_coins_${userId}` : 'ashen_coins'
        const slashKey = userId ? `ashen_slash_charges_${userId}` : 'ashen_slash_charges'
        localStorage.setItem(coinKey, String(updatedCoins))
        localStorage.setItem(slashKey, String(updatedSlashCharges))
      }

      soundFx.playCoinSound()
      if (levelsGained > 0) {
        setTimeout(() => soundFx.playLevelUp(), 400)
      }

      // Persist coins to PostgreSQL database in background
      rpgApi.updateProfile(accessToken, { coins: updatedCoins }).catch(() => { })

      // Reconcile attributes from server response or local advancements
      const finalAttributes = result.attribute_advancements && result.attribute_advancements.length > 0
        ? currentAttributes.map((attr) => {
            const adv = result.attribute_advancements?.find((a) => a.attribute_id === attr.attribute_id)
            return adv ? { ...attr, attribute_value: adv.new_value, attribute_xp: adv.new_xp } : attr
          })
        : updatedAttributes

      const updatedAchievements = checkAchievementsProgress(
        get().achievements,
        {
          tasksCompletedDelta: 1,
          categoryTrial: mainAttr,
          currentStreak: result.profile.current_streak,
          currentLevel: result.profile.current_level,
          coins: updatedCoins,
        },
        userId
      )

      set({
        coins: updatedCoins,
        slashCharges: updatedSlashCharges,
        attributes: finalAttributes,
        achievements: updatedAchievements,
        lootDrop: droppedLoot,
        lastCompletion: result,
        celebration: levelsGained > 0 ? {
          type: 'LEVEL_UP',
          level: result.profile.current_level,
          coinsEarned: levelsGained * 5,
        } : null,
        syncing: false,
        profile: applyCompletionToProfile(get().profile, result),
      })
      return result
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Could not complete quest.'
      set({ tasks: snapshot, error: message, syncing: false })
      throw error
    }
  },

  addQuest: async (accessToken, input) => {
    soundFx.playClick()
    const tempId = Date.now()
    const optimisticTask: Task = {
      task_id: tempId,
      profile_id: get().profile?.id ?? 'hero',
      title: input.title,
      description: input.description ?? null,
      difficulty: input.difficulty,
      xp_reward: XP_BY_DIFFICULTY[input.difficulty],
      status: 'active',
      remind_daily: input.remind_daily ?? false,
      due_date: null,
      created_at: new Date().toISOString(),
      tags: input.tags ?? [],
    }

    // Instantly append to state for zero-latency client response
    set({ tasks: [optimisticTask, ...get().tasks], syncing: false, error: null })

    if (accessToken === PREVIEW_TOKEN) return

    try {
      // Encode tags into description if present so it persists in backend
      let finalDescription = input.description || ''
      if (input.tags && input.tags.length > 0) {
        const tagPrefix = `[TAGS:${input.tags.join(',')}]`
        finalDescription = finalDescription ? `${tagPrefix} ${finalDescription}` : tagPrefix
      }

      const created = await rpgApi.createTask(accessToken, {
        title: input.title,
        description: finalDescription || undefined,
        difficulty: input.difficulty,
        xp_reward: XP_BY_DIFFICULTY[input.difficulty],
        status: 'active',
        remind_daily: input.remind_daily,
      })

      // Silently reconcile temporary task with server record
      set((s) => ({
        tasks: s.tasks.map((t) =>
          t.task_id === tempId ? { ...created, tags: input.tags ?? [] } : t
        ),
      }))
    } catch (error) {
      // Revert optimistic task on failure
      set((s) => ({
        tasks: s.tasks.filter((t) => t.task_id !== tempId),
        error: 'Failed to record quest to database. Please check connection.',
      }))
      throw error
    }
  },

  updateQuest: async (accessToken, taskId, updates) => {
    const previousTasks = get().tasks
    const xpReward = updates.difficulty ? XP_BY_DIFFICULTY[updates.difficulty] : undefined

    let finalDescription = updates.description
    if (updates.tags && updates.tags.length > 0) {
      const tagPrefix = `[TAGS:${updates.tags.join(',')}]`
      finalDescription = finalDescription ? `${tagPrefix} ${finalDescription}` : tagPrefix
    }

    // Optimistic local update
    set((s) => ({
      tasks: s.tasks.map((t) =>
        t.task_id === taskId
          ? {
              ...t,
              ...updates,
              xp_reward: xpReward ?? t.xp_reward,
              description: finalDescription ?? t.description,
            }
          : t
      ),
    }))

    if (accessToken === PREVIEW_TOKEN) return

    try {
      await rpgApi.updateTask(accessToken, taskId, {
        title: updates.title,
        description: finalDescription,
        difficulty: updates.difficulty,
        xp_reward: xpReward,
        remind_daily: updates.remind_daily,
      })
    } catch (err) {
      // Rollback on failure
      set({ tasks: previousTasks, error: 'Failed to update quest in database.' })
      throw err
    }
  },

  deleteQuest: async (accessToken, taskId) => {
    const previousTasks = get().tasks
    soundFx.playClick()

    // Optimistic removal
    set((s) => ({
      tasks: s.tasks.filter((t) => t.task_id !== taskId),
    }))

    if (accessToken === PREVIEW_TOKEN) return

    try {
      await rpgApi.deleteTask(accessToken, taskId)
    } catch (err) {
      // Rollback on failure
      set({ tasks: previousTasks, error: 'Failed to remove quest from database.' })
      throw err
    }
  },

  reset: () => {
    const initialBoss = getInitialBoss()
    set({
      profile: null,
      attributes: [],
      tasks: [],
      inventory: [],
      shopItems: INITIAL_SHOP_ITEMS,
      coins: 25,
      achievements: INITIAL_ACHIEVEMENTS,
      lootDrop: null,
      bgmPlaying: false,
      streakInfo: null,
      boss: initialBoss.boss,
      bossTier: initialBoss.tier,
      bossVictoryReward: null,
      heroComboCharge: 0,
      slashCharges: 0,
      combatLog: [],
      loading: false,
      syncing: false,
      error: null,
      lastCompletion: null,
      celebration: null,
    })
  },
}))


