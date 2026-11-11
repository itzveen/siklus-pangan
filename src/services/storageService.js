import {
  INITIAL_FOOD_ITEMS,
  INITIAL_COMPOST_BATCHES,
  INITIAL_IMPACT_STATS,
  INITIAL_USER_PROFILE
} from './dummyData.js';

const KEYS = {
  FOODS: 'siklus_foods',
  BATCHES: 'siklus_batches',
  IMPACT: 'siklus_impact',
  PROFILE: 'siklus_profile',
  CHATS: 'siklus_chats'
};

/* --- FOOD ITEMS STORAGE --- */

export function getFoodItems() {
  const data = localStorage.getItem(KEYS.FOODS);
  if (!data) {
    localStorage.setItem(KEYS.FOODS, JSON.stringify(INITIAL_FOOD_ITEMS));
    return INITIAL_FOOD_ITEMS;
  }
  try {
    return JSON.parse(data);
  } catch (e) {
    console.error("Gagal parse food items:", e);
    return INITIAL_FOOD_ITEMS;
  }
}

export function saveFoodItems(items) {
  localStorage.setItem(KEYS.FOODS, JSON.stringify(items));
}

export function addFoodItem(item) {
  const items = getFoodItems();
  const newItem = {
    id: `food-${Date.now()}`,
    addedAt: new Date().toISOString().split('T')[0],
    status: item.expiryDays <= 0 ? 'spoiled' : (item.expiryDays <= 2 ? 'warning' : 'safe'),
    weightKg: item.weightKg || 0.3,
    ...item
  };
  items.unshift(newItem);
  saveFoodItems(items);
  return newItem;
}

export function addMultipleFoodItems(itemList) {
  const items = getFoodItems();
  const formatted = itemList.map((item, idx) => ({
    id: `food-${Date.now()}-${idx}`,
    addedAt: new Date().toISOString().split('T')[0],
    status: item.expiryDays <= 0 ? 'spoiled' : (item.expiryDays <= 2 ? 'warning' : 'safe'),
    weightKg: item.weightKg || 0.3,
    ...item
  }));
  const updated = [...formatted, ...items];
  saveFoodItems(updated);
  return updated;
}

export function markFoodAsCooked(id) {
  const items = getFoodItems();
  const target = items.find(f => f.id === id);
  if (target) {
    recordRescuedFood(target.weightKg || 0.3);
  }
  const filtered = items.filter(f => f.id !== id);
  saveFoodItems(filtered);
  return filtered;
}

export function markFoodAsSpoiled(id) {
  const items = getFoodItems();
  const updated = items.map(f => {
    if (f.id === id) {
      return { ...f, status: 'spoiled', expiryDays: 0 };
    }
    return f;
  });
  saveFoodItems(updated);
  return updated;
}

export function removeFoodItem(id) {
  const items = getFoodItems();
  const filtered = items.filter(f => f.id !== id);
  saveFoodItems(filtered);
  return filtered;
}

/* --- COMPOST BATCHES STORAGE --- */

export function getCompostBatches() {
  const data = localStorage.getItem(KEYS.BATCHES);
  if (!data) {
    localStorage.setItem(KEYS.BATCHES, JSON.stringify(INITIAL_COMPOST_BATCHES));
    return INITIAL_COMPOST_BATCHES;
  }
  try {
    return JSON.parse(data);
  } catch (e) {
    console.error("Gagal parse compost batches:", e);
    return INITIAL_COMPOST_BATCHES;
  }
}

export function saveCompostBatches(batches) {
  localStorage.setItem(KEYS.BATCHES, JSON.stringify(batches));
}

/**
 * Mencari apakah ada wadah kompos yang masih di Fase Pengisian (Active Feeding)
 */
export function getActiveFillingBatch() {
  const batches = getCompostBatches();
  return batches.find(b => b.stage === 'filling') || null;
}

/**
 * Menambahkan sampah makanan ke batch yang sedang buka, atau buat batch baru
 */
