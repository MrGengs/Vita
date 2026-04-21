# VITA — Claude Code / Gemini CLI Project Instructions

## Identitas Project
**VITA** (Visual Intelligence Tracker for Alimentary) adalah SPA penelitian menggunakan ESP32-CAM untuk manajemen metabolisme tubuh: analisis nutrisi makanan via image recognition, prediksi risk factor penyakit metabolik kronik, dan AI konsultan kesehatan.

**Stack:** Pure HTML + CSS + Vanilla JS (NO framework, NO build tools)  
**Backend:** Firebase (Firestore, Auth, Storage, RTDB, Hosting)  
**AI:** Gemini API (google)  
**Hardware:** ESP32-CAM (Device ID: Vita-005)

---

## Infrastruktur

| Item | Value |
|------|-------|
| Firebase Project | `vita-id` |
| Auth Domain | `vita-id.firebaseapp.com` |
| RTDB URL | `https://vita-id-default-rtdb.asia-southeast1.firebasedatabase.app` |
| Storage | `vita-id.appspot.com` |
| GitHub | `https://github.com/MrGengs/Vita.git` |
| Live URL | `https://vita-id.web.app` |
| ESP32 Stream | `http://<IP>/stream` |
| ESP32 Capture | `http://<IP>/capture` |

**⚠️ Firebase Web API Key belum diisi** di `js/firebase-config.js`  
→ Ambil dari Firebase Console → Project `vita-id` → Settings → Your apps → Web app  
**⚠️ Gemini API Key belum diisi** di `js/store.js`  
→ Ambil dari https://aistudio.google.com/

---

## Status File

### ✅ Selesai & Production-Ready
- `index.html` — SPA shell, Lucide Icons CDN, sidebar + bottom nav (Lucide icons)
- `css/app.css` — Design system **White + Blue theme** (v2), Lucide sizing, layered shadows, animasi
- `js/firebase-config.js` — Firebase init (perlu API key diisi)
- `js/store.js` — VitaStore reactive state singleton
- `js/utils/helpers.js` — showToast, formatDate, calculateBMI, getInitials, dll
- `js/utils/charts.js` — Chart wrappers terpusat (createDonut, createLine, createBar, createRadar, destroyAll)
- `js/services/firestore.js` — CRUD Firestore (saveUserProfile, getMealsForDate, dll)
- `js/services/nutrition-db.js` — 25+ makanan Indonesia lokal + calculate()
- `js/services/risk-calculator.js` — Scoring evidence-based SLR (Diabetes, Hipertensi, Obesitas, CVD)
- `js/services/ai-service.js` — Gemini API (analyzeFood, chat dengan profile context)
- `js/services/esp32-service.js` — setIP, getIP, testConnection, getStreamURL, getCaptureURL
- `js/pages/landing.js` — Landing page, hero blue navy, demo mode button
- `js/pages/auth-pages.js` — Login, Register, Forgot Password
- `js/pages/onboarding.js` — 4-step wizard personalisasi (UI wizard lengkap)
- `js/pages/dashboard.js` — **FULL** white+blue, count-up animasi, progress bars, charts
- `js/pages/scanner.js` — ESP32 live stream, capture, Gemini analisis, save meal, demo mode
- `js/pages/risk.js` — 4 risk cards, radar chart, faktor risiko, rekomendasi dinamis
- `js/pages/consultant.js` — Chat UI, integrasi context-aware Gemini AI, history chat
- `js/pages/profile.js` — Hero card, settings sections, ESP32 IP config, logout
- `js/pages/nutrition.js` — Date nav, meal tabs, macro bars, tambah log harian
- `js/pages/history.js` — Filter chips, line chart kalori, daily entries
- `js/auth.js` — VitaAuth (email, Google, signOut, onAuthChange)
- `js/router.js` — Hash router, lucide.createIcons() di setiap render, demo mode guard
- `js/app.js` — Entry point, VitaRouter.init() dipanggil langsung di DOMContentLoaded
- `firestore.rules` — Security rules Firestore untuk isolasi data pengguna

---

## Arsitektur SPA

```
Routing:  Hash-based (#dashboard, #scanner, dll)
State:    VitaStore singleton (global)
Firebase: Compat SDK v10.7.1 via CDN
Charts:   Chart.js v4 via CDN
Icons:    Lucide Icons via unpkg CDN (lucide.createIcons() dipanggil di router)
```

### Routes
| Hash | Page | Auth Required |
|------|------|---------------|
| `` (kosong) | landing | No |
| `#login` | login | No |
| `#register` | register | No |
| `#onboarding` | wizard | Yes |
| `#dashboard` | dashboard utama | Yes |
| `#scanner` | ESP32 food scanner | Yes |
| `#nutrition` | pelacak nutrisi | Yes |
| `#history` | riwayat makan | Yes |
| `#risk` | faktor risiko | Yes |
| `#consultant` | AI chat | Yes |
| `#profile` | profil | Yes |

