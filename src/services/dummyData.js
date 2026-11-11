/**
 * Dummy Data Awal untuk SiklusPangan
 * Berguna saat baru pertama kali buka aplikasi atau saat presentasi demo juri
 */

export const INITIAL_FOOD_ITEMS = [
  {
    id: "food-1",
    name: "Wortel Segar",
    category: "vegetable",
    storage: "chiller",
    expiryDays: 6,
    weightKg: 0.5,
    addedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    status: "safe", // safe (hijau)
    notes: "Beli di pasar segar"
  },
  {
    id: "food-2",
    name: "Bayam Hijau",
    category: "vegetable",
    storage: "chiller",
    expiryDays: 1,
    weightKg: 0.3,
    addedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    status: "warning", // warning (kuning - harus segera dimasak)
    notes: "Mulai sedikit layu di ujung daun"
  },
  {
    id: "food-3",
    name: "Telur Ayam",
    category: "meat",
    storage: "room",
    expiryDays: 10,
    weightKg: 0.5,
    addedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    status: "safe"
  },
  {
    id: "food-4",
    name: "Tahu Putih Sutra",
    category: "vegetable",
    storage: "chiller",
    expiryDays: 0,
    weightKg: 0.3,
    addedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    status: "spoiled", // spoiled (merah - harus dialihkan ke kompos)
    notes: "Berbau agak asam & sedikit berlendir"
  },
  {
    id: "food-5",
    name: "Sop Ayam Sisa Kemarin",
    category: "leftover",
    storage: "chiller",
    expiryDays: 1,
    weightKg: 0.4,
    addedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    status: "warning",
    notes: "Masakan makan siang kemarin"
  }
];

export const INITIAL_COMPOST_BATCHES = [
  {
    id: "batch-1",
    title: "Kompos Ember Dapur #1",
    method: "Takakura / Wadah Kompos Berpori",
    stage: "filling", // filling (fase pengisian) | curing (pematangan) | ready (matang)
    fillPercentage: 65,
    startedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    curingDaysLeft: 14,
    totalWeightKg: 1.8,
    logs: [
      { id: "log-1", date: "2026-11-06", item: "Kulit wortel & pisang", weightKg: 0.8 },
      { id: "log-2", date: "2026-11-08", item: "Ampas kopi & sisa sawi", weightKg: 0.6 },
      { id: "log-3", date: "2026-11-10", item: "Kulit apel & batang kangkung", weightKg: 0.4 }
    ]
  }
];

export const INITIAL_IMPACT_STATS = {
  rescuedFoodKg: 5.2,
  compostedFoodKg: 3.8,
  co2ePreventedKg: 9.5 // (3.8 kg * 2.5 kg CO2e)
};

export const INITIAL_USER_PROFILE = {
  name: "Budi Santoso",
  email: "budi.santoso@gmail.com",
  householdType: "house", // house (Rumah berpekarangan) | apartment (Kos/Apartemen)
  notificationHour: "08:00"
};
