import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://kxujxjcuyfbvmzahyzcv.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt4dWp4amN1eWZidm16YWh5emN2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI1MjEyMTQsImV4cCI6MjA1ODA5NzIxNH0.vCbfqfKWfPw-i4HRzV7Rp3T-eW2TwfJOgB8N8lK9xg0';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testSync() {
  console.log('🔍 Test de synchronisation Supabase après correction RLS\n');
  
  // Test 1: Vérifier l'état du RLS
  console.log('📋 Test 1: Vérification de l\'état du RLS...');
  const { data: rlsStatus, error: rlsError } = await supabase.rpc('exec_sql', {
    query: `SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname='public' AND tablename IN ('sites','employees','farmers','seaweed_types')`
  }).catch(() => ({ data: null, error: 'Cannot check RLS status (RPC not available)' }));
  
  if (rlsError) {
    console.log('⚠️  Impossible de vérifier le RLS via RPC');
  } else if (rlsStatus) {
    console.log('✅ État RLS:', JSON.stringify(rlsStatus, null, 2));
  }
  
  // Test 2: Tenter d'insérer un site
  console.log('\n📋 Test 2: Tentative d\'insertion d\'un site...');
  const testSite = {
    id: `test-site-${Date.now()}`,
    name: 'Site Test Sync',
    code: `TEST-${Date.now()}`,
    location: 'Test Location'
  };
  
  const { data: siteData, error: siteError } = await supabase
    .from('sites')
    .insert(testSite)
    .select();
  
  if (siteError) {
    console.error('❌ Erreur insertion site:', siteError);
  } else {
    console.log('✅ Site inséré avec succès:', siteData);
  }
  
  // Test 3: Tenter d'insérer un type d'algue
  console.log('\n📋 Test 3: Tentative d\'insertion d\'un type d\'algue...');
  const testSeaweed = {
    id: `test-seaweed-${Date.now()}`,
    name: 'Algue Test Sync',
    code: `ALG-${Date.now()}`,
    current_price_wet_per_kg: 500,
    current_price_dry_per_kg: 2000
  };
  
  const { data: seaweedData, error: seaweedError } = await supabase
    .from('seaweed_types')
    .insert(testSeaweed)
    .select();
  
  if (seaweedError) {
    console.error('❌ Erreur insertion type d\'algue:', seaweedError);
  } else {
    console.log('✅ Type d\'algue inséré avec succès:', seaweedData);
  }
  
  // Test 4: Vérifier les données existantes
  console.log('\n📋 Test 4: Vérification des données existantes...');
  const { data: allSites, error: sitesError } = await supabase
    .from('sites')
    .select('*');
  
  if (sitesError) {
    console.error('❌ Erreur lecture sites:', sitesError);
  } else {
    console.log(`✅ Nombre de sites dans Supabase: ${allSites?.length || 0}`);
    if (allSites && allSites.length > 0) {
      console.log('Sites:', allSites.map(s => `${s.name} (${s.code})`).join(', '));
    }
  }
  
  const { data: allSeaweeds, error: seaweedsError } = await supabase
    .from('seaweed_types')
    .select('*');
  
  if (seaweedsError) {
    console.error('❌ Erreur lecture types d\'algues:', seaweedsError);
  } else {
    console.log(`✅ Nombre de types d'algues dans Supabase: ${allSeaweeds?.length || 0}`);
    if (allSeaweeds && allSeaweeds.length > 0) {
      console.log('Types:', allSeaweeds.map(s => `${s.name} (${s.code})`).join(', '));
    }
  }
  
  console.log('\n✨ Tests terminés');
}

testSync().catch(console.error);
