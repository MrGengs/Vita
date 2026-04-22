// VITA — Main Application Entry Point
document.addEventListener('DOMContentLoaded', async () => {

  // 1. Inisialisasi State Store Global
  if (typeof VitaStore !== 'undefined') {
    VitaStore.init();
  }

  // 2. Pantau Perubahan Status Autentikasi User (Firebase)
  if (typeof VitaAuth !== 'undefined') {
    VitaAuth.onAuthChange(async (user) => {
      if (user) {
        VitaStore.set('user', user);

        // Ambil profil jika firestore.js sudah dimuat
        if (typeof VitaFirestore !== 'undefined') {
          try {
            const profile = await VitaFirestore.getUserProfile(user.uid);
            const PUBLIC_PAGES = ['', 'login', 'register', 'forgot-password'];

            if (profile) {
              VitaStore.set('profile', profile);
              _updateSidebarUser(profile);

              if (!profile.onboardingComplete) {
                if (typeof VitaRouter !== 'undefined') VitaRouter.navigate('onboarding');
                return;
              }

              // Onboarding selesai — restore halaman sebelum refresh, atau ke dashboard
              const currentHash    = window.location.hash.replace('#', '') || '';
              const savedRedirect  = sessionStorage.getItem('vita_redirect_after_auth');
              if (savedRedirect) {
                sessionStorage.removeItem('vita_redirect_after_auth');
                if (typeof VitaRouter !== 'undefined') VitaRouter.navigate(savedRedirect);
                return;
              }
              if (PUBLIC_PAGES.includes(currentHash)) {
                if (typeof VitaRouter !== 'undefined') VitaRouter.navigate('dashboard');
                return;
              }
            } else {
              // Profil belum ada sama sekali → onboarding
              if (typeof VitaRouter !== 'undefined') VitaRouter.navigate('onboarding');
              return;
            }
          } catch (err) {
            console.error('[VITA] Error memuat profil Firestore (Kemungkinan Security Rules):', err);
            if (typeof VitaHelpers !== 'undefined') {
              VitaHelpers.showToast('Gagal memuat profil. Mohon periksa Firestore Security Rules Anda (Missing or insufficient permissions).', 'error');
            }
          }
        }
      } else {
        // Jangan hapus state jika sedang dalam Mode Demo
        if (!VitaStore.get('demoMode')) {
          VitaStore.set('user', null);
          VitaStore.set('profile', null);
        }
      }

      // Segarkan ulang rute setelah status autentikasi diketahui
      if (typeof VitaRouter !== 'undefined') VitaRouter.handleRoute();
    });
  }

  // 3. Mulai Router
  if (typeof VitaRouter !== 'undefined') {
    VitaRouter.init();
  } else {
    console.error('[VITA] Router gagal dimuat. Pastikan router.js ada di index.html sebelum app.js.');
  }

  // 4. Event Listener Global: Sidebar Overlay (Tutup Sidebar klik di luar area)
  document.getElementById('sidebar-overlay')?.addEventListener('click', function () {
    document.getElementById('sidebar')?.classList.remove('open');
    this.classList.add('hidden');
  });

  // 5. Sidebar: Tombol Toggle (X)
  document.getElementById('sidebar-toggle')?.addEventListener('click', () => {
    document.getElementById('sidebar')?.classList.remove('open');
    document.getElementById('sidebar-overlay')?.classList.add('hidden');
  });

  // 6. Sidebar: Tombol Logout Global
  document.getElementById('logout-btn')?.addEventListener('click', async () => {
    if (VitaStore.get('demoMode')) {
      VitaStore.set('demoMode', false);
      VitaStore.set('profile', null);
      VitaStore.set('user', null);
      document.getElementById('sidebar')?.classList.add('hidden');
      document.getElementById('bottom-nav')?.classList.add('hidden');
      if (typeof VitaRouter !== 'undefined') VitaRouter.navigate('login');
      return;
    }
    if (typeof VitaAuth !== 'undefined') {
      await VitaAuth.signOut();
      document.getElementById('sidebar')?.classList.add('hidden');
      document.getElementById('bottom-nav')?.classList.add('hidden');
      if (typeof VitaRouter !== 'undefined') VitaRouter.navigate('login');
    }
  });

  // 7. Sidebar: Klik link nav → tutup sidebar di mobile
  document.querySelectorAll('.sidebar-nav a, .sidebar-footer a').forEach(link => {
    link.addEventListener('click', () => {
      document.getElementById('sidebar')?.classList.remove('open');
      document.getElementById('sidebar-overlay')?.classList.add('hidden');
    });
  });
});

// Helper: Update info user di sidebar
function _updateSidebarUser(profile) {
  const nameEl   = document.getElementById('sidebar-name');
  const goalEl   = document.getElementById('sidebar-goal');
  const avatarEl = document.getElementById('sidebar-avatar');
  if (nameEl)   nameEl.textContent   = profile.name || 'Pengguna';
  if (goalEl)   goalEl.textContent   = (profile.goals && profile.goals[0]) || 'Menjaga Kesehatan';
  if (avatarEl && typeof VitaHelpers !== 'undefined')
    avatarEl.textContent = VitaHelpers.getInitials(profile.name);
}
