// Test simple de connexion Real-Time Supabase
const { createClient } = require('@supabase/supabase-js');

// Configuration Supabase
const supabaseUrl = 'https://kxujxjcuyfbvmzahyzcv.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt4dWp4amN1eWZidm16YWh5emN2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzk4NTQxNjEsImV4cCI6MjA1NTQzMDE2MX0.gGkGQFdB-BQXlXHBhEq8iRDCmZW2X_SLf4dL25YhQoU';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testRealtime() {
  console.log('🔍 Test de connexion Real-Time Supabase...\n');
  
  try {
    // Test 1: Connexion basique
    console.log('1️⃣ Test de connexion basique...');
    const { data, error } = await supabase.from('sites').select('count').limit(1);
    
    if (error) {
      console.error('❌ Erreur de connexion:', error.message);
      process.exit(1);
    }
    
    console.log('✅ Connexion Supabase OK\n');
    
    // Test 2: Vérifier les tables Real-Time
    console.log('2️⃣ Test Real-Time sur la table "modules"...');
    
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
          console.log('🔴 Changement détecté en temps réel:', payload);
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('✅ Real-Time ACTIF - Abonnement réussi !');
          console.log('📡 En écoute des changements sur la table "modules"...\n');
          console.log('ℹ️  Pour tester : allez dans le Table Editor Supabase et modifiez un module');
          console.log('   https://kxujxjcuyfbvmzahyzcv.supabase.co/project/kxujxjcuyfbvmzahyzcv/editor\n');
          console.log('⏱️  Fermeture automatique dans 10 secondes...');
          
          setTimeout(() => {
            console.log('\n✅ Test terminé avec succès !');
            console.log('🎉 Real-Time fonctionne parfaitement !');
            process.exit(0);
          }, 10000);
        } else if (status === 'CHANNEL_ERROR') {
          console.error('❌ Erreur Real-Time:', status);
          process.exit(1);
        } else {
          console.log('ℹ️  Statut:', status);
        }
      });
    
  } catch (err) {
    console.error('❌ Erreur:', err.message);
    process.exit(1);
  }
}

testRealtime();
