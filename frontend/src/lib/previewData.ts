import { applyXPGain } from './progression'
import type { Profile, ProfileAttribute, Task } from '../types/rpg'

export const PREVIEW_TOKEN = 'preview'

export const previewProfile: Profile = {
  id: 'preview-hero',
  username: 'Aether',
  current_level: 4,
  total_xp: 520,
  current_streak: 6,
  longest_streak: 12,
  last_activity_date: new Date().toISOString().slice(0, 10),
  created_at: new Date().toISOString(),
  progress_xp: applyXPGain(4, 520, 0).progressXP,
  xp_needed_for_next: applyXPGain(4, 520, 0).xpNeededForNext,
  next_level_threshold: 0,
}

export const previewAttributes: ProfileAttribute[] = [
  { profile_id: 'preview-hero', attribute_id: 1, attribute_name: 'Strength', attribute_value: 3, attribute_xp: 210 },
  { profile_id: 'preview-hero', attribute_id: 2, attribute_name: 'Intellect', attribute_value: 5, attribute_xp: 480 },
  { profile_id: 'preview-hero', attribute_id: 3, attribute_name: 'Discipline', attribute_value: 4, attribute_xp: 340 },
  { profile_id: 'preview-hero', attribute_id: 4, attribute_name: 'Agility', attribute_value: 2, attribute_xp: 90 },
  { profile_id: 'preview-hero', attribute_id: 5, attribute_name: 'Vitality', attribute_value: 3, attribute_xp: 160 },
  { profile_id: 'preview-hero', attribute_id: 6, attribute_name: 'Charisma', attribute_value: 2, attribute_xp: 70 },
]

export const previewTasks: Task[] = [
  {
    task_id: 101,
    profile_id: 'preview-hero',
    title: 'Deep-work dungeon (90 min)',
    description: 'Ship one focused coding block without context switching.',
    difficulty: 3,
    xp_reward: 90,
    status: 'active',
    due_date: null,
    created_at: new Date().toISOString(),
  },
  {
    task_id: 102,
    profile_id: 'preview-hero',
    title: 'Iron temple workout',
    description: 'Complete a full-body strength circuit.',
    difficulty: 2,
    xp_reward: 50,
    status: 'active',
    due_date: null,
    created_at: new Date().toISOString(),
  },
  {
    task_id: 103,
    profile_id: 'preview-hero',
    title: 'Sleep before midnight',
    description: 'Protect vitality — lights out by 23:30.',
    difficulty: 1,
    xp_reward: 25,
    status: 'pending',
    due_date: null,
    created_at: new Date().toISOString(),
  },
]
