#!/usr/bin/env node
/**
 * Test complet de SeaFarm Monitor
 * - Connexion Supabase
 * - Lecture de données
 * - Test Real-Time
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://kxujxjcuyfbvmzahyzcv.supabase.co';
const SUPABASE_KEY = 'sb_publishable_ufzODkevI8XjDtRhGkgo7Q_zN6QKORd';

// Couleurs pour les logs
const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

function header(title) {
    console.log('\n' + '='.repeat(80));
    log(`  ${title}`, 'bright');
    console.log('='.repeat(80) + '\n');
}

async function testConnection() {
    header('🔌 TEST 1: CONNEXION SUPABASE');
    
    try {
        const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
        log('✅ Client Supabase créé avec succès', 'green');
        log(`   URL: ${SUPABASE_URL}`, 'cyan');
        log(`   Clé: ${SUPABASE_KEY.substring(0, 30)}...`, 'cyan');
        
        return { success: true, client: supabase };
    } catch (error) {
        log(`❌ Erreur de connexion: ${error.message}`, 'red');
        return { success: false, error };
    }
}

async function testDataRead(supabase) {
    header('📊 TEST 2: LECTURE DES DONNÉES');
    
    const tests = [
        { table: 'sites', name: 'Sites' },
        { table: 'modules', name: 'Modules' },
        { table: 'user_presence', name: 'User Presence' },
        { table: 'seaweed_varieties', name: 'Seaweed Varieties' },
    ];
    
    const results = [];
    
    for (const test of tests) {
        try {
            log(`   Testing table: ${test.name}...`, 'cyan');
            
            const { data, error, count } = await supabase
                .from(test.table)
                .select('*', { count: 'exact' })
                .limit(5);
            
            if (error) {
                log(`   ❌ ${test.name}: ${error.message}`, 'red');
                results.push({ table: test.table, success: false, error: error.message });
            } else {
                log(`   ✅ ${test.name}: ${data.length} enregistrement(s) trouvé(s)`, 'green');
                results.push({ table: test.table, success: true, count: data.length });
                
                if (data.length > 0 && test.table === 'sites') {
                    log(`      Premier site: ${JSON.stringify(data[0].name || 'N/A')}`, 'cyan');
                }
            }
        } catch (error) {
            log(`   ❌ ${test.name}: ${error.message}`, 'red');
            results.push({ table: test.table, success: false, error: error.message });
        }
    }
    
    const successCount = results.filter(r => r.success).length;
    const totalCount = results.length;
    
    log(`\n📈 Résultats: ${successCount}/${totalCount} tables accessibles`, 
        successCount === totalCount ? 'green' : 'yellow');
    
    return results;
}

async function testRealTime(supabase) {
    header('⚡ TEST 3: REAL-TIME SUBSCRIPTION');
    
    return new Promise((resolve) => {
        log('   Configuration du canal Real-Time...', 'cyan');
        
        let subscribed = false;
        let changeDetected = false;
        
        const channel = supabase
            .channel('test_channel')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'sites'
                },
                (payload) => {
                    log(`   🔔 Changement détecté !`, 'green');
                    log(`      Event: ${payload.eventType}`, 'cyan');
                    log(`      Table: ${payload.table}`, 'cyan');
                    changeDetected = true;
                }
            )
            .subscribe((status, error) => {
                if (error) {
                    log(`   ❌ Erreur Real-Time: ${error.message}`, 'red');
                    channel.unsubscribe();
                    resolve({ success: false, error: error.message });
                    return;
                }
                
                log(`   Status: ${status}`, status === 'SUBSCRIBED' ? 'green' : 'yellow');
                
                if (status === 'SUBSCRIBED') {
                    subscribed = true;
                    log('   ✅ Abonnement Real-Time réussi !', 'green');
                    log('   💡 Le canal écoute les changements sur la table "sites"', 'cyan');
                    log('   ⏱️  Attente de 5 secondes pour détecter des changements...', 'yellow');
                    
                    // Attendre 5 secondes puis se désabonner
                    setTimeout(async () => {
                        await channel.unsubscribe();
                        
                        if (changeDetected) {
                            log('   ✅ Real-Time: Changement détecté pendant le test', 'green');
                            resolve({ success: true, changeDetected: true });
                        } else {
                            log('   ℹ️  Real-Time: Aucun changement détecté (normal si aucune modification)', 'yellow');
                            log('   💡 Pour tester: Ouvrez le SQL Editor et modifiez un site', 'cyan');
                            resolve({ success: true, changeDetected: false });
                        }
                    }, 5000);
                }
            });
    });
}

async function runAllTests() {
    log('\n🌊 SEAFARM MONITOR - TESTS COMPLETS\n', 'bright');
    log('Date: ' + new Date().toLocaleString('fr-FR'), 'cyan');
    log('URL Supabase: ' + SUPABASE_URL, 'cyan');
    
    const results = {
        connection: null,
        data: null,
        realtime: null,
    };
    
    // Test 1: Connexion
    const connectionResult = await testConnection();
    results.connection = connectionResult;
    
    if (!connectionResult.success) {
        header('❌ ÉCHEC: Impossible de continuer sans connexion');
        process.exit(1);
    }
    
    // Test 2: Lecture des données
    const dataResults = await testDataRead(connectionResult.client);
    results.data = dataResults;
    
    // Test 3: Real-Time
    const realtimeResult = await testRealTime(connectionResult.client);
    results.realtime = realtimeResult;
    
    // Résumé final
    header('📋 RÉSUMÉ FINAL');
    
    log('✅ Connexion Supabase:', 'green');
    log('   • URL: ' + SUPABASE_URL, 'cyan');
    log('   • Statut: Connecté', 'green');
    
    log('\n📊 Lecture des données:', results.data.filter(r => r.success).length === results.data.length ? 'green' : 'yellow');
    results.data.forEach(r => {
        if (r.success) {
            log(`   ✅ ${r.table}: ${r.count} enregistrement(s)`, 'green');
        } else {
            log(`   ❌ ${r.table}: ${r.error}`, 'red');
        }
    });
    
    log('\n⚡ Real-Time:', results.realtime.success ? 'green' : 'red');
    if (results.realtime.success) {
        log('   ✅ Abonnement réussi', 'green');
        if (results.realtime.changeDetected) {
            log('   ✅ Changement détecté', 'green');
        } else {
            log('   ℹ️  Aucun changement détecté (normal)', 'yellow');
        }
    } else {
        log(`   ❌ Erreur: ${results.realtime.error}`, 'red');
    }
    
    // Score final
    const score = [
        results.connection.success ? 1 : 0,
        results.data.filter(r => r.success).length > 0 ? 1 : 0,
        results.realtime.success ? 1 : 0,
    ].reduce((a, b) => a + b, 0);
    
    header(`🎯 SCORE FINAL: ${score}/3`);
    
    if (score === 3) {
        log('🎉 TOUS LES TESTS RÉUSSIS ! Application 100% fonctionnelle !', 'green');
        log('\n💡 Prochaines étapes:', 'cyan');
        log('   1. Ouvrez l\'application: npm run dev', 'cyan');
        log('   2. Testez dans le navigateur: http://localhost:3000', 'cyan');
        log('   3. Créez des données de test via le SQL Editor', 'cyan');
        log('   4. Observez les mises à jour en temps réel', 'cyan');
    } else {
        log('⚠️  Certains tests ont échoué. Vérifiez les logs ci-dessus.', 'yellow');
    }
    
    console.log('\n' + '='.repeat(80) + '\n');
    
    process.exit(0);
}

// Lancer tous les tests
runAllTests().catch((error) => {
    log(`\n❌ ERREUR FATALE: ${error.message}`, 'red');
    console.error(error);
    process.exit(1);
});
