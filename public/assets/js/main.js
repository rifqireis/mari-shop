/**
 * Global JavaScript Helpers & Utilities
 * Tubes Pengantar Basis Data - Neo-Brutalism Store
 */

// Helper Format Rupiah
function formatRupiah(number) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0
  }).format(number);
}

// Toast Notification Brutalist
function showToast(message, type = 'success') {
  let toastContainer = document.getElementById('toast-container');
  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.id = 'toast-container';
    toastContainer.style.position = 'fixed';
    toastContainer.style.bottom = '24px';
    toastContainer.style.right = '24px';
    toastContainer.style.zIndex = '9999';
    toastContainer.style.display = 'flex';
    toastContainer.style.flexDirection = 'column';
    toastContainer.style.gap = '12px';
    document.body.appendChild(toastContainer);
  }

  const toast = document.createElement('div');
  const bg = type === 'success' ? '#00E599' : (type === 'error' ? '#FF5353' : '#FFE600');
  
  toast.style.background = bg;
  toast.style.border = '3px solid #121212';
  toast.style.boxShadow = '4px 4px 0px #121212';
  toast.style.borderRadius = '8px';
  toast.style.padding = '12px 18px';
  toast.style.fontWeight = '700';
  toast.style.fontSize = '14px';
  toast.style.color = '#121212';
  toast.style.display = 'flex';
  toast.style.alignItems = 'center';
  toast.style.gap = '10px';
  toast.style.transition = 'all 0.2s ease';
  toast.innerText = message;

  toastContainer.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    setTimeout(() => toast.remove(), 200);
  }, 2500);
}

// Helper Copy to Clipboard
function copyToClipboard(text, successMsg = 'Berhasil disalin ke clipboard!') {
  navigator.clipboard.writeText(text).then(() => {
    showToast(successMsg, 'success');
  }).catch(() => {
    showToast('Gagal menyalin teks', 'error');
  });
}
