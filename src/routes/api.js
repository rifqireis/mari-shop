const express = require('express');
const router = express.Router();
const { pool } = require('../config/db');

// Fallback Mock Data (Agar Frontend bisa dites seketika meskipun MySQL belum dinyalakan)
// CATATAN: data ini DICERMINKAN dari seeder database/schema.sql supaya tampilan sama di kedua mode.
const MOCK_CATEGORIES = [
  { id: 'cat-game', name: 'Game Populer', slug: 'game', icon_url: '🎮' },
  { id: 'cat-pulsa', name: 'Pulsa & Kuota', slug: 'pulsa-kuota', icon_url: '📱' },
  { id: 'cat-app', name: 'Aplikasi Premium', slug: 'app-premium', icon_url: '🎬' },
  { id: 'cat-voucher', name: 'Voucher & Kado', slug: 'voucher', icon_url: '🎟️' },
  { id: 'cat-pajak', name: 'Pajak & Tagihan PPOB', slug: 'tagihan-ppob', icon_url: '⚡' }
];

const mkProd = (id, cat, name, slug, provider, input) => {
  const c = MOCK_CATEGORIES.find(x => x.id === cat);
  return {
    id, category_id: cat, category_name: c.name, category_slug: c.slug,
    name, slug, provider_code: provider, input_type: input,
    thumbnail_url: `assets/img/products/${slug}.svg`, is_active: 1
  };
};

const MOCK_PRODUCTS = [
  mkProd('prod-mlbb', 'cat-game', 'Mobile Legends: Bang Bang', 'mobile-legends', 'MOONTON', 'user_id_zone'),
  mkProd('prod-ff', 'cat-game', 'Free Fire MAX', 'free-fire', 'GARENA', 'user_id'),
  mkProd('prod-genshin', 'cat-game', 'Genshin Impact', 'genshin-impact', 'HOYOVERSE', 'user_id_zone'),
  mkProd('prod-pubg', 'cat-game', 'PUBG Mobile', 'pubg-mobile', 'KRAFTON', 'user_id'),
  mkProd('prod-hok', 'cat-game', 'Honor of Kings', 'honor-of-kings', 'TIMI', 'user_id'),
  mkProd('prod-roblox', 'cat-game', 'Roblox', 'roblox', 'ROBLOX', 'account_id'),
  mkProd('prod-valorant', 'cat-game', 'Valorant', 'valorant', 'RIOT', 'account_id'),
  mkProd('prod-tksel', 'cat-pulsa', 'Telkomsel Data & Pulsa', 'telkomsel', 'TELKOMSEL', 'phone_number'),
  mkProd('prod-tri', 'cat-pulsa', 'Tri (3) Data & Pulsa', 'tri-data', 'TRI', 'phone_number'),
  mkProd('prod-xl', 'cat-pulsa', 'XL Axiata Data & Pulsa', 'xl-axiata', 'XL', 'phone_number'),
  mkProd('prod-indosat', 'cat-pulsa', 'Indosat IM3 Data & Pulsa', 'indosat-im3', 'INDOSAT', 'phone_number'),
  mkProd('prod-byu', 'cat-pulsa', 'by.U Paket Data', 'byu-data', 'BYU', 'phone_number'),
  mkProd('prod-smartfren', 'cat-pulsa', 'Smartfren Unlimited', 'smartfren', 'SMARTFREN', 'phone_number'),
  mkProd('prod-netflix', 'cat-app', 'Netflix Premium 4K UHD', 'netflix-premium', 'NETFLIX', 'contact_only'),
  mkProd('prod-spotify', 'cat-app', 'Spotify Individual Premium', 'spotify-premium', 'SPOTIFY', 'contact_only'),
  mkProd('prod-youtube', 'cat-app', 'YouTube Premium', 'youtube-premium', 'GOOGLE', 'contact_only'),
  mkProd('prod-disney', 'cat-app', 'Disney+ Hotstar', 'disney-hotstar', 'DISNEY', 'contact_only'),
  mkProd('prod-canva', 'cat-app', 'Canva Pro', 'canva-pro', 'CANVA', 'contact_only'),
  mkProd('prod-capcut', 'cat-app', 'CapCut Pro', 'capcut-pro', 'BYTEDANCE', 'contact_only'),
  mkProd('prod-vidio', 'cat-app', 'Vidio Platinum', 'vidio-platinum', 'VIDIO', 'contact_only'),
  mkProd('prod-gplay', 'cat-voucher', 'Google Play Gift Card', 'google-play', 'GOOGLE', 'contact_only'),
  mkProd('prod-steam', 'cat-voucher', 'Steam Wallet Code', 'steam-wallet', 'VALVE', 'contact_only'),
  mkProd('prod-psn', 'cat-voucher', 'PlayStation Store Voucher', 'playstation-store', 'SONY', 'contact_only'),
  mkProd('prod-razer', 'cat-voucher', 'Razer Gold', 'razer-gold', 'RAZER', 'contact_only'),
  mkProd('prod-apple', 'cat-voucher', 'Apple Gift Card', 'apple-gift-card', 'APPLE', 'contact_only'),
  mkProd('prod-pln', 'cat-pajak', 'Token Listrik PLN', 'pln-token', 'PLN', 'account_id'),
  mkProd('prod-pdam', 'cat-pajak', 'PDAM Tagihan Air', 'pdam-air', 'PDAM', 'account_id'),
  mkProd('prod-bpjs', 'cat-pajak', 'BPJS Kesehatan', 'bpjs-kesehatan', 'BPJS', 'account_id'),
  mkProd('prod-indihome', 'cat-pajak', 'Tagihan IndiHome', 'indihome', 'TELKOM', 'account_id')
];

