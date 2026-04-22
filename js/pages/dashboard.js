// VITA — Dashboard Page
const DashboardPage = (() => {

  // Hanya dipakai di demo mode
  const DEMO = {
    meals: [
      { emoji:'🍳', name:'Nasi Goreng + Telur', time:'07:30', type:'Sarapan',     cal:420 },
      { emoji:'🍚', name:'Nasi Ayam + Sayur',   time:'12:15', type:'Makan Siang', cal:580 },
      { emoji:'🥤', name:'Teh Manis + Roti',    time:'15:00', type:'Snack',       cal:220 },
      { emoji:'🥘', name:'Sup Tahu Tempe',       time:'18:45', type:'Makan Malam', cal:200 },
    ],
    nutrition: { calories:1420, protein:68, carbs:195, fat:42, fiber:18, sodium:620, sugar:8 },
    risk: { diabetes:28, hypertension:42, obesity:19, cvd:33 },
    weeklyCalories: [1850, 2100, 1780, 2250, 1920, 1680, 1420],
  };

  // ── Helpers ──────────────────────────────────────────────────

  function getRiskClass(s) {
    return s < 25 ? 'r-low' : s < 55 ? 'r-mod' : 'r-high';
  }

  function renderWaterGlasses(count = 0, total = 8) {
    return Array.from({ length: total }, (_, i) =>
      `<div class="water-glass-icon ${i < count ? 'filled' : ''}" data-glass="${i}" title="${i+1} gelas">💧</div>`
    ).join('');
  }

  function renderMealEntries(meals) {
    if (!meals || !meals.length) {
      return `
      <div class="dash-empty-meals">
        <div style="font-size:2rem;margin-bottom:8px;">🍽️</div>
        <div>Belum ada makanan hari ini</div>
        <a href="#scanner" style="font-size:0.78rem;color:var(--primary);font-weight:600;margin-top:8px;display:inline-block;">+ Scan Makanan</a>
      </div>`;
    }
    return meals.map(m => `
    <div class="meal-entry-v">
      <div class="meal-emoji-v">${m.emoji || '🍴'}</div>
      <div class="meal-info-v">
        <div class="meal-name-v">${m.name}</div>
        <div class="meal-meta-v">${m.time} · ${m.type}</div>
      </div>
      <div class="meal-cal-v">
        <div class="mcal">${m.cal}</div>
        <div class="mtype">kkal</div>
      </div>
    </div>`).join('');
  }

  // Normalise dokumen Firestore ke format store
  function normalizeMeal(doc) {
    const n   = doc.totalNutrition || {};
    const food = doc.foods?.[0] || {};
    let time = '--:--';
    if (doc.timestamp) {
      try { time = new Date(doc.timestamp).toLocaleTimeString('id-ID', { hour:'2-digit', minute:'2-digit' }); }
      catch {}
    }
    return {
      id:    doc.id,
      name:  food.name || doc.mealType || 'Makanan',
      emoji: food.emoji || '🍽️',
      type:  doc.mealType || 'Sarapan',
      time,
      cal:   Math.round(n.calories || 0),
      prot:  parseFloat((n.protein  || 0).toFixed(1)),
      carb:  parseFloat((n.carbs    || 0).toFixed(1)),
      fat:   parseFloat((n.fat      || 0).toFixed(1)),
      fiber: parseFloat((n.fiber    || 0).toFixed(1)),
      sodium:parseFloat((n.sodium   || 0).toFixed(1)),
    };
  }

  function sumNutrition(meals) {
    return meals.reduce((acc, m) => ({
      calories: acc.calories + (m.cal   || 0),
      protein:  acc.protein  + (m.prot  || 0),
      carbs:    acc.carbs    + (m.carb  || 0),
      fat:      acc.fat      + (m.fat   || 0),
      fiber:    acc.fiber    + (m.fiber || 0),
      sodium:   acc.sodium   + (m.sodium|| 0),
      sugar:    acc.sugar    || 0,
    }), { calories:0, protein:0, carbs:0, fat:0, fiber:0, sodium:0, sugar:0 });
  }

  // ── Render ────────────────────────────────────────────────────

  function render() {
    const p        = VitaStore.get('profile') || {};
    const isDemo   = VitaStore.get('demoMode');
    const n        = VitaStore.get('todayNutrition') || (isDemo ? DEMO.nutrition : {});
    const r        = VitaStore.get('riskScores') || (isDemo ? DEMO.risk : {});
    const meals    = VitaStore.get('todayMeals')  || (isDemo ? DEMO.meals : []);
    const water    = VitaStore.get('waterToday')  || 0;
    const name     = p.name || 'Pengguna';
    const calT     = VitaHelpers.getCalorieTarget(p) || 2100;
    const protT    = p.gender === 'female' ? 90 : 105;
    const carbT    = Math.round(calT * 0.50 / 4);
    const fatT     = Math.round(calT * 0.25 / 9);

    const calC  = Math.round(n.calories || 0);
    const protC = Math.round(n.protein  || 0);
    const carbC = Math.round(n.carbs    || 0);
    const fatC  = Math.round(n.fat      || 0);

    const rDM  = r.diabetes      || 0;
    const rHT  = r.hypertension  || 0;
    const rOB  = r.obesity       || 0;
    const rCVD = r.cvd           || 0;

    return `
    <div class="dash-bg">
      <div class="dash-orb dash-orb-1"></div>
      <div class="dash-orb dash-orb-2"></div>

      <div class="vita-topbar">
        <div class="vita-topbar-left">
          <button class="vita-menu-btn" id="dash-menu-btn" aria-label="Menu">
            <i data-lucide="menu"></i>
          </button>
          <div class="topbar-brand">
            <svg width="28" height="28" viewBox="0 0 64 64" fill="none">
              <circle cx="32" cy="32" r="32" fill="url(#vGrad)"/>
              <defs><linearGradient id="vGrad" x1="0" y1="0" x2="64" y2="64">
                <stop offset="0%" stop-color="#7CCC73"/>
                <stop offset="100%" stop-color="#93C5FD"/>
              </linearGradient></defs>
              <path d="M20 32 C20 24 28 18 32 18 C36 18 44 24 44 32 C44 40 38 46 32 46 C28 46 22 42 20 38"
                stroke="white" stroke-width="3" stroke-linecap="round" fill="none"/>
              <circle cx="32" cy="32" r="6" fill="white"/>
            </svg>
            <span><span class="brand-vi">vi</span><span class="brand-ta">ta</span></span>
          </div>
        </div>
        <div class="vita-topbar-right">
          <button class="vita-icon-btn" id="dash-refresh-btn" title="Refresh Data">
            <i data-lucide="refresh-cw"></i>
          </button>
          <button class="vita-icon-btn" id="dash-scan-quick" title="Scan Cepat">
            <i data-lucide="scan-line"></i>
          </button>
          <div class="vita-avatar" style="padding:0; overflow:hidden;">${VitaHelpers.getAvatar(p.name || 'U', p.photoURL)}</div>
        </div>
      </div>

      <div class="dash-content">

        ${isDemo ? `
        <div class="demo-banner card-enter">
          <div class="demo-banner-text">
            <i data-lucide="info" style="width:15px;height:15px;flex-shrink:0;"></i>
            Mode Demo — data contoh. Daftar untuk data nyata.
          </div>
          <div class="demo-banner-actions">
            <a href="#register" class="demo-cta-register">Daftar Gratis</a>
            <a href="#login" class="demo-cta-login">Masuk</a>
          </div>
        </div>` : ''}

        <!-- Welcome -->
        <div class="vita-welcome card-enter">
          <div class="vita-welcome-text">
            <p class="greet">${VitaHelpers.getGreeting()}, 👋</p>
            <h2>${name}</h2>
            <p>Pantau nutrisi &amp; kesehatan Anda hari ini</p>
          </div>
          <div class="vita-welcome-pills">
            <div class="vita-pill">
              <span class="dot dot-blue"></span>
              ${VitaHelpers.formatDate(new Date(), 'full')}
            </div>
            <div class="vita-pill">
              <span class="dot ${calC > 0 ? 'dot-green' : 'dot-amber'}" style="${calC > 0 ? 'animation:livePulse 2s infinite' : ''}"></span>
              ${calT - calC > 0 ? `${VitaHelpers.formatNumber(calT - calC)} kkal tersisa` : '✓ Target tercapai!'}
            </div>
            <div class="vita-pill">
              <span class="dot dot-amber"></span>
              ${meals.length} makanan tercatat
            </div>
          </div>
        </div>

        <!-- Stats Row -->
        <div>
          <div class="dash-section-title">Ringkasan Hari Ini</div>
          <div class="dash-stats-row">
            ${[
              { cls:'cal',  icon:'🔥', val:calC,  unit:`dari ${VitaHelpers.formatNumber(calT)} kkal`, label:'Kalori',      tgt:calT  },
              { cls:'prot', icon:'💪', val:protC, unit:`dari ${protT}g protein`,                       label:'Protein',     tgt:protT },
              { cls:'carb', icon:'🌾', val:carbC, unit:`dari ${carbT}g karbo`,                         label:'Karbohidrat', tgt:carbT },
              { cls:'fat',  icon:'🥑', val:fatC,  unit:`dari ${fatT}g lemak`,                          label:'Lemak',       tgt:fatT  },
            ].map((s, i) => `
            <div class="vita-stat ${s.cls} card-enter delay-${i+1}">
              <div class="vs-icon">${s.icon}</div>
              <div class="vs-val" data-countup="${s.val}">${s.val}</div>
              <div class="vs-unit">${s.unit}</div>
              <div class="vs-label">${s.label}</div>
              <div class="vs-progress-track">
                <div class="vs-progress-fill" data-target="${VitaHelpers.pct(s.val, s.tgt)}"></div>
              </div>
              <div class="vs-pct">${Math.round(VitaHelpers.pct(s.val, s.tgt))}%</div>
            </div>`).join('')}
          </div>
        </div>

        <!-- Main Row -->
        <div class="dash-main-row">

          <!-- Calorie Ring -->
          <div class="vita-card calorie-vita-card card-enter delay-1">
            <div class="dash-card-title">🍽️ Distribusi Kalori</div>
            <div class="calorie-ring-wrap">
              <canvas id="calorie-donut" width="160" height="160"></canvas>
              <div class="calorie-ring-center">
                <span class="ring-val" data-countup="${calC}">${VitaHelpers.formatNumber(calC)}</span>
                <span class="ring-label">kkal</span>
                <span class="ring-target">/ ${VitaHelpers.formatNumber(calT)}</span>
              </div>
            </div>
            <div class="calorie-legend">
              ${[
                { dot:'#52B847', name:'Dikonsumsi',  val:`${VitaHelpers.formatNumber(calC)} kkal` },
                { dot:'#E2E8F0', name:'Sisa',        val:`${VitaHelpers.formatNumber(Math.max(0,calT-calC))} kkal` },
                { dot:'#2E7FBF', name:'Protein',     val:VitaHelpers.formatGrams(protC) },
                { dot:'#F59E0B', name:'Karbohidrat', val:VitaHelpers.formatGrams(carbC) },
                { dot:'#EF4444', name:'Lemak',       val:VitaHelpers.formatGrams(fatC) },
              ].map(l => `
              <div class="legend-row">
                <span class="legend-dot" style="background:${l.dot}"></span>
                <span class="legend-name">${l.name}</span>
                <span class="legend-val">${l.val}</span>
              </div>`).join('')}
            </div>
          </div>

          <!-- Risk Scores -->
          <div class="vita-card risk-vita-card card-enter delay-2">
            <div class="risk-card-title"><span>🛡️</span> Faktor Risiko Anda</div>
            <div class="risk-gauge-list">
              ${[
                { name:'Diabetes',         emoji:'🩸', score:rDM  },
                { name:'Hipertensi',       emoji:'❤️', score:rHT  },
                { name:'Obesitas',         emoji:'⚖️', score:rOB  },
                { name:'Penyakit Jantung', emoji:'💓', score:rCVD },
              ].map(item => `
              <div class="risk-gauge-item">
                <div class="risk-gauge-header">
                  <span class="risk-gauge-name"><span>${item.emoji}</span> ${item.name}</span>
                  <span class="risk-gauge-pct ${getRiskClass(item.score)}">${item.score}%</span>
                </div>
                <div class="risk-track">
                  <div class="risk-fill ${getRiskClass(item.score)}" data-target="${item.score}"></div>
                </div>
              </div>`).join('')}
            </div>
            <a href="#risk" class="dash-link-btn">Lihat analisis lengkap →</a>
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
            <div style="font-size:0.72rem;color:var(--text-light);">Klik gelas untuk update · target 2L/hari</div>
            <div class="bmi-section">
              <div class="bmi-label">📊 BMI Anda</div>
              <div class="bmi-row">
                <span class="bmi-val" data-countup="${p.bmi ? parseFloat(p.bmi.toFixed(1)) : 0}">
                  ${p.bmi ? p.bmi.toFixed(1) : '—'}
                </span>
                <span class="bmi-cat" style="color:${p.bmi ? VitaHelpers.getBMICategory(p.bmi).color : 'var(--text-light)'};">
                  ${p.bmi ? VitaHelpers.getBMICategory(p.bmi).label : 'Belum diisi'}
                </span>
              </div>
              <div class="vs-progress-track" style="margin-top:8px;">
                <div style="height:6px;border-radius:999px;background:linear-gradient(90deg,#52B847,#2E7FBF);
                  width:${p.bmi ? Math.min(100,Math.round((p.bmi/40)*100)) : 0}%;transition:width 1.2s ease;"></div>
              </div>
            </div>
          </div>

        </div>

        <!-- Lower Row -->
        <div class="dash-lower-row">

          <!-- Meals Log -->
          <div class="vita-card meals-vita-card card-enter delay-1">
            <div class="meals-card-header">
              <div class="meals-card-title">🍽️ Makanan Hari Ini</div>
              <button class="add-meal-btn" id="dash-add-meal">
                <i data-lucide="plus" style="width:13px;height:13px;"></i> Tambah
              </button>
            </div>
            <div id="meals-list" class="dash-meals-loading">
              ${renderMealEntries(meals)}
            </div>
            <div class="meals-total-row">
              <span>Total kalori:</span>
              <span id="meals-total-cal" style="color:var(--primary);font-weight:700;">${VitaHelpers.formatNumber(calC)} kkal</span>
            </div>
          </div>

          <!-- Quick Actions + Trend -->
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

            <div class="vita-card" style="margin-top:14px;padding:18px;">
              <div class="dash-card-title" style="margin-bottom:12px;">📈 Tren Kalori 7 Hari</div>
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

  // ── Data Loading ─────────────────────────────────────────────

  async function loadDashboardData() {
    const user   = VitaStore.get('user');
    const isDemo = VitaStore.get('demoMode');

    if (isDemo || !user) {
      if (isDemo) {
        VitaStore.set('todayMeals',    DEMO.meals);
        VitaStore.set('todayNutrition', DEMO.nutrition);
        VitaStore.set('riskScores',     DEMO.risk);
      }
      drawCharts(isDemo ? DEMO.weeklyCalories : []);
      return;
    }

    try {
      const dateKey = VitaHelpers.getTodayKey();

      // 1. Meal hari ini
      const docs  = await VitaFirestore.getMealsForDate(user.uid, dateKey);
      const meals = docs.map(normalizeMeal);
      VitaStore.set('todayMeals', meals);

      // 2. Hitung nutrisi total hari ini
      const nutrition = sumNutrition(meals);
      VitaStore.set('todayNutrition', nutrition);

      // 3. Risk assessment terbaru
      const riskData = await VitaFirestore.getLatestRiskAssessment(user.uid);
      if (riskData?.scores) {
        VitaStore.set('riskScores',    riskData.scores);
        VitaStore.set('riskAssessment', riskData);
      }

      // 4. Tren 7 hari terakhir
      const weeklyCalories = await loadWeeklyCalories(user.uid);

      // 5. Update UI tanpa full re-render
      updateUI(meals, nutrition, riskData?.scores || VitaStore.get('riskScores') || {}, weeklyCalories);

    } catch (err) {
      console.error('[Dashboard] Gagal memuat data:', err);
      VitaHelpers.showToast('Gagal memuat data dashboard. Periksa koneksi.', 'error');
    }
  }

  async function loadWeeklyCalories(userId) {
    const result = [];
    const today  = new Date();
    for (let i = 6; i >= 0; i--) {
      const d   = new Date(today);
      d.setDate(d.getDate() - i);
      const key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
      try {
        const docs = await VitaFirestore.getMealsForDate(userId, key);
        const total = docs.reduce((s, doc) => s + Math.round(doc.totalNutrition?.calories || 0), 0);
        result.push(total);
      } catch {
        result.push(0);
      }
    }
    return result;
  }

  // ── UI Update (tanpa full re-render) ─────────────────────────

  function updateUI(meals, nutrition, risk, weeklyCalories) {
    const p    = VitaStore.get('profile') || {};
    const calT = VitaHelpers.getCalorieTarget(p) || 2100;
    const protT = p.gender === 'female' ? 90 : 105;
    const carbT = Math.round(calT * 0.50 / 4);
    const fatT  = Math.round(calT * 0.25 / 9);

    const calC  = Math.round(nutrition.calories || 0);
    const protC = Math.round(nutrition.protein  || 0);
    const carbC = Math.round(nutrition.carbs    || 0);
    const fatC  = Math.round(nutrition.fat      || 0);

    // Meals list
    const mealsList = document.getElementById('meals-list');
    if (mealsList) mealsList.innerHTML = renderMealEntries(meals);

    const totalCalEl = document.getElementById('meals-total-cal');
    if (totalCalEl) totalCalEl.textContent = `${VitaHelpers.formatNumber(calC)} kkal`;

    // Stat cards — update values & progress bars
    const statUpdates = [
      { selector:'.vita-stat.cal  .vs-val', val:calC,  tgt:calT  },
      { selector:'.vita-stat.prot .vs-val', val:protC, tgt:protT },
      { selector:'.vita-stat.carb .vs-val', val:carbC, tgt:carbT },
      { selector:'.vita-stat.fat  .vs-val', val:fatC,  tgt:fatT  },
    ];
    statUpdates.forEach(({ selector, val, tgt }) => {
      const el = document.querySelector(selector);
      if (el) animateCount(el, val);
      const pctEl = el?.closest('.vita-stat')?.querySelector('.vs-pct');
      if (pctEl) pctEl.textContent = `${Math.round(VitaHelpers.pct(val, tgt))}%`;
      const bar = el?.closest('.vita-stat')?.querySelector('.vs-progress-fill');
      if (bar) setTimeout(() => { bar.style.width = Math.min(VitaHelpers.pct(val, tgt), 100) + '%'; }, 150);
    });

    // Welcome pill
    const welcomePills = document.querySelectorAll('.vita-pill');
    if (welcomePills[1]) {
      welcomePills[1].innerHTML = `
        <span class="dot ${calC > 0 ? 'dot-green' : 'dot-amber'}" style="${calC > 0 ? 'animation:livePulse 2s infinite' : ''}"></span>
        ${calT - calC > 0 ? `${VitaHelpers.formatNumber(calT - calC)} kkal tersisa` : '✓ Target tercapai!'}`;
    }
    if (welcomePills[2]) {
      welcomePills[2].innerHTML = `<span class="dot dot-amber"></span>${meals.length} makanan tercatat`;
    }

    // Risk gauges
    const rDM  = risk.diabetes     || 0;
    const rHT  = risk.hypertension || 0;
    const rOB  = risk.obesity      || 0;
    const rCVD = risk.cvd          || 0;
    [rDM, rHT, rOB, rCVD].forEach((score, i) => {
      const items = document.querySelectorAll('.risk-gauge-item');
      if (!items[i]) return;
      const pctEl = items[i].querySelector('.risk-gauge-pct');
      const fill  = items[i].querySelector('.risk-fill');
      const cls   = getRiskClass(score);
      if (pctEl) { pctEl.textContent = `${score}%`; pctEl.className = `risk-gauge-pct ${cls}`; }
      if (fill)  { fill.className = `risk-fill ${cls}`; setTimeout(() => { fill.style.width = `${score}%`; }, 150); }
    });

    // Ring legend
    const ringVal = document.querySelector('.ring-val');
    if (ringVal) animateCount(ringVal, calC);

    drawCharts(weeklyCalories);

    if (typeof lucide !== 'undefined') lucide.createIcons();
  }

  // ── Charts ───────────────────────────────────────────────────

  function drawCharts(weeklyCalories) {
    const p    = VitaStore.get('profile') || {};
    const n    = VitaStore.get('todayNutrition') || {};
    const calC = Math.round(n.calories || 0);
    const calT = VitaHelpers.getCalorieTarget(p) || 2100;

    VitaCharts.createDonut('calorie-donut', calC, calT, '#2E7FBF');

    const today = new Date();
    const dayLabels = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(today);
      d.setDate(d.getDate() - (6 - i));
      return i === 6 ? 'Hari ini' : d.toLocaleDateString('id-ID', { weekday: 'short' });
    });

    VitaCharts.createLine('weekly-trend', dayLabels, [{
      label: 'Kalori',
      data:  weeklyCalories.length === 7 ? weeklyCalories : Array(7).fill(0),
      borderColor: '#2E7FBF',
      backgroundColor: 'rgba(46,127,191,0.08)',
      fill: true, tension: 0.4,
    }]);
  }

  // ── Animation ────────────────────────────────────────────────

  function animateCount(el, to, duration = 900) {
    if (!el) return;
    const start     = performance.now();
    const isDecimal = String(to).includes('.');
    const update = (now) => {
      const t     = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      el.textContent = isDecimal
        ? (to * eased).toFixed(1)
        : Math.round(to * eased).toLocaleString('id-ID');
      if (t < 1) requestAnimationFrame(update);
    };
    requestAnimationFrame(update);
  }

  // ── Init ─────────────────────────────────────────────────────

  function init() {
    document.getElementById('dash-menu-btn')?.addEventListener('click', () => {
      document.getElementById('sidebar')?.classList.toggle('open');
      document.getElementById('sidebar-overlay')?.classList.toggle('hidden');
    });
    document.getElementById('dash-scan-quick')?.addEventListener('click', () => { window.location.hash = 'scanner'; });
    document.getElementById('dash-avatar')?.addEventListener('click', () => { window.location.hash = 'profile'; });
    document.getElementById('dash-add-meal')?.addEventListener('click', () => { window.location.hash = 'nutrition'; });

    document.getElementById('dash-refresh-btn')?.addEventListener('click', async (e) => {
      const btn = e.currentTarget;
      btn.innerHTML = '<i data-lucide="loader-circle" style="width:18px;height:18px;animation:spin 1s linear infinite;"></i>';
      if (typeof lucide !== 'undefined') lucide.createIcons();
      await loadDashboardData();
      btn.innerHTML = '<i data-lucide="refresh-cw"></i>';
      if (typeof lucide !== 'undefined') lucide.createIcons();
      VitaHelpers.showToast('Data diperbarui', 'success');
    });

    // Water glasses
    document.getElementById('water-glasses')?.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-glass]');
      if (!btn) return;
      const newCount = parseInt(btn.dataset.glass) + 1;
      VitaStore.set('waterToday', newCount);
      const container = document.getElementById('water-glasses');
      if (container) container.innerHTML = renderWaterGlasses(newCount);
      const countEl = document.getElementById('water-count');
      if (countEl) countEl.textContent = newCount;
    });

    // Animasi awal dari data yang sudah ada di store
    requestAnimationFrame(() => {
      document.querySelectorAll('.vs-progress-fill[data-target],.risk-fill[data-target]').forEach(bar => {
        const tgt = parseFloat(bar.dataset.target) || 0;
        setTimeout(() => { bar.style.width = Math.min(tgt, 100) + '%'; }, 150);
      });
      document.querySelectorAll('[data-countup]').forEach(el => {
        const to = parseFloat(el.dataset.countup);
        if (!isNaN(to) && to > 0) animateCount(el, to);
      });

      // Gambar chart dari store yang sudah ada
      const isDemo = VitaStore.get('demoMode');
      drawCharts(isDemo ? DEMO.weeklyCalories : []);
    });

    // Muat data dari Firestore
    loadDashboardData();
  }

  return { render, init };
})();
