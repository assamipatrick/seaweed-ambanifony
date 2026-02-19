# Guide de Déploiement - Base de Données Supabase Real-Time

## 📋 Table des Matières
1. [Vue d'ensemble](#vue-densemble)
2. [Prérequis](#prérequis)
3. [Configuration Supabase](#configuration-supabase)
4. [Déploiement du Schéma](#déploiement-du-schéma)
5. [Configuration Real-Time](#configuration-real-time)
6. [Sécurité et RLS](#sécurité-et-rls)
7. [Intégration dans l'Application](#intégration-dans-lapplication)
8. [Tests et Validation](#tests-et-validation)
9. [Maintenance](#maintenance)

---

## 🎯 Vue d'ensemble

Cette application SeaFarm utilise Supabase comme backend avec les fonctionnalités suivantes :
- **Base de données PostgreSQL** complète avec 30+ tables
- **Row Level Security (RLS)** pour la sécurité des données
- **Real-Time Database** pour les mises à jour en temps réel
- **Triggers et fonctions** pour la logique métier automatisée
- **Vues matérialisées** pour les rapports optimisés

## ✅ Prérequis

### Compte Supabase
- Créer un compte sur [supabase.com](https://supabase.com)
- Créer un nouveau projet
- Noter l'URL du projet et la clé API (anon key)

### Outils nécessaires
```bash
# Installer Supabase CLI (optionnel mais recommandé)
npm install -g supabase

# Ou via Homebrew (macOS)
brew install supabase/tap/supabase
```

---

## 🔧 Configuration Supabase

### 1. Créer un Projet Supabase

1. Aller sur [supabase.com](https://supabase.com)
2. Cliquer sur "New Project"
3. Renseigner :
   - **Nom du projet** : seafarm-monitor
   - **Mot de passe de base de données** : (choisir un mot de passe fort)
   - **Région** : Choisir la région la plus proche de vos utilisateurs
4. Cliquer sur "Create new project"

### 2. Récupérer les Identifiants

Une fois le projet créé, aller dans **Project Settings** > **API** :

```env
VITE_SUPABASE_URL=https://[votre-projet].supabase.co
VITE_SUPABASE_ANON_KEY=[votre-clé-anon]
```

### 3. Créer le fichier .env.local

Créer un fichier `.env.local` à la racine du projet :

```bash
# .env.local
VITE_SUPABASE_URL=https://votre-projet.supabase.co
VITE_SUPABASE_ANON_KEY=votre-cle-anon-ici
GEMINI_API_KEY=votre-cle-gemini-ici
```

---

## 📦 Déploiement du Schéma

### Option 1 : Via l'Interface Supabase (Recommandé pour débuter)

1. **Aller dans l'éditeur SQL**
   - Dans votre projet Supabase, cliquer sur "SQL Editor"

2. **Exécuter les scripts dans l'ordre suivant** :

   **a) Schéma de base**
   ```sql
   -- Copier et exécuter le contenu de database/schema.sql
   ```
   - Cliquer sur "New Query"
   - Coller le contenu de `database/schema.sql`
   - Cliquer sur "Run"

   **b) Données de démarrage**
   ```sql
   -- Copier et exécuter le contenu de database/seed_data.sql
   ```

   **c) Fonctions et triggers**
   ```sql
   -- Copier et exécuter le contenu de database/functions_triggers.sql
   ```

   **d) Politiques RLS**
   ```sql
   -- Copier et exécuter le contenu de database/rls_policies.sql
   ```

   **e) Configuration Real-Time**
   ```sql
   -- Copier et exécuter le contenu de database/realtime_config.sql
   ```

### Option 2 : Via Supabase CLI

```bash
# Se connecter à Supabase
supabase login

# Lier votre projet
supabase link --project-ref [votre-ref-projet]

# Exécuter les migrations
supabase db push

# Ou exécuter les fichiers individuellement
psql [votre-connection-string] < database/schema.sql
psql [votre-connection-string] < database/seed_data.sql
psql [votre-connection-string] < database/functions_triggers.sql
psql [votre-connection-string] < database/rls_policies.sql
psql [votre-connection-string] < database/realtime_config.sql
```

---

## 🔴 Configuration Real-Time

### 1. Activer Real-Time dans Supabase

Dans le dashboard Supabase :

1. Aller dans **Database** > **Replication**
2. Activer la réplication pour les tables suivantes :
   - ✅ `modules`
   - ✅ `cultivation_cycles`
   - ✅ `stock_movements`
   - ✅ `farmer_deliveries`
   - ✅ `site_transfers`
   - ✅ `incidents`
   - ✅ `farmers`
   - ✅ `employees`
   - ✅ `periodic_tests`
   - ✅ `gallery_photos`

### 2. Vérifier la Configuration Real-Time

Le script `realtime_config.sql` configure automatiquement :
- La publication `supabase_realtime`
- Les triggers de notification
- La table de présence utilisateur

Pour vérifier :

```sql
-- Vérifier les tables avec Real-Time activé
SELECT schemaname, tablename 
FROM pg_publication_tables 
WHERE pubname = 'supabase_realtime';
```

---

## 🔒 Sécurité et RLS

### Row Level Security (RLS)

Toutes les tables ont RLS activé avec des politiques basées sur les permissions des rôles.

### Politiques Principales

1. **Lecture** : Basée sur les permissions du rôle utilisateur
2. **Écriture** : Restreinte aux administrateurs et rôles spécifiques
3. **Isolation des données** : Les utilisateurs ne voient que les données autorisées

### Tester les Politiques

```sql
-- Se connecter en tant qu'utilisateur de test
SET request.jwt.claims = '{"sub": "user-id-here"}';

-- Vérifier l'accès
SELECT * FROM farmers; -- Devrait respecter les politiques RLS
```

### Utilisateur Admin par Défaut

```
Email: admin@seafarm.com
Mot de passe: password
```

⚠️ **IMPORTANT** : Changer ce mot de passe en production !

---

## 💻 Intégration dans l'Application

### 1. Vérifier le Client Supabase

Le fichier `services/supabaseClient.ts` est déjà configuré :

```typescript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

### 2. Exemple d'Utilisation Real-Time

```typescript
import { supabase } from './services/supabaseClient';

// S'abonner aux changements de modules
const subscription = supabase
  .channel('modules-changes')
  .on(
    'postgres_changes',
    { 
      event: '*', 
      schema: 'public', 
      table: 'modules' 
    },
    (payload) => {
      console.log('Module changed:', payload);
      // Mettre à jour l'état local
    }
  )
  .subscribe();

// Se désabonner plus tard
subscription.unsubscribe();
```

### 3. Exemple de Requête avec RLS

```typescript
// Les politiques RLS sont automatiquement appliquées
const { data, error } = await supabase
  .from('farmers')
  .select('*')
  .eq('site_id', currentSiteId);

// L'utilisateur ne verra que les données autorisées
```

---

## ✅ Tests et Validation

### 1. Tester la Connexion

```typescript
// Test de connexion basique
const testConnection = async () => {
  const { data, error } = await supabase
    .from('sites')
    .select('count');
  
  if (error) {
    console.error('Erreur de connexion:', error);
  } else {
    console.log('Connexion réussie!', data);
  }
};
```

### 2. Tester Real-Time

```typescript
// Ouvrir deux onglets de l'application
// Dans l'onglet 1 : Créer un module
// Dans l'onglet 2 : Vérifier que le module apparaît automatiquement
```

### 3. Tester les Politiques RLS

1. Se connecter avec différents rôles
2. Vérifier les permissions d'accès
3. Tenter des opérations non autorisées

### 4. Requêtes de Validation

```sql
-- Vérifier que toutes les tables existent
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Vérifier les triggers
SELECT trigger_name, event_manipulation, event_object_table
FROM information_schema.triggers
WHERE trigger_schema = 'public';

-- Vérifier les politiques RLS
SELECT schemaname, tablename, policyname
FROM pg_policies
WHERE schemaname = 'public';
```

---

## 🔧 Maintenance

### Sauvegardes

Supabase effectue des sauvegardes automatiques. Pour une sauvegarde manuelle :

```bash
# Via CLI
supabase db dump -f backup.sql

# Ou via pg_dump
pg_dump [connection-string] > backup.sql
```

### Migrations

Pour les modifications futures du schéma :

```bash
# Créer une nouvelle migration
supabase migration new nom_de_la_migration

# Appliquer les migrations
supabase db push
```

### Monitoring

Dans le dashboard Supabase :
- **Database** > **Logs** : Voir les requêtes SQL
- **Database** > **Roles** : Gérer les utilisateurs
- **Database** > **Extensions** : Gérer les extensions PostgreSQL

### Nettoyage de la Présence

Exécuter périodiquement (via cron job ou fonction cloud) :

```sql
SELECT cleanup_stale_presence();
```

### Optimisation des Performances

```sql
-- Analyser les requêtes lentes
SELECT * FROM pg_stat_statements 
ORDER BY total_exec_time DESC 
LIMIT 10;

-- Reindexer si nécessaire
REINDEX TABLE modules;
```

---

## 🚨 Dépannage

### Problème : Real-Time ne fonctionne pas

1. Vérifier que la réplication est activée pour la table
2. Vérifier les politiques RLS
3. Vérifier la souscription dans le code

### Problème : Erreur de permission

1. Vérifier les politiques RLS
2. Vérifier le rôle de l'utilisateur
3. Vérifier le JWT token

### Problème : Données manquantes

1. Vérifier que `seed_data.sql` a été exécuté
2. Vérifier les contraintes de clés étrangères

---

## 📚 Ressources

- [Documentation Supabase](https://supabase.com/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Supabase Real-Time](https://supabase.com/docs/guides/realtime)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)

---

## 📞 Support

Pour toute question :
1. Consulter la documentation Supabase
2. Vérifier les logs dans le dashboard
3. Tester avec le SQL Editor

---

**Version** : 1.0.0  
**Dernière mise à jour** : 2024-02-19
