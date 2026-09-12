import { PoolClient } from 'pg';
import { query, withTransaction } from '../config/database';
import {
  Task,
  TaskCompletion,
  TaskCompletionResponse,
  TaskDifficulty,
  TaskStatus,
} from '../types';
import { BadRequestError, NotFoundError } from '../utils/errors';
import { applyAttributeXPGain, applyXPGain } from './progression.service';

export class TaskService {
  /**
   * Retrieves tasks for a given user with optional status filter
   */
  static async getTasks(
    userId: string,
    status?: string
  ): Promise<Task[]> {
    let sql = `
      SELECT t.task_id, t.profile_id, t.title, t.description, t.difficulty, 
             t.xp_reward, t.status, t.due_date, t.created_at,
             COALESCE(
               JSON_AGG(
                 JSON_BUILD_OBJECT(
                   'attribute_id', tar.attribute_id,
                   'attribute_name', a.attribute_name,
                   'attribute_xp_value', tar.attribute_xp_value
                 )
               ) FILTER (WHERE tar.attribute_id IS NOT NULL), '[]'
             ) as attribute_rewards
      FROM public.tasks t
      LEFT JOIN public.task_attribute_rewards tar ON t.task_id = tar.task_id
      LEFT JOIN public.attributes a ON tar.attribute_id = a.attribute_id
      WHERE t.profile_id = $1
    `;

    const params: any[] = [userId];

    if (status) {
      sql += ` AND t.status = $2`;
      params.push(status);
    }

    sql += ` GROUP BY t.task_id ORDER BY t.created_at DESC`;

    const { rows } = await query(sql, params);
    return rows;
  }

  /**
   * Retrieves a single task with its attribute rewards
   */
  static async getTaskById(taskId: number, client?: PoolClient): Promise<Task> {
    const sql = `
      SELECT t.task_id, t.profile_id, t.title, t.description, t.difficulty, 
             t.xp_reward, t.status, t.due_date, t.created_at,
             COALESCE(
               JSON_AGG(
                 JSON_BUILD_OBJECT(
                   'attribute_id', tar.attribute_id,
                   'attribute_name', a.attribute_name,
                   'attribute_xp_value', tar.attribute_xp_value
                 )
               ) FILTER (WHERE tar.attribute_id IS NOT NULL), '[]'
             ) as attribute_rewards
      FROM public.tasks t
      LEFT JOIN public.task_attribute_rewards tar ON t.task_id = tar.task_id
      LEFT JOIN public.attributes a ON tar.attribute_id = a.attribute_id
      WHERE t.task_id = $1
      GROUP BY t.task_id
    `;
    const { rows } = client
      ? await client.query(sql, [taskId])
      : await query(sql, [taskId]);

    if (!rows.length) {
      throw new NotFoundError('Task', taskId);
    }

    return rows[0];
  }

  /**
   * Creates a new task and optionally associates attribute XP rewards
   */
  static async createTask(
    userId: string,
    data: {
      title: string;
      description?: string;
      difficulty?: TaskDifficulty;
      xp_reward?: number;
      status?: TaskStatus;
      due_date?: string;
      attribute_rewards?: Array<{ attribute_id: number; attribute_xp_value: number }>;
    }
  ): Promise<Task> {
    const difficulty = data.difficulty || 1;
    // Default XP calculation if not manually specified: 50 XP per difficulty star
    const xpReward = data.xp_reward !== undefined ? data.xp_reward : difficulty * 50;

    return await withTransaction(async (client) => {
      const taskRes = await client.query(
        `INSERT INTO public.tasks (profile_id, title, description, difficulty, xp_reward, status, due_date)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING task_id, profile_id, title, description, difficulty, xp_reward, status, due_date, created_at`,
        [
          userId,
          data.title.trim(),
          data.description || null,
          difficulty,
          xpReward,
          data.status || 'pending',
          data.due_date || null,
        ]
      );

      const createdTask: Task = taskRes.rows[0];

      if (data.attribute_rewards && data.attribute_rewards.length > 0) {
        for (const reward of data.attribute_rewards) {
          if (reward.attribute_id && reward.attribute_xp_value > 0) {
            await client.query(
              `INSERT INTO public.task_attribute_rewards (task_id, attribute_id, attribute_xp_value)
               VALUES ($1, $2, $3)
               ON CONFLICT (task_id, attribute_id) DO UPDATE
               SET attribute_xp_value = EXCLUDED.attribute_xp_value`,
              [createdTask.task_id, reward.attribute_id, reward.attribute_xp_value]
            );
          }
        }
      }

      return await this.getTaskById(createdTask.task_id, client);
    });
  }

