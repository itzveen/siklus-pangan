/**
 * Dummy Data Awal untuk EatWise (SiklusPangan)
 * Sesuai dengan seluruh layar desain Figma UI/UX
 */

export const INITIAL_FOOD_ITEMS = [
  {
    id: "food-1",
    name: "Bayam Hijau",
    category: "vegetable",
    categoryLabel: "Sayur segar",
    quantityText: "1 ikat (250g)",
    storage: "chiller",
    expiryDays: 1,
    maxExpiryDays: 4,
    weightKg: 0.25,
    addedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    status: "warning",
    icon: "🥬"
  },
  {
    id: "food-2",
    name: "Wortel",
    category: "vegetable",
    categoryLabel: "Sayur segar",
    quantityText: "3 batang (300g)",
    storage: "chiller",
    expiryDays: 6,
    maxExpiryDays: 7,
    weightKg: 0.3,
    addedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    status: "safe",
    icon: "🥕"
  },
  {
    id: "food-3",
    name: "Telur Ayam",
    category: "meat",
    categoryLabel: "Lauk hewani",
    quantityText: "4 butir (250g)",
    storage: "chiller",
    expiryDays: 2,
    maxExpiryDays: 14,
    weightKg: 0.25,
    addedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    status: "warning",
    icon: "🥚"
  },
  {
    id: "food-4",
    name: "Tahu Putih",
    category: "vegetable",
    categoryLabel: "Lauk nabati",
    quantityText: "1 bungkus (300g)",
    storage: "chiller",
    expiryDays: 0,
    maxExpiryDays: 4,
    weightKg: 0.3,
    addedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    status: "spoiled",
    notes: "Berbau asam & berlendir",
    icon: "🧈"
  },
  {
    id: "food-5",
    name: "Sop Ayam Sisa",
    category: "leftover",
    categoryLabel: "Masakan sisa",
    quantityText: "2 porsi (400g)",
    storage: "chiller",
    expiryDays: 1,
    maxExpiryDays: 2,
    weightKg: 0.4,
    addedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    status: "warning",
    cookedTime: "Kemarin Malam",
    icon: "🍲"
  }
];

export const INITIAL_COMPOST_BATCHES = [
  {
    id: "batch-1",
    title: "Batch #1",
    subtitle: "Wadah Dapur",
    method: "Takakura / Wadah Kompos Berpori",
    stage: "filling", // filling | curing | ready
    dayCount: 1,
    fillPercentage: 60,
    startedAt: "2026-11-03",
    curingDaysLeft: 14,
    totalWeightKg: 1.8,
    logs: [
      { id: "log-1", date: "3 Nov", item: "Kulit pisang", weightKg: 0.3 },
      { id: "log-2", date: "6 Nov", item: "Tahu basi", weightKg: 0.3 }
    ]
  },
  {
    id: "batch-2",
    title: "Batch #2",
    subtitle: "Ember Pematangan",
    method: "Kompos Padat Wadah",
    stage: "curing",
    dayCount: 5,
    fillPercentage: 35,
    startedAt: "2026-10-28",
    curingDaysLeft: 9,
    totalWeightKg: 3.5,
    logs: [
      { id: "log-201", date: "25 Okt", item: "Sisa sayuran hijau", weightKg: 1.5 },
      { id: "log-202", date: "27 Okt", item: "Kulit buah & ampas kopi", weightKg: 2.0 }
    ]
  }
];

export const INITIAL_HARVEST_HISTORY = [
  {
    id: "batch-0",
    title: "Batch #0",
    harvestDate: "28 Okt",
    weightKg: 3.5,
    status: "Selesai",
    logs: [
      { id: "log-01", item: "Kulit pisang", date: "—" },
      { id: "log-02", item: "Tahu basi", date: "—" }
    ]
  }
];

export const INITIAL_IMPACT_STATS = {
  rescuedFoodKg: 3.8,
  compostedFoodKg: 3.8,
  co2ePreventedKg: 9.5
};

export const INITIAL_USER_PROFILE = {
  name: "Budi",
  fullName: "Budi Santoso",
  email: "budi@gmail.com",
  householdType: "house", // house (Rumah dengan Halaman) | apartment (Apartemen / Kos)
  notificationHour: "08:00",
  isLoggedIn: true
};

