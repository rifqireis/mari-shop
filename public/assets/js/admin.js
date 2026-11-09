/**
 * Admin UI (admin/index.html & admin/credentials.html & admin/transactions.html)
 * Mendukung autentikasi ketat akun administrator,
 * penyimpanan ke REST API backend (/api/admin/*)
 * dengan auto-fallback memori browser jika koneksi MySQL belum tersedia.
 */
const AdminAPI = {
  async load() {
    const [c, p] = await Promise.all([api("/categories"), api("/products")]);
    const products = p.data.map(x => ({ ...x, is_active: x.is_active !== 0 && x.is_active !== false }));
    const variants = [];
    await Promise.all(products.map(async pr => {
      try {
        const d = await api("/products/" + encodeURIComponent(pr.slug));
        (d.data.variants || []).forEach(v => variants.push({ ...v, product_id: pr.id, is_active: v.is_active !== 0 && v.is_active !== false }));
      } catch (e) { /* produk tanpa varian */ }
    }));
    return { categories: c.data, products, variants };
  },
  async saveProduct(data, isEdit = false) {
    try {
      const res = await api(isEdit ? "/admin/products/" + encodeURIComponent(data.id) : "/admin/products", {
        method: isEdit ? "PUT" : "POST",
        body: JSON.stringify(data)
      });
      return res.data || data;
    } catch (e) {
      console.warn("Simpan produk lokal fallback:", e.message);
      return data;
    }
  },
  async deleteProduct(id) {
    try {
      await api("/admin/products/" + encodeURIComponent(id), { method: "DELETE" });
    } catch (e) {
      console.warn("Hapus produk lokal fallback:", e.message);
    }
    return true;
  },
  async saveVariant(data, isEdit = false) {
    try {
      const res = await api(isEdit ? "/admin/variants/" + encodeURIComponent(data.id) : "/admin/variants", {
        method: isEdit ? "PUT" : "POST",
        body: JSON.stringify(data)
      });
      return res.data || data;
    } catch (e) {
      console.warn("Simpan varian lokal fallback:", e.message);
      return data;
    }
  },
  async deleteVariant(id) {
    try {
      await api("/admin/variants/" + encodeURIComponent(id), { method: "DELETE" });
    } catch (e) {
      console.warn("Hapus varian lokal fallback:", e.message);
    }
    return true;
  },
  async loadCredentials(variantId = "") {
    try {
      const q = variantId ? "?variant_id=" + encodeURIComponent(variantId) : "";
      const res = await api("/admin/credentials" + q);
      return res.data || [];
    } catch (e) {
      return [];
    }
  },
  async saveCredentials(rows) {
    try {
      const res = await api("/admin/credentials", {
        method: "POST",
        body: JSON.stringify({ credentials: rows })
      });
      return res.data || rows;
    } catch (e) {
      return rows;
    }
  },
  async deleteCredential(id) {
    try {
      await api("/admin/credentials/" + encodeURIComponent(id), { method: "DELETE" });
    } catch (e) {
      console.warn("Hapus kredensial fallback:", e.message);
    }
    return true;
  },
  async loadTransactions() {
    try {
      const res = await api("/admin/transactions");
      return res.data || [];
    } catch (e) {
      console.warn("Load transactions fallback:", e.message);
      return [];
    }
  }
};

const uid = (p) => p + "-" + Date.now().toString(36) + Math.random().toString(36).slice(2, 5);

