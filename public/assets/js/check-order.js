/** Halaman Cek Transaksi (check-order.html) */
function checkOrder() {
  return {
    mode: 'invoice',       // 'invoice' | 'contact'
    query: '', loading: false, searched: false, error: '', results: [], recent: [],

    init() {
      this.recent = getRememberedInvoices();
      const id = getParam('id');
      if (id) { this.query = id; this.search(); }
    },

    setMode(m) { this.mode = m; this.query = ''; this.error = ''; this.results = []; this.searched = false; },
    useRecent(id) { this.mode = 'invoice'; this.query = id; this.search(); },
    meta(o) { return statusMeta(o); },
    rp(n) { return formatRupiah(n); },

    async search() {
      const q = this.query.trim();
      this.error = ''; this.results = []; this.searched = false;
      if (!q) { this.error = this.mode === 'invoice' ? 'Masukkan nomor invoice (TRX-...)' : 'Masukkan nomor WhatsApp atau email'; shake(this.$refs.field); return; }
      this.loading = true;
      try {
        if (this.mode === 'invoice') {
          const r = await api('/orders/' + encodeURIComponent(q.toUpperCase()));
          this.results = [r.data];
        } else {
          const r = await api('/orders?contact=' + encodeURIComponent(q));
          this.results = r.data;
        }
      } catch (e) {
        if (e.status !== 404) this.error = e.message;
      } finally {
        this.loading = false; this.searched = true;
      }
    },

    invId(o) { return o.id || o.invoice_id; }
  };
}
