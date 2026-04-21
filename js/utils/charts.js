// VITA — Chart.js Wrappers
/**
 * Wrapper utility untuk Chart.js (v4) terpusat.
 * Digunakan di Dashboard, History, dan Risk Assessment.
 * Mengelola instance chart untuk mencegah error "Canvas is already in use".
 */
const VitaCharts = (() => {
  const instances = {};

  /**
   * Menghapus instance chart berdasarkan ID Canvas
   */
  function destroy(id) {
    if (instances[id]) { instances[id].destroy(); delete instances[id]; }
  }

  /**
   * Membersihkan memori untuk semua chart aktif (misal dipanggil saat pindah route)
   */
  function destroyAll() {
    Object.keys(instances).forEach(destroy);
  }

  // ── Donut Chart (calorie ring) ──────────────────────────────
  /**
   * Grafik Donut tunggal untuk melihat progres target (misal: Kalori)
   * @param {string} canvasId ID elemen <canvas>
   * @param {number} consumed Nilai yang sudah tercapai
   * @param {number} target Target maksimal yang ingin dicapai
   * @param {string} color Warna aksen (hex)
   */
  function createDonut(canvasId, consumed, target, color = '#52B847') {
    destroy(canvasId);
    const canvas = document.getElementById(canvasId);
    if (!canvas) return null;
    const remaining = Math.max(0, target - consumed);
    instances[canvasId] = new Chart(canvas, {
      type: 'doughnut',
      data: {
        datasets: [{
          data: [Math.min(consumed, target), remaining],
          backgroundColor: [color, 'rgba(255,255,255,0.1)'],
          borderColor: ['transparent', 'transparent'],
          borderWidth: 0,
          hoverOffset: 4
        }]
      },
      options: {
        cutout: '75%', responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: false }, tooltip: { enabled: false } },
        animation: { duration: 1000, easing: 'easeOutQuart' }
      }
    });
    return instances[canvasId];
  }

  // ── Multi-segment Donut (macros) ────────────────────────────
  /**
   * Grafik Donut multi-segmen untuk rasio Makronutrisi
   * @param {number} protein Total gram protein
   * @param {number} carbs Total gram karbohidrat
   * @param {number} fat Total gram lemak
   */
  function createMacroDonut(canvasId, protein, carbs, fat) {
    destroy(canvasId);
    const canvas = document.getElementById(canvasId);
    if (!canvas) return null;
    instances[canvasId] = new Chart(canvas, {
      type: 'doughnut',
      data: {
        labels: ['Protein', 'Karbohidrat', 'Lemak'],
        datasets: [{
          data: [protein || 0.01, carbs || 0.01, fat || 0.01],
          backgroundColor: ['#3B82F6', '#F59E0B', '#EF4444'],
          borderColor: 'transparent', borderWidth: 0, hoverOffset: 4
        }]
      },
      options: {
        cutout: '70%', responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: false }, tooltip: {
          callbacks: { label: ctx => ` ${ctx.label}: ${ctx.parsed.toFixed(1)}g` }
        }},
        animation: { duration: 800 }
      }
    });
    return instances[canvasId];
  }

  // ── Radar Chart (risk scores) ───────────────────────────────
  /**
   * Radar Chart untuk visualisasi multidimensi (Digunakan di: Analisis Risiko)
   */
  function createRadar(canvasId, labels, values, color = '#2E7FBF') {
    destroy(canvasId);
    const canvas = document.getElementById(canvasId);
    if (!canvas) return null;
    instances[canvasId] = new Chart(canvas, {
      type: 'radar',
      data: {
        labels,
        datasets: [{
          label: 'Risiko (%)',
          data: values,
          backgroundColor: `${color}22`,
          borderColor: color,
          borderWidth: 2,
          pointBackgroundColor: color,
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
          pointRadius: 4
        }]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        scales: {
          r: {
            min: 0, max: 100, beginAtZero: true,
            grid: { color: 'rgba(0,0,0,0.08)' },
            angleLines: { color: 'rgba(0,0,0,0.08)' },
            ticks: { display: true, stepSize: 25, color: '#94A3B8', font: { size: 10 }, backdropColor: 'transparent' },
            pointLabels: { color: '#475569', font: { size: 11, family: 'Inter' } }
          }
        },
        plugins: {
          legend: { display: false },
          tooltip: { callbacks: { label: ctx => ` ${ctx.dataset.label}: ${ctx.raw}%` } }
        },
        animation: { duration: 1000 }
      }
    });
    return instances[canvasId];
  }

  // ── Line Chart (trend history) ──────────────────────────────
  /**
   * Line Chart untuk melihat tren pergerakan data berkala (Digunakan di: History, Dashboard)
   */
  function createLine(canvasId, labels, datasets) {
    destroy(canvasId);
    const canvas = document.getElementById(canvasId);
    if (!canvas) return null;
    instances[canvasId] = new Chart(canvas, {
      type: 'line',
      data: { labels, datasets: datasets.map(d => ({
        ...d,
        fill: d.fill !== undefined ? d.fill : true,
        tension: 0.4, borderWidth: 2.5,
        pointRadius: 3, pointHoverRadius: 6,
        pointBackgroundColor: d.borderColor,
        pointBorderColor: '#fff', pointBorderWidth: 1.5
      }))},
      options: {
        responsive: true, maintainAspectRatio: false,
        scales: {
          x: { grid: { color: 'rgba(0,0,0,0.05)' }, ticks: { color: '#64748B', font: { size: 11 } } },
          y: { grid: { color: 'rgba(0,0,0,0.05)' }, ticks: { color: '#64748B', font: { size: 11 } } }
        },
        plugins: { legend: { labels: { color: '#475569', font: { size: 11 }, boxWidth: 12 } } },
        animation: { duration: 800 }
      }
    });
    return instances[canvasId];
  }

  // ── Bar Chart (weekly nutrition) ────────────────────────────
  /**
   * Bar Chart standar (opsional/ekstra untuk analisis kuantitas mingguan)
   */
  function createBar(canvasId, labels, datasets) {
    destroy(canvasId);
    const canvas = document.getElementById(canvasId);
    if (!canvas) return null;
    instances[canvasId] = new Chart(canvas, {
      type: 'bar',
      data: { labels, datasets: datasets.map(d => ({ ...d, borderRadius: 6, borderSkipped: false })) },
      options: {
        responsive: true, maintainAspectRatio: false,
        scales: {
          x: { grid: { display: false }, ticks: { color: '#64748B', font: { size: 11 } } },
          y: { grid: { color: 'rgba(0,0,0,0.05)' }, ticks: { color: '#64748B', font: { size: 11 } } }
        },
        plugins: { legend: { labels: { color: '#475569', font: { size: 11 }, boxWidth: 12 } } },
        animation: { duration: 800 }
      }
    });
    return instances[canvasId];
  }

  /**
   * Memperbarui data grafik secara instan tanpa perlu merekreasi canvas instance
   */
  function update(canvasId, newData) {
    if (!instances[canvasId]) return;
    instances[canvasId].data = newData;
    instances[canvasId].update();
  }

  return { createDonut, createMacroDonut, createRadar, createLine, createBar, destroy, destroyAll, update };
})();