const mkVar = (id, name, sku, sell, orig, stock) =>
  ({ id, name, sku_code: sku, selling_price: sell, original_price: orig, stock, is_active: 1 });

const MOCK_VARIANTS = {
  'mobile-legends': [
    mkVar('var-ml-86', '86 Diamonds', 'ML-86DM', 19500, 22000, 999),
    mkVar('var-ml-pass', 'Weekly Diamond Pass', 'ML-WDP', 28000, 32000, 999),
    mkVar('var-ml-172', '172 Diamonds', 'ML-172DM', 39000, 44000, 999),
    mkVar('var-ml-257', '257 Diamonds', 'ML-257DM', 58000, 66000, 999),
    mkVar('var-ml-344', '344 Diamonds', 'ML-344DM', 77500, 88000, 999)
  ],
  'free-fire': [
    mkVar('var-ff-140', '140 Diamonds', 'FF-140DM', 18000, 20000, 999),
    mkVar('var-ff-355', '355 Diamonds', 'FF-355DM', 45000, 50000, 999),
    mkVar('var-ff-week', 'Member Mingguan', 'FF-WEEK', 29000, 32000, 999)
  ],
  'genshin-impact': [
    mkVar('var-gi-60', '60 Genesis Crystals', 'GI-60GC', 15000, 16000, 999),
    mkVar('var-gi-330', '330 Genesis Crystals', 'GI-330GC', 75000, 79000, 999),
    mkVar('var-gi-welkin', 'Blessing of the Welkin Moon', 'GI-WELKIN', 72000, 79000, 999)
  ],
  'pubg-mobile': [
    mkVar('var-pubg-60', '60 UC', 'PUBG-60UC', 15000, 16000, 999),
    mkVar('var-pubg-325', '325 UC', 'PUBG-325UC', 74000, 80000, 999),
    mkVar('var-pubg-660', '660 UC', 'PUBG-660UC', 148000, 160000, 999)
  ],
  'honor-of-kings': [
    mkVar('var-hok-80', '80 Tokens', 'HOK-80T', 15000, 16500, 999),
    mkVar('var-hok-240', '240 Tokens', 'HOK-240T', 44000, 48000, 999)
  ],
  'roblox': [
    mkVar('var-rbx-80', '80 Robux', 'RBX-80', 15500, 16500, 999),
    mkVar('var-rbx-400', '400 Robux', 'RBX-400', 75000, 80000, 999)
  ],
  'valorant': [
    mkVar('var-val-475', '475 VP', 'VAL-475', 55000, 60000, 999),
    mkVar('var-val-1000', '1.000 VP', 'VAL-1000', 112000, 120000, 999)
  ],
  'telkomsel': [
    mkVar('var-tks-10gb', 'Kuota 10 GB 30 Hari', 'TKS-10GB', 42000, 45000, 999),
    mkVar('var-tks-p25', 'Pulsa 25.000', 'TKS-P25', 26500, 27500, 999),
    mkVar('var-tks-25gb', 'Kuota 25 GB 30 Hari', 'TKS-25GB', 78000, 85000, 999)
  ],
  'tri-data': [
    mkVar('var-tri-pulsa10', 'Pulsa 10.000', 'TRI-P10', 11000, 12000, 999),
    mkVar('var-tri-5gb', 'Kuota 5 GB 30 Hari', 'TRI-5GB', 22000, 25000, 999)
  ],
  'xl-axiata': [
    mkVar('var-xl-p10', 'Pulsa 10.000', 'XL-P10', 11500, 12000, 999),
    mkVar('var-xl-15gb', 'Kuota 15 GB 30 Hari', 'XL-15GB', 55000, 60000, 999)
  ],
  'indosat-im3': [
    mkVar('var-im3-p20', 'Pulsa 20.000', 'IM3-P20', 21500, 22000, 999),
    mkVar('var-im3-20gb', 'Kuota 20 GB 30 Hari', 'IM3-20GB', 70000, 75000, 999)
  ],
  'byu-data': [
    mkVar('var-byu-10gb', 'Kuota 10 GB 30 Hari', 'BYU-10GB', 25000, 28000, 999)
  ],
  'smartfren': [
    mkVar('var-sf-20gb', 'Kuota 20 GB 30 Hari', 'SF-20GB', 50000, 55000, 999)
  ],
  'netflix-premium': [
    mkVar('var-nflx-1bln', 'Akun Netflix 1 Bulan (1 Profil)', 'NFLX-1M-SHR', 35000, 45000, 5)
  ],
  'spotify-premium': [
    mkVar('var-spot-1bln', 'Spotify Premium 1 Bulan Privat', 'SPOT-1M-PRV', 22000, 30000, 10)
  ],
  'youtube-premium': [
    mkVar('var-yt-1bln', 'YouTube Premium 1 Bulan', 'YT-1M', 18000, 25000, 3)
  ],
  'disney-hotstar': [
    mkVar('var-dis-1bln', 'Disney+ Hotstar 1 Bulan Mobile', 'DIS-1M', 30000, 40000, 3)
  ],
  'canva-pro': [
    mkVar('var-cv-1bln', 'Canva Pro 1 Bulan', 'CV-1M', 15000, 25000, 3)
  ],
  'capcut-pro': [
    mkVar('var-cc-1bln', 'CapCut Pro 1 Bulan', 'CC-1M', 25000, 35000, 3)
  ],
  'vidio-platinum': [
    mkVar('var-vd-1bln', 'Vidio Platinum 1 Bulan', 'VD-1M', 22000, 30000, 3)
  ],
  'google-play': [
    mkVar('var-gp-50', 'Gift Card Rp 50.000', 'GP-50K', 52000, 52000, 20),
    mkVar('var-gp-100', 'Gift Card Rp 100.000', 'GP-100K', 102000, 102000, 0)
  ],
  'steam-wallet': [
    mkVar('var-stm-60', 'Steam Wallet Rp 60.000', 'STM-60K', 62000, 62000, 3)
  ],
  'playstation-store': [
    mkVar('var-psn-100', 'Voucher Rp 100.000', 'PSN-100K', 103000, 103000, 3)
  ],
  'razer-gold': [
    mkVar('var-rzr-50', 'Razer Gold Rp 50.000', 'RZR-50K', 52000, 52000, 3)
  ],
  'apple-gift-card': [
    mkVar('var-apl-100', 'Gift Card Rp 100.000', 'APL-100K', 105000, 105000, 3)
  ],
  'pln-token': [
    mkVar('var-pln-20', 'Token 20.000', 'PLN-20K', 22500, 22500, 999),
    mkVar('var-pln-50', 'Token 50.000', 'PLN-50K', 52500, 52500, 999),
    mkVar('var-pln-100', 'Token 100.000', 'PLN-100K', 102500, 102500, 999)
  ],
  'pdam-air': [
    mkVar('var-pdam-50', 'Tagihan Rp 50.000', 'PDAM-50K', 52500, 52500, 999),
    mkVar('var-pdam-100', 'Tagihan Rp 100.000', 'PDAM-100K', 102500, 102500, 999)
  ],
  'bpjs-kesehatan': [
    mkVar('var-bpjs-k3', 'Iuran Kelas 3 (1 Bulan)', 'BPJS-K3', 37500, 37500, 999)
  ],
  'indihome': [
    mkVar('var-ih-100', 'Tagihan Rp 100.000', 'IH-100K', 102500, 102500, 999),
    mkVar('var-ih-300', 'Tagihan Rp 300.000', 'IH-300K', 302500, 302500, 999)
  ]
};