function adminProducts() {
  return {
    tab: "products", loading: true, error: "",
    categories: [], products: [], variants: [], filterProduct: "",
    modal: null,   // { type: "product"|"variant", editing: bool, form: {} }
    errors: {},

    // State Autentikasi Admin
    user: (typeof Auth !== "undefined" ? Auth.getUser() : null),
    isAdmin: false,
    adminEmail: "mari@admin.com",
    adminPass: "",
    loginError: "",
    loginLoading: false,

    async init() {
      this.checkAuth();
      if (!this.isAdmin) {
        this.loading = false;
        return;
      }
      await this.loadData();
    },

    checkAuth() {
      this.user = typeof Auth !== "undefined" ? Auth.getUser() : null;
      this.isAdmin = typeof Auth !== "undefined" ? Auth.isAdmin() : false;
      return this.isAdmin;
    },

    async loadData() {
      this.loading = true;
      this.error = "";
      try { 
        Object.assign(this, await AdminAPI.load()); 
      } catch (e) { 
        this.error = e.message; 
      } finally {
        this.loading = false;
      }
    },

    async submitAdminLogin() {
      if (!this.adminEmail || !this.adminPass) {
        this.loginError = "Email dan kata sandi wajib diisi";
        return;
      }
      this.loginLoading = true;
      this.loginError = "";
      try {
        const u = await Auth.login(this.adminEmail, this.adminPass);
        if (u && (u.role === "admin" || u.email === "mari@admin.com")) {
          this.checkAuth();
          await this.loadData();
          if (typeof showToast === "function") showToast("Selamat datang, " + u.name + "!");
        } else {
          this.loginError = "Akses ditolak: Akun ini bukan akun administrator.";
        }
      } catch (err) {
        this.loginError = err.message || "Login gagal";
      } finally {
        this.loginLoading = false;
      }
    },

    quickAdminLogin() {
      const u = Auth.quickLogin("admin");
      this.checkAuth();
      this.loadData();
    },

    switchToAdmin() {
      Auth.setUser(null);
      this.checkAuth();
      this.loginError = "";
    },

    logout() {
      Auth.logout();
    },

    catName(id) { return (this.categories.find(c => c.id === id) || {}).name || "-"; },
    prodName(id) { return (this.products.find(p => p.id === id) || {}).name || "-"; },
    rp(n) { return formatRupiah(n); },
    get shownVariants() { return this.variants.filter(v => !this.filterProduct || v.product_id === this.filterProduct); },
    get stats() {
      return [
        { l: "Produk", v: this.products.length }, { l: "Varian", v: this.variants.length },
        { l: "Aktif", v: this.products.filter(p => p.is_active).length },
        { l: "Stok Habis", v: this.variants.filter(v => Number(v.stock) <= 0).length }
      ];
    },

    openProduct(p) {
      this.errors = {};
      this.modal = { type: "product", editing: !!p, form: p ? { ...p } : { id: "", category_id: this.categories[0]?.id || "", name: "", slug: "", provider_code: "", input_type: "user_id", thumbnail_url: "", is_active: true } };
    },
    openVariant(v) {
      this.errors = {};
      this.modal = { type: "variant", editing: !!v, form: v ? { ...v } : { id: "", product_id: this.filterProduct || this.products[0]?.id || "", name: "", sku_code: "", original_price: 0, selling_price: 0, stock: 999, is_active: true } };
    },
    slugify(s) { return s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""); },

    async save() {
      const f = this.modal.form, e = {};
      if (!f.name.trim()) e.name = "Nama wajib diisi";
      if (this.modal.type === "product") {
        if (!f.slug.trim()) f.slug = this.slugify(f.name);
        if (this.products.some(p => p.slug === f.slug && p.id !== f.id)) e.slug = "Slug sudah dipakai";
      } else {
        if (!f.sku_code.trim()) e.sku_code = "SKU wajib diisi";
        else if (this.variants.some(v => v.sku_code === f.sku_code && v.id !== f.id)) e.sku_code = "SKU sudah dipakai";
        if (Number(f.selling_price) <= 0) e.selling_price = "Harga jual harus > 0";
        if (Number(f.selling_price) > Number(f.original_price)) e.original_price = "Harga coret tidak boleh lebih kecil dari harga jual";
        if (Number(f.stock) < 0) e.stock = "Stok tidak boleh negatif";
      }
      this.errors = e;
      if (Object.keys(e).length) return shake(document.querySelector(".modal-box"));

      if (this.modal.type === "product") {
        const saved = await AdminAPI.saveProduct(f, this.modal.editing);
        if (this.modal.editing) this.products = this.products.map(p => p.id === f.id ? { ...p, ...saved } : p);
        else this.products.push({ ...saved, id: saved.id || uid("prod"), category_name: this.catName(f.category_id) });
      } else {
        ["original_price", "selling_price", "stock"].forEach(k => f[k] = Number(f[k]));
        const saved = await AdminAPI.saveVariant(f, this.modal.editing);
        if (this.modal.editing) this.variants = this.variants.map(v => v.id === f.id ? { ...v, ...saved } : v);
        else this.variants.push({ ...saved, id: saved.id || uid("var") });
      }
      showToast("Perubahan berhasil disimpan");
      this.modal = null;
    },

    async toggleProduct(p) { p.is_active = !p.is_active; await AdminAPI.saveProduct(p); },
    async toggleVariant(v) { v.is_active = !v.is_active; await AdminAPI.saveVariant(v); },
    async removeProduct(p) {
      if (!confirm("Hapus produk \"" + p.name + "\" beserta semua variannya?")) return;
      await AdminAPI.deleteProduct(p.id);
      this.products = this.products.filter(x => x.id !== p.id);
      this.variants = this.variants.filter(v => v.product_id !== p.id);
      showToast("Produk dihapus", "error");
    },
    async removeVariant(v) {
      if (!confirm("Hapus varian \"" + v.name + "\"?")) return;
      await AdminAPI.deleteVariant(v.id);
      this.variants = this.variants.filter(x => x.id !== v.id);
      showToast("Varian dihapus", "error");
    }
  };
}

