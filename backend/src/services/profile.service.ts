import { query } from '../config/database';
import { Profile } from '../types';
import { NotFoundError } from '../utils/errors';
import { totalXPForLevel } from './progression.service';

export class ProfileService {
  /**
   * Retrieves profile by user UUID, computing dynamic level progression metrics
   */
  static async getProfileById(userId: string): Promise<any> {
    // Ensure table has coins, equipped_gear, active_theme, active_badge columns
    try {
      await query(`ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS coins INTEGER NOT NULL DEFAULT 25;`);
      await query(`ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS equipped_gear JSONB NOT NULL DEFAULT '[]'::jsonb;`);
      await query(`ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS active_theme TEXT NOT NULL DEFAULT 'default';`);
      await query(`ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS active_badge TEXT NOT NULL DEFAULT '';`);
    } catch {
      // Ignore if columns or permissions already set
    }

    const { rows } = await query(
      `SELECT id, username, current_level, total_xp, coins, equipped_gear, active_theme, active_badge, current_streak, longest_streak, 
              last_activity_date, created_at
       FROM public.profiles
       WHERE id = $1`,
      [userId]
    );

    if (!rows.length) {
      throw new NotFoundError('Profile for user', userId);
    }

    const profile: Profile = rows[0];
    const currentThreshold = totalXPForLevel(profile.current_level);
    const nextThreshold = totalXPForLevel(profile.current_level + 1);

    return {
      ...profile,
      coins: profile.coins ?? 25,
      equipped_gear: profile.equipped_gear ?? [],
      active_theme: profile.active_theme ?? 'default',
      active_badge: profile.active_badge ?? '',
      progress_xp: Number(profile.total_xp) - currentThreshold,
      xp_needed_for_next: nextThreshold - currentThreshold,
      next_level_threshold: nextThreshold,
    };
  }

  /**
   * Updates profile fields like username, coins, equipped_gear, active_theme, or active_badge
   */
  static async updateProfile(
    userId: string,
    updates: { username?: string; coins?: number; equipped_gear?: any[]; active_theme?: string; active_badge?: string }
  ): Promise<Profile> {
    const fields: string[] = [];
    const values: any[] = [];
    let idx = 1;

    if (updates.username !== undefined) {
      fields.push(`username = $${idx++}`);
      values.push(updates.username.trim());
    }

    if (updates.coins !== undefined) {
      fields.push(`coins = $${idx++}`);
      values.push(updates.coins);
    }

    if (updates.equipped_gear !== undefined) {
      fields.push(`equipped_gear = $${idx++}`);
      values.push(JSON.stringify(updates.equipped_gear));
    }

    if (updates.active_theme !== undefined) {
      fields.push(`active_theme = $${idx++}`);
      values.push(updates.active_theme);
    }

    if (updates.active_badge !== undefined) {
      fields.push(`active_badge = $${idx++}`);
      values.push(updates.active_badge);
    }

    if (fields.length === 0) {
      return (await this.getProfileById(userId)) as Profile;
    }

    values.push(userId);

    const { rows } = await query(
      `UPDATE public.profiles
       SET ${fields.join(', ')}
       WHERE id = $${idx}
       RETURNING id, username, current_level, total_xp, coins, equipped_gear, active_theme, active_badge, current_streak, longest_streak, last_activity_date, created_at`,
      values
    );

    if (!rows.length) {
      throw new NotFoundError('Profile', userId);
    }

    return rows[0];
  }

  /**
   * Retrieves streak stats and historical activity summary
   */
  static async getStreak(userId: string): Promise<any> {
    const profile = await this.getProfileById(userId);

    const { rows: activities } = await query(
      `SELECT activity_date, completions_count
       FROM public.streak_activities
       WHERE profile_id = $1
       ORDER BY activity_date DESC
       LIMIT 30`,
      [userId]
    );

    return {
      current_streak: profile.current_streak,
      longest_streak: profile.longest_streak,
      last_activity_date: profile.last_activity_date,
      recent_activity: activities,
    };
  }

  /**
   * Ensures a profile exists for the given user ID (idempotent helper)
   */
  static async ensureProfile(userId: string, username?: string, email?: string): Promise<void> {
    const defaultName = username || (email ? email.split('@')[0] : `adventurer_${userId.slice(0, 6)}`);
    await query(
      `INSERT INTO public.profiles (id, username)
       VALUES ($1, $2)
       ON CONFLICT (id) DO NOTHING`,
      [userId, defaultName]
    );
  }
}
