#!/usr/bin/env node

/**
 * Script de réinitialisation complète de Firebase
 * Exécute les 3 scripts nécessaires dans l'ordre
 */

import { execSync } from 'child_process';

console.log('\n' + '='.repeat(80));
console.log('🔄 RÉINITIALISATION COMPLÈTE DE FIREBASE');
console.log('='.repeat(80) + '\n');

const scripts = [
  {
    name: 'Initialisation des données',
    file: 'init_firebase_all_collections.mjs',
    description: '36 collections avec 49 items de données'
  },
  {
    name: 'Création des collections vides',
    file: 'create_empty_collections.mjs',
    description: '17 placeholders pour rendre les collections visibles'
  },
  {
    name: 'Ajout des mots de passe',
    file: 'add_user_passwords.mjs',
    description: '3 utilisateurs avec mot de passe "password"'
  }
];

let success = 0;
let failed = 0;

for (let i = 0; i < scripts.length; i++) {
  const script = scripts[i];
  console.log(`\n[${ i + 1 }/${ scripts.length }] ${ script.name }`);
  console.log('─'.repeat(80));
  console.log(`📄 Fichier: ${script.file}`);
  console.log(`📝 Action: ${script.description}`);
  console.log('');
  
  try {
    execSync(`node ${script.file}`, { 
      stdio: 'inherit',
      cwd: process.cwd()
    });
    console.log(`\n✅ ${script.name} : SUCCÈS\n`);
    success++;
  } catch (error) {
    console.error(`\n❌ ${script.name} : ÉCHEC\n`);
    console.error(error.message);
    failed++;
  }
}

console.log('\n' + '='.repeat(80));
console.log('📊 RÉSUMÉ');
console.log('='.repeat(80));
console.log(`✅ Succès: ${success}/${scripts.length}`);
console.log(`❌ Échecs: ${failed}/${scripts.length}`);

if (failed === 0) {
  console.log('\n🎉 RÉINITIALISATION COMPLÈTE RÉUSSIE !');
  console.log('\n📋 Vérification:');
  console.log('   - 36 collections créées');
  console.log('   - 49 items de données + 17 placeholders');
  console.log('   - 3 utilisateurs avec mots de passe');
  console.log('   - 3 rôles avec permissions correctes (56, 48, 24)');
  
  console.log('\n🔗 Prochaines étapes:');
  console.log('   1. Vérifier Firebase Console:');
  console.log('      https://console.firebase.google.com/project/seafarm-mntr/database');
  console.log('   2. Vider le cache du navigateur (Ctrl + Shift + Delete)');
  console.log('   3. Se connecter à l\'application:');
  console.log('      https://3000-iw1hbfa3ilo0b15qntvdt-3844e1b6.sandbox.novita.ai/#/login');
  console.log('      Email: admin@seafarm.com');
  console.log('      Password: password');
  
  console.log('\n⚠️  IMPORTANT:');
  console.log('   N\'oubliez pas de modifier les règles Firebase !');
  console.log('   Voir: ACTION_REQUIRED.md');
  
  process.exit(0);
} else {
  console.log('\n❌ ERREURS DÉTECTÉES');
  console.log('   Veuillez corriger les erreurs et réessayer.');
  process.exit(1);
}