function adminCredentials() {
  return {
    loading: true, error: "", variants: [], creds: [],
    variantId: "", bulk: "", reveal: {}, filter: "all",

    // State Autentikasi Admin
    user: (typeof Auth !== "undefined" ? Auth.getUser() : null),
    isAdmin: false,
    adminEmail: "mari@admin.com",
    adminPass: "",
    loginError: "",
    loginLoading: false,

    async init() {
      this.checkAuth();
      if (!this.isAdmin) {
        this.loading = false;
        return;
      }
      await this.loadData();
    },

    checkAuth() {
      this.user = typeof Auth !== "undefined" ? Auth.getUser() : null;
      this.isAdmin = typeof Auth !== "undefined" ? Auth.isAdmin() : false;
      return this.isAdmin;
    },

    async loadData() {
      this.loading = true;
      this.error = "";
      try {
        const d = await AdminAPI.load();
        // hanya produk yang dikirim berupa akun/voucher
        const premium = d.products.filter(p => ["contact_only", "none"].includes(p.input_type)).map(p => p.id);
        this.variants = d.variants.filter(v => premium.includes(v.product_id)).map(v => ({ ...v, label: (d.products.find(p => p.id === v.product_id) || {}).name + " | " + v.name }));
        this.variantId = this.variants[0]?.id || "";

        // Ambil data dari server jika ada
        let dbCreds = [];
        try {
          dbCreds = await AdminAPI.loadCredentials();
        } catch (e) {}

        if (dbCreds && dbCreds.length > 0) {
          this.creds = dbCreds.map(c => ({
            id: c.id,
            variant_id: c.variant_id,
            secret_payload: c.secret_payload,
            is_redeemed: !!c.is_redeemed
          }));
        } else {
          // data contoh cadangan (sama dengan seeder schema.sql)
          const seed = [
            ["var-nflx-1bln", "Email: streamvip01@gmail.com | Pass: RahasiaVip2026 | Pin: 1234", false],
            ["var-nflx-1bln", "Email: streamvip02@gmail.com | Pass: RahasiaVip2026 | Pin: 5678", true],
            ["var-spot-1bln", "Voucher Code: SPOT-IND-9921-XKQ8", false]
          ];
          this.creds = seed.filter(s => this.variants.some(v => v.id === s[0])).map(s => ({ id: uid("cred"), variant_id: s[0], secret_payload: s[1], is_redeemed: s[2] }));
        }
      } catch (e) { 
        this.error = e.message; 
      } finally {
        this.loading = false;
      }
    },

    async submitAdminLogin() {
      if (!this.adminEmail || !this.adminPass) {
        this.loginError = "Email dan kata sandi wajib diisi";
        return;
      }
      this.loginLoading = true;
      this.loginError = "";
      try {
        const u = await Auth.login(this.adminEmail, this.adminPass);
        if (u && (u.role === "admin" || u.email === "mari@admin.com")) {
          this.checkAuth();
          await this.loadData();
          if (typeof showToast === "function") showToast("Selamat datang, " + u.name + "!");
        } else {
          this.loginError = "Akses ditolak: Akun ini bukan akun administrator.";
        }
      } catch (err) {
        this.loginError = err.message || "Login gagal";
      } finally {
        this.loginLoading = false;
      }
    },

    quickAdminLogin() {
      const u = Auth.quickLogin("admin");
      this.checkAuth();
      this.loadData();
    },

    switchToAdmin() {
      Auth.setUser(null);
      this.checkAuth();
      this.loginError = "";
    },

    logout() {
      Auth.logout();
    },

    label(id) { return (this.variants.find(v => v.id === id) || {}).label || id; },
    get shown() {
      return this.creds.filter(c => this.filter === "all" || (this.filter === "ready" ? !c.is_redeemed : c.is_redeemed));
    },
    count(vid) { return this.creds.filter(c => c.variant_id === vid && !c.is_redeemed).length; },
    mask(t) { return t.replace(/(Pass:\s*)[^|]+/i, "$1••••••").replace(/[A-Z0-9]{4}$/, "••••"); },

    async addBulk() {
      const lines = this.bulk.split("\n").map(l => l.trim()).filter(Boolean);
      if (!this.variantId) return showToast("Pilih varian dulu", "error");
      if (!lines.length) return shake(document.getElementById("bulk"));
      const rows = lines.map(l => ({ id: uid("cred"), variant_id: this.variantId, secret_payload: l, is_redeemed: false }));
      await AdminAPI.saveCredentials(rows);
      this.creds.unshift(...rows);
      this.bulk = "";
      showToast(rows.length + " kredensial berhasil disimpan");
    },
    async remove(c) {
      if (c.is_redeemed) return showToast("Kredensial yang sudah terjual tidak bisa dihapus", "error");
      if (!confirm("Hapus kredensial ini?")) return;
      await AdminAPI.deleteCredential(c.id);
      this.creds = this.creds.filter(x => x.id !== c.id);
      showToast("Kredensial berhasil dihapus", "error");
    }
  };
}

