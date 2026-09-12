export type CoreAttributeName = 'Strength' | 'Intellect' | 'Discipline' | 'Vitality' | 'Charisma' | 'Agility'

export interface AttributeBonusInfo {
  attributeName: CoreAttributeName
  xpValue: number
  icon: string
  badgeColor: string
  textColor: string
}

export const ATTRIBUTE_CONFIG: Record<
  CoreAttributeName,
  { icon: string; description: string; badgeColor: string; textColor: string; keywords: string[]; sampleTasks: string }
> = {
  Intellect: {
    icon: '🧠',
    description: 'Problem solving, deep work, coding, learning, and algorithmic reasoning.',
    badgeColor: 'border-blue-500/40 bg-blue-500/15 text-blue-300',
    textColor: 'text-blue-400',
    keywords: ['code', 'coding', 'dev', 'build', 'program', 'algorithm', 'study', 'read', 'book', 'learn', 'course', 'math', 'school', 'research', 'homework', 'exam', 'write', 'writing', 'debug'],
    sampleTasks: 'Coding, Reading, Deep Work, Math & School',
  },
  Strength: {
    icon: '💪',
    description: 'Physical power, resistance training, gym workouts, and athletic performance.',
    badgeColor: 'border-orange-500/40 bg-orange-500/15 text-orange-300',
    textColor: 'text-orange-400',
    keywords: ['gym', 'workout', 'lift', 'lifting', 'weights', 'pushup', 'push-up', 'pullup', 'squat', 'bench', 'exercise', 'train', 'muscle', 'crossfit', 'athletics'],
    sampleTasks: 'Gym Workouts, Heavy Lifting, Strength Circuits',
  },
  Vitality: {
    icon: '❤️',
    description: 'Sleep quality, nutrition, hydration, mental peace, and physical recovery.',
    badgeColor: 'border-emerald-500/40 bg-emerald-500/15 text-emerald-300',
    textColor: 'text-emerald-400',
    keywords: ['sleep', 'rest', 'water', 'hydrate', 'health', 'wellness', 'meditat', 'diet', 'meal', 'nutrition', 'stretch', 'walk', 'breathe', 'recover', 'yoga'],
    sampleTasks: 'Sleep By Midnight, Hydration, Meditation & Clean Diet',
  },
  Discipline: {
    icon: '🛡️',
    description: 'Habit adherence, morning routines, avoiding distractions, and domestic order.',
    badgeColor: 'border-amber-500/40 bg-amber-500/15 text-amber-300',
    textColor: 'text-amber-400',
    keywords: ['chore', 'clean', 'cleaning', 'laundry', 'room', 'habit', 'early', 'routine', 'organize', 'budget', 'focus', 'pomodoro', 'no sugar', 'discipline'],
    sampleTasks: 'Household Chores, Early Rising, Habit Building',
  },
  Charisma: {
    icon: '👥',
    description: 'Collaboration, public speaking, leadership, teamwork, and networking.',
    badgeColor: 'border-purple-500/40 bg-purple-500/15 text-purple-300',
    textColor: 'text-purple-400',
    keywords: ['team', 'teams', 'meeting', 'sync', 'call', 'interview', 'presentation', 'network', 'networking', 'lead', 'client', 'speech', 'social'],
    sampleTasks: 'Team Standups, Client Presentations, Networking',
  },
  Agility: {
    icon: '⚡',
    description: 'Speed of execution, cardiovascular endurance, quick reflexes, and sprints.',
    badgeColor: 'border-yellow-500/40 bg-yellow-500/15 text-yellow-300',
    textColor: 'text-yellow-400',
    keywords: ['run', 'running', 'sprint', 'jog', 'cardio', 'swim', 'cycling', 'bike', 'fast', 'quick', 'reflex', 'hiit'],
    sampleTasks: 'Cardio Runs, Sprints, HIIT & Cycling',
  },
}

/**
 * Categorizes a task based on its tags and title keywords to determine which
 * character attributes will level up upon completion.
 */
export function categorizeTaskAttributes(
  title: string,
  tags?: string[],
  difficulty: number = 1
): AttributeBonusInfo[] {
  const t = title.toLowerCase()
  const assigned = new Map<CoreAttributeName, number>()

  // Base stat XP scaling based on difficulty tier
  const baseStatXP = Math.max(15, difficulty * 15)

  // 1. Tag-based categorization
  if (tags && tags.length > 0) {
    for (const tag of tags) {
      if (tag === 'Work' || tag === 'School' || tag === 'Creativity') {
        assigned.set('Intellect', (assigned.get('Intellect') ?? 0) + baseStatXP)
      }
      if (tag === 'Exercise') {
        assigned.set('Strength', (assigned.get('Strength') ?? 0) + baseStatXP)
        assigned.set('Agility', (assigned.get('Agility') ?? 0) + Math.round(baseStatXP * 0.75))
      }
      if (tag === 'Health + Wellness') {
        assigned.set('Vitality', (assigned.get('Vitality') ?? 0) + baseStatXP)
      }
      if (tag === 'Chores') {
        assigned.set('Discipline', (assigned.get('Discipline') ?? 0) + baseStatXP)
      }
      if (tag === 'Teams') {
        assigned.set('Charisma', (assigned.get('Charisma') ?? 0) + baseStatXP)
      }
    }
  }

  // 2. Keyword heuristic categorization from Title
  for (const [attrName, config] of Object.entries(ATTRIBUTE_CONFIG) as [CoreAttributeName, typeof ATTRIBUTE_CONFIG[CoreAttributeName]][]) {
    const hasKeywordMatch = config.keywords.some((kw) => t.includes(kw))
    if (hasKeywordMatch) {
      assigned.set(attrName, Math.max(assigned.get(attrName) ?? 0, baseStatXP))
    }
  }

  // 3. Fallback default if unassigned
  if (assigned.size === 0) {
    assigned.set('Discipline', baseStatXP)
  }

  const result: AttributeBonusInfo[] = []
  for (const [attrName, xpValue] of assigned.entries()) {
    const config = ATTRIBUTE_CONFIG[attrName]
    result.push({
      attributeName: attrName,
      xpValue,
      icon: config.icon,
      badgeColor: config.badgeColor,
      textColor: config.textColor,
    })
  }

  return result
}
