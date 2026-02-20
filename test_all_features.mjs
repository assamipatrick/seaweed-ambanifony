#!/usr/bin/env node

/**
 * TEST COMPLET DE TOUTES LES FONCTIONNALITÉS SEAFARM MONITOR
 * 
 * Ce script teste CRUD pour toutes les collections :
 * - CREATE : Ajout de nouvelles données
 * - READ : Lecture et vérification
 * - UPDATE : Modification
 * - DELETE : Suppression
 */

import { initializeApp } from 'firebase/app';
import { getDatabase, ref, set, get, update, remove, push } from 'firebase/database';

const firebaseConfig = {
    apiKey: "AIzaSyDvJpor1k-DH-7lNq-rl-wF6xNcQ1SdHAo",
    authDomain: "seafarm-mntr.firebaseapp.com",
    databaseURL: "https://seafarm-mntr-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "seafarm-mntr",
    storageBucket: "seafarm-mntr.firebasestorage.app",
    messagingSenderId: "738426854656",
    appId: "1:738426854656:web:98c0af60ce5e696e4f0e18"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// Couleurs pour la console
const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m'
};

const log = {
    title: (text) => console.log(`\n${colors.bright}${colors.cyan}${'='.repeat(80)}${colors.reset}`),
    section: (text) => console.log(`\n${colors.bright}${colors.magenta}## ${text}${colors.reset}`),
    test: (text) => console.log(`${colors.blue}→ ${text}${colors.reset}`),
    success: (text) => console.log(`${colors.green}✓ ${text}${colors.reset}`),
    error: (text) => console.log(`${colors.red}✗ ${text}${colors.reset}`),
    warning: (text) => console.log(`${colors.yellow}⚠ ${text}${colors.reset}`),
    info: (text) => console.log(`${colors.cyan}ℹ ${text}${colors.reset}`)
};

// Compteurs de tests
let testResults = {
    total: 0,
    passed: 0,
    failed: 0,
    warnings: 0,
    errors: []
};

/**
 * Wrapper pour les tests
 */
async function runTest(name, testFn) {
    testResults.total++;
    log.test(name);
    try {
        await testFn();
        testResults.passed++;
        log.success(`PASSED: ${name}`);
        return true;
    } catch (error) {
        testResults.failed++;
        testResults.errors.push({ test: name, error: error.message });
        log.error(`FAILED: ${name} - ${error.message}`);
        return false;
    }
}

/**
 * TEST 1: SITES MANAGEMENT
 */
async function testSitesManagement() {
    log.section('TEST 1: SITES MANAGEMENT (CRUD)');
    
    const testSiteId = 'test-site-' + Date.now();
    const testSite = {
        id: testSiteId,
        name: 'Site Test Automatique',
        code: 'TEST',
        location: '12°34\'56"S, 45°12\'34"E',
        managerId: '',
        zones: []
    };
    
    // CREATE
    await runTest('Sites - CREATE: Créer un nouveau site', async () => {
        await set(ref(db, `sites/${testSiteId}`), testSite);
        const snapshot = await get(ref(db, `sites/${testSiteId}`));
        if (!snapshot.exists()) throw new Error('Site non créé');
        if (snapshot.val().name !== testSite.name) throw new Error('Données incorrectes');
    });
    
    // READ
    await runTest('Sites - READ: Lire le site créé', async () => {
        const snapshot = await get(ref(db, `sites/${testSiteId}`));
        if (!snapshot.exists()) throw new Error('Site non trouvé');
        const site = snapshot.val();
        if (site.code !== 'TEST') throw new Error('Code incorrect');
    });
    
    // UPDATE
    await runTest('Sites - UPDATE: Modifier le site', async () => {
        await update(ref(db, `sites/${testSiteId}`), { name: 'Site Test Modifié' });
        const snapshot = await get(ref(db, `sites/${testSiteId}`));
        if (snapshot.val().name !== 'Site Test Modifié') throw new Error('Modification échouée');
    });
    
    // DELETE
    await runTest('Sites - DELETE: Supprimer le site', async () => {
        await remove(ref(db, `sites/${testSiteId}`));
        const snapshot = await get(ref(db, `sites/${testSiteId}`));
        if (snapshot.exists()) throw new Error('Site non supprimé');
    });
}

