// VITA — Nutrition Page
const NutritionPage = (() => {
  // Data demo, bisa diganti dengan data dari VitaStore
  let todayMeals = VitaStore.get('todayMeals') || [
    { id: 1, emoji: '🍳', name: 'Nasi Goreng + Telur', time: '07:30', type: 'Sarapan', cal: 420, prot: 15, carb: 50, fat: 12 },
    { id: 2, emoji: '🍚', name: 'Nasi Ayam + Sayur',   time: '12:15', type: 'Makan Siang', cal: 580, prot: 25, carb: 65, fat: 18 },
  ];

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

  function renderMacroBars() {
    let tCal = 0, tProt = 0, tCarb = 0, tFat = 0;
    todayMeals.forEach(m => {
      tCal += m.cal || 0; tProt += m.prot || 0; tCarb += m.carb || 0; tFat += m.fat || 0;
    });
    const tg = { cal: 2100, prot: 105, carb: 262, fat: 70 };
    
    return `
      <div style="display:flex; justify-content:space-between; align-items:end; margin-bottom:16px;">
        <div>
          <div style="font-size:0.85rem; color:var(--text-secondary);">Total Kalori</div>
          <div style="font-size:1.8rem; font-weight:800; color:var(--text); font-family:var(--font-sans); line-height:1;">
            ${tCal} <span style="font-size:1rem; color:var(--text-light); font-weight:600;">/ ${tg.cal} kkal</span>
          </div>
        </div>
        <div style="font-size:0.8rem; font-weight:700; color:${tCal > tg.cal ? 'var(--danger)' : 'var(--primary)'}; background:${tCal > tg.cal ? 'var(--danger-light)' : 'var(--primary-bg)'}; padding:4px 10px; border-radius:12px;">
          ${tCal > tg.cal ? 'Lebih ' + (tCal - tg.cal) : 'Sisa ' + (tg.cal - tCal)}
        </div>
      </div>
      <div style="display:flex; flex-direction:column; gap:12px;">
        <div>
          <div style="display:flex; justify-content:space-between; font-size:0.75rem; margin-bottom:6px;">
            <span style="font-weight:600; color:var(--text-secondary);">Protein</span>
            <span style="font-weight:600;">${tProt}g <span style="color:var(--text-light)">/ ${tg.prot}g</span></span>
          </div>
          <div class="vs-progress-track"><div class="vs-progress-fill" style="width:${Math.min(100, (tProt/tg.prot)*100)}%; background:#52B847;"></div></div>
        </div>
        <div>
          <div style="display:flex; justify-content:space-between; font-size:0.75rem; margin-bottom:6px;">
            <span style="font-weight:600; color:var(--text-secondary);">Karbohidrat</span>
            <span style="font-weight:600;">${tCarb}g <span style="color:var(--text-light)">/ ${tg.carb}g</span></span>
          </div>
          <div class="vs-progress-track"><div class="vs-progress-fill" style="width:${Math.min(100, (tCarb/tg.carb)*100)}%; background:#F59E0B;"></div></div>
        </div>
        <div>
          <div style="display:flex; justify-content:space-between; font-size:0.75rem; margin-bottom:6px;">
            <span style="font-weight:600; color:var(--text-secondary);">Lemak</span>
            <span style="font-weight:600;">${tFat}g <span style="color:var(--text-light)">/ ${tg.fat}g</span></span>
          </div>
          <div class="vs-progress-track"><div class="vs-progress-fill" style="width:${Math.min(100, (tFat/tg.fat)*100)}%; background:#EF4444;"></div></div>
        </div>
      </div>
    `;
  }

  function renderTabs() {
    const tabs = ['Sarapan', 'Makan Siang', 'Snack', 'Makan Malam'];
    return tabs.map(t => {
      const isActive = t === currentTab;
      const bg = isActive ? 'var(--primary)' : 'var(--bg-light)';
      const color = isActive ? 'white' : 'var(--text-secondary)';
      return `<button class="nutri-tab-btn" data-tab="${t}" style="padding:8px 16px; border-radius:20px; font-size:0.8rem; font-weight:600; background:${bg}; color:${color}; white-space:nowrap; transition:all 0.2s; border:none; cursor:pointer;">${t}</button>`;
    }).join('');
  }

  function renderMealList() {
    const filtered = todayMeals.filter(m => m.type === currentTab);
    if (!filtered || !filtered.length) {
      return `<div style="text-align:center;padding:24px 0;color:var(--text-light);font-size:0.875rem;">
        <div style="font-size:2rem;margin-bottom:8px;">🍽️</div>
        Belum ada catatan untuk ${currentTab}.
      </div>`;
    }
    return filtered.map(m => `
      <div class="meal-entry-v" data-meal-id="${m.id || m.name}">
        <div class="meal-emoji-v">${m.emoji || '🍴'}</div>
        <div class="meal-info-v">
          <div class="meal-name-v">${m.name}</div>
          <div class="meal-meta-v">${m.time} · ${m.type}</div>
        </div>
        <div style="display:flex; align-items:center; gap:12px;">
          <div class="meal-cal-v" style="margin:0;">
            <div class="mcal">${m.cal}</div>
            <div class="mtype">kkal</div>
          </div>
          <button class="btn-delete-meal" data-meal-id="${m.id || m.name}" title="Hapus">
            <i data-lucide="trash-2" style="width:16px; height:16px;"></i>
          </button>
        </div>
      </div>`).join('');
  }

  function render() {
    return `
    <div class="dash-bg">
      <div class="dash-orb dash-orb-1"></div>
      <div class="dash-orb dash-orb-2"></div>
      ${topbar()}
      <div class="dash-content">
        
        <!-- Date Navigation -->
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px;" class="card-enter">
          <button class="btn btn-ghost" style="padding:8px;"><i data-lucide="chevron-left" style="width:20px;height:20px;"></i></button>
          <div style="font-weight:700; font-size:1.1rem; color:var(--text);">Hari Ini</div>
          <button class="btn btn-ghost" style="padding:8px; opacity:0.5;" disabled><i data-lucide="chevron-right" style="width:20px;height:20px;"></i></button>
        </div>

        <!-- Macros Summary -->
        <div class="vita-card card-enter delay-1" style="margin-bottom:16px;" id="nutrition-macro-bars">
          ${renderMacroBars()}
        </div>

        <!-- Tabs -->
        <div style="display:flex; gap:8px; margin-bottom:16px; overflow-x:auto; scrollbar-width:none; padding-bottom:4px;" class="card-enter delay-2" id="nutrition-tabs-container">
          ${renderTabs()}
        </div>

        <!-- Meals List -->
        <div class="vita-card card-enter delay-3" style="margin-bottom:16px;">
          <div style="font-size:0.9rem;font-weight:700;color:var(--text);margin-bottom:12px;display:flex;align-items:center;justify-content:space-between;">
            <div style="display:flex;align-items:center;gap:6px;">
              <i data-lucide="list" style="width:16px;height:16px;color:var(--primary);"></i> Daftar <span id="current-tab-label">${currentTab}</span>
            </div>
          </div>
          <div id="nutrition-meal-list" style="display:flex;flex-direction:column;gap:12px;">
            ${renderMealList()}
          </div>
        </div>

        <!-- Add Meal Form -->
        <div class="vita-card card-enter delay-4" style="margin-bottom:16px;">
          <div style="font-size:0.9rem;font-weight:700;color:var(--text);margin-bottom:16px;display:flex;align-items:center;gap:6px;">
            <i data-lucide="plus-circle" style="width:16px;height:16px;color:var(--primary);"></i> Tambah ke Log
          </div>
          <form id="add-meal-form">
            <div class="form-group">
              <label class="form-label">Nama Makanan</label>
              <input type="text" id="meal-name" class="form-input" placeholder="Contoh: Roti Bakar" required>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Kalori (kkal)</label>
                <input type="number" id="meal-cal" class="form-input" placeholder="250" required>
              </div>
              <div class="form-group">
                <label class="form-label">Waktu Makan</label>
                <select id="meal-type" class="form-input form-select">
                  <option value="Sarapan" ${currentTab === 'Sarapan' ? 'selected' : ''}>Sarapan</option>
                  <option value="Makan Siang" ${currentTab === 'Makan Siang' ? 'selected' : ''}>Makan Siang</option>
                  <option value="Snack" ${currentTab === 'Snack' ? 'selected' : ''}>Snack</option>
                  <option value="Makan Malam" ${currentTab === 'Makan Malam' ? 'selected' : ''}>Makan Malam</option>
                </select>
              </div>
            </div>
            <button type="submit" class="btn btn-primary" style="width:100%;margin-top:4px;">
              <i data-lucide="save" style="width:16px;height:16px;"></i> Simpan Makanan
            </button>
          </form>
        </div>

        <div class="dash-bottom-spacer"></div>
      </div>
    </div>`;
  }

  function updateUI() {
    document.getElementById('nutrition-macro-bars').innerHTML = renderMacroBars();
    document.getElementById('nutrition-tabs-container').innerHTML = renderTabs();
    document.getElementById('current-tab-label').innerText = currentTab;
    document.getElementById('nutrition-meal-list').innerHTML = renderMealList();
    const select = document.getElementById('meal-type');
    if (select) select.value = currentTab;
    if (typeof lucide !== 'undefined') lucide.createIcons();
    attachDeleteListeners();
    attachTabListeners();
  }

  function addMeal(e) {
    e.preventDefault();
    const name = document.getElementById('meal-name').value.trim();
    const cal = parseInt(document.getElementById('meal-cal').value);
    const type = document.getElementById('meal-type').value;

    if (!name || isNaN(cal) || cal <= 0) {
      VitaHelpers.showToast('Harap isi nama makanan dan kalori dengan benar.', 'error');
      return;
    }

    // Dummy makronutrisi jika tidak ada backend API untuk ini
    const prot = Math.round(cal * 0.05);
    const carb = Math.round(cal * 0.12);
    const fat = Math.round(cal * 0.03);

    const newMeal = {
      id: Date.now(),
      name,
      cal,
      prot,
      carb,
      fat,
      type,
      time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      emoji: '🍴'
    };

    todayMeals.push(newMeal);
    currentTab = type; // Auto-pindah ke tab tempat kita menaruhnya
    
    updateUI();
    VitaHelpers.showToast(`${name} berhasil ditambahkan!`, 'success');
    document.getElementById('add-meal-form').reset();
    document.getElementById('meal-type').value = currentTab;
  }

  function deleteMeal(e) {
    const mealId = e.currentTarget.dataset.mealId;
    todayMeals = todayMeals.filter(m => String(m.id) !== mealId && m.name !== mealId);
    updateUI();
    VitaHelpers.showToast('Makanan berhasil dihapus.', 'success');
  }

  function attachDeleteListeners() {
    document.querySelectorAll('.btn-delete-meal').forEach(btn => {
      btn.addEventListener('click', deleteMeal);
    });
  }

  function attachTabListeners() {
    document.querySelectorAll('.nutri-tab-btn').forEach(btn => {
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
