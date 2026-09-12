import {
  totalXPForLevel,
  applyXPGain,
  applyAttributeXPGain,
  BASE_XP,
  EXPONENT,
} from '../src/services/progression.service';

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ Assertion Failed: ${message}`);
    process.exit(1);
  }
  console.log(`✅ Passed: ${message}`);
}

console.log('🧪 Running Progression Engine Unit Tests...\n');

// Test 1: Cumulative XP Thresholds
console.log('--- Test 1: Cumulative XP Thresholds ---');
assert(totalXPForLevel(1) === 0, 'Level 1 cumulative XP must be 0');
assert(totalXPForLevel(2) === 100, 'Level 2 cumulative XP must be 100');

const lvl5XP = totalXPForLevel(5);
assert(lvl5XP === 696, `Level 5 XP should be 696 (actual: ${lvl5XP})`);

const lvl10XP = totalXPForLevel(10);
assert(lvl10XP === 2167, `Level 10 XP should be 2167 (actual: ${lvl10XP})`);

// Test 2: Single Level Up
console.log('\n--- Test 2: Single Level Up ---');
const gain1 = applyXPGain(1, 0, 100);
assert(gain1.newLevel === 2, 'Level 1 with 0 XP + 100 XP should reach Level 2');
assert(gain1.levelsGained === 1, 'Should have gained 1 level');
assert(gain1.newTotalXP === 100, 'New total XP should be 100');
assert(gain1.progressXP === 0, 'Progress XP into Level 2 should be 0');

// Test 3: Partial XP Gain (No Level Up)
console.log('\n--- Test 3: Partial XP (No Level Up) ---');
const gain2 = applyXPGain(1, 0, 50);
assert(gain2.newLevel === 1, '50 XP should remain at Level 1');
assert(gain2.levelsGained === 0, 'Should have gained 0 levels');
assert(gain2.progressXP === 50, 'Progress XP should be 50');
assert(gain2.xpNeededForNext === 100, 'XP needed for next level should be 100');

// Test 4: Multi-Level-Up Cascade (Large XP Grant)
console.log('\n--- Test 4: Multi-Level-Up Cascade (10,000 XP) ---');
const largeGain = applyXPGain(1, 0, 10000);
assert(largeGain.newLevel >= 20, `10,000 XP should cascade past Level 20 (reached Level ${largeGain.newLevel})`);
assert(largeGain.levelsGained === largeGain.newLevel - 1, 'levelsGained matches newLevel - 1');
assert(largeGain.newTotalXP === 10000, 'Total cumulative XP is preserved exactly');
assert(largeGain.progressXP >= 0, 'Progress XP is non-negative');
assert(largeGain.xpNeededForNext > 0, 'XP needed for next is positive');

// Test 5: Stat Attribute Progression
console.log('\n--- Test 5: Attribute XP Progression ---');
const attrGain = applyAttributeXPGain(1, 0, 250);
assert(attrGain.newValue >= 2, `Stat value should level up to at least 2 with 250 XP (got ${attrGain.newValue})`);
assert(attrGain.newXP === 250, 'Attribute cumulative XP matches 250');

console.log('\n🎉 All Progression Engine tests passed successfully!');
