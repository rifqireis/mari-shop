# Panduan Langkah Kerja Runtut: Backend (Mario) & Pembuat ERD
**Mari Shop - E-Commerce Top-Up Game & Digital Goods**  
*Mata Kuliah: Pengantar Basis Data (Kelas A1)*

---

## DAFTAR ISI
1. [Bagian A: Langkah Runtut Mario (Backend & Database)](#bagian-a-langkah-runtut-mario-backend--database)
2. [Bagian B: Langkah Runtut Pembuat ERD](#bagian-b-langkah-runtut-pembuat-erd)
3. [Bagian C: Checklist Pengujian Bersama Sebelum Presentasi](#bagian-c-checklist-pengujian-bersama-sebelum-presentasi)

---

## BAGIAN A: Langkah Runtut Mario (Backend & Database)

Alur kerja Mario dibagi menjadi 5 tahap yang berurutan:

```
[Tahap 1: Setup Database] ➜ [Tahap 2: Konfigurasi Proyek] ➜ [Tahap 3: Uji Koneksi] ➜ [Tahap 4: Uji Transaksi & API] ➜ [Tahap 5: Persiapan Demo]
```

### Tahap 1: Menyiapkan Database MySQL
1. **Nyalakan Layanan MySQL**:
   - Buka aplikasi **XAMPP Control Panel** atau **Laragon**.
   - Klik tombol **Start** pada modul **MySQL** (pastikan modul berwarna hijau dan berjalan di port `3306`).
2. **Import Skema Database & Data Awal**:
   - Buka browser dan buka halaman phpMyAdmin: `http://localhost/phpmyadmin`
   - Klik menu **Databases**, masukkan nama database baru: `db_ecommerce_topup`, lalu klik **Create**.
   - Klik database `db_ecommerce_topup` yang baru saja dibuat di bilah navigasi sebelah kiri.
   - Klik tab **Import** pada menu horizontal di bagian atas.
   - Klik tombol **Choose File / Browse**, arahkan dan pilih file:
     `database/schema.sql`
   - Gulir ke bawah dan klik tombol **Import / Kirim**.
   - **Hasil yang Diharapkan**: Seluruh 7 tabel (`users`, `categories`, `products`, `product_variants`, `payment_methods`, `transactions`, `product_credentials`) beserta puluhan data seeder awal otomatis berhasil terpasang.

---

### Tahap 2: Konfigurasi File Lingkungan (.env)
1. Buka folder proyek Mari Shop di teks editor (VS Code).
2. Periksa apakah sudah ada file bernama `.env` di folder utama:
   - Jika belum ada, salin file `.env.example` lalu ubah namanya menjadi `.env`.
3. Buka file `.env` dan pastikan nilainya sesuai dengan konfigurasi MySQL lokal Anda:
   ```env
   PORT=3000
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=
   DB_NAME=db_ecommerce_topup
   DB_PORT=3306
   DB_SSL=false
   ```
   *(Catatan: Jika memakai password pada user root MySQL Anda, isi di bagian `DB_PASSWORD`).*

---

### Tahap 3: Menjalankan Server & Verifikasi Koneksi
1. Buka terminal di folder utama proyek (`/TUBES`).
2. Jalankan instalasi dependensi (cukup dijalankan satu kali):
   ```bash
   npm install
   ```
3. Nyalakan server aplikasi Mari Shop:
   ```bash
   npm run dev
   ```
   *(Atau jalankan: `npm start`)*
4. **Perhatikan tulisan log di terminal**:
   - **Koneksi Sukses (Warna Hijau)**:
     `✅ [Database] Berhasil terhubung ke MySQL database: db_ecommerce_topup`
   - **Koneksi Gagal (Warna Kuning)**:
     `⚠️ [Database] Belum terhubung ke MySQL: ...`
     Jika masih kuning, periksa apakah MySQL di XAMPP/Laragon sudah menyala, dan pastikan nilai `DB_USER` / `DB_PASSWORD` di `.env` sudah benar.

---

### Tahap 4: Menguji Alur Data Transaksi Nyata
1. Buka browser dan akses alamat toko: `http://localhost:3000`
2. Lakukan simulasi pembelian produk game:
   - Pilih **Mobile Legends** -> masukkan User ID dan Zone ID.
   - Pilih varian nominal (misal: 86 Diamonds).
   - Pilih metode pembayaran **QRIS** -> isi nomor WhatsApp -> klik tombol **Beli Sekarang**.
3. Di halaman invoice yang terbuka, klik tombol **Simulasi Bayar**.
4. **Verifikasi data langsung di phpMyAdmin**:
   - Buka tabel `transactions`: Perhatikan baris baru muncul dengan kolom `payment_status` yang berubah menjadi `paid`.
   - Buka tabel `product_variants`: Perhatikan nilai `stock` varian tersebut berkurang secara otomatis.
5. Coba lakukan pembelian produk akun digital (misalnya **Netflix Premium**):
   - Setelah invoice dibayar, kotak akun rahasia (email & password) langsung muncul di halaman invoice.
   - Buka tabel `product_credentials` di phpMyAdmin: Perhatikan kolom `is_redeemed` berubah menjadi `1` (true) dan kolom `transaction_id` terisi otomatis.

---

### Tahap 5: Persiapan Menghadapi Dosen / Asisten Laboratorium
1. **Pertanyaan Keamanan: SQL Injection**:
   - *Pertanyaan Dosen*: "Bagaimana cara backend mengamankan data dari serangan SQL Injection?"
   - *Jawaban Mario*: "Seluruh kueri SQL di backend menggunakan prepared statement dengan parameter placeholder tanda tanya (`?`) pada modul `mysql2/promise`. Input dari pengguna tidak pernah digabungkan langsung dengan string SQL, sehingga kebal terhadap SQL Injection."
2. **Pertanyaan Keandalan Sistem: Fail-Safe / Fallback**:
   - *Pertanyaan Dosen*: "Bagaimana jika koneksi database terputus di tengah jalan?"
   - *Jawaban Mario*: "Sistem dilengkapi arsitektur graceful fallback di `src/routes/api.js`. Jika MySQL tidak terjangkau, server tetap dapat melayani pengunjung dengan data cadangan di memori tanpa menampilkan halaman error putih."

---

## BAGIAN B: Langkah Runtut Pembuat ERD

Alur kerja untuk anggota tim yang bertugas membuat diagram ERD:

```
[Tahap 1: Pahami 7 Entitas] ➜ [Tahap 2: Buka Tool Diagram] ➜ [Tahap 3: Hubungkan Relasi] ➜ [Tahap 4: Ekspor Laporan]
```

### Tahap 1: Memahami 7 Entitas & Kunci Utama

1. **`categories`** (Kategori Produk):
   - Kunci Primer (PK): `id`
   - Atribut penting: `name`, `slug`, `icon_url`
2. **`products`** (Katalog Produk Game & Layanan):
   - Kunci Primer (PK): `id`
   - Kunci Asing (FK): `category_id` (merujuk ke `categories.id`)
   - Atribut penting: `name`, `slug`, `input_type`, `thumbnail_url`, `is_active`
3. **`product_variants`** (Pilihan Paket & Harga):
   - Kunci Primer (PK): `id`
   - Kunci Asing (FK): `product_id` (merujuk ke `products.id`)
   - Atribut penting: `name`, `sku_code`, `original_price`, `selling_price`, `stock`
4. **`payment_methods`** (Kanal Pembayaran):
   - Kunci Primer (PK): `id`
   - Atribut penting: `name`, `type`, `fee_flat`, `fee_percentage`
5. **`transactions`** (Data Pesanan & Invoice Pembeli):
   - Kunci Primer (PK): `id`
   - Kunci Asing (FK 1): `variant_id` (merujuk ke `product_variants.id`)
   - Kunci Asing (FK 2): `payment_method_id` (merujuk ke `payment_methods.id`)
   - Atribut penting: `target_account`, `target_zone`, `contact_email_or_phone`, `total_amount`, `payment_status`, `fulfillment_status`, `created_at`
6. **`product_credentials`** (Stok Akun Digital & Kode Voucher):
   - Kunci Primer (PK): `id`
   - Kunci Asing (FK 1): `variant_id` (merujuk ke `product_variants.id`)
   - Kunci Asing (FK 2): `transaction_id` (merujuk ke `transactions.id`, bernilai NULL jika belum laku)
   - Atribut penting: `secret_payload`, `is_redeemed`
7. **`users`** (Pengguna & Akun Administrator):
   - Kunci Primer (PK): `id`
   - Atribut penting: `name`, `email`, `password`, `role`, `created_at`

---

### Tahap 2: Memahami Kardinalitas Relasi Antar Tabel

| Relasi Tabel | Jenis Kardinalitas | Penjelasan Sederhana untuk Laporan |
|---|---|---|
| `categories` ➜ `products` | **One-to-Many (1 : N)** | Satu kategori (misal Game) menampung banyak game (MLBB, FF, Genshin). |
| `products` ➜ `product_variants` | **One-to-Many (1 : N)** | Satu produk game memiliki banyak paket nominal (86 diamond, 172 diamond). |
| `product_variants` ➜ `transactions` | **One-to-Many (1 : N)** | Satu varian paket dapat dibeli dalam banyak transaksi pelanggan. |
| `payment_methods` ➜ `transactions` | **One-to-Many (1 : N)** | Satu metode bayar (misal QRIS) melayani banyak transaksi pelanggan. |
| `product_variants` ➜ `product_credentials` | **One-to-Many (1 : N)** | Satu jenis paket akun Netflix memiliki banyak stok akun unik di tabel kredensial. |
| `transactions` ➜ `product_credentials` | **One-to-One Opsional (1 : 0..1)** | Setiap transaksi yang sukses hanya mendapatkan 1 akun/voucher rahasia. |

---

### Tahap 3: Menggambar ERD dengan Alat Bantu (Rekomendasi)

#### Pilihan Terbaik: Menggunakan dbdiagram.io (Cepat & Presisi)
1. Buka situs [https://dbdiagram.io](https://dbdiagram.io) di browser.
2. Klik tombol **New Diagram**.
3. Buka file [`database/schema.sql`](file:///home/rifqi/Workspace/Belajar/BASDA/TUBES/database/schema.sql) di VS Code, lalu salin seluruh isi kodenya.
4. Pada dbdiagram.io, klik tombol **Import** -> pilih **Import from MySQL Script**, lalu tempel kodenya.
5. Diagram ERD relasional akan langsung terbuat secara otomatis, lengkap dengan garis foreign key dan tipe data.
6. Rapikan posisi kotak entitas agar mudah dibaca dari kiri ke kanan.

#### Pilihan Alternatif: Draw.io / Diagrams.net
1. Buka situs [https://draw.io](https://draw.io).
2. Di bilah sisi kiri, aktifkan kelompok bentuk **Entity Relation**.
3. Buat 7 kotak tabel, tentukan `PK` dan `FK`, lalu sambungkan garis relasi dengan ujung Crow’s Foot (kaki gagak).

---

### Tahap 4: Ekspor Diagram untuk Laporan Tugas Besar
1. Klik menu **Export** pada dbdiagram.io atau draw.io.
2. Pilih format **PDF** atau **PNG High Resolution**.
3. Sisipkan gambar ke dalam dokumen laporan pada bab **Perancangan Basis Data / ERD**.
4. Tambahkan tabel penjelasan kardinalitas (seperti pada Tahap 2 di atas) agar laporan bernilai tinggi.

---

## BAGIAN C: Checklist Pengujian Bersama Sebelum Presentasi

Lakukan uji coba bersama antara Frontend (Rifqi/Haqqi) dan Backend (Mario):

- [ ] **Uji Server Start**: Terminal menampilkan pesan koneksi hijau ke MySQL.
- [ ] **Uji Katalog**: Halaman utama menampilkan 29 produk dari 5 kategori secara lengkap.
- [ ] **Uji Checkout**: Membuat pesanan baru berhasil memunculkan halaman invoice dengan nomor invoice unik (contoh: `TRX-...`).
- [ ] **Uji QR Code & VA**: Invoice menampilkan QR Code asli yang dapat discan serta nomor Virtual Account.
- [ ] **Uji Simulasi Bayar**: Menekan tombol bayar langsung mengubah status menjadi lunas (`paid`) dan pesanan selesai (`success`).
- [ ] **Uji Produk Kredensial**: Pembelian produk Netflix / Spotify berhasil menampilkan kredensial akun dan tombol salin.
- [ ] **Uji Cek Pesanan**: Halaman `check-order.html` dapat melacak pesanan menggunakan nomor WhatsApp atau nomor invoice.
- [ ] **Uji Tampilan Mobile & Desktop**: Tampilan di layar laptop dan handphone tetap rapi, seimbang, dan mudah dibaca.
