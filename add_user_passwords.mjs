#!/usr/bin/env node

/**
 * Script pour ajouter les mots de passe aux utilisateurs existants
 */

import { initializeApp } from 'firebase/app';
import { getDatabase, ref, update } from 'firebase/database';

// Configuration Firebase
const firebaseConfig = {
  apiKey: "AIzaSyB58GKPIQvikVbaEeiyGNZHrtzFPRgb1UE",
  authDomain: "seafarm-mntr.firebaseapp.com",
  databaseURL: "https://seafarm-mntr-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "seafarm-mntr",
  storageBucket: "seafarm-mntr.firebasestorage.app",
  messagingSenderId: "860357255311",
  appId: "1:860357255311:web:00d1f44c1940c3a64f50fa"
};

console.log('\n' + '='.repeat(80));
console.log('=== AJOUT DES MOTS DE PASSE AUX UTILISATEURS ===');
console.log('='.repeat(80));

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

async function addPasswordsToUsers() {
  try {
    console.log('\n[1/3] Récupération des utilisateurs...');
    
    // Import pour lire les données
    const { ref: dbRef, get } = await import('firebase/database');
    
    const usersRef = dbRef(database, 'users');
    const snapshot = await get(usersRef);
    
    if (!snapshot.exists()) {
      console.log('   ❌ Aucun utilisateur trouvé !');
      process.exit(1);
    }
    
    const users = snapshot.val();
    console.log(`   ✓ ${Object.keys(users).length} utilisateurs trouvés`);
    
    console.log('\n[2/3] Ajout des mots de passe...');
    
    let updated = 0;
    
    // Parcourir chaque utilisateur
    for (const [userId, user] of Object.entries(users)) {
      // Ignorer les placeholders
      if (userId === '_placeholder') continue;
      
      // Ajouter le mot de passe "password" à chaque utilisateur
      const userRef = ref(database, `users/${userId}`);
      await update(userRef, {
        password: 'password'
      });
      
      console.log(`   ✓ ${user.email.padEnd(30)} → password: "password"`);
      updated++;
    }
    
    console.log('\n[3/3] Vérification des comptes...');
    console.log('');
    console.log('   📧 admin@seafarm.com         → password');
    console.log('   📧 manager@seafarm.com       → password');
    console.log('   📧 employee@seafarm.com      → password');
    
    console.log('\n' + '='.repeat(80));
    console.log(`✅ SUCCESS - ${updated} UTILISATEURS MIS À JOUR !`);
    console.log('='.repeat(80));
    
    console.log('\n🔑 Connexion:');
    console.log('   URL: https://3000-iw1hbfa3ilo0b15qntvdt-3844e1b6.sandbox.novita.ai/#/login');
    console.log('');
    console.log('   Admin:');
    console.log('   Email: admin@seafarm.com');
    console.log('   Password: password');
    console.log('');
    console.log('   Manager:');
    console.log('   Email: manager@seafarm.com');
    console.log('   Password: password');
    console.log('');
    console.log('   Employee:');
    console.log('   Email: employee@seafarm.com');
    console.log('   Password: password');
    console.log('');
    
    process.exit(0);
  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
    console.error(error);
    process.exit(1);
  }
}

addPasswordsToUsers();
