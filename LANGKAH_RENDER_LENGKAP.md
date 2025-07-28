# 🚀 Langkah Lengkap Deploy ke Render.com

## Langkah 1: Login ke Render
1. Buka [render.com](https://render.com)
2. Klik **"Get Started for Free"**
3. Pilih **"GitHub"** untuk login
4. Authorize Render untuk akses GitHub Anda

## Langkah 2: Create Web Service
1. Setelah login, klik **"New +"** di dashboard
2. Pilih **"Web Service"**
3. Klik **"Connect a repository"**
4. Pilih repository aplikasi BRI Anda dari list
5. Klik **"Connect"**

## Langkah 3: Configure Service
Render akan auto-detect settings, tapi pastikan seperti ini:

**Basic Settings:**
- **Name**: `deposit-bri` (atau nama yang Anda mau)
- **Environment**: `Node`
- **Region**: `Oregon (US West)` (default)
- **Branch**: `main`

**Build & Deploy:**
- **Build Command**: `npm install; npm run build`
- **Start Command**: `npm run start`

## Langkah 4: Environment Variables (PENTING!)
1. Scroll ke bawah ke bagian **"Environment Variables"**
2. Klik **"Add Environment Variable"**
3. Tambahkan:
   ```
   Key: DATABASE_URL
   Value: postgresql://neondb_owner:npg_xzhp9BcYjiw8@ep-nameless-salad-a2ttl0km.eu-central-1.aws.neon.tech/neondb?sslmode=require
   ```
4. Klik **"Add Environment Variable"** lagi
5. Tambahkan:
   ```
   Key: NODE_ENV
   Value: production
   ```

## Langkah 5: Deploy!
1. Klik **"Create Web Service"** (button biru)
2. Render akan mulai build aplikasi
3. Tunggu 3-5 menit sampai selesai
4. Status akan berubah jadi **"Live"**

## Langkah 6: Test Aplikasi
1. Klik URL aplikasi yang muncul (misalnya: `https://deposit-bri-abc123.onrender.com`)
2. Test login dengan:
   - **Username**: `Siti Aminah`
   - **PIN**: `112233`
3. Test admin access dengan code: `011090`

## 🔧 Troubleshooting

**Jika build gagal:**
- Cek **"Logs"** tab untuk lihat error
- Pastikan `package.json` ada di root folder
- Pastikan `DATABASE_URL` sudah benar

**Jika aplikasi error:**
- Cek **"Logs"** tab untuk error runtime
- Pastikan database Neon masih aktif
- Pastikan environment variables benar

**Jika loading lama:**
- Normal untuk pertama kali (cold start)
- Tunggu 30-60 detik

## ✅ Setelah Deploy Berhasil

Anda akan dapat:
- **URL public** untuk akses aplikasi
- **Auto-deploy** setiap push ke GitHub
- **SSL certificate** gratis
- **Custom domain** (optional)

---

**Ready untuk mulai? Login ke render.com dan ikuti langkah di atas!** 

Jika ada masalah di langkah manapun, screenshot dan tanya saya.