/**
 * TEST 2: ZONES MANAGEMENT
 */
async function testZonesManagement() {
    log.section('TEST 2: ZONES MANAGEMENT (CRUD avec geoPoints)');
    
    const testZoneId = 'test-zone-' + Date.now();
    const testZone = {
        id: testZoneId,
        name: 'Zone Test',
        geoPoints: [
            '12°30\'00"S, 45°00\'00"E',
            '12°30\'30"S, 45°00\'00"E',
            '12°30\'30"S, 45°00\'30"E',
            '12°30\'00"S, 45°00\'30"E'
        ]
    };
    
    // CREATE
    await runTest('Zones - CREATE: Créer une zone avec geoPoints', async () => {
        await set(ref(db, `zones/${testZoneId}`), testZone);
        const snapshot = await get(ref(db, `zones/${testZoneId}`));
        if (!snapshot.exists()) throw new Error('Zone non créée');
        if (!Array.isArray(snapshot.val().geoPoints)) throw new Error('geoPoints non array');
        if (snapshot.val().geoPoints.length !== 4) throw new Error('geoPoints incomplet');
    });
    
    // READ
    await runTest('Zones - READ: Lire la zone', async () => {
        const snapshot = await get(ref(db, `zones/${testZoneId}`));
        if (!snapshot.exists()) throw new Error('Zone non trouvée');
    });
    
    // UPDATE (ajouter un geoPoint)
    await runTest('Zones - UPDATE: Ajouter un geoPoint', async () => {
        const snapshot = await get(ref(db, `zones/${testZoneId}`));
        const zone = snapshot.val();
        zone.geoPoints.push('12°31\'00"S, 45°01\'00"E');
        await set(ref(db, `zones/${testZoneId}`), zone);
        
        const updated = await get(ref(db, `zones/${testZoneId}`));
        if (updated.val().geoPoints.length !== 5) throw new Error('geoPoint non ajouté');
    });
    
    // DELETE
    await runTest('Zones - DELETE: Supprimer la zone', async () => {
        await remove(ref(db, `zones/${testZoneId}`));
        const snapshot = await get(ref(db, `zones/${testZoneId}`));
        if (snapshot.exists()) throw new Error('Zone non supprimée');
    });
}

/**
 * TEST 3: MODULES MANAGEMENT
 */
async function testModulesManagement() {
    log.section('TEST 3: MODULES MANAGEMENT (CRUD)');
    
    const testModuleId = 'test-module-' + Date.now();
    const testModule = {
        id: testModuleId,
        code: 'TEST-Z01-M01',
        siteId: 'test-site',
        zoneId: 'test-zone',
        latitude: '12°30\'00"S',
        longitude: '45°00\'00"E',
        lines: 10,
        poles: {
            galvanized: 20,
            wood: 10,
            plastic: 5
        },
        status: 'free'
    };
    
    // CREATE
    await runTest('Modules - CREATE: Créer un module', async () => {
        await set(ref(db, `modules/${testModuleId}`), testModule);
        const snapshot = await get(ref(db, `modules/${testModuleId}`));
        if (!snapshot.exists()) throw new Error('Module non créé');
        if (snapshot.val().lines !== 10) throw new Error('Lignes incorrectes');
    });
    
    // READ
    await runTest('Modules - READ: Lire le module', async () => {
        const snapshot = await get(ref(db, `modules/${testModuleId}`));
        if (!snapshot.exists()) throw new Error('Module non trouvé');
        if (snapshot.val().poles.galvanized !== 20) throw new Error('Poteaux incorrects');
    });
    
    // UPDATE
    await runTest('Modules - UPDATE: Modifier le module', async () => {
        await update(ref(db, `modules/${testModuleId}`), { lines: 15, status: 'assigned' });
        const snapshot = await get(ref(db, `modules/${testModuleId}`));
        if (snapshot.val().lines !== 15) throw new Error('Lignes non modifiées');
        if (snapshot.val().status !== 'assigned') throw new Error('Status non modifié');
    });
    
    // DELETE
    await runTest('Modules - DELETE: Supprimer le module', async () => {
        await remove(ref(db, `modules/${testModuleId}`));
        const snapshot = await get(ref(db, `modules/${testModuleId}`));
        if (snapshot.exists()) throw new Error('Module non supprimé');
    });
}

