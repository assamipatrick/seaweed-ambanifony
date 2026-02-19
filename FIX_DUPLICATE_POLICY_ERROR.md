# 🔧 Correction Erreur Politique RLS Dupliquée

## ❌ Problème Rencontré

```
Error: Failed to run sql query: ERROR: 42710: policy "Allow all access to user_presence" 
for table "user_presence" already exists
```

### Cause
La politique RLS `"Allow all access to user_presence"` a été créée deux fois :
1. Une fois dans `realtime_config_simple.sql` (ligne 109)
2. Une autre tentative lors d'un second déploiement

## ✅ Solution

### Étape 1 : Exécuter le Script de Correction

1. Ouvrir le **SQL Editor** de Supabase :
   https://kxujxjcuyfbvmzahyzcv.supabase.co/project/kxujxjcuyfbvmzahyzcv/sql/new

2. Copier le contenu du fichier **`database/fix_duplicate_policies.sql`**

3. Coller dans l'éditeur SQL

4. Cliquer sur **Run** ▶️

### Étape 2 : Vérifier le Résultat

Le script affichera deux résultats :

**Résultat 1 : Politiques sur user_presence**
```
schemaname | tablename      | policyname                          | permissive | roles  | cmd | qual
-----------+----------------+-------------------------------------+------------+--------+-----+------
public     | user_presence  | Allow all access to user_presence   | PERMISSIVE | public | ALL | true
```
✅ **Une seule ligne** = Succès !

**Résultat 2 : Vérification Real-Time**
```
tablename
----------------
user_presence
```
✅ Table présente dans la publication Real-Time

---

## 📋 Ce que Fait le Script

### 1. Nettoyage des Politiques Dupliquées
```sql
-- Désactiver temporairement RLS
ALTER TABLE user_presence DISABLE ROW LEVEL SECURITY;

-- Supprimer TOUTES les politiques existantes
DROP POLICY IF EXISTS "Allow all access to user_presence" ON user_presence;
DROP POLICY IF EXISTS "Users can read all presence" ON user_presence;
DROP POLICY IF EXISTS "Users can insert their own presence" ON user_presence;
DROP POLICY IF EXISTS "Users can update their own presence" ON user_presence;
```

### 2. Réactivation Propre
```sql
-- Réactiver RLS
ALTER TABLE user_presence ENABLE ROW LEVEL SECURITY;

-- Créer UNE SEULE politique permissive
CREATE POLICY "Allow all access to user_presence" 
ON user_presence 
FOR ALL 
USING (true);
```

### 3. Vérifications Automatiques
- Liste les politiques restantes (doit en avoir 1 seule)
- Vérifie que `user_presence` est toujours dans la publication Real-Time

---

## 🧪 Test Après Correction

### Option 1 : Test SQL Simple
```sql
-- Insérer un enregistrement de test
INSERT INTO user_presence (user_id, status, current_page)
SELECT id, 'online', '/dashboard'
FROM users 
LIMIT 1;

-- Lire les données
SELECT * FROM user_presence;

-- Nettoyer
DELETE FROM user_presence;
```

### Option 2 : Vérifier la Vérification Real-Time
```sql
-- Confirmer que les 24 tables sont toujours actives
SELECT COUNT(*) as tables_realtime 
FROM pg_publication_tables 
WHERE pubname = 'supabase_realtime';
```
✅ Résultat attendu : **24** (ou plus)

---

## 🔍 Pourquoi Cette Erreur ?

### Scénario Probable
1. Vous avez exécuté `realtime_config_simple.sql` ✅
   - Créé la table `user_presence`
   - Créé la politique RLS

2. Plus tard, vous avez réexécuté le même script ou un script contenant les mêmes commandes ❌
   - Tentative de recréer la politique
   - Erreur : politique déjà existante

### Prévention Future
- ✅ Utiliser `CREATE POLICY IF NOT EXISTS` (PostgreSQL 9.5+)
- ✅ Utiliser `DROP POLICY IF EXISTS` avant `CREATE POLICY`
- ✅ Documenter les scripts déjà exécutés

---

## 📊 État Après Correction

### Avant (Erreur)
```
❌ Politique "Allow all access to user_presence" existe déjà
❌ Impossible d'exécuter le script
❌ Real-Time fonctionne MAIS erreurs dans les logs
```

### Après (Corrigé)
```
✅ Politique unique "Allow all access to user_presence"
✅ RLS actif sur user_presence
✅ Table dans publication supabase_realtime
✅ Real-Time opérationnel sans erreurs
```

---

## 🎯 Actions Recommandées

### 1. Exécuter le Script de Correction (5 secondes)
```
👉 Ouvrir SQL Editor
👉 Copier database/fix_duplicate_policies.sql
👉 Exécuter
👉 Vérifier : 1 politique + table dans publication
```

### 2. Tester Real-Time (30 secondes)
```typescript
import { supabase } from './services/supabaseClient';

// Test subscription
const channel = supabase
  .channel('presence-test')
  .on('postgres_changes',
    { event: '*', schema: 'public', table: 'user_presence' },
    (payload) => console.log('✅ Real-Time fonctionne !', payload)
  )
  .subscribe();
```

### 3. Continuer le Développement
- Real-Time est toujours opérationnel
- Les 24 tables sont toujours actives
- Aucune autre action requise

---

## 🔗 Liens Utiles

- **SQL Editor** : https://kxujxjcuyfbvmzahyzcv.supabase.co/project/kxujxjcuyfbvmzahyzcv/sql/new
- **Script de correction** : `database/fix_duplicate_policies.sql`
- **Documentation RLS** : https://supabase.com/docs/guides/auth/row-level-security

---

## 📝 Résumé

| Élément | État |
|---------|------|
| **Problème** | ❌ Politique RLS dupliquée |
| **Impact** | Erreur lors du déploiement, mais Real-Time fonctionne |
| **Solution** | ✅ Script `fix_duplicate_policies.sql` |
| **Temps de correction** | < 1 minute |
| **Real-Time affecté ?** | Non, toujours opérationnel |
| **Autres tables affectées ?** | Non, seulement `user_presence` |

---

## ✨ Après Correction

Une fois le script exécuté, vous aurez :
- ✅ Une seule politique RLS sur `user_presence`
- ✅ Real-Time fonctionnel sur 24 tables
- ✅ Aucune erreur dans les logs
- ✅ Prêt pour le développement

**Temps total de résolution : < 2 minutes** ⏱️

---

**Créé le** : 2026-02-19  
**Statut** : 🔧 Correction Disponible  
**Priorité** : Faible (n'affecte pas le fonctionnement)
