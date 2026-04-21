// VITA — Scanner Page
const ScannerPage = (() => {

  const DEMO_FOODS = [
    { name:'Nasi Goreng', confidence:94, emoji:'🍳',
      nutrition:{ calories:285, protein:8, carbs:42, fat:10, fiber:1.5, sodium:620, sugar:3 } },
    { name:'Ayam Goreng', confidence:91, emoji:'🍗',
      nutrition:{ calories:260, protein:27, carbs:1,  fat:16, fiber:0,   sodium:85,  sugar:0 } },
    { name:'Mie Goreng',  confidence:88, emoji:'🍜',
      nutrition:{ calories:330, protein:8,  carbs:50, fat:11, fiber:2,   sodium:850, sugar:4 } },
  ];

  let scanState = 'idle'; // idle | scanning | result | saving
  let currentResult = null;
  let capturedImageUrl = null;

  function topbar() {
    const p = VitaStore.get('profile') || {};
    return `
    <div class="vita-topbar">
      <div class="vita-topbar-left">
        <button class="vita-menu-btn" id="sc-menu-btn"><i data-lucide="menu"></i></button>
        <div class="topbar-brand">
          <svg width="26" height="26" viewBox="0 0 64 64" fill="none">
            <circle cx="32" cy="32" r="32" fill="url(#scGrad)"/>
            <defs><linearGradient id="scGrad" x1="0" y1="0" x2="64" y2="64">
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

  function renderNutritionTable(n) {
    const rows = [
      { label:'Kalori',      val: Math.round(n.calories), unit:'kkal', color:'#2E7FBF' },
      { label:'Protein',     val: n.protein.toFixed(1),   unit:'g',    color:'#52B847' },
      { label:'Karbohidrat', val: n.carbs.toFixed(1),     unit:'g',    color:'#F59E0B' },
      { label:'Lemak',       val: n.fat.toFixed(1),       unit:'g',    color:'#EF4444' },
      { label:'Serat',       val: n.fiber.toFixed(1),     unit:'g',    color:'#8B5CF6' },
      { label:'Natrium',     val: Math.round(n.sodium),   unit:'mg',   color:'#64748B' },
    ];
    return rows.map(r => `
      <div style="display:flex;justify-content:space-between;align-items:center;padding:7px 0;border-bottom:1px solid #F1F5F9;">
        <span style="font-size:0.82rem;color:var(--text-secondary);">${r.label}</span>
        <span style="font-size:0.875rem;font-weight:700;color:${r.color};">${r.val} ${r.unit}</span>
      </div>`).join('');
  }

  function render() {
    const ip = VitaESP32.getIP();
    const isDemo = VitaStore.get('demoMode');
    return `
    <div class="dash-bg">
      <div class="dash-orb dash-orb-1"></div>
      <div class="dash-orb dash-orb-2"></div>
      ${topbar()}
      <div class="dash-content">

        ${isDemo ? `
        <div class="demo-banner card-enter">
          <div class="demo-banner-text">
            <i data-lucide="info" style="width:15px;height:15px;flex-shrink:0;"></i>
            Mode Demo — tekan Capture untuk melihat contoh analisis AI
          </div>
          <div class="demo-banner-actions"><a href="#register" class="demo-cta-register">Daftar</a></div>
        </div>` : ''}

        <div class="scanner-grid card-enter">

          <!-- Left: Camera -->
          <div class="vita-card scanner-camera-card">
            <div class="scanner-cam-header">
              <span style="font-weight:700;color:var(--text);font-size:0.9rem;display:flex;align-items:center;gap:6px;">
                <i data-lucide="camera" style="width:16px;height:16px;color:var(--primary);"></i>
                Kamera ESP32-CAM
              </span>
              <div class="scanner-live-badge" id="sc-live-badge">
                <span class="dot dot-green" style="animation:livePulse 2s infinite;"></span> LIVE
              </div>
            </div>

            <div class="scanner-preview-wrap" id="sc-preview-wrap">
              <div class="scanner-frame-corners">
                <span class="sc-corner tl"></span><span class="sc-corner tr"></span>
                <span class="sc-corner bl"></span><span class="sc-corner br"></span>
              </div>
              ${ip && !isDemo
                ? `<img id="sc-stream" src="http://${ip}/stream" class="scanner-stream"
                     onerror="document.getElementById('sc-stream-err').classList.remove('hidden')">`
                : ''}
              <div id="sc-stream-err" class="${ip && !isDemo ? 'hidden' : ''} scanner-no-stream">
                <i data-lucide="wifi-off" style="width:36px;height:36px;color:rgba(255,255,255,0.5);"></i>
                <span>${isDemo ? 'Demo Mode Aktif' : 'Stream tidak tersedia'}</span>
                <span style="font-size:0.75rem;opacity:0.6;">${isDemo ? 'Tekan Capture untuk demo' : 'Periksa IP ESP32-CAM di Profil'}</span>
              </div>
              <div id="sc-scanning-overlay" class="scanner-scanning hidden">
                <div class="scanner-scan-line"></div>
                <span>Menganalisis...</span>
              </div>
            </div>

            <div class="scanner-ip-row">
              <i data-lucide="wifi" style="width:15px;height:15px;color:var(--text-light);flex-shrink:0;"></i>
              <input id="sc-ip-input" class="scanner-ip-input" type="text"
                placeholder="192.168.x.x" value="${ip || ''}">
              <button class="btn btn-ghost sc-test-btn" id="sc-test-btn" style="font-size:0.78rem;padding:6px 12px;">
                Test
              </button>
            </div>

            <button class="btn btn-primary sc-capture-btn" id="sc-capture-btn">
              <i data-lucide="scan-line" style="width:18px;height:18px;"></i>
              Capture &amp; Analisis
            </button>
          </div>

          <!-- Right: Result -->
          <div class="vita-card scanner-result-card" id="sc-result-card">
            <!-- Idle state -->
            <div id="sc-idle-state" class="scanner-result-state">
              <div style="font-size:3rem;margin-bottom:12px;">🔍</div>
              <h3 style="font-size:1rem;font-weight:700;color:var(--text);margin-bottom:6px;">Siap Menganalisis</h3>
              <p style="font-size:0.83rem;color:var(--text-secondary);text-align:center;line-height:1.5;">
                Arahkan kamera ke makanan lalu tekan<br><strong>Capture &amp; Analisis</strong> untuk memulai
              </p>
              <div style="margin-top:20px;display:flex;gap:10px;flex-wrap:wrap;justify-content:center;">
                ${['📷 Foto Langsung','🤖 Analisis AI','💾 Simpan ke Log'].map(t => `
                  <div style="background:var(--primary-bg);border-radius:20px;padding:5px 12px;font-size:0.75rem;color:var(--primary);font-weight:600;">${t}</div>`).join('')}
              </div>
            </div>

            <!-- Scanning state -->
            <div id="sc-loading-state" class="scanner-result-state hidden">
              <div class="sc-loader"></div>
              <h3 style="font-size:1rem;font-weight:700;color:var(--text);margin-top:16px;">Menganalisis Gambar</h3>
              <p style="font-size:0.83rem;color:var(--text-secondary);margin-top:4px;">AI sedang mengidentifikasi makanan...</p>
              <div class="sc-loading-steps" id="sc-loading-steps">
                <div class="sc-step active" id="sc-step-1"><i data-lucide="camera" style="width:14px;height:14px;"></i> Mengambil gambar</div>
                <div class="sc-step" id="sc-step-2"><i data-lucide="cpu" style="width:14px;height:14px;"></i> Proses AI</div>
                <div class="sc-step" id="sc-step-3"><i data-lucide="check-circle" style="width:14px;height:14px;"></i> Memuat hasil</div>
              </div>
            </div>

            <!-- Result state -->
            <div id="sc-result-state" class="hidden">
              <div class="sc-result-header" id="sc-result-header"></div>
              <div id="sc-result-body"></div>
            </div>
          </div>

        </div>

        <div class="dash-bottom-spacer"></div>
      </div>
    </div>`;
  }

  function showState(state) {
    ['sc-idle-state','sc-loading-state','sc-result-state'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.classList.add('hidden');
    });
    const target = document.getElementById('sc-' + state + '-state');
    if (target) target.classList.remove('hidden');
    scanState = state;
  }

  function showResult(food) {
    currentResult = food;
    const header = document.getElementById('sc-result-header');
    const body   = document.getElementById('sc-result-body');
    if (!header || !body) return;

    header.innerHTML = `
      <div style="display:flex;align-items:center;gap:12px;margin-bottom:16px;">
        <div style="font-size:2.5rem;">${food.emoji}</div>
        <div>
          <h3 style="font-size:1.1rem;font-weight:800;color:var(--text);margin:0 0 2px;">${food.name}</h3>
          <div style="display:flex;align-items:center;gap:6px;">
            <div style="height:6px;flex:1;background:#E2E8F0;border-radius:99px;max-width:80px;">
              <div style="height:100%;background:#52B847;border-radius:99px;width:${food.confidence}%;transition:width 0.8s ease;"></div>
            </div>
            <span style="font-size:0.78rem;color:#52B847;font-weight:700;">${food.confidence}% yakin</span>
          </div>
        </div>
        <div class="sc-check-badge"><i data-lucide="check-circle" style="width:20px;height:20px;color:#52B847;"></i></div>
      </div>`;

    body.innerHTML = `
      <div style="border-top:1px solid var(--border-light);padding-top:12px;">
        <div style="font-size:0.78rem;font-weight:700;text-transform:uppercase;letter-spacing:0.06em;color:var(--text-light);margin-bottom:8px;">
          Nilai Gizi per Porsi
        </div>
        ${renderNutritionTable(food.nutrition)}
      </div>
      <div style="margin-top:12px;display:flex;gap:8px;flex-wrap:wrap;">
        <select id="sc-meal-type" style="flex:1;min-width:120px;padding:8px 12px;border:1.5px solid var(--border-light);
          border-radius:var(--radius);font-size:0.82rem;color:var(--text);background:white;outline:none;">
          <option value="Sarapan">🌅 Sarapan</option>
          <option value="Makan Siang" selected>☀️ Makan Siang</option>
          <option value="Snack">🍎 Snack</option>
          <option value="Makan Malam">🌙 Makan Malam</option>
        </select>
        <button class="btn btn-primary" id="sc-save-btn" style="flex:1;min-width:120px;display:flex;align-items:center;justify-content:center;gap:6px;">
          <i data-lucide="save" style="width:16px;height:16px;"></i>
          Simpan ke Log
        </button>
      </div>
      <button onclick="ScannerPage._resetScan()" style="display:block;width:100%;margin-top:8px;padding:8px;border:none;background:none;
        font-size:0.8rem;color:var(--text-light);cursor:pointer;text-align:center;">
        ↩ Scan ulang
      </button>`;

    showState('result');
    if (typeof lucide !== 'undefined') lucide.createIcons();

    document.getElementById('sc-save-btn')?.addEventListener('click', saveMeal);
  }

  async function doCapture() {
    if (scanState === 'scanning') return;
    showState('loading');

    const steps = ['sc-step-1','sc-step-2','sc-step-3'];
    let si = 0;
    const stepInterval = setInterval(() => {
      if (si > 0) document.getElementById(steps[si-1])?.classList.remove('active');
      if (si < steps.length) {
        document.getElementById(steps[si])?.classList.add('active');
        si++;
      } else {
        clearInterval(stepInterval);
      }
    }, 600);

    const isDemo = VitaStore.get('demoMode');
    if (isDemo) {
      await new Promise(r => setTimeout(r, 2000));
      clearInterval(stepInterval);
      const food = DEMO_FOODS[Math.floor(Math.random() * DEMO_FOODS.length)];
      showResult(food);
      return;
    }

    const ip = VitaESP32.getIP();
    if (!ip) {
      clearInterval(stepInterval);
      showState('idle');
      VitaHelpers.showToast('Masukkan IP ESP32-CAM terlebih dahulu', 'error');
      return;
    }

    try {
      const res = await fetch(VitaESP32.getCaptureURL(ip));
      const blob = await res.blob();
      capturedImageUrl = URL.createObjectURL(blob);

      const apiKey = VitaStore.get('geminiApiKey');
      if (!apiKey || apiKey === 'YOUR_GEMINI_API_KEY') {
        clearInterval(stepInterval);
        const food = DEMO_FOODS[0];
        showResult(food);
        VitaHelpers.showToast('API Key Gemini belum diisi — menampilkan hasil demo', 'warning');
        return;
      }

      const reader = new FileReader();
      reader.onload = async (e) => {
        const b64 = e.target.result.split(',')[1];
        try {
          const aiRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
            method:'POST', headers:{'Content-Type':'application/json'},
            body: JSON.stringify({
              contents:[{parts:[
                {text:'Identifikasi makanan dalam gambar ini. Berikan nama makanan dalam Bahasa Indonesia, estimasi kandungan gizi per porsi normal dalam format JSON: {name, confidence(0-100), emoji, nutrition:{calories,protein,carbs,fat,fiber,sodium,sugar}}. Jawab HANYA dengan JSON tanpa markdown.'},
                {inline_data:{mime_type:'image/jpeg',data:b64}}
              ]}]
            })
          });
          const data = await aiRes.json();
          const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
          const parsed = JSON.parse(text.replace(/```json?|```/g,'').trim());
          clearInterval(stepInterval);
          showResult(parsed);
        } catch {
          clearInterval(stepInterval);
          showResult(DEMO_FOODS[0]);
          VitaHelpers.showToast('Gagal menganalisis — menampilkan estimasi', 'warning');
        }
      };
      reader.readAsDataURL(blob);
    } catch {
      clearInterval(stepInterval);
      showState('idle');
      VitaHelpers.showToast('Gagal terhubung ke ESP32-CAM', 'error');
    }
  }

  async function saveMeal() {
    if (!currentResult) return;
    const mealType = document.getElementById('sc-meal-type')?.value || 'Makan Siang';
    const mealData = {
      mealType,
      timestamp: new Date().toISOString(),
      source: 'esp32-cam',
      foods: [{ name: currentResult.name, portion: 1, nutrition: currentResult.nutrition }],
      totalNutrition: currentResult.nutrition,
    };

    const isDemo = VitaStore.get('demoMode');
    if (isDemo) {
      VitaHelpers.showToast(`${currentResult.name} disimpan ke ${mealType}! (Demo)`, 'success');
      setTimeout(() => { window.location.hash = 'nutrition'; }, 1200);
      return;
    }

    const user = VitaStore.get('user');
    if (!user) { VitaHelpers.showToast('Login diperlukan', 'error'); return; }

    const btn = document.getElementById('sc-save-btn');
    if (btn) { btn.disabled = true; btn.innerHTML = '<i data-lucide="loader-circle" style="width:16px;height:16px;animation:spin 1s linear infinite;"></i> Menyimpan...'; if (typeof lucide !== 'undefined') lucide.createIcons(); }

    try {
      await VitaFirestore.saveMeal(user.uid, mealData);
      VitaHelpers.showToast(`${currentResult.name} disimpan ke ${mealType}!`, 'success');
      setTimeout(() => { window.location.hash = 'nutrition'; }, 1200);
    } catch {
      VitaHelpers.showToast('Gagal menyimpan. Coba lagi.', 'error');
      if (btn) { btn.disabled = false; btn.innerHTML = '<i data-lucide="save" style="width:16px;height:16px;"></i> Simpan ke Log'; if (typeof lucide !== 'undefined') lucide.createIcons(); }
    }
  }

  function _resetScan() { showState('idle'); currentResult = null; }

  function init() {
    document.getElementById('sc-menu-btn')?.addEventListener('click', () => {
      document.getElementById('sidebar')?.classList.toggle('open');
      document.getElementById('sidebar-overlay')?.classList.toggle('hidden');
    });

    document.getElementById('sc-capture-btn')?.addEventListener('click', doCapture);

    document.getElementById('sc-test-btn')?.addEventListener('click', async () => {
      const ip = document.getElementById('sc-ip-input')?.value?.trim();
      if (!ip) { VitaHelpers.showToast('Masukkan IP terlebih dahulu', 'error'); return; }
      VitaESP32.setIP(ip);
      const btn = document.getElementById('sc-test-btn');
      btn.textContent = '...';
      const ok = await VitaESP32.testConnection(ip);
      btn.textContent = 'Test';
      if (ok) {
        VitaHelpers.showToast('ESP32-CAM terhubung!', 'success');
        const errEl = document.getElementById('sc-stream-err');
        if (errEl) {
          errEl.classList.add('hidden');
          const wrap = document.getElementById('sc-preview-wrap');
          if (wrap && !document.getElementById('sc-stream')) {
            const img = document.createElement('img');
            img.id = 'sc-stream'; img.className = 'scanner-stream';
            img.src = `http://${ip}/stream`;
            wrap.insertBefore(img, wrap.firstChild);
          } else if (document.getElementById('sc-stream')) {
            document.getElementById('sc-stream').src = `http://${ip}/stream`;
          }
        }
      } else {
        VitaHelpers.showToast('ESP32-CAM tidak dapat dijangkau', 'error');
      }
    });

    document.getElementById('sc-ip-input')?.addEventListener('change', (e) => {
      VitaESP32.setIP(e.target.value.trim());
    });
  }

  return { render, init, _resetScan };
})();
