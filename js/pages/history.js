// VITA — History Page
const HistoryPage = (() => {

  let currentDays = 7;
  let historyData = [];
  
  function getTargetCal() {
    const profile = VitaStore.get('profile');
    if (profile && typeof VitaHelpers.getCalorieTarget === 'function') {
      return VitaHelpers.getCalorieTarget(profile);
    }
    return 2100;
  }

  function topbar() {
    const p = VitaStore.get('profile') || {};
    return `
    <div class="vita-topbar">
      <div class="vita-topbar-left">
        <button class="vita-menu-btn" id="hist-menu-btn"><i data-lucide="menu"></i></button>
        <div class="topbar-brand">
          <svg width="26" height="26" viewBox="0 0 64 64" fill="none">
            <circle cx="32" cy="32" r="32" fill="url(#hGrad)"/>
            <defs><linearGradient id="hGrad" x1="0" y1="0" x2="64" y2="64">
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

  function renderSummaryStats() {
    if (!historyData.length) return '<div class="dash-empty-meals">Memuat data...</div>';
    const avg = Math.round(historyData.reduce((s, d) => s + d.calories, 0) / historyData.length);
    const max = Math.max(...historyData.map(d => d.calories));
    const totalMeals = historyData.reduce((s, d) => s + d.meals, 0);
    return `
    <div class="hist-summary-row">
      <div class="hist-summary-item">
        <div class="hist-summary-val">${VitaHelpers.formatNumber(avg)}</div>
        <div class="hist-summary-label">Rata-rata kkal</div>
      </div>
      <div class="hist-summary-divider"></div>
      <div class="hist-summary-item">
        <div class="hist-summary-val">${VitaHelpers.formatNumber(max)}</div>
        <div class="hist-summary-label">Tertinggi kkal</div>
      </div>
      <div class="hist-summary-divider"></div>
      <div class="hist-summary-item">
        <div class="hist-summary-val">${totalMeals}</div>
        <div class="hist-summary-label">Total makanan</div>
      </div>
    </div>`;
  }

  function renderHistoryList() {
    if (!historyData.length) return `<div class="dash-empty-meals">Tidak ada data untuk periode ini</div>`;
    const target = getTargetCal();
    
    return historyData.map((day, i) => {
      const date    = day.date;
      const isToday = new Date().toDateString() === date.toDateString();
      const dayName = isToday ? 'Hari Ini' : date.toLocaleDateString('id-ID', { weekday: 'long' });
      const fullDate = date.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
      const isOver  = day.calories > target;
      const pct     = Math.min(100, Math.round((day.calories / target) * 100));

      const photoStrip = day.photos?.length
        ? `<div style="display:flex;gap:4px;margin-top:7px;">
            ${day.photos.slice(0, 4).map(url =>
              `<img src="${url}" style="width:32px;height:32px;border-radius:6px;object-fit:cover;border:1.5px solid rgba(46,127,191,0.18);flex-shrink:0;" referrerpolicy="no-referrer" loading="lazy">`
            ).join('')}
            ${day.photos.length > 4
              ? `<div style="width:32px;height:32px;border-radius:6px;background:#e2e8f0;display:flex;align-items:center;justify-content:center;font-size:0.65rem;font-weight:700;color:#64748b;flex-shrink:0;">+${day.photos.length - 4}</div>`
              : ''}
          </div>`
        : '';

      return `
      <div class="hist-day-card card-enter delay-${i % 4}">
        <div class="hist-day-date">
          <span class="hist-day-month">${date.toLocaleDateString('id-ID', { month: 'short' })}</span>
          <span class="hist-day-num">${date.getDate()}</span>
        </div>
        <div class="hist-day-body">
          <div class="hist-day-name">${dayName}${isToday ? ' <span class="hist-today-badge">Hari ini</span>' : ''}</div>
          <div class="hist-day-full">${fullDate}</div>
          <div class="hist-day-bar-wrap">
            <div class="hist-day-bar">
              <div class="hist-day-bar-fill ${isOver ? 'over' : ''}" style="width:${pct}%;"></div>
            </div>
            <span class="hist-day-bar-pct ${isOver ? 'over' : ''}">${pct}%</span>
          </div>
          ${photoStrip}
        </div>
        <div class="hist-day-right">
          <div class="hist-day-cal ${isOver ? 'over' : ''}">${VitaHelpers.formatNumber(day.calories)}</div>
          <div class="hist-day-unit">kkal</div>
          <div class="hist-day-meals">
            <i data-lucide="utensils" style="width:11px;height:11px;"></i> ${day.meals}x
          </div>
        </div>
      </div>`;
    }).join('');
  }

  function render() {
    return `
    <div class="dash-bg">
      <div class="dash-orb dash-orb-1"></div>
      <div class="dash-orb dash-orb-2"></div>
      ${topbar()}
      <div class="dash-content">

        <div class="vita-welcome card-enter">
          <div class="vita-welcome-text" style="margin-bottom:0;">
            <h2>Riwayat Analisis</h2>
            <p>Tren asupan kalori &amp; nutrisi Anda</p>
          </div>
        </div>

        <!-- Summary Stats -->
        <div class="vita-card card-enter delay-1" id="hist-summary-container">
          <!-- loading... -->
        </div>

        <!-- Filter Chips + Chart -->
        <div class="vita-card card-enter delay-1">
          <div class="hist-filter-row" id="hist-filters">
            <button class="hist-filter-chip active" data-days="7">7 Hari</button>
            <button class="hist-filter-chip" data-days="30">30 Hari</button>
            <button class="hist-filter-chip" data-days="90">3 Bulan</button>
          </div>
          <div class="hist-chart-wrap">
            <div id="hist-chart-inner" style="height:100%;width:100%;">
              <canvas id="history-chart" style="display:block;"></canvas>
            </div>
            <div id="hist-chart-loading" style="display:none; position:absolute; inset:0; align-items:center; justify-content:center; background:rgba(255,255,255,0.85); z-index:10; border-radius:12px;">
              <div class="spinner" style="width:32px;height:32px;margin:0;"></div>
            </div>
          </div>
        </div>

        <!-- Daily List -->
        <div class="card-enter delay-2">
          <div class="hist-list-title">
            <i data-lucide="calendar-days" style="width:16px;height:16px;color:var(--primary);"></i>
            Log Harian
          </div>
          <div class="hist-day-list" id="hist-list-container">
            <!-- list items -->
          </div>
        </div>

        <div class="dash-bottom-spacer"></div>
      </div>
    </div>`;
  }

  function generateDemo(days) {
     const arr = [];
     for(let i=0; i<days; i++) {
        const d = new Date(); d.setDate(d.getDate() - i);
        const cals = Math.floor(1600 + Math.random() * 600);
        const m = Math.floor(2 + Math.random() * 3);
        arr.push({ date: d, calories: cals, meals: m, photos: [] });
     }
     return arr; // newest first
  }

  async function loadData() {
    const user = VitaStore.get('user');
    const isDemo = VitaStore.get('demoMode') || !user;

    const loader = document.getElementById('hist-chart-loading');
    if (loader) loader.style.display = 'flex';

    if (isDemo) {
       historyData = generateDemo(currentDays);
    } else {
       const endD = new Date();
       const endKey = VitaHelpers.getTodayKey();
       
       const startD = new Date();
       startD.setDate(startD.getDate() - (currentDays - 1));
       const sy = startD.getFullYear();
       const sm = String(startD.getMonth() + 1).padStart(2, '0');
       const sd = String(startD.getDate()).padStart(2, '0');
       const startKey = `${sy}-${sm}-${sd}`;

       try {
         const meals = await VitaFirestore.getMealsForDateRange(user.uid, startKey, endKey);
         
         const aggregated = [];
         for (let i = 0; i < currentDays; i++) {
            const d = new Date(startD);
            d.setDate(d.getDate() + i);
            const y = d.getFullYear();
            const m = String(d.getMonth() + 1).padStart(2, '0');
            const day = String(d.getDate()).padStart(2, '0');
            const key = `${y}-${m}-${day}`;
            
            const dayMeals = meals.filter(x => x.dateKey === key);
            const cals = dayMeals.reduce((sum, meal) => sum + (meal.totalNutrition?.calories || 0), 0);
            const photos = dayMeals.filter(x => x.image_url).map(x => x.image_url);

            aggregated.push({ date: d, calories: cals, meals: dayMeals.length, photos });
         }
         historyData = aggregated.reverse(); // newest first
       } catch(e) {
         console.error('[History] Fetch Error', e);
         VitaHelpers.showToast('Gagal memuat data riwayat', 'error');
         historyData = [];
       }
    }

    const summaryContainer = document.getElementById('hist-summary-container');
    const listContainer = document.getElementById('hist-list-container');
    if (summaryContainer) summaryContainer.innerHTML = renderSummaryStats();
    if (listContainer) listContainer.innerHTML = renderHistoryList();
    if (loader) loader.style.display = 'none';

    updateChart();
    if (typeof lucide !== 'undefined') lucide.createIcons();
  }

  function updateChart() {
    // PENTING: VitaCharts dideklarasikan sebagai `const` di global scope,
    // BUKAN sebagai `var`, sehingga TIDAK ada di window.VitaCharts.
    // Gunakan typeof untuk cek ketersediaan.
    if (typeof VitaCharts === 'undefined') {
      console.error('[History] VitaCharts tidak ditemukan — pastikan charts.js sudah di-load sebelum history.js');
      return;
    }
    if (typeof Chart === 'undefined') {
      console.error('[History] Chart.js (library) belum di-load');
      return;
    }

    const rev = [...historyData].reverse(); // oldest first for chart

    // Reduce labels if 90 days so it doesn't overlap
    let step = 1;
    if (currentDays === 90) step = 7;
    else if (currentDays === 30) step = 3;

    const days = [];
    const cals = [];

    rev.forEach((d, i) => {
       if (currentDays === 7) {
         days.push(d.date.toLocaleDateString('id-ID', { weekday: 'short' }));
         cals.push(d.calories);
       } else {
         if (i % step === 0 || i === rev.length - 1) {
           days.push(d.date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }));
         } else {
           days.push(''); // blank label
         }
         cals.push(d.calories);
       }
    });

    console.log('[History] updateChart — points:', cals.length, '| labels:', days);

    const wrap = document.getElementById('hist-chart-inner');
    if (!wrap) { console.warn('[History] hist-chart-inner tidak ada di DOM saat updateChart dipanggil'); return; }

    // Destroy chart lama via VitaCharts agar canvas bisa dipakai ulang
    VitaCharts.destroy('history-chart');

    // Recreate canvas agar tidak "Canvas already in use"
    wrap.innerHTML = '<canvas id="history-chart" style="display:block;width:100%;height:100%;"></canvas>';

    // rAF ganda: pastikan browser sudah paint canvas ke layout sebelum Chart.js baca dimensinya
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const canvas = document.getElementById('history-chart');
        if (!canvas) {
          console.error('[History] canvas #history-chart tidak ditemukan setelah innerHTML replace');
          return;
        }
        console.log('[History] Membuat line chart, canvas size:', canvas.offsetWidth, 'x', canvas.offsetHeight);
        VitaCharts.createLine('history-chart', days, [{
           label: 'Kalori (kkal)', data: cals,
           borderColor: '#2E7FBF', backgroundColor: 'rgba(46,127,191,0.08)',
           fill: true, pointBackgroundColor: '#2E7FBF', tension: 0.4,
           pointRadius: currentDays > 30 ? 0 : 3
        }]);
      });
    });
  }

  function init() {
    currentDays = 7; // reset on load
    document.getElementById('hist-menu-btn')?.addEventListener('click', () => {
      document.getElementById('sidebar')?.classList.toggle('open');
      document.getElementById('sidebar-overlay')?.classList.toggle('hidden');
    });

    const filters = document.getElementById('hist-filters');
    if (filters) {
      filters.addEventListener('click', (e) => {
        const btn = e.target.closest('.hist-filter-chip');
        if (!btn) return;
        
        filters.querySelectorAll('.hist-filter-chip').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        currentDays = parseInt(btn.dataset.days);
        loadData();
      });
    }

    loadData();
  }

  return { render, init };
})();
