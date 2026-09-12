import { create } from 'zustand'
import { rpgApi, ApiError } from '../lib/api'
import { applyXPGain, applyAttributeXPGain } from '../lib/progression'
import { categorizeTaskAttributes } from '../lib/attributeMapping'
import { soundFx } from '../lib/audio'
import { PREVIEW_TOKEN, previewAttributes, previewProfile, previewTasks } from '../lib/previewData'
import { useAuthStore } from './authStore'
import type {
  ActiveTab,
  InventoryItem,
  Profile,
  ProfileAttribute,
  StreakInfo,
  Task,
  TaskCompletionResponse,
} from '../types/rpg'

export interface BossState {
  name: string
  title: string
  maxHp: number
  currentHp: number
  isDefeated: boolean
}

import type { ShopItem } from '../types/rpg'

export const INITIAL_SHOP_ITEMS: ShopItem[] = [
  // --- WEAPONS & COMBAT GEAR ---
  {
    id: 1,
    name: 'Silver Adventurer Sword',
    type: 'weapon',
    price: 20,
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
    price: 90,
    description: 'Ancient wooden polearm featuring an incandescent ember lantern on a brass hook.',
    rarity: 'legendary',
    icon: '🏮',
    statBonus: '+35 Mastery • Dark Vision',
    isPurchased: false,
    isEquipped: false,
  },
  {
    id: 12,
    name: 'Sunfire Greatsword',
    type: 'weapon',
    price: 120,
    description: 'A colossal two-handed blade bathed in eternal solar flame.',
    rarity: 'legendary',
    icon: '⚔️',
    statBonus: '+50 Strength • Sunbeam Cleave',
    isPurchased: false,
    isEquipped: false,
  },

  // --- ARMOR, HELMETS & CLOAKS ---
  {
    id: 2,
    name: 'Viking Horned Helmet',
    type: 'armor',
    price: 15,
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
    price: 30,
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
    price: 60,
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
    price: 90,
    description: 'Ceremonial blue steel heavy plate armor with fortified pauldrons.',
    rarity: 'legendary',
    icon: '🛡️',
    statBonus: '+30 Strength • +25 Vitality',
    isPurchased: false,
    isEquipped: false,
  },
  {
    id: 10,
    name: 'Crown of Sovereignty',
    type: 'armor',
    price: 100,
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
    price: 45,
    description: 'Crimson velvet mantle with gold trim that flows with momentum.',
    rarity: 'epic',
    icon: '🧣',
    statBonus: '+15 Mastery • 2x Streak Aura',
    isPurchased: false,
    isEquipped: false,
  },

  // --- SHIELDS & RELICS ---
  {
    id: 3,
    name: 'Round Buckler Shield',
    type: 'shield',
    price: 20,
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
    price: 25,
    description: 'Glows with restorative life essence hitched directly to your adventurer belt.',
    rarity: 'rare',
    icon: '🧪',
    statBonus: '+15 Max Stamina • Fast Regen',
    isPurchased: false,
    isEquipped: false,
  },
  {
    id: 7,
    name: 'Companion Ghost Wisp',
    type: 'relic',
    price: 70,
    description: 'A cute blue floating spectral pet hovering loyally beside your shoulder.',
    rarity: 'epic',
    icon: '👻',
    statBonus: '+25 Discipline • Spirit Glow',
    isPurchased: false,
    isEquipped: false,
  },

  // --- VIRTUAL THEMES ---
  {
    id: 20,
    name: 'Midnight Ember Theme',
    type: 'theme',
    price: 15,
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
    price: 35,
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
    price: 55,
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
    price: 75,
    description: 'Fierce volcanic magma aesthetic with crimson rune flames and heavy boss aura.',
    rarity: 'legendary',
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
    price: 100,
    description: 'Gilded palace radiance with radiant solar rays and celebratory gold lighting.',
    rarity: 'legendary',
    icon: '☀️',
    statBonus: 'Theme: Radiant Gilded Palace',
    themeClass: 'theme-ascendant-sol',
    isPurchased: false,
    isEquipped: false,
  },

  // --- PROFILE BADGES & TITLES ---
  {
    id: 30,
    name: 'Vanquisher Crest',
    type: 'badge',
    price: 20,
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
    price: 30,
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
    price: 40,
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
    price: 60,
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
    price: 80,
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
    price: 100,
    description: 'A flawless diamond badge symbolizing zero missed daily quests and iron fortitude.',
    rarity: 'legendary',
    icon: '💎',
    statBonus: 'Title: 💎 Diamond Will',
    badgeTitle: '💎 Diamond Will',
    isPurchased: false,
    isEquipped: false,
  },
]

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
  boss: BossState
  loading: boolean
  syncing: boolean
  error: string | null
  lastCompletion: TaskCompletionResponse | null
  celebration: CelebrationState | null

  // Actions
  hydrate: (accessToken: string) => Promise<void>
  completeQuest: (accessToken: string, taskId: number) => Promise<TaskCompletionResponse>
  addQuest: (
    accessToken: string,
    input: { title: string; description?: string; difficulty: 1 | 2 | 3 | 4 | 5; tags?: string[] }
  ) => Promise<void>
  updateQuest: (
    accessToken: string,
    taskId: number,
    updates: { title?: string; description?: string; difficulty?: 1 | 2 | 3 | 4 | 5; tags?: string[] }
  ) => Promise<void>
  deleteQuest: (accessToken: string, taskId: number) => Promise<void>
  buyItem: (itemId: number) => boolean
  equipItem: (itemId: number) => void
  setActiveTab: (tab: ActiveTab) => void
  toggleSfx: () => void
  toggleCrt: () => void
  restAtBonfire: () => void
  dismissCelebration: () => void
  triggerCelebration: (data: CelebrationState) => void
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