### Pattern Setiap Page
```javascript
const PageName = (() => {
  function render() { return `<html string>`; }
  function init() { /* setup event listeners, charts */ }
  return { render, init };
})();
```

---

## Design System AKTIF (v2 — White + Blue)

```
Background page  : #F0F6FF
Card surface     : #FFFFFF  |  border: rgba(46,127,191,0.12)
Shadow           : 0 2px 4px rgba(0,0,0,0.04), 0 6px 20px rgba(0,0,0,0.09)
Primary (blue)   : #2E7FBF  |  dark: #1A5F96  |  bg: rgba(46,127,191,0.08)
Secondary (green): #52B847  (success, kalori, makanan)
Topbar           : gradient #0D3B66 → #2E7FBF  (SEMUA halaman pakai ini)
Text             : #1E293B  |  secondary: #64748B  |  light: #94A3B8
Icons            : Lucide, stroke-width 1.75
Font             : Poppins (heading) + Inter (body)
CSS classes utama: .vita-topbar, .vita-card, .vita-stat, .vita-welcome, .vita-menu-btn
```

### Template Topbar (copy-paste di setiap halaman baru)
```javascript
function topbar(name) {
  return `
  <div class="vita-topbar">
    <div class="vita-topbar-left">
      <button class="vita-menu-btn" id="pg-menu-btn"><i data-lucide="menu"></i></button>
      <div class="topbar-brand">
        <svg width="26" height="26" viewBox="0 0 64 64" fill="none">
          <circle cx="32" cy="32" r="32" fill="url(#tGrad)"/>
          <defs><linearGradient id="tGrad" x1="0" y1="0" x2="64" y2="64">
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
      <div class="vita-avatar">${VitaHelpers.getInitials(name)}</div>
    </div>
  </div>`;
}
```

### Page Wrapper Standar
```javascript
function render() {
  const p = VitaStore.get('profile') || {};
  return `
  <div class="dash-bg">
    <div class="dash-orb dash-orb-1"></div>
    <div class="dash-orb dash-orb-2"></div>
    ${topbar(p.name || 'Pengguna')}
    <div class="dash-content">
      <!-- konten halaman di sini -->
      <div class="dash-bottom-spacer"></div>
    </div>
  </div>`;
}
```

---

## Firestore Schema

```
users/{userId}
  profile: { name, age, gender, height, weight, waist, bmi, goals[], conditions[], dietaryPref, esp32IP, onboardingComplete }

meals/{userId}/logs/{mealId}
  { timestamp, mealType, foods[{name,portion,nutrition}], totalNutrition{calories,protein,carbs,fat,fiber,sodium,sugar}, source, imageUrl }

risk_assessments/{userId}/history/{assessmentId}
  { timestamp, scores{diabetes,hypertension,obesity,cvd}, levels, factors[], recommendations[] }

ai_sessions/{userId}/conversations/{sessionId}
  { messages[{role,content,timestamp}] }
```

---

## Risk Calculator Algorithm (Evidence-Based SLR)

Berdasarkan 12 literatur ilmiah:

| Penyakit | Nutrient Utama | Threshold HIGH |
|----------|---------------|----------------|
| Diabetes T2 | Glycemic Load, Added Sugar, Fiber | GL>180/day, Sugar>20% cal, Fiber<15g |
| Hipertensi | Sodium, Kalium | Na>2300mg, K:Na<0.8 |
| Obesitas | Total Kalori, Ultra-processed % | Cal>2500 (male), processed>40% |
| CVD | Trans Fat, Saturated Fat, Omega-3 | Trans>0, SatFat>10% cal |

Score 0-100: LOW <25, MODERATE 25-55, HIGH >55

---

## Cara Melanjutkan (Tool Apapun)

1. Baca file ini (CLAUDE.md) — semua konteks ada di sini
2. Pembangunan UI SPA Core sudah SELESAI 100%.
3. Tahap selanjutnya adalah Debugging/Testing fungsional, dan penyesuaian firmware ESP32-CAM (`cam.ino`) jika diperlukan.
4. Untuk Deployment: `firebase deploy --only hosting`

## Preferensi & Aturan Kode

- **Bahasa UI:** Indonesia
- **NO comments** kecuali WHY yang non-obvious
- **No framework, no build tools** — pure vanilla JS
- **Mobile-first** — sidebar hidden on mobile, bottom nav muncul
- **Demo mode:** VitaStore.get('demoMode') → pakai DEMO data, bypass Firebase
- **Setiap halaman baru:** render() → init() → return { render, init }
- **Charts:** panggil di requestAnimationFrame() dalam init()
- **Lucide:** gunakan `<i data-lucide="nama">` — router.js sudah panggil lucide.createIcons()
