import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || "";
let genAI = null;

if (API_KEY) {
  genAI = new GoogleGenerativeAI(API_KEY);
}

/**
 * 1. AI Vision: Scan Struk Belanja atau Foto Kulkas
 * Mengidentifikasi bahan makanan sekaligus menyaring (memisahkan) barang non-makanan
 */
export async function scanReceiptOrFoodImage(base64Data, mimeType = "image/jpeg") {
  // Jika API key belum dipasang, gunakan Smart Mock Fallback agar FE tetap bisa dites
  if (!API_KEY || !genAI) {
    console.warn("VITE_GEMINI_API_KEY belum disetel. Menggunakan smart mock parser.");
    await new Promise(r => setTimeout(r, 1200)); // Simulasi latensi AI
    return {
      foodItems: [
        { name: "Telur Ayam", category: "meat", storage: "room", expiryDays: 14, weightKg: 0.5 },
        { name: "Bayam Hijau Segar", category: "vegetable", storage: "chiller", expiryDays: 2, weightKg: 0.25 },
        { name: "Tomat Merah", category: "vegetable", storage: "chiller", expiryDays: 5, weightKg: 0.4 },
        { name: "Roti Tawar Gandum", category: "leftover", storage: "room", expiryDays: 3, weightKg: 0.3 }
      ],
      ignoredItems: [
        { name: "Sabun Cuci Piring Sunlight", reason: "Non-makanan (Perlengkapan pembersih)" },
        { name: "Tisu Wajah Paseo", reason: "Non-makanan (Perlengkapan rumah tangga)" },
        { name: "Deterjen Bubuk Rinso", reason: "Non-makanan (Deterjen)" }
      ]
    };
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const prompt = `
      Anda adalah sistem AI pengenal bahan makanan & pembaca struk belanja untuk aplikasi zero-waste "SiklusPangan".
      Tugas Anda:
      1. Analisis gambar ini (struk belanjaan atau foto makanan di kulkas/meja).
      2. Ekstrak daftar item dan PISAHKAN menjadi 2 kategori:
         - "foodItems": Bahan makanan (sayur, buah, bumbu, telur, daging, karbohidrat, masakan matang). Tentukan estimasi umur simpan dalam hari (expiryDays) dan tempat simpan terbaik (storage: "chiller", "freezer", atau "room").
         - "ignoredItems": Barang non-makanan (misal: sabun, deterjen, sampo, tisu, pasta gigi, plastik, baterai) beserta alasannya.
      3. Format output WAJIB HANYA berupa JSON valid tanpa teks pembuka atau penutup:
      {
        "foodItems": [
          { "name": "Bayam", "category": "vegetable", "storage": "chiller", "expiryDays": 2, "weightKg": 0.3 }
        ],
        "ignoredItems": [
          { "name": "Sunlight 750ml", "reason": "Bukan bahan makanan" }
        ]
      }
    `;

    const imagePart = {
      inlineData: {
        data: base64Data,
        mimeType: mimeType
      }
    };

    const response = await model.generateContent([prompt, imagePart]);
    const text = response.response.text();
    const cleanJson = text.replace(/```json/g, "").replace(/```/g, "").trim();
    return JSON.parse(cleanJson);
  } catch (err) {
    console.error("Gemini Vision API Error:", err);
    throw err;
  }
}

/**
 * 2. AI Rescue Recipe: Resep Penyelamat Bahan Kritis
 */
