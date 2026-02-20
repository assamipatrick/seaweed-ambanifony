#!/usr/bin/env node

/**
 * Test Firebase Configuration and Connection
 */

import { initializeApp } from 'firebase/app';
import { getDatabase, ref, set, get, onValue, off } from 'firebase/database';

// Configuration Firebase (DEMO - ne fonctionnera pas sans vraies credentials)
const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY || "AIzaSyDEMO_KEY",
  authDomain: "seafarm-demo.firebaseapp.com",
  databaseURL: "https://seafarm-demo-default-rtdb.firebaseio.com",
  projectId: "seafarm-demo",
  storageBucket: "seafarm-demo.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef1234567890"
};

console.log('\n🔥 TEST DE CONFIGURATION FIREBASE');
console.log('=' .repeat(70));

try {
  // Initialize Firebase
  console.log('\n1️⃣  Initialisation de Firebase...');
  const app = initializeApp(firebaseConfig);
  console.log('   ✅ Firebase initialisé');
  
  // Initialize Database
  console.log('\n2️⃣  Connexion à Realtime Database...');
  const database = getDatabase(app);
  console.log('   ✅ Database connectée');
  
  // Test d'écriture
  console.log('\n3️⃣  Test d'écriture...');
  const testRef = ref(database, 'test/connection');
  await set(testRef, {
    timestamp: Date.now(),
    message: 'Test de connexion Firebase',
    status: 'success'
  });
  console.log('   ✅ Écriture réussie');
  
  // Test de lecture
  console.log('\n4️⃣  Test de lecture...');
  const snapshot = await get(testRef);
  if (snapshot.exists()) {
    console.log('   ✅ Lecture réussie');
    console.log('   📄 Données:', snapshot.val());
  } else {
    console.log('   ⚠️  Aucune donnée trouvée');
  }
  
  // Test de synchronisation temps réel
  console.log('\n5️⃣  Test de synchronisation temps réel...');
  const sitesRef = ref(database, 'sites');
  
  onValue(sitesRef, (snapshot) => {
    const data = snapshot.val();
    if (data) {
      const count = Object.keys(data).length;
      console.log(`   ✅ ${count} site(s) détecté(s) en temps réel`);
    } else {
      console.log('   ℹ️  Aucun site dans la base (normal pour une nouvelle DB)');
    }
    
    // Cleanup
    off(sitesRef);
    
    console.log('\n' + '='.repeat(70));
    console.log('🎉 TOUS LES TESTS FIREBASE ONT RÉUSSI !');
    console.log('='.repeat(70));
    console.log('\n📝 Prochaines étapes :');
    console.log('   1. Créez un projet Firebase sur https://console.firebase.google.com/');
    console.log('   2. Activez Realtime Database');
    console.log('   3. Copiez vos credentials dans .env.local');
    console.log('   4. Redémarrez l\'application : npm run dev');
    console.log('\n📖 Guide complet : voir FIREBASE_SETUP.md\n');
    
    process.exit(0);
  }, (error) => {
    console.error('   ❌ Erreur de synchronisation:', error.message);
    process.exit(1);
  });
  
} catch (error) {
  console.error('\n❌ ERREUR:', error.message);
  console.error('\n💡 Causes possibles :');
  console.error('   • Credentials Firebase invalides ou manquantes');
  console.error('   • Realtime Database pas activée dans Firebase Console');
  console.error('   • Règles de sécurité trop restrictives');
  console.error('   • Connexion internet indisponible');
  console.error('\n📖 Consultez FIREBASE_SETUP.md pour la configuration complète\n');
  process.exit(1);
}