  /**
   * Updates an existing task definition
   */
  static async updateTask(
    taskId: number,
    data: {
      title?: string;
      description?: string;
      difficulty?: TaskDifficulty;
      xp_reward?: number;
      status?: TaskStatus;
      due_date?: string | null;
      attribute_rewards?: Array<{ attribute_id: number; attribute_xp_value: number }>;
    }
  ): Promise<Task> {
    return await withTransaction(async (client) => {
      const fields: string[] = [];
      const values: any[] = [];
      let idx = 1;

      if (data.title !== undefined) {
        fields.push(`title = $${idx++}`);
        values.push(data.title.trim());
      }
      if (data.description !== undefined) {
        fields.push(`description = $${idx++}`);
        values.push(data.description);
      }
      if (data.difficulty !== undefined) {
        fields.push(`difficulty = $${idx++}`);
        values.push(data.difficulty);
      }
      if (data.xp_reward !== undefined) {
        fields.push(`xp_reward = $${idx++}`);
        values.push(data.xp_reward);
      }
      if (data.status !== undefined) {
        fields.push(`status = $${idx++}`);
        values.push(data.status);
      }
      if (data.due_date !== undefined) {
        fields.push(`due_date = $${idx++}`);
        values.push(data.due_date);
      }

      if (fields.length > 0) {
        values.push(taskId);
        await client.query(
          `UPDATE public.tasks SET ${fields.join(', ')} WHERE task_id = $${idx}`,
          values
        );
      }

      if (data.attribute_rewards !== undefined) {
        await client.query(
          `DELETE FROM public.task_attribute_rewards WHERE task_id = $1`,
          [taskId]
        );
        for (const reward of data.attribute_rewards) {
          if (reward.attribute_id && reward.attribute_xp_value > 0) {
            await client.query(
              `INSERT INTO public.task_attribute_rewards (task_id, attribute_id, attribute_xp_value)
               VALUES ($1, $2, $3)`,
              [taskId, reward.attribute_id, reward.attribute_xp_value]
            );
          }
        }
      }

      return await this.getTaskById(taskId, client);
    });
  }

  /**
   * Deletes/archives a task
   */
  static async deleteTask(taskId: number): Promise<void> {
    const res = await query('DELETE FROM public.tasks WHERE task_id = $1', [taskId]);
    if (res.rowCount === 0) {
      throw new NotFoundError('Task', taskId);
    }
  }

