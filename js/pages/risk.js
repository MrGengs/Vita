// VITA — Risk Assessment Page
const RiskPage = (() => {

  const DEMO_RISK = {
    scores: { diabetes: 28, hypertension: 42, obesity: 19, cvd: 33 },
    factors: [
      { type: 'warning', text: 'Asupan sodium rata-rata harian (850mg) mendekati batas aman.' },
      { type: 'warning', text: 'Rasio karbohidrat sederhana cukup tinggi (terdeteksi dari konsumsi mie).' },
      { type: 'good', text: 'Asupan total kalori harian terkontrol dengan sangat baik.' },
      { type: 'good', text: 'Konsumsi lemak trans terpantau aman dan sangat rendah.' }
    ],
    recommendations: [
      'Kurangi tambahan kecap atau saus botolan pada makanan untuk menurunkan natrium.',
      'Ganti sebagian porsi nasi putih dengan sumber karbohidrat kompleks seperti nasi merah atau umbi-umbian.',
      'Tingkatkan asupan serat harian minimal 25g melalui sayuran hijau segar.'
    ]
  };

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

  function getLevelInfo(score) {
    if (score < 25) return { label: 'Rendah', color: '#52B847', bg: 'rgba(82,184,71,0.12)' };
    if (score < 55) return { label: 'Sedang', color: '#F59E0B', bg: 'rgba(245,158,11,0.12)' };
    return { label: 'Tinggi', color: '#EF4444', bg: 'rgba(239,68,68,0.12)' };
  }

  function render() {
    const p = VitaStore.get('profile') || {};
    const isDemo = VitaStore.get('demoMode');
    const rawRisk = VitaStore.get('riskAssessment') || DEMO_RISK;
    const scores = rawRisk.scores || DEMO_RISK.scores;
    const factors = rawRisk.factors || DEMO_RISK.factors;
    const recs = rawRisk.recommendations || DEMO_RISK.recommendations;

    const cards = [
      { id: 'diabetes', name: 'Diabetes T2', icon: 'heart-pulse', score: scores.diabetes, topColor: '#2E7FBF' },
      { id: 'hypertension', name: 'Hipertensi', icon: 'activity', score: scores.hypertension, topColor: '#EF4444' },
      { id: 'obesity', name: 'Obesitas', icon: 'scale', score: scores.obesity, topColor: '#F59E0B' },
      { id: 'cvd', name: 'Penyakit Jantung', icon: 'heart', score: scores.cvd, topColor: '#8B5CF6' }
    ];

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

        <div class="vita-welcome card-enter">
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <div class="vita-welcome-text" style="margin-bottom:0;">
              <h2>Analisis Risiko Metabolik</h2>
              <p>Berdasarkan riwayat nutrisi & profil kesehatan</p>
            </div>
            <button class="btn btn-ghost" id="btn-recalc" style="background:var(--primary-bg); color:var(--primary);">
              <i data-lucide="refresh-cw" style="width:16px;height:16px;"></i>
            </button>
          </div>
        </div>

        <!-- 4 Risk Cards Grid -->
        <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(140px, 1fr));gap:16px;margin-bottom:24px;">
          ${cards.map((c, i) => {
            const lvl = getLevelInfo(c.score);
            return `
            <div class="vita-card card-enter delay-${i+1}" style="border-top: 4px solid ${c.topColor}; padding: 18px; text-align: center;">
              <div style="display:inline-flex;align-items:center;justify-content:center;width:40px;height:40px;border-radius:12px;background:${lvl.bg};color:${lvl.color};margin-bottom:12px;">
                <i data-lucide="${c.icon}" style="width:20px;height:20px;"></i>
              </div>
              <div style="font-size:0.85rem;color:var(--text-secondary);font-weight:600;margin-bottom:4px;">${c.name}</div>
              <div style="font-size:2rem;font-weight:800;color:var(--text);font-family:var(--font-sans);margin-bottom:8px;">
                ${c.score}<span style="font-size:1rem;color:var(--text-light);">%</span>
              </div>
              <div style="display:inline-block;padding:4px 12px;border-radius:99px;font-size:0.75rem;font-weight:700;background:${lvl.bg};color:${lvl.color};">
                ${lvl.label}
              </div>
            </div>`;
          }).join('')}
        </div>

        <div style="display:grid;grid-template-columns:1fr;gap:16px;" class="dash-lower-row">
          <!-- Radar Chart -->
          <div class="vita-card card-enter delay-2" style="display:flex;flex-direction:column;min-height:300px;">
            <div style="font-size:0.9rem;font-weight:700;color:var(--text);margin-bottom:16px;display:flex;align-items:center;gap:6px;">
              <i data-lucide="pie-chart" style="width:16px;height:16px;color:var(--primary);"></i> Peta Sebaran Risiko
            </div>
            <div style="flex:1;position:relative;display:flex;align-items:center;justify-content:center;">
              <canvas id="risk-radar" style="max-height:260px;"></canvas>
            </div>
          </div>

          <!-- Factors & Recommendations -->
          <div class="vita-card card-enter delay-3">
            <div style="font-size:0.9rem;font-weight:700;color:var(--text);margin-bottom:12px;display:flex;align-items:center;gap:6px;">
              <i data-lucide="shield-alert" style="width:16px;height:16px;color:var(--primary);"></i> Faktor Terdeteksi
            </div>
            <div style="display:flex;flex-direction:column;gap:10px;margin-bottom:24px;">
              ${factors.map(f => `
                <div style="display:flex;gap:10px;align-items:flex-start;background:var(--bg-light);padding:12px;border-radius:var(--radius);">
                  ${f.type === 'warning'
                    ? `<i data-lucide="alert-triangle" style="width:18px;height:18px;color:#F59E0B;flex-shrink:0;"></i>`
                    : `<i data-lucide="check-circle" style="width:18px;height:18px;color:#52B847;flex-shrink:0;"></i>`
                  }
                  <span style="font-size:0.83rem;color:var(--text);line-height:1.5;">${f.text}</span>
                </div>
              `).join('')}
            </div>

            <div style="font-size:0.9rem;font-weight:700;color:var(--text);margin-bottom:12px;display:flex;align-items:center;gap:6px;">
              <i data-lucide="lightbulb" style="width:16px;height:16px;color:var(--primary);"></i> Rekomendasi VITA
            </div>
            <ul style="padding-left:20px;margin:0;font-size:0.83rem;color:var(--text-secondary);line-height:1.6;">
              ${recs.map(r => `<li style="margin-bottom:8px;">${r}</li>`).join('')}
            </ul>
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
      btn.innerHTML = '<i data-lucide="loader-circle" style="width:16px;height:16px;animation:spin 1s linear infinite;"></i>';
      if(typeof lucide !== 'undefined') lucide.createIcons();
      
      setTimeout(() => {
        if (typeof VitaRiskCalculator !== 'undefined') {
          const p = VitaStore.get('profile') || {};
          const todayMeals = VitaStore.get('todayMeals') || [];
          
          // Agregasi nutrisi harian sebagai sampel untuk kalkulator
          const todayNum = todayMeals.reduce((acc, m) => {
            acc.calories += m.cal || 0; acc.carbs += m.carb || 0;
            acc.fat += m.fat || 0; acc.fiber += m.fiber || 3; // Fallback jika data kosong
            acc.sodium += m.sodium || 400; // Fallback sodium jika data kosong
            return acc;
          }, { calories: 0, carbs: 0, fat: 0, fiber: 0, sodium: 0 });

          const newRisk = VitaRiskCalculator.assess(p, [todayNum]);
          VitaStore.set('riskAssessment', newRisk);
          VitaStore.set('riskScores', newRisk.scores); // Sync otomatis ke UI Dashboard utama
          
          if (typeof VitaRouter !== 'undefined') VitaRouter.handleRoute(); // Re-render instan UI Halaman
          VitaHelpers.showToast('Analisis risiko berhasil diperbarui!', 'success');
        } else {
          btn.innerHTML = '<i data-lucide="refresh-cw" style="width:16px;height:16px;"></i>';
          if(typeof lucide !== 'undefined') lucide.createIcons();
          VitaHelpers.showToast('Layanan kalkulator belum termuat', 'warning');
        }
      }, 1000);
    });

    // Init Radar Chart
    requestAnimationFrame(() => {
      const rawRisk = VitaStore.get('riskAssessment') || DEMO_RISK;
      const s = rawRisk.scores || DEMO_RISK.scores;
      if (window.VitaCharts && window.VitaCharts.createRadar) {
        VitaCharts.createRadar('risk-radar',
          ['Diabetes', 'Hipertensi', 'Obesitas', 'Jantung / CVD'],
          [{
            label: 'Skor Risiko (%)',
            data: [s.diabetes, s.hypertension, s.obesity, s.cvd],
            backgroundColor: 'rgba(46,127,191,0.25)',
            borderColor: '#2E7FBF',
            pointBackgroundColor: '#2E7FBF',
            borderWidth: 2
          }]
        );
      }
    });
  }

  return { render, init };
})();