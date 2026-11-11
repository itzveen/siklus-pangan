# 🔌 Panduan Integrasi Frontend & Kontrak API — EatWise (`SiklusPangan`)

Dokumen ini adalah panduan resmi dari **Backend & AI Engineer** untuk tim **Frontend** dalam menyambungkan UI sesuai desain Figma **EatWise**.

---

## 📌 Opsi Cara Koneksi (Pilih Salah Satu)

### Cara A: Via REST API Server (Localhost / Vercel)
* **Base URL Lokal:** `http://localhost:3000/api` (jalankan `npm run api`)
* **Base URL Vercel:** `https://<nama-project-vercel>.vercel.app/api`
* **File Postman:** Import file [`EatWise_Postman_Collection.json`](./EatWise_Postman_Collection.json) langsung ke aplikasi Postman untuk menguji seluruh 19 endpoint.

### Cara B: Import Service Langsung (Jika FE di Repo React Ini)
* Import fungsi langsung dari [`src/services/storageService.js`](./src/services/storageService.js) dan [`src/services/geminiService.js`](./src/services/geminiService.js).

---

## 📋 Daftar Endpoint REST API (Sesuai Flow Figma)

### 1. Autentikasi (Login Google OAuth) & Pengaturan
| Method | Endpoint | Body JSON | Deskripsi (Layar Figma) |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/google` | `{"credential": "<JWT_GOOGLE>"}` atau `{"name": "Budi", "email": "budi@gmail.com"}` | Login dengan Google (`Landing Screen 8:10`). |
| `POST` | `/api/auth/logout` | `{}` | Keluar dari Akun (`Dialog Logout 45:942`). |
| `GET` | `/api/profile` | - | Ambil profil user, tipe hunian (`house`/`apartment`), dan jam pengingat (`Pengaturan 30:2902`). |
| `PUT` | `/api/profile` | `{"householdType": "apartment", "notificationHour": "08:00"}` | Simpan preferensi hunian & jam notifikasi. |

---

### 2. AI Services (Gemini Multimodal & One-Shot Auto-Sent)
> **Catatan Penting Flow Figma (`Tanya AI 32:3707`):**  
> Fitur Tanya AI **bukan** chat bebas bolak-balik. Saat user memilih bahan makanan, pertanyaan otomatis terkirim (`Terkirim otomatis`) dan balasan AI bersifat **one-shot read-only** (`Balasan AI ini tidak bisa dibalas lagi`), serta otomatis tersimpan ke **Riwayat Chat (`54:905`)**.

| Method | Endpoint | Body JSON | Output Utama |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/ai/topics` | - | Mengambil 2 pilihan topik terpandu (`Resep dari bahan hampir basi` & `Olah bahan basi jadi kompos`) beserta daftar bahan yang relevan. |
| `POST` | `/api/ai/scan` | `{"base64Data": "data:image/jpeg;base64,...", "mimeType": "image/jpeg"}` | Memisahkan `foodItems` (makanan + umur simpan hari) dan `ignoredItems` (non-makanan seperti plastik/sabun/tisu). |
| `POST` | `/api/ai/rescue-recipe` | `{"items": [{"name": "Bayam Hijau", "expiryDays": 1}, {"name": "Telur Ayam", "expiryDays": 2}]}` | Menghasilkan 1 resep kilat (`introText`, `title`, `cookingTimeMinutes`, `steps`) + auto-masuk ke `/api/ai/history`. |
| `POST` | `/api/ai/compost-guide` | `{"foodName": "Tahu Putih", "householdType": "house"}` | Menghasilkan panduan kompos 3 langkah sesuai tipe hunian + daftar wadah kompos tersedia + auto-masuk ke `/api/ai/history`. |
| `GET` | `/api/ai/history` | - | Mengambil daftar riwayat percakapan AI (`HARI INI` & `KEMARIN`). |
| `GET` | `/api/ai/history/:id` | - | Mengambil detail 1 percakapan riwayat AI (`chat-1`, dst.). |

---

### 3. Stok Kulkas (Pantry) & Catat Stok Sendiri (Bahan Mentah & Masakan Sisa)
| Method | Endpoint | Body JSON | Deskripsi (Layar Figma) |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/foods` | Query opsional: `?category=vegetable\|meat\|leftover` | Mengambil stok kulkas (`safe`, `warning`, `spoiled`) + metrik reward/impact (`rescuedFoodKg`, `compostedFoodKg`, `co2ePreventedKg`). |
| `POST` | `/api/foods` | `{"stockType": "raw"\|"leftover", "name": "...", "category": "leftover", "quantity": 2, "unit": "porsi", "cookedDate": "2026-11-11", "cookedTime": "19:30", "storage": "chiller", "expiryDays": 2, "notes": "..."}` | Input Manual Bahan Mentah (`29:2621`) & Input Masakan Sisa (`58:132`). |
| `POST` | `/api/foods/bulk` | `{"items": [...]}` | Simpan semua item tercentang dari hasil AI Scan (`22:1954`). |
| `PATCH` | `/api/foods/:id/cook` | - | Tandai selesai dimasak & dihabiskan (`59:518`) — menambah statistik reward `rescuedFoodKg` & `co2ePreventedKg`. |
| `PATCH` | `/api/foods/:id/spoil` | - | Tandai bahan sudah basi/lewat waktu (`61:514`). |

---

### 4. Siklus Kompos (Smart Batching), Panen & Notifikasi
| Method | Endpoint | Body JSON | Deskripsi (Layar Figma) |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/compost/batches` | - | Ambil daftar `activeBatches` (`Batch #1` filling, `Batch #2` curing) & `harvestHistory` (`Batch #0`). |
| `POST` | `/api/compost/add-item` | `{"foodId": "food-4", "foodName": "Tahu Putih", "weightKg": 0.3, "batchId": "batch-1", "option": "existing"}` | Simpan bahan basi ke wadah kompos aktif atau buat batch baru (`32:3286`). |
| `POST` | `/api/compost/:id/lock` | - | Kunci wadah & mulai pematangan 14 hari (`62:75`). |
| `POST` | `/api/compost/:id/simulate` | - | **Tombol Demo Juri:** Lompat 14 hari pematangan hingga status `ready` (`32:3581`). |
| `POST` | `/api/compost/:id/harvest` | `{"weightKg": 3.5}` | Catat panen pupuk kompos (`45:1108`) & pindahkan ke riwayat panen (`55:63`). |
| `GET` | `/api/compost/harvests/:id` | - | Lihat detail riwayat panen kompos beserta log bahan & cara pakai (`Detail Riwayat Panen 55:63`). |
| `GET` | `/api/notifications` | - | Ambil daftar notifikasi pengingat harian (`HARI INI` & `SEBELUMNYA`) + `unreadCount` (`43:195`). |
| `PATCH` | `/api/notifications/read-all` | - | Tandai semua notifikasi sudah dibaca. |
