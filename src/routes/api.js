const express = require('express');
const router = express.Router();
const { pool } = require('../config/db');

// Fallback Mock Data (Agar Frontend bisa dites seketika meskipun MySQL belum dinyalakan)
const MOCK_CATEGORIES = [
  { id: 'cat-game', name: 'Game Populer', slug: 'game', icon_url: '🎮' },
  { id: 'cat-pulsa', name: 'Pulsa & Kuota', slug: 'pulsa-kuota', icon_url: '📱' },
  { id: 'cat-app', name: 'Aplikasi Premium', slug: 'app-premium', icon_url: '🎬' },
  { id: 'cat-voucher', name: 'Voucher & Kado', slug: 'voucher', icon_url: '🎟️' },
  { id: 'cat-pajak', name: 'Pajak & Tagihan PPOB', slug: 'tagihan-ppob', icon_url: '⚡' }
];

const MOCK_PRODUCTS = [
  {
    id: 'prod-mlbb',
    category_id: 'cat-game',
    category_name: 'Game Populer',
    name: 'Mobile Legends: Bang Bang',
    slug: 'mobile-legends',
    provider_code: 'MOONTON',
    input_type: 'user_id_zone',
    thumbnail_url: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=200&h=200&fit=crop',
    is_active: 1
  },
  {
    id: 'prod-ff',
    category_id: 'cat-game',
    category_name: 'Game Populer',
    name: 'Free Fire MAX',
    slug: 'free-fire',
    provider_code: 'GARENA',
    input_type: 'user_id',
    thumbnail_url: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=200&h=200&fit=crop',
    is_active: 1
  },
  {
    id: 'prod-netflix',
    category_id: 'cat-app',
    category_name: 'Aplikasi Premium',
    name: 'Netflix Premium 4K UHD',
    slug: 'netflix-premium',
    provider_code: 'NETFLIX',
    input_type: 'contact_only',
    thumbnail_url: 'https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?w=200&h=200&fit=crop',
    is_active: 1
  },
  {
    id: 'prod-spotify',
    category_id: 'cat-app',
    category_name: 'Aplikasi Premium',
    name: 'Spotify Premium 1 Bulan',
    slug: 'spotify-premium',
    provider_code: 'SPOTIFY',
    input_type: 'contact_only',
    thumbnail_url: 'https://images.unsplash.com/photo-1614680376593-902f749f7ffc?w=200&h=200&fit=crop',
    is_active: 1
  },
  {
    id: 'prod-tksel',
    category_id: 'cat-pulsa',
    category_name: 'Pulsa & Kuota',
    name: 'Telkomsel Data & Pulsa',
    slug: 'telkomsel',
    provider_code: 'TELKOMSEL',
    input_type: 'phone_number',
    thumbnail_url: 'https://images.unsplash.com/photo-1563770660941-20978e870e26?w=200&h=200&fit=crop',
    is_active: 1
  }
];

const MOCK_VARIANTS = {
  'mobile-legends': [
    { id: 'var-ml-86', name: '86 Diamonds', sku_code: 'ML-86DM', selling_price: 19500, original_price: 22000, stock: 999 },
    { id: 'var-ml-172', name: '172 Diamonds', sku_code: 'ML-172DM', selling_price: 39000, original_price: 44000, stock: 999 },
    { id: 'var-ml-pass', name: 'Weekly Diamond Pass', sku_code: 'ML-WDP', selling_price: 28000, original_price: 32000, stock: 999 }
  ],
  'netflix-premium': [
    { id: 'var-nflx-1bln', name: 'Akun 1 Bulan (1 Profil)', sku_code: 'NFLX-1M-SHR', selling_price: 35000, original_price: 45000, stock: 5 },
    { id: 'var-nflx-3bln', name: 'Akun 3 Bulan (Privat)', sku_code: 'NFLX-3M-PRV', selling_price: 105000, original_price: 135000, stock: 2 }
  ]
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
      SELECT p.*, c.name AS category_name, c.slug AS category_slug
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
      filtered = MOCK_PRODUCTS.filter(p => p.category_id === category || p.slug === category);
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
    // Fallback simulation
    const mockOrder = {
      invoice_id: invoiceId,
      variant_id,
      payment_method_id,
      target_account,
      target_zone,
      contact: contact || target_account,
      base_price: 20000,
      fee_amount: 1000,
      total_amount: 21000,
      payment_method: payment_method_id.toUpperCase(),
      payment_reference: `8800${Math.floor(10000000 + Math.random() * 90000000)}`,
      payment_status: 'unpaid',
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
    await pool.query(`
      UPDATE transactions
      SET payment_status = 'paid', fulfillment_status = 'success', paid_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [id]);

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
    if (memOrder) {
      memOrder.payment_status = 'paid';
      memOrder.fulfillment_status = 'success';
      memOrder.credentials = 'Email: akun-demo@tubes.com | Pass: Sukses2026';
    }
    return res.json({ success: true, message: 'Pembayaran disimulasikan lunas (Mock)' });
  }
});

module.exports = router;
