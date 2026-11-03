/**
 * Admin UI (admin/index.html & admin/credentials.html)
 * MODE DEMO: data dibaca dari API publik, perubahan (tambah/ubah/hapus) hanya
 * tersimpan di memori browser. Semua operasi tulis ada di objek AdminAPI di bawah.
 * TODO Mari: ganti isi AdminAPI.* dengan fetch ke endpoint /api/admin/* (lihat docs/HANDOFF_RIFQI.md).
 */
const AdminAPI = {
  async load() {
    const [c, p] = await Promise.all([api('/categories'), api('/products')]);
    const products = p.data.map(x => ({ ...x, is_active: x.is_active !== 0 && x.is_active !== false }));
    const variants = [];
    await Promise.all(products.map(async pr => {
      try {
        const d = await api('/products/' + encodeURIComponent(pr.slug));
        (d.data.variants || []).forEach(v => variants.push({ ...v, product_id: pr.id, is_active: v.is_active !== 0 && v.is_active !== false }));
      } catch (e) { /* produk tanpa varian */ }
    }));
    return { categories: c.data, products, variants };
  },
  // TODO Mari: POST /api/admin/products | PUT /api/admin/products/:id | DELETE ...
  async saveProduct(data) { return data; },
  async deleteProduct(id) { return true; },
  // TODO Mari: POST/PUT/DELETE /api/admin/variants
  async saveVariant(data) { return data; },
  async deleteVariant(id) { return true; },
  // TODO Mari: GET/POST/DELETE /api/admin/credentials
  async saveCredentials(rows) { return rows; },
  async deleteCredential(id) { return true; }
};

const uid = (p) => p + '-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 5);

function adminProducts() {
  return {
    tab: 'products', loading: true, error: '',
    categories: [], products: [], variants: [], filterProduct: '',
    modal: null,   // { type: 'product'|'variant', editing: bool, form: {} }
    errors: {},

    async init() {
      try { Object.assign(this, await AdminAPI.load()); }
      catch (e) { this.error = e.message; }
      this.loading = false;
    },

    catName(id) { return (this.categories.find(c => c.id === id) || {}).name || '-'; },
    prodName(id) { return (this.products.find(p => p.id === id) || {}).name || '-'; },
    rp(n) { return formatRupiah(n); },
    get shownVariants() { return this.variants.filter(v => !this.filterProduct || v.product_id === this.filterProduct); },
    get stats() {
      return [
        { l: 'Produk', v: this.products.length }, { l: 'Varian', v: this.variants.length },
        { l: 'Aktif', v: this.products.filter(p => p.is_active).length },
        { l: 'Stok Habis', v: this.variants.filter(v => Number(v.stock) <= 0).length }
      ];
    },

    openProduct(p) {
      this.errors = {};
      this.modal = { type: 'product', editing: !!p, form: p ? { ...p } : { id: '', category_id: this.categories[0]?.id || '', name: '', slug: '', provider_code: '', input_type: 'user_id', thumbnail_url: '', is_active: true } };
    },
    openVariant(v) {
      this.errors = {};
      this.modal = { type: 'variant', editing: !!v, form: v ? { ...v } : { id: '', product_id: this.filterProduct || this.products[0]?.id || '', name: '', sku_code: '', original_price: 0, selling_price: 0, stock: 999, is_active: true } };
    },
    slugify(s) { return s.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''); },

    async save() {
      const f = this.modal.form, e = {};
      if (!f.name.trim()) e.name = 'Nama wajib diisi';
      if (this.modal.type === 'product') {
        if (!f.slug.trim()) f.slug = this.slugify(f.name);
        if (this.products.some(p => p.slug === f.slug && p.id !== f.id)) e.slug = 'Slug sudah dipakai';
      } else {
        if (!f.sku_code.trim()) e.sku_code = 'SKU wajib diisi';
        else if (this.variants.some(v => v.sku_code === f.sku_code && v.id !== f.id)) e.sku_code = 'SKU sudah dipakai';
        if (Number(f.selling_price) <= 0) e.selling_price = 'Harga jual harus > 0';
        if (Number(f.selling_price) > Number(f.original_price)) e.original_price = 'Harga coret tidak boleh lebih kecil dari harga jual';
        if (Number(f.stock) < 0) e.stock = 'Stok tidak boleh negatif';
      }
      this.errors = e;
      if (Object.keys(e).length) return shake(document.querySelector('.modal-box'));

      if (this.modal.type === 'product') {
        const saved = await AdminAPI.saveProduct(f);
        if (this.modal.editing) this.products = this.products.map(p => p.id === f.id ? { ...p, ...saved } : p);
        else this.products.push({ ...saved, id: uid('prod'), category_name: this.catName(f.category_id) });
      } else {
        ['original_price', 'selling_price', 'stock'].forEach(k => f[k] = Number(f[k]));
        const saved = await AdminAPI.saveVariant(f);
        if (this.modal.editing) this.variants = this.variants.map(v => v.id === f.id ? { ...v, ...saved } : v);
        else this.variants.push({ ...saved, id: uid('var') });
      }
      showToast('Tersimpan (mode demo)');
      this.modal = null;
    },

    async toggleProduct(p) { p.is_active = !p.is_active; await AdminAPI.saveProduct(p); },
    async toggleVariant(v) { v.is_active = !v.is_active; await AdminAPI.saveVariant(v); },
    async removeProduct(p) {
      if (!confirm('Hapus produk "' + p.name + '" beserta semua variannya?')) return;
      await AdminAPI.deleteProduct(p.id);
      this.products = this.products.filter(x => x.id !== p.id);
      this.variants = this.variants.filter(v => v.product_id !== p.id);
      showToast('Produk dihapus', 'error');
    },
    async removeVariant(v) {
      if (!confirm('Hapus varian "' + v.name + '"?')) return;
      await AdminAPI.deleteVariant(v.id);
      this.variants = this.variants.filter(x => x.id !== v.id);
      showToast('Varian dihapus', 'error');
    }
  };
}

