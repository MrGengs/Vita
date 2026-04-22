// VITA — Profile Page
const ProfilePage = (() => {

  function topbar() {
    return `
    <div class="vita-topbar">
      <div class="vita-topbar-left">
        <button class="vita-menu-btn" id="prof-menu-btn"><i data-lucide="menu"></i></button>
        <div class="topbar-brand">
          <span class="prof-topbar-title">Profil Saya</span>
        </div>
      </div>
      <div class="vita-topbar-right">
        <button class="vita-icon-btn" onclick="window.location.hash='dashboard'" title="Dashboard">
          <i data-lucide="layout-dashboard"></i>
        </button>
      </div>
    </div>`;
  }

  function render() {
    const p      = VitaStore.get('profile') || {};
    const user   = VitaStore.get('user') || {};
    const isDemo = VitaStore.get('demoMode');
    const bmi    = p.bmi || 0;
    const bmiInfo = bmi ? VitaHelpers.getBMICategory(bmi) : null;

    const stats = [
      { label: 'Tinggi', val: p.height || '—', unit: 'cm',  icon: 'ruler' },
      { label: 'Berat',  val: p.weight || '—', unit: 'kg',  icon: 'weight' },
      { label: 'Usia',   val: p.age    || '—', unit: 'thn', icon: 'calendar' },
      { label: 'Gender', val: p.gender === 'female' ? 'Wanita' : (p.gender === 'male' ? 'Pria' : '—'), unit: '', icon: 'user' },
    ];

    return `
    <div class="dash-bg">
      <div class="dash-orb dash-orb-1"></div>
      <div class="dash-orb dash-orb-2"></div>
      ${topbar()}
      <div class="dash-content">

        <!-- Hero -->
        <div class="prof-hero card-enter">
          <div class="prof-hero-avatar">
            ${VitaHelpers.getInitials(p.name || user.displayName || 'U')}
          </div>
          <h2 class="prof-hero-name">${p.name || user.displayName || 'Pengguna'}</h2>
          <div class="prof-hero-email">${isDemo ? '✨ Mode Demo' : (user.email || 'Email belum terdaftar')}</div>
          ${bmi ? `
          <div class="prof-hero-bmi">
            <span class="prof-bmi-val">${bmi.toFixed(1)}</span>
            <span class="prof-bmi-label" style="color:${bmiInfo.color};">${bmiInfo.label}</span>
          </div>` : ''}
        </div>

        <!-- Data Pribadi -->
        <div class="vita-card card-enter delay-1">
          <div class="card-section-title">
            <div class="card-section-label">
              <i data-lucide="user" style="width:15px;height:15px;color:var(--primary);"></i>
              Data Pribadi
            </div>
            <button class="btn-icon-sm" id="prof-edit-btn">
              <i data-lucide="edit-3" style="width:14px;height:14px;"></i>
              Edit
            </button>
          </div>
          <div class="prof-stats-grid">
            ${stats.map(s => `
            <div class="prof-stat-item">
              <div class="prof-stat-val">${s.val}${s.unit ? `<span class="prof-stat-unit">${s.unit}</span>` : ''}</div>
              <div class="prof-stat-label">${s.label}</div>
            </div>`).join('')}
          </div>
        </div>

        <!-- Target -->
        <div class="vita-card card-enter delay-2">
          <div class="card-section-title">
            <div class="card-section-label">
              <i data-lucide="target" style="width:15px;height:15px;color:var(--primary);"></i>
              Target Kesehatan
            </div>
          </div>
          <div class="prof-goals-wrap">
            ${(p.goals || ['Menjaga Kesehatan']).map(g => `
              <span class="vita-tag">${g}</span>`).join('')}
          </div>
        </div>

        <!-- ESP32-CAM -->
        <div class="vita-card card-enter delay-3">
          <div class="card-section-title">
            <div class="card-section-label">
              <i data-lucide="cpu" style="width:15px;height:15px;color:var(--primary);"></i>
              Perangkat ESP32-CAM
            </div>
          </div>
          <div class="prof-esp-row">
            <input type="text" id="prof-ip-input" class="form-input prof-ip-input"
              placeholder="192.168.x.x" value="${VitaESP32?.getIP() || ''}">
            <button class="btn btn-primary prof-test-btn" id="prof-test-btn">
              <i data-lucide="wifi" style="width:14px;height:14px;"></i>
              Test
            </button>
          </div>
          <p class="prof-esp-hint">Pastikan Anda dan perangkat terhubung ke WiFi yang sama.</p>
        </div>

        <!-- Akun -->
        <div class="vita-card card-enter delay-4">
          <div class="card-section-title">
            <div class="card-section-label">
              <i data-lucide="key-round" style="width:15px;height:15px;color:var(--primary);"></i>
              Akun &amp; Keamanan
            </div>
          </div>
          <button class="btn btn-danger prof-logout-btn" id="profile-logout">
            <i data-lucide="log-out" style="width:16px;height:16px;"></i>
            Keluar dari Akun
          </button>
        </div>

        <div class="dash-bottom-spacer"></div>
      </div>
    </div>`;
  }

  function init() {
    document.getElementById('prof-menu-btn')?.addEventListener('click', () => {
      document.getElementById('sidebar')?.classList.toggle('open');
      document.getElementById('sidebar-overlay')?.classList.toggle('hidden');
    });

    document.getElementById('prof-test-btn')?.addEventListener('click', async () => {
      const ip  = document.getElementById('prof-ip-input')?.value?.trim();
      if (!ip) { VitaHelpers.showToast('Silakan isi IP Address terlebih dahulu', 'error'); return; }

      const btn = document.getElementById('prof-test-btn');
      btn.innerHTML = '<i data-lucide="loader-circle" style="width:14px;height:14px;animation:spin 1s linear infinite;"></i> Menghubungkan...';
      if (typeof lucide !== 'undefined') lucide.createIcons();

      VitaESP32.setIP(ip);
      const isOk = await VitaESP32.testConnection(ip);

      btn.innerHTML = '<i data-lucide="wifi" style="width:14px;height:14px;"></i> Test';
      if (typeof lucide !== 'undefined') lucide.createIcons();

      VitaHelpers.showToast(
        isOk ? 'ESP32-CAM berhasil terhubung! ✓' : 'Gagal terhubung ke ESP32-CAM',
        isOk ? 'success' : 'error'
      );
    });

    document.getElementById('profile-logout')?.addEventListener('click', async () => {
      if (VitaStore.get('demoMode')) {
        VitaStore.set('demoMode', false);
        VitaStore.set('profile', null);
        VitaRouter.navigate('login');
        return;
      }
      await VitaAuth.signOut();
      VitaRouter.navigate('login');
    });
  }

  return { render, init };
})();
