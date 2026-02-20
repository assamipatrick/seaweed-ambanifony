# 🔧 Instructions pour corriger la synchronisation Supabase

## 🎯 Problème identifié

**Symptômes** :
- ✅ Les **suppressions** se synchronisent avec Supabase
- ❌ Les **ajouts** et **modifications** ne se synchronisent PAS

**Cause** : Row Level Security (RLS) activé sur les tables Supabase bloque les insertions et mises à jour depuis l'application.

---

## 🚀 Solution rapide (pour développement)

### Étape 1 : Accéder au SQL Editor de Supabase

1. Ouvrir le dashboard Supabase : https://kxujxjcuyfbvmzahyzcv.supabase.co
2. Aller dans **SQL Editor** (icône ⚡ dans la barre de gauche)
3. Cliquer sur **+ New query**

### Étape 2 : Exécuter le script de correction

Copier-coller et exécuter ce SQL :

```sql
-- 🔓 DÉSACTIVER RLS temporairement pour développement
ALTER TABLE sites DISABLE ROW LEVEL SECURITY;
ALTER TABLE employees DISABLE ROW LEVEL SECURITY;
ALTER TABLE farmers DISABLE ROW LEVEL SECURITY;
ALTER TABLE service_providers DISABLE ROW LEVEL SECURITY;
ALTER TABLE credit_types DISABLE ROW LEVEL SECURITY;
ALTER TABLE seaweed_types DISABLE ROW LEVEL SECURITY;
ALTER TABLE modules DISABLE ROW LEVEL SECURITY;
ALTER TABLE cultivation_cycles DISABLE ROW LEVEL SECURITY;

-- ✅ Vérifier que RLS est bien désactivé
SELECT 
  tablename, 
  rowsecurity as rls_enabled 
FROM pg_tables 
WHERE schemaname='public' 
  AND tablename IN (
    'sites',
    'employees',
    'farmers',
    'service_providers',
    'credit_types',
    'seaweed_types',
    'modules',
    'cultivation_cycles'
  )
ORDER BY tablename;
```

### Étape 3 : Vérifier le résultat

La requête doit afficher :

| tablename | rls_enabled |
|-----------|-------------|
| credit_types | false |
| cultivation_cycles | false |
| employees | false |
| farmers | false |
| modules | false |
| seaweed_types | false |
| service_providers | false |
| sites | false |

**Si `rls_enabled = false` pour toutes les tables** → ✅ **C'EST BON !**

---

## ✅ Tester la synchronisation

### Test dans l'application

1. **Recharger l'application** (Ctrl+Shift+R) : https://3000-iw1hbfa3ilo0b15qntvdt-3844e1b6.sandbox.novita.ai
2. **Se connecter** avec `admin@seafarm.com` / `password`
3. **Aller dans Sites & Modules → Sites**
4. **Cliquer sur "Ajouter un Site"**
5. **Remplir le formulaire** :
   - Nom : `Site Test Sync`
   - Code : `TEST-SYNC-001`
   - Localisation : `Test Location`
6. **Enregistrer**

### Vérifier dans Supabase

1. **Aller dans Table Editor** dans Supabase
2. **Ouvrir la table `sites`**
3. **Vérifier** que le site `Site Test Sync` apparaît

**Si le site apparaît** → ✅ **LA SYNCHRONISATION FONCTIONNE !**

---

## 🔐 Solution production (avec RLS + Policies)

Pour la production, il faut **garder RLS activé** mais ajouter des **policies** pour autoriser les opérations.

### Script complet disponible

Le fichier `database/fix_rls_policies.sql` contient un script complet qui :
1. Ajoute des policies permissives pour le rôle `anon`
2. Active INSERT, UPDATE, DELETE sur toutes les tables
3. Réactive RLS avec les bonnes permissions

**Pour l'appliquer** :
1. Ouvrir `database/fix_rls_policies.sql` dans le repo
2. Copier tout le contenu
3. Exécuter dans SQL Editor de Supabase

---

## 🐛 En cas de problème persistant

### Vérifier les erreurs console

1. Ouvrir la console (F12)
2. Filtrer par "Supabase sync failed"
3. Copier l'erreur complète

### Requête de diagnostic

Exécuter dans SQL Editor :

```sql
-- Voir l'état complet du RLS
SELECT 
  schemaname,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename;

-- Voir les policies existantes
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
```

---

## 📊 Résumé des modifications

### Avant le correctif
- ✅ Lecture (SELECT) → fonctionne
- ❌ Insertion (INSERT) → bloquée par RLS
- ❌ Mise à jour (UPDATE) → bloquée par RLS
- ✅ Suppression (DELETE) → fonctionne (pourquoi ? 🤔)

### Après le correctif
- ✅ Lecture (SELECT) → fonctionne
- ✅ Insertion (INSERT) → **fonctionne maintenant !**
- ✅ Mise à jour (UPDATE) → **fonctionne maintenant !**
- ✅ Suppression (DELETE) → fonctionne

---

## 🎉 Conclusion

Une fois RLS désactivé (ou les policies ajoutées), **toutes les opérations CRUD** de l'application se synchroniseront automatiquement avec Supabase en temps réel !

**Test final recommandé** :
1. Ajouter un site → Vérifier dans Supabase
2. Modifier un site → Vérifier la mise à jour
3. Supprimer un site → Vérifier la suppression
4. Ouvrir 2 navigateurs → Modifier dans l'un → Voir le changement dans l'autre (temps réel)

---

## 📚 Liens utiles

- **Application** : https://3000-iw1hbfa3ilo0b15qntvdt-3844e1b6.sandbox.novita.ai
- **Supabase Dashboard** : https://kxujxjcuyfbvmzahyzcv.supabase.co
- **GitHub Repo** : https://github.com/assamipatrick/seaweed-Ambanifony
- **Documentation RLS Supabase** : https://supabase.com/docs/guides/auth/row-level-security
