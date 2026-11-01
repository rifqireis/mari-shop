-- ============================================================
-- SKEMA BASIS DATA E-COMMERCE TOP-UP & DIGITAL GOODS
-- TUGAS BESAR PENGANTAR BASIS DATA (KELAS A1)
-- ============================================================

CREATE DATABASE IF NOT EXISTS db_ecommerce_topup;
USE db_ecommerce_topup;

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
('prod-mlbb', 'cat-game', 'Mobile Legends: Bang Bang', 'mobile-legends', 'MOONTON', 'user_id_zone', 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=200&h=200&fit=crop', TRUE),
('prod-ff', 'cat-game', 'Free Fire MAX', 'free-fire', 'GARENA', 'user_id', 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=200&h=200&fit=crop', TRUE),
('prod-tksel', 'cat-pulsa', 'Telkomsel Data & Pulsa', 'telkomsel', 'TELKOMSEL', 'phone_number', 'https://images.unsplash.com/photo-1563770660941-20978e870e26?w=200&h=200&fit=crop', TRUE),
('prod-netflix', 'cat-app', 'Netflix Premium 4K UHD', 'netflix-premium', 'NETFLIX', 'contact_only', 'https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?w=200&h=200&fit=crop', TRUE),
('prod-spotify', 'cat-app', 'Spotify Individual Premium', 'spotify-premium', 'SPOTIFY', 'contact_only', 'https://images.unsplash.com/photo-1614680376593-902f749f7ffc?w=200&h=200&fit=crop', TRUE)
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
