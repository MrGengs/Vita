// VITA — Scanner Page
const ScannerPage = (() => {

  let scanState = 'idle'; // idle | loading | result
  let currentResult = null;
  let selectedDevice = null;
  let supabaseInterval = null;
  let lastCaptureId = null;
  let pendingAnalysisBlob = null;
  let rtdbRef = null;
  let lockedDeviceRef = null;
  let hashChangeListener = null;
  let lockHeartbeatInterval = null;
  let timeOffset = 0;
  let currentImageUrl = null;
  let currentImageFilename = null;
  let deviceList = []; // daftar perangkat aktif dari RTDB

  async function lockDevice(dev) {
    if (!dev || !dev._key) return;
    const user = VitaStore.get('user');
    if (!user) return;
    try {
      if (typeof firebase !== 'undefined' && firebase.database) {
        const ref = firebase.database().ref('/' + dev._key);
        const timestamp = firebase.database.ServerValue.TIMESTAMP;
        await ref.update({ lockedBy: user.uid, lockedByEmail: user.email || 'Pengguna', lockedAt: timestamp, lastPing: timestamp });
        ref.onDisconnect().update({ lockedBy: null, lockedByEmail: null, lockedAt: null, lastPing: null });
        lockedDeviceRef = ref;
        if (lockHeartbeatInterval) clearInterval(lockHeartbeatInterval);
        lockHeartbeatInterval = setInterval(() => {
          if (lockedDeviceRef) {
            lockedDeviceRef.update({ lastPing: firebase.database.ServerValue.TIMESTAMP }).catch(() => {});
          }
        }, 5000);
      }
    } catch(e) { console.warn("Failed to lock device", e); }
  }

  async function unlockDevice() {
    if (lockHeartbeatInterval) { clearInterval(lockHeartbeatInterval); lockHeartbeatInterval = null; }
    if (lockedDeviceRef) {
      try {
        await lockedDeviceRef.update({ lockedBy: null, lockedByEmail: null, lockedAt: null, lastPing: null });
        lockedDeviceRef.onDisconnect().cancel();
      } catch(e) {}
      lockedDeviceRef = null;
    }
  }

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
        <div class="vita-avatar" style="padding:0; overflow:hidden;">${VitaHelpers.getAvatar(p.name || 'U', p.photoURL)}</div>
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
    return `
    <div class="dash-bg">
      <div class="dash-orb dash-orb-1"></div>
      <div class="dash-orb dash-orb-2"></div>
      ${topbar()}
      <div class="dash-content">

        <div class="scanner-grid card-enter">

          <!-- Left: Camera -->
          <div class="vita-card scanner-camera-card">
            <div class="scanner-cam-header">
              <span style="font-weight:700;color:var(--text);font-size:0.9rem;display:flex;align-items:center;gap:6px;">
                <i data-lucide="camera" style="width:16px;height:16px;color:var(--primary);"></i>
                Kamera ESP32-CAM
              </span>
              <div class="scanner-live-badge" id="sc-live-badge">
                <span style="width:6px;height:6px;border-radius:50%;background:#52B847;animation:livePulse 2s infinite;display:inline-block;"></span> LIVE
              </div>
            </div>

            <div class="scanner-preview-wrap" id="sc-preview-wrap">
              <div class="scanner-frame-corners">
                <span class="sc-corner tl"></span><span class="sc-corner tr"></span>
                <span class="sc-corner bl"></span><span class="sc-corner br"></span>
              </div>
              <div id="sc-stream-err" class="scanner-no-stream">
                <i data-lucide="wifi-off" style="width:36px;height:36px;color:rgba(255,255,255,0.5);"></i>
                <span id="sc-stream-err-title">Belum Ada Perangkat</span>
                <span id="sc-stream-err-sub" style="font-size:0.75rem;opacity:0.6;">Silakan pilih perangkat IoT di bawah</span>
              </div>
              <div id="sc-scanning-overlay" class="scanner-scanning hidden">
                <div class="scanner-scan-line"></div>
                <span>Menganalisis...</span>
              </div>
            </div>

            <!-- Device Picker Row -->
            <div class="scanner-ip-row">
              <i data-lucide="cpu" style="width:15px;height:15px;color:var(--text-light);flex-shrink:0;"></i>
              <span id="sc-device-label" style="flex:1;font-size:0.82rem;color:var(--text-secondary);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">
                Belum ada perangkat dipilih
              </span>
              <button class="btn btn-primary btn-sm" id="sc-pick-device-btn" style="font-size:0.75rem;padding:6px 16px;border-radius:99px;font-weight:700;white-space:nowrap;flex-shrink:0;">
                Pilih
              </button>
            </div>

            <div id="sc-analysis-actions" style="display:none; gap:10px; width:100%; margin-top:8px;">
              <button class="btn btn-outline" id="sc-cancel-capture-btn" style="flex:0 0 auto; padding:10px 16px; border-radius:12px; background:white;">
                <i data-lucide="x" style="width:18px;height:18px;"></i> Batal
              </button>
              <button class="btn btn-primary" id="sc-analyze-btn" style="flex:1; border-radius:12px; box-shadow: 0 4px 12px rgba(46,127,191,0.25);">
                <i data-lucide="sparkles" style="width:18px;height:18px;"></i>
                Analisis Gambar
              </button>
            </div>
          </div>

          <!-- Right: Result -->
          <div class="vita-card scanner-result-card" id="sc-result-card">
            <div id="sc-idle-state" class="scanner-result-state">
              <div style="font-size:3rem;margin-bottom:12px;">🔍</div>
              <h3 style="font-size:1rem;font-weight:700;color:var(--text);margin-bottom:6px;">Siap Menganalisis</h3>
              <p style="font-size:0.83rem;color:var(--text-secondary);text-align:center;line-height:1.5;">
                Arahkan kamera ke makanan, lalu tekan tombol capture pada <strong>ESP32-CAM</strong> Anda untuk memulai.
              </p>
              <div style="margin-top:20px;display:flex;gap:10px;flex-wrap:wrap;justify-content:center;">
                ${['📷 Foto Langsung','🤖 Analisis AI','💾 Simpan ke Log'].map(t => `
                  <div style="background:var(--primary-bg);border-radius:20px;padding:5px 12px;font-size:0.75rem;color:var(--primary);font-weight:600;">${t}</div>`).join('')}
              </div>
            </div>

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

            <div id="sc-result-state" class="hidden">
              <div class="sc-result-header" id="sc-result-header"></div>
              <div id="sc-result-body"></div>
            </div>
          </div>

        </div>

        <div class="dash-bottom-spacer"></div>
      </div>

      <!-- ── Device Picker Modal ── -->
      <div id="sc-modal-overlay"
        style="display:none;position:fixed;inset:0;z-index:9000;background:rgba(0,0,0,0.45);
               backdrop-filter:blur(3px);align-items:flex-end;justify-content:center;">
        <div style="background:white;border-radius:24px 24px 0 0;width:100%;max-width:520px;
                    padding:20px 20px 36px;max-height:80vh;overflow-y:auto;
                    box-shadow:0 -8px 40px rgba(0,0,0,0.18);">
          <!-- Handle bar -->
          <div style="width:40px;height:4px;background:#E2E8F0;border-radius:99px;margin:0 auto 20px;"></div>
          <!-- Header -->
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:20px;">
            <div>
              <div style="font-weight:800;font-size:1.05rem;color:var(--text);">Pilih Perangkat IoT</div>
              <div style="font-size:0.78rem;color:var(--text-secondary);margin-top:2px;">
                ESP32-CAM yang terhubung ke jaringan
              </div>
            </div>
            <button id="sc-modal-close"
              style="width:34px;height:34px;border-radius:99px;border:none;background:#F1F5F9;
                     display:flex;align-items:center;justify-content:center;cursor:pointer;flex-shrink:0;">
              <i data-lucide="x" style="width:16px;height:16px;color:var(--text-secondary);"></i>
            </button>
          </div>
          <!-- Device list -->
          <div id="sc-device-list" style="display:flex;flex-direction:column;gap:10px;">
            <div style="text-align:center;color:var(--text-secondary);padding:24px;font-size:0.85rem;">
              Memuat perangkat...
            </div>
          </div>
        </div>
      </div>

    </div>`;
  }

  // ── Modal helpers ──────────────────────────────────────────────

  function openDeviceModal() {
    const modal = document.getElementById('sc-modal-overlay');
    if (modal) { modal.style.display = 'flex'; }
    renderDeviceModal();
    if (typeof lucide !== 'undefined') lucide.createIcons();
  }

  function closeDeviceModal() {
    const modal = document.getElementById('sc-modal-overlay');
    if (modal) modal.style.display = 'none';
  }

  function updateDeviceLabel() {
    const label = document.getElementById('sc-device-label');
    if (!label) return;
    if (selectedDevice) {
      label.textContent = selectedDevice.deviceId;
      label.style.color = 'var(--primary)';
      label.style.fontWeight = '700';
    } else {
      label.textContent = 'Belum ada perangkat dipilih';
      label.style.color = 'var(--text-secondary)';
      label.style.fontWeight = '400';
    }
  }

  function renderDeviceModal() {
    const listEl = document.getElementById('sc-device-list');
    if (!listEl) return;

    if (!deviceList.length) {
      listEl.innerHTML = `
        <div style="text-align:center;padding:32px 0;">
          <i data-lucide="wifi-off" style="width:40px;height:40px;color:var(--text-light);display:block;margin:0 auto 12px;"></i>
          <div style="font-size:0.88rem;font-weight:600;color:var(--text-secondary);">Tidak ada perangkat aktif</div>
          <div style="font-size:0.75rem;color:var(--text-light);margin-top:4px;">Pastikan ESP32-CAM menyala dan terhubung WiFi</div>
        </div>`;
      if (typeof lucide !== 'undefined') lucide.createIcons();
      return;
    }

    const user = VitaStore.get('user');
    const nowServer = Date.now() + timeOffset;

    listEl.innerHTML = deviceList.map(dev => {
      const isLockedByOther = dev.lockedBy && dev.lockedBy !== user?.uid
        && dev.lastPing && (nowServer - dev.lastPing <= 20000);
      const isSelected = selectedDevice?.deviceId === dev.deviceId;
      const clickable = !isLockedByOther && !isSelected;

      let badge, borderColor, bgColor;

      if (isLockedByOther) {
        badge = `<span style="display:flex;align-items:center;gap:5px;font-size:0.72rem;font-weight:700;
                   color:#EF4444;background:#FEF2F2;padding:5px 10px;border-radius:20px;flex-shrink:0;white-space:nowrap;">
          <span style="width:7px;height:7px;border-radius:50%;background:#EF4444;display:inline-block;flex-shrink:0;"></span>
          Sedang Terpakai
        </span>`;
        borderColor = '#EF4444'; bgColor = '#FFF5F5';
      } else if (isSelected) {
        badge = `<span style="display:flex;align-items:center;gap:5px;font-size:0.72rem;font-weight:700;
                   color:#2E7FBF;background:rgba(46,127,191,0.1);padding:5px 10px;border-radius:20px;flex-shrink:0;white-space:nowrap;">
          <span style="width:7px;height:7px;border-radius:50%;background:#2E7FBF;animation:livePulse 2s infinite;display:inline-block;flex-shrink:0;"></span>
          Terhubung
        </span>`;
        borderColor = '#2E7FBF'; bgColor = 'rgba(46,127,191,0.05)';
      } else {
        badge = `<span style="display:flex;align-items:center;gap:5px;font-size:0.72rem;font-weight:700;
                   color:#16A34A;background:#F0FDF4;padding:5px 10px;border-radius:20px;flex-shrink:0;white-space:nowrap;">
          <span style="width:7px;height:7px;border-radius:50%;background:#52B847;animation:livePulse 2s infinite;display:inline-block;flex-shrink:0;"></span>
          Tersedia
        </span>`;
        borderColor = '#52B847'; bgColor = 'white';
      }

      return `
      <div class="sc-dev-card" data-key="${dev._key}" data-clickable="${clickable}"
        style="border:2px solid ${borderColor};border-radius:14px;padding:14px 16px;background:${bgColor};
               display:flex;align-items:center;gap:12px;
               cursor:${clickable ? 'pointer' : 'default'};
               transition:transform 0.15s,box-shadow 0.15s;
               ${!clickable ? 'opacity:0.82;' : ''}"
        ${clickable ? `onmouseover="this.style.transform='translateY(-2px)';this.style.boxShadow='0 6px 20px rgba(0,0,0,0.1)'"
                       onmouseout="this.style.transform='';this.style.boxShadow=''"` : ''}>
        <div style="width:44px;height:44px;border-radius:12px;background:${borderColor}18;
                    display:flex;align-items:center;justify-content:center;flex-shrink:0;">
          <i data-lucide="camera" style="width:20px;height:20px;color:${borderColor};"></i>
        </div>
        <div style="flex:1;min-width:0;">
          <div style="font-weight:700;font-size:0.92rem;color:var(--text);">${dev.deviceId}</div>
          ${isLockedByOther && dev.lockedByEmail
            ? `<div style="font-size:0.68rem;color:#EF4444;margin-top:3px;font-weight:600;">
                 Digunakan: ${dev.lockedByEmail}
               </div>`
            : ''}
        </div>
        ${badge}
      </div>`;
    }).join('');

    if (typeof lucide !== 'undefined') lucide.createIcons();

    // Attach click listener hanya pada kartu yang tersedia
    listEl.querySelectorAll('.sc-dev-card[data-clickable="true"]').forEach(card => {
      card.addEventListener('click', () => {
        const key = card.dataset.key;
        const dev = deviceList.find(d => d._key === key);
        if (!dev) return;
        closeDeviceModal();
        connectStream(dev);
      });
    });
  }

  // ── Stream connect ─────────────────────────────────────────────

  async function connectStream(dev) {
    await unlockDevice();
    selectedDevice = dev;
    updateDeviceLabel();

    VitaESP32.setIP(dev.ip);
    lastCaptureId = null;
    startSupabasePolling(dev.deviceId);

    const errEl    = document.getElementById('sc-stream-err');
    const errTitle = document.getElementById('sc-stream-err-title');
    const errSub   = document.getElementById('sc-stream-err-sub');

    if (errEl) errEl.classList.remove('hidden');
    if (errTitle) errTitle.textContent = 'Menghubungkan...';
    if (errSub) errSub.textContent = `Menyambungkan ke ${dev.deviceId}`;

    const pickBtn = document.getElementById('sc-pick-device-btn');
    if (pickBtn) { pickBtn.disabled = true; pickBtn.textContent = '...'; }

    const ok = await VitaESP32.testConnection(dev.ip);

    if (pickBtn) { pickBtn.disabled = false; pickBtn.textContent = 'Pilih'; }

    if (ok) {
      lockDevice(dev);
      if (errEl) errEl.classList.add('hidden');

      const wrap = document.getElementById('sc-preview-wrap');
      const streamUrl = dev.streamUrl;

      const attachStream = (img) => {
        img.onload = function() { errEl?.classList.add('hidden'); this.classList.remove('hidden'); };
        img.onerror = function() {
          if (errEl) {
            errEl.classList.remove('hidden');
            if (errTitle) errTitle.textContent = 'Stream terputus';
            if (errSub) errSub.textContent = `Koneksi video ke ${dev.deviceId} terputus`;
          }
          this.classList.add('hidden');
        };
        img.src = streamUrl;
      };

      const existing = document.getElementById('sc-stream');
      if (existing) {
        attachStream(existing);
        existing.classList.remove('hidden');
      } else if (wrap) {
        const img = document.createElement('img');
        img.id = 'sc-stream'; img.className = 'scanner-stream';
        attachStream(img);
        wrap.insertBefore(img, wrap.firstChild);
      }

      VitaHelpers.showToast(`Terhubung ke ${dev.deviceId}`, 'success');
      renderDeviceModal(); // update badge "Terhubung" di modal
    } else {
      if (errTitle) errTitle.textContent = 'Gagal Terhubung';
      if (errSub) errSub.textContent = `Perangkat ${dev.deviceId} tidak dapat dijangkau`;
      VitaHelpers.showToast('Kamera tidak dapat dijangkau', 'error');
      selectedDevice = null;
      updateDeviceLabel();
      renderDeviceModal();
    }
  }

  // ── Scan state helpers ─────────────────────────────────────────

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

  function analyzeWithGemini(blob, stepInterval) {
    const keys = VitaStore.get('geminiApiKeys') || [];
    if (!keys.length) {
      if (stepInterval) clearInterval(stepInterval);
      showState('idle');
      VitaHelpers.showToast('API Key Gemini belum diisi', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = async (e) => {
      const b64 = e.target.result.split(',')[1];
      try {
        const parsed = await VitaAI.analyzeImage(b64, 'image/jpeg');
        if (stepInterval) clearInterval(stepInterval);
        if (parsed && parsed.name) {
          showResult(parsed);
        } else {
          showState('idle');
          VitaHelpers.showToast('Gagal menganalisis gambar. Silakan coba lagi.', 'error');
        }
      } catch {
        if (stepInterval) clearInterval(stepInterval);
        showState('idle');
        VitaHelpers.showToast('Gagal menghubungi AI. Pastikan API Key valid.', 'error');
      }
    };
    reader.readAsDataURL(blob);
  }

  function resetToStream() {
    pendingAnalysisBlob = null;
    currentImageUrl = null;
    document.getElementById('sc-captured-image')?.classList.add('hidden');
    document.getElementById('sc-stream')?.classList.remove('hidden');
    const actions = document.getElementById('sc-analysis-actions');
    if (actions) actions.style.display = 'none';
  }

  function showCapturedPreview(blob) {
    pendingAnalysisBlob = blob;
    showState('idle');

    const wrap = document.getElementById('sc-preview-wrap');
    let capImg = document.getElementById('sc-captured-image');
    if (!capImg) {
      capImg = document.createElement('img');
      capImg.id = 'sc-captured-image';
      capImg.className = 'scanner-stream';
      wrap.appendChild(capImg);
    }
    capImg.src = URL.createObjectURL(blob);
    capImg.classList.remove('hidden');
    document.getElementById('sc-stream')?.classList.add('hidden');

    const actions = document.getElementById('sc-analysis-actions');
    if (actions) actions.style.display = 'flex';
  }

  function startAnalysis(blob) {
    showState('loading');
    const steps = ['sc-step-1','sc-step-2','sc-step-3'];
    let si = 0;
    const stepInterval = setInterval(() => {
      if (si > 0) document.getElementById(steps[si-1])?.classList.remove('active');
      if (si < steps.length) { document.getElementById(steps[si])?.classList.add('active'); si++; }
      else { clearInterval(stepInterval); }
    }, 600);
    analyzeWithGemini(blob, stepInterval);
  }

  async function processSupabaseImage(publicUrl) {
    try {
      const imgRes = await fetch(publicUrl);
      const blob = await imgRes.blob();
      showCapturedPreview(blob);
      VitaHelpers.showToast('Foto dari ESP32 siap dianalisis!', 'info');
    } catch (e) {
      VitaHelpers.showToast('Gagal memuat foto dari Supabase', 'error');
    }
  }

  function startSupabasePolling(deviceId) {
    if (supabaseInterval) clearInterval(supabaseInterval);
    const SUPABASE_HOST = 'jonpztihoxuzzdjneoqv.supabase.co';
    const SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpvbnB6dGlob3h1enpkam5lb3F2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY3ODI0NTksImV4cCI6MjA5MjM1ODQ1OX0.JKszK9PY_IpxEOtaRy_kuD0jJyiB4Lg40sQGOs9HvVc';

    supabaseInterval = setInterval(async () => {
      if (scanState !== 'idle') return;
      try {
        const res = await fetch(
          `https://${SUPABASE_HOST}/rest/v1/captures?device=eq.${deviceId}&order=id.desc&limit=1`,
          { headers: { 'apikey': SUPABASE_ANON, 'Authorization': `Bearer ${SUPABASE_ANON}` } }
        );
        const data = await res.json();

        if (!data || data.length === 0) {
          // Tabel kosong untuk device ini — set sentinel -1 agar foto pertama
          // yang masuk (id selalu >= 1) langsung terdeteksi dan diproses
          if (lastCaptureId === null) lastCaptureId = -1;
          return;
        }

        const row = data[0];

        if (lastCaptureId === null) {
          // Poll pertama dan sudah ada foto lama → jadikan baseline, skip
          // (foto diambil sebelum user ini connect ke device)
          lastCaptureId = row.id;
          return;
        }

        if (row.id !== lastCaptureId) {
          lastCaptureId        = row.id;
          currentImageUrl      = row.url  || null;
          currentImageFilename = row.path || null;

          // Tulis user_uid ke baris captures di Supabase
          // Awaited agar error HTTP (403/400) terlihat di console, bukan hilang diam-diam
          const activeUser = VitaStore.get('user');
          if (activeUser) {
            try {
              const patchRes = await fetch(
                `https://${SUPABASE_HOST}/rest/v1/captures?id=eq.${row.id}`,
                {
                  method: 'PATCH',
                  headers: {
                    'apikey': SUPABASE_ANON,
                    'Authorization': `Bearer ${SUPABASE_ANON}`,
                    'Content-Type': 'application/json',
                    'Prefer': 'return=minimal'
                  },
                  body: JSON.stringify({ user_uid: activeUser.uid })
                }
              );
              if (!patchRes.ok) {
                const errText = await patchRes.text();
                console.warn(`[VITA] Gagal set user_uid (HTTP ${patchRes.status}):`, errText);
              }
            } catch (patchErr) {
              console.warn('[VITA] PATCH user_uid network error:', patchErr);
            }
          }

          VitaHelpers.showToast('Foto IoT terdeteksi! Memproses...', 'info');
          processSupabaseImage(row.url);
        }
      } catch (e) { console.warn('[VITA] Supabase polling error:', e); }
    }, 3000);
  }

  function doAnalyze() {
    if (scanState !== 'idle') return;
    if (pendingAnalysisBlob) { startAnalysis(pendingAnalysisBlob); return; }
    VitaHelpers.showToast('Belum ada gambar yang diambil. Tunggu foto dari ESP32-CAM.', 'warning');
  }

  function _pushToStore(result, mealType) {
    const n = result.nutrition;
    const newMeal = {
      id:        Date.now(),
      name:      result.name,
      emoji:     result.emoji || '🍽️',
      image_url: currentImageUrl,
      time:      new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      type:      mealType,
      cal:       Math.round(n.calories || 0),
      prot:      parseFloat((n.protein  || 0).toFixed(1)),
      carb:      parseFloat((n.carbs    || 0).toFixed(1)),
      fat:       parseFloat((n.fat      || 0).toFixed(1)),
    };
    const meals = VitaStore.get('todayMeals') || [];
    meals.push(newMeal);
    VitaStore.set('todayMeals', meals);

    const cur = VitaStore.get('todayNutrition') || {};
    VitaStore.set('todayNutrition', {
      calories: (cur.calories || 0) + newMeal.cal,
      protein:  (cur.protein  || 0) + newMeal.prot,
      carbs:    (cur.carbs    || 0) + newMeal.carb,
      fat:      (cur.fat      || 0) + newMeal.fat,
      fiber:    (cur.fiber    || 0) + parseFloat((n.fiber  || 0).toFixed(1)),
      sodium:   (cur.sodium   || 0) + parseFloat((n.sodium || 0).toFixed(1)),
      sugar:    (cur.sugar    || 0) + parseFloat((n.sugar  || 0).toFixed(1)),
    });
  }

  async function saveMeal() {
    if (!currentResult) return;
    const mealType = document.getElementById('sc-meal-type')?.value || 'Makan Siang';

    const user = VitaStore.get('user');
    if (!user) { VitaHelpers.showToast('Login diperlukan', 'error'); return; }

    const btn = document.getElementById('sc-save-btn');
    if (btn) {
      btn.disabled = true;
      btn.innerHTML = '<i data-lucide="loader-circle" style="width:16px;height:16px;animation:spin 1s linear infinite;"></i> Menyimpan...';
      if (typeof lucide !== 'undefined') lucide.createIcons();
    }

    const mealData = {
      mealType,
      timestamp: new Date().toISOString(),
      source: 'esp32-cam',
      device_id: selectedDevice?.deviceId || null,
      image_url: currentImageUrl || null,
      image_filename: currentImageFilename || null,
      foods: [{ name: currentResult.name, portion: 1, nutrition: currentResult.nutrition }],
      totalNutrition: currentResult.nutrition,
    };

    try {
      await VitaFirestore.saveMeal(user.uid, mealData);
      _pushToStore(currentResult, mealType);
      VitaHelpers.showToast(`${currentResult.name} disimpan ke ${mealType}!`, 'success');

      // Recalc risk di background
      if (typeof RiskPage !== 'undefined') RiskPage.recalcAndSave().catch(() => {});

      setTimeout(() => { window.location.hash = 'nutrition'; }, 1200);
    } catch {
      VitaHelpers.showToast('Gagal menyimpan. Coba lagi.', 'error');
      if (btn) {
        btn.disabled = false;
        btn.innerHTML = '<i data-lucide="save" style="width:16px;height:16px;"></i> Simpan ke Log';
        if (typeof lucide !== 'undefined') lucide.createIcons();
      }
    }
  }

  function _resetScan() {
    showState('idle');
    currentResult = null;
    resetToStream();
  }

  // ── Init ───────────────────────────────────────────────────────

  function init() {
    if (supabaseInterval) clearInterval(supabaseInterval);
    if (rtdbRef) { rtdbRef.off('value'); rtdbRef = null; }

    if (hashChangeListener) window.removeEventListener('hashchange', hashChangeListener);
    hashChangeListener = () => {
      const hash = window.location.hash.replace('#', '');
      if (hash !== 'scanner') {
        unlockDevice();
        if (rtdbRef) { rtdbRef.off('value'); rtdbRef = null; }
        if (supabaseInterval) clearInterval(supabaseInterval);
        window.removeEventListener('hashchange', hashChangeListener);
        hashChangeListener = null;
      }
    };
    window.addEventListener('hashchange', hashChangeListener);

    scanState = 'idle';
    pendingAnalysisBlob = null;
    currentImageUrl = null;
    currentImageFilename = null;
    selectedDevice = null;
    lastCaptureId = null;
    deviceList = [];

    document.getElementById('sc-menu-btn')?.addEventListener('click', () => {
      document.getElementById('sidebar')?.classList.toggle('open');
      document.getElementById('sidebar-overlay')?.classList.toggle('hidden');
    });

    document.getElementById('sc-analyze-btn')?.addEventListener('click', doAnalyze);
    document.getElementById('sc-cancel-capture-btn')?.addEventListener('click', resetToStream);

    // Modal
    document.getElementById('sc-pick-device-btn')?.addEventListener('click', openDeviceModal);
    document.getElementById('sc-modal-close')?.addEventListener('click', closeDeviceModal);
    document.getElementById('sc-modal-overlay')?.addEventListener('click', (e) => {
      if (e.target === e.currentTarget) closeDeviceModal();
    });

    if (typeof firebase !== 'undefined' && firebase.database) {
      firebase.database().ref('.info/serverTimeOffset').once('value', snap => {
        timeOffset = snap.val() || 0;
      });

      rtdbRef = firebase.database().ref('/');
      rtdbRef.on('value', (snap) => {
        const val = snap.val();
        deviceList = [];

        if (val) {
          Object.keys(val).forEach(k => {
            const dev = val[k];
            if (dev && dev.deviceId && dev.online) {
              deviceList.push({ ...dev, _key: k });
            }
          });
        }

        // Update selectedDevice dengan data terbaru dari RTDB (IP/lastSeen berubah)
        // tanpa mereset koneksi — tracking via deviceId, bukan JSON string
        if (selectedDevice) {
          const updated = deviceList.find(d => d.deviceId === selectedDevice.deviceId);
          if (updated) selectedDevice = updated;
        }

        renderDeviceModal();
      }, (error) => {
        console.error('[VITA] RTDB Error:', error);
        VitaHelpers.showToast('Gagal memuat perangkat IoT. Periksa izin Realtime Database Anda.', 'error');
      });
    }
  }

  return { render, init, _resetScan };
})();
