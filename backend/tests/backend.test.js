import test from 'node:test';
import assert from 'node:assert/strict';
import * as store from '../services/storageService.js';

// Mock localStorage in Node test runtime
const memoryStore = new Map();
globalThis.localStorage = {
  getItem: (k) => (memoryStore.has(k) ? memoryStore.get(k) : null),
  setItem: (k, v) => memoryStore.set(k, String(v)),
  removeItem: (k) => memoryStore.delete(k),
  clear: () => memoryStore.clear()
};

test('1. Fresh State: Login baru dimulai dengan kulkas, kompos, riwayat, & impact 0 (tanpa dummy)', () => {
  localStorage.clear();
  assert.deepEqual(store.getFoodItems(), []);
  assert.deepEqual(store.getCompostBatches(), []);
  assert.deepEqual(store.getHarvestHistory(), []);
  assert.deepEqual(store.getAiHistory(), []);
  assert.deepEqual(store.getNotifications(), []);
  assert.deepEqual(store.getImpactStats(), {
    rescuedFoodKg: 0,
    compostedFoodKg: 0,
    co2ePreventedKg: 0
  });
});

test('2. Manual Input & Cook Rescue: Menambah stok lalu menandai dimasak memperbarui impact', () => {
  localStorage.clear();
  const added = store.addFoodItem({
    stockType: 'leftover',
    name: 'Sayur Sop',
    category: 'leftover',
    quantity: 2,
    unit: 'porsi',
    expiryDays: 1,
    weightKg: 0.4
  });
  assert.equal(added.status, 'warning');
  assert.equal(store.getFoodItems().length, 1);
  assert.ok(store.getNotifications().length >= 2);

  store.markFoodAsCooked(added.id);
  assert.equal(store.getFoodItems().length, 0);
  const impact = store.getImpactStats();
  assert.equal(impact.rescuedFoodKg, 0.4);
  assert.equal(impact.co2ePreventedKg, 1.0);
});

test('3. Siklus Kompos: Tambah bahan basi -> kunci -> simulasi 14 hari -> panen', () => {
  localStorage.clear();
  const spoiled = store.addFoodItem({
    stockType: 'raw',
    name: 'Tahu Putih',
    category: 'plant_protein',
    expiryDays: 0,
    weightKg: 0.5
  });
  assert.equal(spoiled.status, 'spoiled');

  const batches = store.addFoodToCompost(spoiled, null, 'Batch #1');
  assert.equal(batches.length, 1);
  assert.equal(batches[0].stage, 'filling');

  const curing = store.lockBatchForCuring(batches[0].id);
  assert.equal(curing[0].stage, 'curing');

  const ready = store.fastForwardBatchDemo(batches[0].id, 14);
  assert.equal(ready[0].stage, 'ready');

  const harvest = store.harvestBatch(batches[0].id, 2.5);
  assert.equal(harvest.weightKg, 2.5);
  assert.equal(store.getCompostBatches().length, 0);
  assert.equal(store.getHarvestHistory().length, 1);
});

test('4. Pengaturan Profil & Jam Notifikasi', () => {
  localStorage.clear();
  const updated = store.adjustNotificationHour(1);
  assert.equal(updated.notificationHour, '09:00');
  const loggedOut = store.logoutUser();
  assert.equal(loggedOut.isLoggedIn, false);
});
