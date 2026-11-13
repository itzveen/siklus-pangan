const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || "";

// Daftar model teruji (gemini-3.5-flash-lite & 3.6-flash paling cepat dan responsif)
const MODELS = [
  "gemini-3.5-flash-lite",
  "gemini-3.6-flash",
  "gemini-3.1-flash-lite",
  "gemini-3.8-flash"
];

function safeJsonParse(text, fallback) {
  try {
    const cleaned = text.replace(/```json\s*/gi, "").replace(/```\s*/g, "").trim();
    const jsonMatch = cleaned.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
    if (jsonMatch) return JSON.parse(jsonMatch[0]);
    return JSON.parse(cleaned);
  } catch {
    return fallback;
  }
}

async function callGeminiJson(parts, fallback, timeoutPerModelMs = 8000) {
  const activeKey = API_KEY;
  if (!activeKey) return fallback;

  for (const model of MODELS) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutPerModelMs);
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${activeKey}`;
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({
          contents: [{ parts }],
          generationConfig: { responseMimeType: "application/json", temperature: 0.2 }
        })
      });
      clearTimeout(timer);

      if (res.status === 200) {
        const data = await res.json();
        const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
        const parsed = text ? safeJsonParse(text, null) : null;
        if (parsed) return parsed;
      }
      // Jika 429 (kuota) atau 503 (sibuk), rotasi otomatis ke model berikutnya
    } catch (e) {
      clearTimeout(timer);
      console.warn(`Model ${model} fetch error:`, e.message);
    }
  }

  return fallback;
}

/**
 * 1. AI Vision: Scan Struk Belanja / Foto Kulkas
 */
export async function scanReceiptOrFoodImage(base64Data, mimeType = "image/jpeg") {
  const mockScanData = {
    foodItems: [
      { name: "Telur Ayam Negri", category: "meat", storage: "chiller", storageLabel: "10 butir · Chiller", quantityText: "10 butir (500g)", expiryDays: 14, weightKg: 0.5, selected: true },
      { name: "Bayam Segar", category: "vegetable", storage: "chiller", storageLabel: "1 ikat · Crisper", quantityText: "1 ikat (250g)", expiryDays: 2, weightKg: 0.25, selected: true },
      { name: "Tomat Merah", category: "vegetable", storage: "chiller", storageLabel: "500 g · Crisper", quantityText: "500 g", expiryDays: 5, weightKg: 0.5, selected: true }
    ],
    ignoredItems: [
      { name: "Sunlight Pencuci Piring (750ml)", tag: "SABUN", reason: "Non-makanan" },
      { name: "Paseo Facial Tissue (250s)", tag: "SANITASI", reason: "Non-makanan" },
      { name: "Rinso Molto Deterjen (800g)", tag: "LAUNDRY", reason: "Non-makanan" }
    ]
  };

  if (!base64Data || base64Data === "dummy_base64") return mockScanData;

  const cleanBase64 = base64Data.includes(",") ? base64Data.split(",")[1] : base64Data;

  const prompt = `Analisis gambar struk belanja atau foto makanan/isi kulkas ini dengan presisi.
Pisahkan antara:
1. "foodItems": Semua makanan & minuman yang bisa dikonsumsi. Rapikan namanya sesuai produk yang terlihat di gambar (contoh: "S/ROTI KRIM KEJU 72G" -> "Sari Roti Krim Keju (72g)", "CIMORY MIX BERRY 225" -> "Cimory Yogurt Mix Berry (225ml)").
Pilih "category" yang PALING TEPAT dari daftar berikut:
- "vegetable": sayur segar & buah segar (bayam, tomat, buah naga, jambu, apel)
- "meat": daging, ikan, ayam, telur, seafood
- "plant_protein": tahu, tempe, kacang-kacangan
- "carb": bahan pokok karbohidrat & kering (beras, mie instan, roti, tepung, pasta)
- "spice": bumbu dapur & minyak (minyak goreng, gula pasir, garam, kecap, saus, bawang)
- "snack": camilan, minuman kemasan, susu, yogurt, teh, kopi, makanan ringan
- "leftover": masakan matang / siap santap / sisa makanan
PENTING: "weightKg" harus dalam KILOGRAM sebagai angka desimal (contoh: 0.25 untuk 250g/250ml, 1.0 untuk 1kg/1L, 2.0 untuk 2L), JANGAN tulis gram/ml seperti 1600!

2. "ignoredItems": Barang non-makanan seperti kantong plastik, sabun, tisu, deterjen, baterai, pasta gigi, diskon, dll. Jika TIDAK ada barang non-makanan di gambar, kembalikan array kosong [].