function adminCredentials() {
  return {
    loading: true, error: '', variants: [], creds: [],
    variantId: '', bulk: '', reveal: {}, filter: 'all',

    async init() {
      try {
        const d = await AdminAPI.load();
        // hanya produk yang dikirim berupa akun/voucher
        const premium = d.products.filter(p => ['contact_only', 'none'].includes(p.input_type)).map(p => p.id);
        this.variants = d.variants.filter(v => premium.includes(v.product_id)).map(v => ({ ...v, label: (d.products.find(p => p.id === v.product_id) || {}).name + ' — ' + v.name }));
        this.variantId = this.variants[0]?.id || '';
        // data contoh (sama dengan seeder schema.sql)
        const seed = [
          ['var-nflx-1bln', 'Email: streamvip01@gmail.com | Pass: RahasiaVip2026 | Pin: 1234', false],
          ['var-nflx-1bln', 'Email: streamvip02@gmail.com | Pass: RahasiaVip2026 | Pin: 5678', true],
          ['var-spot-1bln', 'Voucher Code: SPOT-IND-9921-XKQ8', false]
        ];
        this.creds = seed.filter(s => this.variants.some(v => v.id === s[0])).map(s => ({ id: uid('cred'), variant_id: s[0], secret_payload: s[1], is_redeemed: s[2] }));
      } catch (e) { this.error = e.message; }
      this.loading = false;
    },

    label(id) { return (this.variants.find(v => v.id === id) || {}).label || id; },
    get shown() {
      return this.creds.filter(c => this.filter === 'all' || (this.filter === 'ready' ? !c.is_redeemed : c.is_redeemed));
    },
    count(vid) { return this.creds.filter(c => c.variant_id === vid && !c.is_redeemed).length; },
    mask(t) { return t.replace(/(Pass:\s*)[^|]+/i, '$1••••••').replace(/[A-Z0-9]{4}$/, '••••'); },

    async addBulk() {
      const lines = this.bulk.split('\n').map(l => l.trim()).filter(Boolean);
      if (!this.variantId) return showToast('Pilih varian dulu', 'error');
      if (!lines.length) return shake(document.getElementById('bulk'));
      const rows = lines.map(l => ({ id: uid('cred'), variant_id: this.variantId, secret_payload: l, is_redeemed: false }));
      await AdminAPI.saveCredentials(rows);
      this.creds.unshift(...rows);
      this.bulk = '';
      showToast(rows.length + ' kredensial ditambahkan (mode demo)');
    },
    async remove(c) {
      if (c.is_redeemed) return showToast('Kredensial yang sudah terjual tidak bisa dihapus', 'error');
      if (!confirm('Hapus kredensial ini?')) return;
      await AdminAPI.deleteCredential(c.id);
      this.creds = this.creds.filter(x => x.id !== c.id);
    }
  };
}
