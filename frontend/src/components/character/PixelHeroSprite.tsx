import { useGameStore } from '../../store/gameStore'

interface PixelHeroSpriteProps {
  pose?: 'idle' | 'attack' | 'cast' | 'cheer'
  resting?: boolean
  size?: number
}

export function PixelHeroSprite({ pose = 'idle', resting = false, size = 80 }: PixelHeroSpriteProps) {
  const { shopItems } = useGameStore()
  const poseClass = pose === 'attack' ? 'scale-105' : pose === 'cheer' ? 'animate-bounce' : ''
  const restingClass = resting ? 'opacity-90 scale-95' : ''

  // Find equipped wearables by item ID
  const isEquipped = (id: number) => shopItems.some((i) => i.id === id && i.isEquipped)

  const hasSilverSword = isEquipped(1)
  const hasVikingHelm = isEquipped(2)
  const hasBucklerShield = isEquipped(3)
  const hasHealthPotion = isEquipped(4)
  const hasLeatherVest = isEquipped(5)
  const hasGhostMask = isEquipped(6)
  const hasGhostWisp = isEquipped(7)
  const hasLanternHalberd = isEquipped(8)
  const hasRoyalPlate = isEquipped(9)
  const hasCrown = isEquipped(10)
  const hasCloak = isEquipped(11)
  const hasSunfireSword = isEquipped(12)
  const hasExcalibur = isEquipped(13)
  const hasAegisImmortal = isEquipped(14)
  const hasAstralRegalia = isEquipped(15)

  return (
    <div className={`relative inline-flex items-center justify-center ${poseClass} ${restingClass}`} style={{ width: size, height: size }}>
      {/* Ghost Wisp Companion (Floating Pet) */}
      {hasGhostWisp && (
        <div className="absolute -top-1 -right-1 z-20 animate-bounce pointer-events-none">
          <svg width={size * 0.38} height={size * 0.38} viewBox="0 0 10 10" style={{ imageRendering: 'pixelated' }}>
            {/* Ghost Head & Body */}
            <rect x="2" y="1" width="6" height="5" fill="#e0f2fe" />
            <rect x="1" y="2" width="8" height="4" fill="#bae6fd" />
            <rect x="3" y="0" width="4" height="1" fill="#7dd3fc" />
            {/* Wisp tail */}
            <rect x="2" y="6" width="2" height="2" fill="#38bdf8" />
            <rect x="5" y="6" width="2" height="1" fill="#38bdf8" />
            <rect x="7" y="7" width="1" height="2" fill="#0284c7" />
            {/* Blue Cute Face */}
            <rect x="3" y="3" width="1.5" height="1.5" fill="#0369a1" />
            <rect x="6" y="3" width="1.5" height="1.5" fill="#0369a1" />
            <rect x="4" y="5" width="2" height="1" fill="#0284c7" />
          </svg>
        </div>
      )}

      {/* Hero 24x24 Pixel Sprite */}
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        style={{ imageRendering: 'pixelated' }}
        className="overflow-visible"
      >
        {/* ================= 0. GROUND SHADOW ================= */}
        <ellipse cx="12" cy="22" rx="6" ry="1.5" fill="#000000" fillOpacity="0.4" />

        {/* ================= 1. BACK CLOAK ================= */}
        {hasCloak && (
          <>
            {/* Flowing Royal Crimson & Gold Mantle */}
            <rect x="6" y="10" width="12" height="8" fill="#991b1b" />
            <rect x="5" y="11" width="14" height="6" fill="#b91c1c" />
            <rect x="5" y="17" width="14" height="2" fill="#fbbf24" />
            <rect x="6" y="19" width="12" height="1" fill="#d97706" />
          </>
        )}

        {/* ================= 2. LEGS & SHOES ================= */}
        {/* Dark Brown Trousers / Pants */}
        <rect x="9" y="16" width="2.5" height="4" fill="#3f2010" />
        <rect x="12.5" y="16" width="2.5" height="4" fill="#3f2010" />
        {/* Dark Leather Boots / Shoes */}
        <rect x="8" y="20" width="3.5" height="2" fill="#1c1008" />
        <rect x="12.5" y="20" width="3.5" height="2" fill="#1c1008" />
        <rect x="8" y="21" width="3.5" height="1" fill="#0a0502" />
        <rect x="12.5" y="21" width="3.5" height="1" fill="#0a0502" />

        {/* ================= 3. TORSO & SHIRT ================= */}
        {hasAstralRegalia ? (
          /* Emperor's Astral Regalia - Ornate Gold & Deep Astral Cosmic Robe */
          <>
            <rect x="8" y="10" width="8" height="6" fill="#3b0764" />
            <rect x="9" y="11" width="6" height="4" fill="#6b21a8" />
            <rect x="11" y="11" width="2" height="4" fill="#fbbf24" />
            {/* Gilded Astral Pauldrons */}
            <rect x="6" y="9" width="3" height="4" fill="#f59e0b" />
            <rect x="15" y="9" width="3" height="4" fill="#f59e0b" />
            <rect x="7" y="10" width="1" height="2" fill="#ffffff" />
            <rect x="16" y="10" width="1" height="2" fill="#ffffff" />
          </>
        ) : hasRoyalPlate ? (
          /* Blue Knight Steel Heavy Plate Armor */
          <>
            <rect x="8" y="10" width="8" height="6" fill="#1e3a8a" />
            <rect x="9" y="11" width="6" height="4" fill="#2563eb" />
            <rect x="11" y="11" width="2" height="4" fill="#93c5fd" />
            {/* Heavy Steel Pauldrons (Shoulders) */}
            <rect x="6" y="10" width="3" height="3" fill="#cbd5e1" />
            <rect x="15" y="10" width="3" height="3" fill="#cbd5e1" />
            <rect x="7" y="11" width="1" height="1" fill="#ffffff" />
            <rect x="16" y="11" width="1" height="1" fill="#ffffff" />
          </>
        ) : hasLeatherVest ? (
          /* Leather Bandit Vest */
          <>
            <rect x="8" y="10" width="8" height="6" fill="#78350f" />
            <rect x="9" y="11" width="6" height="4" fill="#92400e" />
            <rect x="10" y="11" width="4" height="2" fill="#b45309" />
            {/* Studs */}
            <rect x="9" y="12" width="1" height="1" fill="#fbbf24" />
            <rect x="14" y="12" width="1" height="1" fill="#fbbf24" />
          </>
        ) : (
          /* Base Blue Adventurer Tunic */
          <>
            <rect x="8" y="10" width="8" height="6" fill="#1d4ed8" />
            <rect x="9" y="10" width="6" height="5" fill="#2563eb" />
            <rect x="10" y="10" width="4" height="2" fill="#fed7aa" /> {/* Neck cutout */}
          </>
        )}

        {/* Belt */}
        <rect x="8" y="15" width="8" height="1.5" fill="#451a03" />
        <rect x="11" y="15" width="2" height="1.5" fill="#eab308" />

        {/* Health Potion on Belt */}
        {hasHealthPotion && (
          <>
            <rect x="15" y="14" width="2" height="3" fill="#dc2626" />
            <rect x="15.5" y="13.5" width="1" height="1" fill="#e2e8f0" />
            <rect x="15" y="15" width="1" height="1" fill="#fca5a5" />
          </>
        )}

        {/* ================= 4. ARMS & HANDS ================= */}
        {/* Left Arm (Player's Right) */}
        <rect x="6.5" y="11" width="2" height="4" fill="#1d4ed8" />
        <rect x="6.5" y="14" width="2" height="2" fill="#fed7aa" /> {/* Left Hand */}

        {/* Right Arm (Player's Left) */}
        <rect x="15.5" y="11" width="2" height="4" fill="#1d4ed8" />
        <rect x="15.5" y="14" width="2" height="2" fill="#fed7aa" /> {/* Right Hand */}

        {/* ================= 5. HEAD & FACE ================= */}
        {/* Face Base */}
        <rect x="8" y="4" width="8" height="7" fill="#fed7aa" />
        {/* Cheeks blush */}
        <rect x="8" y="8" width="1.5" height="1" fill="#fca5a5" />
        <rect x="14.5" y="8" width="1.5" height="1" fill="#fca5a5" />

        {hasGhostMask ? (
          /* Spirit Ghost Mask */
          <>
            <rect x="8" y="4" width="8" height="7" fill="#e0f2fe" />
            <rect x="9" y="6" width="2" height="2" fill="#0284c7" />
            <rect x="13" y="6" width="2" height="2" fill="#0284c7" />
            <rect x="10" y="9" width="4" height="1.5" fill="#0369a1" />
          </>
        ) : resting ? (
          /* Peaceful closed sleeping eyes */
          <>
            <rect x="9" y="7" width="2" height="1" fill="#451a03" />
            <rect x="13" y="7" width="2" height="1" fill="#451a03" />
            <rect x="11" y="9" width="2" height="0.8" fill="#78350f" />
          </>
        ) : (
          /* Expressive Cute Pixel Eyes & Smile */
          <>
            {/* Left Eye */}
            <rect x="9" y="6" width="2" height="2" fill="#ffffff" />
            <rect x="9.5" y="6.5" width="1.5" height="1.5" fill="#0f172a" />
            {/* Right Eye */}
            <rect x="13" y="6" width="2" height="2" fill="#ffffff" />
            <rect x="13.5" y="6.5" width="1.5" height="1.5" fill="#0f172a" />
            {/* Smile */}
            <rect x="11" y="9" width="2" height="1" fill="#78350f" />
          </>
        )}

        {/* Shaggy Black Hair */}
        <rect x="7" y="2" width="10" height="3" fill="#0f172a" />
        <rect x="6" y="3" width="12" height="3" fill="#0f172a" />
        <rect x="6" y="5" width="2" height="4" fill="#0f172a" />
        <rect x="16" y="5" width="2" height="4" fill="#0f172a" />
        <rect x="8" y="4" width="2" height="1" fill="#0f172a" />
        <rect x="14" y="4" width="2" height="1" fill="#0f172a" />

        {/* ================= 6. HEADWEAR OVERLAYS ================= */}
        {hasCrown ? (
          /* Royal 3-Spire Gold Crown with Ruby Jewels */
          <>
            <rect x="7" y="0" width="10" height="3" fill="#fbbf24" />
            <rect x="7" y="0" width="2" height="3" fill="#f59e0b" />
            <rect x="11" y="0" width="2" height="3" fill="#f59e0b" />
            <rect x="15" y="0" width="2" height="3" fill="#f59e0b" />
            {/* Ruby / Sapphire Gems */}
            <rect x="7.5" y="1.5" width="1" height="1" fill="#ef4444" />
            <rect x="11.5" y="1" width="1" height="1" fill="#3b82f6" />
            <rect x="15.5" y="1.5" width="1" height="1" fill="#ef4444" />
            <rect x="7" y="3" width="10" height="1" fill="#d97706" />
          </>
        ) : hasVikingHelm ? (
          /* Viking Horned Helmet */
          <>
            {/* Helmet Cap */}
            <rect x="6.5" y="2" width="11" height="4" fill="#78350f" />
            <rect x="7" y="1.5" width="10" height="2" fill="#92400e" />
            <rect x="6.5" y="4.5" width="11" height="1.5" fill="#475569" /> {/* Metal rim */}
            <rect x="11.5" y="4.5" width="1" height="1.5" fill="#fbbf24" /> {/* Center rivet */}
            {/* Left Horn */}
            <rect x="4" y="1" width="3" height="2" fill="#f1f5f9" />
            <rect x="3" y="0" width="2" height="2" fill="#ffffff" />
            <rect x="2.5" y="0" width="1" height="1" fill="#e2e8f0" />
            {/* Right Horn */}
            <rect x="17" y="1" width="3" height="2" fill="#f1f5f9" />
            <rect x="19" y="0" width="2" height="2" fill="#ffffff" />
            <rect x="20.5" y="0" width="1" height="1" fill="#e2e8f0" />
          </>
        ) : null}

        {/* ================= 7. SHIELD (LEFT HAND) ================= */}
        {hasAegisImmortal ? (
          /* Aegis of the Eternal Immortal - Celestial Starmetal Barrier */
          <>
            <rect x="1" y="10" width="7" height="9" fill="#1e1b4b" />
            <rect x="1.5" y="10.5" width="6" height="8" fill="#312e81" />
            <rect x="2.5" y="11.5" width="4" height="6" fill="#6366f1" />
            {/* Diamond Starlight Core */}
            <rect x="3.5" y="13.5" width="2" height="2" fill="#ffffff" />
            <rect x="4" y="13" width="1" height="3" fill="#a5f3fc" />
            <rect x="3" y="14" width="3" height="1" fill="#a5f3fc" />
            <circle cx="4.5" cy="14.5" r="3" fill="#818cf8" fillOpacity="0.3" />
          </>
        ) : hasBucklerShield ? (
          /* Round Wooden Buckler Shield */
          <>
            <rect x="2.5" y="11" width="5" height="7" fill="#78350f" />
            <rect x="2" y="12" width="6" height="5" fill="#92400e" />
            <rect x="1.5" y="13" width="7" height="3" fill="#78350f" />
            {/* Brass Rim & Center Boss */}
            <rect x="3" y="11" width="4" height="1" fill="#fbbf24" />
            <rect x="3" y="17" width="4" height="1" fill="#fbbf24" />
            <rect x="4" y="13.5" width="2" height="2" fill="#f59e0b" />
            <rect x="4.5" y="14" width="1" height="1" fill="#ffffff" />
          </>
        ) : null}

        {/* ================= 8. WEAPON (RIGHT HAND) ================= */}
        {hasExcalibur ? (
          /* Excalibur of the Sun God (1-Year Mythic Transcendent Blade) */
          <>
            {/* Ornate Gold Solar Hilt */}
            <rect x="15" y="13" width="6" height="1.5" fill="#f59e0b" />
            <rect x="16" y="12" width="4" height="1" fill="#fbbf24" />
            <rect x="17.5" y="14.5" width="1.5" height="3" fill="#92400e" />
            <rect x="17" y="17.5" width="2.5" height="1.5" fill="#fbbf24" />
            <circle cx="18" cy="13.75" r="1.2" fill="#ef4444" />

            {/* Transcendent Pure Sunbeam Blade */}
            <rect x="17" y="3" width="3.5" height="10" fill="#fef08a" />
            <rect x="17.5" y="1" width="2.5" height="12" fill="#ffffff" />
            <rect x="18" y="0" width="1.5" height="13" fill="#ffffff" />
            <rect x="18.5" y="-1" width="1" height="14" fill="#ffffff" />

            {/* Solar Aura Rays */}
            <rect x="16" y="2" width="1" height="3" fill="#fbbf24" />
            <rect x="21" y="1" width="1" height="3" fill="#fbbf24" />
            <rect x="20.5" y="6" width="1.5" height="2" fill="#f59e0b" />
            <circle cx="18.5" cy="4" r="5" fill="#fef08a" fillOpacity="0.3" />
          </>
        ) : hasSunfireSword ? (
          /* Sunfire Greatsword (Colossal Blade Bathed in Solar Flame) */
          <>
            {/* Golden Sun Crossguard & Hilt */}
            <rect x="15.5" y="13" width="5" height="1.5" fill="#f59e0b" />
            <rect x="16.5" y="12.5" width="3" height="0.5" fill="#fbbf24" />
            <rect x="17.5" y="14.5" width="1.5" height="2.5" fill="#78350f" />
            <rect x="17" y="17" width="2.5" height="1" fill="#f59e0b" />
            <circle cx="18" cy="13.75" r="0.8" fill="#ef4444" />

            {/* Radiant Solar Blade */}
            <rect x="17" y="6" width="3.5" height="7" fill="#ea580c" />
            <rect x="17.5" y="5" width="3" height="8" fill="#f97316" />
            <rect x="18" y="3" width="2.5" height="10" fill="#fbbf24" />
            <rect x="18.5" y="1" width="2" height="11" fill="#fef08a" />
            <rect x="19" y="0" width="1" height="10" fill="#ffffff" />

            {/* Fiery Solar Ember Flames */}
            <rect x="16.5" y="4" width="1" height="2" fill="#ef4444" />
            <rect x="21" y="2" width="1" height="2" fill="#f97316" />
            <rect x="20.5" y="6" width="1" height="3" fill="#ea580c" />
            <circle cx="19" cy="5" r="3.5" fill="#fbbf24" fillOpacity="0.2" />
          </>
        ) : hasLanternHalberd ? (
          /* Lantern Halberd Polearm with Glowing Lantern */
          <>
            {/* Wooden Shaft */}
            <rect x="18" y="2" width="1.5" height="19" fill="#78350f" />
            <rect x="17.5" y="0" width="2.5" height="3" fill="#e2e8f0" />
            <rect x="18" y="0" width="1.5" height="1" fill="#ffffff" />
            <rect x="19.5" y="4" width="2.5" height="1" fill="#94a3b8" />
            <rect x="21" y="5" width="1" height="2" fill="#64748b" />
            <rect x="20" y="7" width="3" height="4" fill="#0f172a" />
            <rect x="20.5" y="7.5" width="2" height="3" fill="#f59e0b" />
            <rect x="21" y="8" width="1" height="2" fill="#fef08a" />
            <circle cx="21.5" cy="9" r="2.5" fill="#fbbf24" fillOpacity="0.25" />
          </>
        ) : hasSilverSword ? (
          /* Silver Adventurer Sword (Diagonal Upward Blade) */
          <>
            {/* Crossguard & Pommel */}
            <rect x="16.5" y="13" width="3" height="1" fill="#fbbf24" />
            <rect x="17.5" y="14" width="1" height="2" fill="#78350f" />
            <rect x="17" y="16" width="2" height="1" fill="#fbbf24" />
            {/* Silver Blade */}
            <rect x="17.5" y="7" width="2" height="6" fill="#f8fafc" />
            <rect x="18.5" y="6" width="2" height="6" fill="#f8fafc" />
            <rect x="19.5" y="4" width="2" height="4" fill="#ffffff" />
            <rect x="20.5" y="3" width="1.5" height="2" fill="#ffffff" />
            <rect x="17.5" y="8" width="1" height="5" fill="#94a3b8" />
          </>
        ) : null}
      </svg>
    </div>
  )
}
