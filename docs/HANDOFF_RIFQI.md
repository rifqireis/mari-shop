# Catatan Serah-Terima untuk Rifqi

Dari Haqqi (frontend halaman depan) & Rifqi (pemolesan sistem & endpoint). Semua halaman utama sudah berjalan end-to-end, tampilan Neo-Brutalism terpadu, dan backend API telah dihubungkan.

---

## 1. Yang sudah dikerjakan Haqqi
- Perbaikan beranda: filter kategori, loading/error/empty state, search di mobile, harga "mulai dari", stok, stiker, FAQ, kontras warna, fokus keyboard.
- Halaman baru: `order.html`, `invoice.html`, `check-order.html`, admin (UI demo & credentials).
- Aset lokal: thumbnail SVG, Alpine.js disajikan dari server/node_modules (tanpa ketergantungan CDN).
- Backend (mock lengkap, endpoint `GET /api/orders?contact=`, cek stok saat order, pay idempoten).

---

## 2. Progress Tugas Rifqi (Status Terkini)

### A. Review & Rapikan Tampilan Dalam
- [x] **Responsivitas**: Pengecekan layout pada lebar **360px, 768px, dan 1280px** (navbar wrap, bento grid 1-kolom di mobile, sticky summary di desktop, dan mobile floating bar saat order).
- [x] **Penyelarasan Desain**: Rujukan desain disatukan ke [`docs/design.md`](file:///home/rifqi/Workspace/Belajar/BASDA/TUBES/docs/design.md) v2.0.0 (palet navy-yellow, hazard stripe, pattern texture, typography). File duplikat ber-typo `docs/desgin.md` telah dihapus.
- [x] **QR Code Asli di Invoice**: Library `qrcode` telah diinstal via npm. Endpoint server `GET /api/qr?text=...` aktif mengembalikan SVG QR code asli yang valid dan bisa discan langsung, dengan auto-fallback deterministik jika offline.
- [x] **Stiker & Ikon**: Terpasang lengkap di `assets/img/icons/` dan kelas `.sticker`.

### B. Admin CRUD & Backend Integration
- [x] **Endpoint Admin CRUD Aktif**: Endpoint REST API telah dibuat di `src/routes/api.js` (dengan kueri SQL relasional MySQL + fallback memori):
  - `POST /api/admin/products`, `PUT /api/admin/products/:id`, `DELETE /api/admin/products/:id`
  - `POST /api/admin/variants`, `PUT /api/admin/variants/:id`, `DELETE /api/admin/variants/:id`
  - `GET /api/admin/credentials`, `POST /api/admin/credentials`, `DELETE /api/admin/credentials/:id`
- [x] **Penyambungan `AdminAPI`**: Objek `AdminAPI` di `public/assets/js/admin.js` telah dihubungkan ke endpoint server. Operasi Tambah/Ubah/Hapus produk, varian, dan inventori kredensial kini tersimpan langsung ke backend.
- [ ] **Proteksi Login Sederhana**: Pasang middleware basic auth / PIN rahasia untuk route `/admin` sebelum aplikasi di-deploy ke server online publik.

### C. Uji Menyeluruh (Persiapan Presentasi)
- [x] Uji alur mock end-to-end: Beranda → Order → Invoice QRIS & VA → Simulasi Bayar → Secret Payload muncul → Cek Pesanan.
- [ ] Jalankan skenario di mode **MySQL Database asli** bersama Mari (`DB_HOST`, `DB_USER`, `DB_NAME` di `.env`).
- [ ] Uji kasus negatif: ID akun kosong, kontak tidak valid, varian stok habis, invoice tidak ditemukan.
- [ ] Pengujian di layar HP fisik (satu jaringan Wi-Fi via `http://IP-LAPTOP:3000`).

---

## 3. Aturan Kerja Tim Frontend & Backend
| File / Direktori | Penanggung Jawab | Catatan |
|---|---|---|
| `tokens.css`, `brutal-components.css` | Haqqi & Rifqi | Komponen bersama. Tambahkan utility baru di bagian bawah. |
| `layout.css`, `enhance.css` | Haqqi & Rifqi | Penataan navbar, hero bento, responsive layout, dan pattern. |
| `pages.css` | Rifqi & Haqqi | Styling spesifik invoice, order, cek pesanan, dan admin. |
| `src/routes/api.js`, `src/config/db.js` | Mari & Rifqi | Endpoint REST API dan kueri SQL prepared statement. |
| `database/schema.sql` | Mari | Skema DDL 6 tabel relasional dan seeder SQL. |

---

## 4. Keputusan Bersama yang Telah Terkunci
1. **Stack Resmi**: **Node.js (Express.js) + MySQL (`mysql2/promise`)** dengan Frontend **HTML5, CSS3 Tokens, & Alpine.js**. (Bukan PHP).
2. **Nama Toko**: **"Mari Shop"** (Tagline: *TOP UP DETIKAN, ANTI PENDING!*).
3. **Dokumentasi Tunggal**: Hanya menggunakan [`docs/design.md`](file:///home/rifqi/Workspace/Belajar/BASDA/TUBES/docs/design.md).
4. **Mode Demo**: Endpoint `POST /api/orders/:id/pay` tetap dipertahankan untuk kebutuhan simulasi demonstrasi saat presentasi di hadapan dosen.
