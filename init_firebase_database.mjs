#!/usr/bin/env node

/**
 * Script d'initialisation complète de Firebase Realtime Database
 * Crée la structure pour TOUTES les entités de l'application
 */

import { initializeApp } from 'firebase/app';
import { getDatabase, ref, set } from 'firebase/database';

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

console.log('\n=== INITIALISATION FIREBASE REALTIME DATABASE ===');
console.log('Projet: seafarm-mntr');
console.log('Region: europe-west1');
console.log('='.repeat(70));

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

// Données de référence par défaut
const defaultData = {
  // Types de crédit
  credit_types: {
    'credit-1': {
      id: 'credit-1',
      name: 'Equipement',
      description: 'Credit pour achat equipement',
      interestRate: 5,
      maxAmount: 5000000
    },
    'credit-2': {
      id: 'credit-2',
      name: 'Semences',
      description: 'Credit pour achat de semences',
      interestRate: 3,
      maxAmount: 2000000
    },
    'credit-3': {
      id: 'credit-3',
      name: 'Materiel',
      description: 'Credit pour materiel de culture',
      interestRate: 4,
      maxAmount: 3000000
    },
    'credit-4': {
      id: 'credit-4',
      name: 'Urgence',
      description: 'Credit d\'urgence',
      interestRate: 6,
      maxAmount: 1000000
    }
  },

  // Types d'algues
  seaweed_types: {
    'seaweed-1': {
      id: 'seaweed-1',
      name: 'Kappaphycus alvarezii',
      scientificName: 'Kappaphycus alvarezii',
      description: 'Algue rouge, principale espece cultivee',
      wetPrice: 500,
      dryPrice: 5000
    },
    'seaweed-2': {
      id: 'seaweed-2',
      name: 'Eucheuma denticulatum',
      scientificName: 'Eucheuma denticulatum',
      description: 'Algue rouge, culture secondaire',
      wetPrice: 450,
      dryPrice: 4500
    },
    'seaweed-3': {
      id: 'seaweed-3',
      name: 'Gracilaria',
      scientificName: 'Gracilaria spp.',
      description: 'Algue rouge, usage alimentaire',
      wetPrice: 400,
      dryPrice: 4000
    },
    'seaweed-4': {
      id: 'seaweed-4',
      name: 'Caulerpa',
      scientificName: 'Caulerpa lentillifera',
      description: 'Algue verte comestible',
      wetPrice: 600,
      dryPrice: 6000
    }
  },

  // Collections vides (prêtes à recevoir des données)
  sites: {},
  employees: {},
  farmers: {},
  service_providers: {},
  modules: {},
  cultivation_cycles: {},
  zones: {},
  farmer_credits: {},
  repayments: {},
  farmer_deliveries: {},
  stock_movements: {},
  pressing_slips: {},
  pressed_stock_movements: {},
  export_documents: {},
  site_transfers: {},
  cutting_operations: {},
  incidents: {},
  periodic_tests: {},
  monthly_payments: {},
  pest_observations: {},
  users: {},
  invitations: {},
  message_logs: {},
  gallery_photos: {}
};

async function initializeDatabase() {
  try {
    console.log('\n[1/3] Creation de la structure de base...');
    
    // Créer toutes les collections
    const collections = Object.keys(defaultData);
    console.log(`      ${collections.length} collections a initialiser`);
    
    // Initialiser chaque collection
    for (const collection of collections) {
      const collectionRef = ref(database, collection);
      await set(collectionRef, defaultData[collection]);
      console.log(`      ✓ ${collection}`);
    }
    
    console.log('\n[2/3] Donnees de reference creees:');
    console.log(`      - 4 types de credit`);
    console.log(`      - 4 types d'algues`);
    
    console.log('\n[3/3] Collections vides creees:');
    const emptyCollections = collections.filter(c => 
      c !== 'credit_types' && c !== 'seaweed_types'
    );
    emptyCollections.forEach(col => {
      console.log(`      - ${col}`);
    });
    
    console.log('\n' + '='.repeat(70));
    console.log('SUCCESS - BASE DE DONNEES INITIALISEE !');
    console.log('='.repeat(70));
    
    console.log('\nStructure Firebase creee:');
    console.log('  seafarm-mntr-rtdb/');
    console.log('  ├── credit_types/        (4 types)');
    console.log('  ├── seaweed_types/       (4 types)');
    console.log('  ├── sites/               (vide)');
    console.log('  ├── employees/           (vide)');
    console.log('  ├── farmers/             (vide)');
    console.log('  ├── service_providers/   (vide)');
    console.log('  ├── modules/             (vide)');
    console.log('  ├── cultivation_cycles/  (vide)');
    console.log('  ├── zones/               (vide)');
    console.log('  ├── farmer_credits/      (vide)');
    console.log('  ├── repayments/          (vide)');
    console.log('  ├── farmer_deliveries/   (vide)');
    console.log('  ├── stock_movements/     (vide)');
    console.log('  ├── pressing_slips/      (vide)');
    console.log('  ├── pressed_stock_movements/ (vide)');
    console.log('  ├── export_documents/    (vide)');
    console.log('  ├── site_transfers/      (vide)');
    console.log('  ├── cutting_operations/  (vide)');
    console.log('  ├── incidents/           (vide)');
    console.log('  ├── periodic_tests/      (vide)');
    console.log('  ├── monthly_payments/    (vide)');
    console.log('  ├── pest_observations/   (vide)');
    console.log('  ├── users/               (vide)');
    console.log('  ├── invitations/         (vide)');
    console.log('  ├── message_logs/        (vide)');
    console.log('  └── gallery_photos/      (vide)');
    
    console.log('\nProchaines etapes:');
    console.log('  1. Verifier dans Firebase Console:');
    console.log('     https://console.firebase.google.com/project/seafarm-mntr/database');
    console.log('  2. Demarrer l\'application: npm run dev');
    console.log('  3. Se connecter: admin@seafarm.com / password');
    console.log('  4. Ajouter vos donnees:');
    console.log('     - Sites');
    console.log('     - Employes');
    console.log('     - Cultivateurs');
    console.log('     - Modules');
    console.log('     - Cycles de culture');
    console.log('     - etc.');
    console.log('\nToutes les donnees seront automatiquement synchronisees !');
    console.log('');
    
    process.exit(0);
  } catch (error) {
    console.error('\nERROR:', error.message);
    console.error('\nCauses possibles:');
    console.error('  - Connexion internet indisponible');
    console.error('  - Credentials Firebase incorrects');
    console.error('  - Realtime Database pas activee');
    console.error('  - Regles de securite trop restrictives');
    console.error('\nSolution:');
    console.error('  1. Verifier Firebase Console');
    console.error('  2. Verifier que Realtime Database est activee');
    console.error('  3. Verifier les regles de securite (test mode recommande)\n');
    process.exit(1);
  }
}

initializeDatabase();