/**
 * TEST 4: EMPLOYEES MANAGEMENT
 */
async function testEmployeesManagement() {
    log.section('TEST 4: EMPLOYEES MANAGEMENT (CRUD)');
    
    const testEmployeeId = 'test-employee-' + Date.now();
    const testEmployee = {
        id: testEmployeeId,
        firstName: 'Jean',
        lastName: 'Dupont',
        email: 'jean.dupont@test.com',
        phone: '+261 34 00 000 00',
        role: 'technician',
        siteId: '',
        hireDate: '2026-02-20'
    };
    
    // CREATE
    await runTest('Employees - CREATE: Créer un employé', async () => {
        await set(ref(db, `employees/${testEmployeeId}`), testEmployee);
        const snapshot = await get(ref(db, `employees/${testEmployeeId}`));
        if (!snapshot.exists()) throw new Error('Employé non créé');
        if (snapshot.val().firstName !== 'Jean') throw new Error('Données incorrectes');
    });
    
    // READ
    await runTest('Employees - READ: Lire l\'employé', async () => {
        const snapshot = await get(ref(db, `employees/${testEmployeeId}`));
        if (!snapshot.exists()) throw new Error('Employé non trouvé');
    });
    
    // UPDATE
    await runTest('Employees - UPDATE: Modifier l\'employé', async () => {
        await update(ref(db, `employees/${testEmployeeId}`), { role: 'manager' });
        const snapshot = await get(ref(db, `employees/${testEmployeeId}`));
        if (snapshot.val().role !== 'manager') throw new Error('Rôle non modifié');
    });
    
    // DELETE
    await runTest('Employees - DELETE: Supprimer l\'employé', async () => {
        await remove(ref(db, `employees/${testEmployeeId}`));
        const snapshot = await get(ref(db, `employees/${testEmployeeId}`));
        if (snapshot.exists()) throw new Error('Employé non supprimé');
    });
}

/**
 * TEST 5: FARMERS MANAGEMENT
 */
async function testFarmersManagement() {
    log.section('TEST 5: FARMERS MANAGEMENT (CRUD)');
    
    const testFarmerId = 'test-farmer-' + Date.now();
    const testFarmer = {
        id: testFarmerId,
        firstName: 'Rakoto',
        lastName: 'Andriamampianina',
        phone: '+261 32 00 000 00',
        address: 'Ambanifony',
        nationalId: 'TEST123456789',
        bankAccount: '00001 00002 12345678901 23'
    };
    
    // CREATE
    await runTest('Farmers - CREATE: Créer un agriculteur', async () => {
        await set(ref(db, `farmers/${testFarmerId}`), testFarmer);
        const snapshot = await get(ref(db, `farmers/${testFarmerId}`));
        if (!snapshot.exists()) throw new Error('Agriculteur non créé');
        if (snapshot.val().firstName !== 'Rakoto') throw new Error('Données incorrectes');
    });
    
    // READ
    await runTest('Farmers - READ: Lire l\'agriculteur', async () => {
        const snapshot = await get(ref(db, `farmers/${testFarmerId}`));
        if (!snapshot.exists()) throw new Error('Agriculteur non trouvé');
    });
    
    // UPDATE
    await runTest('Farmers - UPDATE: Modifier l\'agriculteur', async () => {
        await update(ref(db, `farmers/${testFarmerId}`), { address: 'Analakely' });
        const snapshot = await get(ref(db, `farmers/${testFarmerId}`));
        if (snapshot.val().address !== 'Analakely') throw new Error('Adresse non modifiée');
    });
    
    // DELETE
    await runTest('Farmers - DELETE: Supprimer l\'agriculteur', async () => {
        await remove(ref(db, `farmers/${testFarmerId}`));
        const snapshot = await get(ref(db, `farmers/${testFarmerId}`));
        if (snapshot.exists()) throw new Error('Agriculteur non supprimé');
    });
}

