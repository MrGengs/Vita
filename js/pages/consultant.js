// VITA — AI Consultant Page
const ConsultantPage = (() => {

  let chatHistory = [];

  function topbar(name) {
    return `
    <div class="vita-topbar" style="border-bottom:none;">
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
        <button class="vita-icon-btn" onclick="window.location.hash='dashboard'">
          <i data-lucide="x"></i>
        </button>
      </div>
    </div>`;
  }

  function render() {
    const p    = VitaStore.get('profile') || {};
    const risk = VitaStore.get('riskScores') || { diabetes: 28, hypertension: 42, obesity: 19, cvd: 33 };
    const highestRisk = Object.keys(risk).reduce((a, b) => risk[a] > risk[b] ? a : b, 'diabetes');
    const riskNames   = { diabetes: 'Diabetes', hypertension: 'Hipertensi', obesity: 'Obesitas', cvd: 'Penyakit Jantung' };

    chatHistory = [];

    const CHIPS = ['Saran sarapan sehat', 'Cara kurangi sodium?', 'Jelaskan risiko saya'];

    return `
    <div class="chat-page-wrap">
      ${topbar(p.name || 'Pengguna')}

      <!-- Context Bar -->
      <div class="chat-context-bar">
        <div class="chat-context-item">
          <i data-lucide="scale" style="width:13px;height:13px;opacity:0.75;"></i>
          BMI <strong>${p.bmi ? p.bmi.toFixed(1) : '24.9'}</strong>
        </div>
        <div class="chat-context-sep"></div>
        <div class="chat-context-item">
          <i data-lucide="alert-triangle" style="width:13px;height:13px;opacity:0.75;"></i>
          Perhatian: <strong>${riskNames[highestRisk] || '—'}</strong>
        </div>
        <div class="chat-context-sep"></div>
        <div class="chat-context-item">
          <i data-lucide="sparkles" style="width:13px;height:13px;opacity:0.75;"></i>
          Gemini AI
        </div>
      </div>

      <!-- Chat Area -->
      <div id="chat-area" class="chat-area">
        <div class="chat-bubble-row ai">
          <div class="chat-avatar ai-avatar">
            <i data-lucide="bot" style="width:18px;height:18px;color:var(--primary);"></i>
          </div>
          <div class="chat-bubble ai-bubble">
            Halo <strong>${p.name || 'Pengguna'}</strong>! Saya <strong>VITA AI</strong> 🤖<br><br>
            Saya bisa merekomendasikan menu, mengevaluasi pola makan, atau menjelaskan risiko metabolisme Anda. Ada yang ingin ditanyakan?
          </div>
        </div>
      </div>

      <!-- Input Area -->
      <div class="chat-input-area">
        <div class="chat-chips" id="chat-suggestions">
          ${CHIPS.map(chip => `
            <button class="chat-chip" onclick="ConsultantPage.send('${chip}')">${chip}</button>
          `).join('')}
        </div>
        <form id="chat-form" class="chat-form">
          <input type="text" id="chat-input" class="chat-input"
            placeholder="Tanya tentang diet &amp; kesehatan..." autocomplete="off">
          <button type="submit" class="chat-send-btn">
            <i data-lucide="send" style="width:18px;height:18px;"></i>
          </button>
        </form>
      </div>
    </div>`;
  }

  function parseMarkdown(text) {
    let f = text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/(?<!\*)\*(?!\*)(.*?)(?<!\*)\*(?!\*)/g, '<em>$1</em>')
      .replace(/\n/g, '<br>');
    f = f.replace(/(?:<br>|^)\s*[-*]\s+(.*?)(?=(?:<br>|$))/g, '<li style="margin-bottom:4px;">$1</li>');
    f = f.replace(/(<li.*?>.*?<\/li>)+/g, '<ul style="margin:8px 0;padding-left:20px;">$&</ul>');
    return f;
  }

  async function send(textStr) {
    const input     = document.getElementById('chat-input');
    const area      = document.getElementById('chat-area');
    const submitBtn = document.querySelector('#chat-form button');
    if (!input || !area) return;

    const msg = typeof textStr === 'string' ? textStr : input.value.trim();
    if (!msg) return;

    input.value   = '';
    input.disabled = true;
    if (submitBtn) submitBtn.disabled = true;

    const suggestEl = document.getElementById('chat-suggestions');
    if (suggestEl) suggestEl.style.display = 'none';

    chatHistory.push(`Pengguna: ${msg}`);

    // User bubble
    area.innerHTML += `
      <div class="chat-bubble-row user">
        <div class="chat-bubble user-bubble">${msg}</div>
      </div>`;
    area.scrollTop = area.scrollHeight;

    // AI loading
    const loaderId = 'ai-load-' + Date.now();
    area.innerHTML += `
      <div id="${loaderId}" class="chat-bubble-row ai">
        <div class="chat-avatar ai-avatar">
          <i data-lucide="bot" style="width:18px;height:18px;color:var(--primary);"></i>
        </div>
        <div class="chat-bubble ai-bubble chat-typing">
          <span></span><span></span><span></span>
        </div>
      </div>`;
    if (typeof lucide !== 'undefined') lucide.createIcons();
    area.scrollTop = area.scrollHeight;

    try {
      const response = await window.VitaAI.ask(chatHistory.join('\n\n'));
      chatHistory.push(`VITA AI: ${response}`);
      document.getElementById(loaderId)?.remove();

      area.innerHTML += `
        <div class="chat-bubble-row ai">
          <div class="chat-avatar ai-avatar">
            <i data-lucide="sparkles" style="width:18px;height:18px;color:var(--primary);"></i>
          </div>
          <div class="chat-bubble ai-bubble">${parseMarkdown(response)}</div>
        </div>`;
    } catch {
      document.getElementById(loaderId)?.remove();
      VitaHelpers.showToast('Gagal memuat balasan AI.', 'error');
    }

    input.disabled = false;
    if (submitBtn) submitBtn.disabled = false;
    setTimeout(() => input.focus(), 100);
    if (typeof lucide !== 'undefined') lucide.createIcons();
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