// Lengkapi data produk mock: harga mulai & total stok (sama seperti hasil query MySQL)
MOCK_PRODUCTS.forEach(p => {
  const vs = MOCK_VARIANTS[p.slug] || [];
  p.min_price = vs.length ? Math.min(...vs.map(v => v.selling_price)) : null;
  p.total_stock = vs.reduce((n, v) => n + v.stock, 0);
});

const findMockVariant = (id) => {
  for (const prod of MOCK_PRODUCTS) {
    const v = (MOCK_VARIANTS[prod.slug] || []).find(x => x.id === id);
    if (v) return { variant: v, product: prod };
  }
  return null;
};

// Stok kredensial untuk produk akun/voucher (mode mock)
const MOCK_CREDENTIALS = {
  'var-nflx-1bln': ['Email: streamvip01@gmail.com | Pass: RahasiaVip2026 | Pin: 1234', 'Email: streamvip02@gmail.com | Pass: RahasiaVip2026 | Pin: 5678'],
  'var-spot-1bln': ['Voucher Code: SPOT-IND-9921-XKQ8'],
  'var-gp-50': ['Voucher Code: GPLAY-50K-7QX2-LM91'],
  'var-yt-1bln': ['Kode/Akun Demo: YT-1-DEMO-0007', 'Kode/Akun Demo: YT-2-DEMO-0014', 'Kode/Akun Demo: YT-3-DEMO-0021'],
  'var-dis-1bln': ['Kode/Akun Demo: DIS-1-DEMO-0007', 'Kode/Akun Demo: DIS-2-DEMO-0014', 'Kode/Akun Demo: DIS-3-DEMO-0021'],
  'var-cv-1bln': ['Kode/Akun Demo: CANVA-1-DEMO-0007', 'Kode/Akun Demo: CANVA-2-DEMO-0014', 'Kode/Akun Demo: CANVA-3-DEMO-0021'],
  'var-cc-1bln': ['Kode/Akun Demo: CAPCUT-1-DEMO-0007', 'Kode/Akun Demo: CAPCUT-2-DEMO-0014', 'Kode/Akun Demo: CAPCUT-3-DEMO-0021'],
  'var-vd-1bln': ['Kode/Akun Demo: VIDIO-1-DEMO-0007', 'Kode/Akun Demo: VIDIO-2-DEMO-0014', 'Kode/Akun Demo: VIDIO-3-DEMO-0021'],
  'var-stm-60': ['Kode/Akun Demo: STEAM-1-DEMO-0007', 'Kode/Akun Demo: STEAM-2-DEMO-0014', 'Kode/Akun Demo: STEAM-3-DEMO-0021'],
  'var-psn-100': ['Kode/Akun Demo: PSN-1-DEMO-0007', 'Kode/Akun Demo: PSN-2-DEMO-0014', 'Kode/Akun Demo: PSN-3-DEMO-0021'],
  'var-rzr-50': ['Kode/Akun Demo: RAZER-1-DEMO-0007', 'Kode/Akun Demo: RAZER-2-DEMO-0014', 'Kode/Akun Demo: RAZER-3-DEMO-0021'],
  'var-apl-100': ['Kode/Akun Demo: APPLE-1-DEMO-0007', 'Kode/Akun Demo: APPLE-2-DEMO-0014', 'Kode/Akun Demo: APPLE-3-DEMO-0021']
};

