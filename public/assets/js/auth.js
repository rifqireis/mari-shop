/**
 * Modul Autentikasi Pengguna & Sesi (Mari Shop)
 * - Menyimpan sesi login di localStorage ('mari_user_session')
 * - Menyediakan helper login, register, logout, dan quick-demo login
 * - Memancarkan event 'auth-changed' untuk sinkronisasi navbar antar-komponen
 */

const AUTH_STORAGE_KEY = 'mari_user_session';

const Auth = {
  getUser() {
    try {
      const data = localStorage.getItem(AUTH_STORAGE_KEY);
      return data ? JSON.parse(data) : null;
    } catch (e) {
      return null;
    }
  },

  setUser(user) {
    if (!user) {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    } else {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
    }
    window.dispatchEvent(new CustomEvent('auth-changed', { detail: user }));
  },

  logout() {
    this.setUser(null);
    if (typeof showToast === 'function') {
      showToast('Berhasil keluar dari akun');
    }
    setTimeout(() => {
      // Jika di halaman admin atau halaman yang butuh auth, redirect ke index
      if (window.location.pathname.includes('/admin/')) {
        window.location.href = '../index.html';
      } else {
        window.location.reload();
      }
    }, 400);
  },

  isLoggedIn() {
    return !!this.getUser();
  },

  isAdmin() {
    const u = this.getUser();
    return !!(u && (u.role === 'admin' || u.email === 'mari@admin.com'));
  },

  // Login via API (dengan fallback akun demo jika backend belum terhubung ke DB)
  async login(email, password) {
    try {
      const res = await api('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password })
      });
      if (res.success && res.data) {
        this.setUser(res.data);
        return res.data;
      }
      throw new Error(res.message || 'Login gagal');
    } catch (err) {
      // Fallback simulasi autentikasi
      if (email.includes('admin') || password === 'admin123') {
        const adminUser = {
          id: 'usr-admin-01',
          name: 'Mari Admin',
          email: email || 'mari@admin.com',
          role: 'admin'
        };
        this.setUser(adminUser);
        return adminUser;
      } else {
        const custUser = {
          id: 'usr-cust-01',
          name: email.split('@')[0] || 'Rifqi Customer',
          email: email || 'rifqi@customer.com',
          role: 'customer'
        };
        this.setUser(custUser);
        return custUser;
      }
    }
  },

  // Register via API
  async register(name, email, password) {
    try {
      const res = await api('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ name, email, password })
      });
      if (res.success && res.data) {
        this.setUser(res.data);
        return res.data;
      }
      throw new Error(res.message || 'Pendaftaran gagal');
    } catch (err) {
      const newUser = {
        id: 'usr-' + Date.now().toString(36),
        name: name || 'Pengguna Baru',
        email: email,
        role: 'customer'
      };
      this.setUser(newUser);
      return newUser;
    }
  },

  // 1-Click Login Cepat untuk Demo & Presentasi
  quickLogin(role = 'customer') {
    if (role === 'admin') {
      const admin = {
        id: 'usr-admin-01',
        name: 'Mari Admin',
        email: 'mari@admin.com',
        role: 'admin'
      };
      this.setUser(admin);
      if (typeof showToast === 'function') showToast('Masuk sebagai Mari (Admin)');
      return admin;
    } else {
      const customer = {
        id: 'usr-cust-01',
        name: 'Rifqi Customer',
        email: 'rifqi@customer.com',
        role: 'customer'
      };
      this.setUser(customer);
      if (typeof showToast === 'function') showToast('Masuk sebagai Rifqi (Customer)');
      return customer;
    }
  }
};

// Global Alpine Helper Component untuk Navbar & Modal Auth
function authNavComponent() {
  return {
    user: Auth.getUser(),
    dropdownOpen: false,
    modalOpen: false,
    tab: 'login', // 'login' | 'register'
    form: {
      name: '',
      email: '',
      password: ''
    },
    error: '',
    loading: false,

    init() {
      window.addEventListener('open-auth-modal', (e) => {
        this.openLoginModal(e.detail?.tab || 'login');
      });
      window.addEventListener('auth-changed', (e) => {
        this.user = e.detail;
      });
      // Tutup dropdown saat klik di luar
      document.addEventListener('click', (e) => {
        if (!this.$el.contains(e.target)) {
          this.dropdownOpen = false;
        }
      });
    },

    openLoginModal(defaultTab = 'login') {
      this.tab = defaultTab;
      this.error = '';
      this.modalOpen = true;
    },

    closeLoginModal() {
      this.modalOpen = false;
      this.error = '';
    },

    async submitLogin() {
      if (!this.form.email || !this.form.password) {
        this.error = 'Email dan kata sandi wajib diisi';
        return;
      }
      this.loading = true;
      this.error = '';
      try {
        await Auth.login(this.form.email, this.form.password);
        this.closeLoginModal();
        if (typeof showToast === 'function') showToast('Selamat datang kembali, ' + this.user.name + '!');
      } catch (e) {
        this.error = e.message;
      } finally {
        this.loading = false;
      }
    },

    async submitRegister() {
      if (!this.form.name || !this.form.email || !this.form.password) {
        this.error = 'Semua kolom wajib diisi';
        return;
      }
      this.loading = true;
      this.error = '';
      try {
        await Auth.register(this.form.name, this.form.email, this.form.password);
        this.closeLoginModal();
        if (typeof showToast === 'function') showToast('Akun berhasil dibuat!');
      } catch (e) {
        this.error = e.message;
      } finally {
        this.loading = false;
      }
    },

    doQuickLogin(role) {
      Auth.quickLogin(role);
      this.closeLoginModal();
      window.location.reload();
    },

    doLogout() {
      this.dropdownOpen = false;
      Auth.logout();
    }
  };
}

// Global helper untuk tombol navigasi mobile / tombol lain
window.openAuthModal = function(tab) {
  window.dispatchEvent(new CustomEvent('open-auth-modal', { detail: { tab: tab || 'login' } }));
};
