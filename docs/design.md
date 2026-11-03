# 🎨 STANDAR DESAIN ANTARMUKA & SISTEM TAMPILAN (DESIGN SYSTEM)
**Platform**: E-Commerce Top-Up Game, Pulsa/Data, Voucher & Akun Premium | **MARI SHOP**  
**Gaya Desain**: **Vibrant Neo-Brutalism & Bento Grid** (Ref: *Gumroad, YouTube Studio Neo-Brutalist, Oatside*)  
**Arsitektur Teknologi**: Frontend (HTML5, Vanilla CSS3 Tokens + Enhance, Alpine.js) & Backend (Node.js, Express.js, MySQL `mysql2/promise`)  
**Target Pengembang**: Tim Frontend (Haqqi & Rifqi) & Backend/Database (Mari)  
**Versi**: 2.0.0 | Terbarukan November 2026

---

## 📌 DAFTAR ISI
1. [Identitas Brand & Filosofi Desain](#1-identitas-brand--filosofi-desain)
2. [Stack Teknologi & Arsitektur Resmi](#2-stack-teknologi--arsitektur-resmi)
3. [Design Tokens & Variabel CSS Terpadu](#3-design-tokens--variabel-css-terpadu)
4. [Tipografi & Hierarki Teks](#4-tipografi--hierarki-teks)
5. [Kanvas Visual, Pattern & Hazard Stripes](#5-kanvas-visual-pattern--hazard-stripes)
6. [Komponen Standar UI Neo-Brutalis](#6-komponen-standar-ui-neo-brutalis)
7. [Iconography & Penanganan Aset Gambar](#7-iconography--penanganan-aset-gambar)
8. [Blueprint Halaman & Alur Pengguna (User Flow)](#8-blueprint-halaman--alur-pengguna)
9. [Standar Aksesibilitas, Validasi Form & Interaksi Mikro](#9-standar-aksesibilitas-validasi-form--interaksi-mikro)
10. [Tata Kelola File & Pembagian Kerja Tim](#10-tata-kelola-file--pembagian-kerja-tim)

---

## 1. Identitas Brand & Filosofi Desain

### A. Identitas Brand: **MARI SHOP**
* **Logo**: Blok biru tua dengan bayangan keras (`.logo-mark`) memuat teks **MARI** berwarna putih berotasi miring halus (`-3deg`), bersanding dengan tulisan **SHOP** bercetak tebal (*Extrabold*).
* **Tagline**: *"TOP UP DETIKAN, ANTI PENDING!"*  
  Ditekankan dengan komponen teks miring bersudut tajam (`.hero-title mark`) di atas latar kuning neon cerah.
* **Nilai Inti UX**: **Transparan, Cepat, Tanpa Ribet.** Semua rincian biaya (harga produk + biaya admin pembayaran) ditampilkan secara instan sebelum pengguna menekan tombol bayar.

### B. Prinsip Neo-Brutalism yang Diterapkan
1. **Bold Navy-Blue Contours (`#0B2A66`)**:
   Alih-alih menggunakan hitam pekat standar, seluruh garis tepi mengadopsi warna *Navy Blue* pekat (`border: 3px solid #0B2A66`). Hal ini memberikan kesan brutalist modern yang berkarakter kuat tanpa terasa kusam.
2. **Hard Drop Shadows (Tanpa Blur)**:
   Setiap kartu, tombol, badge, dan kontainer menggunakan bayangan solid tanpa blur (`box-shadow: 4px 4px 0 #0B2A66` hingga `8px 8px 0 #0B2A66`).
3. **Tactile & Physical Button Press**:
   Interaksi tombol menyerupai tombol fisik:
   * Saat kursor diarahkan (*hover*): Elemen terangkat sedikit (`translate(-2px, -2px)`), bayangan membesar.
   * Saat ditekan (*active*): Elemen bergerak turun (`translate(2px, 2px)`), bayangan merapat menjadi `0px`.
4. **Bento Grid & Dual-Tone Gradients**:
   Area hero dan kartu produk memanfaatkan layout modular Bento Box dengan gradien diagonal dua warna (*split diagonal*: kuning lemon & biru langit), dipadukan dengan garis pita pengaman (*hazard stripes*).
5. **Pattern Texture Background**:
   Kanvas latar belakang dihiasi tekstur doodle/sketsa berulang (*seamless pattern*) dengan transparansi 60% yang lembut agar tidak mengganggu keterbacaan teks utama.

---

## 2. Stack Teknologi & Arsitektur Resmi

Sesuai kesepakatan tim dan evaluasi performa, sistem **tidak menggunakan PHP**, melainkan **Fullstack JavaScript Modern** dengan database relasional:

```text
┌────────────────────────────────────────────────────────┐
│               FRONTEND (Rifqi & Haqqi)                 │
│  - HTML5 Semantik (index, order, invoice, check, admin)│
│  - CSS3 Modular (tokens, brutal-components, enhance)   │
│  - Alpine.js (Reaktivitas UI & Kalkulasi Real-time)    │
│  - SVG Icon Library & Local Assets (Bebas Ketergantungan CDN)│
└───────────────────────────┬────────────────────────────┘
                            │ REST API (fetch JSON)
┌───────────────────────────▼────────────────────────────┐
│                BACKEND & DATABASE (Mari)               │
│  - Runtime: Node.js (v20+)                             │
│  - Web Framework: Express.js                           │
│  - Driver: mysql2/promise (Connection Pool)            │
│  - Database: MySQL 8.0+ (6 Tabel Berelasi + FK/PK)     │
│  - Mock Fallback: Simulasi otomatis jika DB offline    │
└────────────────────────────────────────────────────────┘
```

> [!IMPORTANT]
> **Keputusan Dosen & Mata Kuliah**:  
> Semua kueri basis data pada backend ditulis menggunakan kueri SQL murni (`pool.query(...)`) ber-parameter (*prepared statements*) agar saat presentasi mahasiswa dapat menjelaskan relasi `JOIN`, `FOREIGN KEY`, dan konsep transaksi database secara lugas.

---

## 3. Design Tokens & Variabel CSS Terpadu

Semua variabel tema didefinisikan secara hierarkis. Berkas `enhance.css` menjadi rujukan utama untuk token warna dan ukuran final:

```css
:root {
  /* --- BORDER & TEKS UTAMA (NAVY BRUTALISM) --- */
  --border-color: #0B2A66;        /* Garis tepi tegas navy pekat */
  --text-main: #0A1F44;           /* Teks utama berkontras tinggi */
  --text-muted: #4A5F85;          /* Teks sekunder, deskripsi & caption */
  --border-width: 3px;            /* Ketebalan standar semua border */

  /* --- BRAND & PALET AKSEN POP --- */
  --accent-yellow: #F7BE00;       /* Kuning Lemon Utama / CTA Button */
  --accent-blue: #8FD3FF;         /* Biru Muda / Kartu Info */
  --blue-strong: #0B57D0;         /* Biru Elektrik / Logo Mark / Badge */
  --sky-light: #D9F6FF;           /* Biru Awan Lembut / Latar Aksen */
  --accent-coral: #FF6B5B;        /* Coral Merah / Diskon & Flash Sale */
  --accent-orange: #FFD54A;       /* Oranye / Varian Khusus */
  --accent-purple: #6EA8FF;       /* Ungu Lembut / Voucher */
  --accent-pink: #BFE3FF;         /* Merah Muda Lembut */

  /* --- SEMANTIC & STATUS WARNA --- */
  --state-success: #10B981;       /* Hijau status berhasil */
  --text-success: #047857;        /* Teks status stok aman (kontras > 4.5:1) */
  --state-warning: #F59E0B;       /* Kuning status menunggu pembayaran */
  --state-danger: #EF4444;        /* Merah status gagal / expired */
  --text-error: #B91C1C;          /* Teks peringatan stok habis / error input */
  --bg-error: #FEF3C7;            /* Latar field/banner error */

  /* --- STATE INTERAKSI --- */
  --bg-hover: #FFF8D6;           /* Warna latar saat kartu disorot kursor */
  --bg-selected: #FFE680;        /* Warna latar varian/metode saat aktif terpilih */
  --bg-muted: #EAF6FF;           /* Latar kontainer sekunder / instruksi */

  /* --- SHADOWS (HARD SHADOW, NO BLUR) --- */
  --shadow-sm: 3px 3px 0 var(--border-color);
  --shadow-md: 5px 5px 0 var(--border-color);
  --shadow-lg: 8px 8px 0 var(--border-color);
  --shadow-hover: 8px 8px 0 var(--border-color);
  --shadow-active: 0px 0px 0 var(--border-color);

  /* --- BORDER RADIUS --- */
  --border-radius-sm: 8px;
  --border-radius-md: 14px;
  --border-radius-lg: 22px;
  --border-radius-pill: 999px;

  /* --- MOTIF KHAS (PATTERNS & STRIPES) --- */
  --split-diag: linear-gradient(135deg, var(--accent-yellow) 0 50%, var(--blue-strong) 50% 100%);
  --stripe: repeating-linear-gradient(135deg, var(--blue-strong) 0 12px, var(--accent-yellow) 12px 24px);
}
```

---

## 4. Tipografi & Hierarki Teks

Menggunakan font Google Fonts berkualitas tinggi tanpa biaya lisensi:
* **Display & Heading**: `'Space Grotesk'` (Weight 700 & 800) untuk Logo, Judul Bagian, dan Angka Nominal Besar.
* **Body / Teks Antarmuka**: `'Plus Jakarta Sans'` (Weight 500, 600, 700, 800) untuk label form, deskripsi panduan, dan teks tombol.
* **Data Monospace**: `'JetBrains Mono'` / `monospace` untuk Invoice ID (`TRX-XXXX`), Kode Token Listrik, Serial Voucher, dan Kredensial Akun.

### Tabel Skala Tipografi

| Elemen | Ukuran Font | Weight | Line Height | Contoh Penggunaan |
| :--- | :--- | :--- | :--- | :--- |
| **Hero Title** | `clamp(36px, 5vw, 68px)` | 800 | 1.05 | Slogan utama banner beranda |
| **H1 (Page Title)** | `clamp(26px, 4vw, 40px)` | 800 | 1.20 | Nama Game di Checkout ("Mobile Legends") |
| **Section Title** | `36px` (`clamp(24px, 3vw, 36px)`) | 800 | 1.25 | Judul grup ("Semua Produk", "Cara Order") |
| **Step Title** | `25px` | 800 | 1.30 | Langkah ("1. Masukkan User ID") |
| **Card / Product Title** | `21px` | 700 | 1.25 | Judul kartu katalog produk |
| **Body Large / Price** | `18px – 24px` | 800 | 1.40 | Harga produk (`Rp 19.500`) |
| **Body Regular** | `16px – 17px` | 500 / 600 | 1.60 | Teks paragraf, FAQ, panduan akun |
| **Meta / Small** | `13px – 14px` | 600 / 700 | 1.40 | Provider code, stok ketersediaan, fee admin |
| **Countdown Big** | `54px` (mobile: `40px`)| 800 (Mono) | 1.00 | Timer sisa waktu pembayaran invoice |

---

## 5. Kanvas Visual, Pattern & Hazard Stripes

Untuk membedakan tampilan toko dari toko online biasa, diterapkan aksen grafis neo-brutalis:

### A. Latar Belakang Pattern Berulang (`body::before`)
Kanvas web transparan dengan pattern sketsa di belakang elemen utama:
```css
body::before {
  content: "";
  position: fixed;
  inset: 0;
  z-index: -1;
  pointer-events: none;
  background: url(/assets/img/pattern.jpg) center top / 460px auto repeat;
  opacity: 0.6;
}
```

### B. Hazard Stripe Accent (`--stripe`)
Pita diagonal kuning-biru ala garis pembatas konstruksi yang dipasang di:
1. Garis bawah navigasi atas (`.navbar::after`).
2. Garis dekoratif pembagi kategori produk (`.cat-line`).
3. Garis pemisah atas footer (`.site-footer::before`).

```css
.stripe-line {
  height: 12px;
  background: var(--stripe);
  border: var(--border-width) solid var(--border-color);
  border-radius: var(--border-radius-pill);
}
```

---

## 6. Komponen Standar UI Neo-Brutalis

### A. Tombol Fisik (Buttons)
```html
<button class="btn btn-primary btn-lg">Beli Sekarang →</button>
<a href="#" class="btn btn-secondary btn-sm">Cek Pesanan</a>
```
* `.btn`: Border 3px solid `#0B2A66`, border-radius 14px, font-weight 700.
* `.btn-primary`: Latar kuning neon (`var(--accent-yellow)`).
* `.btn-blue`: Latar biru elektrik (`var(--blue-strong)`).
* `.btn-secondary`: Latar putih bersih.
* `.btn-danger`: Latar merah coral (`var(--accent-coral)`).

### B. Kartu Kontainer & Bento Blocks (`.brutal-card`)
Wadah utama untuk setiap tahapan pemesanan dan panel dashboard:
* Padding: `30px` (desktop) / `22px` (mobile).
* Radius: `22px` (`var(--border-radius-lg)`).
* Shadow: `5px 5px 0 var(--border-color)`.
* Header Kartu (`.brutal-card-header`): Berisi nomor langkah bulat (`.step-num`) dan gradien diagonal dua warna.

### C. Kartu Produk Katalog (`.product-card`)
* Memiliki gradien diagonal lembut: `linear-gradient(135deg, #fff 0 62%, var(--sky-light) 62%)`.
* Saat di-hover, sudut warna bawah berubah menjadi kuning keemasan (`#FFE680`) dan terangkat ke atas.
* Dilengkapi stiker miring di sudut kanan atas (`.sticker`).

### D. Selector Varian Paket (`.variant-grid` & `.variant-card`)
* Menampilkan nama paket, harga jual bertuliskan tebal, dan harga coret (`.variant-old`).
* Status aktif terpilih (`.selected`): Latar berubah menjadi kuning (`var(--bg-selected)`), border tetap navy pekat, bayangan bertambah kuat.

### E. Selector Metode Pembayaran (`.payment-group` & `.payment-item`)
* Dikelompokkan dalam tab lipat / accordion: **QRIS**, **Virtual Account**, dan **E-Wallet**.
* Setiap baris menampilkan logo channel pembayaran, nama bank/dompet digital, dan estimasi biaya transaksi (`fee_flat` + `fee_percentage`).

---

## 7. Iconography & Penanganan Aset Gambar

1. **Paket Ikon SVG Mandiri (`assets/img/icons/`)**:
   Semua ikon disimpan lokal dalam format SVG tanpa ketergantungan library luar (bebas CDN).
   * **Ikon Berbingkai (`.ico`)**: `game.svg`, `phone.svg`, `card.svg`, `qr.svg`, `shield.svg`, `wallet.svg`.
   * **Ikon Polos / Bare (`*-bare.svg`)**: Digunakan sebagai `background-image` dalam input pencarian (`search-bare.svg`) atau pelengkap teks.
2. **Thumbnail Produk Resmi (`assets/img/products/`)**:
   Setiap produk memiliki thumbnail SVG resolusi tajam dengan rasio 1:1 (contoh: `mobile-legends.svg`, `netflix-premium.svg`, `telkomsel.svg`).
3. **Stiker Visual Dekoratif (`.sticker`)**:
   Badge lingkaran atau kapsul dengan rotasi tipis (`transform: rotate(6deg)` atau `rotate(-6deg)`):
   * `100% RESMI`
   * `⚡ PROSES INSTAN`
   * `HOT DEALS`

---

## 8. Blueprint Halaman & Alur Pengguna

### 1. Beranda (`index.html`)
* **Header Bar**: Logo MARI SHOP, Kolom cari cepat (dengan ikon kaca pembesar terintegrasi), tombol pintasan "Bantuan" dan "Cek Pesanan".
* **Hero Banner**: Slogan anti-pending, bento box statistik (kecepatan 30 detik, 5+ metode pembayaran, 24/7), tombol ajakan "Mulai Top Up ↓".
* **Keunggulan (Perks Strip)**: 4 kartu fitur (Produk Resmi, Instan Otomatis, Bayar Fleksibel, Bantuan Cepat).
* **Katalog Berbasis Kategori**: Filter tab dengan *cat-chip* dan *hazard stripe divider*.
* **Cara Order**: 3 langkah bento bergambar (Pilih Produk $\rightarrow$ Isi Data & Bayar $\rightarrow$ Terima Pesanan).
* **Bantuan & FAQ**: Pertanyaan lazim berbasis elemen `<details>` semantik.
* **Footer**: Rincian status proyek tugas besar, pilihan metode pembayaran, dan navigasi menu.

### 2. Form Pemesanan Instan (`order.html?product=:slug`)
Layout 2-kolom responsif:
* **Kolom Kiri (Steps)**:
  * *Langkah 1*: Input Data Akun (User ID & Server Zone disesuaikan otomatis dengan `input_type` produk).
  * *Langkah 2*: Grid Varian Nominal / Paket (Badge ketersediaan stok).
  * *Langkah 3*: Pilihan Metode Pembayaran (Rincian biaya admin transparan).
  * *Langkah 4*: Nomor WhatsApp / Email Konfirmasi.
* **Kolom Kanan (Sticky Order Summary)**:
  * Rincian instan: Produk terpilih, Varian terpilih, Harga dasar, Biaya admin, dan Total Bayar.
  * Tombol CTA: `⚡ Beli Sekarang`.
* **Mobile Floating Action Bar (`.mobile-bar`)**: Di layar HP ($<768\text{px}$), total bayar dan tombol beli melayang di bawah layar agar mudah dijangkau satu tangan.

### 3. Invoice & Status Transaksi (`invoice.html?id=:id`)
* **Countdown Timer (15 Menit)**: Tampilan waktu hitung mundur digital monospaced (`MM:SS`).
* **Instruksi Bayar Berdasarkan Tipe**:
  * *QRIS*: Tampilan kode QR dalam bingkai neo-brutalis (`.qr-frame`) dilengkapi tombol "Unduh QRIS".
  * *Virtual Account / E-Wallet*: Nomor VA / Kode Bayar dengan tombol **Salin Kode** (dilengkapi umpan balik toast instan).
* **Timeline Status Pesanan**: 4 tahapan (Pesanan Dibuat $\rightarrow$ Dibayar $\rightarrow$ Diproses $\rightarrow$ Selesai).
* **Kotak Kredensial Khusus (`.secret-payload`)**: Untuk akun Netflix/Spotify atau serial voucher, akun langsung ditampilkan di layar begitu transaksi lunas.
* **Panel Simulasi Pembayaran (Demo Mode)**: Tombol instan untuk demonstrasi presentasi di hadapan dosen penguji.

### 4. Cek Riwayat Pesanan (`check-order.html`)
Pencarian instan menggunakan Invoice ID atau nomor kontak WhatsApp. Riwayat pencarian tersimpan di `localStorage` peramban untuk kenyamanan demo.

### 5. Panel Kelola Admin CRUD (`admin/index.html` & `admin/credentials.html`)
Dashboard khusus untuk pembuktian fitur CRUD tugas besar:
* **Tabel Produk**: Tambah produk baru (modal), edit nama/provider, sakelar aktif/nonaktif, dan hapus.
* **Tabel Varian**: Atur harga pokok, harga jual, dan jumlah stok.
* **Inventori Kredensial**: Input massal (*bulk paste*) akun/voucher siap pakai.

---

## 9. Standar Aksesibilitas, Validasi Form & Interaksi Mikro

1. **Aksesibilitas Kontras (WCAG AA)**:
   * Semua teks tombol dan status menggunakan perpaduan warna yang lolos rasio kontras minimal 4.5:1 (misal `--text-success: #047857` di atas putih).
2. **Keyboard Navigation**:
   * Setiap elemen interaktif memiliki `:focus-visible` dengan garis tepi jelas ber-offset (`outline: 3px solid var(--blue-strong); outline-offset: 3px`).
3. **Validasi Form & Efek Guncang (*Shake Animation*)**:
   * Jika kolom input yang wajib belum diisi saat menekan tombol pesan, kontainer form akan bergetar singkat (`animation: shake 0.3s`) dan menampilkan pesan error merah berlatar kuning muda (`.form-error`).
4. **Toast Notification System**:
   * Umpan balik notifikasi melayang di pojok kanan bawah dengan durasi 2.5 detik untuk aksi salin clipboard atau simpan perubahan.

---

## 10. Tata Kelola File & Pembagian Kerja Tim

```text
TUBES/
├── docs/
│   ├── design.md                 <-- (Dokumen Standar Desain Resmi & Tunggal)
│   └── HANDOFF_RIFQI.md          <-- Catatan koordinasi serah terima tugas
├── database/
│   └── schema.sql                <-- Skema 6 Tabel Relasi MySQL + Seed Data Lengkap
├── src/
│   ├── server.js                 <-- Server Express (Sajikan static & API)
│   ├── config/db.js              <-- Koneksi MySQL Pool
│   └── routes/api.js             <-- REST API (Katalog, Checkout, Status, Pay, Admin)
└── public/
    ├── index.html                <-- Beranda
    ├── order.html                <-- Form Order Instan
    ├── invoice.html              <-- Halaman Invoice & QR/VA
    ├── check-order.html          <-- Cek Pesanan
    ├── admin/
    │   ├── index.html            <-- CRUD Produk & Varian
    │   └── credentials.html      <-- Kelola Stok Kredensial
    └── assets/
        ├── css/
        │   ├── tokens.css        <-- Variabel desain global
        │   ├── brutal-components.css <-- Tombol, tabel, form, modal
        │   ├── layout.css        <-- Navbar, hero, footer, responsive
        │   ├── pages.css         <-- Penataan khusus halaman
        │   └── enhance.css       <-- Enhanced styling v2 (pattern, oversized UI, hazard)
        ├── js/
        │   ├── main.js           <-- Utilitas (Rupiah, Toast, Fetcher)
        │   ├── copy-clipboard.js <-- Salin clipboard dengan fallback
        │   ├── home.js           <-- Logika beranda & filter
        │   ├── order-flow.js     <-- Logika kalkulasi harga & submit pesanan
        │   ├── invoice.js        <-- Logika countdown timer & auto-poll status
        │   ├── check-order.js    <-- Logika lacak invoice
        │   └── admin.js          <-- Logika interaksi panel CRUD
        └── img/
            ├── banner.svg        <-- Grafis latar hero
            ├── pattern.jpg       <-- Tekstur sketsa kanvas
            ├── icons/            <-- Koleksi SVG ikon lokal
            └── products/         <-- Thumbnail SVG produk resmi
```

### Panduan Kolaborasi Tim
* **Haqqi & Rifqi (Frontend)**: Mengelola file di dalam folder `public/`. Jika ada penambahan style baru, tempatkan di bagian bawah `pages.css` tanpa memodifikasi token bersama sembarangan.
* **Mari (Backend & Basis Data)**: Mengelola file `src/` dan `database/schema.sql`. Menyediakan endpoint RESTful JSON yang bersih sesuai kontrak data yang disepakati.
* **Ariqah & Caca (Laporan & PPT)**: Mengambil tangkapan layar antarmuka dari localhost:3000 dan skema ERD untuk penyusunan BAB II laporan serta slide presentasi.
