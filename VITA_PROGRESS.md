# VITA Project — Progress & Continuation Guide

## Status Pengerjaan

### ✅ SELESAI
| File | Deskripsi |
|------|-----------|
| `index.html` | SPA shell — semua navigation, layout, script imports |
| `css/app.css` | Complete design system — splash, landing, auth, dashboard, scanner, chat, dll |
| `js/firebase-config.js` | Firebase init — **PERLU diisi API key oleh user** |
| `js/store.js` | Reactive state store (VitaStore) |
| `code_ino/cam.ino` | ESP32-CAM firmware (existing) |
| `js/utils/helpers.js` | Utility functions (toast, formatters, calculators) |
| `js/utils/charts.js` | Chart.js wrappers untuk visualisasi data |
| `js/services/firestore.js` | CRUD Firestore (Users, Meals, Risk) |
| `js/services/risk-calculator.js`| Core engine risiko metabolik (SLR evidence-based) |
| `js/services/ai-service.js` | Integrasi Gemini API untuk Chatbot |
| `js/services/esp32-service.js`| Integrasi stream/capture IP ESP32-CAM |
| `js/pages/landing.js` | Landing page dengan fitur Demo Mode |
| `js/pages/auth-pages.js` | Flow autentikasi (Login, Register, Forgot) |
| `js/pages/onboarding.js` | Wizard personalisasi data 4 langkah |
| `js/pages/dashboard.js` | Main dashboard dengan metrics count-up & charts |
| `js/pages/scanner.js` | AI Food Scanner via ESP32-CAM Stream |
| `js/pages/nutrition.js` | UI pelacakan nutrisi makro harian |
| `js/pages/history.js` | Visualisasi tren riwayat nutrisi (Chart) |
| `js/pages/risk.js` | Visualisasi risiko (Radar chart & Cards) |
| `js/pages/consultant.js` | Antarmuka obrolan dengan VITA AI |
| `js/pages/profile.js` | Halaman pengaturan profil dan perangkat |
| `js/auth.js` | Firebase Auth Wrapper |
| `js/router.js` | Hash-based SPA Router engine |
| `js/app.js` | Global App Entry Point |
| `firestore.rules` | Security rules Firestore untuk proteksi data |

### ⏳ TAHAP SELANJUTNYA (Opsional / Penyempurnaan)

**Tahap 1 — Utils & Services (SELESAI):**
- [x] `js/utils/helpers.js` — toast, modal, format functions
- [x] `js/utils/charts.js` — Chart.js wrappers (donut, radar, line, bar)
- [x] `js/services/firestore.js` — Firebase CRUD operations
- [x] `js/services/risk-calculator.js` — evidence-based risk score engine
- [x] `js/services/ai-service.js` — Gemini API integration
- [x] `js/services/esp32-service.js` — ESP32-CAM connection & analysis

**Tahap 2 — Pages (SELESAI):**
- [x] `js/pages/*` — Seluruh halaman UI SPA rampung.

**Tahap 3 — Core Logic (SELESAI):**
- [x] `js/auth.js`
- [x] `js/router.js`
- [x] `js/app.js` 

**Tahap 4 — Config & Deploy (SELESAI):**
- [x] `firestore.rules` — Firestore security rules
- [x] Update `firebase.json` — add firestore rules config

---

## Setup yang Dibutuhkan User

### 1. Firebase Web Config
Buka [Firebase Console](https://console.firebase.google.com) → Project `vita-id` → Project Settings → General → Your apps → Add Web App

Isi di `js/firebase-config.js`:
```javascript
apiKey: "ISI_INI",
messagingSenderId: "ISI_INI",
appId: "ISI_INI"
```

### 2. Gemini API Key (untuk AI Konsultan)
Buka [Google AI Studio](https://aistudio.google.com/) → Get API Key

Isi di `js/store.js`:
```javascript
geminiApiKey: 'ISI_API_KEY_GEMINI_DI_SINI'
```

### 3. ESP32-CAM
Pastikan:
- Device sudah terconnect ke WiFi "Vita Station"
- Catat IP address yang muncul di Serial Monitor
- Masukkan IP address saat onboarding atau di halaman Profile

---

## Informasi Project

| Item | Value |
|------|-------|
| Firebase Project | vita-id |
| RTDB URL | vita-id-default-rtdb.asia-southeast1.firebasedatabase.app |
| GitHub | https://github.com/MrGengs/Vita.git |
| ESP32 Device ID | Vita-005 |
| ESP32 Stream | `http://<IP>/stream` |
| ESP32 Capture | `http://<IP>/capture` |

---

## Arsitektur

```
VITA SPA
├── index.html (shell)
├── css/app.css (design system)
└── js/
    ├── firebase-config.js
    ├── store.js (VitaStore global state)
    ├── utils/ (helpers, charts)
    ├── services/ (firestore, nutrition-db, risk-calc, ai, esp32)
    ├── pages/ (each page = render() + init())
    ├── auth.js (VitaAuth)
    ├── router.js (VitaRouter)
    └── app.js ← ENTRY POINT (load last)
```

## Cara Melanjutkan dengan Claude Code

Buka Claude Code di project directory ini, lalu ketik:
```
Lanjutkan pembuatan VITA SPA. Baca memory files untuk context lengkap dan continuation guide, lalu lanjutkan dari Tahap 1 (utils & services).
```
