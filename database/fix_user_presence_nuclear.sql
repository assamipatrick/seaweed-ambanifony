-- ============================================
-- NUCLEAR OPTION: DROP & RECREATE user_presence
-- SeaFarm Monitoring Application
-- ⚠️ ATTENTION: Cette méthode supprime et recrée la table
-- ============================================

-- ÉTAPE 0: Vérifier si la table contient des données
SELECT 
    COUNT(*) as row_count,
    CASE 
        WHEN COUNT(*) = 0 THEN '✅ Table vide - Sûr de supprimer'
        ELSE '⚠️ ATTENTION: Table contient des données!'
    END as status
FROM user_presence;

-- ============================================
-- SI LE COUNT EST 0, CONTINUER CI-DESSOUS
-- SI > 0, NE PAS EXÉCUTER LE RESTE !
-- ============================================

-- ÉTAPE 1: Retirer de la publication Real-Time
ALTER PUBLICATION supabase_realtime DROP TABLE IF EXISTS user_presence;

-- ÉTAPE 2: Supprimer complètement la table (et toutes ses politiques)
DROP TABLE IF EXISTS user_presence CASCADE;

-- ÉTAPE 3: Recréer la table proprement
CREATE TABLE user_presence (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'online' CHECK (status IN ('online', 'away', 'offline')),
    last_seen TIMESTAMPTZ DEFAULT NOW(),
    current_page TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ÉTAPE 4: Activer RLS
ALTER TABLE user_presence ENABLE ROW LEVEL SECURITY;

-- ÉTAPE 5: Créer UNE SEULE politique propre
CREATE POLICY "allow_all_user_presence" 
ON user_presence 
FOR ALL 
USING (true);

-- ÉTAPE 6: Réajouter à la publication Real-Time
ALTER PUBLICATION supabase_realtime ADD TABLE user_presence;

-- ÉTAPE 7: Créer index pour performance
CREATE INDEX idx_user_presence_status ON user_presence(status, last_seen);

-- ============================================
-- VÉRIFICATIONS FINALES
-- ============================================

-- Vérifier que la table existe
SELECT tablename, schemaname 
FROM pg_tables 
WHERE tablename = 'user_presence';

-- Vérifier la politique RLS (doit avoir 1 seule ligne)
SELECT policyname, cmd 
FROM pg_policies 
WHERE tablename = 'user_presence';

-- Vérifier Real-Time (doit afficher user_presence)
SELECT tablename 
FROM pg_publication_tables 
WHERE pubname = 'supabase_realtime' 
AND tablename = 'user_presence';

-- Vérifier les index
SELECT indexname, indexdef 
FROM pg_indexes 
WHERE tablename = 'user_presence';

-- ============================================
-- RÉSULTATS ATTENDUS
-- ============================================
-- Étape 0: row_count = 0 (table vide)
-- Vérification 1: user_presence | public
-- Vérification 2: allow_all_user_presence | ALL
-- Vérification 3: user_presence (dans publication)
-- Vérification 4: idx_user_presence_status + primary key
-- ============================================
