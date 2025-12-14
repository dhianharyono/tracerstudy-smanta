# Panduan Setup Tracer Study Dashboard

## Prasyarat

1. **Node.js** (v16 atau lebih baru)
2. **MongoDB** (terinstall dan berjalan)
3. **npm** atau **yarn**

## Langkah-langkah Setup

### 1. Install Dependencies

Jalankan perintah berikut di root project:

```bash
npm run install:all
```

Ini akan menginstall dependencies untuk:
- Root project
- Backend
- Frontend

### 2. Setup Environment Variables

Buat file `.env` di folder `backend/` dengan konten berikut:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/tracer-study
JWT_SECRET=your-secret-key-change-this-in-production-minimum-32-characters
NODE_ENV=development
```

**Penting**: Ganti `JWT_SECRET` dengan string acak yang aman (minimal 32 karakter) untuk production.

### 3. Pastikan MongoDB Berjalan

Pastikan MongoDB service sudah berjalan di sistem Anda. Jika menggunakan MongoDB lokal:

```bash
# Windows (jika MongoDB diinstall sebagai service, biasanya sudah otomatis)
# Atau jalankan:
mongod

# Linux/Mac
sudo systemctl start mongod
# atau
mongod
```

### 4. Jalankan Aplikasi

#### Opsi 1: Jalankan Bersama (Recommended)

```bash
npm run dev
```

Ini akan menjalankan backend dan frontend secara bersamaan.

#### Opsi 2: Jalankan Terpisah

**Terminal 1 - Backend:**
```bash
npm run dev:backend
```

**Terminal 2 - Frontend:**
```bash
npm run dev:frontend
```

### 5. Akses Aplikasi

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **Health Check**: http://localhost:5000/api/health

## Membuat User Pertama

1. Buka http://localhost:3000/register
2. Daftar dengan role yang diinginkan:
   - **Alumni**: Untuk alumni yang akan mengisi kuesioner
   - **Student**: Untuk siswa yang ingin melihat data
   - **Admin**: Untuk administrator yang mengelola data

## Struktur Database

Aplikasi menggunakan MongoDB dengan collection `users` yang menyimpan:
- Data autentikasi (username, email, password)
- Role (alumni/admin/student)
- Profil alumni (jika role = alumni)
- Data kuesioner (profile, university, job, socialMedia)

## Troubleshooting

### MongoDB Connection Error

Jika mendapat error koneksi MongoDB:
1. Pastikan MongoDB service berjalan
2. Periksa `MONGODB_URI` di file `.env`
3. Pastikan port MongoDB (default: 27017) tidak digunakan aplikasi lain

### Port Already in Use

Jika port 5000 atau 3000 sudah digunakan:
1. Ubah `PORT` di `backend/.env` untuk backend
2. Ubah `server.port` di `frontend/vite.config.ts` untuk frontend

### CORS Error

Jika mendapat CORS error, pastikan:
1. Backend sudah berjalan di port 5000
2. Frontend proxy sudah dikonfigurasi dengan benar di `vite.config.ts`

## Build untuk Production

### Backend

```bash
cd backend
npm run build
npm start
```

### Frontend

```bash
cd frontend
npm run build
```

File build akan ada di folder `frontend/dist/`











