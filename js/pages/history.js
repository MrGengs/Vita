// VITA — History Page
const HistoryPage = (() => {

  const DEMO_HISTORY = [
    { date: new Date(),                          calories: 1420, meals: 4 },
    { date: new Date(Date.now() - 1 * 86400000), calories: 1850, meals: 4 },
    { date: new Date(Date.now() - 2 * 86400000), calories: 2100, meals: 3 },
    { date: new Date(Date.now() - 3 * 86400000), calories: 1780, meals: 4 },
    { date: new Date(Date.now() - 4 * 86400000), calories: 2250, meals: 5 },
    { date: new Date(Date.now() - 5 * 86400000), calories: 1920, meals: 3 },
    { date: new Date(Date.now() - 6 * 86400000), calories: 1680, meals: 4 },
  ];

  const TARGET_CAL = 2100;

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
        <div class="vita-avatar">${VitaHelpers.getInitials(p.name || 'U')}</div>
      </div>
    </div>`;
  }

  function renderSummaryStats() {
    const avg = Math.round(DEMO_HISTORY.reduce((s, d) => s + d.calories, 0) / DEMO_HISTORY.length);
    const max = Math.max(...DEMO_HISTORY.map(d => d.calories));
    const totalMeals = DEMO_HISTORY.reduce((s, d) => s + d.meals, 0);
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
    return DEMO_HISTORY.map((day, i) => {
      const date    = day.date;
      const isToday = new Date().toDateString() === date.toDateString();
      const dayName = isToday ? 'Hari Ini' : date.toLocaleDateString('id-ID', { weekday: 'long' });
      const fullDate = date.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
      const isOver  = day.calories > TARGET_CAL;
      const pct     = Math.min(100, Math.round((day.calories / TARGET_CAL) * 100));

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
            <p>Tren asupan kalori &amp; nutrisi 7 hari terakhir</p>
          </div>
        </div>

        <!-- Summary Stats -->
        <div class="vita-card card-enter delay-1">
          ${renderSummaryStats()}
        </div>

        <!-- Filter Chips + Chart -->
        <div class="vita-card card-enter delay-1">
          <div class="hist-filter-row">
            <button class="hist-filter-chip active">7 Hari</button>
            <button class="hist-filter-chip">30 Hari</button>
            <button class="hist-filter-chip">3 Bulan</button>
          </div>
          <div class="hist-chart-wrap">
            <canvas id="history-chart"></canvas>
          </div>
        </div>

        <!-- Daily List -->
        <div class="card-enter delay-2">
          <div class="hist-list-title">
            <i data-lucide="calendar-days" style="width:16px;height:16px;color:var(--primary);"></i>
            Log Harian
          </div>
          <div class="hist-day-list">
            ${renderHistoryList()}
          </div>
        </div>

        <div class="dash-bottom-spacer"></div>
      </div>
    </div>`;
  }

  function init() {
    document.getElementById('hist-menu-btn')?.addEventListener('click', () => {
      document.getElementById('sidebar')?.classList.toggle('open');
      document.getElementById('sidebar-overlay')?.classList.toggle('hidden');
    });

    requestAnimationFrame(() => {
      if (window.VitaCharts) {
        const rev  = [...DEMO_HISTORY].reverse();
        const days = rev.map(d => d.date.toLocaleDateString('id-ID', { weekday: 'short' }));
        const cals = rev.map(d => d.calories);
        VitaCharts.createLine('history-chart', days, [{
          label: 'Kalori (kkal)', data: cals,
          borderColor: '#2E7FBF', backgroundColor: 'rgba(46,127,191,0.08)',
          fill: true, pointBackgroundColor: '#2E7FBF', tension: 0.4
        }]);
      }
    });
  }

  return { render, init };
})();
