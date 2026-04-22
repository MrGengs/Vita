// VITA — Hash-based SPA Router
const VitaRouter = (() => {

  // Registrasi semua halaman — page di-resolve secara lazy saat handleRoute()
  // agar semua script halaman sudah ter-load terlebih dahulu
  const routeDefs = {
    '':           { pageKey: 'LandingPage',        auth: false },
    'login':            { pageKey: 'AuthPages.Login',           auth: false },
    'register':         { pageKey: 'AuthPages.Register',        auth: false },
    'forgot-password':  { pageKey: 'AuthPages.ForgotPassword',  auth: false },
    'onboarding': { pageKey: 'OnboardingPage',     auth: true  },
    'dashboard':  { pageKey: 'DashboardPage',      auth: true  },
    'scanner':    { pageKey: 'ScannerPage',        auth: true  },
    'nutrition':  { pageKey: 'NutritionPage',      auth: true  },
    'history':    { pageKey: 'HistoryPage',        auth: true  },
    'risk':       { pageKey: 'RiskPage',           auth: true  },
    'consultant': { pageKey: 'ConsultantPage',     auth: true  },
    'profile':    { pageKey: 'ProfilePage',        auth: true  }
  };

  // Resolve page object secara manual karena const tidak otomatis masuk ke window
  function resolvePage(pageKey) {
    if (!pageKey) return null;
    
    const registry = {
      LandingPage: typeof LandingPage !== 'undefined' ? LandingPage : null,
      AuthPages: typeof AuthPages !== 'undefined' ? AuthPages : null,
      OnboardingPage: typeof OnboardingPage !== 'undefined' ? OnboardingPage : null,
      DashboardPage: typeof DashboardPage !== 'undefined' ? DashboardPage : null,
      ScannerPage: typeof ScannerPage !== 'undefined' ? ScannerPage : null,
      NutritionPage: typeof NutritionPage !== 'undefined' ? NutritionPage : null,
      HistoryPage: typeof HistoryPage !== 'undefined' ? HistoryPage : null,
      RiskPage: typeof RiskPage !== 'undefined' ? RiskPage : null,
      ConsultantPage: typeof ConsultantPage !== 'undefined' ? ConsultantPage : null,
      ProfilePage: typeof ProfilePage !== 'undefined' ? ProfilePage : null
    };

    const parts = pageKey.split('.');
    let result = registry[parts[0]] || window[parts[0]];
    
    for (let i = 1; i < parts.length; i++) {
      if (result == null || typeof result !== 'object') { result = null; break; }
      result = result[parts[i]];
    }
    return result;
  }

  function navigate(path) {
    window.location.hash = path;
  }

  function handleRoute() {
    let hash = window.location.hash.replace('#', '') || '';
    let def  = routeDefs[hash];

    // Fallback jika hash tidak dikenal
    if (!def) {
      hash = '';
      def  = routeDefs[''];
    }

    const isDemo = VitaStore?.get('demoMode') || false;
    const user   = VitaStore?.get('user');

    // Auth Guard: halaman butuh login & user belum login & bukan mode demo
    if (def.auth && !user && !isDemo) {
      // Simpan tujuan asal agar bisa di-restore setelah login/auth selesai
      if (hash && hash !== 'login') {
        sessionStorage.setItem('vita_redirect_after_auth', hash);
      }
      navigate('login');
      return;
    }

    // Bersihkan semua chart agar tidak memory leak
    if (typeof VitaCharts !== 'undefined') VitaCharts.destroyAll();

    // Resolve page object secara lazy
    const page   = resolvePage(def.pageKey);
    const appDiv = document.getElementById('main-content');

    if (!appDiv) {
      console.error('[VitaRouter] Elemen #main-content tidak ditemukan di DOM.');
      return;
    }

    if (page && typeof page.render === 'function') {
      // Transisi Fade Out
      appDiv.style.opacity = '0';

      setTimeout(() => {
        // Render HTML halaman
        appDiv.innerHTML = page.render();

        // Jalankan logic halaman (charts, event listeners, dll)
        if (typeof page.init === 'function') page.init();

        // Konversi <i data-lucide="..."> menjadi SVG
        if (typeof lucide !== 'undefined') lucide.createIcons();

        // Sorot menu aktif di Sidebar & Bottom Nav
        document.querySelectorAll('.sidebar-nav a, .bottom-nav a').forEach(el => {
          el.classList.remove('active');
          if (el.getAttribute('href') === `#${hash}`) el.classList.add('active');
        });

        // Tampilkan navigasi hanya di halaman app (bukan landing/auth)
        const PUBLIC_PAGES = ['', 'login', 'register', 'forgot-password'];
        const isAppPage = !PUBLIC_PAGES.includes(hash);
        const showNav = isAppPage && (!!user || isDemo);
        document.getElementById('sidebar')?.classList.toggle('hidden', !showNav);
        document.getElementById('bottom-nav')?.classList.toggle('hidden', !showNav);
        // Desktop: geser konten utama ke kanan sejauh lebar sidebar
        appDiv.classList.toggle('with-sidebar', showNav);

        // Transisi Fade In
        appDiv.style.opacity = '1';
        appDiv.style.transition = 'opacity 0.2s ease-in-out';

        // Tutup sidebar overlay pada mobile setiap pindah halaman
        document.getElementById('sidebar')?.classList.remove('open');
        document.getElementById('sidebar-overlay')?.classList.add('hidden');

        // Sembunyikan splash screen
        const splash = document.getElementById('app-loading');
        if (splash) splash.style.display = 'none';

      }, 150);

    } else {
      // Halaman stub / belum terimplementasi
      appDiv.innerHTML = `
        <div style="text-align:center;padding:100px 20px;">
          <h2>🚧 Halaman Dalam Perbaikan</h2>
          <p style="color:var(--text-secondary);margin-top:12px;">
            Halaman <b>${hash || 'ini'}</b> sedang dibangun.
          </p>
          <button onclick="window.history.back()" class="btn btn-primary" style="margin-top:20px;">
            Kembali
          </button>
        </div>`;
      appDiv.style.opacity = '1';
      if (typeof lucide !== 'undefined') lucide.createIcons();

      // Sembunyikan splash screen
      const splash = document.getElementById('app-loading');
      if (splash) splash.style.display = 'none';
    }
  }

  function init() {
    window.addEventListener('hashchange', handleRoute);
    handleRoute(); // Load halaman pertama
  }

  return { init, navigate, handleRoute };
})();
