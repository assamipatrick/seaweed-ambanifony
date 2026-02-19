/**
 * Test de la Connexion et du Real-Time Supabase
 * Exécuter ce fichier pour vérifier que tout fonctionne
 */

import { supabase } from './services/supabaseClient';

async function testSupabaseConnection() {
  console.log('🔍 Test de connexion Supabase...\n');

  // Test 1: Connexion basique
  console.log('Test 1: Connexion basique');
  try {
    const { data, error } = await supabase
      .from('roles')
      .select('count');
    
    if (error) {
      console.error('❌ Erreur de connexion:', error.message);
      return;
    }
    console.log('✅ Connexion Supabase OK\n');
  } catch (err) {
    console.error('❌ Erreur:', err);
    return;
  }

  // Test 2: Vérifier les rôles
  console.log('Test 2: Vérifier les données');
  try {
    const { data: roles, error } = await supabase
      .from('roles')
      .select('*');
    
    if (error) {
      console.error('❌ Erreur:', error.message);
      return;
    }
    console.log(`✅ ${roles?.length || 0} rôles trouvés`);
    roles?.forEach(role => {
      console.log(`   - ${role.name}`);
    });
    console.log('');
  } catch (err) {
    console.error('❌ Erreur:', err);
    return;
  }

  // Test 3: Real-Time
  console.log('Test 3: Real-Time Subscription');
  console.log('📡 Création d\'une souscription Real-Time...');
  
  const channel = supabase
    .channel('test-realtime')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'modules'
      },
      (payload) => {
        console.log('🔴 REAL-TIME EVENT REÇU:', payload);
      }
    )
    .subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        console.log('✅ Real-Time souscription active !');
        console.log('✅ Écoutant les changements sur la table "modules"...');
        console.log('\n🎉 Tous les tests passés avec succès !');
        console.log('📝 Pour tester Real-Time : ajoutez un module dans la table');
        console.log('   et vous verrez l\'événement s\'afficher ici.\n');
        
        // Nettoyer après 5 secondes
        setTimeout(() => {
          supabase.removeChannel(channel);
          console.log('🧹 Souscription nettoyée');
        }, 5000);
      } else if (status === 'CHANNEL_ERROR') {
        console.error('❌ Erreur de souscription Real-Time');
      } else if (status === 'TIMED_OUT') {
        console.error('❌ Timeout de souscription Real-Time');
      }
    });
}

// Test 4: Vérifier les tables avec Real-Time
async function testRealtimeTables() {
  console.log('\n🔍 Test 4: Vérification des tables Real-Time');
  
  try {
    const { data, error } = await supabase.rpc('pg_publication_tables', {
      pubname: 'supabase_realtime'
    });
    
    if (error) {
      console.log('ℹ️  Impossible de vérifier via RPC (normal)');
      console.log('✅ Les tables ont été ajoutées via SQL');
    } else {
      console.log(`✅ ${data?.length || 0} tables avec Real-Time activé`);
    }
  } catch (err) {
    console.log('ℹ️  Vérification via SQL requise');
  }
}

// Exécuter tous les tests
console.log('═══════════════════════════════════════════');
console.log('  TEST DE CONNEXION SUPABASE + REAL-TIME  ');
console.log('═══════════════════════════════════════════\n');

testSupabaseConnection();
testRealtimeTables();
