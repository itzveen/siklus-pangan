# 🌱 SiklusPangan

> **Closed-Loop Food Management & Smart Upcycling AI**  
> *Solusi Digital Sirkular untuk Mengakhiri Food Waste Rumah Tangga dari Dapur hingga Kompos.*

[![LOGICODIX 2026](https://img.shields.io/badge/LOGICODIX%202026-Hackathon%20Project-16a34a?style=for-the-badge)](https://logicodix.com)
[![React](https://img.shields.io/badge/React-18.3.1-61dafb?style=for-the-badge&logo=react)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-5.4.11-646cff?style=for-the-badge&logo=vite)](https://vitejs.dev)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4.17-38bdf8?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com)
[![Google Gemini API](https://img.shields.io/badge/Google_Gemini-1.5_Flash-4285f4?style=for-the-badge&logo=google)](https://aistudio.google.com)

---

## 📌 Latar Belakang & Permasalahan

Di Indonesia, sampah makanan mencapai **23–48 juta ton per tahun**, dengan kontributor terbesar berasal dari konsumsi rumah tangga. 
Masalah umum yang terjadi:
1. **Pencatatan Manual Melelahkan:** Pengguna malas mencatat belanjaan satu per satu dari struk minimarket yang bercampur dengan barang non-makanan.
2. **Bahan Makanan Terlupakan:** Makanan terselip di sudut kulkas hingga melewati batas simpan.
3. **Kebuntuan Solusi Konvensional (*Dead End*):** Aplikasi pengingat masa simpan konvensional hanya menyarankan pengguna membuang makanan yang sudah basi ke tempat sampah, yang kemudian membusuk di TPA dan melepaskan **gas metana ($CH_4$)** beracun pemicu pemanasan global.

---

## 💡 Solusi: The Circular Closed-Loop System

**SiklusPangan** menutup siklus konsumsi pangan rumah tangga secara menyeluruh:
```
[ 1. Input Multimodal AI ] ──> Deteksi foto kulkas & struk belanjaan (filter non-makanan)
         │
         ▼
[ 2. Monitoring Stok ]     ──> Indikator warna: 🟢 Segar, 🟡 Kritis, 🔴 Rusak/Basi
         │
         ├── [Jika Kuning] ──> AI Rescue Recipe: Resep kilat 10 menit penyelamat
         │
         └── [Jika Merah]  ──> AI Closed-Loop Upcycling: Panduan kompos & eco-enzyme
                                 (Sistem Batch Cerdas: Fase Pengisian vs Pematangan)
```

---

## 🚀 Fitur Unggulan

1. **Smart Receipt & Pantry Scanner (Gemini Multimodal Vision):**
   * Membaca foto struk belanjaan dan otomatis **memisahkan bahan makanan vs barang non-makanan** (sabun, tisu, deterjen).
2. **Pantry Lifecycle Tracking:**
   * Kartu bahan interaktif dengan indikator visual masa simpan (Hijau, Kuning, Merah).
3. **AI Rescue Chef:**
   * Menghasilkan resep praktis dari kombinasi bahan yang hampir kadaluwarsa.
4. **Smart Composting & Upcycling Engine:**
   * Rekomendasi metode kompos adaptif sesuai jenis bahan (misal: penanganan tahu basi berprotein tinggi vs kulit buah eco-enzyme).
   * **Smart Batch Toggle:** Mendukung penambahan sampah harian ke wadah yang masih terbuka (*Fase Pengisian*) atau pembuatan batch baru jika wadah lama sudah dikunci (*Fase Pematangan*).
5. **Interactive Developer / Demo Simulator:**
   * Tombol `[⏩ Lompat 14 Hari]` untuk simulasi percepatan waktu pematangan kompos saat pengujian dewan juri.
6. **Green Impact Counter:**
   * Metrik real-time total kilogram makanan terselamatkan dan estimasi emisi gas metana/karbon ($Kg CO_2e$) yang berhasil dicegah.

---

## 🛠️ Arsitektur Teknologi

* **Frontend:** React 18, Vite, Tailwind CSS, Lucide Icons.
* **AI Engine:** Google Gemini 1.5 Flash API via `@google/generative-ai`.
* **State & Persistence:** LocalStorage & IndexedDB (Zero-server, privacy-first, offline-ready).
* **Autentikasi:** Google Identity Services (OAuth 2.0).

---

## 💻 Panduan Instalasi & Menjalankan di Localhost

Pastikan Anda telah menginstal **Node.js (v18 ke atas)** dan **npm**.

### 1. Clone Repositori
```bash
git clone https://github.com/USERNAME/siklus-pangan.git
cd siklus-pangan
```

### 2. Instalasi Dependensi
```bash
npm install
```

### 3. Konfigurasi Environment Variable
Salin file `.env.example` menjadi `.env`:
```bash
cp .env.example .env
```
Buka file `.env` dan masukkan API Key Gemini Anda:
```env
VITE_GEMINI_API_KEY=AIzaSy...
```
*(Dapatkan API Key gratis di [Google AI Studio](https://aistudio.google.com/)).*

### 4. Jalankan Aplikasi di Localhost
```bash
npm run dev
```
Buka browser Anda di `http://localhost:5173`.

---

## 🌿 Etika AI & Green IT (Sustainability Principles)

* **Efisiensi Komputasi:** Menggunakan model *Gemini 1.5 Flash* berbobot ringan (*low-latency, low token footprint*) tanpa membutuhkan infrastruktur GPU lokal yang boros daya listrik.
* **Privasi Data (Privacy-First):** Seluruh data inventaris dapur tersimpan di perangkat lokal pengguna (*client-side*).
* **Food Safety Ethics:** Dilengkapi peringatan standar keamanan pangan; makanan berlendir atau berjamur dilarang dikonsumsi dan wajib dialihkan ke pengolahan pupuk organik secara higienis.

---

## 👥 Tim Pengembang (Logicodix 2026)

* **Lead & UI/UX Designer:** [Nama Anggota 1]
* **Frontend Logic Engineer:** [Nama Anggota 2]
* **AI & Integration Engineer:** [Nama Anggota 3]
* **QA & Documentation Lead:** [Nama Anggota 4]

---
*Dibuat untuk LOGICODIX 2026 Hackathon Competition.*
