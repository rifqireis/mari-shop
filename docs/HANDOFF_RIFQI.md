# Catatan Serah-Terima untuk Rifqi

Dari Haqqi (frontend halaman depan). Semua halaman utama sudah jadi dan berjalan end-to-end,
jadi tugasmu sekarang tinggal **memoles dan menyambungkan**, bukan membuat dari nol.

## 1. Yang sudah dikerjakan Haqqi
- Perbaikan beranda: filter kategori (sebelumnya kosong di mode mock), loading/error/empty state,
  search di mobile, harga "mulai dari", stok, stiker, FAQ, kontras warna, fokus keyboard.
- Halaman baru: `order.html`, `invoice.html`, `check-order.html`, admin (UI demo).
- Aset lokal: thumbnail SVG, Alpine.js disajikan dari `node_modules` (tidak butuh CDN).
- Backend (dibantu perbaikan kecil): mock lengkap, endpoint `GET /api/orders?contact=`,
  cek stok saat order, pay idempoten. **Mari perlu me-review perubahan di `src/routes/api.js`.**

## 2. Tugasmu (Rifqi)

### A. Review & rapikan tampilan dalam (prioritas tinggi)
- [ ] Buka tiap halaman di lebar **360px, 768px, 1280px** (DevTools → toggle device). Catat yang pecah.
- [ ] Cocokkan visual `order.html` dan `invoice.html` dengan rancanganmu di `docs/desgin.md`
      (bagian 3.2 & 3.3). Ubah di `pages.css`, bukan di HTML.
- [ ] Ganti `QR simulasi` di invoice dengan gambar QR asli jika ingin lebih meyakinkan
      (fungsi `qrSvg` di `invoice.js`; bisa pakai library QR via `npm i qrcode`).
- [ ] Tambahkan stiker/ilustrasi tambahan sesuai gaya yang kamu inginkan (kelas `.sticker`).

### B. Admin (kalau jadi bagianmu) — `public/admin/` + `assets/js/admin.js`
- [ ] UI sudah ada tapi **mode demo**: perubahan hanya di memori browser.
- [ ] Koordinasi dengan **Mari** untuk endpoint berikut, lalu isi objek `AdminAPI` di `admin.js`
      (setiap fungsi sudah ditandai `TODO Mari`):
  - `POST/PUT/DELETE /api/admin/products`, `/api/admin/variants`
  - `GET/POST/DELETE /api/admin/credentials`
- [ ] Tambahkan proteksi login sederhana (minimal basic auth/token) sebelum dipublikasi.

### C. Uji menyeluruh (lakukan sebelum presentasi)
- [ ] Jalankan skenario di bagian "Alur demo" pada `README.md` **di mode MySQL**, bukan hanya mock.
- [ ] Coba kasus error: ID kosong, kontak salah, varian stok habis (Google Play 100K), invoice yang tidak ada,
      server dimatikan saat halaman terbuka.
- [ ] Tes di HP (satu wifi: `http://IP-LAPTOP:3000`). Tombol "Salin" tetap jalan lewat fallback.
- [ ] Cek dengan keyboard saja (Tab/Enter) bahwa checkout bisa diselesaikan.

## 3. Aturan kerja supaya tidak bentrok
| File | Pemilik | Catatan |
|---|---|---|
| `tokens.css`, `brutal-components.css` | bersama | Komponen yang dipakai banyak halaman. Tambah kelas baru di bagian bawah, jangan ubah yang lama tanpa bilang. |
| `layout.css` | Haqqi | Navbar, footer, hero, grid |
| `pages.css` | Rifqi (invoice, admin) / Haqqi (home, order) | Bagian sudah dikelompokkan per halaman |
| `src/routes/api.js` | Mari | Perubahan lewat Mari |

- Navbar & footer **disalin** di tiap HTML (belum ada template). Jika mengubah, ubah di semua file
  (`index`, `order`, `invoice`, `check-order`). Jika nanti pindah ke PHP/EJS, jadikan partial.
- Jangan menulis `style="..."` baru; buat kelas di `pages.css`.
- Alpine `x-data` fungsi ada di file JS per halaman (`home.js`, `order-flow.js`, dst).
- Tanpa framework build: cukup simpan file lalu refresh browser.

## 4. Hal yang perlu diputuskan bersama tim
1. **Stack resmi.** `desgin.md` menyebut PHP, tapi repo memakai Node + Express. Samakan dokumen dan implementasi
   (kalau dosen mensyaratkan PHP, ini perlu diketahui sekarang).
2. **Nama toko.** Sekarang "Mari Shop". Ubah di navbar, footer, dan `<title>` bila ingin nama lain.
3. **Keamanan untuk demo.** `POST /orders/:id/pay` terbuka untuk umum dan kredensial tampil ke siapa pun yang tahu ID invoice.
   Aman untuk demo; jelaskan di presentasi bahwa pembayaran memang disimulasikan.
4. **Dokumen duplikat.** `docs/desgin.md` dan `docs/design.md` isinya sama; simpan satu.
5. **Klaim di UI.** Teks seperti "100% RESMI" hanya hiasan demo, ubah jika dosen mempersoalkan.

## 5. Daftar singkat kelas CSS yang sering dipakai
`brutal-card` `btn btn-primary|secondary|danger btn-sm|btn-lg|btn-block` `badge badge-green|yellow|blue|coral`
`brutal-input` `form-error` (+ `.has-error` di pembungkus) `sticker` `table-wrap brutal-table` `modal-backdrop modal-box`
`copy-box` `seg` `skeleton` `empty-state`. Contoh pemakaian ada di `order.html` dan `admin/index.html`.
