# Mari Shop — E-Commerce Top-Up (Tubes Pengantar Basis Data, A1)

Neo-brutalism store: Node.js + Express + MySQL di backend, HTML + Alpine.js di frontend.

## Cara menjalankan

Prasyarat: **Node.js 18+** (sudah diuji dengan v22). MySQL **opsional** untuk demo cepat.

```bash
npm install        # wajib diulang sekali: ada dependensi baru (alpinejs)
npm run dev        # atau: npm start
```

Buka **http://localhost:3000**.

### Mode 1 — Tanpa MySQL (mock, paling cepat)
Tidak perlu apa-apa. Jika MySQL tidak terhubung, API otomatis memakai data contoh
(9 produk, semua kategori terisi). Tanda di terminal: `⚠️ [Database] Belum terhubung ke MySQL`.
Data pesanan di mode ini hilang saat server di-restart.

### Mode 2 — Dengan MySQL (data sungguhan)
1. Jalankan MySQL (XAMPP / Laragon / Docker).
2. Import `database/schema.sql` (phpMyAdmin → Import, atau `mysql -u root < database/schema.sql`).
   Jika database lama sudah ada, import ulang agar produk & varian baru ikut masuk (aman: memakai `ON DUPLICATE KEY`).
3. Salin `.env.example` menjadi `.env`, sesuaikan `DB_USER` / `DB_PASSWORD`.
4. Restart server. Terminal harus menampilkan `✅ [Database] Berhasil terhubung`.

## Halaman yang tersedia

| URL | Fungsi |
|---|---|
| `/` atau `/index.html` | Beranda: hero, katalog + filter + pencarian, cara order, FAQ |
| `/order.html?product=mobile-legends` | Checkout: akun → nominal → pembayaran → kontak |
| `/invoice.html?id=TRX-...` | Invoice: countdown, QR/VA, status live, kredensial |
| `/check-order.html` | Cek pesanan via No. Invoice atau WhatsApp/Email |
| `/admin/index.html` | Admin Produk & Varian (UI demo) |
| `/admin/credentials.html` | Admin stok akun/voucher (UI demo) |

## Alur demo presentasi (±2 menit)
1. Beranda → klik kategori **Game** → cari "genshin".
2. Buka **Mobile Legends** → isi ID `123456789` Zone `2001` → pilih nominal → QRIS → kontak `081234567890` → *Beli Sekarang*.
3. Di invoice: tunjukkan countdown & QR → klik **Simulasi Bayar** → status berubah otomatis.
4. Beli **Netflix** → bayar → kotak akun muncul + tombol salin.
5. **Cek Pesanan** → cari pakai nomor WhatsApp tadi.
6. Buka `/admin/` untuk tampilan CRUD.

> Tombol "Simulasi Bayar" bisa dimatikan dengan `DEMO_MODE = false` di `public/assets/js/invoice.js`.

## Struktur folder

```
public/
  index.html  order.html  invoice.html  check-order.html
  admin/index.html  admin/credentials.html
  assets/
    css/  tokens.css  brutal-components.css  layout.css  pages.css
    js/   main.js  copy-clipboard.js  home.js  order-flow.js  invoice.js  check-order.js  admin.js
    img/products/*.svg   (thumbnail lokal; fallback: placeholder.svg)
src/    server.js  routes/api.js  config/db.js
database/schema.sql
docs/HANDOFF_RIFQI.md   ← catatan untuk anggota tim berikutnya
```

## Endpoint API

| Method | Path | Keterangan |
|---|---|---|
| GET | `/api/categories` | Daftar kategori |
| GET | `/api/products` | Produk aktif + `min_price`, `total_stock`, `category_slug` |
| GET | `/api/products/:slug` | Detail + varian |
| GET | `/api/payment-methods` | Metode bayar |
| POST | `/api/orders` | Buat pesanan (cek stok & hitung fee di server) |
| GET | `/api/orders?contact=` | **Baru** — daftar pesanan per WhatsApp/email |
| GET | `/api/orders/:id` | Detail invoice (+ kredensial jika lunas) |
| POST | `/api/orders/:id/pay` | Simulasi bayar (hanya demo; idempoten) |
