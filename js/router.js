// VITA — Hash-based SPA Router
const VitaRouter = (() => {

  // Registrasi semua halaman — page di-resolve secara lazy saat handleRoute()
  // agar semua script halaman sudah ter-load terlebih dahulu
  const routeDefs = {
    '':           { pageKey: 'LandingPage',        auth: false },
    'login':      { pageKey: 'AuthPages.Login',    auth: false },
    'register':   { pageKey: 'AuthPages.Register', auth: false },
    'onboarding': { pageKey: 'OnboardingPage',     auth: true  },
    'dashboard':  { pageKey: 'DashboardPage',      auth: true  },
    'scanner':    { pageKey: 'ScannerPage',        auth: true  },
    'nutrition':  { pageKey: 'NutritionPage',      auth: true  },
    'history':    { pageKey: 'HistoryPage',        auth: true  },
    'risk':       { pageKey: 'RiskPage',           auth: true  },
    'consultant': { pageKey: 'ConsultantPage',     auth: true  },
    'profile':    { pageKey: 'ProfilePage',        auth: true  }
  };

  // Resolve page object dari window secara lazy (support dot-notation: 'AuthPages.Login')
  function resolvePage(pageKey) {
    if (!pageKey) return null;
    return pageKey.split('.').reduce(
      (obj, k) => (obj && typeof obj === 'object' ? obj[k] : null),
      window
    );
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

        // Tampilkan navigasi hanya jika sudah login / mode demo
        const loggedIn = !!user || isDemo;
        document.getElementById('sidebar')?.classList.toggle('hidden', !loggedIn);
        document.getElementById('bottom-nav')?.classList.toggle('hidden', !loggedIn);

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
