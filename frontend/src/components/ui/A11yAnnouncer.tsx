import { useEffect, useState } from 'react'
import { useGameStore } from '../../store/gameStore'

/**
 * Screen Reader Live Region Announcer.
 * Automatically vocalizes important RPG events (level-ups, quest completions, gold gains, boss hits)
 * for screen readers (NVDA, JAWS, VoiceOver, Narrator) via aria-live="polite".
 */
export function A11yAnnouncer() {
  const [announcement, setAnnouncement] = useState<string>('')
  const lastCompletion = useGameStore((state) => state.lastCompletion)
  const celebration = useGameStore((state) => state.celebration)
  const lootDrop = useGameStore((state) => state.lootDrop)
  const bossVictoryReward = useGameStore((state) => state.bossVictoryReward)

  useEffect(() => {
    if (lastCompletion) {
      setAnnouncement(`Quest completed: ${lastCompletion.task.title}. Awarded ${lastCompletion.task.xp_awarded} Experience Points.`)
    }
  }, [lastCompletion])

  useEffect(() => {
    if (celebration?.type === 'LEVEL_UP') {
      setAnnouncement(`Celebration! Level Up! Reached character Level ${celebration.level}. Earned ${celebration.coinsEarned} gold coins.`)
    } else if (celebration?.type === 'ITEM_PURCHASED') {
      setAnnouncement(`Item acquired: ${celebration.item?.name}. Added to inventory.`)
    }
  }, [celebration])

  useEffect(() => {
    if (lootDrop) {
      setAnnouncement(`Mystery loot discovered! Found ${lootDrop.name} of ${lootDrop.rarity} rarity.`)
    }
  }, [lootDrop])

  useEffect(() => {
    if (bossVictoryReward) {
      setAnnouncement(`Victory! World Boss ${bossVictoryReward.boss.name} defeated! Claimed ${bossVictoryReward.coins} gold coins and ${bossVictoryReward.xp} XP.`)
    }
  }, [bossVictoryReward])

  return (
    <div
      role="status"
      aria-live="polite"
      aria-atomic="true"
      className="sr-only pointer-events-none"
    >
      {announcement}
    </div>
  )
}
