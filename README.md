# SiklusPangan (EatWise)

Aplikasi manajemen stok bahan makanan dan pengolahan kompos rumah tangga berbasis AI.

## Struktur Folder

```text
siklus-pangan/
├── api/                    # Serverless entrypoint untuk deployment Vercel
│   └── index.js
├── backend/                # REST API, AI Gemini, & penyimpanan data
│   ├── data/
│   │   └── dummyData.js
│   ├── services/
│   │   ├── geminiService.js
│   │   └── storageService.js
│   ├── tests/
│   │   └── backend.test.js
│   └── server.js
├── frontend/               # UI React + Tailwind (Feature-Based Architecture)
│   ├── assets/             # Aset gambar & ikon Figma
│   ├── config/             # API & Storage Bridge (api.js)
│   ├── features/
│   │   ├── ai-assistant/   # AskAiPage, AiHistoryPage, RescueRecipeModal
│   │   ├── auth/           # SplashScreen, LoginScreen, LogoutDialog
│   │   ├── compost/        # CompostCyclePage, CompostGuideModal
│   │   ├── pantry/         # PantryDashboardPage, NotificationPage, AiScanModal, ManualStockModal
│   │   └── settings/       # SettingsPage
│   ├── shared/
│   │   └── components/     # TopHeader, BottomNavBar, EatWiseLogo
│   ├── App.jsx
│   ├── index.css
│   └── main.jsx
├── Postman/
│   └── postman_collection.json
├── index.html
├── package.json
└── vercel.json
```

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

3. Jalankan Frontend & Backend API:
   ```bash
   npm run dev
   npm run api
   ```

4. Jalankan unit test:
   ```bash
   npm test
   ```
