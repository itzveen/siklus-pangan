import {
  INITIAL_FOOD_ITEMS,
  INITIAL_COMPOST_BATCHES,
  INITIAL_HARVEST_HISTORY,
  INITIAL_IMPACT_STATS,
  INITIAL_USER_PROFILE,
  INITIAL_AI_HISTORY,
  INITIAL_NOTIFICATIONS
} from './dummyData.js';

const KEYS = {
  FOODS: 'siklus_foods_v2',
  BATCHES: 'siklus_batches_v2',
  HARVESTS: 'siklus_harvests_v2',
  IMPACT: 'siklus_impact_v2',
  PROFILE: 'siklus_profile_v2',
  CHATS: 'siklus_chats_v2',
  NOTIFS: 'siklus_notifs_v2'
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
  const expiry = Number(item.expiryDays ?? 3);
  const categoryMap = {
    vegetable: { label: 'Sayur & Buah', icon: '🥬' },
    meat: { label: 'Lauk Hewani', icon: '🍗' },
    plant_protein: { label: 'Lauk Nabati', icon: '🧈' },
    carb: { label: 'Karbohidrat', icon: '🍚' },
    spice: { label: 'Bumbu', icon: '🧄' },
    leftover: { label: 'Masakan Sisa', icon: '🍲' },
    other: { label: 'Lainnya', icon: '📦' }
  };
  const catInfo = categoryMap[item.category] || { label: 'Bahan segar', icon: '🥗' };

  const newItem = {
    id: `food-${Date.now()}`,
    addedAt: new Date().toISOString().split('T')[0],
    status: expiry <= 0 ? 'spoiled' : (expiry <= 2 ? 'warning' : 'safe'),
    weightKg: item.weightKg || 0.3,
    maxExpiryDays: Math.max(expiry, 7),
    categoryLabel: item.categoryLabel || catInfo.label,
    quantityText: item.quantityText || `${item.quantity || 1} ${item.unit || 'ikat'} (250g)`,
    icon: item.icon || catInfo.icon,
    ...item,
    expiryDays: expiry
  };
  items.unshift(newItem);
  saveFoodItems(items);
  return newItem;
}

