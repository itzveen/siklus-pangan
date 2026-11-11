# 📘 PANDUAN PENGEMBANGAN FRONTEND (FE GUIDELINE)
**Proyek:** SiklusPangan (Logicodix 2026)  
**Dokumen ini ditujukan untuk:** Rekan Pengembang Frontend (FE) & UI Slicer.

---

## 📂 1. Struktur Folder Proyek

```text
siklus-pangan/
├── public/                 # Favicon dan aset statis
├── src/
│   ├── assets/             # Logo, icon, gambar
│   ├── components/         # Komponen UI modular
│   │   ├── Navbar.jsx          # Header profil & alert badge
│   │   ├── BottomNav.jsx       # 4 tab navigasi bawah
│   │   ├── FoodCard.jsx        # Kartu bahan (Hijau, Kuning, Merah)
│   │   ├── ScanModal.jsx       # Modal scan struk & foto kulkas (AI)
│   │   ├── ManualInputModal.jsx# Modal tambah manual masakan sisa
│   │   ├── RecipeModal.jsx     # Modal resep penyelamat (AI)
│   │   ├── CompostModal.jsx    # Modal olah kompos & toggle batch
│   │   └── ImpactWidget.jsx    # Counter kg terselamatkan & emisi CO2
│   ├── pages/              # Halaman / Tampilan Tab
│   │   ├── PantryPage.jsx      # Halaman utama stok kulkas
│   │   ├── ChatPage.jsx        # Halaman Tanya AI & riwayat chat
│   │   ├── CompostPage.jsx     # Halaman manajemen batch kompos
│   │   └── SettingsPage.jsx    # Halaman profil, preferensi & tombol demo
│   ├── services/           # Logika AI & Data
│   │   ├── geminiService.js    # Fungsi pemanggil Google Gemini API
│   │   └── storageService.js   # Helper simpan/ambil LocalStorage
│   ├── App.jsx             # Root component & state global
│   ├── index.css           # Konfigurasi Tailwind CSS
│   └── main.jsx            # Entry point React
├── .env.example            # Contoh template konfigurasi API key
├── README.md               # Dokumentasi resmi proyek untuk dewan juri
└── package.json
```

---

## 💾 2. Skema Data di LocalStorage

Untuk memudahkan kita bekerja tanpa backend server, seluruh data disimpan di `localStorage` dengan format JSON yang rapi:

### A. Data Bahan Makanan (`siklus_foods`)
```json
[
  {
    "id": "food-1",
    "name": "Bayam Hijau",
    "category": "vegetable", // vegetable | fruit | meat | leftover | seasoning
    "storage": "chiller",    // chiller | freezer | room
    "expiryDays": 1,         // sisa hari sebelum kadaluwarsa
    "addedAt": "2026-11-10",
    "status": "warning"      // safe (hijau) | warning (kuning) | spoiled (merah)
  },
  {
    "id": "food-2",
    "name": "Tahu Putih Sutra",
    "category": "vegetable",
    "storage": "chiller",
    "expiryDays": 0,
    "addedAt": "2026-11-08",
    "status": "spoiled"
  }
]
```

### B. Data Batch Kompos (`siklus_compost_batches`)
```json
[
  {
    "id": "batch-1",
    "title": "Kompos Ember Dapur #1",
    "stage": "filling",      // filling (fase pengisian) | curing (pematangan) | ready (matang)
    "fillPercentage": 60,
    "startedAt": "2026-11-05",
    "curingDaysLeft": 14,
    "logs": [
      { "date": "2026-11-05", "item": "Kulit wortel & pisang", "weightKg": 0.4 },
      { "date": "2026-11-08", "item": "Tahu basi & ampas teh", "weightKg": 0.3 }
    ]
  }
]
```

---

## 🤖 3. Cara Memanggil AI (`geminiService.js`)

AI digunakan pada 3 titik utama:
1. **Scan Struk / Kulkas:** Mengirim gambar base64 $\rightarrow$ AI mengembalikan daftar bahan makanan dan otomatis memisahkan barang non-makanan (sabun, deterjen, tisu).
2. **Resep Penyelamat:** Mengirim daftar bahan kritis (kuning) $\rightarrow$ AI meracik resep masakan rumahan 10 menit.
3. **Panduan Kompos:** Mengirim nama bahan basi $\rightarrow$ AI menentukan metode kompos (misal: Takakura, Eco-Enzyme, POC) dan instruksi 3 langkah.

> **Catatan Pengembang:** Di dalam `geminiService.js`, sudah disiapkan mode *Mock Fallback*. Jika API key belum diisi di `.env`, sistem tetap bisa berjalan normal menggunakan data simulasi cerdas agar proses koding antarmuka tidak terhambat!

---

## 🌿 4. Aturan Git Commit (Sangat Penting untuk Penilaian Juri!)

Guidebook mewajibkan riwayat komitmen (*commit history*) yang rapi dan orisinal. Gunakan format standar industri (**Conventional Commits**):

* `feat: ...` $\rightarrow$ Untuk penambahan fitur baru  
  *Contoh:* `feat: tambahkan modal scan struk belanja dengan AI`
* `ui: ...` $\rightarrow$ Untuk styling tampilan / komponen antarmuka  
  *Contoh:* `ui: perbaiki kartu bahan makanan berstatus kuning`
* `fix: ...` $\rightarrow$ Untuk perbaikan bug  
  *Contoh:* `fix: perbaiki toggle pemilihan batch kompos aktif`
* `docs: ...` $\rightarrow$ Untuk pembaruan dokumentasi  
  *Contoh:* `docs: lengkapi panduan instalasi localhost di README`

---

## 🏁 5. Urutan Pengerjaan Sprint FE (Step-by-Step)

1. **Tahap 1:** Pasang kerangka layout utama (Navbar atas, Bottom Navigation 4 tab, dan Container Card).
2. **Tahap 2:** Buat daftar kartu stok kulkas dengan 3 warna (🟢 Hijau, 🟡 Kuning, 🔴 Merah) membaca dari data dummy lokal.
3. **Tahap 3:** Integrasikan tombol aksi:
   * Klik Kuning $\rightarrow$ Buka pop-up Resep Penyelamat.
   * Klik Merah $\rightarrow$ Buka pop-up Alihkan ke Kompos (dengan toggle pilih batch aktif).
4. **Tahap 4:** Sambungkan fungsi kamera/upload foto ke `geminiService.js`.
5. **Tahap 5:** Tambahkan tombol developer `[⏩ Lompat 14 Hari]` di halaman Kompos untuk demonstrasi dewan juri.
