// VITA — Profile Page
const ProfilePage = (() => {

  function topbar() {
    return `
    <div class="vita-topbar">
      <div class="vita-topbar-left">
        <button class="vita-menu-btn" id="prof-menu-btn"><i data-lucide="menu"></i></button>
        <div class="topbar-brand">
          <span style="color:var(--primary);font-weight:800;font-size:1.2rem;">Profil Saya</span>
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
    const p = VitaStore.get('profile') || {};
    const user = VitaStore.get('user') || {};
    const isDemo = VitaStore.get('demoMode');
    
    return `
    <div class="dash-bg">
      <div class="dash-orb dash-orb-1"></div>
      <div class="dash-orb dash-orb-2"></div>
      ${topbar()}
      <div class="dash-content">

        <!-- Hero Card -->
        <div class="vita-card card-enter" style="background:linear-gradient(135deg, #1A5F96, #2E7FBF); border:none; text-align:center; padding:32px 20px;">
          <div style="width:80px; height:80px; background:white; color:var(--primary); font-size:2rem; font-weight:800; border-radius:50%; display:flex; align-items:center; justify-content:center; margin:0 auto 16px; font-family:var(--font-sans); box-shadow:0 8px 16px rgba(0,0,0,0.1);">
            ${VitaHelpers.getInitials(p.name || user.displayName || 'U')}
          </div>
          <h2 style="font-size:1.3rem; font-weight:700; color:white; margin:0 0 4px;">${p.name || user.displayName || 'Pengguna'}</h2>
          <div style="font-size:0.85rem; color:rgba(255,255,255,0.8);">${isDemo ? 'Mode Demo' : (user.email || 'Email belum terdaftar')}</div>
        </div>

        <!-- Data Pribadi -->
        <div class="vita-card card-enter delay-1">
          <div style="font-size:0.9rem; font-weight:700; color:var(--text); margin-bottom:16px; display:flex; align-items:center; justify-content:space-between;">
            <div style="display:flex; align-items:center; gap:6px;">
              <i data-lucide="user" style="width:16px; height:16px; color:var(--primary);"></i> Data Pribadi
            </div>
            <button class="btn btn-ghost" style="padding:4px 8px; font-size:0.75rem; display:flex; gap:4px; align-items:center;">
              <i data-lucide="edit-3" style="width:14px; height:14px;"></i> Edit
            </button>
          </div>
          <div style="display:grid; grid-template-columns:1fr 1fr; gap:16px;">
            <div style="background:var(--bg-light); border-radius:12px; padding:12px; text-align:center;">
              <div style="font-size:1.2rem; font-weight:700; color:var(--text); font-family:var(--font-sans);">${p.height || '—'} <span style="font-size:0.8rem; color:var(--text-secondary); font-weight:500;">cm</span></div>
              <div style="font-size:0.75rem; color:var(--text-secondary); margin-top:2px;">Tinggi</div>
            </div>
            <div style="background:var(--bg-light); border-radius:12px; padding:12px; text-align:center;">
              <div style="font-size:1.2rem; font-weight:700; color:var(--text); font-family:var(--font-sans);">${p.weight || '—'} <span style="font-size:0.8rem; color:var(--text-secondary); font-weight:500;">kg</span></div>
              <div style="font-size:0.75rem; color:var(--text-secondary); margin-top:2px;">Berat</div>
            </div>
            <div style="background:var(--bg-light); border-radius:12px; padding:12px; text-align:center;">
              <div style="font-size:1.2rem; font-weight:700; color:var(--text); font-family:var(--font-sans);">${p.age || '—'} <span style="font-size:0.8rem; color:var(--text-secondary); font-weight:500;">thn</span></div>
              <div style="font-size:0.75rem; color:var(--text-secondary); margin-top:2px;">Usia</div>
            </div>
            <div style="background:var(--bg-light); border-radius:12px; padding:12px; text-align:center;">
              <div style="font-size:1.2rem; font-weight:700; color:var(--text); font-family:var(--font-sans);">${p.gender === 'female' ? 'Wanita' : (p.gender === 'male' ? 'Pria' : '—')}</div>
              <div style="font-size:0.75rem; color:var(--text-secondary); margin-top:2px;">Gender</div>
            </div>
          </div>
        </div>

        <!-- Target & Kondisi -->
        <div class="vita-card card-enter delay-2">
          <div style="font-size:0.9rem; font-weight:700; color:var(--text); margin-bottom:12px; display:flex; align-items:center; gap:6px;">
            <i data-lucide="target" style="width:16px; height:16px; color:var(--primary);"></i> Target Anda
          </div>
          <div style="display:flex; flex-wrap:wrap; gap:8px;">
            ${(p.goals || ['Menjaga Kesehatan']).map(g => `<span style="padding:6px 12px; border-radius:20px; background:var(--primary-bg); color:var(--primary); font-size:0.75rem; font-weight:600;">${g}</span>`).join('')}
          </div>
        </div>

        <!-- ESP32-CAM -->
        <div class="vita-card card-enter delay-3">
          <div style="font-size:0.9rem; font-weight:700; color:var(--text); margin-bottom:12px; display:flex; align-items:center; gap:6px;">
            <i data-lucide="cpu" style="width:16px; height:16px; color:var(--primary);"></i> Perangkat ESP32-CAM
          </div>
          <div style="display:flex; gap:10px;">
            <input type="text" id="prof-ip-input" class="form-input" style="flex:1; margin-bottom:0;" placeholder="192.168.x.x" value="${VitaESP32?.getIP() || ''}">
            <button class="btn btn-primary" id="prof-test-btn" style="padding:0 16px; font-size:0.8rem; display:flex; align-items:center; gap:6px;">
              Test
            </button>
          </div>
          <div style="font-size:0.75rem; color:var(--text-light); margin-top:8px;">Pastikan Anda dan perangkat berada di jaringan WiFi yang sama.</div>
        </div>

        <!-- Akun & Keamanan -->
        <div class="vita-card card-enter delay-4">
          <div style="font-size:0.9rem; font-weight:700; color:var(--text); margin-bottom:16px; display:flex; align-items:center; gap:6px;">
            <i data-lucide="key-round" style="width:16px; height:16px; color:var(--primary);"></i> Akun & Keamanan
          </div>
          <button class="btn btn-danger" style="width:100%; display:flex; align-items:center; justify-content:center; gap:8px;" id="profile-logout">
            <i data-lucide="log-out" style="width:16px; height:16px;"></i> Keluar dari Akun
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
      const ip = document.getElementById('prof-ip-input')?.value?.trim();
      if (!ip) { VitaHelpers.showToast('Silakan isi IP Address terlebih dahulu', 'error'); return; }
      
      const btn = document.getElementById('prof-test-btn');
      btn.innerHTML = '<i data-lucide="loader-circle" style="width:14px;height:14px;animation:spin 1s linear infinite;"></i>';
      if(typeof lucide !== 'undefined') lucide.createIcons();

      VitaESP32.setIP(ip);
      const isOk = await VitaESP32.testConnection(ip);

      btn.innerHTML = 'Test';
      if (isOk) {
        VitaHelpers.showToast('ESP32-CAM berhasil terhubung!', 'success');
      } else {
        VitaHelpers.showToast('Gagal terhubung ke ESP32-CAM', 'error');
      }
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