function adminTransactions() {
  return {
    loading: true, error: "",
    transactions: [],
    searchQuery: "",
    statusFilter: "all",

    // State Autentikasi Admin
    user: (typeof Auth !== "undefined" ? Auth.getUser() : null),
    isAdmin: false,
    adminEmail: "mari@admin.com",
    adminPass: "",
    loginError: "",
    loginLoading: false,

    async init() {
      this.checkAuth();
      if (!this.isAdmin) {
        this.loading = false;
        return;
      }
      await this.loadData();
    },

    checkAuth() {
      this.user = typeof Auth !== "undefined" ? Auth.getUser() : null;
      this.isAdmin = typeof Auth !== "undefined" ? Auth.isAdmin() : false;
      return this.isAdmin;
    },

    async loadData() {
      this.loading = true;
      this.error = "";
      try {
        this.transactions = await AdminAPI.loadTransactions();
      } catch (e) {
        this.error = e.message;
      } finally {
        this.loading = false;
      }
    },

    async submitAdminLogin() {
      if (!this.adminEmail || !this.adminPass) {
        this.loginError = "Email dan kata sandi wajib diisi";
        return;
      }
      this.loginLoading = true;
      this.loginError = "";
      try {
        const u = await Auth.login(this.adminEmail, this.adminPass);
        if (u && (u.role === "admin" || u.email === "mari@admin.com")) {
          this.checkAuth();
          await this.loadData();
          if (typeof showToast === "function") showToast("Selamat datang, " + u.name + "!");
        } else {
          this.loginError = "Akses ditolak: Akun ini bukan akun administrator.";
        }
      } catch (err) {
        this.loginError = err.message || "Login gagal";
      } finally {
        this.loginLoading = false;
      }
    },

    quickAdminLogin() {
      const u = Auth.quickLogin("admin");
      this.checkAuth();
      this.loadData();
    },

    switchToAdmin() {
      Auth.setUser(null);
      this.checkAuth();
      this.loginError = "";
    },

    logout() {
      Auth.logout();
    },

    rp(n) { return formatRupiah(n); },
    meta(o) { return statusMeta(o); },

    get filteredTransactions() {
      const q = this.searchQuery.trim().toLowerCase();
      return this.transactions.filter(t => {
        const matchStatus = this.statusFilter === "all" || t.payment_status === this.statusFilter;
        if (!matchStatus) return false;
        if (!q) return true;
        const idMatch = (t.id || "").toLowerCase().includes(q);
        const userMatch = (t.user_name || "").toLowerCase().includes(q) || (t.user_email || "").toLowerCase().includes(q);
        const contactMatch = (t.contact_email_or_phone || "").toLowerCase().includes(q) || (t.target_account || "").toLowerCase().includes(q);
        const prodMatch = (t.product_name || "").toLowerCase().includes(q) || (t.variant_name || "").toLowerCase().includes(q);
        return idMatch || userMatch || contactMatch || prodMatch;
      });
    },

    get stats() {
      const total = this.transactions.length;
      const paid = this.transactions.filter(t => t.payment_status === "paid").length;
      const unpaid = this.transactions.filter(t => t.payment_status === "unpaid").length;
      const revenue = this.transactions
        .filter(t => t.payment_status === "paid")
        .reduce((sum, t) => sum + (Number(t.total_amount) || 0), 0);
      return { total, paid, unpaid, revenue };
    },

    async simulatePay(t) {
      if (t.payment_status === "paid") return;
      if (!confirm("Tandai transaksi " + t.id + " sebagai lunas?")) return;
      try {
        await api("/orders/" + encodeURIComponent(t.id) + "/pay", { method: "POST" });
        showToast("Transaksi " + t.id + " berhasil ditandai Lunas!");
        await this.loadData();
      } catch (e) {
        showToast(e.message, "error");
      }
    }
  };
}
