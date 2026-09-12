import { Request } from 'express';

// ==========================================
// Express Extended Request
// ==========================================
export interface AuthenticatedRequest extends Request {
  userId?: string;
  userRole?: string;
  userEmail?: string;
}

// ==========================================
// Domain Models
// ==========================================
export interface Profile {
  id: string; // UUID from auth.users
  username: string;
  current_level: number;
  total_xp: number;
  coins: number;
  equipped_gear?: any[];
  current_streak: number;
  longest_streak: number;
  last_activity_date: string | null; // YYYY-MM-DD
  created_at: string;
}

export interface Attribute {
  attribute_id: number;
  attribute_name: string;
  description: string | null;
}

export interface ProfileAttribute {
  profile_id: string;
  attribute_id: number;
  attribute_name?: string;
  description?: string;
  attribute_value: number;
  attribute_xp: number;
}

export type TaskDifficulty = 1 | 2 | 3 | 4 | 5;
export type TaskStatus = 'pending' | 'active' | 'completed' | 'archived';

export interface Task {
  task_id: number;
  profile_id: string;
  title: string;
  description: string | null;
  difficulty: TaskDifficulty;
  xp_reward: number;
  status: TaskStatus;
  due_date: string | null;
  created_at: string;
  attribute_rewards?: TaskAttributeReward[];
}

export interface TaskAttributeReward {
  task_id?: number;
  attribute_id: number;
  attribute_name?: string;
  attribute_xp_value: number;
}

export interface TaskCompletion {
  completion_id: number;
  task_id: number;
  profile_id: string;
  xp_awarded: number;
  completed_at: string;
  task_title?: string;
}

export type ItemRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';

export interface Item {
  item_id: number;
  item_name: string;
  item_type: string;
  description: string | null;
  rarity: ItemRarity;
}

export interface InventoryItem {
  inventory_id: number;
  profile_id: string;
  item_id: number;
  quantity: number;
  acquired_at: string;
  item_name?: string;
  item_type?: string;
  description?: string;
  rarity?: ItemRarity;
}

export interface StreakActivity {
  profile_id: string;
  activity_date: string;
  completions_count: number;
}

// ==========================================
// Progression Engine Types
// ==========================================
export interface ProgressionResult {
  newLevel: number;
  newTotalXP: number;
  levelsGained: number;
  progressXP: number;
  xpNeededForNext: number;
}

export interface TaskCompletionResponse {
  message: string;
  task: {
    task_id: number;
    title: string;
    xp_awarded: number;
  };
  profile: {
    id: string;
    current_level: number;
    total_xp: number;
    levels_gained: number;
    progress_xp: number;
    xp_needed_for_next: number;
    current_streak: number;
    longest_streak: number;
    last_activity_date: string | null;
  };
  attribute_advancements?: Array<{
    attribute_id: number;
    attribute_name: string;
    xp_gained: number;
    new_value: number;
    new_xp: number;
  }>;
}
