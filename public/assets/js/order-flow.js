/**
 * Logika halaman checkout (order.html?product=slug)
 * Alur: Data Akun -> Varian -> Pembayaran -> Kontak -> Beli Sekarang
 */
const PAY_GROUPS = [
  { type: 'qris', title: 'QRIS', icon: 'qr' },
  { type: 'virtual_account', title: 'Virtual Account', icon: 'bank' },
  { type: 'ewallet', title: 'E-Wallet', icon: 'wallet' }
];
const PHONE_RE = /^(\+62|62|0)8\d{7,12}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function orderFlow() {
  return {
    loading: true, notFound: false, error: '',
    product: null, variants: [], payments: [],
    selectedVariantId: null, selectedPaymentId: null, openGroup: 'qris',
    form: { account: '', zone: '', contact: '' },
    errors: {}, submitting: false, submitError: '',

    async init() {
      const u = typeof Auth !== 'undefined' ? Auth.getUser() : null;
      if (u && u.email && !this.form.contact) {
        this.form.contact = u.email;
      }
      const slug = getParam('product');
      if (!slug) { this.notFound = true; this.loading = false; return; }
      try {
        const [p, pm] = await Promise.all([
          api('/products/' + encodeURIComponent(slug)),
          api('/payment-methods')
        ]);
        this.product = p.data;
        this.variants = p.data.variants || [];
        this.payments = pm.data;
        document.title = 'Top Up ' + this.product.name + ' | Mari Shop';
      } catch (e) {
        if (e.status === 404) this.notFound = true; else this.error = e.message;
      } finally {
        this.loading = false;
      }
    },

    // ----- Tipe input dinamis (kolom products.input_type) -----
    get inputType() { return (this.product && this.product.input_type) || 'user_id'; },
    get needsAccount() { return !['contact_only', 'none'].includes(this.inputType); },
    get needsZone() { return this.inputType === 'user_id_zone'; },
    get accountLabel() {
      return { phone_number: 'Nomor HP Tujuan', account_id: 'Nomor Meter / ID Pelanggan' }[this.inputType] || 'User ID';
    },
    get accountPlaceholder() {
      return { phone_number: 'Contoh: 081234567890', account_id: 'Contoh: 12345678901' }[this.inputType] || 'Masukkan User ID';
    },
    get guideText() {
      if (this.inputType === 'phone_number') return 'Pastikan nomor aktif dan sesuai operator produk yang dipilih.';
      if (this.inputType === 'account_id') return 'Nomor meter/ID pelanggan tertera di struk atau meteran listrikmu.';
      return 'Cara menemukan User ID: buka profil di dalam game, ID biasanya tampil di bawah nama karakter' +
             (this.needsZone ? ' (angka dalam kurung adalah Zone/Server).' : '.');
    },

    // ----- Pembayaran -----
    get paymentGroups() {
      return PAY_GROUPS
        .map(g => ({ ...g, items: this.payments.filter(p => p.type === g.type) }))
        .filter(g => g.items.length);
    },
    toggleGroup(type) { this.openGroup = this.openGroup === type ? '' : type; },
    feeFor(pay, base) {
      return Math.round(Number(pay.fee_flat || 0) + (Number(pay.fee_percentage || 0) / 100) * base);
    },
    feeLabel(pay) {
      const base = this.basePrice;
      if (base) return this.feeFor(pay, base) ? '+ ' + formatRupiah(this.feeFor(pay, base)) : 'Gratis';
      const parts = [];
      if (Number(pay.fee_flat)) parts.push(formatRupiah(pay.fee_flat));
      if (Number(pay.fee_percentage)) parts.push(Number(pay.fee_percentage) + '%');
      return parts.length ? 'Fee ' + parts.join(' + ') : 'Gratis';
    },

    // ----- Kalkulator (rumus sama persis dengan server: routes/api.js) -----
    get selectedVariant() { return this.variants.find(v => v.id === this.selectedVariantId) || null; },
    get selectedPayment() { return this.payments.find(p => p.id === this.selectedPaymentId) || null; },
    get basePrice() { return this.selectedVariant ? Number(this.selectedVariant.selling_price) : 0; },
    get feeAmount() { return this.selectedPayment && this.basePrice ? this.feeFor(this.selectedPayment, this.basePrice) : 0; },
    get totalAmount() { return this.basePrice + this.feeAmount; },
    get saving() {
      const v = this.selectedVariant;
      return v ? Math.max(0, Number(v.original_price) - Number(v.selling_price)) : 0;
    },
    get readyToPay() { return !!(this.selectedVariant && this.selectedPayment); },

    selectVariant(v) {
      if (Number(v.stock) <= 0) return;
      this.selectedVariantId = v.id;
      delete this.errors.variant;
    },
    selectPayment(p) { this.selectedPaymentId = p.id; delete this.errors.payment; },
    stockLabel(v) {
      const s = Number(v.stock);
      if (s <= 0) return { text: 'Stok habis', cls: 'text-danger' };
      if (s <= 10) return { text: 'Sisa ' + s, cls: 'text-danger' };
      return { text: 'Tersedia', cls: 'text-success' };
    },

    // ----- Validasi -----
    validate() {
      const e = {};
      const acc = this.form.account.trim();
      const zone = this.form.zone.trim();
      const contact = this.form.contact.trim().replace(/[\s-]/g, '');

      if (this.needsAccount) {
        if (!acc) e.account = this.accountLabel + ' wajib diisi';
        else if (this.inputType === 'phone_number' && !PHONE_RE.test(acc.replace(/[\s-]/g, ''))) e.account = 'Format nomor HP tidak valid (contoh 0812xxxxxxxx)';
        else if (['user_id', 'user_id_zone'].includes(this.inputType) && !/^\d{5,20}$/.test(acc)) e.account = 'User ID hanya angka, 5–20 digit';
        else if (this.inputType === 'account_id' && !/^\d{6,20}$/.test(acc)) e.account = 'Nomor meter hanya angka, 6–20 digit';
      }
      if (this.needsZone && !/^[A-Za-z0-9]{1,10}$/.test(zone)) e.zone = 'Zone/Server wajib diisi';
      if (!this.selectedVariant) e.variant = 'Pilih salah satu nominal';
      if (!this.selectedPayment) e.payment = 'Pilih metode pembayaran';
      if (!contact) e.contact = 'Nomor WhatsApp atau email wajib diisi';
      else if (!PHONE_RE.test(contact) && !EMAIL_RE.test(this.form.contact.trim())) e.contact = 'Isi nomor WhatsApp (08xx) atau email yang valid';

      this.errors = e;
      const ok = Object.keys(e).length === 0;
      if (!ok) {
        this.$nextTick(() => {
          const el = document.querySelector('.has-error');
          if (el) { el.scrollIntoView({ behavior: 'smooth', block: 'center' }); shake(el); }
        });
      }
      return ok;
    },

    // ----- Kirim pesanan -----
    async submit() {
      if (this.submitting) return;
      this.submitError = '';
      if (!this.validate()) return;
      this.submitting = true;
      try {
        const user = typeof Auth !== 'undefined' ? Auth.getUser() : null;
        const contact = this.form.contact.trim();
        const res = await api('/orders', {
          method: 'POST',
          body: JSON.stringify({
            variant_id: this.selectedVariantId,
            payment_method_id: this.selectedPaymentId,
            // produk akun/voucher tidak punya ID target: backend butuh target_account, pakai kontak
            target_account: this.needsAccount ? this.form.account.trim() : contact,
            target_zone: this.needsZone ? this.form.zone.trim() : null,
            contact,
            user_id: user ? user.id : null
          })
        });
        rememberInvoice(res.data.invoice_id);
        window.location.href = 'invoice.html?id=' + encodeURIComponent(res.data.invoice_id);
      } catch (e) {
        this.submitError = e.message;
        showToast(e.message, 'error');
        this.submitting = false;
      }
    }
  };
}
