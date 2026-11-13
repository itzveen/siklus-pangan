import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  INITIAL_FOOD_ITEMS,
  INITIAL_COMPOST_BATCHES,
  INITIAL_HARVEST_HISTORY,
  INITIAL_IMPACT_STATS,
  INITIAL_USER_PROFILE,
  INITIAL_AI_HISTORY,
  INITIAL_NOTIFICATIONS
} from './data/dummyData.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Load .env manual jika belum dimuat via --env-file
const envPath = path.join(__dirname, '..', '.env');
if (fs.existsSync(envPath)) {
  const lines = fs.readFileSync(envPath, 'utf8').split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx > 0) {
      const key = trimmed.slice(0, eqIdx).trim();
      const val = trimmed.slice(eqIdx + 1).trim();
      if (!process.env[key]) process.env[key] = val;
    }
  }
}

const API_KEY = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY || '';
const MODELS = [
  'gemini-3.8-flash',
  'gemini-3.5-flash-lite',
  'gemini-3.6-flash',
  'gemini-3.1-flash-lite'
];

function createEmptyDb() {
  return {
    foods: [],
    batches: [],
    harvests: [],
    impact: { rescuedFoodKg: 0, compostedFoodKg: 0, co2ePreventedKg: 0 },
    profile: { name: 'Pengguna Baru', email: '', avatar: '', isLoggedIn: false },
    aiHistory: [],
    notifications: []
  };
}

function createDemoDb() {
  return {
    foods: structuredClone(INITIAL_FOOD_ITEMS),
    batches: structuredClone(INITIAL_COMPOST_BATCHES),
    harvests: structuredClone(INITIAL_HARVEST_HISTORY),
    impact: structuredClone(INITIAL_IMPACT_STATS),
    profile: structuredClone(INITIAL_USER_PROFILE),
    aiHistory: structuredClone(INITIAL_AI_HISTORY),
    notifications: structuredClone(INITIAL_NOTIFICATIONS)
  };
}

// In-memory database untuk REST API (mulai kosong tanpa dummy; bisa di-reset via POST /api/reset)
let db = createEmptyDb();

function safeJsonParse(text, fallback) {
  try {
    const cleaned = text.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim();
    const jsonMatch = cleaned.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
    if (jsonMatch) return JSON.parse(jsonMatch[0]);
    return JSON.parse(cleaned);
  } catch {
    return fallback;
  }
}

