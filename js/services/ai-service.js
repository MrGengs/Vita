// VITA — Gemini AI Service (stub)
const VitaAI = (() => {
  const GEMINI_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

  async function ask(userMessage) {
    const apiKey = VitaStore.get('geminiApiKey');
    if (!apiKey || apiKey === 'YOUR_GEMINI_API_KEY') return 'Silakan konfigurasi Gemini API Key di halaman Profil → Pengaturan untuk menggunakan fitur AI Konsultan.';
    const profile = VitaStore.get('profile') || {};
    const risk = VitaStore.get('riskScores') || {};
    const systemCtx = `Kamu adalah VITA AI, asisten nutrisi dan kesehatan personal yang ahli. Profil pengguna: ${JSON.stringify(profile)}. Risk scores: Diabetes ${risk.diabetes||0}%, Hipertensi ${risk.hypertension||0}%, Obesitas ${risk.obesity||0}%, CVD ${risk.cvd||0}%. Jawab dalam Bahasa Indonesia yang ramah, singkat, dan berbasis sains.`;
    try {
      const res = await fetch(`${GEMINI_URL}?key=${apiKey}`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: `${systemCtx}\n\nPengguna: ${userMessage}` }] }] })
      });
      const data = await res.json();
      return data.candidates?.[0]?.content?.parts?.[0]?.text || 'Maaf, tidak dapat memproses permintaan saat ini.';
    } catch (e) { return 'Maaf, terjadi kesalahan koneksi. Periksa koneksi internet Anda.'; }
  }

  return { ask };
})();
