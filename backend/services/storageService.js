const KEYS = {
  FOODS: 'siklus_foods_v3',
  BATCHES: 'siklus_batches_v3',
  HARVESTS: 'siklus_harvests_v3',
  IMPACT: 'siklus_impact_v3',
  PROFILE: 'siklus_profile_v3',
  CHATS: 'siklus_chats_v3',
  NOTIFS: 'siklus_notifs_v3',
  ACTIVITY_NOTIFS: 'siklus_activity_notifs_v3',
  LAST_REMINDER: 'siklus_last_reminder_v3'
};

const DEFAULT_IMPACT = {
  rescuedFoodKg: 0,
  compostedFoodKg: 0,
  co2ePreventedKg: 0
};

const DEFAULT_PROFILE = {
  name: 'Pengguna',
  fullName: 'Pengguna EatWise',
  email: '',
  picture: null,
  householdType: 'house',
  notificationHour: '08:00',
  isLoggedIn: false
};

function readStorage(key, fallback) {
  if (typeof localStorage === 'undefined') return fallback;
  const raw = localStorage.getItem(key);
  if (!raw) return fallback;
  try {
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

function writeStorage(key, value) {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(key, JSON.stringify(value));
}

/* --- FOOD ITEMS STORAGE --- */

export function getFoodItems() {
  return readStorage(KEYS.FOODS, []);
}

export function saveFoodItems(items) {
  writeStorage(KEYS.FOODS, items);
}

const CATEGORY_MAP = {
  vegetable: { label: 'Sayur & Buah', icon: '🥬' },
  meat: { label: 'Lauk Hewani', icon: '🍗' },
  plant_protein: { label: 'Lauk Nabati', icon: '🧈' },
  carb: { label: 'Karbohidrat', icon: '🍚' },
  spice: { label: 'Bumbu', icon: '🧄' },
  leftover: { label: 'Masakan Sisa', icon: '🍲' },
  other: { label: 'Lainnya', icon: '📦' }
};

function buildFoodRecord(item, idSuffix = '') {
  const expiry = Number(item.expiryDays ?? (item.stockType === 'leftover' ? 2 : 3));
  const catInfo = CATEGORY_MAP[item.category] || { label: 'Bahan Segar', icon: '🥗' };
  const quantity = Number(item.quantity || 1);
  const unit = item.unit || (item.stockType === 'leftover' ? 'porsi' : 'ikat');

  return {
    id: `food-${Date.now()}${idSuffix}`,
    addedAt: new Date().toISOString().split('T')[0],
    status: expiry <= 0 ? 'spoiled' : expiry <= 2 ? 'warning' : 'safe',
    weightKg: Number(item.weightKg || 0.3),
    maxExpiryDays: Math.max(expiry, 7),
    categoryLabel: item.categoryLabel || catInfo.label,
    quantityText: item.quantityText || `${quantity} ${unit}`,
    icon: item.icon || catInfo.icon,
    ...item,
    expiryDays: expiry
  };
}

export function addFoodItem(item) {
  const items = getFoodItems();
  const newItem = buildFoodRecord(item);
  const updated = [newItem, ...items];
  saveFoodItems(updated);
  addActivityNotification({
    type: newItem.status === 'warning' ? 'warning' : newItem.status === 'spoiled' ? 'expired' : 'info',
    title: `${newItem.name} ditambahkan ke kulkas`,
    message: `Perkiraan masa simpan ${newItem.expiryDays} hari (${newItem.quantityText}).`
  });
  syncAutoNotifications(updated, getCompostBatches());
  return newItem;
}

export function addMultipleFoodItems(itemList) {
  const items = getFoodItems();
  const formatted = itemList.map((item, idx) => buildFoodRecord(item, `-${idx}`));
  const updated = [...formatted, ...items];
  saveFoodItems(updated);
  if (formatted.length > 0) {
    addActivityNotification({
      type: 'info',
      title: `${formatted.length} bahan hasil scan disimpan`,
      message: `${formatted.map((i) => i.name).slice(0, 3).join(', ')}${formatted.length > 3 ? ', dll.' : ''} masuk ke kulkas.`
    });
  }
  syncAutoNotifications(updated, getCompostBatches());
  return updated;
}

export function markFoodAsCooked(id) {
  const items = getFoodItems();
  const target = items.find((f) => f.id === id);
  if (target) {
    recordRescuedFood(target.weightKg || 0.3);
    addActivityNotification({
      type: 'info',
      title: `${target.name} berhasil dimasak!`,
      message: `Selamat! ${target.weightKg || 0.3} kg bahan makanan berhasil diselamatkan.`
    });
  }
  const filtered = items.filter((f) => f.id !== id);
  saveFoodItems(filtered);
  syncAutoNotifications(filtered, getCompostBatches());
  return filtered;
}

export function markFoodAsSpoiled(id) {
  const items = getFoodItems();
  const target = items.find((f) => f.id === id);
  const updated = items.map((f) =>
    f.id === id ? { ...f, status: 'spoiled', expiryDays: 0 } : f
  );
  saveFoodItems(updated);
  if (target) {
    addActivityNotification({
      type: 'expired',
      title: `${target.name} ditandai basi`,
      message: 'Segera alihkan ke wadah kompos agar tidak terbuang sia-sia.'
    });
  }
  syncAutoNotifications(updated, getCompostBatches());
  return updated;
}

export function removeFoodItem(id) {
  const items = getFoodItems();
  const filtered = items.filter((f) => f.id !== id);
  saveFoodItems(filtered);
  syncAutoNotifications(filtered, getCompostBatches());
  return filtered;
}

/* --- COMPOST BATCHES & HARVEST HISTORY STORAGE --- */

export function getCompostBatches() {
  return readStorage(KEYS.BATCHES, []);
}

export function saveCompostBatches(batches) {
  writeStorage(KEYS.BATCHES, batches);
}

export function getHarvestHistory() {
  return readStorage(KEYS.HARVESTS, []);
}

export function saveHarvestHistory(harvests) {
  writeStorage(KEYS.HARVESTS, harvests);
}

export function addFoodToCompost(foodItem, targetBatchId = null, newBatchTitle = null) {
  const batches = getCompostBatches();
  const weight = Number(foodItem.weightKg || 0.3);
  const todayShort = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });

  let updated;
  if (targetBatchId) {
    updated = batches.map((b) => {
      if (b.id === targetBatchId && b.stage === 'filling') {
        const newPercentage = Math.min(100, (b.fillPercentage || 20) + 20);
        return {
          ...b,
          fillPercentage: newPercentage,
          totalWeightKg: Math.round(((b.totalWeightKg || 0) + weight) * 10) / 10,
          logs: [
            ...(b.logs || []),
            { id: `log-${Date.now()}`, date: todayShort, item: foodItem.name, weightKg: weight }
          ]
        };
      }
      return b;
    });
  } else {
    const newBatch = {
      id: `batch-${Date.now()}`,
      title: newBatchTitle || `Batch #${batches.length + 1}`,
      subtitle: 'Wadah Dapur Aktif',
      method: 'Takakura / Komposter Wadah',
      stage: 'filling',
      dayCount: 1,
      fillPercentage: 25,
      startedAt: new Date().toISOString().split('T')[0],
      curingDaysLeft: 14,
      totalWeightKg: weight,
      logs: [{ id: `log-${Date.now()}`, date: todayShort, item: foodItem.name, weightKg: weight }]
    };
    updated = [newBatch, ...batches];
  }

  saveCompostBatches(updated);
  recordCompostedFood(weight);
  if (foodItem.id) {
    removeFoodItem(foodItem.id);
  } else if (foodItem.name) {
    const spoiledMatch = getFoodItems().find(
      (f) => f.status === 'spoiled' && f.name.toLowerCase() === String(foodItem.name).toLowerCase()
    );
    if (spoiledMatch) {
      removeFoodItem(spoiledMatch.id);
    }
  }
  syncAutoNotifications(getFoodItems(), updated);
  return updated;
}

