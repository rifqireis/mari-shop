/**
 * Halaman Invoice (invoice.html?id=TRX-XXXX)
 * - countdown 15 menit, auto-refresh status tiap 5 dtk selama belum bayar
 * - QRIS (QR Asli dari library server /api/qr + fallback deterministik), VA/E-Wallet (salin kode), secret payload akun/voucher
 */
const PAY_WINDOW_MS = 15 * 60 * 1000;
const DEMO_MODE = true; // set false untuk menyembunyikan tombol "Simulasi Bayar" setelah presentasi

function invoice() {
  return {
    id: '', order: null, loading: true, notFound: false, error: '',
    remainingMs: PAY_WINDOW_MS, deadline: 0, tick: null, poll: null,
    paying: false, demo: DEMO_MODE,
    realQrSvg: '',

    async init() {
      this.id = (getParam('id') || '').trim();
      if (!this.id) { this.notFound = true; this.loading = false; return; }
      await this.load();
      this.loading = false;
      if (this.order) {
        rememberInvoice(this.order.id || this.order.invoice_id || this.id);
        this.tick = setInterval(() => this.updateClock(), 1000);
        this.poll = setInterval(() => { if (this.isUnpaid) this.load(true); }, 5000);
      }
    },

    async load(silent = false) {
      try {
        const res = await api('/orders/' + encodeURIComponent(this.id));
        this.order = res.data;
        const created = new Date(this.order.created_at).getTime();
        this.deadline = (isNaN(created) ? Date.now() : created) + PAY_WINDOW_MS;
        this.updateClock();
        if (this.isQris && !this.realQrSvg) {
          await this.loadQr();
        }
      } catch (e) {
        if (silent) return;
        if (e.status === 404) this.notFound = true; else this.error = e.message;
      }
    },

    async loadQr() {
      try {
        const text = this.order.payment_reference || this.id;
        const res = await fetch('/api/qr?text=' + encodeURIComponent(text));
        if (res.ok) {
          this.realQrSvg = await res.text();
        }
      } catch (e) {
        // Fallback ke simulasi visual jika gagal
      }
    },

    updateClock() {
      this.remainingMs = Math.max(0, this.deadline - Date.now());
      if (!this.isUnpaid && this.tick) { clearInterval(this.tick); clearInterval(this.poll); }
    },

    // ----- Status -----
    get isUnpaid() { return this.order && this.order.payment_status === 'unpaid'; },
    get isExpired() {
      return this.order && (this.order.payment_status === 'expired' || (this.isUnpaid && this.remainingMs <= 0));
    },
    get meta() {
      if (!this.order) return statusMeta({});
      return this.isExpired ? statusMeta({ payment_status: 'expired' }) : statusMeta(this.order);
    },
    get canPay() { return this.isUnpaid && !this.isExpired; },
    get countdownText() {
      const s = Math.floor(this.remainingMs / 1000);
      return String(Math.floor(s / 60)).padStart(2, '0') + ':' + String(s % 60).padStart(2, '0');
    },
    get steps() {
      const paid = this.order && this.order.payment_status === 'paid';
      const done = paid && this.order.fulfillment_status === 'success';
      return [\
        { t: '1. Pesanan Dibuat', ok: true },
        { t: '2. Dibayar', ok: paid },
        { t: '3. Diproses', ok: paid },
        { t: '4. Selesai', ok: done }
      ];
    },

    // ----- Data tampilan -----
    get payType() {
      const o = this.order;
      if (o.payment_type) return o.payment_type;
      return o.payment_method_id === 'qris' ? 'qris' : 'virtual_account';
    },
    get isQris() { return this.order && this.payType === 'qris'; },
    get methodName() { return this.order.payment_method_name || this.order.payment_method || this.order.payment_method_id; },
    get productLine() {
      const o = this.order;
      return o.product_name ? o.product_name + ' | ' + (o.variant_name || '') : (o.variant_name || o.variant_id);
    },
    get targetLine() {
      const o = this.order;
      return o.target_zone ? o.target_account + ' (' + o.target_zone + ')' : o.target_account;
    },
    get contact() { return this.order.contact_email_or_phone || this.order.contact; },
    get credentials() { return this.order && this.order.credentials; },
    rp(n) { return formatRupiah(n); },

    // ----- QR visual (Asli dari library qrcode server, dengan fallback simulasi) -----
    get qrSvg() {
      if (this.realQrSvg) return this.realQrSvg;
      const seedStr = String(this.order.payment_reference || this.id);
      let h = 2166136261;
      for (const ch of seedStr) { h ^= ch.charCodeAt(0); h = Math.imul(h, 16777619) >>> 0; }
      h = h || 1;
      const rnd = () => { h ^= h << 13; h >>>= 0; h ^= h >>> 17; h ^= h << 5; h >>>= 0; return h; };
      const N = 25, Q = 2, size = N + Q * 2;
      const inFinder = (x, y) => (x < 8 && y < 8) || (x >= N - 8 && y < 8) || (x < 8 && y >= N - 8);
      let rects = '';
      for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
        if (!inFinder(x, y) && rnd() % 100 < 48) rects += `<rect x="${x + Q}" y="${y + Q}" width="1" height="1"/>`;
      }
      const finder = (ox, oy) =>
        `<rect x="${ox + Q}" y="${oy + Q}" width="7" height="7"/><rect x="${ox + Q + 1}" y="${oy + Q + 1}" width="5" height="5" fill="#fff"/><rect x="${ox + Q + 2}" y="${oy + Q + 2}" width="3" height="3"/>`;
      return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" shape-rendering="crispEdges"><rect width="${size}" height="${size}" fill="#fff"/><g fill="#0B2A66">${rects}${finder(0, 0)}${finder(N - 7, 0)}${finder(0, N - 7)}</g></svg>`;
    },
    downloadQr() {
      const blob = new Blob([this.qrSvg], { type: 'image/svg+xml' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'QRIS-' + this.id + '.svg';
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(() => URL.revokeObjectURL(a.href), 1000);
      showToast('QR berhasil diunduh');
    },

    // ----- Simulasi bayar (demo presentasi) -----
    async simulatePay() {
      this.paying = true;
      try {
        await api('/orders/' + encodeURIComponent(this.id) + '/pay', { method: 'POST' });
        await this.load(true);
        showToast('Pembayaran berhasil disimulasikan!');
      } catch (e) { showToast(e.message, 'error'); }
      this.paying = false;
    }
  };
}
