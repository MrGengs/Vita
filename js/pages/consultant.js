// VITA — AI Consultant Page
const ConsultantPage = (() => {

  // Menyimpan riwayat percakapan untuk memberi konteks pada Gemini AI
  let chatHistory = [];

  function topbar(name) {
    return `
    <div class="vita-topbar" style="border-bottom:none; z-index:20;">
      <div class="vita-topbar-left">
        <button class="vita-menu-btn" id="cons-menu-btn"><i data-lucide="menu"></i></button>
        <div class="topbar-brand">
          <svg width="26" height="26" viewBox="0 0 64 64" fill="none">
            <circle cx="32" cy="32" r="32" fill="url(#cGrad)"/>
            <defs><linearGradient id="cGrad" x1="0" y1="0" x2="64" y2="64">
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
        <button class="vita-icon-btn" onclick="window.location.hash='dashboard'"><i data-lucide="x"></i></button>
      </div>
    </div>`;
  }

  function render() {
    const p = VitaStore.get('profile') || {};
    const risk = VitaStore.get('riskScores') || { diabetes: 28, hypertension: 42, obesity: 19, cvd: 33 };
    
    const highestRisk = Object.keys(risk).reduce((a, b) => risk[a] > risk[b] ? a : b, 'diabetes');
    const riskNames = { diabetes: 'Diabetes', hypertension: 'Hipertensi', obesity: 'Obesitas', cvd: 'Penyakit Jantung' };

    // Reset riwayat saat halaman dimuat ulang
    chatHistory = [];

    return `
    <div class="dash-bg" style="display:flex;flex-direction:column;height:100vh;overflow:hidden;background:#F8FAFC;">
      ${topbar(p.name || 'Pengguna')}

      <!-- Context Banner -->
      <div style="background:var(--primary); color:white; padding:10px 20px; font-size:0.75rem; display:flex; gap:16px; align-items:center; z-index:10;">
        <div style="display:flex;align-items:center;gap:6px;">
          <i data-lucide="scale" style="width:14px;height:14px;opacity:0.8;"></i> 
          <span>BMI: <strong>${p.bmi ? p.bmi.toFixed(1) : '24.9'}</strong></span>
        </div>
        <div style="display:flex;align-items:center;gap:6px;">
          <i data-lucide="alert-triangle" style="width:14px;height:14px;opacity:0.8;"></i> 
          <span>Perhatian: <strong>${riskNames[highestRisk] || '-'}</strong></span>
        </div>
      </div>

      <!-- Chat Area -->
      <div id="chat-area" style="flex:1; overflow-y:auto; padding:20px; display:flex; flex-direction:column; gap:16px;">
        <!-- Initial Greeting -->
        <div style="align-self:flex-start; display:flex; gap:10px; max-width:85%; animation:fadeInUp 0.4s ease forwards;">
          <div style="width:36px; height:36px; border-radius:50%; background:white; display:flex; align-items:center; justify-content:center; flex-shrink:0; box-shadow:var(--shadow-sm); border:1px solid var(--border-light);">
            <i data-lucide="bot" style="width:20px; height:20px; color:var(--primary);"></i>
          </div>
          <div style="background:white; padding:14px 18px; border-radius:16px 16px 16px 4px; font-size:0.875rem; color:var(--text); line-height:1.5; box-shadow:var(--shadow-sm); border:1px solid var(--border-light);">
            Halo ${p.name || 'Pengguna'}! Saya <strong>VITA AI</strong>. 🤖<br><br>
            Berdasarkan profil kesehatan Anda, saya bisa merekomendasikan menu makanan, mengevaluasi makanan harian Anda, atau menjelaskan peta risiko metabolisme Anda. Ada yang ingin ditanyakan?
          </div>
        </div>
      </div>

      <!-- Input Area -->
      <div style="background:white; padding:16px; border-top:1px solid var(--border-light); z-index:10; box-shadow:0 -4px 12px rgba(0,0,0,0.03);">
        
        <!-- Suggestion Chips -->
        <div style="display:flex; gap:8px; overflow-x:auto; padding-bottom:12px; scrollbar-width:none;" id="chat-suggestions">
          ${['Saran sarapan sehat', 'Cara kurangi asupan sodium?', 'Jelaskan risiko tinggi saya'].map(chip => `
            <button onclick="ConsultantPage.send('${chip}')" style="white-space:nowrap; padding:8px 14px; border-radius:20px; background:var(--bg-light); border:1px solid var(--border-light); font-size:0.75rem; color:var(--primary); font-weight:600; cursor:pointer; transition:all 0.2s;">
              ${chip}
            </button>
          `).join('')}
        </div>

        <!-- Form Input -->
        <form id="chat-form" style="display:flex; gap:10px; align-items:center;">
          <input type="text" id="chat-input" placeholder="Tanya tentang diet & kesehatan..." 
            style="flex:1; padding:14px 20px; border-radius:24px; border:1.5px solid var(--border-light); outline:none; font-size:0.875rem; background:var(--bg-light); transition:border-color 0.2s;" autocomplete="off">
          <button type="submit" class="btn btn-primary" style="border-radius:50%; width:48px; height:48px; padding:0; display:flex; align-items:center; justify-content:center; flex-shrink:0;">
            <i data-lucide="send" style="width:18px; height:18px;"></i>
          </button>
        </form>
      </div>
    </div>`;
  }

  // Parser ringan untuk mengubah Markdown Gemini menjadi HTML
  function parseMarkdown(text) {
    let formatted = text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') // Bold
      .replace(/(?<!\*)\*(?!\*)(.*?)(?<!\*)\*(?!\*)/g, '<em>$1</em>') // Italic
      .replace(/\n/g, '<br>'); // Baris baru

    // Mengubah format list/bullet points (berawalan - atau *)
    formatted = formatted.replace(/(?:<br>|^)\s*[-\*]\s+(.*?)(?=(?:<br>|$))/g, '<li style="margin-bottom:4px;">$1</li>');
    formatted = formatted.replace(/(<li.*?>.*?<\/li>)+/g, '<ul style="margin:8px 0;padding-left:24px;">$&</ul>');

    return formatted;
  }

  async function send(textStr) {
    const input = document.getElementById('chat-input');
    const area = document.getElementById('chat-area');
    const submitBtn = document.querySelector('#chat-form button');
    if (!input || !area) return;

    const msg = typeof textStr === 'string' ? textStr : input.value.trim();
    if (!msg) return;

    input.value = '';
    input.disabled = true;
    if (submitBtn) submitBtn.disabled = true;
    document.getElementById('chat-suggestions').style.display = 'none'; // Sembunyikan chip setelah chat pertama

    // Simpan ke riwayat lokal
    chatHistory.push(`Pengguna: ${msg}`);

    // 1. Render User message
    area.innerHTML += `
      <div style="align-self:flex-end; display:flex; gap:10px; max-width:85%; flex-direction:row-reverse; animation:fadeInUp 0.3s ease forwards;">
        <div style="background:var(--primary); color:white; padding:12px 18px; border-radius:16px 16px 4px 16px; font-size:0.875rem; line-height:1.5; box-shadow:var(--shadow-sm);">
          ${msg}
        </div>
      </div>`;
    area.scrollTop = area.scrollHeight;

    // 2. Render Loading AI state
    const loaderId = 'ai-load-' + Date.now();
    area.innerHTML += `
      <div id="${loaderId}" style="align-self:flex-start; display:flex; gap:10px; max-width:85%; animation:fadeInUp 0.3s ease forwards;">
        <div style="width:36px; height:36px; border-radius:50%; background:var(--primary-bg); display:flex; align-items:center; justify-content:center; flex-shrink:0;">
          <i data-lucide="bot" style="width:20px; height:20px; color:var(--primary);"></i>
        </div>
        <div style="background:white; padding:14px 18px; border-radius:16px 16px 16px 4px; font-size:0.875rem; border:1px solid var(--border-light); display:flex; align-items:center; gap:6px;">
          Sedang berpikir...
        </div>
      </div>`;
    if(typeof lucide !== 'undefined') lucide.createIcons();
    area.scrollTop = area.scrollHeight;

    // 3. Fetch from API
    try {
      // Gabungkan riwayat percakapan lalu kirim sebagai prompt
      const promptContext = chatHistory.join('\n\n');
      const response = await window.VitaAI.ask(promptContext);
      
      chatHistory.push(`VITA AI: ${response}`);
      document.getElementById(loaderId)?.remove();
      
      area.innerHTML += `
        <div style="align-self:flex-start; display:flex; gap:10px; max-width:85%; animation:fadeInUp 0.3s ease forwards;">
          <div style="width:36px; height:36px; border-radius:50%; background:var(--primary-bg); display:flex; align-items:center; justify-content:center; flex-shrink:0;">
            <i data-lucide="sparkles" style="width:20px; height:20px; color:var(--primary);"></i>
          </div>
          <div style="background:white; padding:14px 18px; border-radius:16px 16px 16px 4px; font-size:0.875rem; color:var(--text); line-height:1.6; box-shadow:var(--shadow-sm); border:1px solid var(--border-light);">
            ${parseMarkdown(response)}
          </div>
        </div>`;
    } catch (e) {
      document.getElementById(loaderId)?.remove();
      VitaHelpers.showToast('Gagal memuat balasan AI.', 'error');
    }
    
    // Mengaktifkan kembali input
    input.disabled = false;
    if (submitBtn) submitBtn.disabled = false;
    setTimeout(() => input.focus(), 100);

    if(typeof lucide !== 'undefined') lucide.createIcons();
    area.scrollTop = area.scrollHeight;
  }

  function init() {
    document.getElementById('cons-menu-btn')?.addEventListener('click', () => {
      document.getElementById('sidebar')?.classList.toggle('open');
      document.getElementById('sidebar-overlay')?.classList.toggle('hidden');
    });
    document.getElementById('chat-form')?.addEventListener('submit', (e) => { e.preventDefault(); send(); });
  }

  return { render, init, send };
})();