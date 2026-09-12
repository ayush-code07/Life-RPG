import { ProgressionResult } from '../types';

export const BASE_XP = 100;
export const EXPONENT = 1.4;

/**
 * Calculates the cumulative total lifetime XP required to achieve a given level.
 * Level 1 requires 0 XP.
 * TotalXPForLevel(L) = floor( BASE_XP * (L - 1) ^ EXPONENT )
 */
export function totalXPForLevel(level: number): number {
  if (level <= 1) return 0;
  return Math.floor(BASE_XP * Math.pow(level - 1, EXPONENT));
}

/**
 * Applies an XP gain to a character/profile, cascading through multi-level-ups
 * in a single atomic calculation.
 *
 * @param currentLevel  Current character level
 * @param currentTotalXP Current cumulative lifetime XP banked
 * @param xpGained       XP awarded from completing a quest/task
 */
export function applyXPGain(
  currentLevel: number,
  currentTotalXP: number,
  xpGained: number
): ProgressionResult {
  const newTotalXP = Math.max(0, currentTotalXP + xpGained);
  let level = Math.max(1, currentLevel);

  // Cascade: keep leveling up as long as accumulated XP clears the threshold for the NEXT level
  while (newTotalXP >= totalXPForLevel(level + 1)) {
    level += 1;
  }

  const levelsGained = level - currentLevel;
  const currentThreshold = totalXPForLevel(level);
  const nextThreshold = totalXPForLevel(level + 1);

  return {
    newLevel: level,
    newTotalXP,
    levelsGained,
    progressXP: newTotalXP - currentThreshold, // Current progress bar position
    xpNeededForNext: nextThreshold - currentThreshold, // Full width of next level bar
  };
}

/**
 * Applies XP gain to an individual character attribute (e.g., Intellect, Strength).
 */
export function applyAttributeXPGain(
  currentValue: number,
  currentAttributeXP: number,
  xpGained: number
): {
  newValue: number;
  newXP: number;
  valueGained: number;
} {
  const progression = applyXPGain(
    Math.max(1, currentValue || 1),
    currentAttributeXP || 0,
    xpGained
  );

  return {
    newValue: progression.newLevel,
    newXP: progression.newTotalXP,
    valueGained: progression.levelsGained,
  };
}
