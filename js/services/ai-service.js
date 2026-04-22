// VITA — Gemini AI Service
const VitaAI = (() => {
  // Model urutan paling hemat quota → paling kuat, semua support generateContent
  const MODELS = [
    'gemini-2.5-flash-lite',   // Stable Juli 2025, paling ringan, quota terbanyak
    'gemini-2.0-flash-lite',   // Stable, ringan, quota tinggi
    'gemini-2.0-flash',        // Stable, standard
    'gemini-flash-lite-latest',// Alias latest lite
  ];
  const BASE = 'https://generativelanguage.googleapis.com/v1beta/models';

  function buildBody(prompt) {
    return JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { maxOutputTokens: 800, temperature: 0.7 }
    });
  }

  async function ask(userMessage) {
    const keys = VitaStore.get('geminiApiKeys') || [];
    if (!keys.length) {
      return '⚠️ Gemini API Key belum diisi. Tambahkan di file `js/env.js`.';
    }

    const profile = VitaStore.get('profile') || {};
    const risk    = VitaStore.get('riskScores') || {};
    const ctx = `Kamu adalah VITA AI, asisten nutrisi & kesehatan personal. Data pengguna: nama=${profile.name||'?'}, usia=${profile.age||'?'}, gender=${profile.gender||'?'}, BMI=${profile.bmi||'?'}. Risiko: DM=${risk.diabetes||0}%, HT=${risk.hypertension||0}%, OB=${risk.obesity||0}%, CVD=${risk.cvd||0}%. Jawab dalam Bahasa Indonesia, singkat dan ramah.`;

    let keyIdx = VitaStore.get('geminiApiKeyIndex') || 0;
    const totalKeys = keys.length;

    for (const model of MODELS) {
      for (let i = 0; i < totalKeys; i++) {
        const apiKey = keys[keyIdx % totalKeys];
        try {
          const res = await fetch(`${BASE}/${model}:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: buildBody(`${ctx}\n\nPertanyaan: ${userMessage}`),
          });

          if (res.status === 429) {
            keyIdx = (keyIdx + 1) % totalKeys;
            VitaStore.set('geminiApiKeyIndex', keyIdx);
            continue;
          }

          if (res.status === 404 || res.status === 400) {
            break; // Model ini tidak tersedia, coba berikutnya
          }

          if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            console.warn(`[VitaAI] ${model} HTTP ${res.status}:`, err?.error?.message);
            break;
          }

          const data = await res.json();
          const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
          if (text) return text;

        } catch (e) {
          console.error('[VitaAI] Network error:', e);
          return 'Terjadi kesalahan koneksi. Periksa internet Anda dan coba lagi.';
        }
      }
      keyIdx = 0; // Reset index untuk model berikutnya
    }

    return '⏳ Semua API Key sedang mencapai batas quota. Quota Gemini free tier reset setiap hari. Coba lagi nanti atau tambahkan API Key baru di aistudio.google.com.';
  }

  // Untuk analisis gambar (scanner) — butuh model yang support multimodal
  async function analyzeImage(base64Image, mimeType = 'image/jpeg') {
    const keys = VitaStore.get('geminiApiKeys') || [];
    if (!keys.length) return null;

    // Model yang support multimodal (vision)
    const visionModels = [
      'gemini-2.5-flash-lite',
      'gemini-2.0-flash-lite',
      'gemini-2.0-flash',
    ];

    let keyIdx = VitaStore.get('geminiApiKeyIndex') || 0;
    const totalKeys = keys.length;
    const prompt = 'Identifikasi makanan dalam gambar ini. Berikan nama makanan dalam Bahasa Indonesia, estimasi kandungan gizi per porsi normal dalam format JSON: {"name":"...","confidence":0-100,"emoji":"...","nutrition":{"calories":0,"protein":0,"carbs":0,"fat":0,"fiber":0,"sodium":0,"sugar":0}}. Jawab HANYA dengan JSON tanpa markdown.';

    for (const model of visionModels) {
      for (let i = 0; i < totalKeys; i++) {
        const apiKey = keys[keyIdx % totalKeys];
        try {
          const res = await fetch(`${BASE}/${model}:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [
                { text: prompt },
                { inline_data: { mime_type: mimeType, data: base64Image } }
              ]}],
              generationConfig: { maxOutputTokens: 512, temperature: 0.3 }
            }),
          });

          if (res.status === 429) {
            keyIdx = (keyIdx + 1) % totalKeys;
            VitaStore.set('geminiApiKeyIndex', keyIdx);
            continue;
          }
          if (res.status === 404 || res.status === 400) break;
          if (!res.ok) break;

          const data = await res.json();
          const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
          const cleaned = text.replace(/```json?|```/g, '').trim();
          return JSON.parse(cleaned);

        } catch (e) {
          console.warn('[VitaAI] analyzeImage error:', e);
          return null;
        }
      }
      keyIdx = 0;
    }
    return null;
  }

  return { ask, analyzeImage };
})();
