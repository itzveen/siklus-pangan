# Dokumentasi Proyek — EatWise (SiklusPangan)

Direktori `docs/` memuat dokumentasi teknis, spesifikasi desain UI/UX, serta koleksi pengujian API untuk aplikasi **EatWise (SiklusPangan)**.

## Daftar Isi Dokumentasi

1. **`postman_collection.json`**: Koleksi lengkap 19 endpoint REST API EatWise untuk pengujian melalui Postman (mencakup Auth, Pantry CRUD, AI Vision Scan, AI Rescue Recipe, AI Compost Guide, Compost Cycle, dan Notifications).
2. **Spesifikasi Desain & Alur Pengguna**:
   - **Platform Target**: Mobile Web App & Android APK (Viewport 390×844 / 402×874 px, *Responsive Mobile Frame*).
   - **Layar Utama**:
     1. *Splash Screen & Google OAuth 2.0 Login*
     2. *Smart Pantry Dashboard* (Filter kategori, kartu stok 🟢 Segar / 🟡 Kritis / 🔴 Basi, kalkulator dampak CO₂e)
     3. *AI Vision Scan Struk & Kulkas* (Otomatis memisahkan produk makanan vs non-makanan)
     4. *Rescue Resep AI* (Rekomendasi resep kilat untuk bahan kritis/masakan sisa)
     5. *Panduan Kompos & Smart Batch* (Rekomendasi pengolahan organik adaptif sesuai tipe hunian: Rumah Halaman vs Kos/Apartemen)
     6. *Siklus Kompos & Simulasi Pematangan 14 Hari*
     7. *Tanya AI & Riwayat Konsultasi Zero-Waste*
     8. *Pengaturan Profil, Preferensi Hunian, & Jam Pengingat Notifikasi Harian*