async function callGeminiJson(parts, fallback, timeoutPerModelMs = 6500) {
  if (!API_KEY) return fallback;
  for (const model of MODELS) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutPerModelMs);
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${API_KEY}`;
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          contents: [{ parts }],
          generationConfig: { responseMimeType: 'application/json', temperature: 0.2 }
        })
      });
      clearTimeout(timer);
      if (res.status === 200) {
        const data = await res.json();
        const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
        const parsed = text ? safeJsonParse(text, null) : null;
        if (parsed) return parsed;
      } else {
        const errText = await res.text().catch(() => '');
        console.warn(`[Gemini] ${model} HTTP ${res.status}: ${errText.slice(0, 180)}`);
      }
    } catch (err) {
      clearTimeout(timer);
      console.warn(`[Gemini] ${model} error:`, err?.message || err);
    }
  }
  return fallback;
}

function sendJson(res, status, payload) {
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization'
  });
  const body = (payload && typeof payload === 'object' && !Array.isArray(payload) && status < 400 && !('status' in payload))
    ? { status: 'ok', ...payload }
    : payload;
  res.end(JSON.stringify(body, null, 2));
}

function parseBody(req) {
  return new Promise((resolve) => {
    let raw = '';
    req.on('data', chunk => { raw += chunk; });
    req.on('end', () => {
      if (!raw) return resolve({});
      try {
        resolve(JSON.parse(raw));
      } catch {
        resolve({});
      }
    });
  });
}

export async function handleRequest(req, res) {
  if (req.method === 'OPTIONS') {
    return sendJson(res, 200, { ok: true });
  }

  const host = req.headers.host || 'localhost:3000';
  const url = new URL(req.url, `http://${host}`);
  const pathname = url.pathname;
  const method = req.method;

  // 0. Healthcheck & Daftar Endpoint
  if (method === 'GET' && (pathname === '/' || pathname === '/api')) {
    return sendJson(res, 200, {
      service: 'EatWise (SiklusPangan) Backend API',
      version: '1.0.0',
      models: MODELS,
      endpoints: [
        'POST   /api/auth/google          -> Login dengan Google Credential / Profile',
        'POST   /api/auth/logout          -> Logout user',
        'GET    /api/profile              -> Ambil profil & preferensi hunian',
        'PUT    /api/profile              -> Update preferensi hunian / jam notifikasi',
        'GET    /api/foods                -> Ambil stok bahan makanan di kulkas + impact stats',
        'POST   /api/foods                -> Tambah bahan manual (Bahan Mentah / Masakan Sisa)',
        'POST   /api/foods/bulk           -> Simpan banyak bahan hasil AI Scan ke kulkas',
        'PATCH  /api/foods/:id/cook       -> Tandai bahan selesai dimasak / habis',
        'PATCH  /api/foods/:id/spoil      -> Tandai bahan basi / lewat waktu',
        'POST   /api/ai/scan              -> AI Vision: Scan struk / foto kulkas (pisahkan makanan vs non-makanan)',
        'POST   /api/ai/rescue-recipe     -> Tanya AI (Auto-Sent One-Shot): Resep penyelamat bahan kritis',
        'POST   /api/ai/compost-guide     -> Tanya AI (Auto-Sent One-Shot): Panduan olah bahan basi jadi kompos',
        'GET    /api/ai/history           -> Ambil riwayat percakapan Tanya AI',
        'GET    /api/compost/batches      -> Ambil daftar batch kompos aktif & riwayat panen',
        'POST   /api/compost/add-item     -> Simpan bahan basi ke wadah kompos (Batch aktif / baru)',
        'POST   /api/compost/:id/lock     -> Kunci wadah kompos & mulai fase pematangan 14 hari',
        'POST   /api/compost/:id/simulate -> Simulasi Demo: Lompat 14 hari pematangan',
        'POST   /api/compost/:id/harvest  -> Catat hasil panen pupuk kompos (Kg)',
        'GET    /api/notifications        -> Ambil daftar notifikasi bahan kritis & kompos',
        'POST   /api/reset                -> Reset seluruh data ke kondisi awal demo'
      ]
    });
  }

  // 1. AUTH: Google Login & Logout
  if (method === 'POST' && pathname === '/api/auth/google') {
    const body = await parseBody(req);
    let userPayload = {
      name: body.name || 'Budi',
      fullName: body.fullName || 'Budi Santoso',
      email: body.email || 'budi@gmail.com',
      picture: body.picture || null
    };

    // Jika dikirim JWT id_token / credential dari Google Sign-In
    if (body.credential) {
      try {
        const parts = body.credential.split('.');
        const decoded = JSON.parse(Buffer.from(parts[1], 'base64url').toString('utf8'));
        userPayload = {
          name: decoded.given_name || decoded.name || 'Budi',
          fullName: decoded.name || 'Budi Santoso',
          email: decoded.email || 'budi@gmail.com',
          picture: decoded.picture || null
        };
      } catch {
        // gunakan fallback body
      }
    }

    db.profile = {
      ...db.profile,
      ...userPayload,
      isLoggedIn: true
    };
    return sendJson(res, 200, { message: 'Login Google berhasil', user: db.profile });
  }

  if (method === 'POST' && pathname === '/api/auth/logout') {
    db.profile.isLoggedIn = false;
    return sendJson(res, 200, { message: 'Logout berhasil', isLoggedIn: false });
  }

  // 2. PROFILE & PENGATURAN
  if (method === 'GET' && pathname === '/api/profile') {
    return sendJson(res, 200, db.profile);
  }

  if (method === 'PUT' && pathname === '/api/profile') {
    const body = await parseBody(req);
    db.profile = { ...db.profile, ...body };
    return sendJson(res, 200, { message: 'Profil & preferensi diperbarui', profile: db.profile });
  }

  // 3. PANTRY / FOODS CRUD
  if (method === 'GET' && pathname === '/api/foods') {
    const category = url.searchParams.get('category');
    const items = category && category !== 'all'
      ? db.foods.filter(f => f.category === category)
      : db.foods;
    return sendJson(res, 200, {
      total: items.length,
      warningCount: db.foods.filter(f => f.status === 'warning').length,
      spoiledCount: db.foods.filter(f => f.status === 'spoiled').length,
      impact: db.impact,
      foods: items
    });
  }

  if (method === 'POST' && pathname === '/api/foods') {
    const body = await parseBody(req);
    const expiry = Number(body.expiryDays ?? (body.stockType === 'leftover' ? 2 : 3));
    const newItem = {
      id: `food-${Date.now()}`,
      stockType: body.stockType || (body.category === 'leftover' ? 'leftover' : 'raw'),
      name: body.name || 'Bayam Hijau',
      category: body.category || 'vegetable',
      categoryLabel: body.categoryLabel || (body.stockType === 'leftover' ? 'Masakan Sisa' : 'Sayur & Buah'),
      quantity: Number(body.quantity || 1),
      unit: body.unit || (body.stockType === 'leftover' ? 'porsi' : 'ikat'),
      quantityText: body.quantityText || `${body.quantity || 1} ${body.unit || (body.stockType === 'leftover' ? 'porsi' : 'ikat')}`,
      storage: body.storage || 'chiller',
      cookedDate: body.cookedDate || null,
      cookedTime: body.cookedTime || null,
      expiryDays: expiry,
      maxExpiryDays: Math.max(expiry, 7),
      weightKg: Number(body.weightKg || 0.3),
      addedAt: new Date().toISOString().split('T')[0],
      status: expiry <= 0 ? 'spoiled' : (expiry <= 2 ? 'warning' : 'safe'),
      notes: body.notes || ''
    };
    db.foods.unshift(newItem);
    return sendJson(res, 201, { message: 'Bahan berhasil disimpan ke kulkas', item: newItem });
  }

  if (method === 'POST' && pathname === '/api/foods/bulk') {
    const body = await parseBody(req);
    const list = Array.isArray(body.items) ? body.items : [];
    const added = list.map((item, idx) => {
      const expiry = Number(item.expiryDays ?? 3);
      return {
        id: `food-${Date.now()}-${idx}`,
        name: item.name,
        category: item.category || 'vegetable',
        categoryLabel: item.categoryLabel || 'Bahan segar',
        quantityText: item.quantityText || '1 porsi (250g)',
        storage: item.storage || 'chiller',
        expiryDays: expiry,
        maxExpiryDays: Math.max(expiry, 7),
        weightKg: Number(item.weightKg || 0.3),
        addedAt: new Date().toISOString().split('T')[0],
        status: expiry <= 0 ? 'spoiled' : (expiry <= 2 ? 'warning' : 'safe')
      };
    });
    db.foods = [...added, ...db.foods];
    return sendJson(res, 201, { message: `${added.length} bahan disimpan ke kulkas`, added });
  }

  const cookMatch = pathname.match(/^\/api\/foods\/([^/]+)\/cook$/);
  if (method === 'PATCH' && cookMatch) {
    const foodId = cookMatch[1];
    const target = db.foods.find(f => f.id === foodId) || db.foods[0] || INITIAL_FOOD_ITEMS[0];
    const w = target.weightKg || 0.3;
    db.impact.rescuedFoodKg = Math.round((db.impact.rescuedFoodKg + w) * 10) / 10;
    db.impact.co2ePreventedKg = Math.round((db.impact.co2ePreventedKg + w * 2.5) * 10) / 10;
    db.foods = db.foods.filter(f => f.id !== foodId);
    return sendJson(res, 200, { status: 'ok', message: `${target.name} selesai dimasak & dihabiskan`, impact: db.impact });
  }

  const spoilMatch = pathname.match(/^\/api\/foods\/([^/]+)\/spoil$/);
  if (method === 'PATCH' && spoilMatch) {
    const foodId = spoilMatch[1];
    const target = db.foods.find(f => f.id === foodId) || db.foods[0] || structuredClone(INITIAL_FOOD_ITEMS[2]);
    target.status = 'spoiled';
    target.expiryDays = 0;
    return sendJson(res, 200, { status: 'ok', message: `${target.name} ditandai basi / lewat waktu`, item: target });
  }

  // 4. AI ENDPOINTS (Scan, Rescue Recipe, Compost Guide, History)
  if (method === 'POST' && pathname === '/api/ai/scan') {
    const body = await parseBody(req);
    const mockScanData = {
      foodItems: [
        { name: 'Telur Ayam Negri', category: 'meat', storage: 'chiller', storageLabel: '10 butir · Chiller', quantityText: '10 butir (500g)', expiryDays: 14, weightKg: 0.5, selected: true },
        { name: 'Bayam Segar', category: 'vegetable', storage: 'chiller', storageLabel: '1 ikat · Crisper', quantityText: '1 ikat (250g)', expiryDays: 2, weightKg: 0.25, selected: true },
        { name: 'Tomat Merah', category: 'vegetable', storage: 'chiller', storageLabel: '500 g · Crisper', quantityText: '500 g', expiryDays: 5, weightKg: 0.5, selected: true }
      ],
      ignoredItems: [
        { name: 'Sunlight Pencuci Piring (750ml)', tag: 'SABUN', reason: 'Non-makanan' },
        { name: 'Paseo Facial Tissue (250s)', tag: 'SANITASI', reason: 'Non-makanan' },
        { name: 'Rinso Molto Deterjen (800g)', tag: 'LAUNDRY', reason: 'Non-makanan' }
      ]
    };

    const rawBase64 = body.base64Data || body.imageBase64 || '';
    if (!rawBase64 || rawBase64 === 'dummy_base64') {
      return sendJson(res, 200, mockScanData);
    }

    const cleanBase64 = rawBase64.includes(',') ? rawBase64.split(',')[1] : rawBase64;
    const prompt = `Analisis gambar struk belanja atau makanan ini. Pisahkan "foodItems" (makanan & minuman, rapikan namanya) dan "ignoredItems" (barang non-makanan seperti plastik, sabun, tisu, diskon). Balas JSON: {"foodItems":[{"name":"","category":"vegetable|meat|leftover","storage":"chiller","storageLabel":"","quantityText":"","expiryDays":5,"weightKg":0.3,"selected":true}],"ignoredItems":[{"name":"","tag":"PLASTIK|SABUN|SANITASI|LAUNDRY","reason":"Non-makanan"}]}`;
    const result = await callGeminiJson(
      [{ text: prompt }, { inlineData: { data: cleanBase64, mimeType: body.mimeType || 'image/jpeg' } }],
      mockScanData,
      15000
    );
    return sendJson(res, 200, result);
  }

  if (method === 'POST' && pathname === '/api/ai/rescue-recipe') {
    const body = await parseBody(req);
    const expiringItems = Array.isArray(body.items) && body.items.length > 0
      ? body.items
      : db.foods.filter(f => f.status === 'warning').slice(0, 2);

    const tags = expiringItems.map(i => typeof i === 'string' ? i : i.name);
    const first = tags[0] || 'Bayam Hijau';
    const second = tags[1] || 'Telur Ayam';

    const fallbackRecipe = {
      introText: tags.length > 1
        ? `Siap! ${first} tinggal 1 hari, jadi yuk dimasak sekarang bareng ${second}.`
        : `Siap! ${first} tinggal 1 hari, yuk dimasak sekarang.`,
      title: 'Sup Bening Bayam Telur Gurih',
      cookingTimeMinutes: 12,
      difficulty: 'Sangat Mudah',
      servings: 2,
      matchedItems: tags,
      additionalIngredients: ['Bumbu dapur dasar (bawang putih, garam, air)'],
      steps: [
        'Rebus air bersama irisan bawang putih hingga mendidih.',
        'Kocok telur, tuang perlahan ke dalam kuah sambil diaduk membentuk serabut.',
        'Masukkan bayam, masak sebentar selama 2 menit, angkat dan sajikan.'
      ]
    };

    const prompt = `Buat 1 resep kilat (10-15 menit, 3 langkah) dari bahan kritis: ${tags.join(', ')}. Balas JSON: {"introText":"","title":"","cookingTimeMinutes":12,"difficulty":"Sangat Mudah","servings":2,"matchedItems":${JSON.stringify(tags)},"additionalIngredients":["Bumbu dapur dasar (bawang putih, garam, air)"],"steps":["Langkah 1","Langkah 2","Langkah 3"]}`;
    const recipe = await callGeminiJson([{ text: prompt }], fallbackRecipe, 5000);

    const historyEntry = {
      id: `chat-${Date.now()}`,
      type: 'recipe',
      badge: 'Rescue Resep',
      time: new Date().toTimeString().slice(0, 5).replace(':', '.'),
      dateGroup: 'HARI INI',
      title: recipe.title,
      summary: `${tags.join(' dan ')} jadi hidangan hangat, siap dalam ${recipe.cookingTimeMinutes} menit.`,
      prompt: 'Tolong kasih resep kilat dari bahan yang hampir basi di kulkasku.',
      tags,
      readOnly: true,
      data: recipe
    };
    db.aiHistory.unshift(historyEntry);

    return sendJson(res, 200, {
      autoSentPrompt: historyEntry.prompt,
      tags,
      readOnlyNotice: 'Balasan AI ini tidak bisa dibalas lagi',
      recipe
    });
  }

  if (method === 'POST' && pathname === '/api/ai/compost-guide') {
    const body = await parseBody(req);
    const foodName = body.foodName || body.name || 'Tahu Putih';
    const householdType = body.householdType || db.profile.householdType || 'house';

    const isApartment = householdType === 'apartment';
    const fallbackOptions = isApartment
      ? [
          {
            method: 'Eco-Enzyme (Botol Tertutup)',
            suitableFor: 'Apartemen / Kos (tanpa bau & hemat tempat)',
            description: 'Fermentasi sisa sayur/buah dengan gula merah & air dalam botol tertutup rapat selama 3 bulan jadi cairan pembersih alami.'
          },
          {
            method: 'Bokashi Ember Kedap Udara',
            suitableFor: 'Apartemen / Kos (tertutup rapat)',
            description: 'Fermentasi anaerob dalam ember tertutup dengan EM4/dedak agar tidak menimbulkan bau di dalam ruangan.'
          },
          {
            method: 'Setor ke Bank Sampah / Budidaya Maggot',
            suitableFor: 'Praktis tanpa olah sendiri',
            description: 'Pisahkan dalam wadah tertutup lalu salurkan ke pengelola sampah organik atau peternak maggot BSF terdekat.'
          }
        ]
      : [
          {
            method: 'Kompos Tanah / Biopori',
            suitableFor: 'Rumah dengan Halaman',
            description: 'Olah di lubang biopori atau komposter halaman dengan campuran daun kering/tanah.'
          },
          {
            method: 'Pupuk Organik Cair (POC)',
            suitableFor: 'Rumah dengan Halaman / Tanaman Pot',
            description: 'Fermentasikan dengan air cucian beras dan sedikit gula untuk pupuk siram tanaman.'
          },
          {
            method: 'Eco-Enzyme Serbaguna',
            suitableFor: 'Fleksibel (Dalam & Luar Ruangan)',
            description: 'Cocok untuk sisa buah/sayur agar menjadi cairan pembersih alami dan pupuk cair.'
          }
        ];

    const fallbackAnalysis = {
      householdType,
      wasteType: 'Organik Rumah Tangga',
      recommendedMethod: fallbackOptions[0].method,
      why: isApartment
        ? `Karena kamu tinggal di Kos/Apartemen, ${foodName} lebih aman diolah dengan metode tertutup/tanpa bau seperti Eco-Enzyme atau Bokashi daripada kompos tanah terbuka.`
        : `${foodName} cocok diolah menjadi pupuk/olahan organik; pilih metode yang paling pas dengan kondisi rumahmu.`,
      safetyWarning: 'Makanan berlendir/basi dilarang dikonsumsi. Alihkan ke pengolahan non-pangan.',
      alternativeOptions: fallbackOptions,
      steps: isApartment
        ? [
            `Potong kecil ${foodName.toLowerCase()} basi agar proses fermentasi lebih cepat.`,
            'Masukkan ke botol/wadah kedap udara bersama air & sedikit gula merah atau starter EM4.',
            'Tutup rapat, beri label tanggal, dan buka tutup sebentar tiap 2-3 hari untuk buang gas.'
          ]
        : [
            `Potong atau hancurkan ${foodName.toLowerCase()} basi terlebih dahulu.`,
            'Campurkan dengan bahan cokelat (daun kering / sekam / tanah kering) perbandingan 1:2.',
            'Simpan di lubang biopori, wadah komposter, atau ember POC tertutup.'
          ],
      estimatedDays: 14
    };

    const prompt = `Bahan basi/sisa: "${foodName}". Hunian pengguna: "${isApartment ? 'Kos / Apartemen (WAJIB tanpa bau, hemat ruang, JANGAN sarankan kompos tanah terbuka; prioritaskan Eco-Enzyme, Bokashi kedap udara, Takakura, atau drop-off Maggot)' : 'Rumah dengan Halaman (fleksibel: Kompos Tanah/Biopori, Pupuk Organik Cair, atau Eco-Enzyme)'}". Jangan memaksakan hanya 1 cara kompos—berikan 3 opsi olahan fleksibel di "alternativeOptions". Balas JSON: {"householdType":"${householdType}","wasteType":"","recommendedMethod":"","why":"","safetyWarning":"Makanan berlendir/basi dilarang dikonsumsi. Alihkan ke pengolahan non-pangan.","alternativeOptions":[{"method":"","suitableFor":"","description":""}],"steps":["Langkah 1","Langkah 2","Langkah 3"],"estimatedDays":14}`;
    const guide = await callGeminiJson([{ text: prompt }], fallbackAnalysis, 6000);
    if (!Array.isArray(guide.alternativeOptions) || guide.alternativeOptions.length === 0) {
      guide.alternativeOptions = fallbackOptions;
    }
    guide.householdType = householdType;

    const historyEntry = {
      id: `chat-${Date.now()}`,
      type: 'compost',
      badge: 'Kompos',
      time: new Date().toTimeString().slice(0, 5).replace(':', '.'),
      dateGroup: 'HARI INI',
      title: `Olah ${foodName} jadi kompos`,
      summary: `Panduan mengolah ${foodName.toLowerCase()} yang sudah basi untuk batch komposmu.`,
      prompt: `${foodName} ku sudah basi. Gimana cara mengolahnya jadi kompos?`,
      tags: [foodName],
      readOnly: true,
      data: guide
    };
    db.aiHistory.unshift(historyEntry);

    return sendJson(res, 200, {
      autoSentPrompt: historyEntry.prompt,
      tags: [foodName],
      readOnlyNotice: 'Balasan AI ini tidak bisa dibalas lagi',
      availableBatches: db.batches,
      guide
    });
  }

  if (method === 'GET' && pathname === '/api/ai/topics') {
    const expiringItems = db.foods.filter(f => f.status === 'warning');
    const spoiledItems = db.foods.filter(f => f.status === 'spoiled');
    return sendJson(res, 200, {
      greeting: 'Halo! Aku asisten zero-waste EatWise. Pilih topik di bawah untuk menyelamatkan bahan hampir basi atau mengolah bahan basi jadi kompos.',
      securityNotice: 'Percakapan dibatasi pada topik penyelamatan makanan & kompos (1x balasan otomatis).',
      topics: [
        {
          id: 'recipe',
          title: 'Resep dari bahan hampir basi',
          subtitle: `${expiringItems.length} bahan kritis siap diselamatkan`,
          autoPrompt: 'Tolong kasih resep kilat dari bahan yang hampir basi di kulkasku.',
          items: expiringItems
        },
        {
          id: 'compost',
          title: 'Olah bahan basi jadi kompos',
          subtitle: `${spoiledItems.length} bahan lewat waktu simpan`,
          autoPrompt: 'Bahan makananku sudah basi. Gimana cara mengolahnya jadi kompos?',
          items: spoiledItems
        }
      ]
    });
  }

  if (method === 'GET' && pathname === '/api/ai/history') {
    return sendJson(res, 200, {
      total: db.aiHistory.length,
      history: db.aiHistory
    });
  }

  const historyDetailMatch = pathname.match(/^\/api\/ai\/history\/([^/]+)$/);
  if (method === 'GET' && historyDetailMatch) {
    const chat = db.aiHistory.find(c => c.id === historyDetailMatch[1]) || db.aiHistory[0] || INITIAL_AI_HISTORY[0];
    return sendJson(res, 200, chat);
  }

  // 5. SIKLUS KOMPOS & PANEN
  if (method === 'GET' && pathname === '/api/compost/batches') {
    return sendJson(res, 200, {
      activeBatches: db.batches,
      harvestHistory: db.harvests
    });
  }

  if (method === 'POST' && pathname === '/api/compost/add-item') {
    const body = await parseBody(req);
    const foodName = body.foodName || 'Tahu Putih';
    const weight = Number(body.weightKg || 0.3);
    const todayShort = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });

    let targetBatch = db.batches.find(b => b.id === body.batchId && b.stage === 'filling')
      || (body.option !== 'new' ? db.batches.find(b => b.stage === 'filling') : null);

    if (targetBatch) {
      targetBatch.fillPercentage = Math.min(100, (targetBatch.fillPercentage || 60) + 15);
      targetBatch.totalWeightKg = Math.round(((targetBatch.totalWeightKg || 0) + weight) * 10) / 10;
      targetBatch.logs.push({ id: `log-${Date.now()}`, date: todayShort, item: foodName, weightKg: weight });
    } else {
      targetBatch = {
        id: `batch-${Date.now()}`,
        title: `Batch #${db.batches.length + 1}`,
        subtitle: 'Wadah Dapur Baru',
        method: 'Takakura / Komposter Wadah',
        stage: 'filling',
        dayCount: 1,
        fillPercentage: 20,
        startedAt: new Date().toISOString().split('T')[0],
        curingDaysLeft: 14,
        totalWeightKg: weight,
        logs: [{ id: `log-${Date.now()}`, date: todayShort, item: foodName, weightKg: weight }]
      };
      db.batches.unshift(targetBatch);
    }

    if (body.foodId) {
      db.foods = db.foods.filter(f => f.id !== body.foodId);
    }
    db.impact.compostedFoodKg = Math.round((db.impact.compostedFoodKg + weight) * 10) / 10;
    db.impact.co2ePreventedKg = Math.round((db.impact.co2ePreventedKg + weight * 2.5) * 10) / 10;

    return sendJson(res, 200, {
      message: `${foodName} berhasil disimpan ke ${targetBatch.title} (${targetBatch.subtitle}).`,
      batch: targetBatch,
      impact: db.impact
    });
  }

  const lockMatch = pathname.match(/^\/api\/compost\/([^/]+)\/lock$/);
  if (method === 'POST' && lockMatch) {
    const batch = db.batches.find(b => b.id === lockMatch[1]) || db.batches[0] || structuredClone(INITIAL_COMPOST_BATCHES[0]);
    batch.stage = 'curing';
    batch.dayCount = 1;
    batch.curingDaysLeft = 14;
    return sendJson(res, 200, { message: `${batch.title} dikunci dan mulai fase pematangan 14 hari`, batch });
  }

  const simMatch = pathname.match(/^\/api\/compost\/([^/]+)\/simulate$/);
  if (method === 'POST' && simMatch) {
    const batch = db.batches.find(b => b.id === simMatch[1]) || db.batches[0] || structuredClone(INITIAL_COMPOST_BATCHES[1]);
    batch.stage = 'ready';
    batch.dayCount = 14;
    batch.fillPercentage = 100;
    batch.curingDaysLeft = 0;
    return sendJson(res, 200, { message: `Simulasi 14 hari selesai! ${batch.title} matang & siap panen.`, batch });
  }

  const harvestMatch = pathname.match(/^\/api\/compost\/([^/]+)\/harvest$/);
  if (method === 'POST' && harvestMatch) {
    const body = await parseBody(req);
    const batch = db.batches.find(b => b.id === harvestMatch[1]) || db.batches[0] || structuredClone(INITIAL_COMPOST_BATCHES[1]);
    const record = {
      id: batch.id,
      title: batch.title,
      harvestDate: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }),
      weightKg: Number(body.weightKg || 3.5),
      outputType: 'Pupuk Organik Siap Pakai',
      status: 'Selesai',
      logs: batch.logs,
      usageGuide: [
        {
          title: 'Pemakaian ke Tanaman',
          instruction: 'Taburkan tipis di sekitar tanaman, atau campur ke media tanam.'
        },
        {
          title: 'Penyimpanan Sisa Pupuk',
          instruction: 'Simpan sisanya di wadah kering dan tertutup.'
        }
      ]
    };
    db.harvests.unshift(record);
    db.batches = db.batches.filter(b => b.id !== batch.id);
    return sendJson(res, 200, { message: 'Panen berhasil dicatat!', harvest: record });
  }

  const harvestDetailMatch = pathname.match(/^\/api\/compost\/harvests\/([^/]+)$/);
  if (method === 'GET' && harvestDetailMatch) {
    const harvest = db.harvests.find(h => h.id === harvestDetailMatch[1]) || db.harvests[0] || INITIAL_HARVEST_HISTORY[0];
    return sendJson(res, 200, {
      ...harvest,
      outputType: harvest.outputType || 'Pupuk Organik Siap Pakai',
      usageGuide: harvest.usageGuide || [
        {
          title: 'Pemakaian ke Tanaman',
          instruction: 'Taburkan tipis di sekitar tanaman, atau campur ke media tanam.'
        },
        {
          title: 'Penyimpanan Sisa Pupuk',
          instruction: 'Simpan sisanya di wadah kering dan tertutup.'
        }
      ]
    });
  }

  // 6. NOTIFICATIONS & RESET
  if (method === 'GET' && pathname === '/api/notifications') {
    return sendJson(res, 200, {
      unreadCount: db.notifications.filter(n => n.unread).length,
      notifications: db.notifications
    });
  }

  if (method === 'PATCH' && pathname === '/api/notifications/read-all') {
    db.notifications = db.notifications.map(n => ({ ...n, unread: false }));
    return sendJson(res, 200, {
      message: 'Semua notifikasi ditandai sudah dibaca',
      notifications: db.notifications
    });
  }

  if (method === 'POST' && pathname === '/api/reset') {
    const useDemo = url.searchParams.get('demo') === 'true';
    db = useDemo ? createDemoDb() : createEmptyDb();
    return sendJson(res, 200, {
      message: useDemo ? 'Seluruh data backend di-reset ke data demo' : 'Seluruh data backend di-reset ke kosong'
    });
  }

  return sendJson(res, 404, { error: `Endpoint ${method} ${pathname} tidak ditemukan` });
}

if (!process.env.VERCEL) {
  const PORT = process.env.PORT || 3001;
  const server = http.createServer(handleRequest);
  server.listen(PORT, () => {
    console.log(`✅ EatWise Backend REST API berjalan di http://localhost:${PORT}/api`);
  });
}

export default handleRequest;
