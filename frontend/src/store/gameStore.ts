import { create } from 'zustand'
import { rpgApi } from '../lib/api'
import { applyXPGain } from '../lib/progression'
import { soundFx } from '../lib/audio'
import { PREVIEW_TOKEN, previewAttributes, previewProfile, previewTasks } from '../lib/previewData'
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
    name: 'Ashen Greatsword',
    type: 'weapon',
    price: 15,
    description: 'Forged in the primordial kiln. Emits ember sparks and scales with Strength.',
    rarity: 'epic',
    icon: '🗡️',
    statBonus: '+15 Strength • +50 Boss Damage',
    isPurchased: true,
    isEquipped: true,
  },
  {
    id: 2,
    name: 'Helm of the Cinder Knight',
    type: 'armor',
    price: 10,
    description: 'Forged steel with an incandescent visor. Shields against distractions.',
    rarity: 'rare',
    icon: '🪖',
    statBonus: '+8 Focus • +5 Vitality',
  },
  {
    id: 3,
    name: 'Cloak of the Ashen Sovereign',
    type: 'cloak',
    price: 25,
    description: 'Flowing mantle woven with flame-treated silk. Imbues character with royal stature.',
    rarity: 'legendary',
    icon: '🥋',
    statBonus: '+20 Mastery • 2x Streak Glow',
  },
  {
    id: 4,
    name: 'Pyromancer Flame Staff',
    type: 'weapon',
    price: 20,
    description: 'Channeling wand crowned with a continuous ember crystal.',
    rarity: 'epic',
    icon: '🪄',
    statBonus: '+18 Intellect • +25 Spell XP',
  },
  {
    id: 5,
    name: 'Aegis of the Sunken Shield',
    type: 'shield',
    price: 12,
    description: 'Heavy crest shield bearing the sigil of the First Bonfire.',
    rarity: 'rare',
    icon: '🛡️',
    statBonus: '+12 Vitality • +10 Discipline',
  },
  {
    id: 6,
    name: 'Boots of Swift Resolve',
    type: 'armor',
    price: 8,
    description: 'Lightweight leather greaves that hasten daily task completions.',
    rarity: 'common',
    icon: '👢',
    statBonus: '+5 Dexterity • Fast Step',
  },
  {
    id: 7,
    name: 'Ring of Everlasting Fire',
    type: 'relic',
    price: 30,
    description: 'Ancient artifact that permanently multiplies streak XP gains.',
    rarity: 'legendary',
    icon: '💍',
    statBonus: '+25 All Stats • +15% XP',
  },
  {
    id: 8,
    name: 'Crown of the Eclipse',
    type: 'armor',
    price: 45,
    description: 'Mythical crown radiating dark solar energy.',
    rarity: 'legendary',
    icon: '👑',
    statBonus: '+30 Sovereign Authority',
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
    input: { title: string; description?: string; difficulty: 1 | 2 | 3 | 4 | 5 }
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
    const val = localStorage.getItem('ashen_shop_items')
    return val ? JSON.parse(val) : INITIAL_SHOP_ITEMS
  } catch {
    return INITIAL_SHOP_ITEMS
  }
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
      localStorage.setItem('ashen_shop_items', JSON.stringify(updatedShop))
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
      localStorage.setItem('ashen_shop_items', JSON.stringify(updatedShop))
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
      set({ profile, tasks, attributes, streakInfo, inventory, loading: false })
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
        }
        set({ tasks: [created, ...get().tasks], syncing: false })
        return
      }

      const created = await rpgApi.createTask(accessToken, {
        ...input,
        xp_reward: XP_BY_DIFFICULTY[input.difficulty],
        status: 'active',
      })
      set({ tasks: [created, ...get().tasks], syncing: false })
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

