// VITA — Auth Pages (Login, Register, Forgot Password)
const AuthPages = (() => {

  function renderLogin() {
    return `
    <div class="auth-page">
      <div class="auth-card animate-in">
        <div class="auth-logo">
          <svg width="52" height="52" viewBox="0 0 64 64" fill="none" style="margin:0 auto 12px;">
            <circle cx="32" cy="32" r="32" fill="url(#ag1)"/>
            <defs><linearGradient id="ag1" x1="0" y1="0" x2="64" y2="64">
              <stop offset="0%" stop-color="#52B847"/><stop offset="100%" stop-color="#2E7FBF"/>
            </linearGradient></defs>
            <path d="M20 32 C20 24 28 18 32 18 C36 18 44 24 44 32 C44 40 38 46 32 46 C28 46 22 42 20 38" stroke="white" stroke-width="3" stroke-linecap="round" fill="none"/>
            <circle cx="32" cy="32" r="6" fill="white"/>
          </svg>
          <h2>Selamat Datang Kembali</h2>
          <p>Masuk ke akun VITA Anda</p>
        </div>
        <div id="auth-error" class="form-error" style="display:none;margin-bottom:12px;padding:10px;background:var(--danger-light);border-radius:8px;"></div>
        <form id="login-form">
          <div class="form-group">
            <label class="form-label">Email</label>
            <input type="email" id="login-email" class="form-input" placeholder="email@contoh.com" required>
          </div>
          <div class="form-group">
            <label class="form-label" style="display:flex;justify-content:space-between;">
              <span>Kata Sandi</span>
              <a href="#forgot-password" style="color:var(--primary);font-weight:500;font-size:0.8rem;">Lupa sandi?</a>
            </label>
            <input type="password" id="login-password" class="form-input" placeholder="Minimal 8 karakter" required>
          </div>
          <button type="submit" class="btn btn-primary" style="width:100%;margin-top:4px;" id="login-submit">
            Masuk
          </button>
        </form>
        <div class="auth-divider">atau</div>
        <button class="btn-google" id="google-login">
          <svg width="18" height="18" viewBox="0 0 18 18"><path fill="#4285F4" d="M16.51 8H8.98v3h4.3c-.18 1-.74 1.48-1.6 2.04v2.01h2.6a7.8 7.8 0 002.38-5.88c0-.57-.05-.66-.15-1.18z"/><path fill="#34A853" d="M8.98 17c2.16 0 3.97-.72 5.3-1.94l-2.6-2a4.8 4.8 0 01-7.18-2.54H1.83v2.07A8 8 0 008.98 17z"/><path fill="#FBBC05" d="M4.5 10.52a4.8 4.8 0 010-3.04V5.41H1.83a8 8 0 000 7.18l2.67-2.07z"/><path fill="#EA4335" d="M8.98 4.18c1.17 0 2.23.4 3.06 1.2l2.3-2.3A8 8 0 001.83 5.4L4.5 7.49a4.77 4.77 0 014.48-3.3z"/></svg>
          Masuk dengan Google
        </button>
        <p class="auth-footer">Belum punya akun? <a href="#register">Daftar sekarang</a></p>
      </div>
    </div>`;
  }

  function renderRegister() {
    return `
    <div class="auth-page">
      <div class="auth-card animate-in">
        <div class="auth-logo">
          <svg width="52" height="52" viewBox="0 0 64 64" fill="none" style="margin:0 auto 12px;">
            <circle cx="32" cy="32" r="32" fill="url(#ag2)"/>
            <defs><linearGradient id="ag2" x1="0" y1="0" x2="64" y2="64">
              <stop offset="0%" stop-color="#52B847"/><stop offset="100%" stop-color="#2E7FBF"/>
            </linearGradient></defs>
            <path d="M20 32 C20 24 28 18 32 18 C36 18 44 24 44 32 C44 40 38 46 32 46 C28 46 22 42 20 38" stroke="white" stroke-width="3" stroke-linecap="round" fill="none"/>
            <circle cx="32" cy="32" r="6" fill="white"/>
          </svg>
          <h2>Buat Akun VITA</h2>
          <p>Mulai perjalanan hidup sehat Anda</p>
        </div>
        <div id="auth-error" class="form-error" style="display:none;margin-bottom:12px;padding:10px;background:var(--danger-light);border-radius:8px;"></div>
        <form id="register-form">
          <div class="form-group">
            <label class="form-label">Nama Lengkap</label>
            <input type="text" id="reg-name" class="form-input" placeholder="Nama Anda" required>
          </div>
          <div class="form-group">
            <label class="form-label">Email</label>
            <input type="email" id="reg-email" class="form-input" placeholder="email@contoh.com" required>
          </div>
          <div class="form-row">
            <div class="form-group" style="margin-bottom:0;">
              <label class="form-label">Kata Sandi</label>
              <input type="password" id="reg-password" class="form-input" placeholder="Min. 8 karakter" required minlength="8">
            </div>
            <div class="form-group" style="margin-bottom:0;">
              <label class="form-label">Konfirmasi Sandi</label>
              <input type="password" id="reg-confirm" class="form-input" placeholder="Ulangi sandi" required>
            </div>
          </div>
          <div class="form-group" style="margin-top:16px;">
            <label style="display:flex;align-items:flex-start;gap:10px;cursor:pointer;font-size:0.85rem;color:var(--text-secondary);">
              <input type="checkbox" id="reg-terms" required style="margin-top:2px;accent-color:var(--primary);">
              <span>Saya setuju dengan syarat & ketentuan penggunaan VITA</span>
            </label>
          </div>
          <button type="submit" class="btn btn-primary" style="width:100%;" id="register-submit">Buat Akun</button>
        </form>
        <div class="auth-divider">atau</div>
        <button class="btn-google" id="google-register">
          <svg width="18" height="18" viewBox="0 0 18 18"><path fill="#4285F4" d="M16.51 8H8.98v3h4.3c-.18 1-.74 1.48-1.6 2.04v2.01h2.6a7.8 7.8 0 002.38-5.88c0-.57-.05-.66-.15-1.18z"/><path fill="#34A853" d="M8.98 17c2.16 0 3.97-.72 5.3-1.94l-2.6-2a4.8 4.8 0 01-7.18-2.54H1.83v2.07A8 8 0 008.98 17z"/><path fill="#FBBC05" d="M4.5 10.52a4.8 4.8 0 010-3.04V5.41H1.83a8 8 0 000 7.18l2.67-2.07z"/><path fill="#EA4335" d="M8.98 4.18c1.17 0 2.23.4 3.06 1.2l2.3-2.3A8 8 0 001.83 5.4L4.5 7.49a4.77 4.77 0 014.48-3.3z"/></svg>
          Daftar dengan Google
        </button>
        <p class="auth-footer">Sudah punya akun? <a href="#login">Masuk di sini</a></p>
      </div>
    </div>`;
  }

  function renderForgot() {
    return `
    <div class="auth-page">
      <div class="auth-card animate-in">
        <div class="auth-logo">
          <div style="font-size:2.5rem;margin-bottom:12px;">🔑</div>
          <h2>Lupa Kata Sandi?</h2>
          <p>Masukkan email Anda dan kami akan mengirim link reset.</p>
        </div>
        <div id="auth-success" style="display:none;background:var(--success-light);color:#065f46;padding:12px;border-radius:8px;font-size:0.875rem;margin-bottom:12px;"></div>
        <form id="forgot-form">
          <div class="form-group">
            <label class="form-label">Email</label>
            <input type="email" id="forgot-email" class="form-input" placeholder="email@contoh.com" required>
          </div>
          <button type="submit" class="btn btn-primary" style="width:100%;" id="forgot-submit">Kirim Link Reset</button>
        </form>
        <p class="auth-footer" style="margin-top:16px;"><a href="#login">← Kembali ke halaman masuk</a></p>
      </div>
    </div>`;
  }

  function showError(msg) {
    const el = document.getElementById('auth-error');
    if (el) { el.textContent = msg; el.style.display = 'block'; }
  }

  function setLoading(btnId, loading) {
    const btn = document.getElementById(btnId);
    if (!btn) return;
    btn.disabled = loading;
    btn.classList.toggle('btn-loading', loading);
  }

  function initLogin() {
    document.getElementById('login-form')?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = document.getElementById('login-email').value.trim();
      const password = document.getElementById('login-password').value;
      setLoading('login-submit', true);
      try {
        await VitaAuth.signInWithEmail(email, password);
        VitaHelpers.showToast('Berhasil masuk!', 'success');
      } catch (err) {
        const msgs = { 'auth/user-not-found':'Email tidak terdaftar.','auth/wrong-password':'Kata sandi salah.','auth/invalid-email':'Format email tidak valid.','auth/too-many-requests':'Terlalu banyak percobaan. Coba lagi nanti.' };
        showError(msgs[err.code] || 'Gagal masuk. Periksa email dan kata sandi.');
        setLoading('login-submit', false);
      }
    });
    document.getElementById('google-login')?.addEventListener('click', async () => {
      try { await VitaAuth.signInWithGoogle(); }
      catch (err) { showError('Login Google gagal. Coba lagi.'); }
    });
  }

  function initRegister() {
    document.getElementById('register-form')?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const name = document.getElementById('reg-name').value.trim();
      const email = document.getElementById('reg-email').value.trim();
      const password = document.getElementById('reg-password').value;
      const confirm = document.getElementById('reg-confirm').value;
      if (password !== confirm) { showError('Kata sandi tidak cocok.'); return; }
      setLoading('register-submit', true);
      try {
        await VitaAuth.createAccount(email, password, name);
        VitaHelpers.showToast('Akun berhasil dibuat!', 'success');
      } catch (err) {
        const msgs = { 'auth/email-already-in-use':'Email sudah terdaftar.','auth/weak-password':'Kata sandi terlalu lemah (min. 8 karakter).','auth/invalid-email':'Format email tidak valid.' };
        showError(msgs[err.code] || 'Gagal membuat akun.');
        setLoading('register-submit', false);
      }
    });
    document.getElementById('google-register')?.addEventListener('click', async () => {
      try { await VitaAuth.signInWithGoogle(); }
      catch (err) { showError('Daftar Google gagal. Coba lagi.'); }
    });
  }

  function initForgot() {
    document.getElementById('forgot-form')?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = document.getElementById('forgot-email').value.trim();
      setLoading('forgot-submit', true);
      try {
        await VitaAuth.sendPasswordReset(email);
        const ok = document.getElementById('auth-success');
        if (ok) { ok.textContent = `Email reset telah dikirim ke ${email}. Cek inbox Anda.`; ok.style.display = 'block'; }
      } catch (err) {
        showError('Email tidak ditemukan atau terjadi kesalahan.');
      }
      setLoading('forgot-submit', false);
    });
  }

  return { renderLogin, renderRegister, renderForgot, initLogin, initRegister, initForgot };
})();