export function addFoodToCompost(foodItem, targetBatchId = null, newBatchTitle = null) {
  const batches = getCompostBatches();
  const weight = foodItem.weightKg || 0.3;

  if (targetBatchId) {
    // Tambahkan ke batch yang ada
    const updated = batches.map(b => {
      if (b.id === targetBatchId && b.stage === 'filling') {
        const newPercentage = Math.min(100, (b.fillPercentage || 0) + 15);
        return {
          ...b,
          fillPercentage: newPercentage,
          totalWeightKg: Math.round(((b.totalWeightKg || 0) + weight) * 10) / 10,
          logs: [
            ...b.logs,
            {
              id: `log-${Date.now()}`,
              date: new Date().toISOString().split('T')[0],
              item: foodItem.name,
              weightKg: weight
            }
          ]
        };
      }
      return b;
    });
    saveCompostBatches(updated);
    recordCompostedFood(weight);
    removeFoodItem(foodItem.id);
    return updated;
  } else {
    // Buat batch baru
    const newBatch = {
      id: `batch-${Date.now()}`,
      title: newBatchTitle || `Kompos Dapur #${batches.length + 1}`,
      method: "Takakura / Komposter Wadah",
      stage: "filling",
      fillPercentage: 20,
      startedAt: new Date().toISOString().split('T')[0],
      curingDaysLeft: 14,
      totalWeightKg: weight,
      logs: [
        {
          id: `log-${Date.now()}`,
          date: new Date().toISOString().split('T')[0],
          item: foodItem.name,
          weightKg: weight
        }
      ]
    };
    const updated = [newBatch, ...batches];
    saveCompostBatches(updated);
    recordCompostedFood(weight);
    removeFoodItem(foodItem.id);
    return updated;
  }
}

/**
 * Mengunci batch yang sudah penuh agar masuk ke Fase Pematangan (Curing)
 */
export function lockBatchForCuring(batchId) {
  const batches = getCompostBatches();
  const updated = batches.map(b => {
    if (b.id === batchId) {
      return {
        ...b,
        stage: 'curing',
        lockedAt: new Date().toISOString().split('T')[0],
        curingDaysLeft: 14
      };
    }
    return b;
  });
  saveCompostBatches(updated);
  return updated;
}

/**
 * Fitur Simulasi Demo Juri: Mempercepat waktu pematangan kompos
 */
export function fastForwardBatchDemo(batchId, daysToAdvance = 14) {
  const batches = getCompostBatches();
  const updated = batches.map(b => {
    if (b.id === batchId) {
      const remaining = Math.max(0, (b.curingDaysLeft || 14) - daysToAdvance);
      return {
        ...b,
        stage: remaining <= 0 ? 'ready' : 'curing',
        curingDaysLeft: remaining
      };
    }
    return b;
  });
  saveCompostBatches(updated);
  return updated;
}

/**
 * Memanen kompos yang sudah matang
 */
export function harvestBatch(batchId) {
  const batches = getCompostBatches();
  const updated = batches.filter(b => b.id !== batchId);
  saveCompostBatches(updated);
  return updated;
}

/* --- IMPACT STATS STORAGE --- */

export function getImpactStats() {
  const data = localStorage.getItem(KEYS.IMPACT);
  if (!data) {
    localStorage.setItem(KEYS.IMPACT, JSON.stringify(INITIAL_IMPACT_STATS));
    return INITIAL_IMPACT_STATS;
  }
  try {
    return JSON.parse(data);
  } catch (e) {
    return INITIAL_IMPACT_STATS;
  }
}

export function recordRescuedFood(weightKg) {
  const current = getImpactStats();
  const updated = {
    ...current,
    rescuedFoodKg: Math.round((current.rescuedFoodKg + weightKg) * 10) / 10
  };
  localStorage.setItem(KEYS.IMPACT, JSON.stringify(updated));
  return updated;
}

export function recordCompostedFood(weightKg) {
  const current = getImpactStats();
  const newCompost = Math.round((current.compostedFoodKg + weightKg) * 10) / 10;
  const newCo2e = Math.round(newCompost * 2.5 * 10) / 10;
  const updated = {
    ...current,
    compostedFoodKg: newCompost,
    co2ePreventedKg: newCo2e
  };
  localStorage.setItem(KEYS.IMPACT, JSON.stringify(updated));
  return updated;
}

/* --- USER PROFILE STORAGE --- */

export function getUserProfile() {
  const data = localStorage.getItem(KEYS.PROFILE);
  if (!data) {
    localStorage.setItem(KEYS.PROFILE, JSON.stringify(INITIAL_USER_PROFILE));
    return INITIAL_USER_PROFILE;
  }
  try {
    return JSON.parse(data);
  } catch (e) {
    return INITIAL_USER_PROFILE;
  }
}

export function saveUserProfile(profile) {
  localStorage.setItem(KEYS.PROFILE, JSON.stringify(profile));
}

/* --- RESET & DEMO TOOLS --- */

export function resetAllDataToDummy() {
  localStorage.setItem(KEYS.FOODS, JSON.stringify(INITIAL_FOOD_ITEMS));
  localStorage.setItem(KEYS.BATCHES, JSON.stringify(INITIAL_COMPOST_BATCHES));
  localStorage.setItem(KEYS.IMPACT, JSON.stringify(INITIAL_IMPACT_STATS));
  localStorage.setItem(KEYS.PROFILE, JSON.stringify(INITIAL_USER_PROFILE));
}
