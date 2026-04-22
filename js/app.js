// VITA — Main Application Entry Point
document.addEventListener('DOMContentLoaded', async () => {

  // 1. Inisialisasi State Store Global
  if (typeof VitaStore !== 'undefined') {
    VitaStore.init();
  }

  let isRouterInitialized = false;

  const initRouterOnce = () => {
    if (!isRouterInitialized && typeof VitaRouter !== 'undefined') {
      isRouterInitialized = true;
      VitaRouter.init();
      return true;
    }
    return false;
  };

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
              // Sync photoURL and email automatically if they logged in with Google and it changed
              if ((user.photoURL && profile.photoURL !== user.photoURL) || (user.email && profile.email !== user.email)) {
                profile.photoURL = user.photoURL || profile.photoURL;
                profile.email = user.email || profile.email;
                VitaFirestore.saveUserProfile(user.uid, { photoURL: profile.photoURL, email: profile.email });
              }

              VitaStore.set('profile', profile);
              if (typeof window.updateSidebarUser === 'function') window.updateSidebarUser(profile, user);

              if (!profile.onboardingComplete) {
                initRouterOnce();
                if (typeof VitaRouter !== 'undefined') VitaRouter.navigate('onboarding');
                return;
              }

              // Onboarding selesai — restore halaman sebelum refresh, atau ke dashboard
              const currentHash    = window.location.hash.replace('#', '') || '';
              const savedRedirect  = sessionStorage.getItem('vita_redirect_after_auth');
              if (savedRedirect) {
                sessionStorage.removeItem('vita_redirect_after_auth');
                initRouterOnce();
                if (typeof VitaRouter !== 'undefined') VitaRouter.navigate(savedRedirect);
                return;
              }
              if (PUBLIC_PAGES.includes(currentHash)) {
                initRouterOnce();
                if (typeof VitaRouter !== 'undefined') VitaRouter.navigate('dashboard');
                return;
              }

              initRouterOnce();
            } else {
              // Profil belum ada sama sekali → onboarding
              initRouterOnce();
              if (typeof VitaRouter !== 'undefined') VitaRouter.navigate('onboarding');
              return;
            }
          } catch (err) {
            console.error('[VITA] Error memuat profil Firestore (Kemungkinan Security Rules):', err);
            if (typeof VitaHelpers !== 'undefined') {
              VitaHelpers.showToast('Gagal memuat profil. Mohon periksa Firestore Security Rules Anda (Missing or insufficient permissions).', 'error');
            }
            initRouterOnce();
          }
        } else {
          initRouterOnce();
        }
      } else {
        // Jangan hapus state jika sedang dalam Mode Demo
        if (!VitaStore.get('demoMode')) {
          VitaStore.set('user', null);
          VitaStore.set('profile', null);
        }
        initRouterOnce();
      }

      // Segarkan ulang rute setelah status autentikasi diketahui, jika router sudah ada sebelumnya
      const justInitialized = initRouterOnce();
      if (!justInitialized && typeof VitaRouter !== 'undefined') {
        VitaRouter.handleRoute();
      }
    });
  } else {
    initRouterOnce();
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

// ── Sidebar goal cycling ──────────────────────────────────────────
let _goalInterval = null;
let _goalIndex    = 0;
let _goalList     = [];

function _animateGoal(inner, newText) {
  // Fade + slide ke atas → ganti teks → fade + slide masuk dari bawah
  inner.style.transition = 'transform 0.3s ease, opacity 0.3s ease';
  inner.style.transform  = 'translateY(-6px)';
  inner.style.opacity    = '0';

  setTimeout(() => {
    inner.style.transition = 'none';
    inner.style.transform  = 'translateY(6px)';
    inner.textContent      = newText;
    inner.getBoundingClientRect(); // force reflow
    inner.style.transition = 'transform 0.3s ease, opacity 0.3s ease';
    inner.style.transform  = 'translateY(0)';
    inner.style.opacity    = '1';
  }, 300);
}

function _startGoalCycle(goalEl, goals) {
  if (_goalInterval) { clearInterval(_goalInterval); _goalInterval = null; }

  const inner = goalEl.querySelector('.user-goal-inner');
  if (!inner) return;

  _goalList  = goals.filter(Boolean);
  _goalIndex = 0;

  // Tampilkan goal pertama langsung (tanpa animasi)
  inner.style.transform = 'translateY(0)';
  inner.style.opacity   = '1';
  inner.textContent     = _goalList[0] || 'Menjaga Kesehatan';

  if (_goalList.length <= 1) return; // Hanya 1 goal, tidak perlu cycling

  _goalInterval = setInterval(() => {
    _goalIndex = (_goalIndex + 1) % _goalList.length;
    _animateGoal(inner, _goalList[_goalIndex]);
  }, 3000);
}

// Helper: Update info user di sidebar
window.updateSidebarUser = function(profile, user) {
  const nameEl   = document.getElementById('sidebar-name');
  const goalEl   = document.getElementById('sidebar-goal');
  const avatarEl = document.getElementById('sidebar-avatar');

  if (nameEl) nameEl.textContent = profile?.name || user?.displayName || 'Pengguna';

  if (goalEl) {
    const goals = (profile?.goals || []).filter(Boolean);
    _startGoalCycle(goalEl, goals.length ? goals : ['Menjaga Kesehatan']);
  }

  if (avatarEl && typeof VitaHelpers !== 'undefined') {
    avatarEl.innerHTML  = VitaHelpers.getAvatar(profile?.name || user?.displayName, profile?.photoURL || user?.photoURL);
    avatarEl.style.padding  = '0';
    avatarEl.style.overflow = 'hidden';
  }
};
