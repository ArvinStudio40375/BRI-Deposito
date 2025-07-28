# Panduan Deployment Gratis untuk Deposit BRI

Aplikasi banking simulation ini bisa di-deploy gratis di beberapa platform. Berikut pilihan terbaik untuk Anda:

## 🏆 Platform Rekomendasi (Gratis)

### 1. Railway (Paling Mudah)
**Kredit gratis $5/bulan - cukup untuk aplikasi kecil**

#### Langkah-langkah:
1. Daftar di [railway.app](https://railway.app)
2. Connect dengan GitHub Anda
3. Klik "Deploy from GitHub"
4. Pilih repository aplikasi ini
5. Railway akan otomatis detect Node.js dan deploy
6. Tambahkan PostgreSQL database dari dashboard Railway
7. Set environment variable `DATABASE_URL` dengan connection string dari database

#### Kelebihan:
- ✅ Gratis $5/bulan (cukup untuk 1-2 app kecil)
- ✅ Database PostgreSQL gratis
- ✅ Auto-deploy dari Git
- ✅ Zero configuration

### 2. Render (Paling Stabil)
**Static site gratis, web service perlu tidur setelah 15 menit**

#### Langkah-langkah:
1. Daftar di [render.com](https://render.com)
2. Klik "New" → "Web Service"
3. Connect GitHub dan pilih repo
4. Atur:
   - Build Command: `npm run build`
   - Start Command: `npm run start`
5. Tambahkan PostgreSQL database gratis
6. Set environment variables

#### Kelebihan:
- ✅ Static hosting gratis unlimited
- ✅ Database PostgreSQL gratis
- ✅ Reliable uptime
- ⚠️ Web service tidur setelah 15 menit idle

### 3. Koyeb (Serverless)
**1 web service + 1 database gratis**

#### Langkah-langkah:
1. Daftar di [koyeb.com](https://www.koyeb.com)
2. Create new app dari GitHub
3. Pilih repository
4. Koyeb auto-detect Node.js settings
5. Deploy!

#### Kelebihan:
- ✅ 1 service gratis permanent
- ✅ Global edge network
- ✅ Auto-scaling
- ✅ No credit card required

## 🛠️ Persiapan Sebelum Deploy

### 1. Setup Database Gratis
Aplikasi ini butuh PostgreSQL. Pilihan database gratis:

- **Neon** (15GB gratis): [neon.tech](https://neon.tech)
- **Supabase** (500MB gratis): [supabase.com](https://supabase.com)
- **ElephantSQL** (20MB gratis): [elephantsql.com](https://elephantsql.com)

### 2. Environment Variables yang Dibutuhkan
```
DATABASE_URL=postgresql://username:password@host:port/database
NODE_ENV=production
```

### 3. Build Commands
- **Build**: `npm run build`
- **Start**: `npm run start`

## 🚀 Quick Deploy Links

Klik untuk deploy langsung:

- **Railway**: [![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/new/template)
- **Render**: [Deploy ke Render](https://render.com/deploy)
- **Netlify**: [![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy)

## 💡 Tips Deployment

1. **Push ke GitHub dulu** - Semua platform butuh repository GitHub
2. **Set DATABASE_URL** - Jangan lupa environment variable ini
3. **Check build logs** - Kalau gagal, baca error message di build logs
4. **Test login** - Setelah deploy, test login dengan:
   - Username: `Siti Aminah`
   - PIN: `112233`

## 🆘 Troubleshooting

**Masalah umum:**
- **Build failed**: Cek Node.js version di package.json
- **Database connection error**: Pastikan DATABASE_URL benar
- **Page not found**: Pastikan routing setup dengan benar

**Need help?** Aplikasi sudah include semua konfigurasi yang dibutuhkan!

## 🎯 Rekomendasi

**Untuk pemula**: Mulai dengan **Railway** - paling mudah dan reliable.
**Untuk production**: **Render** - lebih stabil untuk jangka panjang.
**Untuk coba-coba**: **Koyeb** - paling simple, no credit card.

Semua platform di atas gratis dan cukup untuk aplikasi banking simulasi Anda! 🎉