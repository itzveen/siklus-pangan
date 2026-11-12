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

  const prompt = `Analisis gambar struk belanja atau makanan ini.
Pisahkan antara:
1. "foodItems": Semua makanan & minuman yang bisa dikonsumsi. Rapikan namanya (contoh: "S/ROTI KRIM KEJU 72G" -> "Sari Roti Krim Keju (72g)", "CIMORY MIX BERRY 225" -> "Cimory Yogurt Mix Berry (225ml)"). Tentukan estimasi umur simpan ("expiryDays") dalam hari, berat ("weightKg"), dan lokasi simpan ("storageLabel", misal "4 pcs · Chiller").
2. "ignoredItems": Barang non-makanan seperti kantong plastik, sabun, tisu, deterjen, baterai, diskon, dll (contoh: "PLASTIK SDG" masuk ke ignoredItems dengan tag "PLASTIK" dan reason "Non-makanan").

Balas HANYA dalam JSON valid dengan struktur persis ini:
{
  "foodItems": [
    {
      "name": "Nama Makanan",
      "category": "vegetable|meat|leftover",
      "storage": "chiller",
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
  return parsed?.foodItems ? parsed : mockScanData;
}

/**
 * 2. AI Rescue Recipe (One-Shot Auto-Sent sesuai Figma)
 */
export async function generateRescueRecipe(expiringItems = []) {
  const items = expiringItems.length > 0 ? expiringItems : [{ name: "Bayam Hijau", expiryDays: 1 }, { name: "Telur Ayam", expiryDays: 2 }];
  const firstItem = items[0]?.name || "Bayam Hijau";
  const secondItem = items[1]?.name || "Telur Ayam";

  const fallbackRecipe = {
    introText: items.length > 1
      ? `Siap! ${firstItem} tinggal ${items[0]?.expiryDays || 1} hari, jadi yuk dimasak sekarang bareng ${secondItem}.`
      : `Siap! ${firstItem} tinggal ${items[0]?.expiryDays || 1} hari, yuk dimasak sekarang.`,
    title: items.some(i => i.name.toLowerCase().includes("bayam"))
      ? "Sup Bening Bayam Telur Gurih"
      : `Tumis Kilat ${firstItem} Bawang Putih`,
    cookingTimeMinutes: 12,
    difficulty: "Sangat Mudah",
    servings: 2,
    matchedItems: items.map(i => i.name),
    additionalIngredients: ["Bumbu dapur dasar (bawang putih, garam, air)"],
    steps: [
      "Rebus air bersama irisan bawang putih hingga mendidih.",
      "Kocok telur, tuang perlahan ke dalam kuah sambil diaduk membentuk serabut.",
      "Masukkan bayam, masak sebentar selama 2 menit, angkat dan sajikan."
    ]
  };

  const prompt = `Buat 1 resep kilat (10-15 menit, 3 langkah singkat) dari bahan hampir basi ini: ${items.map(i => i.name).join(", ")}.
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
  const fallbackAnalysis = {
    wasteType: "Protein Nabati & Nitrogen Tinggi",
    recommendedMethod: householdType === "apartment" ? "Kompos Takakura / Bokashi" : "Kompos Padat Wadah / Pupuk Organik Cair",
    why: `${foodName} kaya protein nabati dan nitrogen tinggi, jadi cocok masuk kompos.`,
    safetyWarning: "Makanan berlendir/basi dilarang dikonsumsi. Alihkan ke pengolahan pupuk.",
    steps: [
      `Hancurkan ${foodName.toLowerCase()} basi dengan sendok/sekop kecil.`,
      "Campurkan sekam bakar / tanah kering (perbandingan 1:2) agar tidak bau asam.",
      "Masukkan ke dalam wadah kompos aktif."
    ],
    estimatedDays: 14
  };

  const prompt = `Bahan basi: "${foodName}". Tipe hunian: "${householdType === "apartment" ? "Apartemen/Kos (Takakura/Bokashi/Eco-Enzyme)" : "Rumah (Kompos Padat Wadah / Pupuk Organik Cair)"}".
Balas HANYA JSON:
{
  "wasteType": "Jenis nutrisi organik",
  "recommendedMethod": "Metode kompos",
  "why": "Alasan singkat 1 kalimat",
  "safetyWarning": "Makanan berlendir/basi dilarang dikonsumsi. Alihkan ke pengolahan pupuk.",
  "steps": ["Langkah 1", "Langkah 2", "Langkah 3"],
  "estimatedDays": 14
}`;

  return await callGeminiJson([{ text: prompt }], fallbackAnalysis, 8000);
}
