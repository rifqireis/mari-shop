/**
 * Copy to Clipboard (VA, kode voucher, kredensial akun)
 * Butuh main.js (showToast). Punya fallback jika Clipboard API tidak tersedia
 * (misalnya diakses lewat http://192.168.x.x dari HP).
 */
function copyToClipboard(text, successMsg = 'Berhasil disalin ke clipboard!') {
  const done = () => showToast(successMsg, 'success');
  const fail = () => showToast('Gagal menyalin teks', 'error');

  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard.writeText(text).then(done).catch(() => legacyCopy(text) ? done() : fail());
  } else {
    legacyCopy(text) ? done() : fail();
  }
}

function legacyCopy(text) {
  try {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly', '');
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand('copy');
    ta.remove();
    return ok;
  } catch (e) { return false; }
}