export async function generateRescueRecipe(expiringItems) {
  const itemNames = expiringItems.map(i => i.name).join(", ");

  if (!API_KEY || !genAI) {
    await new Promise(r => setTimeout(r, 1000));
    return {
      title: `Tumis Kilat ${expiringItems[0]?.name || "Sayur"} Bumbu Bawang Gurih`,
      cookingTimeMinutes: 12,
      difficulty: "Sangat Mudah",
      servings: 2,
      matchedItems: expiringItems.map(i => i.name),
      additionalIngredients: ["2 siung bawang putih cincang", "1 sdt garam & lada", "1 sdm minyak goreng", "Air secukupnya"],
      steps: [
        "Cuci bersih bahan makanan yang tersisa, buang bagian yang sudah menguning atau layu ekstrem.",
        "Panaskan minyak di wajan, tumis bawang putih hingga harum dan kecokelatan.",
        `Masukkan ${itemNames}, bumbui dengan garam dan sedikit lada, aduk cepat selama 3-5 menit hingga matang sempurna dan sajikan hangat.`
      ]
    };
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const prompt = `
      Anda adalah "EcoChef AI", koki penyelamat makanan rumah tangga agar tidak ada yang terbuang.
      Bahan-bahan yang hampir kadaluwarsa saat ini: ${itemNames}.
      Buatlah 1 resep masakan rumahan Indonesia yang super cepat (waktu masak maksimal 15 menit), praktis, dan lezat untuk menghabiskan bahan tersebut.
      Format kembalian WAJIB HANYA JSON murni:
      {
        "title": "Nama Resep Menarik",
        "cookingTimeMinutes": 15,
        "difficulty": "Sangat Mudah",
        "servings": 2,
        "matchedItems": ["Bahan 1", "Bahan 2"],
        "additionalIngredients": ["Bumbu dasar rumah tangga"],
        "steps": [
          "Langkah 1",
          "Langkah 2",
          "Langkah 3"
        ]
      }
    `;

    const response = await model.generateContent(prompt);
    const text = response.response.text();
    const cleanJson = text.replace(/```json/g, "").replace(/```/g, "").trim();
    return JSON.parse(cleanJson);
  } catch (err) {
    console.error("Gemini Recipe API Error:", err);
    throw err;
  }
}

/**
 * 3. AI Closed-Loop Composting: Menganalisis Sampah Basi & Solusi Upcycling Spesifik
 */
