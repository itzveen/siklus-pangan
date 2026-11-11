# SiklusPangan (EatWise)

Backend dan layanan AI untuk aplikasi manajemen stok bahan makanan dan pengolahan kompos rumah tangga.

## Struktur Folder

- `api/` - Serverless entrypoint untuk deployment Vercel
- `src/services/` - Modul logic penyimpanan data dan integrasi Gemini API
- `Postman/` - Koleksi endpoint untuk pengujian di Postman
- `server.js` - REST API server

## Menjalankan Secara Lokal

1. Install dependencies:
   ```bash
   npm install
   ```

2. Buat file `.env` berdasarkan `.env.example` lalu isi kredensial:
   ```env
   GEMINI_API_KEY=
   VITE_GOOGLE_CLIENT_ID=
   ```

3. Jalankan REST API server:
   ```bash
   npm run api
   ```

4. Jalankan unit test:
   ```bash
   npm test
   ```
