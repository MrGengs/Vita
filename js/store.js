// Global reactive state store for VITA
const VitaStore = (() => {
  const state = {
    user: null,
    profile: null,
    todayMeals: [],
    todayNutrition: { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, sodium: 0, sugar: 0 },
    riskScores: { diabetes: 0, hypertension: 0, obesity: 0, cvd: 0 },
    riskAssessment: null,
    esp32IP: null,
    isLoading: false,
    currentPage: 'landing',
    onboardingComplete: false,
    demoMode: false,
    waterToday: 0,
    geminiApiKeys: (window.__VITA_ENV__ && window.__VITA_ENV__.GEMINI_API_KEYS) || [],
    geminiApiKeyIndex: 0
  };

  const listeners = {};

  function get(key) {
    return key ? state[key] : { ...state };
  }

  function set(key, value) {
    const old = state[key];
    state[key] = value;
    if (listeners[key]) {
      listeners[key].forEach(fn => fn(value, old));
    }
    if (listeners['*']) {
      listeners['*'].forEach(fn => fn({ key, value, old }));
    }
  }

  function on(key, fn) {
    if (!listeners[key]) listeners[key] = [];
    listeners[key].push(fn);
    return () => {
      listeners[key] = listeners[key].filter(f => f !== fn);
    };
  }

  function patch(key, partial) {
    set(key, { ...state[key], ...partial });
  }

  function reset() {
    Object.keys(state).forEach(key => {
      const defaults = {
        user: null, profile: null, todayMeals: [],
        todayNutrition: { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, sodium: 0, sugar: 0 },
        riskScores: { diabetes: 0, hypertension: 0, obesity: 0, cvd: 0 },
        riskAssessment: null,
        esp32IP: null, isLoading: false, currentPage: 'landing',
        onboardingComplete: false, demoMode: false, waterToday: 0,
        geminiApiKeys: state.geminiApiKeys, geminiApiKeyIndex: 0
      };
      state[key] = defaults[key] !== undefined ? defaults[key] : state[key];
    });
  }

  function init() {
    // Muat esp32IP dari localStorage jika tersimpan
    const savedIP = localStorage.getItem('vita_esp32_ip');
    if (savedIP) state.esp32IP = savedIP;

    // Muat geminiApiKeyIndex
    const savedIndex = localStorage.getItem('vita_gemini_key_index');
    if (savedIndex) state.geminiApiKeyIndex = parseInt(savedIndex) || 0;

    // Sinkronkan esp32IP ke localStorage setiap kali berubah
    on('esp32IP', (val) => {
      if (val) localStorage.setItem('vita_esp32_ip', val);
      else localStorage.removeItem('vita_esp32_ip');
    });

    // Sinkronkan geminiApiKeyIndex ke localStorage setiap kali berubah
    on('geminiApiKeyIndex', (val) => {
      localStorage.setItem('vita_gemini_key_index', val);
    });

    console.log('[VitaStore] Initialized');
  }

  return { get, set, on, patch, reset, init };
})();
