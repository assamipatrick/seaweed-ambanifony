import { supabase } from './lib/supabaseClient.js';

console.log('🧪 Test d\'insertion dans Supabase...\n');

async function testInsert() {
  try {
    // Test 1: Vérifier la connexion
    console.log('✅ Test 1: Vérification connexion Supabase');
    const { data: { user } } = await supabase.auth.getUser();
    console.log('   User connecté:', user ? user.email : 'Aucun (mode anonyme)');

    // Test 2: Essayer d'insérer un site
    console.log('\n✅ Test 2: Tentative d\'insertion d\'un site de test');
    const testSite = {
      id: crypto.randomUUID(),
      name: 'Test Site Sync',
      code: 'TEST-SYNC-001',
      location: 'Test Location',
    };

    const { data: insertData, error: insertError } = await supabase
      .from('sites')
      .insert([testSite])
      .select()
      .single();

    if (insertError) {
      console.error('   ❌ ERREUR lors de l\'insertion:', insertError);
      console.error('   Code:', insertError.code);
      console.error('   Message:', insertError.message);
      console.error('   Details:', insertError.details);
      console.error('   Hint:', insertError.hint);
    } else {
      console.log('   ✅ Insertion réussie:', insertData);
      
      // Nettoyage: supprimer le site de test
      console.log('\n✅ Test 3: Nettoyage - Suppression du site de test');
      const { error: deleteError } = await supabase
        .from('sites')
        .delete()
        .eq('id', testSite.id);
      
      if (deleteError) {
        console.error('   ❌ Erreur lors de la suppression:', deleteError);
      } else {
        console.log('   ✅ Site de test supprimé');
      }
    }

    // Test 3: Lire les données
    console.log('\n✅ Test 4: Lecture des sites existants');
    const { data: sites, error: readError } = await supabase
      .from('sites')
      .select('*');
    
    if (readError) {
      console.error('   ❌ Erreur de lecture:', readError);
    } else {
      console.log(`   ✅ ${sites?.length || 0} site(s) trouvé(s)`);
      sites?.forEach(site => {
        console.log(`      - ${site.name} (${site.code})`);
      });
    }

    // Test 4: Vérifier les permissions RLS
    console.log('\n✅ Test 5: Vérification des policies RLS');
    const { data: policies, error: policyError } = await supabase
      .rpc('get_policies_for_table', { table_name: 'sites' })
      .catch(() => null);
    
    if (policies) {
      console.log('   Policies trouvées:', policies);
    } else {
      console.log('   ⚠️  Impossible de récupérer les policies (fonction RPC non disponible)');
    }

  } catch (error) {
    console.error('\n❌ Erreur globale:', error);
  }
}

testInsert();
