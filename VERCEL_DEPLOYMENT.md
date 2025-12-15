# Panduan Deployment ke Vercel

Dokumen ini berisi langkah-langkah untuk melakukan deployment aplikasi Tracer Study ke Vercel.

## Prerequisites

1. Akun GitHub/GitLab/Bitbucket (untuk repository)
2. Akun Vercel (gratis di [vercel.com](https://vercel.com))
3. MongoDB Atlas account (untuk database cloud) atau MongoDB lokal
4. Node.js terinstall di local machine

## Persiapan

### 1. Setup MongoDB Atlas (Jika belum punya)

1. Daftar di [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Buat cluster baru (gratis tier tersedia)
3. Buat database user
4. Whitelist IP address (atau gunakan `0.0.0.0/0` untuk development)
5. Ambil connection string (format: `mongodb+srv://username:password@cluster.mongodb.net/dbname`)

### 2. Persiapan Repository

Pastikan semua perubahan sudah di-commit dan di-push ke repository:

```bash
git add .
git commit -m "Prepare for deployment"
git push origin main
```

## Deployment Backend ke Vercel

### Langkah 1: Install Vercel CLI (Opsional)

```bash
npm install -g vercel
```

### Langkah 2: Setup Backend Project

1. Masuk ke folder `backend`:

   ```bash
   cd backend
   ```

2. Login ke Vercel:

   ```bash
   vercel login
   ```

3. Inisialisasi project:
   ```bash
   vercel
   ```
   - Pilih scope (personal atau team)
   - Link ke existing project atau buat baru
   - Pilih framework: **Other**
   - Root directory: `backend` (jika deploy dari root) atau `.` (jika dari folder backend)
   - Build command: `npm run build` atau `npm install && npm run build`
   - Output directory: `dist` atau biarkan kosong
   - Install command: `npm install`

### Langkah 3: Konfigurasi Environment Variables

1. Buka dashboard Vercel: [vercel.com/dashboard](https://vercel.com/dashboard)
2. Pilih project backend Anda
3. Masuk ke **Settings** > **Environment Variables**
4. Tambahkan variabel berikut:

   ```
   PORT=5000
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/tracer-study
   JWT_SECRET=your-very-secure-secret-key-here
   NODE_ENV=production
   ```

   **Catatan**: Ganti dengan nilai yang sesuai:

   - `MONGODB_URI`: Connection string dari MongoDB Atlas
   - `JWT_SECRET`: String acak yang kuat (gunakan generator atau `openssl rand -base64 32`)

5. Pilih environment: **Production**, **Preview**, dan **Development**
6. Klik **Save**

### Langkah 4: Buat vercel.json untuk Backend

Buat file `vercel.json` di root project (atau di folder backend jika deploy terpisah):

```json
{
  "version": 2,
  "builds": [
    {
      "src": "backend/src/server.ts",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "backend/src/server.ts"
    }
  ],
  "env": {
    "NODE_ENV": "production"
  }
}
```

**Alternatif**: Jika backend di folder terpisah, buat `backend/vercel.json`:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "src/server.ts",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "src/server.ts"
    }
  ]
}
```

### Langkah 5: Update Backend untuk Vercel

Pastikan `backend/src/server.ts` menangani Vercel serverless functions:

```typescript
// Di akhir file server.ts, tambahkan:
export default app; // Untuk Vercel
```

Atau jika menggunakan Express:

```typescript
// server.ts
import express from 'express';
// ... kode lainnya

const app = express();
// ... konfigurasi app

// Export untuk Vercel
export default app;

// Untuk development lokal
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}
```

### Langkah 6: Deploy Backend

```bash
vercel --prod
```

Atau push ke repository yang terhubung dengan Vercel (auto-deploy).

## Deployment Frontend ke Vercel

### Langkah 1: Setup Frontend Project

1. Masuk ke folder `frontend`:

   ```bash
   cd frontend
   ```

2. Inisialisasi project di Vercel:
   ```bash
   vercel
   ```
   - Framework: **Vite**
   - Root directory: `frontend` atau `.`
   - Build command: `npm run build`
   - Output directory: `dist`
   - Install command: `npm install`

### Langkah 2: Konfigurasi Environment Variables untuk Frontend

Jika frontend perlu API URL, tambahkan di Vercel:

```
VITE_API_URL=https://your-backend-url.vercel.app
```

### Langkah 3: Update Frontend API Configuration

Pastikan `frontend/src` menggunakan environment variable untuk API URL:

```typescript
// utils/api.ts atau axios config
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
axios.defaults.baseURL = API_URL;
```

### Langkah 4: Buat vercel.json untuk Frontend (Opsional)

Buat `frontend/vercel.json`:

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "framework": "vite",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

### Langkah 5: Deploy Frontend

```bash
vercel --prod
```

## Deployment Monorepo (Backend + Frontend Bersama)

Jika ingin deploy sebagai satu project:

### 1. Buat vercel.json di Root

```json
{
  "version": 2,
  "builds": [
    {
      "src": "backend/src/server.ts",
      "use": "@vercel/node"
    },
    {
      "src": "frontend/package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "dist"
      }
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "backend/src/server.ts"
    },
    {
      "src": "/(.*)",
      "dest": "frontend/$1"
    }
  ]
}
```

### 2. Update package.json di Root

```json
{
  "scripts": {
    "build": "cd frontend && npm install && npm run build",
    "build:backend": "cd backend && npm install && npm run build"
  }
}
```

## Setup CORS

Pastikan backend mengizinkan request dari frontend domain:

```typescript
// backend/src/server.ts
import cors from 'cors';

const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5173',
  'https://your-frontend-domain.vercel.app',
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  })
);
```

## Troubleshooting

### Error: Module not found

- Pastikan semua dependencies terinstall
- Cek `package.json` dan pastikan semua package ada

### Error: Cannot connect to MongoDB

- Cek MongoDB Atlas connection string
- Pastikan IP whitelist sudah benar
- Pastikan environment variable `MONGODB_URI` sudah di-set

### Error: CORS

- Tambahkan frontend URL ke allowed origins di backend
- Pastikan credentials di-set dengan benar

### Build Fails

- Cek build logs di Vercel dashboard
- Pastikan Node.js version sesuai (set di `package.json` dengan `engines`)
- Pastikan semua environment variables sudah di-set

### API Routes Not Working

- Pastikan routing di `vercel.json` sudah benar
- Cek bahwa backend export default app
- Pastikan path `/api/*` diarahkan ke backend

## Tips

1. **Gunakan Preview Deployments**: Vercel otomatis membuat preview untuk setiap PR
2. **Environment Variables**: Pisahkan untuk Production, Preview, dan Development
3. **Monitoring**: Gunakan Vercel Analytics untuk monitoring
4. **Custom Domain**: Tambahkan custom domain di Settings > Domains
5. **Logs**: Cek logs di Vercel dashboard untuk debugging

## Post-Deployment

1. Test semua fitur di production
2. Update dokumentasi dengan URL production
3. Setup monitoring dan alerts
4. Backup database secara berkala
5. Update security headers jika diperlukan

## Referensi

- [Vercel Documentation](https://vercel.com/docs)
- [Vercel Node.js Guide](https://vercel.com/docs/concepts/functions/serverless-functions/runtimes/node-js)
- [MongoDB Atlas Setup](https://docs.atlas.mongodb.com/getting-started/)



