import { create } from 'zustand'
import { rpgApi } from '../lib/api'
import { applyXPGain } from '../lib/progression'
import { PREVIEW_TOKEN, previewAttributes, previewProfile, previewTasks } from '../lib/previewData'
import type { Profile, ProfileAttribute, Task, TaskCompletionResponse } from '../types/rpg'

interface GameState {
  profile: Profile | null
  attributes: ProfileAttribute[]
  tasks: Task[]
  loading: boolean
  syncing: boolean
  error: string | null
  lastCompletion: TaskCompletionResponse | null
  hydrate: (accessToken: string) => Promise<void>
  completeQuest: (accessToken: string, taskId: number) => Promise<TaskCompletionResponse>
  addQuest: (
    accessToken: string,
    input: { title: string; description?: string; difficulty: 1 | 2 | 3 | 4 | 5 }
  ) => Promise<void>
  reset: () => void
}

const XP_BY_DIFFICULTY: Record<1 | 2 | 3 | 4 | 5, number> = {
  1: 25,
  2: 50,
  3: 90,
  4: 150,
  5: 250,
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
  loading: false,
  syncing: false,
  error: null,
  lastCompletion: null,

  hydrate: async (accessToken) => {
    if (accessToken === PREVIEW_TOKEN) {
      set({
        profile: previewProfile,
        tasks: previewTasks,
        attributes: previewAttributes,
        loading: false,
        error: null,
      })
      return
    }

    set({ loading: true, error: null })
    try {
      const [profile, tasks, attributes] = await Promise.all([
        rpgApi.getProfile(accessToken),
        rpgApi.getTasks(accessToken),
        rpgApi.getAttributes(accessToken).catch(() => [] as ProfileAttribute[]),
      ])
      set({ profile, tasks, attributes, loading: false })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to sync with the Life RPG API.'
      set({ error: message, loading: false })
    }
  },

  completeQuest: async (accessToken, taskId) => {
    const snapshot = get().tasks
    const target = snapshot.find((task) => task.task_id === taskId)
    if (!target) throw new Error('Quest not found.')

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
      loading: false,
      syncing: false,
      error: null,
      lastCompletion: null,
    }),
}))
