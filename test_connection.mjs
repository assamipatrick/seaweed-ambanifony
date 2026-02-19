#!/usr/bin/env node
import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Lire les variables d'environnement depuis .env.local
const envContent = readFileSync(join(__dirname, '.env.local'), 'utf-8');
const envVars = {};
envContent.split('\n').forEach(line => {
  const [key, ...valueParts] = line.split('=');
  if (key && valueParts.length > 0) {
    envVars[key.trim()] = valueParts.join('=').trim();
  }
});

const supabaseUrl = envVars.VITE_SUPABASE_URL;
const supabaseAnonKey = envVars.VITE_SUPABASE_ANON_KEY;

console.log('🔍 Test de connexion Supabase Real-Time\n');
console.log('📡 URL Supabase:', supabaseUrl);
console.log('🔑 Clé API:', supabaseAnonKey ? `${supabaseAnonKey.substring(0, 20)}...` : 'NON TROUVÉE');
console.log('─────────────────────────────────────────────────────\n');

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Erreur: Variables d\'environnement manquantes dans .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testConnection() {
  try {
    // Test 1: Connexion basique
    console.log('1️⃣ Test de connexion à la base de données...');
    const { data: sites, error: sitesError } = await supabase
      .from('sites')
      .select('id, name, code')
      .limit(3);
    
    if (sitesError) {
      console.error('❌ Erreur:', sitesError.message);
      process.exit(1);
    }
    
    console.log('✅ Connexion réussie !');
    console.log(`   Nombre de sites trouvés: ${sites?.length || 0}`);
    if (sites && sites.length > 0) {
      console.log('   Exemples:', sites.map(s => s.name || s.code).join(', '));
    }
    console.log();
    
    // Test 2: Vérifier les modules
    console.log('2️⃣ Test de lecture de la table "modules"...');
    const { count: moduleCount, error: moduleError } = await supabase
      .from('modules')
      .select('*', { count: 'exact', head: true });
    
    if (moduleError) {
      console.error('❌ Erreur:', moduleError.message);
    } else {
      console.log(`✅ ${moduleCount} modules trouvés dans la base`);
    }
    console.log();
    
    // Test 3: Real-Time
    console.log('3️⃣ Test Real-Time (subscription)...');
    console.log('   📡 Création d\'un canal Real-Time...');
    
    const channel = supabase
      .channel('test-channel')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'modules'
        },
        (payload) => {
          console.log('🔴 ÉVÉNEMENT REAL-TIME REÇU:', payload);
        }
      )
      .subscribe((status) => {
        console.log(`   ℹ️  Statut: ${status}`);
        
        if (status === 'SUBSCRIBED') {
          console.log('   ✅ Abonnement Real-Time réussi !');
          console.log('   📡 En écoute des changements sur la table "modules"...\n');
          
          console.log('─────────────────────────────────────────────────────');
          console.log('🎉 TOUS LES TESTS RÉUSSIS !');
          console.log('─────────────────────────────────────────────────────');
          console.log('✅ Connexion Supabase        : OK');
          console.log('✅ Lecture des données       : OK');
          console.log('✅ Real-Time subscription    : OK');
          console.log('─────────────────────────────────────────────────────');
          console.log('\n💡 L\'application est prête à être lancée avec: npm run dev\n');
          
          // Fermer proprement
          setTimeout(() => {
            channel.unsubscribe();
            process.exit(0);
          }, 2000);
        } else if (status === 'CHANNEL_ERROR') {
          console.error('   ❌ Erreur d\'abonnement Real-Time');
          process.exit(1);
        }
      });
    
  } catch (err) {
    console.error('❌ Erreur inattendue:', err.message);
    console.error(err);
    process.exit(1);
  }
}

testConnection();
