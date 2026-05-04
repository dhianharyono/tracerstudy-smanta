# Tracer Study Dashboard - SMANTA Alumni

Dashboard untuk penelusuran alumni SMA Negeri 1 Tawangsari (SMANTA) menggunakan teknologi MERN Stack dengan TypeScript.

## Fitur

### Untuk Alumni

- Login dan Pendaftaran
- Pengisian Kuesioner/Survei (Informasi Personal, Perguruan Tinggi, Pekerjaan, Media Sosial)
- Pencarian Perguruan Tinggi & Jurusan secara Dinamis
- Pengelolaan Profil
- Dashboard dengan statistik
- News/Berita dengan detail
- Kritik & Saran

### Untuk Administrator

- Dashboard Administrasi dengan statistik lengkap
  - Total Alumni dan Total Student yang terdaftar
  - Statistik alumni bekerja dan kuliah
  - Statistik berdasarkan jenis perguruan tinggi (PTN, PTS, Kedinasan)
  - Grafik statistik jurusan dan tahun lulus
- Pengelolaan Data Alumni, Student, dan Admin
- **Master Data Management**: Verifikasi Perguruan Tinggi dan Jurusan baru yang diinput alumni
- Pengelolaan News/Berita
- Analisis dan Pelaporan Data
- Laporan berdasarkan berbagai kategori
- Manajemen Kritik & Saran

### Fitur Sistem Dinamis (New)

- **Dynamic Master Data**: Daftar Perguruan Tinggi dan Jurusan tidak lagi statis, melainkan dikelola melalui database.
- **Auto-Sync**: Sistem secara otomatis memindai data alumni yang sudah ada dan memasukkan kampus/jurusan baru ke Master List.
- **User-Driven Growth**: Alumni dapat menginput nama kampus atau jurusan baru yang belum ada di daftar, dan sistem akan otomatis mendaftarkannya (unverified) untuk admin review.
- **Idempotent Maintenance**: Server secara otomatis membersihkan duplikasi dan melakukan sinkronisasi data setiap kali dijalankan.

## Teknologi

- **Backend**: Node.js, Express, TypeScript, MongoDB (Mongoose)
- **Frontend**: React, TypeScript, Vite, React Router, Axios
- **Authentication**: JWT (JSON Web Tokens)
- **Charts**: Recharts
- **Styling**: Tailwind CSS, Custom CSS dengan dark theme & glassmorphism
- **Icons**: React Icons (Font Awesome, Lucide)
- **Development**: Husky & lint-staged (Pre-commit checks)

## Script Utama

Di root direktori, Anda dapat menjalankan:

- `npm run dev`: Menjalankan frontend dan backend secara bersamaan.
- `npm run install:all`: Menginstall semua dependensi (root, frontend, backend).
- **`npm run lint`**: Mengecek kualitas kode (ESLint) di seluruh proyek.
- `npm run lint:frontend`: Hanya cek linting di frontend.
- `npm run lint:backend`: Hanya cek linting di backend.

## Instalasi

1. Clone repository ini
2. Install dependencies untuk semua bagian:

   ```bash
   npm run install:all
   ```

3. Setup environment variables:

   - Copy `backend/.env.example` ke `backend/.env`
   - Edit `backend/.env` dan sesuaikan konfigurasi:
     ```
     PORT=5000
     MONGODB_URI=mongodb://localhost:27017/tracer-study
     JWT_SECRET=your-secret-key-change-this-in-production
     NODE_ENV=development
     ```

4. Pastikan MongoDB sudah berjalan

5. Jalankan aplikasi:

   ```bash
   npm run dev
   ```

   Atau jalankan secara terpisah:

   - Backend: `npm run dev:backend` (port 5000)
   - Frontend: `npm run dev:frontend` (port 3000)

## Struktur Project

```
tracer-study/
├── backend/
│   ├── src/
│   │   ├── models/          # Mongoose Models (User, University, Major, etc.)
│   │   ├── routes/          # Express Routes
│   │   ├── middleware/      # Auth & Error Middleware
│   │   ├── utils/           # Sync & Maintenance Utilities
│   │   └── server.ts        # Entry point
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/      # UI & Feature Components
│   │   ├── contexts/        # Auth Context
│   │   ├── pages/           # Page Layouts
│   │   └── hooks/           # Custom API Hooks
│   └── package.json
└── package.json
```

## API Endpoints

### Master Data
- `GET /api/universities` - Ambil semua perguruan tinggi
- `GET /api/majors` - Ambil semua jurusan
- `GET /api/universities/search?q=...` - Cari perguruan tinggi
- `POST /api/universities` - Tambah perguruan tinggi (Auth)
- `POST /api/majors` - Tambah jurusan (Auth)

### Authentication
- `POST /api/auth/register` - Register user
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user

### Alumni
- `GET /api/alumni/profile` - Get profile
- `PUT /api/alumni/profile` - Update profile & auto-sync data
- `POST /api/alumni/questionnaire` - Submit kuesioner & auto-sync data
- `PUT /api/alumni/questionnaire` - Update kuesioner & auto-sync data

### Admin
- `GET /api/admin/dashboard` - Statistik dashboard
- `GET /api/admin/alumni` - Daftar alumni
- `PUT /api/admin/alumni/:id` - Update alumni data
- `DELETE /api/admin/alumni/:id` - Hapus alumni
- `GET /api/admin/reports` - Laporan tracer study

## License

ISC