Balas HANYA dalam JSON valid dengan struktur persis ini:
{
  "foodItems": [
    {
      "name": "Nama Makanan",
      "category": "vegetable|meat|plant_protein|carb|spice|snack|leftover",
      "storage": "chiller|freezer|room",
      "storageLabel": "Jumlah · Lokasi Simpan",
      "quantityText": "Jumlah/Berat",
      "expiryDays": 5,
      "weightKg": 0.25,
      "selected": true
    }
  ],
  "ignoredItems": [
    {
      "name": "Nama Non-Makanan",
      "tag": "PLASTIK|SABUN|SANITASI|LAUNDRY",
      "reason": "Non-makanan"
    }
  ]
}`;

  const parsed = await callGeminiJson(
    [{ text: prompt }, { inlineData: { data: cleanBase64, mimeType } }],
    mockScanData,
    10000
  );
  if (parsed?.foodItems) {
    parsed.foodItems = parsed.foodItems.map((item) => {
      let w = Number(item.weightKg || 0.3);
      if (w > 25) w = Math.round((w / 1000) * 100) / 100;
      return {
        ...item,
        weightKg: Math.min(25, Math.max(0.05, w))
      };
    });
    return parsed;
  }
  return mockScanData;
}

/**
 * 2. AI Rescue Recipe (One-Shot Auto-Sent sesuai Figma)
 */
export async function generateRescueRecipe(expiringItems = []) {
  const items = expiringItems.length > 0 ? expiringItems : [{ name: "Bayam Hijau", expiryDays: 1 }, { name: "Telur Ayam", expiryDays: 2 }];
  const firstItem = items[0]?.name || "Bayam Hijau";
  const secondItem = items[1]?.name || "Telur Ayam";

  const hasLeftover = items.some((i) => i.stockType === 'leftover' || i.category === 'leftover');
  const itemDescriptions = items
    .map((i) => {
      const kind =
        i.stockType === 'leftover' || i.category === 'leftover'
          ? 'SUDAH MATANG / Masakan Sisa'
          : i.category === 'snack'
            ? 'Camilan / Siap Saji'
            : 'Bahan Mentah';
      return `${i.name} (${kind})`;
    })
    .join(', ');

  const fallbackRecipe = {
    introText: items.length > 1
      ? `Siap! ${firstItem} tinggal ${items[0]?.expiryDays || 1} hari, yuk segera olah bareng ${secondItem}.`
      : `Siap! ${firstItem} tinggal ${items[0]?.expiryDays || 1} hari, yuk segera dihabiskan.`,
    title: hasLeftover
      ? `Hangatkan & Olah Ulang ${firstItem}`
      : items.some(i => i.name.toLowerCase().includes("bayam"))
        ? "Sup Bening Bayam Telur Gurih"
        : `Tumis Kilat ${firstItem} Bawang Putih`,
    cookingTimeMinutes: hasLeftover ? 7 : 12,
    difficulty: "Sangat Mudah",
    servings: 2,
    matchedItems: items.map(i => i.name),
    additionalIngredients: hasLeftover
      ? ["Sedikit air / minyak olesan (untuk reheat)", "Pelengkap opsional (saus / bawang goreng)"]
      : ["Bumbu dapur dasar (bawang putih, garam, air)"],
    steps: hasLeftover
      ? [
          `Keluarkan ${firstItem} dari kulkas dan diamkan 2 menit agar tidak terlalu dingin.`,
          `Panaskan ulang dengan teflon bertutup api kecil, kukusan, atau air fryer selama 3–5 menit hingga hangat merata (jangan terlalu lama agar tidak kering).`,
          `Sajikan selagi hangat dengan taburan bawang goreng atau saus favorit agar cepat habis.`
        ]
      : [
          "Rebus air bersama irisan bawang putih hingga mendidih.",
          "Kocok telur, tuang perlahan ke dalam kuah sambil diaduk membentuk serabut.",
          "Masukkan bayam, masak sebentar selama 2 menit, angkat dan sajikan."
        ]
  };

  const prompt = `Buat 1 panduan penyelamatan makanan kilat (5-15 menit, 3 langkah singkat) dari bahan hampir basi ini: ${itemDescriptions}.
