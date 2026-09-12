import { create } from 'zustand'
import { rpgApi } from '../lib/api'
import { applyXPGain } from '../lib/progression'
import { soundFx } from '../lib/audio'
import { PREVIEW_TOKEN, previewAttributes, previewProfile, previewTasks } from '../lib/previewData'
import type {
  ActiveTab,
  ChampionClass,
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

interface GameState {
  profile: Profile | null
  attributes: ProfileAttribute[]
  tasks: Task[]
  inventory: InventoryItem[]
  streakInfo: StreakInfo | null
  activeTab: ActiveTab
  championClass: ChampionClass
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
  setActiveTab: (tab: ActiveTab) => void
  setChampionClass: (cls: ChampionClass) => void
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

export const useGameStore = create<GameState>((set, get) => ({
  profile: null,
  attributes: [],
  tasks: [],
  inventory: [],
  streakInfo: null,
  activeTab: 'sanctuary',
  championClass: 'KNIGHT',
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

  setChampionClass: (cls) => {
    soundFx.playClick()
    set({ championClass: cls })
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
        if (gained.levelsGained > 0) {
          setTimeout(() => soundFx.playLevelUp(), 400)
        }
        const result: TaskCompletionResponse = {
          message: 'Quest complete.',
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
          lastCompletion: result,
          syncing: false,
          profile: applyCompletionToProfile(current, result),
        })
        return result
      }

      const result = await rpgApi.completeTask(accessToken, taskId)
      if (result.profile.levels_gained > 0) {
        setTimeout(() => soundFx.playLevelUp(), 400)
      }
      set({
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

