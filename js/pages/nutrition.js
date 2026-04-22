// VITA — Nutrition Page
const NutritionPage = (() => {

  const MEAL_META = {
    'Sarapan':     { icon: 'sunrise',     emoji: '🌅', color: '#F59E0B', bg: 'rgba(245,158,11,0.1)' },
    'Makan Siang': { icon: 'sun',         emoji: '☀️', color: '#52B847', bg: 'rgba(82,184,71,0.1)'  },
    'Snack':       { icon: 'cookie',      emoji: '🍎', color: '#8B5CF6', bg: 'rgba(139,92,246,0.1)' },
    'Makan Malam': { icon: 'moon',        emoji: '🌙', color: '#2E7FBF', bg: 'rgba(46,127,191,0.1)' },
  };

  const TARGETS = { cal: 2100, prot: 105, carb: 262, fat: 70 };

  function getMeals() {
    let meals = VitaStore.get('todayMeals');
    if (!meals || meals.length === 0) {
      if (VitaStore.get('demoMode')) {
        meals = [
          { id: 1, emoji: '🍳', name: 'Nasi Goreng + Telur', time: '07:30', type: 'Sarapan',     cal: 420, prot: 15, carb: 50, fat: 12 },
          { id: 2, emoji: '🍚', name: 'Nasi Ayam + Sayur',   time: '12:15', type: 'Makan Siang', cal: 580, prot: 25, carb: 65, fat: 18 },
          { id: 3, emoji: '🥤', name: 'Teh Manis + Roti',    time: '15:00', type: 'Snack',       cal: 220, prot:  5, carb: 45, fat:  2 },
          { id: 4, emoji: '🥘', name: 'Sup Tahu Tempe',      time: '18:45', type: 'Makan Malam', cal: 200, prot: 23, carb: 35, fat: 10 },
        ];
      } else {
        meals = [];
      }
    }
    return meals;
  }

  let currentTab = 'Sarapan';

  function topbar() {
    const p = VitaStore.get('profile') || {};
    return `
    <div class="vita-topbar">
      <div class="vita-topbar-left">
        <button class="vita-menu-btn" id="nutri-menu-btn"><i data-lucide="menu"></i></button>
        <div class="topbar-brand">
          <svg width="26" height="26" viewBox="0 0 64 64" fill="none">
            <circle cx="32" cy="32" r="32" fill="url(#nGrad)"/>
            <defs><linearGradient id="nGrad" x1="0" y1="0" x2="64" y2="64">
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
        <div class="vita-avatar">${VitaHelpers.getInitials(p.name || 'U')}</div>
      </div>
    </div>`;
  }

  function getTotals() {
    let tCal = 0, tProt = 0, tCarb = 0, tFat = 0;
    getMeals().forEach(m => { tCal += m.cal||0; tProt += m.prot||0; tCarb += m.carb||0; tFat += m.fat||0; });
    return { tCal, tProt, tCarb, tFat };
  }

  function renderHeroSummary() {
    const { tCal, tProt, tCarb, tFat } = getTotals();
    const pct = Math.min(100, Math.round((tCal / TARGETS.cal) * 100));
    const remaining = Math.max(0, TARGETS.cal - tCal);
    const isOver = tCal > TARGETS.cal;

    return `
    <div class="nutri-hero card-enter">
      <!-- Calorie ring + label -->
      <div class="nutri-hero-ring-wrap">
        <div class="nutri-ring-outer">
          <svg viewBox="0 0 120 120" class="nutri-ring-svg">
            <circle cx="60" cy="60" r="50" fill="none" stroke="rgba(255,255,255,0.15)" stroke-width="10"/>
            <circle cx="60" cy="60" r="50" fill="none"
              stroke="${isOver ? '#EF4444' : '#A7F3D0'}" stroke-width="10"
              stroke-linecap="round"
              stroke-dasharray="${2 * Math.PI * 50}"
              stroke-dashoffset="${2 * Math.PI * 50 * (1 - pct / 100)}"
              transform="rotate(-90 60 60)"
              style="transition: stroke-dashoffset 1.2s cubic-bezier(0.4,0,0.2,1);"/>
          </svg>
          <div class="nutri-ring-label">
            <span class="nutri-ring-val">${VitaHelpers.formatNumber(tCal)}</span>
            <span class="nutri-ring-sub">kkal</span>
            <span class="nutri-ring-pct">${pct}%</span>
          </div>
        </div>
        <div class="nutri-hero-ring-info">
          <div class="nutri-ring-target">Target: <strong>${VitaHelpers.formatNumber(TARGETS.cal)} kkal</strong></div>
          <div class="nutri-ring-status ${isOver ? 'over' : 'ok'}">
            <i data-lucide="${isOver ? 'trending-up' : 'check-circle'}" style="width:13px;height:13px;"></i>
            ${isOver ? 'Lebih ' + (tCal - TARGETS.cal) + ' kkal' : 'Sisa ' + remaining + ' kkal'}
          </div>
        </div>
      </div>

      <!-- Macro grid -->
      <div class="nutri-macro-grid">
        ${[
          { label:'Protein',     val: tProt, tg: TARGETS.prot, unit:'g', color:'#3B82F6', icon:'beef' },
          { label:'Karbohidrat', val: tCarb, tg: TARGETS.carb, unit:'g', color:'#F59E0B', icon:'wheat' },
          { label:'Lemak',       val: tFat,  tg: TARGETS.fat,  unit:'g', color:'#EF4444', icon:'droplets' },
        ].map(m => {
          const p = Math.min(100, Math.round((m.val / m.tg) * 100));
          return `
          <div class="nutri-macro-card">
            <div class="nutri-macro-icon" style="background:${m.color}22; color:${m.color};">
              <i data-lucide="${m.icon}" style="width:14px;height:14px;"></i>
            </div>
            <div class="nutri-macro-body">
              <div class="nutri-macro-label">${m.label}</div>
              <div class="nutri-macro-val">${m.val}<span>${m.unit}</span> <span style="color:var(--text-light);font-size:0.7rem;">/ ${m.tg}${m.unit}</span></div>
              <div class="nutri-macro-bar-track">
                <div class="nutri-macro-bar-fill" style="width:${p}%; background:${m.color};"></div>
              </div>
            </div>
          </div>`;
        }).join('')}
      </div>
    </div>`;
  }

  function renderTabs() {
    const meals = getMeals();
    return Object.entries(MEAL_META).map(([label, meta]) => {
      const count = meals.filter(m => m.type === label).length;
      const isActive = label === currentTab;
      return `
      <button class="nutri-tab ${isActive ? 'active' : ''}" data-tab="${label}"
        style="${isActive ? `background:${meta.color}; border-color:${meta.color};` : ''}">
        <span class="nutri-tab-emoji">${meta.emoji}</span>
        <span class="nutri-tab-label">${label}</span>
        ${count > 0 ? `<span class="nutri-tab-badge" style="${isActive ? 'background:rgba(255,255,255,0.3); color:white;' : `background:${meta.color}22; color:${meta.color};`}">${count}</span>` : ''}
      </button>`;
    }).join('');
  }

  function renderMealList() {
    const filtered = getMeals().filter(m => m.type === currentTab);
    const meta = MEAL_META[currentTab];

    if (!filtered.length) {
      return `
      <div class="nutri-empty">
        <div class="nutri-empty-icon">${meta.emoji}</div>
        <div class="nutri-empty-title">Belum ada catatan</div>
        <div class="nutri-empty-sub">Tambahkan makanan ${currentTab.toLowerCase()} Anda di bawah</div>
      </div>`;
    }

    return filtered.map(m => `
    <div class="nutri-meal-card" data-meal-id="${m.id || m.name}" style="border-left-color:${meta.color};">
      <div class="nutri-meal-emoji">${m.emoji || meta.emoji}</div>
      <div class="nutri-meal-body">
        <div class="nutri-meal-name">${m.name}</div>
        <div class="nutri-meal-meta">
          <i data-lucide="clock" style="width:11px;height:11px;"></i> ${m.time}
          ${m.prot ? `· 💪 ${m.prot}g · 🌾 ${m.carb}g · 🥑 ${m.fat}g` : ''}
        </div>
      </div>
      <div class="nutri-meal-cal">
        <span class="nutri-meal-cal-val">${m.cal}</span>
        <span class="nutri-meal-cal-unit">kkal</span>
      </div>
      <button class="nutri-meal-del" data-meal-id="${m.id || m.name}" title="Hapus">
        <i data-lucide="trash-2" style="width:15px;height:15px;"></i>
      </button>
    </div>`).join('');
  }

  function renderAddForm() {
    const meta = MEAL_META[currentTab];
    return `
    <div class="vita-card card-enter delay-4">
      <div class="nutri-form-header">
        <div class="nutri-form-icon" style="background:${meta.bg}; color:${meta.color};">
          <i data-lucide="plus" style="width:16px;height:16px;"></i>
        </div>
        <div>
          <div style="font-size:0.9rem;font-weight:700;color:var(--text);">Tambah ke Log</div>
          <div style="font-size:0.75rem;color:var(--text-secondary);">Catat asupan makanan Anda</div>
        </div>
      </div>
      <form id="add-meal-form">
        <div class="form-group">
          <label class="form-label">Nama Makanan</label>
          <input type="text" id="meal-name" class="form-input" placeholder="Contoh: Nasi Goreng, Roti Bakar…" required autocomplete="off">
        </div>
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Kalori (kkal)</label>
            <input type="number" id="meal-cal" class="form-input" placeholder="250" min="1" required>
          </div>
          <div class="form-group">
            <label class="form-label">Waktu Makan</label>
            <select id="meal-type" class="form-input form-select">
              ${Object.keys(MEAL_META).map(t =>
                `<option value="${t}" ${currentTab === t ? 'selected' : ''}>${MEAL_META[t].emoji} ${t}</option>`
              ).join('')}
            </select>
          </div>
        </div>
        <button type="submit" class="btn btn-primary nutri-submit-btn">
          <i data-lucide="plus-circle" style="width:16px;height:16px;"></i>
          Simpan ke Log
        </button>
      </form>
    </div>`;
  }

  function render() {
    const today = VitaHelpers.formatDate(new Date(), 'full');
    return `
    <div class="dash-bg">
      <div class="dash-orb dash-orb-1"></div>
      <div class="dash-orb dash-orb-2"></div>
      ${topbar()}
      <div class="dash-content">

        <!-- Page Title + Date Nav -->
        <div class="nutri-page-header card-enter">
          <div>
            <h2 class="nutri-page-title">Pelacak Nutrisi</h2>
            <div class="nutri-page-date">
              <i data-lucide="calendar" style="width:13px;height:13px;"></i>
              ${today}
            </div>
          </div>
          <div class="nutri-date-nav">
            <button class="nutri-date-btn" id="nutri-prev-day" title="Kemarin">
              <i data-lucide="chevron-left" style="width:18px;height:18px;"></i>
            </button>
            <span class="nutri-date-label">Hari Ini</span>
            <button class="nutri-date-btn" disabled style="opacity:0.35;">
              <i data-lucide="chevron-right" style="width:18px;height:18px;"></i>
            </button>
          </div>
        </div>

        <!-- Hero: Calorie Ring + Macros -->
        <div id="nutrition-macro-bars">
          ${renderHeroSummary()}
        </div>

        <!-- Meal Time Tabs -->
        <div class="nutri-tabs-wrap card-enter delay-2" id="nutrition-tabs-container">
          ${renderTabs()}
        </div>

        <!-- Meals List -->
        <div class="vita-card card-enter delay-3" style="margin-bottom:0;">
          <div class="nutri-list-header">
            <div class="nutri-list-title">
              <i data-lucide="utensils" style="width:15px;height:15px;color:var(--primary);"></i>
              <span id="current-tab-label">${currentTab}</span>
            </div>
            <span class="nutri-list-count" id="nutri-tab-count">
              ${getMeals().filter(m => m.type === currentTab).length} item
            </span>
          </div>
          <div id="nutrition-meal-list" class="nutri-meal-list">
            ${renderMealList()}
          </div>
        </div>

        <!-- Add Meal Form -->
        <div id="nutri-form-wrap">
          ${renderAddForm()}
        </div>

        <div class="dash-bottom-spacer"></div>
      </div>
    </div>`;
  }

  function updateUI() {
    const macroEl = document.getElementById('nutrition-macro-bars');
    if (macroEl) macroEl.innerHTML = renderHeroSummary();

    const tabsEl = document.getElementById('nutrition-tabs-container');
    if (tabsEl) tabsEl.innerHTML = renderTabs();

    const labelEl = document.getElementById('current-tab-label');
    if (labelEl) labelEl.textContent = currentTab;

    const countEl = document.getElementById('nutri-tab-count');
    if (countEl) countEl.textContent = getMeals().filter(m => m.type === currentTab).length + ' item';

    const listEl = document.getElementById('nutrition-meal-list');
    if (listEl) listEl.innerHTML = renderMealList();

    const formEl = document.getElementById('nutri-form-wrap');
    if (formEl) formEl.innerHTML = renderAddForm();

    const select = document.getElementById('meal-type');
    if (select) select.value = currentTab;

    if (typeof lucide !== 'undefined') lucide.createIcons();
    attachDeleteListeners();
    attachTabListeners();

    // Re-attach form submit
    document.getElementById('add-meal-form')?.addEventListener('submit', addMeal);
  }

  function addMeal(e) {
    e.preventDefault();
    const name = document.getElementById('meal-name').value.trim();
    const cal  = parseInt(document.getElementById('meal-cal').value);
    const type = document.getElementById('meal-type').value;

    if (!name || isNaN(cal) || cal <= 0) {
      VitaHelpers.showToast('Harap isi nama makanan dan kalori dengan benar.', 'error');
      return;
    }

    const prot = Math.round(cal * 0.05);
    const carb = Math.round(cal * 0.12);
    const fat  = Math.round(cal * 0.03);

    const newMeal = {
      id:    Date.now(),
      name, cal, prot, carb, fat, type,
      emoji: MEAL_META[type]?.emoji || '🍴',
      time:  new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
    };

    const meals = getMeals();
    meals.push(newMeal);
    VitaStore.set('todayMeals', meals);
    currentTab = type;

    updateUI();
    VitaHelpers.showToast(`${name} berhasil ditambahkan!`, 'success');
  }

  function deleteMeal(e) {
    const mealId = e.currentTarget.dataset.mealId;
    const meals = getMeals().filter(m => String(m.id) !== mealId && m.name !== mealId);
    VitaStore.set('todayMeals', meals);
    updateUI();
    VitaHelpers.showToast('Makanan dihapus.', 'success');
  }

  function attachDeleteListeners() {
    document.querySelectorAll('.nutri-meal-del').forEach(btn => {
      btn.addEventListener('click', deleteMeal);
    });
  }

  function attachTabListeners() {
    document.querySelectorAll('.nutri-tab').forEach(btn => {
      btn.addEventListener('click', (e) => {
        currentTab = e.currentTarget.dataset.tab;
        updateUI();
      });
    });
  }

  function init() {
    document.getElementById('nutri-menu-btn')?.addEventListener('click', () => {
      document.getElementById('sidebar')?.classList.toggle('open');
      document.getElementById('sidebar-overlay')?.classList.toggle('hidden');
    });
    document.getElementById('add-meal-form')?.addEventListener('submit', addMeal);
    attachDeleteListeners();
    attachTabListeners();
  }

  return { render, init };
})();