/**
 * TEST 6: CULTIVATION CYCLES
 */
async function testCultivationCycles() {
    log.section('TEST 6: CULTIVATION CYCLES (CRUD)');
    
    const testCycleId = 'test-cycle-' + Date.now();
    const testCycle = {
        id: testCycleId,
        moduleId: 'test-module',
        seaweedTypeId: 'test-seaweed',
        farmerId: 'test-farmer',
        plantingDate: '2026-02-20',
        status: 'planted'
    };
    
    // CREATE
    await runTest('Cycles - CREATE: Créer un cycle de culture', async () => {
        await set(ref(db, `cultivation_cycles/${testCycleId}`), testCycle);
        const snapshot = await get(ref(db, `cultivation_cycles/${testCycleId}`));
        if (!snapshot.exists()) throw new Error('Cycle non créé');
        if (snapshot.val().status !== 'planted') throw new Error('Status incorrect');
    });
    
    // READ
    await runTest('Cycles - READ: Lire le cycle', async () => {
        const snapshot = await get(ref(db, `cultivation_cycles/${testCycleId}`));
        if (!snapshot.exists()) throw new Error('Cycle non trouvé');
    });
    
    // UPDATE (changement de status)
    await runTest('Cycles - UPDATE: Changer status du cycle', async () => {
        await update(ref(db, `cultivation_cycles/${testCycleId}`), { 
            status: 'harvested',
            harvestDate: '2026-03-20'
        });
        const snapshot = await get(ref(db, `cultivation_cycles/${testCycleId}`));
        if (snapshot.val().status !== 'harvested') throw new Error('Status non modifié');
    });
    
    // DELETE
    await runTest('Cycles - DELETE: Supprimer le cycle', async () => {
        await remove(ref(db, `cultivation_cycles/${testCycleId}`));
        const snapshot = await get(ref(db, `cultivation_cycles/${testCycleId}`));
        if (snapshot.exists()) throw new Error('Cycle non supprimé');
    });
}

/**
 * TEST 7: CREDITS & PAYMENTS
 */
