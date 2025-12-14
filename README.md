# Tracer Study Dashboard - SMANTA Alumni

Dashboard untuk penelusuran alumni SMA Negeri 1 Tawangsari (SMANTA) menggunakan teknologi MERN Stack dengan TypeScript.

## Fitur

### Untuk Alumni

- Login dan Pendaftaran
- Pengisian Kuesioner/Survei (Informasi Personal, Perguruan Tinggi, Pekerjaan, Media Sosial)
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
- Pengelolaan News/Berita
- Analisis dan Pelaporan Data
- Laporan berdasarkan berbagai kategori
- Manajemen Kritik & Saran

### Untuk Siswa

- Login dan Pendaftaran
- Dashboard dengan ringkasan data
- Menu Perguruan Tinggi (filter berdasarkan jenis)
  - Klik item perguruan tinggi untuk melihat alumni berdasarkan perguruan tinggi yang dipilih
- Menu Jurusan dengan jumlah alumni
  - Klik item jurusan untuk melihat alumni berdasarkan jurusan yang dipilih
- Menu Alumni dengan data lengkap dan filter (Universitas, Tahun Lulus, Jurusan)
- News/Berita dengan detail
- Kritik & Saran

## Teknologi

- **Backend**: Node.js, Express, TypeScript, MongoDB, Mongoose
- **Frontend**: React, TypeScript, Vite, React Router
- **Authentication**: JWT (JSON Web Tokens)
- **Charts**: Recharts
- **Styling**: Tailwind CSS, Custom CSS dengan dark theme
- **Icons**: React Icons (Font Awesome)

## Fitur Tambahan

- **Custom Scrollbar**: Scrollbar yang disesuaikan dengan tema dark
- **Loading Overlay**: Loading transparan saat perpindahan halaman
- **Responsive Design**: Desain yang responsif untuk mobile, tablet, dan desktop
- **URL-based Filtering**: Filter alumni berdasarkan URL parameter untuk navigasi yang lebih mudah
- **Interactive UI**: Hover effects dan animasi yang smooth

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
│   │   ├── models/          # MongoDB models
│   │   ├── routes/          # API routes
│   │   ├── middleware/      # Auth middleware
│   │   └── server.ts        # Server entry point
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── contexts/        # React contexts (Auth)
│   │   ├── pages/           # Page components
│   │   └── App.tsx          # Main app component
│   └── package.json
└── package.json
```

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register user
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user

### Alumni

- `GET /api/alumni/profile` - Get profile
- `PUT /api/alumni/profile` - Update profile
- `POST /api/alumni/questionnaire` - Submit questionnaire

### Admin

- `GET /api/admin/dashboard` - Get dashboard statistics
- `GET /api/admin/alumni` - Get all alumni
- `GET /api/admin/alumni/:id` - Get single alumni
- `PUT /api/admin/alumni/:id` - Update alumni
- `DELETE /api/admin/alumni/:id` - Delete alumni
- `GET /api/admin/reports` - Generate reports

### Student

- `GET /api/student/dashboard` - Get dashboard statistics
- `GET /api/student/universities` - Get universities
- `GET /api/student/majors` - Get majors
- `GET /api/student/alumni` - Get alumni list

## License

ISC