  /**
   * ★ Core Action: Complete a task atomically
   * 1. Locks character profile row with SELECT ... FOR UPDATE
   * 2. Evaluates non-linear JRPG XP progression with multi-level cascading
   * 3. Updates profile level and total_xp
   * 4. Inserts into task_completions (which triggers update_streak())
   * 5. Advances attribute XP for linked attributes
   * 6. Marks task as completed
   */
  static async completeTask(
    taskId: number,
    userId: string
  ): Promise<TaskCompletionResponse> {
    return await withTransaction(async (client) => {
      // 1. Retrieve task
      const taskRes = await client.query(
        `SELECT task_id, title, xp_reward, status FROM public.tasks WHERE task_id = $1`,
        [taskId]
      );
      if (!taskRes.rows.length) {
        throw new NotFoundError('Task', taskId);
      }
      const task = taskRes.rows[0];

      // 2. Lock profile row for atomic read-modify-write
      const profileRes = await client.query(
        `SELECT id, current_level, total_xp, current_streak, longest_streak, last_activity_date
         FROM public.profiles
         WHERE id = $1
         FOR UPDATE`,
        [userId]
      );

      if (!profileRes.rows.length) {
        throw new NotFoundError('Profile', userId);
      }

      const currentProfile = profileRes.rows[0];
      const currentLevel = parseInt(currentProfile.current_level, 10);
      const currentTotalXP = parseInt(currentProfile.total_xp, 10);
      const xpGained = parseInt(task.xp_reward, 10);

      // 3. Compute non-linear multi-level progression
      const progression = applyXPGain(currentLevel, currentTotalXP, xpGained);

      // 4. Update profiles table
      await client.query(
        `UPDATE public.profiles
         SET current_level = $1, total_xp = $2
         WHERE id = $3`,
        [progression.newLevel, progression.newTotalXP, userId]
      );

      // 5. Insert immutable completion record (Fires update_streak trigger!)
      await client.query(
        `INSERT INTO public.task_completions (task_id, profile_id, xp_awarded)
         VALUES ($1, $2, $3)`,
        [taskId, userId, xpGained]
      );

      // 6. Update task status to completed
      await client.query(
        `UPDATE public.tasks SET status = 'completed' WHERE task_id = $1`,
        [taskId]
      );

      // 7. Handle Attribute Rewards XP progression
      const attributeRewardsRes = await client.query(
        `SELECT tar.attribute_id, tar.attribute_xp_value, a.attribute_name
         FROM public.task_attribute_rewards tar
         JOIN public.attributes a ON tar.attribute_id = a.attribute_id
         WHERE tar.task_id = $1`,
        [taskId]
      );

      const attributeAdvancements: Array<{
        attribute_id: number;
        attribute_name: string;
        xp_gained: number;
        new_value: number;
        new_xp: number;
      }> = [];

      for (const attrReward of attributeRewardsRes.rows) {
        // Ensure character attribute row exists
        await client.query(
          `INSERT INTO public.profile_attributes (profile_id, attribute_id, attribute_value, attribute_xp)
           VALUES ($1, $2, 0, 0)
           ON CONFLICT (profile_id, attribute_id) DO NOTHING`,
          [userId, attrReward.attribute_id]
        );

        // Fetch current attribute stats with lock
        const attrRes = await client.query(
          `SELECT attribute_value, attribute_xp
           FROM public.profile_attributes
           WHERE profile_id = $1 AND attribute_id = $2
           FOR UPDATE`,
          [userId, attrReward.attribute_id]
        );

        const currentAttr = attrRes.rows[0];
        const attrProgression = applyAttributeXPGain(
          parseInt(currentAttr.attribute_value, 10),
          parseInt(currentAttr.attribute_xp, 10),
          parseInt(attrReward.attribute_xp_value, 10)
        );

        await client.query(
          `UPDATE public.profile_attributes
           SET attribute_value = $1, attribute_xp = $2
           WHERE profile_id = $3 AND attribute_id = $4`,
          [attrProgression.newValue, attrProgression.newXP, userId, attrReward.attribute_id]
        );

        attributeAdvancements.push({
          attribute_id: attrReward.attribute_id,
          attribute_name: attrReward.attribute_name,
          xp_gained: attrReward.attribute_xp_value,
          new_value: attrProgression.newValue,
          new_xp: attrProgression.newXP,
        });
      }

      // 8. Fetch updated profile state including newly triggered streak values
      const updatedProfileRes = await client.query(
        `SELECT current_streak, longest_streak, last_activity_date
         FROM public.profiles
         WHERE id = $1`,
        [userId]
      );
      const updatedProfile = updatedProfileRes.rows[0];

      return {
        message: progression.levelsGained > 0
          ? `🎉 Level Up! You advanced ${progression.levelsGained} level(s) to Level ${progression.newLevel}!`
          : `Task completed! Gained ${xpGained} XP.`,
        task: {
          task_id: task.task_id,
          title: task.title,
          xp_awarded: xpGained,
        },
        profile: {
          id: userId,
          current_level: progression.newLevel,
          total_xp: progression.newTotalXP,
          levels_gained: progression.levelsGained,
          progress_xp: progression.progressXP,
          xp_needed_for_next: progression.xpNeededForNext,
          current_streak: updatedProfile.current_streak,
          longest_streak: updatedProfile.longest_streak,
          last_activity_date: updatedProfile.last_activity_date,
        },
        attribute_advancements: attributeAdvancements.length > 0 ? attributeAdvancements : undefined,
      };
    });
  }

  /**
   * Retrieves paginated task completion audit history
   */
  static async getHistory(
    userId: string,
    limit = 20,
    offset = 0
  ): Promise<{ total: number; completions: TaskCompletion[] }> {
    const countRes = await query(
      `SELECT COUNT(*) as total FROM public.task_completions WHERE profile_id = $1`,
      [userId]
    );

    const { rows } = await query(
      `SELECT tc.completion_id, tc.task_id, tc.profile_id, tc.xp_awarded, tc.completed_at,
              t.title as task_title
       FROM public.task_completions tc
       JOIN public.tasks t ON tc.task_id = t.task_id
       WHERE tc.profile_id = $1
       ORDER BY tc.completed_at DESC
       LIMIT $2 OFFSET $3`,
      [userId, limit, offset]
    );

    return {
      total: parseInt(countRes.rows[0]?.total || '0', 10),
      completions: rows,
    };
  }
}
