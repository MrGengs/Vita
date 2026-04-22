// VITA — Risk Assessment Page
const RiskPage = (() => {

  const DEMO_RISK = {
    scores: { diabetes: 28, hypertension: 42, obesity: 19, cvd: 33 },
    factors: [
      { type: 'warning', text: 'Konsumsi sodium rata-rata harian (850mg) mendekati batas aman.' },
      { type: 'warning', text: 'Rasio karbohidrat sederhana cukup tinggi (terdeteksi dari konsumsi mie).' },
      { type: 'good',    text: 'Asupan total kalori harian terkontrol dengan sangat baik.' },
      { type: 'good',    text: 'Konsumsi lemak trans terpantau aman dan sangat rendah.' },
    ],
    recommendations: [
      'Kurangi kecap dan saus botolan untuk menurunkan asupan natrium.',
      'Ganti sebagian nasi putih dengan karbohidrat kompleks seperti nasi merah atau ubi.',
      'Tingkatkan serat harian minimal 25g melalui sayuran hijau segar.',
    ],
  };

  const CARDS_META = [
    { id: 'diabetes',     name: 'Diabetes T2',     icon: 'heart-pulse', topColor: '#2E7FBF', gradient: 'linear-gradient(135deg,#EFF6FF,#DBEAFE)' },
    { id: 'hypertension', name: 'Hipertensi',       icon: 'activity',    topColor: '#EF4444', gradient: 'linear-gradient(135deg,#FEF2F2,#FEE2E2)' },
    { id: 'obesity',      name: 'Obesitas',         icon: 'scale',       topColor: '#F59E0B', gradient: 'linear-gradient(135deg,#FFFBEB,#FEF3C7)' },
    { id: 'cvd',          name: 'Penyakit Jantung', icon: 'heart',       topColor: '#8B5CF6', gradient: 'linear-gradient(135deg,#F5F3FF,#EDE9FE)' },
  ];

  function getLevelInfo(score) {
    if (score < 25) return { label: 'Rendah',  color: '#52B847', bg: 'rgba(82,184,71,0.12)'   };
    if (score < 55) return { label: 'Sedang',  color: '#F59E0B', bg: 'rgba(245,158,11,0.12)'  };
    return             { label: 'Tinggi',  color: '#EF4444', bg: 'rgba(239,68,68,0.12)'    };
  }

  function topbar(name) {
    return `
    <div class="vita-topbar">
      <div class="vita-topbar-left">
        <button class="vita-menu-btn" id="risk-menu-btn"><i data-lucide="menu"></i></button>
        <div class="topbar-brand">
          <svg width="26" height="26" viewBox="0 0 64 64" fill="none">
            <circle cx="32" cy="32" r="32" fill="url(#rGrad)"/>
            <defs><linearGradient id="rGrad" x1="0" y1="0" x2="64" y2="64">
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
        <div class="vita-avatar" style="padding:0; overflow:hidden;">${VitaHelpers.getAvatar(name, VitaStore.get('profile')?.photoURL)}</div>
      </div>
    </div>`;
  }

  function calculateCurrentRisk() {
    if (typeof VitaRiskCalculator === 'undefined') return DEMO_RISK;
    const p = VitaStore.get('profile') || {};
    const todayMeals = VitaStore.get('todayMeals') || [];
    const todayNum = todayMeals.reduce((acc, m) => {
      acc.calories += m.cal || 0;
      acc.carbs    += m.carb || 0;
      acc.fat      += m.fat || 0;
      acc.fiber    += m.fiber || 0;
      acc.sodium   += m.sodium || 0;
      return acc;
    }, { calories: 0, carbs: 0, fat: 0, fiber: 0, sodium: 0 });

    return VitaRiskCalculator.assess(p, [todayNum]);
  }

  // Hitung ulang & simpan di background (dipanggil setiap kali ada perubahan makanan)
  async function recalcAndSave() {
    const user = VitaStore.get('user');
    if (!user || typeof VitaRiskCalculator === 'undefined') return;
    try {
      const newRisk = calculateCurrentRisk();
      await VitaFirestore.saveRiskAssessment(user.uid, newRisk);
      VitaStore.set('riskAssessment', newRisk);
      VitaStore.set('riskScores', newRisk.scores);
      console.log('[Risk] Recalc selesai (background)');
    } catch (e) {
      console.warn('[Risk] Background recalc gagal:', e);
    }
  }

  async function fetchRiskData() {
    const user = VitaStore.get('user');
    if (!user) return;

    const todayKey = VitaHelpers.getTodayKey();

    try {
      const raw = await VitaFirestore.getLatestRiskAssessment(user.uid);

      const isStale = !raw || raw.dateKey !== todayKey;

      if (isStale) {
        // Data belum ada atau dari hari sebelumnya → hitung ulang berdasarkan data hari ini
        console.log('[Risk] Data lama atau tidak ada, menghitung ulang untuk', todayKey);
        const newRisk = calculateCurrentRisk();
        await VitaFirestore.saveRiskAssessment(user.uid, newRisk);
        VitaStore.set('riskAssessment', newRisk);
        VitaStore.set('riskScores', newRisk.scores);
      } else {
        // Data sudah ada dan masih untuk hari ini, gunakan langsung
        VitaStore.set('riskAssessment', raw);
        VitaStore.set('riskScores', raw.scores);
      }

      // Re-render halaman dengan data terbaru
      if (typeof VitaRouter !== 'undefined') VitaRouter.handleRoute();
    } catch (err) {
      console.error('[RiskPage] loadFromFirestore error:', err);
      VitaHelpers.showToast('Gagal memuat analisis risiko dari server', 'error');
    }
  }

  function render() {
    const p      = VitaStore.get('profile') || {};
    const isDemo = VitaStore.get('demoMode');
    let raw      = VitaStore.get('riskAssessment');
    
    // Tampilkan state loading jika belum ada data dan bukan mode demo
    if (!raw && !isDemo) {
      return `
      <div class="dash-bg">
        <div class="dash-orb dash-orb-1"></div>
        <div class="dash-orb dash-orb-2"></div>
        ${topbar(p.name || 'Pengguna')}
        <div class="dash-content" style="display:flex; justify-content:center; align-items:center; height:60vh;">
          <div style="text-align:center; color:var(--text-secondary);">
            <i data-lucide="loader-circle" style="width:36px;height:36px;animation:spin 1s linear infinite;color:var(--primary);margin-bottom:12px;"></i>
            <div style="font-size:0.9rem;font-weight:600;">Memuat analisis risiko dari server...</div>
          </div>
        </div>
      </div>`;
    }

    if (!raw && isDemo) raw = DEMO_RISK;

    const scores  = raw.scores       || DEMO_RISK.scores;
    const factors = raw.factors      || DEMO_RISK.factors;
    const recs    = raw.recommendations || DEMO_RISK.recommendations;

    return `
    <div class="dash-bg">
      <div class="dash-orb dash-orb-1"></div>
      <div class="dash-orb dash-orb-2"></div>
      ${topbar(p.name || 'Pengguna')}
      <div class="dash-content">

        ${isDemo ? `
        <div class="demo-banner card-enter">
          <div class="demo-banner-text">
            <i data-lucide="info" style="width:15px;height:15px;flex-shrink:0;"></i>
            Mode Demo — menampilkan estimasi risiko contoh.
          </div>
        </div>` : ''}

        <!-- Page Header -->
        <div class="vita-welcome card-enter">
          <div class="risk-welcome-inner">
            <div class="vita-welcome-text" style="margin-bottom:0;">
              <h2>Analisis Risiko Metabolik</h2>
              <p>Berdasarkan riwayat nutrisi &amp; profil kesehatan</p>
            </div>
            <button class="btn-icon-sm" id="btn-recalc" title="Hitung ulang">
              <i data-lucide="refresh-cw" style="width:15px;height:15px;"></i>
              Hitung Ulang
            </button>
          </div>
        </div>

        <!-- 4 Risk Cards -->
        <div class="risk-cards-grid">
          ${CARDS_META.map((c, i) => {
            const lvl = getLevelInfo(scores[c.id]);
            const pct = scores[c.id];
            return `
            <div class="risk-item-card card-enter delay-${i+1}" style="border-top:4px solid ${c.topColor}; background:${c.gradient};">
              <div class="risk-item-icon" style="background:${lvl.bg}; color:${lvl.color};">
                <i data-lucide="${c.icon}" style="width:20px;height:20px;"></i>
              </div>
              <div class="risk-item-name">${c.name}</div>
              <div class="risk-item-score" style="color:${c.topColor};">
                ${pct}<span class="risk-item-pct">%</span>
              </div>
              <div class="risk-item-bar-track">
                <div class="risk-item-bar-fill" style="width:${pct}%; background:${c.topColor};"></div>
              </div>
              <div class="risk-level-badge" style="background:${lvl.bg}; color:${lvl.color};">${lvl.label}</div>
            </div>`;
          }).join('')}
        </div>

        <!-- Radar Chart -->
        <div class="vita-card card-enter delay-2" style="background: linear-gradient(145deg, #ffffff, #f8fafc); border: 1px solid #e2e8f0; border-radius: 16px; padding: 24px; box-shadow: 0 10px 25px rgba(0,0,0,0.04);">
          <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 20px; padding-bottom: 15px; border-bottom: 1px dashed #cbd5e1;">
            <div style="background: rgba(46,127,191,0.1); color: #2E7FBF; width: 40px; height: 40px; border-radius: 12px; display: flex; align-items: center; justify-content: center;">
              <i data-lucide="pie-chart" style="width:20px;height:20px;"></i>
            </div>
            <div>
              <div style="font-size: 1.1rem; font-weight: 800; color: #0f172a; letter-spacing: -0.01em;">Peta Sebaran Risiko</div>
              <div style="font-size: 0.8rem; color: #64748b; margin-top: 2px;">Visualisasi multi-dimensi profil metabolik</div>
            </div>
          </div>
          <div class="risk-radar-wrap" style="position: relative; height: 260px; display: flex; justify-content: center; align-items: center;">
            <canvas id="risk-radar" style="display:block;"></canvas>
          </div>
        </div>

        <!-- Factors -->
        <div class="vita-card card-enter delay-3" style="background: linear-gradient(145deg, #ffffff, #f8fafc); border: 1px solid #e2e8f0; border-radius: 16px; padding: 24px; box-shadow: 0 10px 25px rgba(0,0,0,0.04);">
          <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 20px; padding-bottom: 15px; border-bottom: 1px dashed #cbd5e1;">
            <div style="background: rgba(245,158,11,0.1); color: #F59E0B; width: 40px; height: 40px; border-radius: 12px; display: flex; align-items: center; justify-content: center;">
              <i data-lucide="shield-alert" style="width:20px;height:20px;"></i>
            </div>
            <div>
              <div style="font-size: 1.1rem; font-weight: 800; color: #0f172a; letter-spacing: -0.01em;">Faktor Terdeteksi</div>
              <div style="font-size: 0.8rem; color: #64748b; margin-top: 2px;">Analisis pola makan & metrik tubuh</div>
            </div>
          </div>
          <div class="risk-factors-list" style="display: flex; flex-direction: column; gap: 12px;">
            ${factors.map(f => `
            <div style="display: flex; align-items: flex-start; gap: 12px; padding: 16px; border-radius: 12px; background: ${f.type === 'warning' ? '#fffbeb' : '#f0fdf4'}; border: 1px solid ${f.type === 'warning' ? '#fde68a' : '#bbf7d0'}; transition: transform 0.2s;" onmouseover="this.style.transform='translateX(6px)'" onmouseout="this.style.transform='translateX(0)'">
              <div style="color: ${f.type === 'warning' ? '#f59e0b' : '#22c55e'}; flex-shrink: 0; margin-top: 1px;">
                <i data-lucide="${f.type === 'warning' ? 'alert-triangle' : 'check-circle'}" style="width:18px;height:18px;"></i>
              </div>
              <span style="font-size: 0.88rem; font-weight: 600; color: ${f.type === 'warning' ? '#92400e' : '#166534'}; line-height: 1.5;">${f.text}</span>
            </div>`).join('')}
          </div>
        </div>

        <!-- Recommendations -->
        <div class="vita-card card-enter delay-4" style="background: linear-gradient(145deg, #ffffff, #f8fafc); border: 1px solid #e2e8f0; border-radius: 16px; padding: 24px; box-shadow: 0 10px 25px rgba(0,0,0,0.04);">
          <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 20px; padding-bottom: 15px; border-bottom: 1px dashed #cbd5e1;">
            <div style="background: rgba(82,184,71,0.1); color: #52B847; width: 40px; height: 40px; border-radius: 12px; display: flex; align-items: center; justify-content: center;">
              <i data-lucide="lightbulb" style="width:20px;height:20px;"></i>
            </div>
            <div>
              <div style="font-size: 1.1rem; font-weight: 800; color: #0f172a; letter-spacing: -0.01em;">Rekomendasi VITA</div>
              <div style="font-size: 0.8rem; color: #64748b; margin-top: 2px;">Saran personalisasi untuk perbaikan</div>
            </div>
          </div>
          <div class="risk-recs-list" style="display: flex; flex-direction: column; gap: 14px;">
            ${recs.map((r, i) => `
            <div style="display: flex; align-items: flex-start; gap: 16px; padding: 18px 16px; border-radius: 14px; background: white; border: 1px solid #e2e8f0; box-shadow: 0 2px 8px rgba(0,0,0,0.02); transition: transform 0.2s, box-shadow 0.2s;" onmouseover="this.style.transform='translateY(-3px)'; this.style.boxShadow='0 8px 20px rgba(0,0,0,0.06)'" onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 2px 8px rgba(0,0,0,0.02)'">
              <div style="background: #2E7FBF; color: white; width: 30px; height: 30px; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 0.9rem; font-weight: 800; flex-shrink: 0;">${i + 1}</div>
              <p style="font-size: 0.9rem; font-weight: 600; color: #334155; line-height: 1.5; margin: 0; padding-top: 4px;">${r}</p>
            </div>`).join('')}
          </div>
        </div>

        <div class="dash-bottom-spacer"></div>
      </div>
    </div>`;
  }

  function init() {
    document.getElementById('risk-menu-btn')?.addEventListener('click', () => {
      document.getElementById('sidebar')?.classList.toggle('open');
      document.getElementById('sidebar-overlay')?.classList.toggle('hidden');
    });

    document.getElementById('btn-recalc')?.addEventListener('click', async (e) => {
      const btn = e.currentTarget;
      btn.innerHTML = '<i data-lucide="loader-circle" style="width:15px;height:15px;animation:spin 1s linear infinite;"></i> Menghitung...';
      if (typeof lucide !== 'undefined') lucide.createIcons();

      if (typeof VitaRiskCalculator !== 'undefined') {
        const user = VitaStore.get('user');
        const newRisk = calculateCurrentRisk();
        
        try {
          if (user) {
            await VitaFirestore.saveRiskAssessment(user.uid, newRisk);
          }
          VitaStore.set('riskAssessment', newRisk);
          VitaStore.set('riskScores', newRisk.scores);
          VitaHelpers.showToast('Analisis risiko diperbarui dan disimpan!', 'success');
          if (typeof VitaRouter !== 'undefined') VitaRouter.handleRoute();
        } catch (err) {
          console.error('[RiskPage] save error', err);
          VitaHelpers.showToast('Gagal menyimpan hasil analisis ke server.', 'error');
          btn.innerHTML = '<i data-lucide="refresh-cw" style="width:15px;height:15px;"></i> Hitung Ulang';
          if (typeof lucide !== 'undefined') lucide.createIcons();
        }
      } else {
        btn.innerHTML = '<i data-lucide="refresh-cw" style="width:15px;height:15px;"></i> Hitung Ulang';
        if (typeof lucide !== 'undefined') lucide.createIcons();
        VitaHelpers.showToast('Layanan kalkulator belum termuat', 'warning');
      }
    });

    const isDemo = VitaStore.get('demoMode');
    const raw = VitaStore.get('riskAssessment');

    if (!raw && !isDemo) {
      fetchRiskData();
      return; // Skip radar rendering during loading
    }

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const canvas = document.getElementById('risk-radar');
        if (!canvas) { console.warn('[Risk] canvas #risk-radar tidak ditemukan'); return; }
        if (typeof VitaCharts === 'undefined') { console.error('[Risk] VitaCharts tidak tersedia'); return; }
        if (typeof Chart === 'undefined') { console.error('[Risk] Chart.js belum di-load'); return; }
        const activeData = raw || DEMO_RISK;
        const s = activeData.scores || DEMO_RISK.scores;
        VitaCharts.createRadar(
          'risk-radar',
          ['Diabetes', 'Hipertensi', 'Obesitas', 'Jantung / CVD'],
          [s.diabetes, s.hypertension, s.obesity, s.cvd],
          '#2E7FBF'
        );
      });
    });
  }

  return { render, init, recalcAndSave };
})();
