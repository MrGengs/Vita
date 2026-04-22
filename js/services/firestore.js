// VITA — Firestore Service
// Semua data user tersimpan di bawah users/{userId}/...
const VitaFirestore = (() => {

  function userRef(userId) {
    return db.collection('users').doc(userId);
  }

  async function saveUserProfile(userId, profile) {
    return userRef(userId).set(profile, { merge: true });
  }

  async function getUserProfile(userId) {
    const snap = await userRef(userId).get();
    return snap.exists ? snap.data() : null;
  }

  async function saveMeal(userId, mealData) {
    const dateKey = VitaHelpers.getTodayKey();
    return userRef(userId)
      .collection('meals')
      .add({ ...mealData, dateKey, createdAt: firebase.firestore.FieldValue.serverTimestamp() });
  }

  async function getMealsForDate(userId, dateKey) {
    const snap = await userRef(userId)
      .collection('meals')
      .where('dateKey', '==', dateKey)
      .orderBy('createdAt')
      .get();
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  }

  async function deleteMeal(userId, mealId) {
    return userRef(userId).collection('meals').doc(mealId).delete();
  }

  async function saveRiskAssessment(userId, data) {
    return userRef(userId)
      .collection('risk_assessments')
      .add({ ...data, timestamp: firebase.firestore.FieldValue.serverTimestamp() });
  }

  async function getLatestRiskAssessment(userId) {
    const snap = await userRef(userId)
      .collection('risk_assessments')
      .orderBy('timestamp', 'desc')
      .limit(1)
      .get();
    return snap.empty ? null : snap.docs[0].data();
  }

  return {
    saveUserProfile,
    getUserProfile,
    saveMeal,
    getMealsForDate,
    deleteMeal,
    saveRiskAssessment,
    getLatestRiskAssessment,
  };
})();
