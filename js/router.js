// VITA — Hash-based SPA Router
const VitaRouter = (() => {
  
  // Registrasi semua halaman dan kebutuhan autentikasinya
  const routes = {
    '': { page: typeof LandingPage !== 'undefined' ? LandingPage : null, auth: false },
    'login': { page: typeof AuthPages !== 'undefined' ? AuthPages.Login : null, auth: false },
    'register': { page: typeof AuthPages !== 'undefined' ? AuthPages.Register : null, auth: false },
    'onboarding': { page: typeof OnboardingPage !== 'undefined' ? OnboardingPage : null, auth: true },
    'dashboard': { page: typeof DashboardPage !== 'undefined' ? DashboardPage : null, auth: true },
    'scanner': { page: typeof ScannerPage !== 'undefined' ? ScannerPage : null, auth: true },
    'nutrition': { page: typeof NutritionPage !== 'undefined' ? NutritionPage : null, auth: true },
    'history': { page: typeof HistoryPage !== 'undefined' ? HistoryPage : null, auth: true },
    'risk': { page: typeof RiskPage !== 'undefined' ? RiskPage : null, auth: true },
    'consultant': { page: typeof ConsultantPage !== 'undefined' ? ConsultantPage : null, auth: true },
    'profile': { page: typeof ProfilePage !== 'undefined' ? ProfilePage : null, auth: true }
  };

  function navigate(path) {
    window.location.hash = path;
  }

  function handleRoute() {
    let hash = window.location.hash.replace('#', '') || '';
    let route = routes[hash];

    // Fallback jika URL tidak valid
    if (!route) {
      hash = '';
      route = routes[''];
    }

    const isDemo = VitaStore?.get('demoMode') || false;
    const user = VitaStore?.get('user');

    // Auth Guard: Jika halaman butuh login & user belum login & tidak dalam mode demo
    if (route.auth && !user && !isDemo) {
      navigate('login');
      return;
    }

    // Bersihkan semua chart sebelum meninggalkan halaman agar tidak memory leak
    if (typeof VitaCharts !== 'undefined') {
      VitaCharts.destroyAll();
    }

    const appDiv = document.getElementById('app');
    if (!appDiv) return;

    if (route.page && typeof route.page.render === 'function') {
      // Transisi Fade Out
      appDiv.style.opacity = '0';
      
      setTimeout(() => {
        // Render HTML halaman
        appDiv.innerHTML = route.page.render();
        
        // Jalankan logic halaman (charts, event listeners)
        if (typeof route.page.init === 'function') {
          route.page.init();
        }

        // Konversi <i data-lucide="..."> menjadi SVG
        if (typeof lucide !== 'undefined') lucide.createIcons();
        
        // Sorot menu aktif di Sidebar & Bottom Nav
        document.querySelectorAll('.sidebar-nav a, .bottom-nav a').forEach(el => {
          el.classList.remove('active');
          if (el.getAttribute('href') === `#${hash}`) el.classList.add('active');
        });

        // Transisi Fade In
        appDiv.style.opacity = '1';
        appDiv.style.transition = 'opacity 0.2s ease-in-out';
        
        // Otomatis tutup sidebar overlay pada mobile setiap pindah halaman
        document.getElementById('sidebar')?.classList.remove('open');
        document.getElementById('sidebar-overlay')?.classList.add('hidden');
      }, 150);

    } else {
      // Halaman stub / belum terimplementasi
      appDiv.innerHTML = `<div style="text-align:center;padding:100px 20px;"><h2>🚧 Halaman Dalam Perbaikan</h2><p style="color:var(--text-secondary);margin-top:12px;">Halaman ${hash} sedang dibangun.</p><button onclick="window.history.back()" class="btn btn-primary" style="margin-top:20px;">Kembali</button></div>`;
      appDiv.style.opacity = '1';
      if (typeof lucide !== 'undefined') lucide.createIcons();
    }
  }

  function init() {
    window.addEventListener('hashchange', handleRoute);
    handleRoute(); // Load inisial
  }

  return { init, navigate, handleRoute };
})();