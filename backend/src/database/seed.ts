import { pool } from '../config/database';

export async function seedCatalog() {
  console.log('🌱 Seeding Life RPG catalog (attributes and items)...');

  const defaultAttributes = [
    { name: 'Strength', desc: 'Physical power, workout persistence, and raw athletic capacity.' },
    { name: 'Intellect', desc: 'Problem solving, deep study, coding, reading, and knowledge retention.' },
    { name: 'Discipline', desc: 'Consistency, waking early, habit building, and avoiding distractions.' },
    { name: 'Agility', desc: 'Speed of execution, multitasking efficiency, and quick reflexes.' },
    { name: 'Vitality', desc: 'Sleep quality, nutrition, hydration, and energy recovery.' },
    { name: 'Charisma', desc: 'Networking, public speaking, teamwork, and social leadership.' },
  ];

  const defaultItems = [
    { name: 'Elixir of Focus', type: 'consumable', desc: 'Grants clarity for high-intensity deep work sessions.', rarity: 'uncommon' },
    { name: 'Tome of Wisdom', type: 'cosmetic', desc: 'A rare leatherbound book symbolizing extensive learning.', rarity: 'rare' },
    { name: 'Iron Dumbbell Trophy', type: 'cosmetic', desc: 'Awarded to heroes who conquer intense physical routines.', rarity: 'uncommon' },
    { name: 'Chronos Stopwatch', type: 'weapon', desc: 'A tactical artifact used to master Pomodoro intervals.', rarity: 'epic' },
    { name: 'Aegis of Discipline', type: 'weapon', desc: 'Legendary aura protecting against procrastination.', rarity: 'legendary' },
    { name: 'Mana Coffee', type: 'consumable', desc: 'Instant vitality boost for late-night sprints.', rarity: 'common' },
  ];

  try {
    for (const attr of defaultAttributes) {
      await pool.query(
        `INSERT INTO public.attributes (attribute_name, description)
         VALUES ($1, $2)
         ON CONFLICT (attribute_name) DO UPDATE
         SET description = EXCLUDED.description`,
        [attr.name, attr.desc]
      );
    }
    console.log(`✅ Seeded ${defaultAttributes.length} core attributes.`);

    for (const item of defaultItems) {
      await pool.query(
        `INSERT INTO public.items (item_name, item_type, description, rarity)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT DO NOTHING`,
        [item.name, item.type, item.desc, item.rarity]
      );
    }
    console.log(`✅ Seeded ${defaultItems.length} starter catalog items.`);
    console.log('✨ Life RPG catalog seeding completed!');
  } catch (error: any) {
    console.error('❌ Failed to seed catalog:', error.message);
    throw error;
  }
}

if (require.main === module) {
  seedCatalog()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}
