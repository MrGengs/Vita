// VITA — Onboarding Page (4-Step Wizard)
const OnboardingPage = (() => {

  let currentStep = 1;
  const totalSteps = 4;
  let formData = {
    name: '',
    age: '',
    gender: 'male',
    height: '',
    weight: '',
    goals: []
  };

  const GOALS_LIST = [
    'Menurunkan Berat Badan',
    'Menaikkan Massa Otot',
    'Menjaga Kesehatan',
    'Mengontrol Gula Darah',
    'Menurunkan Tekanan Darah'
  ];

  function renderProgressBar() {
    const pct = ((currentStep - 1) / (totalSteps - 1)) * 100;
    return `
      <div style="width:100%; height:6px; background:var(--bg-light); border-radius:10px; margin-bottom:24px; overflow:hidden;">
        <div style="height:100%; background:var(--primary); width:${pct}%; transition:width 0.4s ease; border-radius:10px;"></div>
      </div>
    `;
  }

  function renderStepContent() {
    if (currentStep === 1) {
      return `
        <div class="animate-in">
          <div style="font-size:3rem; margin-bottom:16px;">👋</div>
          <h2 style="font-size:1.5rem; font-weight:800; color:var(--text); margin-bottom:8px;">Selamat Datang!</h2>
          <p style="color:var(--text-secondary); font-size:0.9rem; margin-bottom:24px; line-height:1.5;">Mari kita mulai perjalanan sehat Anda bersama VITA. Siapa nama panggilan Anda?</p>
          <div class="form-group" style="text-align:left;">
            <label class="form-label">Nama Panggilan</label>
            <input type="text" id="ob-name" class="form-input" placeholder="Contoh: Budi" value="${formData.name}" autofocus>
          </div>
        </div>
      `;
    }
    
    if (currentStep === 2) {
      return `
        <div class="animate-in">
          <div style="font-size:3rem; margin-bottom:16px;">👤</div>
          <h2 style="font-size:1.5rem; font-weight:800; color:var(--text); margin-bottom:8px;">Data Diri</h2>
          <p style="color:var(--text-secondary); font-size:0.9rem; margin-bottom:24px; line-height:1.5;">Informasi ini membantu AI kami menyesuaikan kebutuhan kalori dasar Anda.</p>
          <div class="form-row">
            <div class="form-group" style="text-align:left;">
              <label class="form-label">Usia</label>
              <input type="number" id="ob-age" class="form-input" placeholder="Tahun" min="15" max="100" value="${formData.age}">
            </div>
            <div class="form-group" style="text-align:left;">
              <label class="form-label">Gender</label>
              <select id="ob-gender" class="form-input form-select">
                <option value="male" ${formData.gender === 'male' ? 'selected' : ''}>Pria</option>
                <option value="female" ${formData.gender === 'female' ? 'selected' : ''}>Wanita</option>
              </select>
            </div>
          </div>
        </div>
      `;
    }

    if (currentStep === 3) {
      return `
        <div class="animate-in">
          <div style="font-size:3rem; margin-bottom:16px;">⚖️</div>
          <h2 style="font-size:1.5rem; font-weight:800; color:var(--text); margin-bottom:8px;">Metrik Tubuh</h2>
          <p style="color:var(--text-secondary); font-size:0.9rem; margin-bottom:24px; line-height:1.5;">Masukkan tinggi dan berat badan Anda untuk mengukur BMI dan peta risiko awal.</p>
          <div class="form-row">
            <div class="form-group" style="text-align:left;">
              <label class="form-label">Tinggi (cm)</label>
              <input type="number" id="ob-height" class="form-input" placeholder="170" value="${formData.height}">
            </div>
            <div class="form-group" style="text-align:left;">
              <label class="form-label">Berat (kg)</label>
              <input type="number" id="ob-weight" class="form-input" placeholder="65" value="${formData.weight}">
            </div>
          </div>
        </div>
      `;
    }

    if (currentStep === 4) {
      return `
        <div class="animate-in">
          <div style="font-size:3rem; margin-bottom:16px;">🎯</div>
          <h2 style="font-size:1.5rem; font-weight:800; color:var(--text); margin-bottom:8px;">Target Kesehatan</h2>
          <p style="color:var(--text-secondary); font-size:0.9rem; margin-bottom:16px; line-height:1.5;">Pilih satu atau lebih target yang ingin Anda capai bersama VITA.</p>
          <div style="display:flex; flex-direction:column; gap:10px; text-align:left; margin-bottom:16px;" id="ob-goals-container">
            ${GOALS_LIST.map(g => `
              <label style="display:flex; align-items:center; gap:12px; padding:14px 16px; border:1.5px solid ${formData.goals.includes(g) ? 'var(--primary)' : 'var(--border-light)'}; background:${formData.goals.includes(g) ? 'var(--primary-bg)' : 'transparent'}; border-radius:12px; cursor:pointer; transition:all 0.2s;">
                <input type="checkbox" class="ob-goal-cb" value="${g}" ${formData.goals.includes(g) ? 'checked' : ''} style="width:18px;height:18px;accent-color:var(--primary);">
                <span style="font-weight:500; font-size:0.9rem; color:${formData.goals.includes(g) ? 'var(--primary)' : 'var(--text)'};">${g}</span>
              </label>
            `).join('')}
          </div>
        </div>
      `;
    }
  }

  function render() {
    return `
    <div class="auth-page" style="background:#F0F6FF;">
      <div class="auth-card" style="max-width:400px; padding:32px 24px; text-align:center;">
        <div id="ob-progress-container">${renderProgressBar()}</div>
        <div id="ob-content-container" style="min-height:300px; display:flex; flex-direction:column; justify-content:center;">
          ${renderStepContent()}
        </div>
        
        <div style="display:flex; gap:12px; margin-top:24px;">
          <button id="ob-btn-prev" class="btn btn-ghost" style="flex:1; display:${currentStep === 1 ? 'none' : 'block'}; background:var(--bg-light);">
            Kembali
          </button>
          <button id="ob-btn-next" class="btn btn-primary" style="flex:2;">
            ${currentStep === totalSteps ? 'Selesai & Mulai' : 'Lanjut →'}
          </button>
        </div>
      </div>
    </div>`;
  }

  function updateUI() {
    const prog = document.getElementById('ob-progress-container');
    const cont = document.getElementById('ob-content-container');
    const btnPrev = document.getElementById('ob-btn-prev');
    const btnNext = document.getElementById('ob-btn-next');
    
    if(prog) prog.innerHTML = renderProgressBar();
    if(cont) cont.innerHTML = renderStepContent();
    
    if(btnPrev) btnPrev.style.display = currentStep === 1 ? 'none' : 'block';
    if(btnNext) btnNext.innerHTML = currentStep === totalSteps ? 'Selesai & Mulai' : 'Lanjut →';

    // Re-attach goal click listeners for styling if on step 4
    if (currentStep === 4) {
      document.querySelectorAll('.ob-goal-cb').forEach(cb => {
        cb.addEventListener('change', (e) => {
          const val = e.target.value;
          if (e.target.checked && !formData.goals.includes(val)) formData.goals.push(val);
          else if (!e.target.checked) formData.goals = formData.goals.filter(g => g !== val);
          updateUI(); // Re-render container for styles
        });
      });
    }
  }

  function validateCurrentStep() {
    if (currentStep === 1) {
      const n = document.getElementById('ob-name')?.value?.trim();
      if (!n) { VitaHelpers.showToast('Mohon masukkan nama Anda', 'error'); return false; }
      formData.name = n;
    } else if (currentStep === 2) {
      const a = parseInt(document.getElementById('ob-age')?.value);
      const g = document.getElementById('ob-gender')?.value;
      if (!a || a < 10 || a > 120) { VitaHelpers.showToast('Mohon masukkan usia yang valid', 'error'); return false; }
      formData.age = a;
      formData.gender = g;
    } else if (currentStep === 3) {
      const h = parseFloat(document.getElementById('ob-height')?.value);
      const w = parseFloat(document.getElementById('ob-weight')?.value);
      if (!h || h < 50 || h > 250) { VitaHelpers.showToast('Masukkan tinggi badan yang valid (cm)', 'error'); return false; }
      if (!w || w < 20 || w > 300) { VitaHelpers.showToast('Masukkan berat badan yang valid (kg)', 'error'); return false; }
      formData.height = h;
      formData.weight = w;
    } else if (currentStep === 4) {
      if (formData.goals.length === 0) { VitaHelpers.showToast('Pilih minimal satu target kesehatan', 'error'); return false; }
    }
    return true;
  }

  async function finishOnboarding() {
    const user = VitaStore.get('user');
    if (!user) return;
    
    const btn = document.getElementById('ob-btn-next');
    if (btn) {
      btn.disabled = true;
      btn.innerHTML = '<i data-lucide="loader-circle" style="width:16px;height:16px;animation:spin 1s linear infinite;"></i> Memproses...';
      if (typeof lucide !== 'undefined') lucide.createIcons();
    }

    const bmi = formData.height && formData.weight ? VitaHelpers.calculateBMI(formData.weight, formData.height) : 0;
    const profile = {
      ...formData,
      name: formData.name || user.displayName || 'Pengguna',
      email: user.email || '',
      photoURL: user.photoURL || '',
      bmi: parseFloat(bmi.toFixed(1)),
      onboardingComplete: true,
      createdAt: new Date().toISOString()
    };

    try {
      await VitaFirestore.saveUserProfile(user.uid, profile);
      VitaStore.set('profile', profile);
      VitaStore.set('onboardingComplete', true);
      if (typeof window.updateSidebarUser === 'function') window.updateSidebarUser(profile, user);
      VitaHelpers.showToast(`Selamat datang, ${formData.name}! 🎉`, 'success');
      setTimeout(() => VitaRouter.navigate('dashboard'), 500);
    } catch (e) { 
      if (btn) { btn.disabled = false; btn.innerHTML = 'Coba Lagi'; }
      VitaHelpers.showToast('Gagal menyimpan profil. Periksa koneksi Anda.', 'error'); 
    }
  }

  function init() {
    currentStep = 1; // reset state on load
    formData = { name: '', age: '', gender: 'male', height: '', weight: '', goals: [] };
    updateUI();

    document.getElementById('ob-btn-next')?.addEventListener('click', () => {
      if (!validateCurrentStep()) return;
      if (currentStep < totalSteps) {
        currentStep++;
        updateUI();
      } else {
        finishOnboarding();
      }
    });

    document.getElementById('ob-btn-prev')?.addEventListener('click', () => {
      if (currentStep > 1) {
        currentStep--;
        updateUI();
      }
    });
  }
  return { render, init };
})();
