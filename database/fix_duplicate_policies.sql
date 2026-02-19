-- ============================================
-- FIX DUPLICATE POLICIES
-- SeaFarm Monitoring Application
-- Résout le problème de politique RLS dupliquée
-- ============================================

-- Désactiver temporairement RLS pour nettoyer
ALTER TABLE user_presence DISABLE ROW LEVEL SECURITY;

-- Supprimer toutes les politiques existantes sur user_presence
DROP POLICY IF EXISTS "Allow all access to user_presence" ON user_presence;
DROP POLICY IF EXISTS "Users can read all presence" ON user_presence;
DROP POLICY IF EXISTS "Users can insert their own presence" ON user_presence;
DROP POLICY IF EXISTS "Users can update their own presence" ON user_presence;

-- Réactiver RLS
ALTER TABLE user_presence ENABLE ROW LEVEL SECURITY;

-- Créer UNE SEULE politique permissive pour le développement
CREATE POLICY "Allow all access to user_presence" 
ON user_presence 
FOR ALL 
USING (true);

-- ============================================
-- VÉRIFICATION
-- ============================================

-- Afficher les politiques actuelles sur user_presence
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies 
WHERE tablename = 'user_presence';

-- Vérifier que la table est bien dans la publication real-time
SELECT tablename 
FROM pg_publication_tables 
WHERE pubname = 'supabase_realtime' 
AND tablename = 'user_presence';

-- ============================================
-- RÉSULTAT ATTENDU
-- ============================================
-- Vous devriez voir :
-- 1. UNE SEULE politique nommée "Allow all access to user_presence"
-- 2. La table user_presence dans la publication supabase_realtime
-- ============================================
