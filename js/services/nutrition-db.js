// VITA — Nutrition Database (stub)
const VitaNutritionDB = (() => {
  const DB = {
    "Nasi Putih": { calories:130,protein:2.7,carbs:28.2,fat:0.3,fiber:0.4,sodium:1,sugar:0,serving:100,unit:'gram' },
    "Nasi Merah": { calories:111,protein:2.6,carbs:23,fat:0.9,fiber:1.8,sodium:5,sugar:0,serving:100,unit:'gram' },
    "Ayam Goreng": { calories:260,protein:27,carbs:1,fat:16,fiber:0,sodium:85,sugar:0,serving:100,unit:'gram' },
    "Ayam Rebus": { calories:165,protein:31,carbs:0,fat:3.6,fiber:0,sodium:74,sugar:0,serving:100,unit:'gram' },
    "Tempe Goreng": { calories:193,protein:14,carbs:9,fat:11,fiber:1.4,sodium:9,sugar:0,serving:100,unit:'gram' },
    "Tahu Goreng": { calories:133,protein:9,carbs:3,fat:10,fiber:0.3,sodium:8,sugar:0,serving:100,unit:'gram' },
    "Telur Goreng": { calories:196,protein:13.6,carbs:1.3,fat:15,fiber:0,sodium:207,sugar:0,serving:1,unit:'butir' },
    "Telur Rebus": { calories:155,protein:13,carbs:1.1,fat:11,fiber:0,sodium:124,sugar:1.1,serving:1,unit:'butir' },
    "Sayur Bayam": { calories:23,protein:2.9,carbs:3.6,fat:0.4,fiber:2.2,sodium:79,sugar:0.4,serving:100,unit:'gram' },
    "Kangkung Tumis": { calories:48,protein:2,carbs:5,fat:2.5,fiber:2,sodium:300,sugar:1,serving:100,unit:'gram' },
    "Mie Goreng": { calories:330,protein:8,carbs:50,fat:11,fiber:2,sodium:850,sugar:4,serving:100,unit:'gram' },
    "Nasi Goreng": { calories:285,protein:8,carbs:42,fat:10,fiber:1.5,sodium:620,sugar:3,serving:100,unit:'gram' },
    "Soto Ayam": { calories:180,protein:12,carbs:15,fat:7,fiber:1,sodium:680,sugar:2,serving:300,unit:'ml' },
    "Rendang Sapi": { calories:350,protein:24,carbs:8,fat:26,fiber:1,sodium:420,sugar:3,serving:100,unit:'gram' },
    "Ikan Goreng": { calories:196,protein:22,carbs:3,fat:11,fiber:0,sodium:156,sugar:0,serving:100,unit:'gram' },
    "Gado-gado": { calories:210,protein:10,carbs:22,fat:10,fiber:4,sodium:450,sugar:6,serving:200,unit:'gram' },
    "Pisang": { calories:89,protein:1.1,carbs:23,fat:0.3,fiber:2.6,sodium:1,sugar:12,serving:1,unit:'buah' },
    "Apel": { calories:52,protein:0.3,carbs:14,fat:0.2,fiber:2.4,sodium:1,sugar:10,serving:1,unit:'buah' },
    "Jeruk": { calories:47,protein:0.9,carbs:12,fat:0.1,fiber:2.4,sodium:0,sugar:9,serving:1,unit:'buah' },
    "Teh Manis": { calories:70,protein:0,carbs:18,fat:0,fiber:0,sodium:5,sugar:18,serving:250,unit:'ml' },
    "Kopi Hitam": { calories:2,protein:0.3,carbs:0,fat:0,fiber:0,sodium:5,sugar:0,serving:250,unit:'ml' },
    "Jus Jeruk": { calories:112,protein:1.7,carbs:26,fat:0.5,fiber:0.5,sodium:2,sugar:21,serving:250,unit:'ml' },
    "Susu Sapi": { calories:149,protein:8,carbs:12,fat:8,fiber:0,sodium:105,sugar:12,serving:250,unit:'ml' },
    "Roti Putih": { calories:265,protein:9,carbs:50,fat:3.2,fiber:2.3,sodium:491,sugar:5,serving:100,unit:'gram' },
    "Kerupuk": { calories:400,protein:8,carbs:70,fat:11,fiber:1,sodium:800,sugar:2,serving:50,unit:'gram' },
  };

  function search(query) {
    if (!query || query.length < 2) return [];
    const q = query.toLowerCase();
    return Object.keys(DB).filter(k => k.toLowerCase().includes(q)).slice(0, 10).map(k => ({ name: k, ...DB[k] }));
  }

  function get(name) { return DB[name] ? { name, ...DB[name] } : null; }

  function calculate(name, grams) {
    const food = DB[name];
    if (!food) return null;
    const ratio = grams / food.serving;
    return { name, grams, calories: food.calories * ratio, protein: food.protein * ratio, carbs: food.carbs * ratio, fat: food.fat * ratio, fiber: food.fiber * ratio, sodium: food.sodium * ratio, sugar: food.sugar * ratio };
  }

  return { search, get, calculate, DB };
})();