export function addMultipleFoodItems(itemList) {
  const items = getFoodItems();
  const formatted = itemList.map((item, idx) => {
    const expiry = Number(item.expiryDays ?? 3);
    return {
      id: `food-${Date.now()}-${idx}`,
      addedAt: new Date().toISOString().split('T')[0],
      status: expiry <= 0 ? 'spoiled' : (expiry <= 2 ? 'warning' : 'safe'),
      weightKg: item.weightKg || 0.3,
      maxExpiryDays: Math.max(expiry, 7),
      categoryLabel: item.category === 'meat' ? 'Lauk hewani' : item.category === 'leftover' ? 'Masakan sisa' : 'Sayur segar',
      quantityText: item.quantityText || '1 porsi (250g)',
      icon: item.category === 'meat' ? '🥚' : '🥬',
      ...item,
      expiryDays: expiry
    };
  });
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

/* --- COMPOST BATCHES & HARVEST HISTORY STORAGE --- */

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

export function getHarvestHistory() {
  const data = localStorage.getItem(KEYS.HARVESTS);
  if (!data) {
    localStorage.setItem(KEYS.HARVESTS, JSON.stringify(INITIAL_HARVEST_HISTORY));
    return INITIAL_HARVEST_HISTORY;
  }
  try {
    return JSON.parse(data);
  } catch (e) {
    return INITIAL_HARVEST_HISTORY;
  }
}

export function saveHarvestHistory(harvests) {
  localStorage.setItem(KEYS.HARVESTS, JSON.stringify(harvests));
}

export function getActiveFillingBatch() {
  const batches = getCompostBatches();
  return batches.find(b => b.stage === 'filling') || null;
}

export function addFoodToCompost(foodItem, targetBatchId = null, newBatchTitle = null) {
  const batches = getCompostBatches();
  const weight = foodItem.weightKg || 0.3;
  const todayShort = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });

  if (targetBatchId) {
    const updated = batches.map(b => {
      if (b.id === targetBatchId && b.stage === 'filling') {
        const newPercentage = Math.min(100, (b.fillPercentage || 60) + 15);
        return {
          ...b,
          fillPercentage: newPercentage,
          totalWeightKg: Math.round(((b.totalWeightKg || 0) + weight) * 10) / 10,
          logs: [
            ...b.logs,
            {
              id: `log-${Date.now()}`,
              date: todayShort,
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
    const newBatch = {
      id: `batch-${Date.now()}`,
      title: newBatchTitle || `Batch #${batches.length + 1}`,
      subtitle: "Wadah Dapur Baru",
      method: "Takakura / Komposter Wadah",
      stage: "filling",
      dayCount: 1,
      fillPercentage: 20,
      startedAt: new Date().toISOString().split('T')[0],
      curingDaysLeft: 14,
      totalWeightKg: weight,
      logs: [
        {
          id: `log-${Date.now()}`,
          date: todayShort,
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

export function lockBatchForCuring(batchId) {
  const batches = getCompostBatches();
  const updated = batches.map(b => {
    if (b.id === batchId) {
      return {
        ...b,
        stage: 'curing',
        dayCount: 1,
        fillPercentage: 35,
        lockedAt: new Date().toISOString().split('T')[0],
        curingDaysLeft: 14
      };
    }
    return b;
  });
  saveCompostBatches(updated);
  return updated;
}

export function fastForwardBatchDemo(batchId, daysToAdvance = 14) {
  const batches = getCompostBatches();
  const updated = batches.map(b => {
    if (b.id === batchId) {
      const remaining = Math.max(0, (b.curingDaysLeft || 14) - daysToAdvance);
      return {
        ...b,
        stage: remaining <= 0 ? 'ready' : 'curing',
        dayCount: 14,
        fillPercentage: 100,
        curingDaysLeft: remaining
      };
    }
    return b;
  });
  saveCompostBatches(updated);
  return updated;
}

export function harvestBatch(batchId, harvestWeightKg = 3.5) {
  const batches = getCompostBatches();
  const target = batches.find(b => b.id === batchId);
  const harvests = getHarvestHistory();
  const todayShort = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });

  const newHarvestRecord = {
    id: target?.id || `harvest-${Date.now()}`,
    title: target?.title || "Batch #2",
    harvestDate: todayShort,
    weightKg: harvestWeightKg,
    outputType: "Pupuk padat",
    status: "Selesai",
    logs: target?.logs || [
      { id: "log-h1", item: "Kulit pisang", date: "—", weightKg: 0.25 },
      { id: "log-h2", item: "Tahu basi", date: "—", weightKg: 0.3 }
    ],
    usageGuide: "Campurkan pupuk kompos ini dengan tanah biasa (perbandingan 1:3) untuk menyuburkan tanaman pot di rumahmu."
  };

  saveHarvestHistory([newHarvestRecord, ...harvests]);
  const updated = batches.filter(b => b.id !== batchId);
  saveCompostBatches(updated);
  return newHarvestRecord;
}

export function getHarvestDetail(id) {
  const harvests = getHarvestHistory();
  return harvests.find(h => h.id === id) || harvests[0] || null;
}

/* --- AI CONVERSATION HISTORY (TANYA AI -> RIWAYAT) --- */

export function getAiTopics() {
  const foods = getFoodItems();
  return {
    greeting: "Halo! Pilih topik yang ingin kamu tanyakan hari ini:",
    readOnlyNote: "Balasan AI bersifat 1 arah (one-shot) dan otomatis disimpan ke Riwayat Chat.",
    topics: [
      {
        id: "rescue-recipe",
        title: "Resep dari bahan hampir basi",
        subtitle: "Ide masak cepat sebelum bahan terbuang",
        endpoint: "POST /api/ai/rescue-recipe",
        availableItems: foods.filter(f => f.status === "warning" || f.status === "safe")
      },
      {
        id: "compost-guide",
        title: "Olah bahan basi jadi kompos",
        subtitle: "Langkah praktis sesuai kondisi rumahmu",
        endpoint: "POST /api/ai/compost-guide",
        availableItems: foods.filter(f => f.status === "spoiled" || f.status === "warning")
      }
    ]
  };
}

export function getAiHistory() {
  const data = localStorage.getItem(KEYS.CHATS);
  if (!data) {
    localStorage.setItem(KEYS.CHATS, JSON.stringify(INITIAL_AI_HISTORY));
    return INITIAL_AI_HISTORY;
  }
  try {
    return JSON.parse(data);
  } catch (e) {
    return INITIAL_AI_HISTORY;
  }
}

export function getAiHistoryDetail(id) {
  const chats = getAiHistory();
  return chats.find(c => c.id === id) || chats[0] || null;
}

export function addAiHistoryEntry(entry) {
  const current = getAiHistory();
  const now = new Date();
  const timeStr = `${String(now.getHours()).padStart(2, '0')}.${String(now.getMinutes()).padStart(2, '0')}`;
  const newItem = {
    id: `chat-${Date.now()}`,
    time: timeStr,
    dateGroup: "HARI INI",
    ...entry
  };
  const updated = [newItem, ...current];
  localStorage.setItem(KEYS.CHATS, JSON.stringify(updated));
  return updated;
}

/* --- NOTIFICATIONS STORAGE --- */

export function getNotifications() {
  const data = localStorage.getItem(KEYS.NOTIFS);
  if (!data) {
    localStorage.setItem(KEYS.NOTIFS, JSON.stringify(INITIAL_NOTIFICATIONS));
    return INITIAL_NOTIFICATIONS;
  }
  try {
    return JSON.parse(data);
  } catch (e) {
    return INITIAL_NOTIFICATIONS;
  }
}

export function markAllNotificationsRead() {
  const notifs = getNotifications().map(n => ({ ...n, unread: false }));
  localStorage.setItem(KEYS.NOTIFS, JSON.stringify(notifs));
  return notifs;
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
  const newRescued = Math.round((current.rescuedFoodKg + weightKg) * 10) / 10;
  const newCo2e = Math.round((current.co2ePreventedKg + weightKg * 2.5) * 10) / 10;
  const updated = {
    ...current,
    rescuedFoodKg: newRescued,
    co2ePreventedKg: newCo2e
  };
  localStorage.setItem(KEYS.IMPACT, JSON.stringify(updated));
  return updated;
}

export function recordCompostedFood(weightKg) {
  const current = getImpactStats();
  const newCompost = Math.round((current.compostedFoodKg + weightKg) * 10) / 10;
  const newCo2e = Math.round((current.co2ePreventedKg + weightKg * 2.5) * 10) / 10;
  const updated = {
    ...current,
    compostedFoodKg: newCompost,
    co2ePreventedKg: newCo2e
  };
  localStorage.setItem(KEYS.IMPACT, JSON.stringify(updated));
  return updated;
}

/* --- USER PROFILE & AUTH STORAGE --- */

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
  return profile;
}

export function adjustNotificationHour(deltaHours = 1) {
  const profile = getUserProfile();
  const currentHour = parseInt((profile.notificationHour || '08:00').split(':')[0], 10);
  const nextHour = (currentHour + deltaHours + 24) % 24;
  const formatted = `${String(nextHour).padStart(2, '0')}:00`;
  return saveUserProfile({ ...profile, notificationHour: formatted });
}

export function logoutUser() {
  const profile = getUserProfile();
  return saveUserProfile({ ...profile, isLoggedIn: false });
}

/* --- RESET & DEMO TOOLS --- */

export function resetAllDataToDummy() {
  localStorage.setItem(KEYS.FOODS, JSON.stringify(INITIAL_FOOD_ITEMS));
  localStorage.setItem(KEYS.BATCHES, JSON.stringify(INITIAL_COMPOST_BATCHES));
  localStorage.setItem(KEYS.HARVESTS, JSON.stringify(INITIAL_HARVEST_HISTORY));
  localStorage.setItem(KEYS.IMPACT, JSON.stringify(INITIAL_IMPACT_STATS));
  localStorage.setItem(KEYS.PROFILE, JSON.stringify(INITIAL_USER_PROFILE));
  localStorage.setItem(KEYS.CHATS, JSON.stringify(INITIAL_AI_HISTORY));
  localStorage.setItem(KEYS.NOTIFS, JSON.stringify(INITIAL_NOTIFICATIONS));
}
