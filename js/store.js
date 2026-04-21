// Global reactive state store for VITA
const VitaStore = (() => {
  const state = {
    user: null,
    profile: null,
    todayMeals: [],
    todayNutrition: { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, sodium: 0, sugar: 0 },
    riskScores: { diabetes: 0, hypertension: 0, obesity: 0, cvd: 0 },
    esp32IP: null,
    isLoading: false,
    currentPage: 'landing',
    onboardingComplete: false,
    geminiApiKey: 'YOUR_GEMINI_API_KEY'
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
        esp32IP: null, isLoading: false, currentPage: 'landing',
        onboardingComplete: false, geminiApiKey: state.geminiApiKey
      };
      state[key] = defaults[key] !== undefined ? defaults[key] : state[key];
    });
  }

  function init() {
    // Muat esp32IP dari localStorage jika tersimpan
    const savedIP = localStorage.getItem('vita_esp32_ip');
    if (savedIP) state.esp32IP = savedIP;

    // Muat geminiApiKey dari localStorage jika tersimpan
    const savedKey = localStorage.getItem('vita_gemini_key');
    if (savedKey) state.geminiApiKey = savedKey;

    // Sinkronkan esp32IP ke localStorage setiap kali berubah
    on('esp32IP', (val) => {
      if (val) localStorage.setItem('vita_esp32_ip', val);
      else localStorage.removeItem('vita_esp32_ip');
    });

    // Sinkronkan geminiApiKey ke localStorage setiap kali berubah
    on('geminiApiKey', (val) => {
      if (val) localStorage.setItem('vita_gemini_key', val);
    });

    console.log('[VitaStore] Initialized');
  }

  return { get, set, on, patch, reset, init };
})();
