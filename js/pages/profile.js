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
          <div class="prof-hero-avatar" style="padding:0; overflow:hidden;">
            ${VitaHelpers.getAvatar(p.name || user.displayName || 'U', p.photoURL || user?.photoURL)}
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
        <div class="vita-card card-enter delay-1" style="background: linear-gradient(145deg, #ffffff, #f8fafc); border: 1px solid #e2e8f0; border-radius: 16px; padding: 24px; box-shadow: 0 10px 25px rgba(0,0,0,0.04);">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; padding-bottom: 15px; border-bottom: 1px dashed #cbd5e1;">
            <div style="display: flex; align-items: center; gap: 12px; font-size: 1.1rem; font-weight: 800; color: #0f172a; letter-spacing: -0.01em;">
              <div style="background: rgba(46, 127, 191, 0.1); color: #2E7FBF; width: 40px; height: 40px; border-radius: 12px; display: flex; align-items: center; justify-content: center;">
                <i data-lucide="user" style="width:20px;height:20px;"></i>
              </div>
              <div>
                <div>Data Pribadi</div>
                <div style="font-size: 0.75rem; color: #64748b; font-weight: 500; margin-top: 2px;">Informasi fisik & demografi</div>
              </div>
            </div>
            <button class="btn-icon-sm" id="prof-edit-btn" style="background: #f1f5f9; border: 1px solid #e2e8f0; border-radius: 10px; padding: 8px 14px; font-size: 0.85rem; font-weight: 600; color: #475569; transition: all 0.2s;" onmouseover="this.style.background='#e2e8f0'; this.style.transform='translateY(-1px)'" onmouseout="this.style.background='#f1f5f9'; this.style.transform='translateY(0)'">
              <i data-lucide="edit-3" style="width:14px;height:14px;"></i> Edit
            </button>
          </div>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
            ${stats.map(s => `
            <div style="background: white; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px; display: flex; flex-direction: column; gap: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.02); transition: transform 0.2s;" onmouseover="this.style.transform='translateY(-2px)'" onmouseout="this.style.transform='translateY(0)'">
              <div style="display: flex; align-items: center; gap: 8px; color: #64748b; font-size: 0.85rem; font-weight: 600;">
                <i data-lucide="${s.icon}" style="width:16px;height:16px;color:#94a3b8;"></i>
                ${s.label}
              </div>
              <div style="font-size: 1.3rem; font-weight: 800; color: #0f172a;">
                ${s.val} <span style="font-size: 0.8rem; font-weight: 600; color: #94a3b8;">${s.unit}</span>
              </div>
            </div>`).join('')}
          </div>
        </div>

        <!-- Target -->
        <div class="vita-card card-enter delay-2" style="background: linear-gradient(145deg, #ffffff, #f8fafc); border: 1px solid #e2e8f0; border-radius: 16px; padding: 24px; box-shadow: 0 10px 25px rgba(0,0,0,0.04);">
          <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 20px; padding-bottom: 15px; border-bottom: 1px dashed #cbd5e1;">
            <div style="background: rgba(245, 158, 11, 0.1); color: #F59E0B; width: 40px; height: 40px; border-radius: 12px; display: flex; align-items: center; justify-content: center;">
              <i data-lucide="target" style="width:20px;height:20px;"></i>
            </div>
            <div>
              <div style="font-size: 1.1rem; font-weight: 800; color: #0f172a; letter-spacing: -0.01em;">Target Kesehatan</div>
              <div style="font-size: 0.75rem; color: #64748b; font-weight: 500; margin-top: 2px;">Fokus utama dan resolusi</div>
            </div>
          </div>
          <div style="display: flex; flex-wrap: wrap; gap: 10px;">
            ${(p.goals || ['Menjaga Kesehatan']).map(g => `
              <span style="background: #fffbeb; color: #d97706; border: 1px solid #fde68a; padding: 10px 18px; border-radius: 20px; font-size: 0.85rem; font-weight: 700; display: inline-flex; align-items: center; gap: 8px; box-shadow: 0 2px 6px rgba(245,158,11,0.1); transition: transform 0.2s;" onmouseover="this.style.transform='translateY(-2px)'" onmouseout="this.style.transform='translateY(0)'">
                <i data-lucide="check-circle-2" style="width:16px;height:16px;"></i> ${g}
              </span>`).join('')}
          </div>
        </div>

        <!-- ESP32-CAM -->
        <div class="vita-card card-enter delay-3" style="background: linear-gradient(145deg, #ffffff, #f8fafc); border: 1px solid #e2e8f0; border-radius: 16px; padding: 24px; box-shadow: 0 10px 25px rgba(0,0,0,0.04);">
          <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 20px; padding-bottom: 15px; border-bottom: 1px dashed #cbd5e1;">
            <div style="background: rgba(82, 184, 71, 0.1); color: #52B847; width: 40px; height: 40px; border-radius: 12px; display: flex; align-items: center; justify-content: center;">
              <i data-lucide="cpu" style="width:20px;height:20px;"></i>
            </div>
            <div>
              <div style="font-size: 1.1rem; font-weight: 800; color: #0f172a; letter-spacing: -0.01em;">Perangkat ESP32-CAM</div>
              <div style="font-size: 0.75rem; color: #64748b; font-weight: 500; margin-top: 2px;">Koneksi kamera pemindai lokal</div>
            </div>
          </div>
          <div style="display: flex; gap: 12px; margin-bottom: 14px;">
            <div style="position: relative; flex: 1;">
              <div style="position: absolute; left: 14px; top: 50%; transform: translateY(-50%); color: #94a3b8;">
                <i data-lucide="network" style="width: 18px; height: 18px;"></i>
              </div>
              <input type="text" id="prof-ip-input" style="width: 100%; padding: 14px 14px 14px 42px; border: 1.5px solid #e2e8f0; border-radius: 12px; font-size: 0.95rem; font-family: monospace; color: #1e293b; outline: none; transition: all 0.2s; background: white;" placeholder="192.168.x.x" value="${VitaESP32?.getIP() || ''}" onfocus="this.style.borderColor='#52B847'; this.style.boxShadow='0 0 0 3px rgba(82,184,71,0.2)'" onblur="this.style.borderColor='#e2e8f0'; this.style.boxShadow='none'">
            </div>
            <button id="prof-test-btn" style="background: #52B847; color: white; border: none; border-radius: 12px; padding: 0 20px; font-size: 0.95rem; font-weight: 700; display: flex; align-items: center; gap: 8px; cursor: pointer; transition: all 0.2s; box-shadow: 0 4px 12px rgba(82,184,71,0.3);" onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 6px 16px rgba(82,184,71,0.4)'" onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 4px 12px rgba(82,184,71,0.3)'">
              <i data-lucide="wifi" style="width:18px;height:18px;"></i> Test
            </button>
          </div>
          <div style="display: flex; align-items: center; gap: 10px; font-size: 0.8rem; font-weight: 500; color: #64748b; background: #f8fafc; padding: 12px 16px; border-radius: 12px; border: 1px solid #e2e8f0;">
            <i data-lucide="info" style="width:16px;height:16px;color:#94a3b8;flex-shrink:0;"></i>
            Pastikan smartphone dan ESP32-CAM terhubung ke jaringan WiFi yang sama.
          </div>
        </div>

        <!-- Akun -->
        <div class="vita-card card-enter delay-4" style="background: linear-gradient(145deg, #ffffff, #fef2f2); border: 1px solid #fecaca; border-radius: 16px; padding: 24px; box-shadow: 0 10px 25px rgba(239,68,68,0.05);">
          <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 20px; padding-bottom: 15px; border-bottom: 1px dashed #fecaca;">
            <div style="background: rgba(239, 68, 68, 0.1); color: #EF4444; width: 40px; height: 40px; border-radius: 12px; display: flex; align-items: center; justify-content: center;">
              <i data-lucide="shield-check" style="width:20px;height:20px;"></i>
            </div>
            <div>
              <div style="font-size: 1.1rem; font-weight: 800; color: #991b1b; letter-spacing: -0.01em;">Akun &amp; Keamanan</div>
              <div style="font-size: 0.75rem; color: #ef4444; font-weight: 500; margin-top: 2px;">Manajemen sesi aplikasi</div>
            </div>
          </div>
          <button id="profile-logout" style="width: 100%; background: white; color: #ef4444; border: 1px solid #fca5a5; border-radius: 12px; padding: 16px; font-size: 0.95rem; font-weight: 800; display: flex; align-items: center; justify-content: center; gap: 10px; cursor: pointer; transition: all 0.2s; box-shadow: 0 4px 12px rgba(239,68,68,0.1);" onmouseover="this.style.background='#fef2f2'; this.style.transform='translateY(-2px)'" onmouseout="this.style.background='white'; this.style.transform='translateY(0)'">
            <i data-lucide="log-out" style="width:18px;height:18px;"></i>
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

    document.getElementById('prof-edit-btn')?.addEventListener('click', () => {
      VitaHelpers.showToast('Mengarahkan ke halaman Edit Profil...', 'success');
      setTimeout(() => {
        window.location.hash = 'onboarding';
      }, 600);
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
