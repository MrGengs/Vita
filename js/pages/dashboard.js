// VITA — Dashboard Page (White + Blue Theme)
const DashboardPage = (() => {

  const DEMO = {
    name: 'Pengguna',
    calories: { consumed: 1420, target: 2100 },
    protein:  { consumed: 68,   target: 105 },
    carbs:    { consumed: 195,  target: 262 },
    fat:      { consumed: 42,   target: 70 },
    fiber:    { consumed: 18,   target: 25 },
    water:    3,
    streak:   7,
    risk: { diabetes: 28, hypertension: 42, obesity: 19, cvd: 33 },
    meals: [
      { emoji: '🍳', name: 'Nasi Goreng + Telur', time: '07:30', type: 'Sarapan', cal: 420 },
      { emoji: '🍚', name: 'Nasi Ayam + Sayur',   time: '12:15', type: 'Makan Siang', cal: 580 },
      { emoji: '🥤', name: 'Teh Manis + Roti',    time: '15:00', type: 'Snack', cal: 220 },
      { emoji: '🥘', name: 'Sup Tahu Tempe',       time: '18:45', type: 'Makan Malam', cal: 200 },
    ]
  };

  function getRiskClass(score) {
    if (score < 25) return 'r-low';
    if (score < 55) return 'r-mod';
    return 'r-high';
  }

  function renderWaterGlasses(count = 0, total = 8) {
    return Array.from({ length: total }, (_, i) =>
      `<div class="water-glass-icon ${i < count ? 'filled' : ''}" data-glass="${i}" title="${i + 1} gelas">💧</div>`
    ).join('');
  }

  function renderMealEntries(meals) {
    if (!meals || !meals.length) {
      return `<div style="text-align:center;padding:24px 0;color:var(--text-light);font-size:0.875rem;">
        <div style="font-size:2rem;margin-bottom:8px;">🍽️</div>
        Belum ada makanan hari ini
      </div>`;
    }
    return meals.map(m => `
      <div class="meal-entry-v">
        <div class="meal-emoji-v">${m.emoji}</div>
        <div class="meal-info-v">
          <div class="meal-name-v">${m.name}</div>
          <div class="meal-meta-v">${m.time} · ${m.type}</div>
        </div>
        <div class="meal-cal-v">
          <div class="mcal" data-countup="${m.cal}">${m.cal}</div>
          <div class="mtype">kkal</div>
        </div>
      </div>`).join('');
  }

  function render() {
    const p       = VitaStore.get('profile') || {};
    const n       = VitaStore.get('todayNutrition') || DEMO;
    const r       = VitaStore.get('riskScores') || DEMO.risk;
    const meals   = VitaStore.get('todayMeals') || DEMO.meals;
    const name    = p.name || DEMO.name;
    const greeting = VitaHelpers.getGreeting();
    const streak  = p.streak || DEMO.streak;
    const water   = VitaStore.get('waterToday') || p.waterToday || DEMO.water;

    const cal  = n.calories || DEMO.calories;
    const prot = n.protein  || DEMO.protein;
    const carb = n.carbs    || DEMO.carbs;
    const fat  = n.fat      || DEMO.fat;

    const calC  = typeof cal  === 'object' ? cal.consumed  : cal;
    const calT  = typeof cal  === 'object' ? cal.target    : VitaHelpers.getCalorieTarget(p);
    const protC = typeof prot === 'object' ? prot.consumed : prot;
    const protT = typeof prot === 'object' ? prot.target   : 105;
    const carbC = typeof carb === 'object' ? carb.consumed : carb;
    const carbT = typeof carb === 'object' ? carb.target   : 262;
    const fatC  = typeof fat  === 'object' ? fat.consumed  : fat;
    const fatT  = typeof fat  === 'object' ? fat.target    : 70;

    const rDM   = r.diabetes      || DEMO.risk.diabetes;
    const rHT   = r.hypertension  || DEMO.risk.hypertension;
    const rOB   = r.obesity       || DEMO.risk.obesity;
    const rCVD  = r.cvd           || DEMO.risk.cvd;

    return `
    <div class="dash-bg">
      <!-- Decorative background orbs -->
      <div class="dash-orb dash-orb-1"></div>
      <div class="dash-orb dash-orb-2"></div>

      <!-- Blue Topbar -->
      <div class="vita-topbar">
        <div class="vita-topbar-left">
          <button class="vita-menu-btn" id="dash-menu-btn" aria-label="Menu">
            <i data-lucide="menu"></i>
          </button>
          <div class="topbar-brand">
            <svg width="28" height="28" viewBox="0 0 64 64" fill="none">
              <circle cx="32" cy="32" r="32" fill="url(#vGrad)"/>
              <defs>
                <linearGradient id="vGrad" x1="0" y1="0" x2="64" y2="64">
                  <stop offset="0%" stop-color="#7CCC73"/>
                  <stop offset="100%" stop-color="#93C5FD"/>
                </linearGradient>
              </defs>
              <path d="M20 32 C20 24 28 18 32 18 C36 18 44 24 44 32 C44 40 38 46 32 46 C28 46 22 42 20 38"
                stroke="white" stroke-width="3" stroke-linecap="round" fill="none"/>
              <circle cx="32" cy="32" r="6" fill="white"/>
            </svg>
            <span><span class="brand-vi">vi</span><span class="brand-ta">ta</span></span>
          </div>
        </div>
        <div class="vita-topbar-right">
          <button class="vita-icon-btn" id="dash-notif-btn" title="Notifikasi">
            <i data-lucide="bell"></i>
          </button>
          <button class="vita-icon-btn" id="dash-scan-quick" title="Scan Cepat">
            <i data-lucide="scan-line"></i>
          </button>
          <div class="vita-avatar" id="dash-avatar">${VitaHelpers.getInitials(name)}</div>
        </div>
      </div>

      <!-- Content -->
      <div class="dash-content">

        ${VitaStore.get('demoMode') ? `
        <div class="demo-banner card-enter">
          <div class="demo-banner-text">
            <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            Mode Demo — menampilkan data contoh. Daftar untuk data nyata.
          </div>
          <div class="demo-banner-actions">
            <a href="#register" class="demo-cta-register">Daftar Gratis</a>
            <a href="#login" class="demo-cta-login">Masuk</a>
          </div>
        </div>` : ''}

        <!-- Welcome Card -->
        <div class="vita-welcome card-enter">
          <div class="vita-welcome-text">
            <p class="greet">${greeting}, 👋</p>
            <h2>${name}</h2>
            <p>Pantau nutrisi &amp; kesehatan Anda hari ini</p>
            <div class="vita-streak">🔥 ${streak} hari streak · Tetap semangat!</div>
          </div>
          <div class="vita-welcome-pills">
            <div class="vita-pill">
              <span class="dot dot-green" style="animation:livePulse 2s infinite"></span>
              ESP32-CAM Online
            </div>
            <div class="vita-pill">
              <span class="dot dot-blue"></span>
              ${VitaHelpers.formatDate(new Date(), 'full')}
            </div>
            <div class="vita-pill">
              <span class="dot dot-amber"></span>
              ${calT - calC > 0 ? `${calT - calC} kkal tersisa` : '✓ Target tercapai!'}
            </div>
          </div>
        </div>

        <!-- Stats Row -->
        <div>
          <div class="dash-section-title">Ringkasan Hari Ini</div>
          <div class="dash-stats-row">

            <div class="vita-stat cal card-enter delay-1">
              <div class="vs-icon">🔥</div>
              <div class="vs-val" data-countup="${calC}" data-from="0">${calC}</div>
              <div class="vs-unit">dari ${VitaHelpers.formatNumber(calT)} kkal</div>
              <div class="vs-label">Kalori</div>
              <div class="vs-progress-track">
                <div class="vs-progress-fill" data-target="${VitaHelpers.pct(calC,calT)}"></div>
              </div>
              <div class="vs-pct">${Math.round(VitaHelpers.pct(calC,calT))}%</div>
            </div>

            <div class="vita-stat prot card-enter delay-2">
              <div class="vs-icon">💪</div>
              <div class="vs-val" data-countup="${protC}" data-from="0">${protC}</div>
              <div class="vs-unit">dari ${protT}g protein</div>
              <div class="vs-label">Protein</div>
              <div class="vs-progress-track">
                <div class="vs-progress-fill" data-target="${VitaHelpers.pct(protC,protT)}"></div>
              </div>
              <div class="vs-pct">${Math.round(VitaHelpers.pct(protC,protT))}%</div>
            </div>

            <div class="vita-stat carb card-enter delay-3">
              <div class="vs-icon">🌾</div>
              <div class="vs-val" data-countup="${carbC}" data-from="0">${carbC}</div>
              <div class="vs-unit">dari ${carbT}g karbo</div>
              <div class="vs-label">Karbohidrat</div>
              <div class="vs-progress-track">
                <div class="vs-progress-fill" data-target="${VitaHelpers.pct(carbC,carbT)}"></div>
              </div>
              <div class="vs-pct">${Math.round(VitaHelpers.pct(carbC,carbT))}%</div>
            </div>

            <div class="vita-stat fat card-enter delay-4">
              <div class="vs-icon">🥑</div>
              <div class="vs-val" data-countup="${fatC}" data-from="0">${fatC}</div>
              <div class="vs-unit">dari ${fatT}g lemak</div>
              <div class="vs-label">Lemak</div>
              <div class="vs-progress-track">
                <div class="vs-progress-fill" data-target="${VitaHelpers.pct(fatC,fatT)}"></div>
              </div>
              <div class="vs-pct">${Math.round(VitaHelpers.pct(fatC,fatT))}%</div>
            </div>

          </div>
        </div>

        <!-- Main Row: Calorie Ring + Risk + Water -->
        <div class="dash-main-row">

          <!-- Calorie Ring -->
          <div class="vita-card calorie-vita-card card-enter delay-1">
            <div style="font-size:0.9rem;font-weight:700;color:var(--text);margin-bottom:16px;display:flex;align-items:center;gap:6px;">
              🍽️ Distribusi Kalori
            </div>
            <div class="calorie-ring-wrap">
              <canvas id="calorie-donut" width="160" height="160"></canvas>
              <div class="calorie-ring-center">
                <span class="ring-val" data-countup="${calC}">${VitaHelpers.formatNumber(calC)}</span>
                <span class="ring-label">kkal dikonsumsi</span>
                <span class="ring-target">/ ${VitaHelpers.formatNumber(calT)} target</span>
              </div>
            </div>
            <div class="calorie-legend">
              <div class="legend-row">
                <span class="legend-dot" style="background:#52B847"></span>
                <span class="legend-name">Dikonsumsi</span>
                <span class="legend-val">${VitaHelpers.formatNumber(calC)} kkal</span>
              </div>
              <div class="legend-row">
                <span class="legend-dot" style="background:#E2E8F0"></span>
                <span class="legend-name">Sisa</span>
                <span class="legend-val">${VitaHelpers.formatNumber(Math.max(0,calT-calC))} kkal</span>
              </div>
              <div class="legend-row">
                <span class="legend-dot" style="background:#2E7FBF"></span>
                <span class="legend-name">Protein</span>
                <span class="legend-val">${VitaHelpers.formatGrams(protC)}</span>
              </div>
              <div class="legend-row">
                <span class="legend-dot" style="background:#F59E0B"></span>
                <span class="legend-name">Karbohidrat</span>
                <span class="legend-val">${VitaHelpers.formatGrams(carbC)}</span>
              </div>
              <div class="legend-row">
                <span class="legend-dot" style="background:#EF4444"></span>
                <span class="legend-name">Lemak</span>
                <span class="legend-val">${VitaHelpers.formatGrams(fatC)}</span>
              </div>
            </div>
          </div>

          <!-- Risk Scores -->
          <div class="vita-card risk-vita-card card-enter delay-2">
            <div class="risk-card-title">
              <span>🛡️</span> Faktor Risiko Anda
            </div>
            <div class="risk-gauge-list">
              ${[
                { name:'Diabetes',         emoji:'🩸', score: rDM  },
                { name:'Hipertensi',       emoji:'❤️', score: rHT  },
                { name:'Obesitas',         emoji:'⚖️', score: rOB  },
                { name:'Penyakit Jantung', emoji:'💓', score: rCVD },
              ].map(item => `
                <div class="risk-gauge-item">
                  <div class="risk-gauge-header">
                    <span class="risk-gauge-name">
                      <span>${item.emoji}</span> ${item.name}
                    </span>
                    <span class="risk-gauge-pct ${getRiskClass(item.score)}">${item.score}%</span>
                  </div>
                  <div class="risk-track">
                    <div class="risk-fill ${getRiskClass(item.score)}" data-target="${item.score}"></div>
                  </div>
                </div>
              `).join('')}
            </div>
            <a href="#risk" style="display:block;margin-top:16px;text-align:center;font-size:0.8rem;
               color:var(--primary);font-weight:600;padding:8px;border-radius:var(--radius);
               background:var(--primary-bg);transition:background 0.2s;"
               onmouseover="this.style.background='var(--primary)';this.style.color='white'"
               onmouseout="this.style.background='var(--primary-bg)';this.style.color='var(--primary)'">
              Lihat analisis lengkap →
            </a>
          </div>

          <!-- Water + BMI -->
          <div class="vita-card water-vita-card card-enter delay-3">
            <div class="water-header">
              <div class="water-title">💧 Asupan Air</div>
              <span class="water-count-label"><strong id="water-count">${water}</strong>/8 gelas</span>
            </div>
            <div class="water-glasses" id="water-glasses">
              ${renderWaterGlasses(water)}
            </div>
            <div style="font-size:0.72rem;color:var(--text-light);">
              Klik gelas untuk update · target 2L/hari
            </div>
            <div style="padding-top:14px;border-top:1px solid var(--border-light);">
              <div style="font-size:0.8rem;font-weight:700;color:var(--text);margin-bottom:8px;">📊 BMI Anda</div>
              <div style="display:flex;align-items:baseline;gap:8px;">
                <span style="font-size:2rem;font-weight:800;font-family:var(--font-sans);color:var(--text);"
                  data-countup="${p.bmi ? Math.round(p.bmi*10)/10 : 0}">
                  ${p.bmi ? p.bmi.toFixed(1) : '—'}
                </span>
                <span style="font-size:0.85rem;font-weight:600;
                  color:${p.bmi ? (p.bmi < 18.5 ? '#2E7FBF' : p.bmi < 25 ? '#52B847' : p.bmi < 30 ? '#F59E0B' : '#EF4444') : 'var(--text-light)'};">
                  ${p.bmi ? VitaHelpers.getBMICategory(p.bmi).label : 'Belum diisi'}
                </span>
              </div>
              <div style="margin-top:8px;">
                <div class="vs-progress-track">
                  <div style="height:6px;border-radius:999px;background:linear-gradient(90deg,#52B847,#2E7FBF);
                    width:${p.bmi ? Math.min(100,Math.round((p.bmi/40)*100)) : 0}%;transition:width 1.2s ease;"></div>
                </div>
              </div>
            </div>
          </div>

        </div>

        <!-- Lower Row: Meals + Quick Actions -->
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;" class="dash-lower-row">

          <!-- Meals Log -->
          <div class="vita-card meals-vita-card card-enter delay-1">
            <div class="meals-card-header">
              <div class="meals-card-title">🍽️ Makanan Hari Ini</div>
              <button class="add-meal-btn" id="dash-add-meal">
                <i data-lucide="plus" style="width:13px;height:13px;"></i>
                Tambah
              </button>
            </div>
            <div id="meals-list">
              ${renderMealEntries(meals.length ? meals : DEMO.meals)}
            </div>
            <div style="margin-top:12px;padding-top:12px;border-top:1px solid var(--border-light);
              display:flex;justify-content:space-between;font-size:0.8rem;color:var(--text-secondary);">
              <span>Total kalori hari ini:</span>
              <span style="color:var(--primary);font-weight:700;">
                ${VitaHelpers.formatNumber(calC)} kkal
              </span>
            </div>
          </div>

          <!-- Quick Actions + Weekly Trend -->
          <div class="card-enter delay-2">
            <div class="dash-section-title">Aksi Cepat</div>
            <div class="quick-row">
              <button class="quick-btn-v" onclick="window.location.hash='scanner'">
                <div class="quick-icon-v" style="background:rgba(82,184,71,0.1);">📷</div>
                <span>Scan<br>Makanan</span>
              </button>
              <button class="quick-btn-v" onclick="window.location.hash='nutrition'">
                <div class="quick-icon-v" style="background:rgba(245,158,11,0.1);">✏️</div>
                <span>Tambah<br>Manual</span>
              </button>
              <button class="quick-btn-v" onclick="window.location.hash='risk'">
                <div class="quick-icon-v" style="background:rgba(239,68,68,0.1);">🛡️</div>
                <span>Cek<br>Risiko</span>
              </button>
              <button class="quick-btn-v" onclick="window.location.hash='consultant'">
                <div class="quick-icon-v" style="background:rgba(46,127,191,0.1);">🤖</div>
                <span>Tanya<br>AI</span>
              </button>
            </div>

            <!-- Weekly trend chart -->
            <div class="vita-card" style="margin-top:14px;padding:18px;">
              <div style="font-size:0.875rem;font-weight:700;color:var(--text);margin-bottom:12px;display:flex;align-items:center;gap:6px;">
                📈 Tren Kalori 7 Hari
              </div>
              <div style="height:100px;position:relative;">
                <canvas id="weekly-trend"></canvas>
              </div>
            </div>
          </div>

        </div>

        <div class="dash-bottom-spacer"></div>
      </div>
    </div>`;
  }

  // Count-up number animation
  function animateCount(el, to, duration = 900) {
    const from = 0;
    const start = performance.now();
    const isDecimal = String(to).includes('.');
    const update = (now) => {
      const t = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      const val = from + (to - from) * eased;
      el.textContent = isDecimal ? val.toFixed(1) : Math.round(val).toLocaleString('id-ID');
      if (t < 1) requestAnimationFrame(update);
    };
    requestAnimationFrame(update);
  }

  function init() {
    // Sidebar menu button
    const menuBtn = document.getElementById('dash-menu-btn');
    if (menuBtn) {
      menuBtn.addEventListener('click', () => {
        document.getElementById('sidebar')?.classList.toggle('open');
        document.getElementById('sidebar-overlay')?.classList.toggle('hidden');
      });
    }

    document.getElementById('dash-scan-quick')?.addEventListener('click', () => { window.location.hash = 'scanner'; });
    document.getElementById('dash-avatar')?.addEventListener('click', () => { window.location.hash = 'profile'; });
    document.getElementById('dash-add-meal')?.addEventListener('click', () => { window.location.hash = 'nutrition'; });

    // Water glasses
    const waterContainer = document.getElementById('water-glasses');
    if (waterContainer) {
      waterContainer.addEventListener('click', (e) => {
        const btn = e.target.closest('[data-glass]');
        if (!btn) return;
        const newCount = parseInt(btn.dataset.glass) + 1;
        VitaStore.set('waterToday', newCount);
        waterContainer.innerHTML = renderWaterGlasses(newCount);
        const countEl = document.getElementById('water-count');
        if (countEl) countEl.textContent = newCount;
      });
    }

    // Stagger card animations via IntersectionObserver (fallback to direct apply)
    requestAnimationFrame(() => {
      // Animate progress bars
      document.querySelectorAll('.vs-progress-fill[data-target], .risk-fill[data-target]').forEach(bar => {
        const target = parseFloat(bar.dataset.target) || 0;
        setTimeout(() => { bar.style.width = Math.min(target, 100) + '%'; }, 150);
      });

      // Count-up for stat values
      document.querySelectorAll('[data-countup]').forEach(el => {
        const to = parseFloat(el.dataset.countup);
        if (!isNaN(to) && to > 0) animateCount(el, to);
      });

      const n     = VitaStore.get('todayNutrition') || DEMO;
      const calC  = typeof n.calories === 'object' ? n.calories.consumed : (n.calories || DEMO.calories.consumed);
      const calT  = typeof n.calories === 'object' ? n.calories.target   : VitaHelpers.getCalorieTarget(VitaStore.get('profile'));
      const protC = typeof n.protein  === 'object' ? n.protein.consumed  : (n.protein  || DEMO.protein.consumed);
      const carbC = typeof n.carbs    === 'object' ? n.carbs.consumed    : (n.carbs    || DEMO.carbs.consumed);
      const fatC  = typeof n.fat      === 'object' ? n.fat.consumed      : (n.fat      || DEMO.fat.consumed);

      // Donut chart
      VitaCharts.createDonut('calorie-donut', calC, calT, '#2E7FBF');

      // Weekly trend
      const days = ['Sen','Sel','Rab','Kam','Jum','Sab','Hari ini'];
      const demoCalories = [1850, 2100, 1780, 2250, 1920, 1680, calC];
      VitaCharts.createLine('weekly-trend', days, [{
        label: 'Kalori',
        data: demoCalories,
        borderColor: '#2E7FBF',
        backgroundColor: 'rgba(46,127,191,0.08)',
        fill: true,
        pointBackgroundColor: '#2E7FBF',
        tension: 0.4,
      }]);
    });
  }

  return { render, init };
})();
