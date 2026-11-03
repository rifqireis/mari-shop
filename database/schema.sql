-- ============================================================
-- SKEMA BASIS DATA E-COMMERCE TOP-UP & DIGITAL GOODS
-- TUGAS BESAR PENGANTAR BASIS DATA (KELAS A1)
-- ============================================================

CREATE DATABASE IF NOT EXISTS db_ecommerce_topup;
USE db_ecommerce_topup;

-- 0. TABEL USERS (Pengguna & Admin)
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('customer', 'admin') NOT NULL DEFAULT 'customer',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 1. TABEL CATEGORIES
CREATE TABLE IF NOT EXISTS categories (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) NOT NULL UNIQUE,
    icon_url VARCHAR(255)
) ENGINE=InnoDB;

-- 2. TABEL PRODUCTS
CREATE TABLE IF NOT EXISTS products (
    id VARCHAR(36) PRIMARY KEY,
    category_id VARCHAR(36) NOT NULL,
    name VARCHAR(150) NOT NULL,
    slug VARCHAR(150) NOT NULL UNIQUE,
    provider_code VARCHAR(50),
    input_type VARCHAR(50) DEFAULT 'user_id', -- 'user_id_zone', 'phone_number', 'account_id', 'none'
    thumbnail_url VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    CONSTRAINT fk_products_categories
        FOREIGN KEY (category_id) REFERENCES categories(id)
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

-- 3. TABEL PRODUCT_VARIANTS
CREATE TABLE IF NOT EXISTS product_variants (
    id VARCHAR(36) PRIMARY KEY,
    product_id VARCHAR(36) NOT NULL,
    name VARCHAR(150) NOT NULL,
    sku_code VARCHAR(100) NOT NULL UNIQUE,
    original_price INT NOT NULL DEFAULT 0,
    selling_price INT NOT NULL DEFAULT 0,
    stock INT NOT NULL DEFAULT 999,
    is_active BOOLEAN DEFAULT TRUE,
    CONSTRAINT fk_variants_products
        FOREIGN KEY (product_id) REFERENCES products(id)
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

-- 4. TABEL PAYMENT_METHODS
CREATE TABLE IF NOT EXISTS payment_methods (
    id VARCHAR(50) PRIMARY KEY, -- 'qris', 'bca_va', 'mandiri_va', 'dana', 'gopay'
    name VARCHAR(100) NOT NULL,
    type VARCHAR(50) NOT NULL, -- 'qris', 'virtual_account', 'ewallet'
    fee_flat INT NOT NULL DEFAULT 0,
    fee_percentage DECIMAL(5, 2) NOT NULL DEFAULT 0.00,
    is_active BOOLEAN DEFAULT TRUE
) ENGINE=InnoDB;

-- 5. TABEL TRANSACTIONS (Order / Invoice)
CREATE TABLE IF NOT EXISTS transactions (
    id VARCHAR(50) PRIMARY KEY, -- 'TRX-20261101-XXXX'
    variant_id VARCHAR(36) NOT NULL,
    payment_method_id VARCHAR(50) NOT NULL,
    target_account VARCHAR(100) NOT NULL, -- No HP / Game ID / No Tagihan
    target_zone VARCHAR(50) NULL,        -- Zone ID / Server (Khusus MLBB/Genshin dsb)
    contact_email_or_phone VARCHAR(100) NOT NULL,
    base_price INT NOT NULL,
    fee_amount INT NOT NULL DEFAULT 0,
    total_amount INT NOT NULL,
    payment_status ENUM('unpaid', 'paid', 'expired', 'failed') NOT NULL DEFAULT 'unpaid',
    fulfillment_status ENUM('pending', 'processing', 'success', 'failed') NOT NULL DEFAULT 'pending',
    payment_reference VARCHAR(255) NULL, -- VA Number / QRIS string
    paid_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_transactions_variants
        FOREIGN KEY (variant_id) REFERENCES product_variants(id)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_transactions_payments
        FOREIGN KEY (payment_method_id) REFERENCES payment_methods(id)
        ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB;

-- 6. TABEL PRODUCT_CREDENTIALS (Inventori Akun Premium / Kode Voucher)
CREATE TABLE IF NOT EXISTS product_credentials (
    id VARCHAR(36) PRIMARY KEY,
    variant_id VARCHAR(36) NOT NULL,
    transaction_id VARCHAR(50) NULL, -- Terisi jika sudah terjual / terikat transaksi
    secret_payload TEXT NOT NULL,    -- Akun: 'user:pass' atau serial voucher
    is_redeemed BOOLEAN NOT NULL DEFAULT FALSE,
    CONSTRAINT fk_credentials_variants
        FOREIGN KEY (variant_id) REFERENCES product_variants(id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_credentials_transactions
        FOREIGN KEY (transaction_id) REFERENCES transactions(id)
        ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB;

-- ============================================================
-- DATA AWAL (SEEDER) UNTUK KEPERLUAN TESTING & PRESENTASI
-- ============================================================

-- Kategori
INSERT INTO categories (id, name, slug, icon_url) VALUES
('cat-game', 'Game Populer', 'game', '🎮'),
('cat-pulsa', 'Pulsa & Kuota', 'pulsa-kuota', '📱'),
('cat-app', 'Aplikasi Premium', 'app-premium', '🎬'),
('cat-voucher', 'Voucher & Kado', 'voucher', '🎟️'),
('cat-pajak', 'Pajak & Tagihan PPOB', 'tagihan-ppob', '⚡')
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- Metode Pembayaran
INSERT INTO payment_methods (id, name, type, fee_flat, fee_percentage, is_active) VALUES
('qris', 'QRIS (Semua E-Wallet / Bank)', 'qris', 0, 0.70, TRUE),
('bca_va', 'BCA Virtual Account', 'virtual_account', 2500, 0.00, TRUE),
('bri_va', 'BRI Virtual Account', 'virtual_account', 2000, 0.00, TRUE),
('dana', 'DANA E-Wallet', 'ewallet', 1000, 0.00, TRUE),
('gopay', 'GoPay', 'ewallet', 1000, 0.00, TRUE)
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- Produk Sampel
INSERT INTO products (id, category_id, name, slug, provider_code, input_type, thumbnail_url, is_active) VALUES
('prod-mlbb', 'cat-game', 'Mobile Legends: Bang Bang', 'mobile-legends', 'MOONTON', 'user_id_zone', 'assets/img/products/mobile-legends.svg', TRUE),
('prod-ff', 'cat-game', 'Free Fire MAX', 'free-fire', 'GARENA', 'user_id', 'assets/img/products/free-fire.svg', TRUE),
('prod-tksel', 'cat-pulsa', 'Telkomsel Data & Pulsa', 'telkomsel', 'TELKOMSEL', 'phone_number', 'assets/img/products/telkomsel.svg', TRUE),
('prod-netflix', 'cat-app', 'Netflix Premium 4K UHD', 'netflix-premium', 'NETFLIX', 'contact_only', 'assets/img/products/netflix-premium.svg', TRUE),
('prod-spotify', 'cat-app', 'Spotify Individual Premium', 'spotify-premium', 'SPOTIFY', 'contact_only', 'assets/img/products/spotify-premium.svg', TRUE)
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- Varian Produk Sampel
INSERT INTO product_variants (id, product_id, name, sku_code, original_price, selling_price, stock, is_active) VALUES
('var-ml-86', 'prod-mlbb', '86 Diamonds', 'ML-86DM', 22000, 19500, 999, TRUE),
('var-ml-172', 'prod-mlbb', '172 Diamonds', 'ML-172DM', 44000, 39000, 999, TRUE),
('var-ml-pass', 'prod-mlbb', 'Weekly Diamond Pass', 'ML-WDP', 32000, 28000, 999, TRUE),
('var-ff-140', 'prod-ff', '140 Diamonds', 'FF-140DM', 20000, 18000, 999, TRUE),
('var-tks-10gb', 'prod-tksel', 'Kuota 10 GB 30 Hari', 'TKS-10GB', 45000, 42000, 999, TRUE),
('var-nflx-1bln', 'prod-netflix', 'Akun Netflix 1 Bulan (1 Profil)', 'NFLX-1M-SHR', 45000, 35000, 5, TRUE),
('var-spot-1bln', 'prod-spotify', 'Spotify Premium 1 Bulan Privat', 'SPOT-1M-PRV', 30000, 22000, 10, TRUE)
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- Kredensial Sampel (Akun Netflix Siap Pakai)
INSERT INTO product_credentials (id, variant_id, transaction_id, secret_payload, is_redeemed) VALUES
('cred-1', 'var-nflx-1bln', NULL, 'Email: streamvip01@gmail.com | Pass: RahasiaVip2026 | Pin: 1234', FALSE),
('cred-2', 'var-nflx-1bln', NULL, 'Email: streamvip02@gmail.com | Pass: RahasiaVip2026 | Pin: 5678', FALSE),
('cred-3', 'var-spot-1bln', NULL, 'Voucher Code: SPOT-IND-9921-XKQ8', FALSE)
ON DUPLICATE KEY UPDATE secret_payload=VALUES(secret_payload);

-- ------------------------------------------------------------
-- TAMBAHAN SEEDER v1.1 (melengkapi tiap kategori agar tab tidak kosong saat demo)
-- ------------------------------------------------------------
INSERT INTO products (id, category_id, name, slug, provider_code, input_type, thumbnail_url, is_active) VALUES
('prod-genshin', 'cat-game', 'Genshin Impact', 'genshin-impact', 'HOYOVERSE', 'user_id_zone', 'assets/img/products/genshin-impact.svg', TRUE),
('prod-tri', 'cat-pulsa', 'Tri (3) Data & Pulsa', 'tri-data', 'TRI', 'phone_number', 'assets/img/products/tri-data.svg', TRUE),
('prod-gplay', 'cat-voucher', 'Google Play Gift Card', 'google-play', 'GOOGLE', 'contact_only', 'assets/img/products/google-play.svg', TRUE),
('prod-pln', 'cat-pajak', 'Token Listrik PLN', 'pln-token', 'PLN', 'account_id', 'assets/img/products/pln-token.svg', TRUE)
ON DUPLICATE KEY UPDATE name=VALUES(name);

INSERT INTO product_variants (id, product_id, name, sku_code, original_price, selling_price, stock, is_active) VALUES
('var-gi-60', 'prod-genshin', '60 Genesis Crystals', 'GI-60GC', 16000, 15000, 999, TRUE),
('var-gi-330', 'prod-genshin', '330 Genesis Crystals', 'GI-330GC', 79000, 75000, 999, TRUE),
('var-gi-welkin', 'prod-genshin', 'Blessing of the Welkin Moon', 'GI-WELKIN', 79000, 72000, 999, TRUE),
('var-tri-pulsa10', 'prod-tri', 'Pulsa 10.000', 'TRI-P10', 12000, 11000, 999, TRUE),
('var-tri-5gb', 'prod-tri', 'Kuota 5 GB 30 Hari', 'TRI-5GB', 25000, 22000, 999, TRUE),
('var-gp-50', 'prod-gplay', 'Gift Card Rp 50.000', 'GP-50K', 52000, 52000, 20, TRUE),
('var-gp-100', 'prod-gplay', 'Gift Card Rp 100.000', 'GP-100K', 102000, 102000, 0, TRUE),
('var-pln-20', 'prod-pln', 'Token 20.000', 'PLN-20K', 22500, 22500, 999, TRUE),
('var-pln-50', 'prod-pln', 'Token 50.000', 'PLN-50K', 52500, 52500, 999, TRUE),
('var-pln-100', 'prod-pln', 'Token 100.000', 'PLN-100K', 102500, 102500, 999, TRUE)
ON DUPLICATE KEY UPDATE name=VALUES(name);

INSERT INTO product_credentials (id, variant_id, transaction_id, secret_payload, is_redeemed) VALUES
('cred-4', 'var-gp-50', NULL, 'Voucher Code: GPLAY-50K-7QX2-LM91', FALSE)
ON DUPLICATE KEY UPDATE secret_payload=VALUES(secret_payload);


-- ------------------------------------------------------------
-- TAMBAHAN SEEDER v2.0 (katalog diperluas: lebih banyak produk & varian per kategori)
-- ------------------------------------------------------------
INSERT INTO products (id, category_id, name, slug, provider_code, input_type, thumbnail_url, is_active) VALUES
('prod-pubg', 'cat-game', 'PUBG Mobile', 'pubg-mobile', 'KRAFTON', 'user_id', 'assets/img/products/pubg-mobile.svg', TRUE),
('prod-hok', 'cat-game', 'Honor of Kings', 'honor-of-kings', 'TIMI', 'user_id', 'assets/img/products/honor-of-kings.svg', TRUE),
('prod-roblox', 'cat-game', 'Roblox', 'roblox', 'ROBLOX', 'account_id', 'assets/img/products/roblox.svg', TRUE),
('prod-valorant', 'cat-game', 'Valorant', 'valorant', 'RIOT', 'account_id', 'assets/img/products/valorant.svg', TRUE),
('prod-xl', 'cat-pulsa', 'XL Axiata Data & Pulsa', 'xl-axiata', 'XL', 'phone_number', 'assets/img/products/xl-axiata.svg', TRUE),
('prod-indosat', 'cat-pulsa', 'Indosat IM3 Data & Pulsa', 'indosat-im3', 'INDOSAT', 'phone_number', 'assets/img/products/indosat-im3.svg', TRUE),
('prod-byu', 'cat-pulsa', 'by.U Paket Data', 'byu-data', 'BYU', 'phone_number', 'assets/img/products/byu-data.svg', TRUE),
('prod-smartfren', 'cat-pulsa', 'Smartfren Unlimited', 'smartfren', 'SMARTFREN', 'phone_number', 'assets/img/products/smartfren.svg', TRUE),
('prod-youtube', 'cat-app', 'YouTube Premium', 'youtube-premium', 'GOOGLE', 'contact_only', 'assets/img/products/youtube-premium.svg', TRUE),
('prod-disney', 'cat-app', 'Disney+ Hotstar', 'disney-hotstar', 'DISNEY', 'contact_only', 'assets/img/products/disney-hotstar.svg', TRUE),
('prod-canva', 'cat-app', 'Canva Pro', 'canva-pro', 'CANVA', 'contact_only', 'assets/img/products/canva-pro.svg', TRUE),
('prod-capcut', 'cat-app', 'CapCut Pro', 'capcut-pro', 'BYTEDANCE', 'contact_only', 'assets/img/products/capcut-pro.svg', TRUE),
('prod-vidio', 'cat-app', 'Vidio Platinum', 'vidio-platinum', 'VIDIO', 'contact_only', 'assets/img/products/vidio-platinum.svg', TRUE),
('prod-steam', 'cat-voucher', 'Steam Wallet Code', 'steam-wallet', 'VALVE', 'contact_only', 'assets/img/products/steam-wallet.svg', TRUE),
('prod-psn', 'cat-voucher', 'PlayStation Store Voucher', 'playstation-store', 'SONY', 'contact_only', 'assets/img/products/playstation-store.svg', TRUE),
('prod-razer', 'cat-voucher', 'Razer Gold', 'razer-gold', 'RAZER', 'contact_only', 'assets/img/products/razer-gold.svg', TRUE),
('prod-apple', 'cat-voucher', 'Apple Gift Card', 'apple-gift-card', 'APPLE', 'contact_only', 'assets/img/products/apple-gift-card.svg', TRUE),
('prod-pdam', 'cat-pajak', 'PDAM Tagihan Air', 'pdam-air', 'PDAM', 'account_id', 'assets/img/products/pdam-air.svg', TRUE),
('prod-bpjs', 'cat-pajak', 'BPJS Kesehatan', 'bpjs-kesehatan', 'BPJS', 'account_id', 'assets/img/products/bpjs-kesehatan.svg', TRUE),
('prod-indihome', 'cat-pajak', 'Tagihan IndiHome', 'indihome', 'TELKOM', 'account_id', 'assets/img/products/indihome.svg', TRUE)
ON DUPLICATE KEY UPDATE name=VALUES(name);

INSERT INTO product_variants (id, product_id, name, sku_code, original_price, selling_price, stock, is_active) VALUES
('var-ml-257', 'prod-mlbb', '257 Diamonds', 'ML-257DM', 66000, 58000, 999, TRUE),
('var-ml-344', 'prod-mlbb', '344 Diamonds', 'ML-344DM', 88000, 77500, 999, TRUE),
('var-ff-355', 'prod-ff', '355 Diamonds', 'FF-355DM', 50000, 45000, 999, TRUE),
('var-ff-week', 'prod-ff', 'Member Mingguan', 'FF-WEEK', 32000, 29000, 999, TRUE),
('var-pubg-60', 'prod-pubg', '60 UC', 'PUBG-60UC', 16000, 15000, 999, TRUE),
('var-pubg-325', 'prod-pubg', '325 UC', 'PUBG-325UC', 80000, 74000, 999, TRUE),
('var-pubg-660', 'prod-pubg', '660 UC', 'PUBG-660UC', 160000, 148000, 999, TRUE),
('var-hok-80', 'prod-hok', '80 Tokens', 'HOK-80T', 16500, 15000, 999, TRUE),
('var-hok-240', 'prod-hok', '240 Tokens', 'HOK-240T', 48000, 44000, 999, TRUE),
('var-rbx-80', 'prod-roblox', '80 Robux', 'RBX-80', 16500, 15500, 999, TRUE),
('var-rbx-400', 'prod-roblox', '400 Robux', 'RBX-400', 80000, 75000, 999, TRUE),
('var-val-475', 'prod-valorant', '475 VP', 'VAL-475', 60000, 55000, 999, TRUE),
('var-val-1000', 'prod-valorant', '1.000 VP', 'VAL-1000', 120000, 112000, 999, TRUE),
('var-tks-p25', 'prod-tksel', 'Pulsa 25.000', 'TKS-P25', 27500, 26500, 999, TRUE),
('var-tks-25gb', 'prod-tksel', 'Kuota 25 GB 30 Hari', 'TKS-25GB', 85000, 78000, 999, TRUE),
('var-xl-p10', 'prod-xl', 'Pulsa 10.000', 'XL-P10', 12000, 11500, 999, TRUE),
('var-xl-15gb', 'prod-xl', 'Kuota 15 GB 30 Hari', 'XL-15GB', 60000, 55000, 999, TRUE),
('var-im3-p20', 'prod-indosat', 'Pulsa 20.000', 'IM3-P20', 22000, 21500, 999, TRUE),
('var-im3-20gb', 'prod-indosat', 'Kuota 20 GB 30 Hari', 'IM3-20GB', 75000, 70000, 999, TRUE),
('var-byu-10gb', 'prod-byu', 'Kuota 10 GB 30 Hari', 'BYU-10GB', 28000, 25000, 999, TRUE),
('var-sf-20gb', 'prod-smartfren', 'Kuota 20 GB 30 Hari', 'SF-20GB', 55000, 50000, 999, TRUE),
('var-yt-1bln', 'prod-youtube', 'YouTube Premium 1 Bulan', 'YT-1M', 25000, 18000, 3, TRUE),
('var-dis-1bln', 'prod-disney', 'Disney+ Hotstar 1 Bulan Mobile', 'DIS-1M', 40000, 30000, 3, TRUE),
('var-cv-1bln', 'prod-canva', 'Canva Pro 1 Bulan', 'CV-1M', 25000, 15000, 3, TRUE),
('var-cc-1bln', 'prod-capcut', 'CapCut Pro 1 Bulan', 'CC-1M', 35000, 25000, 3, TRUE),
('var-vd-1bln', 'prod-vidio', 'Vidio Platinum 1 Bulan', 'VD-1M', 30000, 22000, 3, TRUE),
('var-stm-60', 'prod-steam', 'Steam Wallet Rp 60.000', 'STM-60K', 62000, 62000, 3, TRUE),
('var-psn-100', 'prod-psn', 'Voucher Rp 100.000', 'PSN-100K', 103000, 103000, 3, TRUE),
('var-rzr-50', 'prod-razer', 'Razer Gold Rp 50.000', 'RZR-50K', 52000, 52000, 3, TRUE),
('var-apl-100', 'prod-apple', 'Gift Card Rp 100.000', 'APL-100K', 105000, 105000, 3, TRUE),
('var-pdam-50', 'prod-pdam', 'Tagihan Rp 50.000', 'PDAM-50K', 52500, 52500, 999, TRUE),
('var-pdam-100', 'prod-pdam', 'Tagihan Rp 100.000', 'PDAM-100K', 102500, 102500, 999, TRUE),
('var-bpjs-k3', 'prod-bpjs', 'Iuran Kelas 3 (1 Bulan)', 'BPJS-K3', 37500, 37500, 999, TRUE),
('var-ih-100', 'prod-indihome', 'Tagihan Rp 100.000', 'IH-100K', 102500, 102500, 999, TRUE),
('var-ih-300', 'prod-indihome', 'Tagihan Rp 300.000', 'IH-300K', 302500, 302500, 999, TRUE)
ON DUPLICATE KEY UPDATE name=VALUES(name);

INSERT INTO product_credentials (id, variant_id, transaction_id, secret_payload, is_redeemed) VALUES
('cred-10', 'var-yt-1bln', NULL, 'Kode/Akun Demo: YT-1-DEMO-0007', FALSE),
('cred-11', 'var-yt-1bln', NULL, 'Kode/Akun Demo: YT-2-DEMO-0014', FALSE),
('cred-12', 'var-yt-1bln', NULL, 'Kode/Akun Demo: YT-3-DEMO-0021', FALSE),
('cred-13', 'var-dis-1bln', NULL, 'Kode/Akun Demo: DIS-1-DEMO-0007', FALSE),
('cred-14', 'var-dis-1bln', NULL, 'Kode/Akun Demo: DIS-2-DEMO-0014', FALSE),
('cred-15', 'var-dis-1bln', NULL, 'Kode/Akun Demo: DIS-3-DEMO-0021', FALSE),
('cred-16', 'var-cv-1bln', NULL, 'Kode/Akun Demo: CANVA-1-DEMO-0007', FALSE),
('cred-17', 'var-cv-1bln', NULL, 'Kode/Akun Demo: CANVA-2-DEMO-0014', FALSE),
('cred-18', 'var-cv-1bln', NULL, 'Kode/Akun Demo: CANVA-3-DEMO-0021', FALSE),
('cred-19', 'var-cc-1bln', NULL, 'Kode/Akun Demo: CAPCUT-1-DEMO-0007', FALSE),
('cred-20', 'var-cc-1bln', NULL, 'Kode/Akun Demo: CAPCUT-2-DEMO-0014', FALSE),
('cred-21', 'var-cc-1bln', NULL, 'Kode/Akun Demo: CAPCUT-3-DEMO-0021', FALSE),
('cred-22', 'var-vd-1bln', NULL, 'Kode/Akun Demo: VIDIO-1-DEMO-0007', FALSE),
('cred-23', 'var-vd-1bln', NULL, 'Kode/Akun Demo: VIDIO-2-DEMO-0014', FALSE),
('cred-24', 'var-vd-1bln', NULL, 'Kode/Akun Demo: VIDIO-3-DEMO-0021', FALSE),
('cred-25', 'var-stm-60', NULL, 'Kode/Akun Demo: STEAM-1-DEMO-0007', FALSE),
('cred-26', 'var-stm-60', NULL, 'Kode/Akun Demo: STEAM-2-DEMO-0014', FALSE),
('cred-27', 'var-stm-60', NULL, 'Kode/Akun Demo: STEAM-3-DEMO-0021', FALSE),
('cred-28', 'var-psn-100', NULL, 'Kode/Akun Demo: PSN-1-DEMO-0007', FALSE),
('cred-29', 'var-psn-100', NULL, 'Kode/Akun Demo: PSN-2-DEMO-0014', FALSE),
('cred-30', 'var-psn-100', NULL, 'Kode/Akun Demo: PSN-3-DEMO-0021', FALSE),
('cred-31', 'var-rzr-50', NULL, 'Kode/Akun Demo: RAZER-1-DEMO-0007', FALSE),
('cred-32', 'var-rzr-50', NULL, 'Kode/Akun Demo: RAZER-2-DEMO-0014', FALSE),
('cred-33', 'var-rzr-50', NULL, 'Kode/Akun Demo: RAZER-3-DEMO-0021', FALSE),
('cred-34', 'var-apl-100', NULL, 'Kode/Akun Demo: APPLE-1-DEMO-0007', FALSE),
('cred-35', 'var-apl-100', NULL, 'Kode/Akun Demo: APPLE-2-DEMO-0014', FALSE),
('cred-36', 'var-apl-100', NULL, 'Kode/Akun Demo: APPLE-3-DEMO-0021', FALSE)
ON DUPLICATE KEY UPDATE secret_payload=VALUES(secret_payload);


-- Users
INSERT INTO users (id, name, email, password, role) VALUES
('usr-cust-01', 'Rifqi Customer', 'rifqi@customer.com', 'password123', 'customer'),
('usr-admin-01', 'Mari Admin', 'mari@admin.com', 'admin123', 'admin')
ON DUPLICATE KEY UPDATE name=VALUES(name);
