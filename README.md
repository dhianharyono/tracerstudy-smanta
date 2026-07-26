# Tracer Study Dashboard - SMANTA

Aplikasi web **Tracer Study** untuk alumni SMA Negeri 1 Tawangsari (SMANTA) berbasis **MERN Stack** (MongoDB, Express, React, Node.js) dengan **TypeScript**. Aplikasi ini digunakan untuk pendataan alumni, pengisian survei/kuesioner lulusan, pemetaan perguruan tinggi & karir, serta analitik dan pelaporan data bagi pihak sekolah/administrator.

---

## Teknologi yang Digunakan

- **Backend**: Node.js, Express.js, TypeScript, MongoDB (Mongoose ORM)
- **Frontend**: React.js, TypeScript, Vite, React Router, Axios
- **Styling & UI**: Tailwind CSS, React Icons, Recharts (Visualisasi Data)
- **Autentikasi**: JWT (JSON Web Tokens), bcryptjs
- **Code Quality**: ESLint, Prettier, Husky, lint-staged

---

## Prasyarat

Sebelum memulai instalasi, pastikan perangkat Anda telah terpasang:

- **Node.js**: versi 18.x atau lebih baru
- **npm**: versi 9.x atau lebih baru
- **MongoDB**: versi 6.0 atau lebih baru (Lokal atau MongoDB Atlas)

---

## Panduan Instalasi & Setup

### 1. Clone Repository

```bash
git clone https://github.com/username/tracer-study-smanta.git
cd tracer-study-smanta
```

### 2. Install Dependencies

Jalankan perintah berikut pada root direktori proyek untuk mengunduh seluruh dependensi (root, backend, dan frontend):

```bash
npm run install:all
```

---

## Menjalankan Aplikasi

### Mode Pengembangan (Development)

Jalankan backend dan frontend secara simultan dengan satu perintah:

```bash
npm run dev
```

Aplikasi dapat diakses melalui browser di:

- **Frontend**: `http://localhost:3000` (atau port yang diberikan oleh Vite)
- **Backend API**: `http://localhost:5000`

Jika ingin menjalankan server backend atau frontend saja secara terpisah:

- **Backend saja**: `npm run dev:backend`
- **Frontend saja**: `npm run dev:frontend`

### Pengecekan Kode (Linting)

```bash
# Mengecek linting seluruh proyek
npm run lint

# Mengecek linting frontend / backend saja
npm run lint:frontend
npm run lint:backend
```

### Production Build

1. **Build & Start Backend**:

   ```bash
   cd backend
   npm run build
   npm start
   ```

2. **Build Frontend**:
   ```bash
   cd frontend
   npm run build
   ```
   File hasil build frontend akan tersimpan di direktori `frontend/dist/`.

---

## Struktur Proyek

```
tracer-study-smanta/
├── backend/
│   ├── src/
│   │   ├── config/          # Konfigurasi aplikasi & database
│   │   ├── controllers/     # Controller penangan bisnis logika
│   │   ├── middleware/      # Middleware autentikasi & validasi
│   │   ├── models/          # Schema MongoDB / Mongoose
│   │   ├── routes/          # Definisi rute API
│   │   ├── utils/           # Helper, sinkronisasi & deteksi duplikasi
│   │   └── server.ts        # Entry point backend Express
│   ├── .env.example         # Template variabel lingkungan backend
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── src/
│   │   ├── assets/          # Asset gambar & ikon
│   │   ├── components/      # Komponen UI reusable
│   │   ├── contexts/        # State global / Context API
│   │   ├── hooks/           # Custom React hooks
│   │   ├── pages/           # Komponen halaman utama
│   │   ├── services/        # Klien HTTP / API call
│   │   └── App.tsx          # Komponen utama aplikasi & router
│   ├── package.json
│   └── vite.config.ts
├── .gitignore
├── package.json             # Root package & script otomatisasi
└── README.md
```

---

## Lisensi

Proyek ini menggunakan lisensi [ISC](LICENSE).