PENTING:
- Jika bahan berstatus "SUDAH MATANG / Masakan Sisa", JANGAN suruh memasak ulang dari mentah/beku! Berikan cara menghangatkan ulang yang aman (kukus/teflon/air fryer) atau ide remix sederhana (misal jadi isian/topping/nasi goreng) agar cepat habis dan tetap lezat.
- Jika bahan berstatus "Bahan Mentah", berikan resep masakan kilat.
Balas HANYA JSON:
{
  "introText": "Siap! ...",
  "title": "Nama Masakan",
  "cookingTimeMinutes": 12,
  "difficulty": "Sangat Mudah",
  "servings": 2,
  "matchedItems": ${JSON.stringify(items.map(i => i.name))},
  "additionalIngredients": ["Bumbu dapur dasar (bawang putih, garam, air)"],
  "steps": ["Langkah 1", "Langkah 2", "Langkah 3"]
}`;

  return await callGeminiJson([{ text: prompt }], fallbackRecipe, 8000);
}

/**
 * 3. AI Compost Guide (One-Shot Auto-Sent sesuai Figma)
 */
export async function analyzeCompostAction(foodItem, householdType = "house") {
  const foodName = foodItem?.name || "Tahu Putih";
  const isApartment = householdType === "apartment";
  const fallbackOptions = isApartment
    ? [
        {
          method: "Eco-Enzyme (Botol Tertutup)",
          suitableFor: "Apartemen / Kos (tanpa bau)",
          description: "Fermentasi dalam botol tertutup rapat selama 3 bulan menjadi cairan pembersih serbaguna."
        },
        {
          method: "Bokashi Ember Kedap Udara",
          suitableFor: "Apartemen / Kos (hemat ruang)",
          description: "Fermentasi anaerob dengan starter EM4 dalam ember tertutup tanpa bau menyengat."
        },
        {
          method: "Drop-off Bank Sampah / Maggot",
          suitableFor: "Praktis tanpa olah sendiri",
          description: "Kumpulkan di wadah tertutup lalu salurkan ke pengelola sampah organik terdekat."
        }
      ]
    : [
        {
          method: "Kompos Tanah / Biopori",
          suitableFor: "Rumah dengan Halaman",
          description: "Olah di lubang biopori atau komposter halaman bersama daun kering."
        },
        {
          method: "Pupuk Organik Cair (POC)",
          suitableFor: "Rumah / Tanaman Pot",
          description: "Fermentasi cair untuk menyiram dan menyuburkan tanaman pekarangan."
        },
        {
          method: "Eco-Enzyme Serbaguna",
          suitableFor: "Fleksibel",
          description: "Alternatif olahan ramah lingkungan selain kompos padat."
        }
      ];

  const fallbackAnalysis = {
    householdType,
    wasteType: "Organik Rumah Tangga",
    recommendedMethod: fallbackOptions[0].method,
    why: isApartment
      ? `Karena hunianmu Kos/Apartemen, ${foodName} lebih cocok diolah dengan metode tertutup tanpa bau (seperti Eco-Enzyme atau Bokashi) dibanding kompos tanah.`
      : `${foodName} bisa diolah menjadi kompos, pupuk cair, atau eco-enzyme sesuai fasilitas di rumahmu.`,
    safetyWarning: "Makanan berlendir/basi dilarang dikonsumsi. Alihkan ke pengolahan non-pangan.",
    alternativeOptions: fallbackOptions,
    steps: isApartment
      ? [
          `Potong kecil ${foodName.toLowerCase()} basi agar mudah terurai.`,
          "Masukkan ke botol/ember kedap udara dengan air + gula merah atau starter EM4.",
          "Tutup rapat dan buang gas berkala setiap 2-3 hari."
        ]
      : [
          `Hancurkan ${foodName.toLowerCase()} basi terlebih dahulu.`,
          "Campurkan sekam bakar / daun kering (perbandingan 1:2) agar tidak bau.",
          "Masukkan ke wadah kompos, biopori, atau ember POC."
        ],
    estimatedDays: 14
  };

  const prompt = `Bahan basi: "${foodName}". Tipe hunian: "${isApartment ? "Kos / Apartemen (hindari kompos tanah terbuka; prioritaskan Eco-Enzyme, Bokashi tertutup, Takakura, atau drop-off Maggot)" : "Rumah dengan Halaman (fleksibel: Kompos Tanah/Biopori, Pupuk Organik Cair, Eco-Enzyme)"}". Berikan 3 opsi olahan fleksibel di "alternativeOptions".
Balas HANYA JSON:
{
  "householdType": "${householdType}",
  "wasteType": "Jenis nutrisi organik",
  "recommendedMethod": "Metode utama",
  "why": "Alasan singkat 1 kalimat",
  "safetyWarning": "Makanan berlendir/basi dilarang dikonsumsi. Alihkan ke pengolahan non-pangan.",
  "alternativeOptions": [{"method": "", "suitableFor": "", "description": ""}],
  "steps": ["Langkah 1", "Langkah 2", "Langkah 3"],
  "estimatedDays": 14
}`;

  const parsed = await callGeminiJson([{ text: prompt }], fallbackAnalysis, 8000);
  if (!Array.isArray(parsed.alternativeOptions) || parsed.alternativeOptions.length === 0) {
    parsed.alternativeOptions = fallbackOptions;
  }
  parsed.householdType = householdType;
  return parsed;
}