const MOCK_PAYMENTS = [
  { id: 'qris', name: 'QRIS (Semua E-Wallet / Bank)', type: 'qris', fee_flat: 0, fee_percentage: '0.70' },
  { id: 'bca_va', name: 'BCA Virtual Account', type: 'virtual_account', fee_flat: 2500, fee_percentage: '0.00' },
  { id: 'bri_va', name: 'BRI Virtual Account', type: 'virtual_account', fee_flat: 2000, fee_percentage: '0.00' },
  { id: 'dana', name: 'DANA E-Wallet', type: 'ewallet', fee_flat: 1000, fee_percentage: '0.00' },
  { id: 'gopay', name: 'GoPay', type: 'ewallet', fee_flat: 1000, fee_percentage: '0.00' }
];

// Memory store untuk simulasi transaksi offline sebelum DB terhubung
const memoryTransactions = new Map();

// 1. GET /api/categories
router.get('/categories', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM categories ORDER BY name ASC');
    return res.json({ success: true, source: 'mysql', data: rows });
  } catch (err) {
    return res.json({ success: true, source: 'mock_fallback', data: MOCK_CATEGORIES });
  }
});

// 2. GET /api/products (Bisa filter ?category=cat-game)
router.get('/products', async (req, res) => {
  const { category } = req.query;
  try {
    let sql = `
      SELECT p.*, c.name AS category_name, c.slug AS category_slug,
        (SELECT MIN(v.selling_price) FROM product_variants v WHERE v.product_id = p.id AND v.is_active = TRUE) AS min_price,
        (SELECT COALESCE(SUM(v.stock), 0) FROM product_variants v WHERE v.product_id = p.id AND v.is_active = TRUE) AS total_stock
      FROM products p
      JOIN categories c ON p.category_id = c.id
      WHERE p.is_active = TRUE
    `;
    const params = [];
    if (category) {
      sql += ' AND (p.category_id = ? OR c.slug = ?)';
      params.push(category, category);
    }
    sql += ' ORDER BY p.name ASC';
    const [rows] = await pool.query(sql, params);
    return res.json({ success: true, source: 'mysql', data: rows });
  } catch (err) {
    let filtered = MOCK_PRODUCTS;
    if (category) {
      filtered = MOCK_PRODUCTS.filter(p => p.category_id === category || p.category_slug === category);
    }
    return res.json({ success: true, source: 'mock_fallback', data: filtered });
  }
});