export async function analyzeCompostAction(foodItem, householdType = "house") {
  const name = foodItem.name.toLowerCase();

  // Smart heuristic & rule based fallback
  const isTofu = name.includes("tahu") || name.includes("tempe") || name.includes("kedelai");
  const isCitrus = name.includes("jeruk") || name.includes("lemon") || name.includes("nanas");
  const isMeat = name.includes("daging") || name.includes("ayam") || name.includes("ikan") || name.includes("tulang");

  if (!API_KEY || !genAI) {
    await new Promise(r => setTimeout(r, 1000));
    if (isTofu) {
      return {
        wasteType: "Protein Nabati Berkadar Air Tinggi (Tahu/Tempe)",
        recommendedMethod: householdType === "apartment" ? "Kompos Takakura / Wadah Kedap" : "Kompos Wadah Berpori",
        why: "Tahu basi kaya akan unsur Nitrogen yang sangat bagus untuk tanah, namun basah dan cepat berbau asam jika tidak diseimbangkan dengan unsur karbon kering.",
        safetyWarning: "⚠️ Makanan berlendir mengandung bakteri pembusuk. Dilarang keras dikonsumsi kembali!",
        steps: [
          "Lumatkan atau hancurkan tahu basi dengan sendok/sekop kecil agar cepat terurai mikroba.",
          "Campurkan dengan bahan kering (sekam bakar, serbuk kayu, atau tanah gembur) dengan perbandingan 1:2 untuk menyerap kelembapan.",
          "Masukkan ke dalam wadah kompos aktif dan aduk merata agar aerasi oksigen terjaga."
        ],
        estimatedDays: 14
      };
    } else if (isCitrus) {
      return {
        wasteType: "Kulit Buah Kaya Asam & Enzim",
        recommendedMethod: "Cairan Pembersih Alami (Eco-Enzyme)",
        why: "Kulit jeruk/nanas mengandung aroma segar dan asam alami yang sangat ideal dijadikan cairan pembersih serbaguna tanpa bau busuk.",
        safetyWarning: "Kulit buah sisa tidak untuk dimakan.",
        steps: [
          "Potong kecil-kecil kulit buah agar mudah masuk botol.",
          "Campurkan dengan perbandingan 1 bagian gula merah/molase : 3 bagian kulit buah : 10 bagian air ke dalam botol plastik bekas.",
          "Tutup rapat botol dan buka tutupnya 2 hari sekali di minggu pertama untuk membuang gas fermentasi."
        ],
        estimatedDays: 90
      };
    } else if (isMeat) {
      return {
        wasteType: "Sisa Hewani / Lemak",
        recommendedMethod: "Penguburan Lubang Biopori / Komposter Tertutup",
        why: "Daging dan lemak berisiko mengundang belatung dan tikus jika dimasukkan ke komposter terbuka biasa.",
        safetyWarning: "⚠️ Daging basi berisiko bakteri Salmonella/E. Coli. Cuci tangan setelah memegangnya.",
        steps: [
          "Jangan masukkan ke wadah kompos ember dapur biasa.",
          "Kubur di dalam tanah pekarangan atau lubang biopori sedalam minimal 30 cm.",
          "Tutup lubang dengan tanah tebal agar aroma tidak tercium hewan peliharaan/lalat."
        ],
        estimatedDays: 30
      };
    } else {
      return {
        wasteType: "Sampah Organik Sayur & Buah Hijau",
        recommendedMethod: "Komposter Rumah Tangga Sederhana",
        why: "Mudah terurai secara alami dan kaya nutrisi nitrogen untuk menyuburkan tanaman.",
        safetyWarning: "Bahan sudah tidak layak makan.",
        steps: [
          "Cacah sisa sayuran menjadi ukuran 2-3 cm.",
          "Masukkan ke dalam ember/wadah kompos aktif.",
          "Taburkan segenggam tanah atau sekam di atasnya untuk menutupi sampah basah."
        ],
        estimatedDays: 14
      };
    }
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const prompt = `
      Anda adalah ahli biokimia lingkungan dan komposting rumah tangga untuk "SiklusPangan".
      Pengguna memiliki bahan makanan yang sudah basi/rusak: "${foodItem.name}".
      Tipe hunian pengguna: "${householdType === "apartment" ? "Apartemen / Kos (Tanpa pekarangan luas)" : "Rumah dengan halaman"}".

      Berikan analisis dan panduan pengolahan sirkular (kompos / eco-enzyme / biopori).
      Format kembalian WAJIB HANYA JSON:
      {
        "wasteType": "Kategori jenis limbah (misal: Nabati berair / Sisa hewani / Asam buah)",
        "recommendedMethod": "Nama metode (misal: Kompos Takakura / Eco-Enzyme / Biopori)",
        "why": "Alasan biokimia singkat kenapa metode ini cocok",
        "safetyWarning": "Peringatan etika & keselamatan penanganan makanan basi",
        "steps": [
          "Langkah 1",
          "Langkah 2",
          "Langkah 3"
        ],
        "estimatedDays": 14
      }
    `;

    const response = await model.generateContent(prompt);
    const text = response.response.text();
    const cleanJson = text.replace(/```json/g, "").replace(/```/g, "").trim();
    return JSON.parse(cleanJson);
  } catch (err) {
    console.error("Gemini Compost API Error:", err);
    throw err;
  }
}

/**
 * 4. AI EcoChef Assistant Chat: Konsultasi Zero-Waste Dapur
 */
export async function askEcoChefAssistant(userMessage) {
  if (!API_KEY || !genAI) {
    await new Promise(r => setTimeout(r, 800));
    return "Halo! Sebagai asisten zero-waste SiklusPangan, saya sarankan selalu memeriksa kondisi fisik makanan: jika berlendir atau berjamur, segera alihkan ke wadah kompos ya, jangan dipaksakan dimakan demi kesehatan!";
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const prompt = `
      Anda adalah "SiklusBot", asisten dapur ramah lingkungan dan ahli zero-waste rumah tangga.
      Jawablah pertanyaan pengguna ini secara ringkas (maksimal 3 paragraf), hangat, praktis, dan edukatif:
      "${userMessage}"
    `;
    const response = await model.generateContent(prompt);
    return response.response.text();
  } catch (err) {
    console.error("Gemini Chat API Error:", err);
    return "Maaf, terjadi gangguan koneksi ke AI. Silakan coba lagi sebentar lagi.";
  }
}
