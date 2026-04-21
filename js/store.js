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

  return { get, set, on, patch };
})();