// 3. GET /api/products/:slug (Detail produk + variannya)
router.get('/products/:slug', async (req, res) => {
  const { slug } = req.params;
  try {
    const [productRows] = await pool.query(`
      SELECT p.*, c.name AS category_name, c.slug AS category_slug
      FROM products p
      JOIN categories c ON p.category_id = c.id
      WHERE p.slug = ? AND p.is_active = TRUE
      LIMIT 1
    `, [slug]);

    if (productRows.length === 0) {
      return res.status(404).json({ success: false, message: 'Produk tidak ditemukan' });
    }

    const product = productRows[0];
    const [variantRows] = await pool.query(`
      SELECT * FROM product_variants
      WHERE product_id = ? AND is_active = TRUE
      ORDER BY selling_price ASC
    `, [product.id]);

    return res.json({
      success: true,
      source: 'mysql',
      data: {
        ...product,
        variants: variantRows
      }
    });
  } catch (err) {
    const prod = MOCK_PRODUCTS.find(p => p.slug === slug);
    if (!prod) {
      return res.status(404).json({ success: false, message: 'Produk tidak ditemukan (mock)' });
    }
    const variants = MOCK_VARIANTS[slug] || [
      { id: 'var-default-1', name: 'Paket Reguler', sku_code: `${slug.toUpperCase()}-01`, selling_price: 25000, original_price: 30000, stock: 100 }
    ];
    return res.json({
      success: true,
      source: 'mock_fallback',
      data: { ...prod, variants }
    });
  }
});

// 4. GET /api/payment-methods
router.get('/payment-methods', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM payment_methods WHERE is_active = TRUE');
    return res.json({ success: true, source: 'mysql', data: rows });
  } catch (err) {
    return res.json({ success: true, source: 'mock_fallback', data: MOCK_PAYMENTS });
  }
});

