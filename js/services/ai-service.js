// VITA — Gemini AI Service (stub)
const VitaAI = (() => {
  const GEMINI_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

  async function ask(userMessage) {
    const keys = VitaStore.get('geminiApiKeys') || [];
    let keyIdx = VitaStore.get('geminiApiKeyIndex') || 0;
    
    if (!keys || keys.length === 0) return 'Silakan konfigurasi Gemini API Key di environment variables.';

    const profile = VitaStore.get('profile') || {};
    const risk = VitaStore.get('riskScores') || {};
    const systemCtx = `Kamu adalah VITA AI, asisten nutrisi dan kesehatan personal yang ahli. Profil pengguna: ${JSON.stringify(profile)}. Risk scores: Diabetes ${risk.diabetes||0}%, Hipertensi ${risk.hypertension||0}%, Obesitas ${risk.obesity||0}%, CVD ${risk.cvd||0}%. Jawab dalam Bahasa Indonesia yang ramah, singkat, dan berbasis sains.`;
    
    let attempts = 0;
    while (attempts < keys.length) {
      const apiKey = keys[keyIdx % keys.length];
      try {
        const res = await fetch(`${GEMINI_URL}?key=${apiKey}`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contents: [{ parts: [{ text: `${systemCtx}\n\nPengguna: ${userMessage}` }] }] })
        });
        
        if (res.status === 429 || res.status === 403) {
          keyIdx++;
          VitaStore.set('geminiApiKeyIndex', keyIdx);
          attempts++;
          continue; // coba dengan API key berikutnya
        }

        const data = await res.json();
        return data.candidates?.[0]?.content?.parts?.[0]?.text || 'Maaf, tidak dapat memproses permintaan saat ini.';
      } catch (e) { 
        return 'Maaf, terjadi kesalahan koneksi. Periksa koneksi internet Anda.'; 
      }
    }
    
    return 'Maaf, semua API Key Gemini sedang limit/tidak aktif. Coba lagi nanti.';
  }

  return { ask };
})();
