-- ============================================
-- FIX DUPLICATE POLICIES V2 (FORCE)
-- SeaFarm Monitoring Application
-- Version plus agressive pour supprimer les doublons
-- ============================================

-- ÉTAPE 1: Lister toutes les politiques existantes sur user_presence
-- (Pour diagnostic)
SELECT policyname, cmd, qual
FROM pg_policies 
WHERE tablename = 'user_presence';

-- ÉTAPE 2: Désactiver RLS complètement
ALTER TABLE user_presence DISABLE ROW LEVEL SECURITY;

-- ÉTAPE 3: Supprimer les politiques en forçant (sans IF EXISTS)
-- Note: Certaines peuvent échouer si elles n'existent pas, c'est normal

DO $$ 
BEGIN
    -- Essayer de supprimer chaque politique possible
    BEGIN
        DROP POLICY "Allow all access to user_presence" ON user_presence;
    EXCEPTION WHEN undefined_object THEN
        NULL; -- Ignore si n'existe pas
    END;
    
    BEGIN
        DROP POLICY "Users can read all presence" ON user_presence;
    EXCEPTION WHEN undefined_object THEN
        NULL;
    END;
    
    BEGIN
        DROP POLICY "Users can insert their own presence" ON user_presence;
    EXCEPTION WHEN undefined_object THEN
        NULL;
    END;
    
    BEGIN
        DROP POLICY "Users can update their own presence" ON user_presence;
    EXCEPTION WHEN undefined_object THEN
        NULL;
    END;
END $$;

-- ÉTAPE 4: Vérifier qu'il ne reste plus aucune politique
SELECT COUNT(*) as remaining_policies
FROM pg_policies 
WHERE tablename = 'user_presence';
-- Résultat attendu: 0

-- ÉTAPE 5: Réactiver RLS
ALTER TABLE user_presence ENABLE ROW LEVEL SECURITY;

-- ÉTAPE 6: Créer la nouvelle politique propre
CREATE POLICY "allow_all_user_presence" 
ON user_presence 
FOR ALL 
USING (true);

-- ÉTAPE 7: Vérification finale
SELECT schemaname, tablename, policyname, permissive, cmd
FROM pg_policies 
WHERE tablename = 'user_presence';
-- Résultat attendu: 1 politique nommée "allow_all_user_presence"

-- ÉTAPE 8: Vérifier Real-Time
SELECT tablename 
FROM pg_publication_tables 
WHERE pubname = 'supabase_realtime' 
AND tablename = 'user_presence';
-- Résultat attendu: user_presence

-- ============================================
-- RÉSULTAT ATTENDU
-- ============================================
-- Étape 1: Liste des politiques existantes (diagnostic)
-- Étape 4: 0 politiques restantes
-- Étape 7: 1 politique nommée "allow_all_user_presence"
-- Étape 8: user_presence dans la publication
-- ============================================
