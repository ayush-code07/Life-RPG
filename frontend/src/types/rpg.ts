export type TaskDifficulty = 1 | 2 | 3 | 4 | 5
export type TaskStatus = 'pending' | 'active' | 'completed' | 'archived'

export interface Profile {
  id: string
  username: string
  current_level: number
  total_xp: number
  current_streak: number
  longest_streak: number
  last_activity_date: string | null
  created_at: string
  progress_xp: number
  xp_needed_for_next: number
  next_level_threshold: number
}

export interface ProfileAttribute {
  profile_id: string
  attribute_id: number
  attribute_name?: string
  description?: string
  attribute_value: number
  attribute_xp: number
}

export interface TaskAttributeReward {
  task_id?: number
  attribute_id: number
  attribute_name?: string
  attribute_xp_value: number
}

export interface Task {
  task_id: number
  profile_id: string
  title: string
  description: string | null
  difficulty: TaskDifficulty
  xp_reward: number
  status: TaskStatus
  due_date: string | null
  created_at: string
  attribute_rewards?: TaskAttributeReward[]
}

export interface TaskCompletionResponse {
  message: string
  task: {
    task_id: number
    title: string
    xp_awarded: number
  }
  profile: {
    id: string
    current_level: number
    total_xp: number
    levels_gained: number
    progress_xp: number
    xp_needed_for_next: number
    current_streak: number
    longest_streak: number
    last_activity_date: string | null
  }
  attribute_advancements?: Array<{
    attribute_id: number
    attribute_name: string
    xp_gained: number
    new_value: number
    new_xp: number
  }>
}

export interface ApiEnvelope<T> {
  success: boolean
  message?: string
  data?: T
}

export interface StreakInfo {
  current_streak: number
  longest_streak: number
  last_activity_date: string | null
  recent_activity?: Array<{ activity_date: string; completions_count: number }>
}
