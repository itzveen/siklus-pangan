# 🌱 EatWise (`SiklusPangan`) — Backend & AI Engine

> **Closed-Loop Food Management & Smart Upcycling AI**  
> *Solusi Digital Sirkular untuk Mengakhiri Food Waste Rumah Tangga dari Dapur hingga Kompos.*

[![LOGICODIX 2026](https://img.shields.io/badge/LOGICODIX%202026-Hackathon%20Project-16a34a?style=for-the-badge)](https://github.com/itzveen/siklus-pangan)
[![Node.js](https://img.shields.io/badge/Node.js-REST_API-339933?style=for-the-badge&logo=nodedotjs)](https://nodejs.org)
[![Google Gemini API](https://img.shields.io/badge/Google_Gemini-Vision_&_AI-4285f4?style=for-the-badge&logo=google)](https://aistudio.google.com)

---

## 📂 Struktur Repositori (Branch `feature/ai-integration`)

```text
siklus-pangan/
├── api/
│   └── index.js                         # Entrypoint Vercel Serverless REST API
├── postman/
│   └── EatWise_Postman_Collection.json  # Koleksi Postman (21 Endpoint + Automated Test)
├── src/
│   ├── services/
│   │   ├── dummyData.js                 # Seed data deterministik
│   │   ├── geminiService.js             # AI Engine (Multi-Model Rotation + Vision + One-Shot)
│   │   └── storageService.js            # State & Persistence Engine
│   └── App.jsx                          # Developer JSON Sandbox
├── server.js                            # REST API Server (Localhost & Vercel Handler)
├── test_backend.js                      # Unit Test Suite (node --test)
└── vercel.json                          # Konfigurasi Routing Serverless Vercel
```

---

## 🔌 Daftar Endpoint REST API (`/api`)

| Kategori | Method | Endpoint | Deskripsi |
| :--- | :--- | :--- | :--- |
| **Auth & Profile** | `POST` | `/api/auth/google` | Login dengan Google OAuth (`credential` JWT / profil) |
| | `POST` | `/api/auth/logout` | Keluar dari akun (`isLoggedIn: false`) |
| | `GET` | `/api/profile` | Ambil profil user, tipe hunian (`house`/`apartment`), & jam pengingat (`08:00`) |
| | `PUT` | `/api/profile` | Update preferensi hunian & jam notifikasi pengingat harian |
| **Tanya AI & Scan** | `GET` | `/api/ai/topics` | Ambil 2 pilihan topik terpandu Tanya AI beserta bahan terkait |
| | `POST` | `/api/ai/scan` | Gemini Vision: Scan foto struk/makanan (pisahkan `foodItems` vs `ignoredItems`) |
| | `POST` | `/api/ai/rescue-recipe` | Tanya AI (One-Shot): Resep kilat dari bahan hampir basi + auto-save riwayat |
| | `POST` | `/api/ai/compost-guide` | Tanya AI (One-Shot): Panduan olah bahan basi jadi kompos sesuai hunian |
| | `GET` | `/api/ai/history` | Ambil daftar riwayat chat AI (`HARI INI` & `KEMARIN`) |
| | `GET` | `/api/ai/history/:id` | Ambil detail 1 percakapan riwayat chat AI |
| **Kulkas & Stok** | `GET` | `/api/foods` | Ambil stok kulkas + reward impact (`rescuedFoodKg`, `compostedFoodKg`, `co2ePreventedKg`) |
| | `POST` | `/api/foods` | Catat stok manual (**Bahan Mentah** `stockType: "raw"` / **Masakan Sisa** `stockType: "leftover"`) |
| | `POST` | `/api/foods/bulk` | Simpan bahan terpilih hasil AI Scan ke kulkas |
| | `PATCH` | `/api/foods/:id/cook` | Tandai masakan selesai & dihabiskan (menambah reward impact) |
| | `PATCH` | `/api/foods/:id/spoil` | Tandai bahan basi / alihkan ke kompos |
| **Siklus Kompos** | `GET` | `/api/compost/batches` | Ambil daftar batch kompos aktif (`filling` & `curing`) dan riwayat panen |
| | `POST` | `/api/compost/add-item` | Simpan bahan basi ke wadah kompos aktif atau buat wadah baru |
| | `POST` | `/api/compost/:id/lock` | Kunci wadah & mulai fase pematangan 14 hari |
| | `POST` | `/api/compost/:id/simulate` | Simulasi Demo: Lompat 14 hari pematangan hingga siap panen (`ready`) |
| | `POST` | `/api/compost/:id/harvest` | Catat hasil panen pupuk kompos (`weightKg` + panduan cara pakai) |
| | `GET` | `/api/compost/harvests/:id` | Lihat detail riwayat panen kompos |
| **Notifikasi** | `GET` | `/api/notifications` | Ambil daftar notifikasi pengingat harian (`unreadCount`) |
| | `PATCH` | `/api/notifications/read-all` | Tandai semua notifikasi sudah dibaca |
| **Demo Utility** | `POST` | `/api/reset` | Reset seluruh data kembali ke kondisi awal demo |

---

## 💻 Cara Menjalankan & Menguji di Localhost

```bash
# 1. Install dependensi
npm install

# 2. Salin konfigurasi environment (.env)
cp .env.example .env

# 3. Jalankan REST API Server (untuk Postman / Frontend)
npm run api

# 4. Jalankan Developer JSON Sandbox (opsional)
npm run dev

# 5. Jalankan Unit Test Offline
npm test
```

* **Koleksi Postman:** Import file [`postman/EatWise_Postman_Collection.json`](./postman/EatWise_Postman_Collection.json) ke Postman lalu jalankan **Collection Runner**.
