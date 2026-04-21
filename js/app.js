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
          const profile = await VitaFirestore.getUserProfile(user.uid);
          if (profile) {
            VitaStore.set('profile', profile);
            
            // Perbarui identitas user di sidebar global
            const nameEl = document.getElementById('sidebar-name');
            const goalEl = document.getElementById('sidebar-goal');
            const avatarEl = document.getElementById('sidebar-avatar');
            
            if (nameEl) nameEl.textContent = profile.name || 'Pengguna';
            if (goalEl) goalEl.textContent = (profile.goals && profile.goals[0]) || 'Menjaga Kesehatan';
            if (avatarEl && typeof VitaHelpers !== 'undefined') avatarEl.textContent = VitaHelpers.getInitials(profile.name);
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

  // 3. Mulai Router (Akan langsung memanggil render halaman pertama)
  if (typeof VitaRouter !== 'undefined') {
    VitaRouter.init();
  } else {
    console.error("VITA: Router gagal dimuat. Pastikan router.js ada di index.html sebelum app.js.");
  }
  
  // 4. Event Listener Global: Sidebar Overlay (Tutup Sidebar klik di luar area)
  document.getElementById('sidebar-overlay')?.addEventListener('click', function() {
    document.getElementById('sidebar')?.classList.remove('open');
    this.classList.add('hidden');
  });
});