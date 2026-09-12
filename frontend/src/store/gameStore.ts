import { create } from 'zustand'
import { rpgApi } from '../lib/api'
import { applyXPGain } from '../lib/progression'
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
    icon: '🥋',
    statBonus: '+15 Mastery • 2x Streak Aura',
    isPurchased: false,
    isEquipped: false,
  },
]

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

  // Actions
  hydrate: (accessToken: string) => Promise<void>
  completeQuest: (accessToken: string, taskId: number) => Promise<TaskCompletionResponse>
  addQuest: (
    accessToken: string,
    input: { title: string; description?: string; difficulty: 1 | 2 | 3 | 4 | 5; tags?: string[] }
  ) => Promise<void>
  buyItem: (itemId: number) => boolean
  equipItem: (itemId: number) => void
  setActiveTab: (tab: ActiveTab) => void
  toggleSfx: () => void
  toggleCrt: () => void
  restAtBonfire: () => void
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

const getStoredCoins = (): number => {
  if (typeof window === 'undefined') return 25
  const val = localStorage.getItem('ashen_coins')
  return val !== null ? parseInt(val, 10) : 25
}

const getStoredShopItems = (): ShopItem[] => {
  if (typeof window === 'undefined') return INITIAL_SHOP_ITEMS
  try {
    const val = localStorage.getItem('ashen_shop_items_v3')
    return val ? JSON.parse(val) : INITIAL_SHOP_ITEMS
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

  setActiveTab: (tab) => {
    soundFx.playClick()
    set({ activeTab: tab })
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
    const updatedShop = get().shopItems.map((i) =>
      i.id === itemId ? { ...i, isPurchased: true, isEquipped: true } : i
    )

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
    if (typeof window !== 'undefined') {
      localStorage.setItem('ashen_coins', String(newCoins))
      localStorage.setItem('ashen_shop_items_v3', JSON.stringify(updatedShop))
    }

    // Persist to PostgreSQL database in background
    const token = useAuthStore.getState().accessToken
    if (token && token !== PREVIEW_TOKEN) {
      rpgApi.updateProfile(token, { coins: newCoins, equipped_gear: updatedShop }).catch(() => {})
    }

    set({
      coins: newCoins,
      shopItems: updatedShop,
      inventory: [newInvItem, ...get().inventory],
      error: null,
    })
    return true
  },

  equipItem: (itemId: number) => {
    soundFx.playClick()
    const updatedShop = get().shopItems.map((i) => {
      if (i.id === itemId) {
        return { ...i, isEquipped: !i.isEquipped }
      }
      return i
    })
    const updatedInv = get().inventory.map((inv) => {
      if (inv.item_id === itemId) {
        return { ...inv, equipped: !inv.equipped }
      }
      return inv
    })

    if (typeof window !== 'undefined') {
      localStorage.setItem('ashen_shop_items_v3', JSON.stringify(updatedShop))
    }

    // Persist to PostgreSQL database in background
    const token = useAuthStore.getState().accessToken
    if (token && token !== PREVIEW_TOKEN) {
      rpgApi.updateProfile(token, { equipped_gear: updatedShop }).catch(() => {})
    }

    set({ shopItems: updatedShop, inventory: updatedInv })
  },

  clearError: () => set({ error: null }),

  hydrate: async (accessToken) => {
    if (accessToken === PREVIEW_TOKEN) {
      set({
        profile: previewProfile,
        tasks: previewTasks,
        attributes: previewAttributes,
        inventory: [
          {
            inventory_id: 1,
            profile_id: 'preview',
            item_id: 1,
            item_name: 'Ashen Greatsword',
            item_type: 'weapon',
            description: 'Forged in the embers of the First Kiln.',
            rarity: 'epic',
            quantity: 1,
            acquired_at: new Date().toISOString(),
            equipped: true,
          },
          {
            inventory_id: 2,
            profile_id: 'preview',
            item_id: 2,
            item_name: 'Flask of Crimson Embers',
            item_type: 'consumable',
            description: 'Restores stamina and clears cognitive fatigue.',
            rarity: 'rare',
            quantity: 3,
            acquired_at: new Date().toISOString(),
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

      // Sync coins & shop items from database profile if available
      let syncedCoins = get().coins
      let syncedShop = get().shopItems

      if (profile.coins !== undefined && profile.coins !== null) {
        syncedCoins = profile.coins
        if (typeof window !== 'undefined') {
          localStorage.setItem('ashen_coins', String(syncedCoins))
        }
      }

      if (profile.equipped_gear && Array.isArray(profile.equipped_gear) && profile.equipped_gear.length > 0) {
        syncedShop = INITIAL_SHOP_ITEMS.map((item) => {
          const dbItem = profile.equipped_gear?.find((i: any) => i.id === item.id)
          return dbItem ? { ...item, isPurchased: !!dbItem.isPurchased, isEquipped: !!dbItem.isEquipped } : item
        })
        if (typeof window !== 'undefined') {
          localStorage.setItem('ashen_shop_items_v3', JSON.stringify(syncedShop))
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
          lastCompletion: result,
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
      rpgApi.updateProfile(accessToken, { coins: updatedCoins }).catch(() => {})

      set({
        coins: updatedCoins,
        lastCompletion: result,
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
    set({ syncing: true, error: null })
    try {
      if (accessToken === PREVIEW_TOKEN) {
        const created: Task = {
          task_id: Date.now(),
          profile_id: 'preview-hero',
          title: input.title,
          description: input.description ?? null,
          difficulty: input.difficulty,
          xp_reward: XP_BY_DIFFICULTY[input.difficulty],
          status: 'active',
          due_date: null,
          created_at: new Date().toISOString(),
          tags: input.tags ?? [],
        }
        set({ tasks: [created, ...get().tasks], syncing: false })
        return
      }

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
      const taskWithTags: Task = {
        ...created,
        tags: input.tags ?? [],
      }
      set({ tasks: [taskWithTags, ...get().tasks], syncing: false })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Could not create quest.'
      set({ error: message, syncing: false })
      throw error
    }
  },

  reset: () =>
    set({
      profile: null,
      attributes: [],
      tasks: [],
      inventory: [],
      streakInfo: null,
      loading: false,
      syncing: false,
      error: null,
      lastCompletion: null,
    }),
}))

