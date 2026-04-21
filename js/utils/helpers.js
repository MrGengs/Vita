// VITA — Helpers Utility
const VitaHelpers = (() => {

  /**
   * Menampilkan notifikasi Toast melayang di layar
   * @param {string} message Pesan yang ingin ditampilkan
   * @param {string} type 'success' | 'error' | 'warning' | 'info'
   */
  function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `vita-toast toast-${type}`;
    
    let icon = 'info';
    let bgColor = '#2E7FBF'; // Default blue (info)
    
    if (type === 'success') { icon = 'check-circle'; bgColor = '#52B847'; }
    else if (type === 'error') { icon = 'alert-circle'; bgColor = '#EF4444'; }
    else if (type === 'warning') { icon = 'alert-triangle'; bgColor = '#F59E0B'; }

    toast.innerHTML = `
      <i data-lucide="${icon}" style="width:20px;height:20px;"></i>
      <span>${message}</span>
    `;
    
    // Inline styles as fallback in case app.css doesn't cover this yet
    Object.assign(toast.style, {
      position: 'fixed',
      bottom: '90px', // Di atas bottom nav
      left: '50%',
      transform: 'translate(-50%, 50px)',
      backgroundColor: bgColor,
      color: 'white',
      padding: '12px 20px',
      borderRadius: '50px',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      fontSize: '0.875rem',
      fontWeight: '600',
      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
      zIndex: '9999',
      opacity: '0',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
    });

    document.body.appendChild(toast);
    if (typeof lucide !== 'undefined') lucide.createIcons({ root: toast });

    // Animate In
    requestAnimationFrame(() => {
      toast.style.transform = 'translate(-50%, 0)';
      toast.style.opacity = '1';
    });

    // Remove after 3 seconds
    setTimeout(() => {
      toast.style.transform = 'translate(-50%, 20px)';
      toast.style.opacity = '0';
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }

  function calculateBMI(weight, height) {
    if (!weight || !height) return 0;
    const hMeter = height / 100;
    return weight / (hMeter * hMeter);
  }

  function getBMICategory(bmi) {
    if (bmi < 18.5) return { label: 'Kekurangan Berat', color: '#2E7FBF' }; // Underweight
    if (bmi < 25) return { label: 'Normal', color: '#52B847' }; // Normal
    if (bmi < 30) return { label: 'Kelebihan Berat', color: '#F59E0B' }; // Overweight
    return { label: 'Obesitas', color: '#EF4444' }; // Obese
  }

  function getInitials(name) {
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }

  function formatDate(dateObj, format = 'short') {
    const d = dateObj || new Date();
    if (format === 'full') {
      return d.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    }
    return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
  }

  function formatNumber(num) {
    if (num === undefined || num === null) return '0';
    return Number(num).toLocaleString('id-ID');
  }

  function formatGrams(num) {
    if (num === undefined || num === null) return '0g';
    return Number(num).toLocaleString('id-ID') + 'g';
  }

  function getGreeting() {
    const hour = new Date().getHours();
    if (hour < 11) return 'Selamat Pagi';
    if (hour < 15) return 'Selamat Siang';
    if (hour < 18) return 'Selamat Sore';
    return 'Selamat Malam';
  }

  function getCalorieTarget(profile) {
    if (!profile || !profile.weight || !profile.height || !profile.age || !profile.gender) {
      return 2100; // Standar fallback jika profil belum lengkap
    }
    // Rumus Mifflin-St Jeor untuk BMR
    let bmr = (10 * profile.weight) + (6.25 * profile.height) - (5 * profile.age);
    bmr += (profile.gender === 'male') ? 5 : -161;
    
    // Mengasumsikan multiplier aktivitas moderat (1.375) untuk target harian umum
    return Math.round(bmr * 1.375);
  }

  function pct(value, total) {
    if (!total || total === 0) return 0;
    return Math.min(100, Math.max(0, (value / total) * 100));
  }

  return {
    showToast,
    calculateBMI,
    getBMICategory,
    getInitials,
    formatDate,
    formatNumber,
    formatGrams,
    getGreeting,
    getCalorieTarget,
    pct
  };
})();