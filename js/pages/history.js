// VITA — History Page
const HistoryPage = (() => {

  // Data demo untuk 7 hari terakhir
  const DEMO_HISTORY = [
    { date: new Date(), calories: 1420, meals: 4 },
    { date: new Date(Date.now() - 1 * 86400000), calories: 1850, meals: 4 },
    { date: new Date(Date.now() - 2 * 86400000), calories: 2100, meals: 3 },
    { date: new Date(Date.now() - 3 * 86400000), calories: 1780, meals: 4 },
    { date: new Date(Date.now() - 4 * 86400000), calories: 2250, meals: 5 },
    { date: new Date(Date.now() - 5 * 86400000), calories: 1920, meals: 3 },
    { date: new Date(Date.now() - 6 * 86400000), calories: 1680, meals: 4 },
  ];

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

  function renderHistoryList() {
    return DEMO_HISTORY.map((day, i) => {
      const date = day.date;
      const isToday = new Date().toDateString() === date.toDateString();
      const dayName = isToday ? 'Hari Ini' : date.toLocaleDateString('id-ID', { weekday: 'long' });
      const fullDate = date.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
      const isOver = day.calories > 2100;

      return `
      <div class="vita-card card-enter delay-${i}" style="padding: 16px; display:flex; align-items:center; justify-content:space-between; cursor:pointer; transition: transform 0.2s, box-shadow 0.2s;"
           onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='var(--shadow-md)';"
           onmouseout="this.style.transform='none'; this.style.boxShadow='var(--shadow-sm)';">
        <div style="display:flex; align-items:center; gap:16px;">
          <div style="width:48px; height:48px; border-radius:12px; background:var(--bg-light); color:var(--text-secondary); display:flex; flex-direction:column; align-items:center; justify-content:center; font-weight:700;">
            <span style="font-size:0.7rem; text-transform:uppercase;">${date.toLocaleDateString('id-ID', { month: 'short' })}</span>
            <span style="font-size:1.2rem; line-height:1;">${date.getDate()}</span>
          </div>
          <div>
            <div style="font-weight:700; color:var(--text);">${dayName}</div>
            <div style="font-size:0.8rem; color:var(--text-secondary);">${fullDate}</div>
          </div>
        </div>
        <div style="text-align:right;">
          <div style="font-weight:800; font-size:1.1rem; color:${isOver ? 'var(--danger)' : 'var(--primary)'}; font-family:var(--font-sans);">
            ${VitaHelpers.formatNumber(day.calories)} kkal
          </div>
          <div style="font-size:0.8rem; color:var(--text-light);">${day.meals} makanan</div>
        </div>
      </div>
      `;
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
            <p>Pantau tren asupan kalori dan nutrisi Anda.</p>
          </div>
        </div>

        <!-- Filter Chips & Chart -->
        <div class="vita-card card-enter delay-1" style="margin-bottom:16px;">
          <div style="display:flex; gap:8px; overflow-x:auto; padding-bottom:12px; scrollbar-width:none;">
            <button class="btn btn-primary" style="padding:6px 14px; font-size:0.75rem; border-radius:20px; white-space:nowrap;">7 Hari Terakhir</button>
            <button class="btn btn-ghost" style="padding:6px 14px; font-size:0.75rem; border-radius:20px; background:var(--bg-light); color:var(--text-secondary); white-space:nowrap;">30 Hari</button>
            <button class="btn btn-ghost" style="padding:6px 14px; font-size:0.75rem; border-radius:20px; background:var(--bg-light); color:var(--text-secondary); white-space:nowrap;">3 Bulan</button>
          </div>
          <div style="height:180px; position:relative; margin-top:8px; display:flex; align-items:center; justify-content:center;">
            <canvas id="history-chart"></canvas>
          </div>
        </div>

        <!-- Daily List -->
        <div style="display:flex; flex-direction:column; gap:12px;" class="card-enter delay-2">
          <div style="font-size:0.9rem; font-weight:700; color:var(--text); display:flex; align-items:center; gap:6px; margin-bottom:4px;">
            <i data-lucide="calendar-days" style="width:16px; height:16px; color:var(--primary);"></i> Log Harian
          </div>
          ${renderHistoryList()}
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
      if (window.VitaCharts && window.VitaCharts.createLine) {
        const revHist = [...DEMO_HISTORY].reverse();
        const days = revHist.map(d => d.date.toLocaleDateString('id-ID', {weekday:'short'}));
        const cals = revHist.map(d => d.calories);
        
        VitaCharts.createLine('history-chart', days, [{
          label: 'Kalori (kkal)',
          data: cals,
          borderColor: '#2E7FBF',
          backgroundColor: 'rgba(46,127,191,0.1)',
          fill: true,
          pointBackgroundColor: '#2E7FBF',
          tension: 0.4
        }]);
      }
    });
  }
  return { render, init };
})();
