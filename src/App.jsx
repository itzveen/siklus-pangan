import React, { useState, useEffect, useRef } from 'react';
import { jwtDecode } from 'jwt-decode';
import * as store from './services/storageService.js';
import { scanReceiptOrFoodImage, generateRescueRecipe, analyzeCompostAction } from './services/geminiService.js';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

export default function App() {
  const [user, setUser] = useState(store.getUserProfile());
  const [lastScannedItems, setLastScannedItems] = useState([]);
  const [jsonOutput, setJsonOutput] = useState(null);
  const [loading, setLoading] = useState(false);
  const googleBtnRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) return;
    const initGoogle = () => {
      if (!window.google?.accounts?.id || !googleBtnRef.current) return false;
      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: (response) => {
          const decoded = jwtDecode(response.credential);
          const updated = store.saveUserProfile({
            ...store.getUserProfile(),
            name: decoded.given_name || decoded.name,
            fullName: decoded.name,
            email: decoded.email,
            picture: decoded.picture,
            isLoggedIn: true
          });
          setUser(updated);
          setJsonOutput({
            endpoint: 'POST /api/auth/google (Google OAuth Callback)',
            status: 200,
            jwtDecoded: decoded,
            savedUserProfile: updated
          });
        }
      });
      window.google.accounts.id.renderButton(googleBtnRef.current, {
        theme: 'outline',
        size: 'large',
        text: 'signin_with',
        width: 260
      });
      return true;
    };

    if (!initGoogle()) {
      const timer = setInterval(() => {
        if (initGoogle()) clearInterval(timer);
      }, 300);
      return () => clearInterval(timer);
    }
  }, []);

  const runTest = async (label, fn) => {
    setLoading(true);
    try {
      const res = await fn();
      setJsonOutput({ endpoint: label, status: 200, data: res });
    } catch (err) {
      setJsonOutput({ endpoint: label, status: 500, error: err.message });
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const base64Data = String(reader.result).split(',')[1];
      runTest(`POST /api/ai/scan (File: ${file.name})`, async () => {
        const res = await scanReceiptOrFoodImage(base64Data, file.type);
        if (res?.foodItems) setLastScannedItems(res.foodItems);
        return res;
      });
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-6 font-mono text-xs">
      <div className="max-w-4xl mx-auto space-y-4">
        <div className="border border-slate-700 bg-slate-800 p-4 rounded-xl">
          <h1 className="text-base font-bold text-emerald-400">EatWise — Backend & AI Service Sandbox (100% Figma Coverage)</h1>
          <p className="text-slate-400 mt-1">
            Halaman ini untuk menguji seluruh logic Backend (`storageService.js` & `geminiService.js`) atau jalankan <code className="text-amber-300">npm run api</code> untuk mengetes di <strong>Postman</strong> (<code className="text-amber-300">http://localhost:3000/api</code>).
          </p>
        </div>

        {/* 1. AUTH, PROFILE & PENGATURAN */}
        <div className="border border-slate-700 bg-slate-800 p-4 rounded-xl space-y-2">
          <h2 className="font-bold text-amber-400">1. Auth, Profile & Pengaturan (`Landing 8:10`, `Pengaturan 30:2902`, `Dialog Logout 45:942`)</h2>
          <p className="text-slate-400">
            Status Client ID: {GOOGLE_CLIENT_ID ? <span className="text-emerald-400">Terpasang ({GOOGLE_CLIENT_ID.slice(0, 18)}...)</span> : <span className="text-rose-400">Belum diisi di .env</span>}
            {' | '}Status Login: <span className={user.isLoggedIn !== false ? 'text-emerald-400' : 'text-rose-400'}>{user.isLoggedIn !== false ? `Aktif (${user.email})` : 'Logged Out'}</span>
          </p>
          <div ref={googleBtnRef} className="py-1 min-h-[44px]" />
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => runTest('GET /api/profile', async () => store.getUserProfile())}
              className="bg-slate-700 hover:bg-slate-600 px-3 py-1.5 rounded"
            >
              GET /api/profile
            </button>
            <button
              onClick={() => runTest('PUT /api/profile (Toggle Hunian)', async () => {
                const current = store.getUserProfile();
                const nextType = current.householdType === 'house' ? 'apartment' : 'house';
                const updated = store.saveUserProfile({ ...current, householdType: nextType });
                setUser(updated);
                return updated;
              })}
              className="bg-slate-700 hover:bg-slate-600 px-3 py-1.5 rounded"
            >
              PUT /api/profile (Hunian: {user.householdType})
            </button>
            <button
              onClick={() => runTest('PUT /api/profile (Jam Pengingat -1 Jam)', async () => {
                const updated = store.adjustNotificationHour(-1);
                setUser(updated);
                return updated;
              })}
              className="bg-slate-700 hover:bg-slate-600 px-3 py-1.5 rounded"
            >
              − Jam Pengingat ({user.notificationHour || '08:00'})
            </button>
            <button
              onClick={() => runTest('PUT /api/profile (Jam Pengingat +1 Jam)', async () => {
                const updated = store.adjustNotificationHour(1);
                setUser(updated);
                return updated;
              })}
              className="bg-slate-700 hover:bg-slate-600 px-3 py-1.5 rounded"
            >
              + Jam Pengingat ({user.notificationHour || '08:00'})
            </button>
            <button
              onClick={() => runTest('POST /api/auth/logout', async () => {
                const updated = store.logoutUser();
                setUser(updated);
                return { message: 'Berhasil keluar dari akun', user: updated };
              })}
              className="bg-rose-800 hover:bg-rose-700 px-3 py-1.5 rounded"
            >
              POST /api/auth/logout (Keluar Akun)
            </button>
          </div>
        </div>

        {/* 2. AI ENDPOINTS & SCAN STRUK */}
        <div className="border border-slate-700 bg-slate-800 p-4 rounded-xl space-y-2">
          <h2 className="font-bold text-amber-400">2. Tanya AI (2 Topik Terpandu), Riwayat Chat & AI Vision Scan Struk (`32:3707`, `54:905`, `22:1954`)</h2>
          <input ref={fileInputRef} type="file" accept="image/*" hidden onChange={handleFileUpload} />
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => runTest('GET /api/ai/topics (2 Pilihan Topik Tanya AI)', async () => store.getAiTopics())}
              className="bg-slate-700 hover:bg-slate-600 px-3 py-1.5 rounded"
            >
              GET /api/ai/topics (2 Topik)
            </button>
            <button
              onClick={() => runTest('POST /api/ai/rescue-recipe (Topik 1: Resep Bahan Hampir Basi)', async () => {
                const items = store.getFoodItems().filter(f => f.status === 'warning').slice(0, 2);
                const recipe = await generateRescueRecipe(items);
                store.addAiHistoryEntry({
                  type: 'recipe',
                  badge: 'Rescue Resep',
                  title: recipe.title,
                  summary: `${items.map(i => i.name).join(' dan ')} jadi hidangan hangat, siap dalam ${recipe.cookingTimeMinutes} menit.`,
                  prompt: 'Tolong kasih resep kilat dari bahan yang hampir basi di kulkasku.',
                  tags: items.map(i => i.name),
                  readOnly: true,
                  data: recipe
                });
                return {
                  autoSentPrompt: 'Tolong kasih resep kilat dari bahan yang hampir basi di kulkasku.',
                  tags: items.map(i => i.name),
                  readOnlyNotice: 'Balasan AI ini tidak bisa dibalas lagi',
                  ctaButtons: ['Masakan Selesai & Dihabiskan', 'Lihat Riwayat Chat'],
                  recipe
                };
              })}
              className="bg-emerald-700 hover:bg-emerald-600 px-3 py-1.5 rounded font-bold"
            >
              POST /api/ai/rescue-recipe
            </button>
            <button
              onClick={() => runTest('POST /api/ai/compost-guide (Topik 2: Olah Bahan Basi Jadi Kompos)', async () => {
                const item = { name: 'Tahu Putih' };
                const guide = await analyzeCompostAction(item, user.householdType);
                store.addAiHistoryEntry({
                  type: 'compost',
                  badge: 'Kompos',
                  title: `Olah ${item.name} jadi kompos`,
                  summary: `Panduan mengolah ${item.name.toLowerCase()} yang sudah basi untuk batch komposmu.`,
                  prompt: `${item.name} ku sudah basi. Gimana cara mengolahnya jadi kompos?`,
                  tags: [item.name],
                  readOnly: true,
                  data: guide
                });
                return {
                  autoSentPrompt: `${item.name} ku sudah basi. Gimana cara mengolahnya jadi kompos?`,
                  tags: [item.name],
                  readOnlyNotice: 'Balasan AI ini tidak bisa dibalas lagi',
                  availableBatches: store.getCompostBatches().map(b => ({
                    id: b.id,
                    title: b.title,
                    stage: b.stage,
                    selectable: b.stage === 'filling'
                  })),
                  guide
                };
              })}
              className="bg-emerald-700 hover:bg-emerald-600 px-3 py-1.5 rounded font-bold"
            >
              POST /api/ai/compost-guide
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="bg-teal-700 hover:bg-teal-600 px-3 py-1.5 rounded font-bold"
            >
              📷 Upload Foto Struk/Makanan Asli (AI Vision)
            </button>
            <button
              onClick={() => runTest('POST /api/foods/bulk (Simpan Bahan Terpilih Hasil Scan ke Kulkas)', async () => {
                const toSave = lastScannedItems.length > 0
                  ? lastScannedItems.filter(i => i.selected !== false)
                  : [
                      { name: 'Sari Roti Krim Keju (72g)', category: 'carb', storage: 'room', expiryDays: 4, weightKg: 0.072 },
                      { name: 'Cimory Yogurt Mix Berry (225ml)', category: 'other', storage: 'chiller', expiryDays: 7, weightKg: 0.225 }
                    ];
                const updated = store.addMultipleFoodItems(toSave);
                return { savedCount: toSave.length, savedItems: toSave, totalFoodsInFridge: updated.length };
              })}
              className="bg-teal-800 hover:bg-teal-700 px-3 py-1.5 rounded"
            >
              POST /api/foods/bulk (Simpan Hasil Scan ke Kulkas)
            </button>
            <button
              onClick={() => runTest('GET /api/ai/history (Riwayat Chat)', async () => store.getAiHistory())}
              className="bg-slate-700 hover:bg-slate-600 px-3 py-1.5 rounded"
            >
              GET /api/ai/history
            </button>
            <button
              onClick={() => runTest('GET /api/ai/history/chat-1 (Detail Riwayat Chat)', async () => store.getAiHistoryDetail('chat-1'))}
              className="bg-slate-700 hover:bg-slate-600 px-3 py-1.5 rounded"
            >
              GET /api/ai/history/:id (Detail Chat)
            </button>
          </div>
        </div>

        {/* 3. PANTRY & CATAT STOK SENDIRI */}
        <div className="border border-slate-700 bg-slate-800 p-4 rounded-xl space-y-2">
          <h2 className="font-bold text-amber-400">3. Kulkas, Catat Stok Sendiri & Rescue (`Bahan Mentah 29:2621`, `Masakan Sisa 58:132`, `Masak Selesai 59:518`)</h2>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => runTest('GET /api/foods (+ Impact & Reward Stats)', async () => ({
                foods: store.getFoodItems(),
                impact: store.getImpactStats()
              }))}
              className="bg-slate-700 hover:bg-slate-600 px-3 py-1.5 rounded"
            >
              GET /api/foods (+ Reward Kg & CO2e)
            </button>
            <button
              onClick={() => runTest('POST /api/foods (Catat Stok Sendiri: Bahan Mentah)', async () => {
                return store.addFoodItem({
                  stockType: 'raw',
                  name: 'Wortel Brastagi',
                  category: 'vegetable',
                  categoryLabel: 'Sayur & Buah',
                  quantity: 3,
                  unit: 'buah',
                  quantityText: '3 buah (300g)',
                  storage: 'chiller',
                  storageLabel: '3 buah · Chiller',
                  expiryDays: 5,
                  weightKg: 0.3,
                  notes: 'Beli di pasar pagi'
                });
              })}
              className="bg-indigo-700 hover:bg-indigo-600 px-3 py-1.5 rounded"
            >
              + Tambah Bahan Mentah (Manual)
            </button>
            <button
              onClick={() => runTest('POST /api/foods (Catat Stok Sendiri: Masakan Sisa)', async () => {
                return store.addFoodItem({
                  stockType: 'leftover',
                  name: 'Ayam Bakar Kecap Sisa Semalam',
                  category: 'leftover',
                  categoryLabel: 'Masakan Sisa',
                  quantity: 2,
                  unit: 'porsi',
                  quantityText: '2 porsi (350g)',
                  cookedDate: '2026-11-11',
                  cookedTime: '19:30',
                  storage: 'chiller',
                  storageLabel: '2 porsi · Chiller',
                  expiryDays: 2,
                  weightKg: 0.35,
                  notes: 'Panaskan sebelum makan'
                });
              })}
              className="bg-indigo-700 hover:bg-indigo-600 px-3 py-1.5 rounded"
            >
              + Tambah Masakan Sisa (Manual)
            </button>
            <button
              onClick={() => runTest('PATCH /api/foods/food-1/cook (Masakan Selesai & Dihabiskan)', async () => {
                const foods = store.getFoodItems();
                const target = foods[0];
                if (!target) return { message: 'Stok kulkas kosong, klik Reset dulu' };
                const remaining = store.markFoodAsCooked(target.id);
                return {
                  message: `${target.name} ditandai selesai dimasak & dihabiskan!`,
                  rewardImpact: store.getImpactStats(),
                  remainingFoodsCount: remaining.length
                };
              })}
              className="bg-emerald-800 hover:bg-emerald-700 px-3 py-1.5 rounded"
            >
              PATCH /api/foods/:id/cook (Masak Selesai & Reward)
            </button>
            <button
              onClick={() => runTest('PATCH /api/foods/food-3/spoil (Tandai Basi / Alihkan ke Kompos)', async () => {
                const foods = store.getFoodItems();
                const target = foods.find(f => f.status !== 'spoiled') || foods[0];
                if (!target) return { message: 'Stok kulkas kosong' };
                const updated = store.markFoodAsSpoiled(target.id);
                return { markedSpoiled: target.name, foods: updated };
              })}
              className="bg-amber-800 hover:bg-amber-700 px-3 py-1.5 rounded"
            >
              PATCH /api/foods/:id/spoil (Tandai Basi)
            </button>
          </div>
        </div>

        {/* 4. SIKLUS KOMPOS, PANEN & NOTIFIKASI */}
        <div className="border border-slate-700 bg-slate-800 p-4 rounded-xl space-y-2">
          <h2 className="font-bold text-amber-400">4. Siklus Kompos, Detail Panen & Notifikasi (`32:3581`, `45:1108`, `55:63`, `43:195`)</h2>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => runTest('GET /api/compost/batches', async () => ({
                activeBatches: store.getCompostBatches(),
                harvestHistory: store.getHarvestHistory(),
                impact: store.getImpactStats()
              }))}
              className="bg-slate-700 hover:bg-slate-600 px-3 py-1.5 rounded"
            >
              GET /api/compost/batches
            </button>
            <button
              onClick={() => runTest('POST /api/compost/add-item (Simpan ke Wadah Kompos)', async () => {
                const batches = store.getCompostBatches();
                const fillingBatch = batches.find(b => b.stage === 'filling');
                const updated = store.addFoodToCompost(
                  { id: 'food-4', name: 'Tahu Putih Basi', weightKg: 0.3 },
                  fillingBatch?.id || null
                );
                return {
                  message: 'Bahan basi berhasil dimasukkan ke wadah kompos',
                  activeBatches: updated,
                  impact: store.getImpactStats()
                };
              })}
              className="bg-emerald-800 hover:bg-emerald-700 px-3 py-1.5 rounded"
            >
              POST /api/compost/add-item (Simpan Wadah Kompos)
            </button>
            <button
              onClick={() => runTest('POST /api/compost/batch-1/lock (Kunci Wadah 14 Hari)', async () => {
                const updated = store.lockBatchForCuring('batch-1');
                return { message: 'Wadah dikunci! Pematangan 14 hari dimulai.', activeBatches: updated };
              })}
              className="bg-amber-800 hover:bg-amber-700 px-3 py-1.5 rounded"
            >
              POST /api/compost/:id/lock (Kunci Wadah)
            </button>
            <button
              onClick={() => runTest('POST /api/compost/batch-2/simulate (Simulasi Lompat 14 Hari)', async () => {
                const batches = store.getCompostBatches();
                const target = batches.find(b => b.stage === 'curing') || batches[0];
                if (!target) return { message: 'Tidak ada batch aktif, klik Reset dulu' };
                const updated = store.fastForwardBatchDemo(target.id, 14);
                return { message: `Simulasi 14 hari selesai! ${target.title} siap dipanen.`, activeBatches: updated };
              })}
              className="bg-purple-800 hover:bg-purple-700 px-3 py-1.5 rounded"
            >
              POST /api/compost/:id/simulate (Simulasi 14 Hari)
            </button>
            <button
              onClick={() => runTest('POST /api/compost/batch-2/harvest (Catat Panen Kompos)', async () => {
                const batches = store.getCompostBatches();
                const target = batches.find(b => b.stage === 'ready' || b.stage === 'curing') || batches[0];
                if (!target) return { message: 'Tidak ada batch untuk dipanen, klik Reset dulu' };
                const harvestRecord = store.harvestBatch(target.id, 3.5);
                return {
                  message: 'Panen berhasil dicatat!',
                  harvestRecord,
                  harvestHistory: store.getHarvestHistory()
                };
              })}
              className="bg-teal-800 hover:bg-teal-700 px-3 py-1.5 rounded"
            >
              POST /api/compost/:id/harvest (Catat Panen 3.5 Kg)
            </button>
            <button
              onClick={() => runTest('GET /api/compost/harvests/batch-0 (Lihat Detail Panen)', async () => {
                return store.getHarvestDetail('batch-0');
              })}
              className="bg-slate-700 hover:bg-slate-600 px-3 py-1.5 rounded"
            >
              GET /api/compost/harvests/:id (Detail Panen)
            </button>
            <button
              onClick={() => runTest('GET /api/notifications', async () => {
                const all = store.getNotifications();
                return {
                  unreadCount: all.filter(n => n.unread).length,
                  today: all.filter(n => n.group === 'HARI INI'),
                  earlier: all.filter(n => n.group !== 'HARI INI')
                };
              })}
              className="bg-slate-700 hover:bg-slate-600 px-3 py-1.5 rounded"
            >
              GET /api/notifications
            </button>
            <button
              onClick={() => runTest('PATCH /api/notifications/read-all', async () => {
                const updated = store.markAllNotificationsRead();
                return { unreadCount: 0, notifications: updated };
              })}
              className="bg-slate-700 hover:bg-slate-600 px-3 py-1.5 rounded"
            >
              PATCH /api/notifications/read-all
            </button>
            <button
              onClick={() => runTest('POST /api/reset', async () => {
                store.resetAllDataToDummy();
                setUser(store.getUserProfile());
                return { message: 'Seluruh data berhasil direset ke kondisi awal demo!' };
              })}
              className="bg-rose-800 hover:bg-rose-700 px-3 py-1.5 rounded font-bold"
            >
              POST /api/reset (Reset Data Demo)
            </button>
          </div>
        </div>

        {/* JSON OUTPUT VIEWER */}
        <div className="border border-slate-700 bg-slate-950 p-4 rounded-xl">
          <div className="flex justify-between items-center mb-2">
            <span className="text-slate-400 font-bold">JSON Response Output:</span>
            {loading && <span className="text-amber-400 animate-pulse">Memproses request...</span>}
          </div>
          <pre className="overflow-x-auto text-emerald-300 whitespace-pre-wrap">
            {jsonOutput ? JSON.stringify(jsonOutput, null, 2) : '// Klik salah satu tombol di atas untuk melihat response JSON'}
          </pre>
        </div>
      </div>
    </div>
  );
}
