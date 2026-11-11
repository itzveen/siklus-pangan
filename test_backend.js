import test from 'node:test';
import assert from 'node:assert/strict';
import {
  INITIAL_FOOD_ITEMS,
  INITIAL_COMPOST_BATCHES,
  INITIAL_HARVEST_HISTORY,
  INITIAL_IMPACT_STATS,
  INITIAL_USER_PROFILE,
  INITIAL_AI_HISTORY,
  INITIAL_NOTIFICATIONS
} from './src/services/dummyData.js';

test('1. Seed Data Deterministik: Food items memiliki status safe, warning, dan spoiled', () => {
  assert.ok(Array.isArray(INITIAL_FOOD_ITEMS));
  assert.ok(INITIAL_FOOD_ITEMS.length >= 5);
  const statuses = new Set(INITIAL_FOOD_ITEMS.map(item => item.status));
  assert.ok(statuses.has('safe'), 'Harus ada bahan segar (safe)');
  assert.ok(statuses.has('warning'), 'Harus ada bahan hampir basi (warning)');
  assert.ok(statuses.has('spoiled'), 'Harus ada bahan basi (spoiled)');
});

test('2. Smart Compost Batch: Memiliki fase filling (Batch #1) dan curing 14 hari (Batch #2)', () => {
  assert.equal(INITIAL_COMPOST_BATCHES.length, 2);
  const fillingBatch = INITIAL_COMPOST_BATCHES.find(b => b.stage === 'filling');
  const curingBatch = INITIAL_COMPOST_BATCHES.find(b => b.stage === 'curing');
  assert.ok(fillingBatch, 'Harus ada Batch #1 fase filling');
  assert.ok(curingBatch, 'Harus ada Batch #2 fase curing');
  assert.ok(Array.isArray(fillingBatch.logs) && fillingBatch.logs.length > 0);
});

test('3. One-Shot AI History: Menyimpan riwayat Resep & Kompos dengan status readOnly', () => {
  assert.ok(INITIAL_AI_HISTORY.length >= 4);
  for (const chat of INITIAL_AI_HISTORY) {
    assert.equal(chat.readOnly, true, 'Balasan AI harus one-shot read-only sesuai Figma');
    assert.ok(chat.type === 'recipe' || chat.type === 'compost');
    assert.ok(Array.isArray(chat.tags) && chat.tags.length > 0);
  }
});

test('4. User Profile & Impact Stats: Struktur sesuai layar Pengaturan & Dashboard Figma', () => {
  assert.ok(INITIAL_USER_PROFILE.householdType === 'house' || INITIAL_USER_PROFILE.householdType === 'apartment');
  assert.ok(typeof INITIAL_USER_PROFILE.notificationHour === 'string');
  assert.ok(typeof INITIAL_IMPACT_STATS.rescuedFoodKg === 'number');
  assert.ok(typeof INITIAL_IMPACT_STATS.co2ePreventedKg === 'number');
  assert.ok(INITIAL_HARVEST_HISTORY.length >= 1);
  assert.ok(INITIAL_NOTIFICATIONS.length >= 1);
});