export function lockBatchForCuring(batchId) {
  const batches = getCompostBatches();
  const updated = batches.map((b) =>
    b.id === batchId
      ? {
          ...b,
          stage: 'curing',
          dayCount: 1,
          lockedAt: new Date().toISOString().split('T')[0],
          curingDaysLeft: 14
        }
      : b
  );
  saveCompostBatches(updated);
  syncAutoNotifications(getFoodItems(), updated);
  return updated;
}

export function fastForwardBatchDemo(batchId, daysToAdvance = 14) {
  const batches = getCompostBatches();
  const updated = batches.map((b) => {
    if (b.id !== batchId) return b;
    const remaining = Math.max(0, (b.curingDaysLeft || 14) - daysToAdvance);
    return {
      ...b,
      stage: remaining <= 0 ? 'ready' : 'curing',
      dayCount: 14,
      fillPercentage: 100,
      curingDaysLeft: remaining
    };
  });
  saveCompostBatches(updated);
  syncAutoNotifications(getFoodItems(), updated);
  return updated;
}

export function harvestBatch(batchId, harvestWeightKg = 3.5) {
  const batches = getCompostBatches();
  const target = batches.find((b) => b.id === batchId);
  const harvests = getHarvestHistory();
  const todayShort = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });

  const newHarvestRecord = {
    id: target?.id || `harvest-${Date.now()}`,
    title: target?.title || 'Batch Kompos',
    harvestDate: todayShort,
    weightKg: Number(harvestWeightKg || 3.5),
    outputType: 'Pupuk Organik Siap Pakai',
    status: 'Selesai',
    logs: target?.logs || [],
    usageGuide: [
      {
        title: 'Pemakaian ke Tanaman',
        instruction: 'Campurkan pupuk kompos ini dengan tanah biasa (perbandingan 1:3) atau taburkan di sekitar tanaman.'
      },
      {
        title: 'Penyimpanan Sisa Pupuk',
        instruction: 'Simpan sisanya di wadah kering dan tertutup agar nutrisi tetap terjaga.'
      }
    ]
  };

  saveHarvestHistory([newHarvestRecord, ...harvests]);
  const updated = batches.filter((b) => b.id !== batchId);
  saveCompostBatches(updated);
  syncAutoNotifications(getFoodItems(), updated);
  return newHarvestRecord;
}