async function testCreditsAndPayments() {
    log.section('TEST 7: CREDITS & PAYMENTS (CRUD)');
    
    const testCreditId = 'test-credit-' + Date.now();
    const testCredit = {
        id: testCreditId,
        farmerId: 'test-farmer',
        creditTypeId: 'test-credit-type',
        amount: 500000,
        disbursementDate: '2026-02-20',
        status: 'active'
    };
    
    // CREATE
    await runTest('Credits - CREATE: Créer un crédit', async () => {
        await set(ref(db, `farmer_credits/${testCreditId}`), testCredit);
        const snapshot = await get(ref(db, `farmer_credits/${testCreditId}`));
        if (!snapshot.exists()) throw new Error('Crédit non créé');
        if (snapshot.val().amount !== 500000) throw new Error('Montant incorrect');
    });
    
    // READ
    await runTest('Credits - READ: Lire le crédit', async () => {
        const snapshot = await get(ref(db, `farmer_credits/${testCreditId}`));
        if (!snapshot.exists()) throw new Error('Crédit non trouvé');
    });
    
    // CREATE Repayment
    const testRepaymentId = 'test-repayment-' + Date.now();
    await runTest('Repayments - CREATE: Créer un remboursement', async () => {
        const repayment = {
            id: testRepaymentId,
            creditId: testCreditId,
            amount: 50000,
            date: '2026-02-21',
            method: 'cash'
        };
        await set(ref(db, `repayments/${testRepaymentId}`), repayment);
        const snapshot = await get(ref(db, `repayments/${testRepaymentId}`));
        if (!snapshot.exists()) throw new Error('Remboursement non créé');
    });
    
    // DELETE Repayment
    await runTest('Repayments - DELETE: Supprimer le remboursement', async () => {
        await remove(ref(db, `repayments/${testRepaymentId}`));
        const snapshot = await get(ref(db, `repayments/${testRepaymentId}`));
        if (snapshot.exists()) throw new Error('Remboursement non supprimé');
    });
    
    // DELETE Credit
    await runTest('Credits - DELETE: Supprimer le crédit', async () => {
        await remove(ref(db, `farmer_credits/${testCreditId}`));
        const snapshot = await get(ref(db, `farmer_credits/${testCreditId}`));
        if (snapshot.exists()) throw new Error('Crédit non supprimé');
    });
}

/**
 * TEST 8: STOCK OPERATIONS
 */
async function testStockOperations() {
    log.section('TEST 8: STOCK OPERATIONS (Deliveries, Pressing, Cutting)');
    
    // Test Farmer Delivery
    const testDeliveryId = 'test-delivery-' + Date.now();
    await runTest('Deliveries - CREATE: Créer une livraison', async () => {
        const delivery = {
            id: testDeliveryId,
            farmerId: 'test-farmer',
            seaweedTypeId: 'test-seaweed',
            quantity: 100,
            unitPrice: 500,
            totalAmount: 50000,
            deliveryDate: '2026-02-20',
            isPaid: false
        };
        await set(ref(db, `farmer_deliveries/${testDeliveryId}`), delivery);
        const snapshot = await get(ref(db, `farmer_deliveries/${testDeliveryId}`));
        if (!snapshot.exists()) throw new Error('Livraison non créée');
    });
    
    await runTest('Deliveries - DELETE: Supprimer la livraison', async () => {
        await remove(ref(db, `farmer_deliveries/${testDeliveryId}`));
        const snapshot = await get(ref(db, `farmer_deliveries/${testDeliveryId}`));
        if (snapshot.exists()) throw new Error('Livraison non supprimée');
    });
    
    // Test Pressing Slip
    const testPressingId = 'test-pressing-' + Date.now();
    await runTest('Pressing - CREATE: Créer un bordereau de pressage', async () => {
        const pressing = {
            id: testPressingId,
            date: '2026-02-20',
            seaweedTypeId: 'test-seaweed',
            rawQuantity: 100,
            pressedQuantity: 80,
            compressionRate: 80
        };
        await set(ref(db, `pressing_slips/${testPressingId}`), pressing);
        const snapshot = await get(ref(db, `pressing_slips/${testPressingId}`));
        if (!snapshot.exists()) throw new Error('Bordereau non créé');
    });
    
    await runTest('Pressing - DELETE: Supprimer le bordereau', async () => {
        await remove(ref(db, `pressing_slips/${testPressingId}`));
        const snapshot = await get(ref(db, `pressing_slips/${testPressingId}`));
        if (snapshot.exists()) throw new Error('Bordereau non supprimé');
    });
    
    // Test Cutting Operation
    const testCuttingId = 'test-cutting-' + Date.now();
    await runTest('Cutting - CREATE: Créer une opération de coupe', async () => {
        const cutting = {
            id: testCuttingId,
            date: '2026-02-20',
            siteId: 'test-site',
            serviceProviderId: 'test-provider',
            moduleCuts: [
                { moduleId: 'mod1', quantity: 50 },
                { moduleId: 'mod2', quantity: 30 }
            ],
            unitPrice: 100,
            totalAmount: 8000,
            isPaid: false
        };
        await set(ref(db, `cutting_operations/${testCuttingId}`), cutting);
        const snapshot = await get(ref(db, `cutting_operations/${testCuttingId}`));
        if (!snapshot.exists()) throw new Error('Opération non créée');
    });
    
    await runTest('Cutting - DELETE: Supprimer l\'opération', async () => {
        await remove(ref(db, `cutting_operations/${testCuttingId}`));
        const snapshot = await get(ref(db, `cutting_operations/${testCuttingId}`));
        if (snapshot.exists()) throw new Error('Opération non supprimée');
    });
}

