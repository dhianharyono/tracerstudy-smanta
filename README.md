# Tracer Study Dashboard - SMANTA

Aplikasi web **Tracer Study** untuk alumni dan siswa SMA Negeri 1 Tawangsari (SMANTA) berbasis **MERN Stack** (MongoDB, Express, React, Node.js) dengan **TypeScript**. Aplikasi ini digunakan untuk pendataan alumni, pengisian survei/kuesioner lulusan, perencanaan studi lanjut siswa, pemetaan perguruan tinggi & karir, analitik Smart Match berbasis data alumni, serta pelaporan bagi pihak sekolah/administrator.

## Teknologi yang Digunakan

- **Backend**: Node.js, Express.js, TypeScript, MongoDB (Mongoose ORM)
- **Frontend**: React.js, TypeScript, Vite, React Router DOM, Axios
- **Styling & UI**: Tailwind CSS, React Icons (`react-icons/fa`), Recharts (Visualisasi Data & Grafik)
- **Autentikasi**: JWT (JSON Web Tokens), bcryptjs
- **Code Quality**: ESLint, Prettier, Husky, lint-staged

---

## Prasyarat System

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

### Pengecekan Kode & Quality Control (Linting)

```bash
# Mengecek linting seluruh proyek (Frontend + Backend)
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

## 📄 Lisensi

Proyek ini menggunakan lisensi [ISC](LICENSE).
