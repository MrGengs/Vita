// VITA — Landing Page
const LandingPage = (() => {
  function render() {
    return `
    <div class="landing-page">
      <nav class="landing-nav" id="landing-nav">
        <div class="nav-brand">
          <svg width="32" height="32" viewBox="0 0 64 64" fill="none">
            <circle cx="32" cy="32" r="32" fill="url(#lg1)"/>
            <defs><linearGradient id="lg1" x1="0" y1="0" x2="64" y2="64">
              <stop offset="0%" stop-color="#52B847"/><stop offset="100%" stop-color="#2E7FBF"/>
            </linearGradient></defs>
            <path d="M20 32 C20 24 28 18 32 18 C36 18 44 24 44 32 C44 40 38 46 32 46 C28 46 22 42 20 38" stroke="white" stroke-width="3" stroke-linecap="round" fill="none"/>
            <circle cx="32" cy="32" r="6" fill="white"/>
          </svg>
          <span style="color:white;font-family:var(--font-sans);font-weight:800;font-size:1.3rem;">
            <span style="color:#7CCC73">vi</span><span style="color:#5AABDF">ta</span>
          </span>
        </div>
        <div class="nav-actions">
          <button id="landing-demo-nav" class="btn btn-ghost" style="color:rgba(255,255,255,0.8);display:flex;align-items:center;gap:6px;">
            <i data-lucide="play-circle" style="width:16px;height:16px;"></i>
            Demo
          </button>
          <a href="#login" class="btn btn-ghost" style="color:rgba(255,255,255,0.8);">Masuk</a>
          <a href="#register" class="btn btn-primary" style="font-size:0.875rem;">Daftar Gratis</a>
        </div>
      </nav>

      <div class="hero">
        <div class="hero-content">
          <div class="hero-badge"><span></span> Berbasis Penelitian Ilmiah &amp; IoT</div>
          <h1>Kenali Risiko Penyakitmu<br>Dari <span class="accent">Apa Yang Kamu Makan</span></h1>
          <p>VITA menggunakan kamera ESP32-CAM untuk menganalisis nutrisi makanan secara real-time, menghitung risiko penyakit metabolik kronis, dan memberikan saran kesehatan personal via AI.</p>
          <div class="hero-actions">
            <a href="#register" class="btn btn-primary btn-lg">Mulai Gratis →</a>
            <button id="landing-demo-hero" class="btn btn-lg" style="background:rgba(255,255,255,0.15);border:1.5px solid rgba(255,255,255,0.3);color:white;backdrop-filter:blur(8px);display:flex;align-items:center;gap:8px;">
              <i data-lucide="play" style="width:18px;height:18px;fill:currentColor;stroke:none;"></i>
              Lihat Demo Dashboard
            </button>
          </div>
          <!-- Demo notice -->
          <div style="margin-top:16px;display:flex;align-items:center;gap:8px;color:rgba(255,255,255,0.5);font-size:0.78rem;">
            <i data-lucide="info" style="width:14px;height:14px;flex-shrink:0;"></i>
            Mode demo menggunakan data contoh. <a href="#register" style="color:rgba(255,255,255,0.75);text-decoration:underline;">Daftar</a> untuk data nyata.
          </div>
        </div>
        <div class="hero-visual">
          <div class="hero-phone-mockup">
            <div class="mockup-screen">
              <div class="mockup-header"><span class="dot"></span><span>VITA Scanner</span></div>
              <div class="mockup-scan-area">
                <svg width="40" height="40" fill="none" stroke="rgba(52,211,153,0.6)" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 9V5a2 2 0 012-2h4M15 3h4a2 2 0 012 2v4M21 15v4a2 2 0 01-2 2h-4M9 21H5a2 2 0 01-2-2v-4"/><circle cx="12" cy="12" r="3" stroke-width="1.5"/></svg>
                <span>Scan makanan Anda</span>
              </div>
              <div class="mockup-nutrition">
                <div class="mockup-stat"><div class="val">420</div><div class="lbl">kkal</div></div>
                <div class="mockup-stat"><div class="val">28g</div><div class="lbl">protein</div></div>
                <div class="mockup-stat"><div class="val">22%</div><div class="lbl">risiko DM</div></div>
                <div class="mockup-stat"><div class="val">Rendah</div><div class="lbl">risiko CVD</div></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <section class="features-section">
        <div class="section-label">Fitur Unggulan</div>
        <h2 class="section-title">Teknologi Kesehatan di Genggaman Anda</h2>
        <p class="section-sub">Kombinasi IoT, Computer Vision, dan AI untuk pemantauan kesehatan metabolik yang komprehensif.</p>
        <div class="features-grid">
          ${[
            { icon:'📷', title:'ESP32-CAM Scanner', desc:'Scan makanan secara real-time menggunakan kamera IoT ESP32. Tanpa ketik manual, cukup foto!' },
            { icon:'🧠', title:'Analisis Nutrisi AI', desc:'Computer Vision mengidentifikasi makanan dan menghitung kalori, protein, karbohidrat, lemak secara otomatis.' },
            { icon:'🛡️', title:'Prediksi Risiko Penyakit', desc:'Hitung risiko Diabetes, Hipertensi, Obesitas & CVD berdasarkan histori konsumsi 30 hari terakhir.' },
            { icon:'🤖', title:'AI Konsultan Nutrisi', desc:'Chat 24/7 dengan asisten AI yang mengetahui profil dan riwayat makan Anda untuk saran yang personal.' },
            { icon:'📊', title:'Dashboard Lengkap', desc:'Pantau nutrisi harian, mingguan, dan bulanan dengan visualisasi grafik yang mudah dipahami.' },
            { icon:'🎯', title:'Personalisasi Penuh', desc:'Aplikasi menyesuaikan target kalori, rekomendasi nutrisi, dan peringatan risiko berdasarkan profil unik Anda.' }
          ].map(f => `
            <div class="feature-card">
              <div class="feature-icon"><span style="font-size:1.5rem;">${f.icon}</span></div>
              <h3>${f.title}</h3>
              <p>${f.desc}</p>
            </div>`).join('')}
        </div>
      </section>

      <section class="how-section">
        <div class="section-label">Cara Kerja</div>
        <h2 class="section-title">Mulai dalam 4 Langkah Mudah</h2>
        <p class="section-sub">Dari daftar hingga memantau risiko kesehatan, semua bisa dilakukan dalam hitungan menit.</p>
        <div class="steps-container">
          ${[
            { n:1, title:'Daftar & Isi Profil', desc:'Buat akun dan lengkapi data kesehatan: tinggi, berat, usia, kondisi kesehatan & tujuan.' },
            { n:2, title:'Scan Makanan', desc:'Gunakan kamera ESP32-CAM untuk foto makanan. AI langsung menganalisis nutrisinya.' },
            { n:3, title:'Lihat Analisis', desc:'Dapatkan detail nutrisi lengkap dan simpan ke log harian Anda secara otomatis.' },
            { n:4, title:'Pantau Risiko', desc:'Dashboard menghitung risk factor penyakit metabolik dari pola makan Anda.' }
          ].map(s => `
            <div class="step-item">
              <div class="step-num">${s.n}</div>
              <h4>${s.title}</h4>
              <p>${s.desc}</p>
            </div>`).join('')}
        </div>
      </section>

      <section class="stats-section">
        <div class="stats-grid">
          ${[
            { num:'12+', label:'Referensi Ilmiah (SLR)' },
            { num:'85-90%', label:'Akurasi Model Risiko' },
            { num:'100+', label:'Database Makanan Indonesia' },
            { num:'4', label:'Penyakit Dipantau' }
          ].map(s => `
            <div class="stat-item">
              <div class="stat-num">${s.num}</div>
              <div class="stat-label">${s.label}</div>
            </div>`).join('')}
        </div>
      </section>

      <footer class="landing-footer">
        <div class="footer-content">
          <div class="footer-brand">vita</div>
          <p class="footer-desc">Sistem pemantauan nutrisi dan risiko penyakit metabolik berbasis IoT dan AI. Penelitian berbasis SLR dengan 12+ referensi ilmiah internasional.</p>
          <div class="footer-bottom">
            <p>© 2026 VITA — kesehatan &amp; vitalitas · Powered by ESP32-CAM + Firebase + Gemini AI</p>
          </div>
        </div>
      </footer>
    </div>`;
  }

  function enterDemo() {
    VitaStore.set('demoMode', true);
    VitaStore.set('profile', {
      name: 'Demo User',
      age: 28,
      gender: 'male',
      height: 170,
      weight: 72,
      bmi: 24.9,
      goals: ['Hidup Lebih Sehat'],
      onboardingComplete: true
    });
    // Update sidebar user info
    const nameEl = document.getElementById('sidebar-name');
    const goalEl = document.getElementById('sidebar-goal');
    const avatarEl = document.getElementById('sidebar-avatar');
    if (nameEl) nameEl.textContent = 'Demo User';
    if (goalEl) goalEl.textContent = 'Hidup Lebih Sehat';
    if (avatarEl) avatarEl.textContent = 'DU';
    VitaRouter.navigate('dashboard');
  }

  function init() {
    // Scroll navbar effect
    const nav = document.getElementById('landing-nav');
    if (nav) {
      window.addEventListener('scroll', () => {
        nav.classList.toggle('scrolled', window.scrollY > 50);
      }, { passive: true });
    }
    // Demo buttons
    document.getElementById('landing-demo-hero')?.addEventListener('click', enterDemo);
    document.getElementById('landing-demo-nav')?.addEventListener('click', enterDemo);
  }

  return { render, init };
})();