/**
 * TEST 9: INCIDENTS & TESTS
 */
async function testIncidentsAndTests() {
    log.section('TEST 9: INCIDENTS & QUALITY TESTS (CRUD)');
    
    // Test Incident
    const testIncidentId = 'test-incident-' + Date.now();
    await runTest('Incidents - CREATE: Créer un incident', async () => {
        const incident = {
            id: testIncidentId,
            date: '2026-02-20',
            siteId: 'test-site',
            type: 'equipment',
            severity: 'medium',
            description: 'Test incident automatique',
            status: 'open'
        };
        await set(ref(db, `incidents/${testIncidentId}`), incident);
        const snapshot = await get(ref(db, `incidents/${testIncidentId}`));
        if (!snapshot.exists()) throw new Error('Incident non créé');
    });
    
    await runTest('Incidents - UPDATE: Résoudre l\'incident', async () => {
        await update(ref(db, `incidents/${testIncidentId}`), {
            status: 'resolved',
            resolutionDate: '2026-02-21'
        });
        const snapshot = await get(ref(db, `incidents/${testIncidentId}`));
        if (snapshot.val().status !== 'resolved') throw new Error('Status non modifié');
    });
    
    await runTest('Incidents - DELETE: Supprimer l\'incident', async () => {
        await remove(ref(db, `incidents/${testIncidentId}`));
        const snapshot = await get(ref(db, `incidents/${testIncidentId}`));
        if (snapshot.exists()) throw new Error('Incident non supprimé');
    });
    
    // Test Periodic Test
    const testPeriodicTestId = 'test-periodic-' + Date.now();
    await runTest('Periodic Tests - CREATE: Créer un test périodique', async () => {
        const periodicTest = {
            id: testPeriodicTestId,
            date: '2026-02-20',
            siteId: 'test-site',
            testType: 'water_quality',
            results: { ph: 7.5, temperature: 25 },
            status: 'completed'
        };
        await set(ref(db, `periodic_tests/${testPeriodicTestId}`), periodicTest);
        const snapshot = await get(ref(db, `periodic_tests/${testPeriodicTestId}`));
        if (!snapshot.exists()) throw new Error('Test non créé');
    });
    
    await runTest('Periodic Tests - DELETE: Supprimer le test', async () => {
        await remove(ref(db, `periodic_tests/${testPeriodicTestId}`));
        const snapshot = await get(ref(db, `periodic_tests/${testPeriodicTestId}`));
        if (snapshot.exists()) throw new Error('Test non supprimé');
    });
}

/**
 * TEST 10: VERIFICATION DES DONNEES EXISTANTES
 */
