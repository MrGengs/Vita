// VITA — Risk Calculator Service (Evidence-Based SLR)
const VitaRiskCalculator = (() => {

  /**
   * Menghitung skor risiko berdasarkan data profil dan riwayat nutrisi.
   * Berdasarkan 12 literatur ilmiah: DM, Hipertensi, Obesitas, CVD.
   * 
   * @param {Object} profile Data profil (BMI, Usia, Gender)
   * @param {Array} nutritionDays Array agregasi nutrisi harian {calories, carbs, fat, fiber, sodium}
   */
  function assess(profile, nutritionDays) {
    let bmi = profile.bmi || 24;
    let age = profile.age || 30;
    
    // Baseline Risiko Berdasarkan Profil Fisik (BMI & Usia)
    let dmScore = (bmi >= 25 ? 30 : 10) + (age > 40 ? 10 : 0);
    let htScore = (bmi >= 25 ? 25 : 10) + (age > 40 ? 15 : 0);
    let obScore = (bmi >= 25 ? 40 : 10);
    let cvdScore = (bmi >= 25 ? 20 : 10) + (age > 40 ? 15 : 0);

    let factors = [];
    let recs = [];

    // Menghitung Rata-rata Konsumsi Harian
    let avgCal = 0, avgCarb = 0, avgFiber = 0, avgSodium = 0, avgFat = 0;
    
    if (nutritionDays && nutritionDays.length > 0) {
      const total = nutritionDays.reduce((acc, d) => {
        acc.cal += d.calories || 0; acc.carb += d.carbs || 0;
        acc.fiber += d.fiber || 0; acc.sodium += d.sodium || 0;
        acc.fat += d.fat || 0; return acc;
      }, { cal:0, carb:0, fiber:0, sodium:0, fat:0 });
      
      let days = nutritionDays.length;
      avgCal = total.cal / days; avgCarb = total.carb / days;
      avgFiber = total.fiber / days; avgSodium = total.sodium / days;
      avgFat = total.fat / days;
    }

    // --- EVALUASI RISIKO (SLR Rules) ---

    // 1. Diabetes T2: Cek Serat & Karbohidrat Sederhana
    if (avgFiber > 0 && avgFiber < 15) {
      dmScore += 25; cvdScore += 10;
      factors.push({ type: 'warning', text: `Asupan serat harian rata-rata (${Math.round(avgFiber)}g) jauh di bawah batas aman 15g.` });
      recs.push('Tingkatkan porsi sayuran hijau dan buah-buahan utuh untuk mengontrol penyerapan gula darah.');
    } else if (avgFiber >= 15) {
      dmScore -= 10;
      factors.push({ type: 'good', text: 'Konsumsi serat terpantau baik, efektif melindungi dari risiko Diabetes.' });
    }

    // 2. Hipertensi: Cek Natrium (Sodium) > 2300mg
    if (avgSodium > 2300) {
      htScore += 35; cvdScore += 20;
      factors.push({ type: 'warning', text: `Konsumsi sodium (${Math.round(avgSodium)}mg) melebihi batas toleransi maksimal harian.` });
      recs.push('Kurangi tambahan garam, penyedap rasa botolan, dan batasi makanan olahan/kalengan tinggi natrium.');
    } else if (avgSodium > 0) {
      factors.push({ type: 'good', text: 'Asupan sodium/natrium terkontrol dengan baik, menjaga tensi darah normal.' });
    }

    // 3. Obesitas & Sindrom Metabolik: Total Kalori
    let calTarget = profile.gender === 'male' ? 2500 : 2000;
    if (avgCal > calTarget + 200) {
      obScore += 35; dmScore += 15;
      factors.push({ type: 'warning', text: `Total asupan kalori (${Math.round(avgCal)} kkal) secara konsisten melebihi target.` });
      recs.push('Lakukan defisit kalori ringan (kurangi 200-300 kkal/hari) untuk mencegah penumpukan lemak viseral.');
    } else if (avgCal > 0 && avgCal <= calTarget) {
      factors.push({ type: 'good', text: 'Manajemen asupan kalori harian sudah sangat ideal.' });
    }

    // 4. Penyakit Kardiovaskular (CVD): Persentase Lemak
    let fatCalRatio = (avgFat * 9) / (avgCal || 1);
    if (fatCalRatio > 0.35) {
      cvdScore += 30; obScore += 15;
      factors.push({ type: 'warning', text: 'Rasio asupan lemak harian terlalu tinggi (>35% dari total kalori).' });
      recs.push('Ganti sumber lemak jenuh/gorengan dengan lemak sehat seperti alpukat, kacang-kacangan, dan ikan laut.');
    }

    // Pastikan jika skor prima, berikan feedback positif
    if (factors.length === 0 || !factors.some(f => f.type === 'warning')) {
      factors.push({ type: 'good', text: 'Pola makan dan profil kesehatan Anda dalam kondisi prima.' });
      recs.push('Pertahankan gaya hidup sehat Anda saat ini dan jadwalkan olahraga rutin 30 menit sehari!');
    }

    // Fungsi helper memastikan nilai skor ada di rentang 0-100%
    const cap = (s) => Math.min(100, Math.max(0, Math.round(s)));

    return {
      scores: { diabetes: cap(dmScore), hypertension: cap(htScore), obesity: cap(obScore), cvd: cap(cvdScore) },
      factors: factors.slice(0, 4), // Ambil maksimal 4 faktor agar tampilan UI rapi
      recommendations: recs.length ? recs : ['Jaga pola makan seimbang dan tetap aktif bergerak setiap hari.']
    };
  }

  return { assess };
})();