// 5. POST /api/orders (Buat pesanan baru)
router.post('/orders', async (req, res) => {
  const { variant_id, payment_method_id, target_account, target_zone, contact } = req.body;

  if (!variant_id || !payment_method_id || !target_account) {
    return res.status(400).json({ success: false, message: 'Harap lengkapi semua field pesanan' });
  }

  const invoiceId = `TRX-${Date.now().toString().slice(-6)}-${Math.floor(1000 + Math.random() * 9000)}`;

  try {
    // Ambil data varian & harga dari MySQL
    const [variants] = await pool.query('SELECT * FROM product_variants WHERE id = ?', [variant_id]);
    const [payments] = await pool.query('SELECT * FROM payment_methods WHERE id = ?', [payment_method_id]);

    if (variants.length === 0 || payments.length === 0) {
      return res.status(400).json({ success: false, message: 'Varian atau Metode Pembayaran tidak valid' });
    }

    const variant = variants[0];
    const payment = payments[0];
    if (!variant.is_active || Number(variant.stock) <= 0) {
      return res.status(400).json({ success: false, message: 'Stok varian ini sedang habis' });
    }
    const basePrice = Number(variant.selling_price);
    const feeFlat = Number(payment.fee_flat);
    const feePercent = (Number(payment.fee_percentage) / 100) * basePrice;
    const feeTotal = Math.round(feeFlat + feePercent);
    const totalAmount = basePrice + feeTotal;

    const paymentRef = payment.type === 'qris'
      ? '00020101021226680014ID.LINKAJA.WWW0118936009110021200005204581253033605802ID'
      : `8800${Math.floor(10000000 + Math.random() * 90000000)}`;

    await pool.query(`
      INSERT INTO transactions (
        id, variant_id, payment_method_id, target_account, target_zone,
        contact_email_or_phone, base_price, fee_amount, total_amount,
        payment_status, fulfillment_status, payment_reference
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'unpaid', 'pending', ?)
    `, [
      invoiceId, variant_id, payment_method_id, target_account, target_zone || null,
      contact || target_account, basePrice, feeTotal, totalAmount, paymentRef
    ]);

    return res.json({
      success: true,
      message: 'Pesanan berhasil dibuat',
      data: {
        invoice_id: invoiceId,
        total_amount: totalAmount,
        payment_method: payment.name,
        payment_reference: paymentRef,
        status: 'unpaid'
      }
    });
  } catch (err) {
    // Fallback simulation: pakai harga & fee SUNGGUHAN dari data mock (rumus sama dengan jalur MySQL)
    const found = findMockVariant(variant_id);
    const mockPay = MOCK_PAYMENTS.find(p => p.id === payment_method_id);
    if (!found || !mockPay) {
      return res.status(400).json({ success: false, message: 'Varian atau Metode Pembayaran tidak valid' });
    }
    if (found.variant.stock <= 0) {
      return res.status(400).json({ success: false, message: 'Stok varian ini sedang habis' });
    }
    const mBase = found.variant.selling_price;
    const mFee = Math.round(mockPay.fee_flat + (Number(mockPay.fee_percentage) / 100) * mBase);
    const mockOrder = {
      id: invoiceId,
      invoice_id: invoiceId,
      variant_id,
      product_name: found.product.name,
      variant_name: found.variant.name,
      payment_method_id,
      payment_method_name: mockPay.name,
      payment_type: mockPay.type,
      target_account,
      target_zone: target_zone || null,
      contact_email_or_phone: contact || target_account,
      base_price: mBase,
      fee_amount: mFee,
      total_amount: mBase + mFee,
      payment_reference: mockPay.type === 'qris'
        ? '00020101021226680014ID.LINKAJA.WWW0118936009110021200005204581253033605802ID'
        : `8800${Math.floor(10000000 + Math.random() * 90000000)}`,
      payment_status: 'unpaid',
      fulfillment_status: 'pending',
      credentials: null,
      created_at: new Date().toISOString()
    };
    memoryTransactions.set(invoiceId, mockOrder);

    return res.json({
      success: true,
      source: 'mock_fallback',
      message: 'Pesanan berhasil dibuat (Mode Simulasi)',
      data: mockOrder
    });
  }
});

