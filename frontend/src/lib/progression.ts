const BASE_XP = 100
const EXPONENT = 1.4

export function totalXPForLevel(level: number): number {
  if (level <= 1) return 0
  return Math.floor(BASE_XP * Math.pow(level - 1, EXPONENT))
}

export function xpBarPercent(progressXp: number, xpNeeded: number): number {
  if (xpNeeded <= 0) return 100
  return Math.max(0, Math.min(100, (progressXp / xpNeeded) * 100))
}

export function difficultyLabel(difficulty: number): string {
  const labels: Record<number, string> = {
    1: 'Novice',
    2: 'Adept',
    3: 'Veteran',
    4: 'Elite',
    5: 'Legendary',
  }
  return labels[difficulty] ?? 'Quest'
}

export function applyXPGain(currentLevel: number, currentTotalXP: number, xpGained: number) {
  const newTotalXP = Math.max(0, currentTotalXP + xpGained)
  let level = Math.max(1, currentLevel)

  while (newTotalXP >= totalXPForLevel(level + 1)) {
    level += 1
  }

  const currentThreshold = totalXPForLevel(level)
  const nextThreshold = totalXPForLevel(level + 1)

  return {
    newLevel: level,
    newTotalXP,
    levelsGained: level - currentLevel,
    progressXP: newTotalXP - currentThreshold,
    xpNeededForNext: nextThreshold - currentThreshold,
  }
}