const INITIAL_BOSS: BossState = {
  name: 'CORRUPTED BEHEMOTH',
  title: 'Scourge of the Ashen Waste',
  maxHp: 400,
  currentHp: 220,
  isDefeated: false,
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

const getStoredShopItems = (userId?: string): ShopItem[] => {
  if (typeof window === 'undefined') return INITIAL_SHOP_ITEMS
  try {
    const key = userId ? `ashen_shop_items_${userId}` : 'ashen_shop_items_v4'
    const val = localStorage.getItem(key)
    if (!val) return INITIAL_SHOP_ITEMS
    const stored: ShopItem[] = JSON.parse(val)
    return INITIAL_SHOP_ITEMS.map((item) => {
      const match = stored.find((s) => s.id === item.id)
      return match
        ? {
            ...item,
            isPurchased: match.isPurchased ?? item.isPurchased,
            isEquipped: match.isEquipped ?? item.isEquipped,
          }
        : item
    })
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

export const useGameStore = create<GameState>((set, get) => ({
  profile: null,
  attributes: [],
  tasks: [],
  inventory: [],
  shopItems: getStoredShopItems(),
  coins: getStoredCoins(),
  streakInfo: null,
  activeTab: 'sanctuary',
  sfxEnabled: true,
  crtEnabled: false,
  resting: false,
  boss: INITIAL_BOSS,
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
    const updatedShop = get().shopItems.map((i) => {
      if (i.id === itemId) {
        return { ...i, isPurchased: true, isEquipped: true }
      }
      if (item.type === 'theme' && i.type === 'theme') {
        return { ...i, isEquipped: false }
      }
      if (item.type === 'badge' && i.type === 'badge') {
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

    set({
      coins: newCoins,
      shopItems: updatedShop,
      inventory: [newInvItem, ...get().inventory],
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

    const updatedShop = get().shopItems.map((i) => {
      if (i.id === itemId) {
        return { ...i, isEquipped: nextEquipped }
      }
      if (target.type === 'theme' && nextEquipped && i.type === 'theme') {
        return { ...i, isEquipped: false }
      }
      if (target.type === 'badge' && nextEquipped && i.type === 'badge') {
        return { ...i, isEquipped: false }
      }
      return i
    })

    const updatedInv = get().inventory.map((inv) => {
      if (inv.item_id === itemId) {
        return { ...inv, equipped: nextEquipped }
      }
      if (target.type === 'theme' && nextEquipped && inv.item_type === 'theme') {
        return { ...inv, equipped: false }
      }
      if (target.type === 'badge' && nextEquipped && inv.item_type === 'badge') {
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

    set({
      shopItems: updatedShop,
      inventory: updatedInv,
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
      const localTheme = typeof window !== 'undefined' ? localStorage.getItem('ashen_theme_preview') || 'theme-midnight-ember' : 'theme-midnight-ember'
      const localBadge = typeof window !== 'undefined' ? localStorage.getItem('ashen_badge_preview') || '' : ''
      set({
        profile: { ...previewProfile, coins: localCoins, active_theme: localTheme, active_badge: localBadge },
        coins: localCoins,
        shopItems: localShop,
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

    // Optimistic strike
    soundFx.playSwordSlash()
    soundFx.playBossHit()

    // Boss damage calculation
    const damage = Math.max(20, target.xp_reward)
    const newBossHp = Math.max(0, get().boss.currentHp - damage)
    set((s) => ({
      boss: {
        ...s.boss,
        currentHp: newBossHp,
        isDefeated: newBossHp === 0,
      },
    }))

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

      if (accessToken === PREVIEW_TOKEN) {
        const current = get().profile ?? previewProfile
        const gained = applyXPGain(current.current_level, current.total_xp, target.xp_reward)

        // Coins economy: +1 coin per task + 10 coins per level up
        const earnedCoins = 1 + (gained.levelsGained * 10)
        const updatedCoins = get().coins + earnedCoins
        if (typeof window !== 'undefined') {
          localStorage.setItem('ashen_coins', String(updatedCoins))
        }

        soundFx.playCoinSound()
        if (gained.levelsGained > 0) {
          setTimeout(() => soundFx.playLevelUp(), 400)
        }

        const result: TaskCompletionResponse = {
          message: gained.levelsGained > 0
            ? `🎉 Level Up! (+${gained.levelsGained * 10} Coins)`
            : 'Quest complete. (+1 Coin)',
          task: { task_id: target.task_id, title: target.title, xp_awarded: target.xp_reward },
          profile: {
            id: current.id,
            current_level: gained.newLevel,
            total_xp: gained.newTotalXP,
            levels_gained: gained.levelsGained,
            progress_xp: gained.progressXP,
            xp_needed_for_next: gained.xpNeededForNext,
            current_streak: current.current_streak + 1,
            longest_streak: Math.max(current.longest_streak, current.current_streak + 1),
            last_activity_date: new Date().toISOString().slice(0, 10),
          },
        }
        set({
          coins: updatedCoins,
          attributes: updatedAttributes,
          lastCompletion: result,
          celebration: gained.levelsGained > 0 ? {
            type: 'LEVEL_UP',
            level: gained.newLevel,
            coinsEarned: gained.levelsGained * 10,
          } : null,
          syncing: false,
          profile: applyCompletionToProfile(current, result),
        })
        return result
      }

      const result = await rpgApi.completeTask(accessToken, taskId)

      // Coins economy: +1 coin per task + 10 coins per level up
      const levelsGained = result.profile.levels_gained || 0
      const earnedCoins = 1 + (levelsGained * 10)
      const updatedCoins = get().coins + earnedCoins
      if (typeof window !== 'undefined') {
        localStorage.setItem('ashen_coins', String(updatedCoins))
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

      set({
        coins: updatedCoins,
        attributes: finalAttributes,
        lastCompletion: result,
        celebration: levelsGained > 0 ? {
          type: 'LEVEL_UP',
          level: result.profile.current_level,
          coinsEarned: levelsGained * 10,
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

  reset: () =>
    set({
      profile: null,
      attributes: [],
      tasks: [],
      inventory: [],
      shopItems: INITIAL_SHOP_ITEMS,
      coins: 25,
      streakInfo: null,
      boss: INITIAL_BOSS,
      loading: false,
      syncing: false,
      error: null,
      lastCompletion: null,
      celebration: null,
    }),
}))

