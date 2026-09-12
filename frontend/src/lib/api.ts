import type { ApiEnvelope, Profile, ProfileAttribute, StreakInfo, Task, TaskCompletionResponse } from '../types/rpg'

const API_BASE = import.meta.env.VITE_API_URL ?? ''

export class ApiError extends Error {
  status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

async function request<T>(
  path: string,
  accessToken: string,
  init?: RequestInit
): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
      ...(init?.headers ?? {}),
    },
  })

  const payload = (await response.json().catch(() => ({}))) as {
    success?: boolean
    message?: string
    error?: { message?: string }
  }

  if (!response.ok) {
    const message =
      payload.message ??
      payload.error?.message ??
      `Request failed (${response.status})`
    throw new ApiError(message, response.status)
  }

  return payload as T
}

export const rpgApi = {
  getProfile: (token: string) =>
    request<ApiEnvelope<Profile>>('/api/profile/me', token).then((r) => r.data!),

  getStreak: (token: string) =>
    request<ApiEnvelope<StreakInfo>>('/api/profile/me/streak', token).then((r) => r.data!),

  getAttributes: (token: string) =>
    request<ApiEnvelope<ProfileAttribute[]>>('/api/profile/me/attributes', token).then(
      (r) => r.data ?? []
    ),

  getTasks: (token: string, status?: string) => {
    const query = status ? `?status=${encodeURIComponent(status)}` : ''
    return request<ApiEnvelope<Task[]>>(`/api/profile/me/tasks${query}`, token).then(
      (r) => r.data ?? []
    )
  },

  createTask: (
    token: string,
    body: {
      title: string
      description?: string
      difficulty?: 1 | 2 | 3 | 4 | 5
      xp_reward?: number
      status?: 'pending' | 'active' | 'completed' | 'archived'
    }
  ) =>
    request<ApiEnvelope<Task>>('/api/profile/me/tasks', token, {
      method: 'POST',
      body: JSON.stringify(body),
    }).then((r) => r.data!),

  completeTask: (token: string, taskId: number) =>
    request<ApiEnvelope<never> & TaskCompletionResponse>(
      `/api/tasks/${taskId}/complete`,
      token,
      { method: 'POST' }
    ),

  getInventory: (token: string) =>
    request<ApiEnvelope<any[]>>('/api/profile/me/inventory', token).then(
      (r) => r.data ?? []
    ),

  getCatalog: (token: string) =>
    request<ApiEnvelope<any[]>>('/api/items', token).then((r) => r.data ?? []),

  updateProfile: (
    token: string,
    body: { username?: string; coins?: number; equipped_gear?: any[] }
  ) =>
    request<ApiEnvelope<Profile>>('/api/profile/me', token, {
      method: 'PATCH',
      body: JSON.stringify(body),
    }).then((r) => r.data!),
}

