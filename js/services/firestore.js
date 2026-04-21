// VITA — Firestore Service
const VitaFirestore = (() => {

  async function saveUserProfile(userId, profile) {
    return db.collection('users').doc(userId).set(profile, { merge: true });
  }

  async function getUserProfile(userId) {
    const snap = await db.collection('users').doc(userId).get();
    return snap.exists ? snap.data() : null;
  }

  async function saveMeal(userId, mealData) {
    const dateKey = VitaHelpers.getTodayKey();
    return db.collection('meals').doc(userId).collection('logs').add({ ...mealData, dateKey, createdAt: firebase.firestore.FieldValue.serverTimestamp() });
  }

  async function getMealsForDate(userId, dateKey) {
    const snap = await db.collection('meals').doc(userId).collection('logs').where('dateKey', '==', dateKey).orderBy('createdAt').get();
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  }

  async function saveRiskAssessment(userId, scores) {
    return db.collection('risk_assessments').doc(userId).collection('history').add({ scores, timestamp: firebase.firestore.FieldValue.serverTimestamp() });
  }

  async function getLatestRiskAssessment(userId) {
    const snap = await db.collection('risk_assessments').doc(userId).collection('history').orderBy('timestamp', 'desc').limit(1).get();
    return snap.empty ? null : snap.docs[0].data();
  }

  return { saveUserProfile, getUserProfile, saveMeal, getMealsForDate, saveRiskAssessment, getLatestRiskAssessment };
})();
