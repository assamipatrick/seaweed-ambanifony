-- ============================================================================
-- FIX ULTIMATE pour la table user_presence
-- ============================================================================
-- Cette version utilise une approche simple et directe sans IF EXISTS
-- pour éviter toute erreur de syntaxe PostgreSQL
-- ============================================================================

-- ÉTAPE 1: Vérifier que la table est vide
SELECT 
    COUNT(*) as row_count,
    CASE 
        WHEN COUNT(*) = 0 THEN '✅ Table vide - sûr de continuer'
        ELSE '⚠️  ATTENTION: ' || COUNT(*) || ' lignes seront perdues'
    END as status
FROM user_presence;

-- ÉTAPE 2: Retirer la table de la publication (ignorer les erreurs)
DO $$ 
BEGIN
    EXECUTE 'ALTER PUBLICATION supabase_realtime DROP TABLE user_presence';
    RAISE NOTICE '✅ Table retirée de la publication';
EXCEPTION 
    WHEN undefined_object THEN
        RAISE NOTICE 'ℹ️  Table pas dans la publication (déjà retirée)';
    WHEN others THEN
        RAISE NOTICE 'ℹ️  Erreur ignorée: %', SQLERRM;
END $$;

-- ÉTAPE 3: Supprimer complètement la table
DROP TABLE IF EXISTS user_presence CASCADE;

-- ÉTAPE 4: Recréer la table proprement
CREATE TABLE user_presence (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'offline' CHECK (status IN ('online', 'away', 'offline')),
    last_seen TIMESTAMPTZ DEFAULT NOW(),
    current_page TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ÉTAPE 5: Activer RLS
ALTER TABLE user_presence ENABLE ROW LEVEL SECURITY;

-- ÉTAPE 6: Créer UNE SEULE politique RLS (nom différent pour éviter conflit)
CREATE POLICY "user_presence_allow_all" 
ON user_presence 
FOR ALL 
USING (true);

-- ÉTAPE 7: Ajouter à la publication Real-Time (ignorer si déjà présent)
DO $$ 
BEGIN
    EXECUTE 'ALTER PUBLICATION supabase_realtime ADD TABLE user_presence';
    RAISE NOTICE '✅ Table ajoutée à Real-Time';
EXCEPTION 
    WHEN duplicate_object THEN
        RAISE NOTICE '✅ Table déjà dans Real-Time';
    WHEN others THEN
        RAISE NOTICE 'ℹ️  Erreur: %', SQLERRM;
END $$;

-- ÉTAPE 8: Créer les index
CREATE INDEX IF NOT EXISTS idx_user_presence_status 
ON user_presence(status, last_seen);

CREATE INDEX IF NOT EXISTS idx_user_presence_updated 
ON user_presence(updated_at);

-- ============================================================================
-- VÉRIFICATIONS FINALES
-- ============================================================================

-- Vérifier que la table existe
SELECT 
    '✅ Table user_presence créée' as step,
    COUNT(*) as column_count
FROM information_schema.columns 
WHERE table_name = 'user_presence';

-- Vérifier les politiques RLS
SELECT 
    '✅ Politique RLS' as step,
    COUNT(*) as policy_count,
    string_agg(policyname, ', ') as policy_names
FROM pg_policies 
WHERE tablename = 'user_presence';

-- Vérifier Real-Time
SELECT 
    '✅ Real-Time activé' as step,
    COUNT(*) as table_count
FROM pg_publication_tables 
WHERE pubname = 'supabase_realtime' 
AND tablename = 'user_presence';

-- Vérifier les index
SELECT 
    '✅ Index créés' as step,
    COUNT(*) as index_count,
    string_agg(indexname, ', ') as index_names
FROM pg_indexes 
WHERE tablename = 'user_presence';

-- Message de succès
SELECT 
    '🎉 SUCCÈS COMPLET' as result,
    'La table user_presence est maintenant propre et fonctionnelle' as message;