export const INITIAL_AI_HISTORY = [
  {
    id: "chat-1",
    type: "recipe",
    badge: "Rescue Resep",
    time: "09.41",
    dateGroup: "HARI INI",
    title: "Sup Bening Bayam Telur Gurih",
    summary: "Bayam Hijau dan Telur Ayam jadi sup hangat, siap dalam 12 menit.",
    prompt: "Tolong kasih resep kilat dari bahan yang hampir basi di kulkasku.",
    tags: ["Bayam Hijau", "Telur Ayam"],
    readOnly: true,
    data: {
      introText: "Siap! Bayam Hijau tinggal 1 hari, jadi yuk dimasak sekarang bareng Telur Ayam.",
      title: "Sup Bening Bayam Telur Gurih",
      cookingTimeMinutes: 12,
      difficulty: "Sangat Mudah",
      servings: 2,
      matchedItems: ["Bayam Hijau", "Telur Ayam"],
      additionalIngredients: ["Bumbu dapur dasar (bawang putih, garam, air)"],
      steps: [
        "Rebus air bersama irisan bawang putih hingga mendidih.",
        "Kocok telur, tuang perlahan ke dalam kuah sambil diaduk membentuk serabut.",
        "Masukkan bayam, masak sebentar selama 2 menit, angkat dan sajikan."
      ]
    }
  },
  {
    id: "chat-2",
    type: "compost",
    badge: "Kompos",
    time: "08.15",
    dateGroup: "HARI INI",
    title: "Olah Tahu Putih jadi kompos",
    summary: "Panduan mengolah tahu yang sudah basi untuk batch komposmu.",
    prompt: "Tahu Putih ku sudah basi. Gimana cara mengolahnya jadi kompos?",
    tags: ["Tahu Putih"],
    readOnly: true,
    data: {
      foodName: "Tahu Putih",
      safetyWarning: "Makanan berlendir/basi dilarang dikonsumsi. Alihkan ke pengolahan pupuk.",
      why: "Tahu Putih kaya protein nabati dan nitrogen tinggi, jadi cocok masuk kompos.",
      recommendedMethod: "Kompos Padat Wadah / Pupuk Organik Cair",
      steps: [
        "Hancurkan tahu basi dengan sendok/sekop kecil.",
        "Campurkan sekam bakar / tanah kering (perbandingan 1:2) agar tidak bau asam.",
        "Masukkan ke dalam wadah kompos aktif."
      ]
    }
  },
  {
    id: "chat-3",
    type: "recipe",
    badge: "Rescue Resep",
    time: "18.30",
    dateGroup: "KEMARIN",
    title: "Tumis Wortel dan Kol Praktis",
    summary: "Selamatkan sisa sayuran di kulkas dengan resep tumis sederhana.",
    prompt: "Tolong kasih resep kilat dari bahan yang hampir basi di kulkasku.",
    tags: ["Wortel", "Kol Putih"],
    readOnly: true,
    data: {
      introText: "Siap! Wortel dan Kol Putih bisa langsung diolah jadi tumisan sehat dalam 10 menit.",
      title: "Tumis Wortel dan Kol Praktis",
      cookingTimeMinutes: 10,
      difficulty: "Sangat Mudah",
      servings: 2,
      matchedItems: ["Wortel", "Kol Putih"],
      additionalIngredients: ["Bumbu dapur dasar (bawang putih, saus tiram, garam)"],
      steps: [
        "Iris tipis wortel dan kol, cuci bersih dengan air mengalir.",
        "Tumis bawang putih hingga harum, masukkan wortel dan sedikit air.",
        "Masukkan kol, beri garam dan saus tiram, aduk cepat 2 menit lalu angkat."
      ]
    }
  },
  {
    id: "chat-4",
    type: "compost",
    badge: "Kompos",
    time: "10.20",
    dateGroup: "KEMARIN",
    title: "Kompos dari kulit buah",
    summary: "Cara mencampur kulit pisang dan daun kering agar kompos seimbang.",
    prompt: "Kulit Pisang ku sudah menghitam. Gimana cara mengolahnya jadi kompos?",
    tags: ["Kulit Pisang"],
    readOnly: true,
    data: {
      foodName: "Kulit Pisang",
      safetyWarning: "Sisa kulit buah tidak untuk dikonsumsi. Alihkan ke pengolahan pupuk.",
      why: "Kulit pisang sangat kaya kalium dan fosfor yang mempercepat pembungaan tanaman.",
      recommendedMethod: "Kompos Padat Wadah / Eco-Enzyme",
      steps: [
        "Cacah kulit pisang menjadi potongan kecil ukuran 2 cm agar cepat hancur.",
        "Campurkan dengan daun kering atau sekam dengan rasio 1:2.",
        "Masukkan ke wadah kompos aktif dan aduk merata."
      ]
    }
  }
];

export const INITIAL_NOTIFICATIONS = [
  {
    id: "notif-1",
    type: "warning",
    group: "HARI INI",
    title: "Bahan Hampir Basi!",
    message: "Bayam Hijau dan Telur Ayam hampir basi. Ketuk untuk lihat resep penyelamat.",
    time: "Baru saja",
    unread: true,
    actionType: "recipe"
  },
  {
    id: "notif-2",
    type: "spoiled",
    group: "HARI INI",
    title: "Bahan Lewat Waktu Simpan",
    message: "Tahu Putih sudah melewati batas simpan. Segera alihkan ke kompos agar tidak bau.",
    time: "2 jam lalu",
    unread: true,
    actionType: "compost"
  },
  {
    id: "notif-3",
    type: "compost_progress",
    group: "SEBELUMNYA",
    title: "Waktunya Aduk Kompos Batch #2",
    message: "Batch #2 sudah masuk hari ke-5 fase pematangan. Aduk perlahan agar aerasi terjaga.",
    time: "Kemarin",
    unread: false,
    actionType: "compost_tab"
  },
  {
    id: "notif-4",
    type: "reminder",
    group: "SEBELUMNYA",
    title: "Pengingat Stok Harian",
    message: "Baru belanja hari ini? Yuk scan struk belanjamu agar masa simpan tercatat otomatis.",
    time: "2 hari lalu",
    unread: false,
    actionType: "scan"
  }
];
