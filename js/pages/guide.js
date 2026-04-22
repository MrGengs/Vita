// VITA — Panduan Penggunaan
const GuidePage = (() => {

  function topbar() {
    const p = VitaStore.get('profile') || {};
    return `
    <div class="vita-topbar">
      <div class="vita-topbar-left">
        <button class="vita-menu-btn" id="guide-menu-btn"><i data-lucide="menu"></i></button>
        <div class="topbar-brand">
          <svg width="26" height="26" viewBox="0 0 64 64" fill="none">
            <circle cx="32" cy="32" r="32" fill="url(#guideGrad)"/>
            <defs><linearGradient id="guideGrad" x1="0" y1="0" x2="64" y2="64">
              <stop offset="0%" stop-color="#7CCC73"/><stop offset="100%" stop-color="#93C5FD"/>
            </linearGradient></defs>
            <path d="M20 32 C20 24 28 18 32 18 C36 18 44 24 44 32 C44 40 38 46 32 46 C28 46 22 42 20 38"
              stroke="white" stroke-width="3" stroke-linecap="round" fill="none"/>
            <circle cx="32" cy="32" r="6" fill="white"/>
          </svg>
          <span><span class="brand-vi">vi</span><span class="brand-ta">ta</span></span>
        </div>
      </div>
      <div class="vita-topbar-right">
        <button class="vita-icon-btn" onclick="window.location.hash='dashboard'" title="Dashboard">
          <i data-lucide="layout-dashboard"></i>
        </button>
        <div class="vita-avatar" style="padding:0;overflow:hidden;">${VitaHelpers.getAvatar(p.name || 'U', p.photoURL)}</div>
      </div>
    </div>`;
  }

  function step(n, text) {
    return `
    <div style="display:flex;gap:10px;align-items:flex-start;padding:8px 0;">
      <div style="width:22px;height:22px;border-radius:50%;background:var(--primary);color:white;
                  font-size:0.7rem;font-weight:800;display:flex;align-items:center;justify-content:center;flex-shrink:0;margin-top:1px;">
        ${n}
      </div>
      <span style="font-size:0.84rem;color:var(--text);line-height:1.5;">${text}</span>
    </div>`;
  }

  function tip(text) {
    return `
    <div style="background:rgba(82,184,71,0.08);border-left:3px solid #52B847;border-radius:0 8px 8px 0;
                padding:10px 12px;margin-top:12px;display:flex;gap:8px;align-items:flex-start;">
      <i data-lucide="lightbulb" style="width:15px;height:15px;color:#52B847;flex-shrink:0;margin-top:1px;"></i>
      <span style="font-size:0.8rem;color:#2D6A27;line-height:1.5;">${text}</span>
    </div>`;
  }

  function warn(text) {
    return `
    <div style="background:rgba(245,158,11,0.08);border-left:3px solid #F59E0B;border-radius:0 8px 8px 0;
                padding:10px 12px;margin-top:12px;display:flex;gap:8px;align-items:flex-start;">
      <i data-lucide="triangle-alert" style="width:15px;height:15px;color:#F59E0B;flex-shrink:0;margin-top:1px;"></i>
      <span style="font-size:0.8rem;color:#92400E;line-height:1.5;">${text}</span>
    </div>`;
  }

  function section(id, icon, title, badge, badgeColor, description, steps, extra = '') {
    return `
    <div class="vita-card card-enter guide-section" id="guide-${id}"
      style="margin-bottom:14px;border-radius:16px;overflow:hidden;padding:0;">
      <!-- Header -->
      <div style="background:linear-gradient(135deg,${badgeColor}12,${badgeColor}06);
                  border-bottom:1px solid ${badgeColor}20;padding:16px 18px;
                  display:flex;align-items:center;gap:12px;">
        <div style="width:40px;height:40px;border-radius:12px;background:${badgeColor}18;
                    display:flex;align-items:center;justify-content:center;flex-shrink:0;">
          <i data-lucide="${icon}" style="width:20px;height:20px;color:${badgeColor};"></i>
        </div>
        <div style="flex:1;">
          <div style="font-weight:800;font-size:0.95rem;color:var(--text);">${title}</div>
          <span style="font-size:0.68rem;font-weight:700;text-transform:uppercase;letter-spacing:0.05em;
                       color:${badgeColor};background:${badgeColor}15;padding:2px 8px;border-radius:20px;">
            ${badge}
          </span>
        </div>
        <button class="guide-toggle" data-target="guide-body-${id}"
          style="width:30px;height:30px;border:none;background:${badgeColor}12;border-radius:8px;
                 cursor:pointer;display:flex;align-items:center;justify-content:center;flex-shrink:0;transition:background 0.2s;">
          <i data-lucide="chevron-down" style="width:16px;height:16px;color:${badgeColor};transition:transform 0.3s;"></i>
        </button>
      </div>
      <!-- Body (collapsible) -->
      <div id="guide-body-${id}" style="padding:16px 18px;display:none;">
        <p style="font-size:0.83rem;color:var(--text-secondary);line-height:1.6;margin-bottom:14px;
                  padding-bottom:14px;border-bottom:1px solid var(--border-light);">
          ${description}
        </p>
        <div style="font-size:0.78rem;font-weight:700;text-transform:uppercase;letter-spacing:0.06em;
                    color:var(--text-light);margin-bottom:6px;">Langkah-langkah</div>
        ${steps}
        ${extra}
      </div>
    </div>`;
  }

  function render() {
    const p = VitaStore.get('profile') || {};

    const SECTIONS = [
      section(
        'dashboard', 'layout-dashboard', 'Dashboard', 'Beranda', '#2E7FBF',
        'Dashboard adalah pusat kendali VITA. Di sini Anda bisa melihat ringkasan kalori harian, progress makronutrisi, skor risiko terkini, dan aktivitas terakhir — semuanya dalam satu tampilan.',
        [
          step(1, 'Buka aplikasi → Anda langsung diarahkan ke Dashboard setelah login.'),
          step(2, 'Lihat <strong>ring kalori</strong> di bagian atas — menunjukkan berapa kkal sudah dikonsumsi vs target Anda hari ini.'),
          step(3, 'Scroll ke bawah untuk melihat bar <strong>Protein, Karbohidrat, dan Lemak</strong>.'),
          step(4, 'Bagian <strong>Risiko Metabolik</strong> menampilkan skor terkini untuk Diabetes, Hipertensi, Obesitas, dan CVD.'),
          step(5, 'Klik kartu mana saja untuk navigasi ke halaman detail terkait.'),
        ].join(''),
        tip('Target kalori dihitung otomatis dari profil Anda (usia, berat, tinggi, gender, dan tujuan kesehatan). Perbarui profil jika angka terasa tidak sesuai.')
      ),

      section(
        'scanner', 'scan-line', 'Scanner Makanan', 'IoT + AI', '#52B847',
        'Fitur unggulan VITA — gunakan ESP32-CAM untuk memotret makanan Anda secara langsung. Gambar dikirim ke AI Gemini untuk diidentifikasi dan dihitung kandungan gizinya secara otomatis.',
        [
          step(1, 'Pastikan ESP32-CAM <strong>menyala dan terhubung ke WiFi</strong> yang sama dengan perangkat Anda.'),
          step(2, 'Buka halaman <strong>Scanner</strong> → klik tombol <strong>"Pilih"</strong> untuk memilih perangkat IoT.'),
          step(3, 'Pilih perangkat dari daftar — kartu <span style="color:#52B847;font-weight:700;">hijau</span> berarti tersedia, <span style="color:#EF4444;font-weight:700;">merah</span> berarti sedang dipakai pengguna lain.'),
          step(4, 'Tunggu stream kamera muncul di layar — ini berarti koneksi berhasil.'),
          step(5, 'Arahkan ESP32-CAM ke makanan, lalu <strong>tekan tombol fisik</strong> di perangkat untuk memotret.'),
          step(6, 'Foto otomatis terdeteksi di web — klik <strong>"Analisis Gambar"</strong> untuk memulai identifikasi AI.'),
          step(7, 'Setelah hasil muncul, pilih jenis makan (Sarapan/Siang/Snack/Malam) → klik <strong>"Simpan ke Log"</strong>.'),
        ].join(''),
        [
          tip('Pastikan pencahayaan cukup agar AI dapat mengidentifikasi makanan dengan akurasi lebih tinggi.'),
          warn('Hanya satu pengguna yang bisa menggunakan satu perangkat secara bersamaan. Jika perangkat merah, tunggu pengguna lain selesai.')
        ].join('')
      ),

      section(
        'nutrition', 'chart-column-increasing', 'Pelacak Nutrisi', 'Harian', '#F59E0B',
        'Halaman ini menampilkan semua makanan yang Anda konsumsi hari ini beserta rincian makronutrisinya. Anda juga bisa menambah log makanan secara manual jika tidak menggunakan scanner.',
        [
          step(1, 'Buka <strong>Pelacak Nutrisi</strong> — data hari ini otomatis dimuat dari Firestore.'),
          step(2, 'Gunakan tab <strong>Semua / Sarapan / Siang / Snack / Malam</strong> untuk memfilter log.'),
          step(3, 'Navigasi hari sebelumnya dengan tombol <strong>← →</strong> di pojok kanan atas.'),
          step(4, 'Untuk menambah manual: isi <strong>nama makanan</strong> dan <strong>kalori</strong> di form bawah → klik Simpan.'),
          step(5, 'Hapus entri dengan menekan ikon <strong>tempat sampah</strong> merah di sisi kanan kartu makanan.'),
        ].join(''),
        tip('Makanan yang disimpan dari Scanner otomatis muncul di sini beserta foto thumbnail-nya.')
      ),

      section(
        'history', 'clock-3', 'Riwayat Makan', 'Tren', '#8B5CF6',
        'Visualisasikan tren asupan kalori Anda selama 7 hari, 30 hari, atau 3 bulan terakhir. Lengkap dengan grafik garis dan kartu harian yang menampilkan foto makanan.',
        [
          step(1, 'Buka <strong>Riwayat</strong> — grafik 7 hari terakhir langsung ditampilkan.'),
          step(2, 'Pilih rentang waktu dengan filter chip: <strong>7 Hari / 30 Hari / 3 Bulan</strong>.'),
          step(3, 'Lihat ringkasan di bagian atas: rata-rata kalori, kalori tertinggi, dan total makanan.'),
          step(4, 'Setiap kartu harian menampilkan bar progress terhadap target kalori Anda.'),
          step(5, 'Foto makanan (dari Scanner) muncul sebagai <strong>thumbnail kecil</strong> di bawah bar kalori.'),
        ].join(''),
        tip('Bar berwarna merah berarti Anda melebihi target kalori pada hari tersebut.')
      ),

      section(
        'risk', 'shield-check', 'Faktor Risiko', 'Analisis', '#EF4444',
        'VITA menghitung skor risiko 4 penyakit metabolik kronis berdasarkan pola makan Anda menggunakan algoritma berbasis Systematic Literature Review (SLR) dari 12 literatur ilmiah.',
        [
          step(1, 'Buka <strong>Faktor Risiko</strong> — skor dihitung otomatis dari data nutrisi terkini.'),
          step(2, 'Lihat 4 kartu risiko: <strong>Diabetes, Hipertensi, Obesitas, CVD</strong> masing-masing dengan skor 0–100%.'),
          step(3, 'Radar chart di tengah menunjukkan profil risiko Anda secara visual.'),
          step(4, 'Scroll ke bawah untuk melihat <strong>faktor risiko spesifik</strong> yang terdeteksi dari pola makan.'),
          step(5, 'Baca <strong>rekomendasi personal</strong> yang dihasilkan berdasarkan skor Anda.'),
        ].join(''),
        [
          tip('Skor dihitung dari akumulasi nutrisi 7 hari terakhir. Catat makanan secara rutin agar skor akurat.'),
          warn('VITA bukan alat diagnosis medis. Konsultasikan skor tinggi ke dokter atau ahli gizi Anda.')
        ].join('')
      ),

      section(
        'consultant', 'message-circle', 'Konsultan AI', 'Gemini AI', '#2E7FBF',
        'Chat dengan VITA AI yang sudah mengetahui profil, data makan hari ini, dan skor risiko Anda. AI akan memberikan saran nutrisi yang personal dan berbasis bukti ilmiah.',
        [
          step(1, 'Buka <strong>Konsultan AI</strong> — AI otomatis memuat data makan Anda hari ini dan kemarin dari Firestore.'),
          step(2, 'Gunakan <strong>chip saran</strong> di bagian bawah sebagai pertanyaan cepat, atau ketik pertanyaan sendiri.'),
          step(3, 'AI mengetahui BMI, risiko metabolik, dan apa yang sudah Anda makan — tanyakan rekomendasi menu, evaluasi pola makan, atau penjelasan risiko.'),
          step(4, 'Riwayat percakapan tersimpan selama sesi — Anda bisa lanjutkan topik sebelumnya.'),
        ].join(''),
        [
          tip('Semakin lengkap log makanan Anda di Pelacak Nutrisi, semakin akurat saran yang diberikan AI.'),
          warn('Pastikan API Key Gemini sudah diisi di pengaturan. Jika AI tidak merespons, cek koneksi internet atau tambah API Key baru di aistudio.google.com.')
        ].join('')
      ),

      section(
        'profile', 'user-round', 'Profil & Pengaturan', 'Akun', '#64748B',
        'Kelola data personal Anda, konfigurasi perangkat ESP32-CAM, dan atur preferensi aplikasi. Data profil digunakan untuk menghitung target kalori dan skor risiko.',
        [
          step(1, 'Buka <strong>Profil</strong> — lihat kartu data personal (nama, usia, BMI, gender).'),
          step(2, 'Klik <strong>"Edit Profil"</strong> untuk memperbarui berat badan, tinggi, atau tujuan kesehatan.'),
          step(3, 'Di bagian <strong>Perangkat IoT</strong> — masukkan IP address ESP32-CAM jika diperlukan.'),
          step(4, 'Bagian <strong>Target Kesehatan</strong> menampilkan 3 tujuan yang dipilih saat onboarding.'),
          step(5, 'Klik <strong>"Keluar"</strong> untuk logout — sesi dan kunci perangkat otomatis dilepas.'),
        ].join(''),
        tip('Perbarui berat badan secara berkala agar target kalori dan skor risiko selalu akurat sesuai kondisi terkini Anda.')
      ),
    ];

    return `
    <div class="dash-bg">
      <div class="dash-orb dash-orb-1"></div>
      <div class="dash-orb dash-orb-2"></div>
      ${topbar()}
      <div class="dash-content">

        <!-- Hero -->
        <div class="vita-welcome card-enter" style="margin-bottom:16px;">
          <div style="display:flex;align-items:center;gap:14px;position:relative;z-index:1;">
            <div style="width:48px;height:48px;border-radius:14px;background:rgba(255,255,255,0.18);
                        display:flex;align-items:center;justify-content:center;flex-shrink:0;">
              <i data-lucide="book-open" style="width:24px;height:24px;color:white;"></i>
            </div>
            <div>
              <h2 style="font-size:1.1rem;font-weight:800;color:white;margin:0 0 3px;">Panduan Penggunaan</h2>
              <p style="font-size:0.8rem;color:rgba(255,255,255,0.75);margin:0;">
                Pelajari cara menggunakan setiap fitur VITA secara optimal
              </p>
            </div>
          </div>
        </div>

        <!-- Quick Nav -->
        <div class="card-enter delay-1" style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:16px;">
          ${[
            ['layout-dashboard','Dashboard','#2E7FBF','dashboard'],
            ['scan-line','Scanner','#52B847','scanner'],
            ['chart-column-increasing','Nutrisi','#F59E0B','nutrition'],
            ['clock-3','Riwayat','#8B5CF6','history'],
            ['shield-check','Risiko','#EF4444','risk'],
            ['message-circle','AI','#2E7FBF','consultant'],
            ['user-round','Profil','#64748B','profile'],
          ].map(([icon, label, color, id]) => `
            <button onclick="document.getElementById('guide-${id}').scrollIntoView({behavior:'smooth',block:'start'})"
              style="display:flex;align-items:center;gap:5px;padding:6px 12px;border:1.5px solid ${color}30;
                     border-radius:20px;background:${color}10;color:${color};font-size:0.75rem;font-weight:700;
                     cursor:pointer;transition:all 0.2s;"
              onmouseover="this.style.background='${color}22'"
              onmouseout="this.style.background='${color}10'">
              <i data-lucide="${icon}" style="width:12px;height:12px;"></i>
              ${label}
            </button>`).join('')}
        </div>

        <!-- Sections -->
        <div class="card-enter delay-2">
          ${SECTIONS.join('')}
        </div>

        <!-- Footer note -->
        <div class="card-enter delay-3" style="text-align:center;padding:20px 0 8px;">
          <div style="font-size:0.75rem;color:var(--text-light);line-height:1.7;">
            VITA v1.0 — Berbasis ESP32-CAM + Firebase + Gemini AI<br>
            <a href="#dashboard" style="color:var(--primary);font-weight:600;text-decoration:none;">
              Kembali ke Dashboard →
            </a>
          </div>
        </div>

        <div class="dash-bottom-spacer"></div>
      </div>
    </div>`;
  }

  function init() {
    document.getElementById('guide-menu-btn')?.addEventListener('click', () => {
      document.getElementById('sidebar')?.classList.toggle('open');
      document.getElementById('sidebar-overlay')?.classList.toggle('hidden');
    });

    // Accordion toggle
    document.querySelectorAll('.guide-toggle').forEach(btn => {
      btn.addEventListener('click', () => {
        const targetId = btn.dataset.target;
        const body     = document.getElementById(targetId);
        const icon     = btn.querySelector('[data-lucide="chevron-down"]');
        if (!body) return;

        const isOpen = body.style.display !== 'none';

        if (isOpen) {
          body.style.maxHeight = body.scrollHeight + 'px';
          requestAnimationFrame(() => {
            body.style.transition = 'max-height 0.3s ease, opacity 0.3s ease';
            body.style.maxHeight  = '0';
            body.style.opacity    = '0';
          });
          setTimeout(() => { body.style.display = 'none'; body.style.maxHeight = ''; body.style.opacity = ''; }, 300);
          if (icon) icon.style.transform = 'rotate(0deg)';
        } else {
          body.style.display    = 'block';
          body.style.maxHeight  = '0';
          body.style.opacity    = '0';
          body.style.overflow   = 'hidden';
          requestAnimationFrame(() => {
            body.style.transition = 'max-height 0.35s ease, opacity 0.3s ease';
            body.style.maxHeight  = body.scrollHeight + 'px';
            body.style.opacity    = '1';
          });
          setTimeout(() => { body.style.maxHeight = 'none'; body.style.overflow = ''; }, 360);
          if (icon) icon.style.transform = 'rotate(180deg)';
        }

        if (typeof lucide !== 'undefined') lucide.createIcons();
      });
    });

    // Buka section pertama secara default
    const firstToggle = document.querySelector('.guide-toggle');
    if (firstToggle) firstToggle.click();
  }

  return { render, init };
})();
