# 🔧 PROBLÈME : Synchronisation Supabase Incomplète

## 🐛 Symptômes Observés

✅ **Fonctionne :**
- Suppression de données → Synchronisée avec Supabase
- Lecture de données → Fonctionne

❌ **Ne fonctionne PAS :**
- Ajout de sites → Non synchronisé
- Ajout de types d'algues → Non synchronisé
- Modification de données → Non synchronisée

## 🔍 Cause Probable

**Row Level Security (RLS)** dans Supabase bloque les insertions et mises à jour.

Les **suppressions fonctionnent** car il y a probablement une policy DELETE permissive, mais pas de policies pour INSERT et UPDATE.

---

## ✅ SOLUTION IMMÉDIATE

### Étape 1 : Vérifier les Erreurs Console

1. **Ouvrir F12** (Console)
2. **Ajouter un site**
3. **Chercher dans la console :**
   ```
   [addSite] Supabase sync failed: ...
   [addEmployee] Supabase sync failed: ...
   ```

**Si vous voyez ces erreurs, copiez-les et envoyez-les moi.**

### Étape 2 : Exécuter le Script de Correction

**Sur Supabase Dashboard :**

1. Aller sur : https://kxujxjcuyfbvmzahyzcv.supabase.co
2. Cliquer sur **"SQL Editor"** dans le menu de gauche
3. Cliquer sur **"New query"**
4. Copier-coller le contenu du fichier `database/fix_rls_policies.sql`
5. Cliquer sur **"Run"** (▶️)

**Ce script va :**
- Créer des policies permissives pour INSERT, UPDATE, DELETE
- Permettre les opérations anonymes (mode dev)
- Réactiver RLS avec les nouvelles policies

### Étape 3 : Tester à Nouveau

1. Recharger l'application
2. Ajouter un site
3. Vérifier dans Supabase → Table "sites"
4. ✅ Le site devrait apparaître !

---

## 🔒 Alternative : Désactiver Complètement RLS (Temporaire)

**⚠️ UNIQUEMENT EN DÉVELOPPEMENT**

Sur Supabase SQL Editor, exécuter :

```sql
-- Désactiver RLS sur toutes les tables
ALTER TABLE sites DISABLE ROW LEVEL SECURITY;
ALTER TABLE employees DISABLE ROW LEVEL SECURITY;
ALTER TABLE farmers DISABLE ROW LEVEL SECURITY;
ALTER TABLE service_providers DISABLE ROW LEVEL SECURITY;
ALTER TABLE credit_types DISABLE ROW LEVEL SECURITY;
ALTER TABLE seaweed_types DISABLE ROW LEVEL SECURITY;
ALTER TABLE modules DISABLE ROW LEVEL SECURITY;
ALTER TABLE cultivation_cycles DISABLE ROW LEVEL SECURITY;

-- Vérification
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE tablename IN ('sites', 'employees', 'farmers');
```

**Résultat attendu :**
```
tablename  | rowsecurity
-----------+-------------
sites      | false
employees  | false
farmers    | false
```

---

## 🧪 Test de Diagnostic

Exécutez ce test pour voir l'erreur exacte :

```bash
cd /home/user/webapp
node test_insert_supabase.mjs
```

**Ou dans la console du navigateur (F12) :**

```javascript
// Test d'insertion directe
import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2').then(({ createClient }) => {
  const supabase = createClient(
    'https://kxujxjcuyfbvmzahyzcv.supabase.co',
    'sb_publishable_ufzODkevI8XjDtRhGkgo7Q_zN6QKORd'
  );
  
  return supabase.from('sites').insert([{
    id: crypto.randomUUID(),
    name: 'Test Sync',
    code: 'TEST-001',
    location: 'Test'
  }]).select();
}).then(({ data, error }) => {
  if (error) {
    console.error('❌ ERREUR:', error);
    console.error('Code:', error.code);
    console.error('Message:', error.message);
  } else {
    console.log('✅ SUCCÈS:', data);
  }
});
```

---

## 📋 Erreurs Possibles

### Erreur 1 : "new row violates row-level security policy"
**Cause :** RLS bloque l'insertion  
**Solution :** Exécuter `fix_rls_policies.sql`

### Erreur 2 : "permission denied for table"
**Cause :** Role anon n'a pas les permissions  
**Solution :** Accorder les permissions :
```sql
GRANT ALL ON sites TO anon;
GRANT ALL ON employees TO anon;
GRANT ALL ON farmers TO anon;
-- etc...
```

### Erreur 3 : "duplicate key value violates unique constraint"
**Cause :** ID existe déjà  
**Solution :** Vérifier la génération d'UUID (`crypto.randomUUID()`)

### Erreur 4 : "null value in column violates not-null constraint"
**Cause :** Champ obligatoire manquant  
**Solution :** Vérifier les types dans `types.ts` vs schema Supabase

---

## 🎯 Actions Immédiates

**FAITES CECI MAINTENANT :**

1. ✅ **Ouvrir F12** et ajouter un site
2. ✅ **Copier les erreurs** `[addSite] Supabase sync failed: ...`
3. ✅ **Aller sur Supabase Dashboard** : https://kxujxjcuyfbvmzahyzcv.supabase.co
4. ✅ **SQL Editor** → Exécuter `fix_rls_policies.sql`
5. ✅ **Tester à nouveau**

---

## 📊 Vérification des Policies

Pour voir les policies actuelles :

```sql
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename IN ('sites', 'employees', 'farmers')
ORDER BY tablename, cmd;
```

---

## 🔗 Fichiers Créés

1. **`database/fix_rls_policies.sql`** - Script de correction RLS
2. **`test_insert_supabase.mjs`** - Test d'insertion
3. **`RLS_SYNC_ISSUE.md`** - Ce document

---

## 💡 Note Importante

**En développement**, il est souvent plus simple de **désactiver RLS complètement**.

**En production**, vous devrez :
1. Implémenter Supabase Auth
2. Créer des policies basées sur l'utilisateur connecté
3. Utiliser `auth.uid()` dans les policies

---

## 🆘 Si Rien Ne Fonctionne

Envoyez-moi :
1. ✅ Les erreurs console (`[addSite] Supabase sync failed: ...`)
2. ✅ Le résultat de ce SQL :
   ```sql
   SELECT tablename, rowsecurity FROM pg_tables 
   WHERE tablename IN ('sites', 'employees', 'farmers');
   ```
3. ✅ Le résultat du test `node test_insert_supabase.mjs`

---

**J'attends vos retours pour débloquer la synchronisation ! 🔧**