// 6a. GET /api/orders?contact=08123... (Cek transaksi lewat WhatsApp/email)
router.get('/orders', async (req, res) => {
  const contact = String(req.query.contact || '').trim();
  if (contact.length < 5) {
    return res.status(400).json({ success: false, message: 'Masukkan nomor WhatsApp atau email yang valid' });
  }
  try {
    // Kredensial (akun/voucher) SENGAJA tidak ikut di daftar; hanya tampil di halaman invoice.
    const [rows] = await pool.query(`
      SELECT t.id, t.payment_status, t.fulfillment_status, t.total_amount, t.created_at,
             v.name AS variant_name, p.name AS product_name
      FROM transactions t
      JOIN product_variants v ON t.variant_id = v.id
      JOIN products p ON v.product_id = p.id
      WHERE t.contact_email_or_phone = ?
      ORDER BY t.created_at DESC
      LIMIT 20
    `, [contact]);
    return res.json({ success: true, source: 'mysql', data: rows });
  } catch (err) {
    const list = [...memoryTransactions.values()]
      .filter(o => o.contact_email_or_phone === contact)
      .reverse()
      .map(({ credentials, ...rest }) => rest);
    return res.json({ success: true, source: 'mock_fallback', data: list });
  }
});

// 6. GET /api/orders/:id (Cek status pesanan)
router.get('/orders/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await pool.query(`
      SELECT t.*, v.name AS variant_name, p.name AS product_name, pm.name AS payment_method_name, pm.type AS payment_type
      FROM transactions t
      JOIN product_variants v ON t.variant_id = v.id
      JOIN products p ON v.product_id = p.id
      JOIN payment_methods pm ON t.payment_method_id = pm.id
      WHERE t.id = ?
    `, [id]);

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Invoice tidak ditemukan' });
    }

    const order = rows[0];

    // Ambil kredensial jika akun premium dan sudah lunas
    let credentials = null;
    if (order.payment_status === 'paid') {
      const [credRows] = await pool.query(
        'SELECT secret_payload FROM product_credentials WHERE transaction_id = ? LIMIT 1',
        [order.id]
      );
      if (credRows.length > 0) {
        credentials = credRows[0].secret_payload;
      }
    }

    return res.json({
      success: true,
      source: 'mysql',
      data: {
        ...order,
        credentials
      }
    });
  } catch (err) {
    const memOrder = memoryTransactions.get(id);
    if (!memOrder) {
      return res.status(404).json({ success: false, message: 'Invoice tidak ditemukan (mock)' });
    }
    return res.json({ success: true, source: 'mock_fallback', data: memOrder });
  }
});

// 7. POST /api/orders/:id/pay (Simulasi Pelunasan Bayar untuk Keperluan Presentasi Demo)
router.post('/orders/:id/pay', async (req, res) => {
  const { id } = req.params;
  try {
    // Update status transaksi
    const [upd] = await pool.query(`
      UPDATE transactions
      SET payment_status = 'paid', fulfillment_status = 'success', paid_at = CURRENT_TIMESTAMP
      WHERE id = ? AND payment_status = 'unpaid'
    `, [id]);
    if (upd.affectedRows === 0) {
      // Sudah dibayar / expired / tidak ada: jangan ambil stok kredensial lagi
      return res.json({ success: true, message: 'Transaksi sudah diproses sebelumnya' });
    }

    // Cek apakah ada kredensial kosong untuk varian ini
    const [txRows] = await pool.query('SELECT variant_id FROM transactions WHERE id = ?', [id]);
    if (txRows.length > 0) {
      const variantId = txRows[0].variant_id;
      // Ambil 1 kredensial stok yang belum di-redeem
      const [availCreds] = await pool.query(`
        SELECT id FROM product_credentials
        WHERE variant_id = ? AND is_redeemed = FALSE
        LIMIT 1
      `, [variantId]);

      if (availCreds.length > 0) {
        await pool.query(`
          UPDATE product_credentials
          SET is_redeemed = TRUE, transaction_id = ?
          WHERE id = ?
        `, [id, availCreds[0].id]);
      }
    }

    return res.json({ success: true, message: 'Pembayaran berhasil disimulasikan lunas!' });
  } catch (err) {
    const memOrder = memoryTransactions.get(id);
    if (memOrder && memOrder.payment_status === 'unpaid') {
      memOrder.payment_status = 'paid';
      memOrder.fulfillment_status = 'success';
      const pool_ = MOCK_CREDENTIALS[memOrder.variant_id];
      if (pool_ && pool_.length) memOrder.credentials = pool_.shift();
    }
    return res.json({ success: true, message: 'Pembayaran disimulasikan lunas (Mock)' });
  }
});

module.exports = router;