export function getHarvestDetail(id) {
  const harvests = getHarvestHistory();
  return harvests.find((h) => h.id === id) || harvests[0] || null;
}

/* --- AI CONVERSATION HISTORY (TANYA AI -> RIWAYAT) --- */

export function getAiHistory() {
  return readStorage(KEYS.CHATS, []);
}

export function getAiHistoryDetail(id) {
  const chats = getAiHistory();
  return chats.find((c) => c.id === id) || chats[0] || null;
}

export function addAiHistoryEntry(entry) {
  const current = getAiHistory();
  const now = new Date();
  const timeStr = `${String(now.getHours()).padStart(2, '0')}.${String(now.getMinutes()).padStart(2, '0')}`;
  const newItem = {
    id: `chat-${Date.now()}`,
    time: timeStr,
    dateGroup: 'HARI INI',
    ...entry
  };
  const updated = [newItem, ...current];
  writeStorage(KEYS.CHATS, updated);
  return updated;
}

/* --- NOTIFICATIONS (GENERATED DYNAMICALLY FROM REAL DATA) --- */

export function addActivityNotification({ type = 'info', title, message, group = 'HARI INI' }) {
  const existing = readStorage(KEYS.ACTIVITY_NOTIFS, []);
  const nowTime = new Date().toTimeString().slice(0, 5);
  const newNotif = {
    id: `notif-act-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    group,
    type,
    title,
    message,
    time: nowTime,
    unread: true
  };
  const updated = [newNotif, ...existing].slice(0, 30);
  writeStorage(KEYS.ACTIVITY_NOTIFS, updated);
  syncAutoNotifications(getFoodItems(), getCompostBatches());

  if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
    try {
      new Notification(title, { body: message });
    } catch {
      // Abaikan jika browser memblokir konstruktor Notification
    }
  }
  return newNotif;
}

export function syncAutoNotifications(foods = getFoodItems(), batches = getCompostBatches()) {
  const existing = readStorage(KEYS.NOTIFS, []);
  const readIds = new Set(existing.filter((n) => !n.unread).map((n) => n.id));
  const generated = [];

  foods.forEach((f) => {
    if (f.status === 'spoiled') {
      const id = `notif-spoil-${f.id}`;
      generated.push({
        id,
        group: 'HARI INI',
        type: 'expired',
        title: `${f.name} sudah melewati batas simpan`,
        message: 'Jangan dibuang ke tempat sampah! Alihkan ke wadah kompos agar menjadi pupuk.',
        time: 'Baru saja',
        unread: !readIds.has(id)
      });
    } else if (f.status === 'warning') {
      const id = `notif-warn-${f.id}`;
      generated.push({
        id,
        group: 'HARI INI',
        type: 'warning',
        title: `${f.name} tersisa ${f.expiryDays} hari lagi`,
        message: 'Segera masak atau gunakan Rescue Resep agar tidak terbuang.',
        time: 'Hari ini',
        unread: !readIds.has(id)
      });
    }
  });

  batches.forEach((b) => {
    if (b.stage === 'ready') {
      const id = `notif-ready-${b.id}`;
      generated.push({
        id,
        group: 'HARI INI',
        type: 'compost',
        title: `${b.title} siap dipanen!`,
        message: 'Proses pematangan 14 hari selesai. Catat hasil panen pupuk organikmu.',
        time: 'Hari ini',
        unread: !readIds.has(id)
      });
    }
  });

  const activityNotifs = readStorage(KEYS.ACTIVITY_NOTIFS, []).map((n) => ({
    ...n,
    unread: readIds.has(n.id) ? false : n.unread !== false
  }));

  const merged = [...generated, ...activityNotifs];
  writeStorage(KEYS.NOTIFS, merged);
  return merged;
}

export function checkDailyReminderNotification(forceWhenMatched = false) {
  const profile = getUserProfile();
  if (!profile?.isLoggedIn) return null;

  const foods = getFoodItems();
  if (foods.length === 0) return null;

  const hourStr = profile.notificationHour || '08:00';
  const targetHour = parseInt(hourStr.split(':')[0], 10);
  const now = new Date();
  const todayKey = `${now.toISOString().slice(0, 10)}@${hourStr}`;
  const lastReminder = readStorage(KEYS.LAST_REMINDER, '');

  if (lastReminder === todayKey) return null;
  if (now.getHours() < targetHour && !forceWhenMatched) return null;

  const critical = foods.filter((f) => f.status === 'warning' || f.status === 'spoiled');
  const title = `Pengingat Harian (${hourStr} WIB)`;
  const message =
    critical.length > 0
      ? `Ada ${critical.length} bahan kritis (${critical.slice(0, 2).map((c) => c.name).join(', ')}). Yuk cek sebelum terbuang!`
      : `Kamu punya ${foods.length} bahan di kulkas. Pastikan diolah tepat waktu ya!`;

  writeStorage(KEYS.LAST_REMINDER, todayKey);
  return addActivityNotification({ type: 'warning', title, message });
}

export function getNotifications() {
  return readStorage(KEYS.NOTIFS, []);
}

export function markAllNotificationsRead() {
  const activityNotifs = readStorage(KEYS.ACTIVITY_NOTIFS, []).map((n) => ({ ...n, unread: false }));
  writeStorage(KEYS.ACTIVITY_NOTIFS, activityNotifs);
  const notifs = getNotifications().map((n) => ({ ...n, unread: false }));
  writeStorage(KEYS.NOTIFS, notifs);
  return notifs;
}

export function markNotificationRead(id) {
  const activityNotifs = readStorage(KEYS.ACTIVITY_NOTIFS, []).map((n) =>
    n.id === id ? { ...n, unread: false } : n
  );
  writeStorage(KEYS.ACTIVITY_NOTIFS, activityNotifs);
  const notifs = getNotifications().map((n) => (n.id === id ? { ...n, unread: false } : n));
  writeStorage(KEYS.NOTIFS, notifs);
  return notifs;
}

/* --- IMPACT STATS STORAGE --- */

export function getImpactStats() {
  return readStorage(KEYS.IMPACT, DEFAULT_IMPACT);
}

export function recordRescuedFood(weightKg) {
  const current = getImpactStats();
  const updated = {
    ...current,
    rescuedFoodKg: Math.round((current.rescuedFoodKg + weightKg) * 10) / 10,
    co2ePreventedKg: Math.round((current.co2ePreventedKg + weightKg * 2.5) * 10) / 10
  };
  writeStorage(KEYS.IMPACT, updated);
  return updated;
}

export function recordCompostedFood(weightKg) {
  const current = getImpactStats();
  const updated = {
    ...current,
    compostedFoodKg: Math.round((current.compostedFoodKg + weightKg) * 10) / 10,
    co2ePreventedKg: Math.round((current.co2ePreventedKg + weightKg * 2.5) * 10) / 10
  };
  writeStorage(KEYS.IMPACT, updated);
  return updated;
}

/* --- USER PROFILE & AUTH STORAGE --- */

export function getUserProfile() {
  return readStorage(KEYS.PROFILE, DEFAULT_PROFILE);
}

export function saveUserProfile(profile) {
  writeStorage(KEYS.PROFILE, profile);
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

export function resetAllData() {
  saveFoodItems([]);
  saveCompostBatches([]);
  saveHarvestHistory([]);
  writeStorage(KEYS.IMPACT, DEFAULT_IMPACT);
  writeStorage(KEYS.CHATS, []);
  writeStorage(KEYS.NOTIFS, []);
  writeStorage(KEYS.ACTIVITY_NOTIFS, []);
  writeStorage(KEYS.LAST_REMINDER, '');
}
