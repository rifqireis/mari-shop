/** Halaman Beranda (index.html) */
function home() {
  return {
    categories: [],
    products: [],
    searchQuery: '',
    loading: true,
    error: '',

    async init() {
      this.searchQuery = getParam('q') || '';
      await this.load();
    },

    async load() {
      this.loading = true;
      this.error = '';
      try {
        const [c, p] = await Promise.all([api('/categories'), api('/products')]);
        this.categories = c.data;
        this.products = p.data;
      } catch (e) {
        this.error = e.message;
      } finally {
        this.loading = false;
      }
    },

    get filteredProducts() {
      const q = this.searchQuery.trim().toLowerCase();
      return this.products.filter(item => {
        const hay = [item.name, item.provider_code, item.category_name].join(' ').toLowerCase();
        return !q || hay.includes(q);
      });
    },

    // Satu halaman: produk dikelompokkan per kategori (urutan tetap), kategori kosong disembunyikan
    get sections() {
      const order = ['game', 'pulsa-kuota', 'app-premium', 'voucher', 'tagihan-ppob'];
      const rank = c => { const i = order.indexOf(c.slug); return i === -1 ? 99 : i; };
      const items = this.filteredProducts;
      return [...this.categories].sort((a, b) => rank(a) - rank(b))
        .map(cat => ({ cat, items: items.filter(p => p.category_id === cat.id) }))
        .filter(s => s.items.length);
    },

    scrollCarousel(slug, dir) {
      const el = document.getElementById('track-' + slug);
      if (!el) return;
      const amount = (el.clientWidth * 0.75) * dir;
      el.scrollBy({ left: amount, behavior: 'smooth' });
    },

    catIcon(cat) {
      const map = { 'game': 'game', 'pulsa-kuota': 'phone', 'app-premium': 'play', 'voucher': 'ticket', 'tagihan-ppob': 'bolt' };
      return '/assets/img/icons/' + (map[cat.slug] || 'bag') + '.svg';
    },

    countFor(catId) {
      return this.products.filter(p => p.category_id === catId).length;
    },

    inStock(item) {
      return item.total_stock === undefined || item.total_stock === null || Number(item.total_stock) > 0;
    },

    priceFrom(item) {
      return item.min_price ? formatRupiah(item.min_price) : null;
    },

    stickerFor(item) {
      if (item.category_slug === 'game') return { text: 'HOT', cls: '' };
      if (item.category_slug === 'app-premium') return { text: '100% RESMI', cls: 'badge-green' };
      return { text: 'INSTANT', cls: '' };
    }
  };
}
