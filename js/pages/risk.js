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
        <div class="vita-avatar">${VitaHelpers.getInitials(name)}</div>
      </div>
    </div>`;
  }

  function render() {
    const p      = VitaStore.get('profile') || {};
    const isDemo = VitaStore.get('demoMode');
    const raw    = VitaStore.get('riskAssessment') || DEMO_RISK;
    const scores = raw.scores       || DEMO_RISK.scores;
    const factors = raw.factors     || DEMO_RISK.factors;
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
        <div class="vita-card card-enter delay-2">
          <div class="card-section-label">
            <i data-lucide="pie-chart" style="width:15px;height:15px;color:var(--primary);"></i>
            Peta Sebaran Risiko
          </div>
          <div class="risk-radar-wrap">
            <canvas id="risk-radar"></canvas>
          </div>
        </div>

        <!-- Factors -->
        <div class="vita-card card-enter delay-3">
          <div class="card-section-label" style="margin-bottom:14px;">
            <i data-lucide="shield-alert" style="width:15px;height:15px;color:var(--primary);"></i>
            Faktor Terdeteksi
          </div>
          <div class="risk-factors-list">
            ${factors.map(f => `
            <div class="risk-factor-item ${f.type}">
              <div class="risk-factor-icon">
                <i data-lucide="${f.type === 'warning' ? 'alert-triangle' : 'check-circle'}"
                  style="width:16px;height:16px;"></i>
              </div>
              <span class="risk-factor-text">${f.text}</span>
            </div>`).join('')}
          </div>
        </div>

        <!-- Recommendations -->
        <div class="vita-card card-enter delay-4">
          <div class="card-section-label" style="margin-bottom:14px;">
            <i data-lucide="lightbulb" style="width:15px;height:15px;color:var(--primary);"></i>
            Rekomendasi VITA
          </div>
          <div class="risk-recs-list">
            ${recs.map((r, i) => `
            <div class="risk-rec-item">
              <div class="risk-rec-num">${i + 1}</div>
              <p class="risk-rec-text">${r}</p>
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

    document.getElementById('btn-recalc')?.addEventListener('click', (e) => {
      const btn = e.currentTarget;
      btn.innerHTML = '<i data-lucide="loader-circle" style="width:15px;height:15px;animation:spin 1s linear infinite;"></i> Menghitung...';
      if (typeof lucide !== 'undefined') lucide.createIcons();

      setTimeout(() => {
        if (typeof VitaRiskCalculator !== 'undefined') {
          const p          = VitaStore.get('profile') || {};
          const todayMeals = VitaStore.get('todayMeals') || [];
          const todayNum   = todayMeals.reduce((acc, m) => {
            acc.calories += m.cal    || 0;
            acc.carbs    += m.carb   || 0;
            acc.fat      += m.fat    || 0;
            acc.fiber    += m.fiber  || 3;
            acc.sodium   += m.sodium || 400;
            return acc;
          }, { calories: 0, carbs: 0, fat: 0, fiber: 0, sodium: 0 });

          const newRisk = VitaRiskCalculator.assess(p, [todayNum]);
          VitaStore.set('riskAssessment', newRisk);
          VitaStore.set('riskScores', newRisk.scores);
          if (typeof VitaRouter !== 'undefined') VitaRouter.handleRoute();
          VitaHelpers.showToast('Analisis risiko diperbarui!', 'success');
        } else {
          btn.innerHTML = '<i data-lucide="refresh-cw" style="width:15px;height:15px;"></i> Hitung Ulang';
          if (typeof lucide !== 'undefined') lucide.createIcons();
          VitaHelpers.showToast('Layanan kalkulator belum termuat', 'warning');
        }
      }, 1000);
    });

    requestAnimationFrame(() => {
      const raw = VitaStore.get('riskAssessment') || DEMO_RISK;
      const s   = raw.scores || DEMO_RISK.scores;
      if (window.VitaCharts) {
        VitaCharts.createRadar(
          'risk-radar',
          ['Diabetes', 'Hipertensi', 'Obesitas', 'Jantung / CVD'],
          [s.diabetes, s.hypertension, s.obesity, s.cvd],
          '#2E7FBF'
        );
      }
    });
  }

  return { render, init };
})();
