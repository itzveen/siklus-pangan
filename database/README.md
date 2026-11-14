# Database & Storage Layer — EatWise (SiklusPangan)

Direktori ini menyimpan definisi skema database, migrasi, serta data awal (*seed*) untuk aplikasi **EatWise (SiklusPangan)**.

## Struktur Direktori

```text
database/
├── migrations/
│   └── 001_initial_schema.sql   # Inisialisasi tabel dan state awal
├── seeds/
│   ├── dummyData.js             # Seed data JavaScript untuk REST API & pengujian
│   └── seed.sql                 # Seed data SQL deterministik untuk simulasi
├── schema.sql                   # Skema relasional utama (Users, Foods, Compost, AI History)
└── README.md                    # Dokumentasi database
```

## Arsitektur Penyimpanan Hybrid (Local-First + Serverless Ready)

EatWise menerapkan pendekatan **Hybrid Storage Architecture** (`backend/services/storageService.js` + `backend/models/dbModel.js`):
1. **Local-First Persistence (`localStorage`):** Menjaga privasi pengguna dengan menyimpan stok kulkas, riwayat panen kompos, dan preferensi hunian langsung di perangkat pengguna secara instan dan *offline-capable* (tahan terhadap *cold-start* fungsi serverless).
2. **In-Memory REST Store & Seed Data (`database/seeds/dummyData.js`):** Menyediakan state terstruktur untuk endpoint REST API (`/api/*`) dan pengujian otomatis (`npm test`).
