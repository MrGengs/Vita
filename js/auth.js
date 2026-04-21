// VITA — Authentication Module
const VitaAuth = (() => {

  async function signInWithEmail(email, password) {
    return auth.signInWithEmailAndPassword(email, password);
  }

  async function signInWithGoogle() {
    const provider = new firebase.auth.GoogleAuthProvider();
    try {
      return await auth.signInWithPopup(provider);
    } catch (err) {
      console.error('[VITA] Error Google Login (COOP/Popup Blocked):', err);
      if (typeof VitaHelpers !== 'undefined') {
        VitaHelpers.showToast('Gagal Login dengan Google. Pastikan server lokal Anda tidak memblokir Popup (COOP) atau gunakan login Email.', 'error');
      }
      throw err;
    }
  }

  async function createAccount(email, password, displayName) {
    const cred = await auth.createUserWithEmailAndPassword(email, password);
    await cred.user.updateProfile({ displayName });
    return cred;
  }

  async function signOut() {
    VitaCharts.destroyAll();
    VitaStore.set('user', null);
    VitaStore.set('profile', null);
    return auth.signOut();
  }

  async function sendPasswordReset(email) {
    return auth.sendPasswordResetEmail(email);
  }

  function getCurrentUser() { return auth.currentUser; }

  function onAuthChange(callback) { return auth.onAuthStateChanged(callback); }

  return { signInWithEmail, signInWithGoogle, createAccount, signOut, sendPasswordReset, getCurrentUser, onAuthChange };
})();
