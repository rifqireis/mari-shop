/**
 * Global JavaScript Helpers & Utilities
 * Tubes Pengantar Basis Data - Neo-Brutalism Store
 * (Dimuat di SEMUA halaman, sebelum Alpine.js)
 */

// ---------- Format & URL ----------
function formatRupiah(number) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency', currency: 'IDR', maximumFractionDigits: 0
  }).format(Number(number) || 0);
}

function getParam(name) {
  return new URLSearchParams(window.location.search).get(name);
}

// Thumbnail: dukung URL penuh, path absolut, atau path relatif dari DB ("assets/img/...")
const PLACEHOLDER_IMG = '/assets/img/products/placeholder.svg';
function thumbUrl(u) {
  if (!u) return PLACEHOLDER_IMG;
  return (/^(https?:)?\/\//.test(u) || u.startsWith('/')) ? u : '/' + u;
}
function imgFallback(e) {
  e.target.onerror = null;
  e.target.src = PLACEHOLDER_IMG;
}

// ---------- Fetch API (error-aware) ----------
async function api(path, options = {}) {
  let res;
  try {
    res = await fetch('/api' + path, {
      headers: { 'Content-Type': 'application/json' },
      ...options
    });
  } catch (e) {
    const err = new Error('Tidak bisa terhubung ke server. Pastikan "npm run dev" sedang berjalan.');
    err.status = 0;
    throw err;
  }
  let data;
  try { data = await res.json(); } catch (e) { data = { success: false, message: 'Respon server tidak valid' }; }
  if (!res.ok || data.success === false) {
    const err = new Error(data.message || 'Terjadi kesalahan pada server');
    err.status = res.status;
    throw err;
  }
  return data;
}

// ---------- Status transaksi -> badge ----------
function statusMeta(order) {
  const p = order && order.payment_status;
  const f = order && order.fulfillment_status;
  if (p === 'paid' && f === 'success') return { label: 'BERHASIL', cls: 'badge-green', icon: 'check' };
  if (p === 'paid') return { label: 'SEDANG DIPROSES', cls: 'badge-blue', icon: 'bolt' };
  if (p === 'expired') return { label: 'EXPIRED', cls: 'badge-coral', icon: 'clock' };
  if (p === 'failed') return { label: 'GAGAL', cls: 'badge-coral', icon: 'cross' };
  return { label: 'MENUNGGU PEMBAYARAN', cls: 'badge-yellow', icon: 'clock' };
}

// ---------- Animasi getar untuk input invalid ----------
function shake(el) {
  if (!el) return;
  el.classList.remove('shake');
  void el.offsetWidth; // restart animasi
  el.classList.add('shake');
}

// ---------- Riwayat invoice di browser (untuk halaman Cek Pesanan) ----------
const INV_KEY = 'mari_invoices';
function getRememberedInvoices() {
  try { return JSON.parse(localStorage.getItem(INV_KEY)) || []; } catch (e) { return []; }
}
function rememberInvoice(id) {
  try {
    const list = getRememberedInvoices().filter(x => x !== id);
    list.unshift(id);
    localStorage.setItem(INV_KEY, JSON.stringify(list.slice(0, 8)));
  } catch (e) { /* storage tidak tersedia: abaikan */ }
}

// ---------- Toast Notification Brutalist ----------
function showToast(message, type = 'success') {
  let box = document.getElementById('toast-container');
  if (!box) {
    box = document.createElement('div');
    box.id = 'toast-container';
    box.setAttribute('role', 'status');
    box.setAttribute('aria-live', 'polite');
    Object.assign(box.style, {
      position: 'fixed', bottom: '24px', right: '24px', zIndex: '9999',
      display: 'flex', flexDirection: 'column', gap: '12px', maxWidth: 'calc(100vw - 48px)'
    });
    document.body.appendChild(box);
  }
  const toast = document.createElement('div');
  const bg = type === 'success' ? '#00E599' : (type === 'error' ? '#FF5353' : '#FFE600');
  Object.assign(toast.style, {
    background: bg, border: '3px solid #121212', boxShadow: '4px 4px 0px #121212',
    borderRadius: '8px', padding: '12px 18px', fontWeight: '700', fontSize: '14px',
    color: '#121212', transition: 'all 0.2s ease'
  });
  toast.textContent = message;
  box.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    setTimeout(() => toast.remove(), 200);
  }, 2500);
}
