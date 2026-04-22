// VITA — Nutrition Page
const NutritionPage = (() => {

  const MEAL_META = {
    'Sarapan':     { emoji: '🌅', color: '#F59E0B', bg: 'rgba(245,158,11,0.1)'  },
    'Makan Siang': { emoji: '☀️', color: '#52B847', bg: 'rgba(82,184,71,0.1)'   },
    'Snack':       { emoji: '🍎', color: '#8B5CF6', bg: 'rgba(139,92,246,0.1)'  },
    'Makan Malam': { emoji: '🌙', color: '#2E7FBF', bg: 'rgba(46,127,191,0.1)'  },
  };

  let currentTab     = 'Semua';
  let currentDateKey = VitaHelpers.getTodayKey();
  let isLoading      = false;

  // ── Helpers ──────────────────────────────────────────────────

  function getTargets() {
    const p    = VitaStore.get('profile') || {};
    const cal  = VitaHelpers.getCalorieTarget(p) || 2100;
    const prot = p.gender === 'female' ? 90  : 105;
    const carb = Math.round(cal * 0.50 / 4);
    const fat  = Math.round(cal * 0.25 / 9);
    return { cal, prot, carb, fat };
  }

  function getMeals() {
    return VitaStore.get('todayMeals') || [];
  }

  function dateKeyToDisplay(key) {
    if (key === VitaHelpers.getTodayKey()) return 'Hari Ini';
    const [y, m, d] = key.split('-').map(Number);
    return new Date(y, m - 1, d).toLocaleDateString('id-ID', { weekday:'long', day:'numeric', month:'long', year:'numeric' });
  }

  function normalizeMeal(doc) {
    const n    = doc.totalNutrition || {};
    const food = doc.foods?.[0]    || {};
    let time = '--:--';
    if (doc.timestamp) {
      try { time = new Date(doc.timestamp).toLocaleTimeString('id-ID', { hour:'2-digit', minute:'2-digit' }); } catch {}
    }
    return {
      id:    doc.id,
      name:  food.name  || doc.mealType || 'Makanan',
      emoji: food.emoji || MEAL_META[doc.mealType]?.emoji || '🍽️',
      image_url: doc.image_url || null,
      type:  doc.mealType || 'Sarapan',
      time,
      cal:  Math.round(n.calories || 0),
      prot: parseFloat((n.protein  || 0).toFixed(1)),
      carb: parseFloat((n.carbs    || 0).toFixed(1)),
      fat:  parseFloat((n.fat      || 0).toFixed(1)),
      fiber:parseFloat((n.fiber    || 0).toFixed(1)),
    };
  }

  // ── Firestore ────────────────────────────────────────────────

  async function loadFromFirestore(dateKey) {
    const user   = VitaStore.get('user');
    if (!user) return;

    isLoading = true;
    setLoadingState(true);

    try {
      const docs  = await VitaFirestore.getMealsForDate(user.uid, dateKey);
      const meals = docs.map(normalizeMeal);
      VitaStore.set('todayMeals', meals);

      // Sync todayNutrition dari data Firestore
      VitaStore.set('todayNutrition', meals.reduce((acc, m) => ({
        calories: acc.calories + (m.cal  || 0),
        protein:  acc.protein  + (m.prot || 0),
        carbs:    acc.carbs    + (m.carb || 0),
        fat:      acc.fat      + (m.fat  || 0),
        fiber:    acc.fiber    + (m.fiber|| 0),
        sodium:   acc.sodium,
        sugar:    acc.sugar,
      }), { calories:0, protein:0, carbs:0, fat:0, fiber:0, sodium:0, sugar:0 }));

      // PENTING: reset isLoading SEBELUM updateUI() agar renderMealList()
      // tidak menampilkan spinner saat updateUI() dipanggil
      isLoading = false;
      updateUI();
    } catch (err) {
      console.error('[Nutrition] loadFromFirestore error:', err);
      isLoading = false;
      setLoadingState(false);
      VitaHelpers.showToast('Gagal memuat data dari Firestore.', 'error');
    } finally {
      // isLoading sudah di-reset di atas, finally hanya safety guard
      isLoading = false;
    }
  }

  async function saveMealToFirestore(mealData) {
    const user = VitaStore.get('user');
    if (!user) return null;
    return VitaFirestore.saveMeal(user.uid, {
      mealType: mealData.type,
      timestamp: new Date().toISOString(),
      source: 'manual',
      foods: [{ name: mealData.name, portion: 1, nutrition: {
        calories: mealData.cal,
        protein:  mealData.prot,
        carbs:    mealData.carb,
        fat:      mealData.fat,
        fiber:    0, sodium: 0, sugar: 0,
      }}],
      totalNutrition: {
        calories: mealData.cal,
        protein:  mealData.prot,
        carbs:    mealData.carb,
        fat:      mealData.fat,
        fiber:    0, sodium: 0, sugar: 0,
      },
    });
  }

  async function deleteMealFromFirestore(firestoreId) {
    const user = VitaStore.get('user');
    if (!user || !firestoreId) return;
    return VitaFirestore.deleteMeal(user.uid, firestoreId);
  }

  // ── Render Functions ─────────────────────────────────────────

  function getTotals() {
    const m = getMeals();
    return {
      tCal:  Math.round(m.reduce((s, x) => s + (x.cal  || 0), 0)),
      tProt: parseFloat(m.reduce((s, x) => s + (x.prot || 0), 0).toFixed(1)),
      tCarb: parseFloat(m.reduce((s, x) => s + (x.carb || 0), 0).toFixed(1)),
      tFat:  parseFloat(m.reduce((s, x) => s + (x.fat  || 0), 0).toFixed(1)),
    };
  }

  function renderHeroSummary() {
    const { tCal, tProt, tCarb, tFat } = getTotals();
    const TG     = getTargets();
    const pct    = Math.min(100, Math.round((tCal / TG.cal) * 100));
    const isOver = tCal > TG.cal;

    return `
    <div class="nutri-hero card-enter">
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
              style="transition:stroke-dashoffset 1.2s cubic-bezier(0.4,0,0.2,1);"/>
          </svg>
          <div class="nutri-ring-label">
            <span class="nutri-ring-val">${VitaHelpers.formatNumber(tCal)}</span>
            <span class="nutri-ring-sub">kkal</span>
            <span class="nutri-ring-pct">${pct}%</span>
          </div>
        </div>
        <div class="nutri-hero-ring-info">
          <div class="nutri-ring-target">Target: <strong>${VitaHelpers.formatNumber(TG.cal)} kkal</strong></div>
          <div class="nutri-ring-status ${isOver ? 'over' : 'ok'}">
            <i data-lucide="${isOver ? 'trending-up' : 'check-circle'}" style="width:13px;height:13px;"></i>
            ${isOver ? 'Lebih ' + (tCal - TG.cal) + ' kkal' : 'Sisa ' + Math.max(0, TG.cal - tCal) + ' kkal'}
          </div>
        </div>
      </div>
      <div class="nutri-macro-grid">
        ${[
          { label:'Protein',     val:tProt, tg:TG.prot, unit:'g', color:'#3B82F6', icon:'beef'      },
          { label:'Karbohidrat', val:tCarb, tg:TG.carb, unit:'g', color:'#F59E0B', icon:'wheat'     },
          { label:'Lemak',       val:tFat,  tg:TG.fat,  unit:'g', color:'#EF4444', icon:'droplets'  },
        ].map(m => {
          const p = Math.min(100, Math.round((m.val / m.tg) * 100));
          return `
          <div class="nutri-macro-card">
            <div class="nutri-macro-icon" style="background:${m.color}22;color:${m.color};">
              <i data-lucide="${m.icon}" style="width:14px;height:14px;"></i>
            </div>
            <div class="nutri-macro-body">
              <div class="nutri-macro-label">${m.label}</div>
              <div class="nutri-macro-val">${m.val}<span>${m.unit}</span>
                <span style="color:var(--text-light);font-size:0.7rem;">/ ${m.tg}${m.unit}</span>
              </div>
              <div class="nutri-macro-bar-track">
                <div class="nutri-macro-bar-fill" style="width:${p}%;background:${m.color};"></div>
              </div>
            </div>
          </div>`;
        }).join('')}
      </div>
    </div>`;
  }

  function renderTabs() {
    const meals = getMeals();
    
    let html = `
      <button class="nutri-tab ${currentTab === 'Semua' ? 'active' : ''}" data-tab="Semua"
        style="${currentTab === 'Semua' ? 'background:#64748B;border-color:#64748B;color:white;' : ''}">
        <span class="nutri-tab-emoji">📋</span>
        <span class="nutri-tab-label">Semua</span>
        ${meals.length > 0 ? `<span class="nutri-tab-badge"
          style="${currentTab === 'Semua' ? 'background:rgba(255,255,255,0.3);color:white;' : 'background:rgba(100,116,139,0.1);color:#64748B;'}"
          >${meals.length}</span>` : ''}
      </button>`;

    html += Object.entries(MEAL_META).map(([label, meta]) => {
      const count    = meals.filter(m => m.type === label).length;
      const isActive = label === currentTab;
      return `
      <button class="nutri-tab ${isActive ? 'active' : ''}" data-tab="${label}"
        style="${isActive ? `background:${meta.color};border-color:${meta.color};` : ''}">
        <span class="nutri-tab-emoji">${meta.emoji}</span>
        <span class="nutri-tab-label">${label}</span>
        ${count > 0 ? `<span class="nutri-tab-badge"
          style="${isActive ? 'background:rgba(255,255,255,0.3);color:white;' : `background:${meta.color}22;color:${meta.color};`}"
          >${count}</span>` : ''}
      </button>`;
    }).join('');
    
    return html;
  }

  function renderMealList() {
    const meals = getMeals();
    const filtered = currentTab === 'Semua' ? meals : meals.filter(m => m.type === currentTab);
    const meta     = currentTab === 'Semua' ? { emoji: '📋', color: '#64748B' } : MEAL_META[currentTab];

    if (isLoading) {
      return `<div class="nutri-loading"><i data-lucide="loader-circle" style="width:24px;height:24px;animation:spin 1s linear infinite;color:var(--primary);"></i></div>`;
    }

    if (!filtered.length) {
      return `
      <div class="nutri-empty">
        <div class="nutri-empty-icon">${meta.emoji}</div>
        <div class="nutri-empty-title">Belum ada catatan ${currentTab === 'Semua' ? 'makanan' : currentTab.toLowerCase()}</div>
        <div class="nutri-empty-sub">Tambahkan di form di bawah atau scan via ESP32-CAM</div>
      </div>`;
    }

    return filtered.map(m => {
      const mMeta = MEAL_META[m.type] || { emoji: '🍽️', color: '#64748B' };
      return `
      <div class="nutri-meal-card premium-card" data-meal-id="${m.id}" style="border-left: 4px solid ${mMeta.color}; border-radius: 12px; padding: 14px 16px; background: rgba(255, 255, 255, 0.85); backdrop-filter: blur(10px); display: flex; align-items: center; gap: 14px; margin-bottom: 10px; box-shadow: 0 4px 12px rgba(0,0,0,0.03); transition: transform 0.2s, box-shadow 0.2s; position: relative; overflow: hidden;" onmouseover="this.style.transform='translateX(4px)'; this.style.boxShadow='0 6px 16px rgba(0,0,0,0.06)'" onmouseout="this.style.transform='translateX(0)'; this.style.boxShadow='0 4px 12px rgba(0,0,0,0.03)'">
        <div style="background: ${mMeta.color}15; width: 46px; height: 46px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 1.5rem; flex-shrink: 0; overflow: hidden; position: relative;">
          ${m.image_url
            ? `<img src="${m.image_url}" style="width:100%;height:100%;object-fit:cover;display:block;" alt="${m.name}" referrerpolicy="no-referrer" loading="lazy"
                onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">
               <span style="display:none;width:100%;height:100%;align-items:center;justify-content:center;position:absolute;inset:0;">${m.emoji || mMeta.emoji}</span>`
            : m.emoji || mMeta.emoji}
        </div>
        <div style="flex: 1; min-width: 0;">
          <div style="font-weight: 700; font-size: 0.95rem; color: #1e293b; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin-bottom: 5px;">${m.name}</div>
          <div style="display: flex; align-items: center; gap: 6px; flex-wrap: wrap; font-size: 0.72rem;">
            <span style="display: flex; align-items: center; gap: 3px; background: #f1f5f9; padding: 3px 6px; border-radius: 6px; color: #64748b; font-weight: 600;">
              <i data-lucide="clock" style="width:10px;height:10px;"></i> ${m.time}
            </span>
            ${m.prot ? `<span style="background: #eff6ff; color: #3b82f6; padding: 3px 6px; border-radius: 6px; font-weight: 700;">💪 ${m.prot}g</span>` : ''}
            ${m.carb ? `<span style="background: #fffbeb; color: #f59e0b; padding: 3px 6px; border-radius: 6px; font-weight: 700;">🌾 ${m.carb}g</span>` : ''}
            ${m.fat ? `<span style="background: #fef2f2; color: #ef4444; padding: 3px 6px; border-radius: 6px; font-weight: 700;">🥑 ${m.fat}g</span>` : ''}
            ${currentTab === 'Semua' ? `<span style="background: ${mMeta.color}15; color: ${mMeta.color}; padding: 3px 6px; border-radius: 6px; font-weight: 700;">${m.type}</span>` : ''}
          </div>
        </div>
        <div style="text-align: right; margin-right: 4px;">
          <div style="font-size: 1.25rem; font-weight: 800; color: ${mMeta.color}; line-height: 1; margin-bottom: 2px;">${m.cal}</div>
          <div style="font-size: 0.65rem; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.05em;">kkal</div>
        </div>
        <button class="nutri-meal-del" data-meal-id="${m.id}" title="Hapus" style="width: 32px; height: 32px; border-radius: 8px; border: none; background: #fee2e2; color: #ef4444; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.2s; opacity: 0.85; margin-left: 6px;" onmouseover="this.style.opacity='1'; this.style.background='#fecaca'" onmouseout="this.style.opacity='0.85'; this.style.background='#fee2e2'">
          <i data-lucide="trash-2" style="width:15px;height:15px;"></i>
        </button>
      </div>`;
    }).join('');
  }

  function renderAddForm() {
    const meta = currentTab === 'Semua' ? { bg: 'rgba(46,127,191,0.1)', color: '#2E7FBF' } : MEAL_META[currentTab];
    const formTitle = currentTab === 'Semua' ? 'Makanan' : currentTab;
    
    return `
    <div class="vita-card card-enter delay-4" style="background: linear-gradient(145deg, #ffffff, #f8fafc); border: 1px solid #e2e8f0; border-radius: 16px; padding: 20px; box-shadow: 0 10px 25px rgba(0,0,0,0.04); margin-top: 15px;">
      <div style="display: flex; align-items: center; gap: 14px; margin-bottom: 20px; padding-bottom: 16px; border-bottom: 1px dashed #cbd5e1;">
        <div style="background: ${meta.bg}; color: ${meta.color}; width: 44px; height: 44px; border-radius: 12px; display: flex; align-items: center; justify-content: center;">
          <i data-lucide="plus" style="width:20px;height:20px;"></i>
        </div>
        <div>
          <div style="font-size: 1.1rem; font-weight: 800; color: #0f172a; letter-spacing: -0.01em;">Tambah Log ${formTitle}</div>
          <div style="font-size: 0.8rem; color: #64748b; margin-top: 2px;">Catat asupan makanan Anda secara manual</div>
        </div>
      </div>
      
      <form id="add-meal-form" style="display: flex; flex-direction: column; gap: 16px;">
        <div class="form-group" style="margin-bottom: 0;">
          <label style="font-size: 0.82rem; font-weight: 700; color: #475569; margin-bottom: 8px; display: block;">Nama Makanan</label>
          <div style="position: relative;">
            <div style="position: absolute; left: 14px; top: 50%; transform: translateY(-50%); color: #94a3b8;">
              <i data-lucide="utensils" style="width: 18px; height: 18px;"></i>
            </div>
            <input type="text" id="meal-name" style="width: 100%; padding: 14px 14px 14px 40px; border: 1.5px solid #e2e8f0; border-radius: 12px; font-size: 0.95rem; color: #1e293b; outline: none; transition: all 0.2s; background: white;" placeholder="Contoh: Nasi Goreng, Roti Bakar…" required autocomplete="off" onfocus="this.style.borderColor='${meta.color}'; this.style.boxShadow='0 0 0 3px ${meta.color}20'" onblur="this.style.borderColor='#e2e8f0'; this.style.boxShadow='none'">
          </div>
        </div>
        
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px;">
          <div class="form-group" style="margin-bottom: 0;">
            <label style="font-size: 0.82rem; font-weight: 700; color: #475569; margin-bottom: 8px; display: block;">Kalori (kkal)</label>
            <div style="position: relative;">
              <div style="position: absolute; left: 14px; top: 50%; transform: translateY(-50%); color: #94a3b8;">
                <i data-lucide="flame" style="width: 18px; height: 18px;"></i>
              </div>
              <input type="number" id="meal-cal" style="width: 100%; padding: 14px 14px 14px 40px; border: 1.5px solid #e2e8f0; border-radius: 12px; font-size: 0.95rem; color: #1e293b; outline: none; transition: all 0.2s; background: white;" placeholder="0" min="1" required onfocus="this.style.borderColor='${meta.color}'; this.style.boxShadow='0 0 0 3px ${meta.color}20'" onblur="this.style.borderColor='#e2e8f0'; this.style.boxShadow='none'">
            </div>
          </div>
          
          <div class="form-group" style="margin-bottom: 0;">
            <label style="font-size: 0.82rem; font-weight: 700; color: #475569; margin-bottom: 8px; display: block;">Waktu</label>
            <div style="position: relative;">
              <select id="meal-type" style="width: 100%; padding: 14px 34px 14px 14px; border: 1.5px solid #e2e8f0; border-radius: 12px; font-size: 0.95rem; font-weight: 600; color: #1e293b; outline: none; appearance: none; background: white; transition: all 0.2s; cursor: pointer;" onfocus="this.style.borderColor='${meta.color}'; this.style.boxShadow='0 0 0 3px ${meta.color}20'" onblur="this.style.borderColor='#e2e8f0'; this.style.boxShadow='none'">
                ${Object.keys(MEAL_META).map(t =>
                  `<option value="${t}" ${currentTab === t ? 'selected' : (currentTab === 'Semua' && t === 'Makan Siang' ? 'selected' : '')}>${MEAL_META[t].emoji} ${t}</option>`
                ).join('')}
              </select>
              <div style="position: absolute; right: 14px; top: 50%; transform: translateY(-50%); color: #94a3b8; pointer-events: none;">
                <i data-lucide="chevron-down" style="width: 18px; height: 18px;"></i>
              </div>
            </div>
          </div>
        </div>
        
        <button type="submit" id="nutri-save-btn" style="margin-top: 10px; width: 100%; padding: 15px; background: ${meta.color}; color: white; border: none; border-radius: 12px; font-size: 0.95rem; font-weight: 800; display: flex; align-items: center; justify-content: center; gap: 8px; cursor: pointer; transition: all 0.2s; box-shadow: 0 4px 14px ${meta.color}50;" onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 6px 20px ${meta.color}65'" onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 4px 14px ${meta.color}50'">
          <i data-lucide="plus-circle" style="width:18px;height:18px;"></i>
          Simpan ke Log ${formTitle}
        </button>
      </form>
    </div>`;
  }

  function render() {
    // Reset loading state di sini karena render() dipanggil router SEBELUM init()
    // Tanpa ini, isLoading masih true dari kunjungan sebelumnya dan spinner ter-bake ke DOM
    isLoading = false;
    const isToday = currentDateKey === VitaHelpers.getTodayKey();
    return `
    <div class="dash-bg">
      <div class="dash-orb dash-orb-1"></div>
      <div class="dash-orb dash-orb-2"></div>
      ${topbar()}
      <div class="dash-content">

        <!-- Date Nav -->
        <div class="nutri-page-header card-enter">
          <div>
            <h2 class="nutri-page-title">Pelacak Nutrisi</h2>
            <div class="nutri-page-date">
              <i data-lucide="calendar" style="width:13px;height:13px;"></i>
              ${dateKeyToDisplay(currentDateKey)}
            </div>
          </div>
          <div class="nutri-date-nav">
            <button class="nutri-date-btn" id="nutri-prev-day" title="Hari sebelumnya">
              <i data-lucide="chevron-left" style="width:18px;height:18px;"></i>
            </button>
            <span class="nutri-date-label">${isToday ? 'Hari Ini' : currentDateKey}</span>
            <button class="nutri-date-btn" id="nutri-next-day" ${isToday ? 'disabled style="opacity:0.35;"' : ''}>
              <i data-lucide="chevron-right" style="width:18px;height:18px;"></i>
            </button>
          </div>
        </div>

        <!-- Hero Summary -->
        <div id="nutrition-macro-bars">
          ${renderHeroSummary()}
        </div>

        <!-- Tabs -->
        <div class="nutri-tabs-wrap card-enter delay-2" id="nutrition-tabs-container">
          ${renderTabs()}
        </div>

        <!-- Meals List -->
        <div class="vita-card card-enter delay-3" style="margin-bottom:0; background: linear-gradient(145deg, #ffffff, #f8fafc); border: 1px solid #e2e8f0; border-radius: 16px; padding: 24px; box-shadow: 0 10px 25px rgba(0,0,0,0.04);">
          <div class="nutri-list-header" style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; padding-bottom: 15px; border-bottom: 1px dashed #cbd5e1;">
            <div class="nutri-list-title" style="display: flex; align-items: center; gap: 12px; font-size: 1.15rem; font-weight: 800; color: #0f172a; letter-spacing: -0.01em;">
              <div style="background: rgba(82, 184, 71, 0.1); color: var(--primary); width: 40px; height: 40px; border-radius: 12px; display: flex; align-items: center; justify-content: center;">
                <i data-lucide="utensils" style="width:20px;height:20px;"></i>
              </div>
              <span id="current-tab-label">${currentTab}</span>
            </div>
            <span class="nutri-list-count" id="nutri-tab-count" style="background: #f1f5f9; padding: 6px 14px; border-radius: 20px; font-size: 0.85rem; font-weight: 700; color: #475569; border: 1px solid #e2e8f0;">
              ${(currentTab === 'Semua' ? getMeals() : getMeals().filter(m => m.type === currentTab)).length} item
            </span>
          </div>
          <div id="nutrition-meal-list" class="nutri-meal-list" style="min-height: 120px; position: relative;">
            ${renderMealList()}
          </div>
        </div>

        <!-- Add Form (hanya hari ini) -->
        ${isToday ? `<div id="nutri-form-wrap">${renderAddForm()}</div>` : ''}

        <div class="dash-bottom-spacer"></div>
      </div>
    </div>`;
  }

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
        <div class="vita-avatar" style="padding:0; overflow:hidden;">${VitaHelpers.getAvatar(p.name || 'U', p.photoURL)}</div>
      </div>
    </div>`;
  }

  // ── UI Update ─────────────────────────────────────────────────

  function setLoadingState(loading) {
    const listEl = document.getElementById('nutrition-meal-list');
    if (!listEl) return;
    if (loading) {
      listEl.innerHTML = `<div class="nutri-loading"><i data-lucide="loader-circle" style="width:24px;height:24px;animation:spin 1s linear infinite;color:var(--primary);"></i></div>`;
      if (typeof lucide !== 'undefined') lucide.createIcons();
    }
  }

  function updateUI() {
    document.getElementById('nutrition-macro-bars')?.replaceChildren(
      ...new DOMParser().parseFromString(renderHeroSummary(), 'text/html').body.childNodes
    );

    const macroEl = document.getElementById('nutrition-macro-bars');
    if (macroEl) macroEl.innerHTML = renderHeroSummary();

    const tabsEl = document.getElementById('nutrition-tabs-container');
    if (tabsEl) tabsEl.innerHTML = renderTabs();

    document.getElementById('current-tab-label')?.replaceChildren(document.createTextNode(currentTab));

    const countEl = document.getElementById('nutri-tab-count');
    if (countEl) {
      const filtered = currentTab === 'Semua' ? getMeals() : getMeals().filter(m => m.type === currentTab);
      countEl.textContent = filtered.length + ' item';
    }

    const listEl = document.getElementById('nutrition-meal-list');
    if (listEl) listEl.innerHTML = renderMealList();

    const formEl = document.getElementById('nutri-form-wrap');
    if (formEl) formEl.innerHTML = renderAddForm();

    const select = document.getElementById('meal-type');
    if (select) select.value = currentTab;

    if (typeof lucide !== 'undefined') lucide.createIcons();
    attachDeleteListeners();
    attachTabListeners();
    document.getElementById('add-meal-form')?.addEventListener('submit', addMeal);

    // Update date nav button state
    const nextBtn = document.getElementById('nutri-next-day');
    if (nextBtn) {
      const isToday = currentDateKey === VitaHelpers.getTodayKey();
      nextBtn.disabled = isToday;
      nextBtn.style.opacity = isToday ? '0.35' : '1';
    }
  }

  // ── Actions ───────────────────────────────────────────────────

  async function addMeal(e) {
    e.preventDefault();
    const name = document.getElementById('meal-name')?.value.trim();
    const cal  = parseInt(document.getElementById('meal-cal')?.value);
    const type = document.getElementById('meal-type')?.value || currentTab;

    if (!name || isNaN(cal) || cal <= 0) {
      VitaHelpers.showToast('Harap isi nama makanan dan kalori.', 'error');
      return;
    }

    const prot = Math.round(cal * 0.05);
    const carb = Math.round(cal * 0.12);
    const fat  = Math.round(cal * 0.03);

    const newMeal = {
      id:    Date.now(),
      name, cal, prot, carb, fat, type,
      emoji: MEAL_META[type]?.emoji || '🍴',
      time:  new Date().toLocaleTimeString('id-ID', { hour:'2-digit', minute:'2-digit' }),
    };

    const btn = document.getElementById('nutri-save-btn');
    if (btn) { btn.disabled = true; btn.innerHTML = '<i data-lucide="loader-circle" style="width:16px;height:16px;animation:spin 1s linear infinite;"></i> Menyimpan...'; if (typeof lucide !== 'undefined') lucide.createIcons(); }

    try {
      const ref = await saveMealToFirestore(newMeal);
      if (ref) newMeal.id = ref.id; // gunakan ID Firestore
    } catch (err) {
      console.error('[Nutrition] saveMeal error:', err);
      VitaHelpers.showToast('Gagal menyimpan ke Firestore.', 'error');
      if (btn) { btn.disabled = false; btn.innerHTML = '<i data-lucide="plus-circle" style="width:16px;height:16px;"></i> Simpan ke Log'; if (typeof lucide !== 'undefined') lucide.createIcons(); }
      return;
    }

    // Update store optimistically
    const meals = [...getMeals(), newMeal];
    VitaStore.set('todayMeals', meals);
    if (currentTab !== 'Semua') currentTab = type;

    updateUI();
    VitaHelpers.showToast(`${name} berhasil ditambahkan! ✓`, 'success');
    document.getElementById('add-meal-form')?.reset();
    document.getElementById('meal-type')?.value && (document.getElementById('meal-type').value = currentTab);
  }

  async function deleteMeal(e) {
    const mealId = e.currentTarget.dataset.mealId;

    try {
      await deleteMealFromFirestore(mealId);
    } catch (err) {
      console.error('[Nutrition] deleteMeal error:', err);
      VitaHelpers.showToast('Gagal menghapus dari Firestore.', 'error');
      return;
    }

    const meals = getMeals().filter(m => String(m.id) !== String(mealId));
    VitaStore.set('todayMeals', meals);
    updateUI();
    VitaHelpers.showToast('Makanan dihapus.', 'success');
  }

  // ── Listeners ─────────────────────────────────────────────────

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

  // ── Init ──────────────────────────────────────────────────────

  function init() {
    // Reset state (render() sudah reset isLoading, ini hanya safety guard)
    currentDateKey = VitaHelpers.getTodayKey();
    isLoading = false;

    document.getElementById('nutri-menu-btn')?.addEventListener('click', () => {
      document.getElementById('sidebar')?.classList.toggle('open');
      document.getElementById('sidebar-overlay')?.classList.toggle('hidden');
    });

    document.getElementById('add-meal-form')?.addEventListener('submit', addMeal);
    attachDeleteListeners();
    attachTabListeners();

    // Date navigation
    document.getElementById('nutri-prev-day')?.addEventListener('click', () => {
      const [y, m, d] = currentDateKey.split('-').map(Number);
      const prev = new Date(y, m - 1, d - 1);
      currentDateKey = `${prev.getFullYear()}-${String(prev.getMonth()+1).padStart(2,'0')}-${String(prev.getDate()).padStart(2,'0')}`;
      VitaStore.set('todayMeals', []); // clear store agar load fresh
      updateUI();
      loadFromFirestore(currentDateKey);
    });

    document.getElementById('nutri-next-day')?.addEventListener('click', () => {
      const today = VitaHelpers.getTodayKey();
      if (currentDateKey >= today) return;
      const [y, m, d] = currentDateKey.split('-').map(Number);
      const next = new Date(y, m - 1, d + 1);
      currentDateKey = `${next.getFullYear()}-${String(next.getMonth()+1).padStart(2,'0')}-${String(next.getDate()).padStart(2,'0')}`;
      VitaStore.set('todayMeals', []);
      updateUI();
      loadFromFirestore(currentDateKey);
    });

    // Load hari ini dari Firestore
    loadFromFirestore(currentDateKey);
  }

  return { render, init };
})();