async function testExistingData() {
    log.section('TEST 10: VÉRIFICATION DES DONNÉES EXISTANTES');
    
    await runTest('Vérifier Sites existants', async () => {
        const snapshot = await get(ref(db, 'sites'));
        if (!snapshot.exists()) throw new Error('Aucun site trouvé');
        const sites = Object.values(snapshot.val());
        log.info(`${sites.length} sites trouvés`);
        if (sites.length < 2) throw new Error('Moins de 2 sites');
    });
    
    await runTest('Vérifier Zones existantes', async () => {
        const snapshot = await get(ref(db, 'zones'));
        if (!snapshot.exists()) throw new Error('Aucune zone trouvée');
        const zones = Object.values(snapshot.val());
        log.info(`${zones.length} zones trouvées`);
        if (zones.length < 3) throw new Error('Moins de 3 zones');
    });
    
    await runTest('Vérifier Modules existants', async () => {
        const snapshot = await get(ref(db, 'modules'));
        if (!snapshot.exists()) throw new Error('Aucun module trouvé');
        const modules = Object.values(snapshot.val());
        log.info(`${modules.length} modules trouvés`);
        if (modules.length < 3) throw new Error('Moins de 3 modules');
    });
    
    await runTest('Vérifier Employees existants', async () => {
        const snapshot = await get(ref(db, 'employees'));
        if (!snapshot.exists()) throw new Error('Aucun employé trouvé');
        const employees = Object.values(snapshot.val());
        log.info(`${employees.length} employés trouvés`);
    });
    
    await runTest('Vérifier Farmers existants', async () => {
        const snapshot = await get(ref(db, 'farmers'));
        if (!snapshot.exists()) throw new Error('Aucun agriculteur trouvé');
        const farmers = Object.values(snapshot.val());
        log.info(`${farmers.length} agriculteurs trouvés`);
    });
}

/**
 * FONCTION PRINCIPALE
 */
async function runAllTests() {
    log.title();
    console.log(`${colors.bright}${colors.cyan}╔${'═'.repeat(78)}╗${colors.reset}`);
    console.log(`${colors.bright}${colors.cyan}║${' '.repeat(20)}SEAFARM MONITOR - TEST COMPLET${' '.repeat(26)}║${colors.reset}`);
    console.log(`${colors.bright}${colors.cyan}║${' '.repeat(25)}Tests automatisés CRUD${' '.repeat(30)}║${colors.reset}`);
    console.log(`${colors.bright}${colors.cyan}╚${'═'.repeat(78)}╝${colors.reset}`);
    
    try {
        // Exécuter tous les tests
        await testSitesManagement();
        await testZonesManagement();
        await testModulesManagement();
        await testEmployeesManagement();
        await testFarmersManagement();
        await testCultivationCycles();
        await testCreditsAndPayments();
        await testStockOperations();
        await testIncidentsAndTests();
        await testExistingData();
        
        // Afficher le résumé
        log.title();
        log.section('RÉSUMÉ DES TESTS');
        console.log(`${colors.bright}Total tests: ${testResults.total}${colors.reset}`);
        console.log(`${colors.green}✓ Réussis: ${testResults.passed}${colors.reset}`);
        console.log(`${colors.red}✗ Échoués: ${testResults.failed}${colors.reset}`);
        console.log(`${colors.yellow}⚠ Avertissements: ${testResults.warnings}${colors.reset}`);
        
        const successRate = ((testResults.passed / testResults.total) * 100).toFixed(2);
        console.log(`\n${colors.bright}Taux de réussite: ${successRate}%${colors.reset}`);
        
        if (testResults.failed > 0) {
            log.section('ERREURS DÉTAILLÉES');
            testResults.errors.forEach((err, index) => {
                console.log(`${colors.red}${index + 1}. ${err.test}${colors.reset}`);
                console.log(`   ${colors.yellow}→ ${err.error}${colors.reset}`);
            });
        }
        
        log.title();
        
        if (testResults.failed === 0) {
            console.log(`${colors.bright}${colors.green}✓✓✓ TOUS LES TESTS SONT RÉUSSIS ! ✓✓✓${colors.reset}`);
        } else {
            console.log(`${colors.bright}${colors.red}✗✗✗ CERTAINS TESTS ONT ÉCHOUÉ ✗✗✗${colors.reset}`);
        }
        
        process.exit(testResults.failed === 0 ? 0 : 1);
        
    } catch (error) {
        log.error(`Erreur fatale: ${error.message}`);
        console.error(error);
        process.exit(1);
    }
}

// Lancer les tests
runAllTests().catch(console.error);
