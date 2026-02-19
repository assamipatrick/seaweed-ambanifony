# 🚀 Guide de Déploiement Rapide - Votre Projet Supabase

## ✅ Configuration Terminée !

Vos identifiants Supabase ont été configurés avec succès :

```
URL: https://kxujxjcuyfbvmzahyzcv.supabase.co
Projet: kxujxjcuyfbvmzahyzcv
```

## 📋 Fichiers Configurés

✅ `.env.local` - Variables d'environnement créées  
✅ `services/supabaseClient.ts` - Client mis à jour avec vos identifiants  
✅ `deploy_supabase.sh` - Script de déploiement interactif créé

## 🎯 Prochaines Étapes Immédiates

### Option 1 : Déploiement Manuel (Recommandé)

#### 1️⃣ Accédez à votre Dashboard Supabase
🔗 **[Ouvrir le SQL Editor](https://kxujxjcuyfbvmzahyzcv.supabase.co/project/kxujxjcuyfbvmzahyzcv/sql/new)**

#### 2️⃣ Exécutez les Scripts SQL dans l'Ordre

**Étape 1: Créer les Tables**
- Fichier: `database/schema.sql`
- Ouvrir dans SQL Editor → "New Query"
- Copier tout le contenu → Coller → Cliquer "Run"
- ⏱️ ~30 secondes
- ✅ Crée 30+ tables avec index

**Étape 2: Données Initiales**
- Fichier: `database/seed_data.sql`
- Nouvelle requête → Copier/Coller → Run
- ⏱️ ~5 secondes
- ✅ Insère rôles, types, utilisateur admin

**Étape 3: Fonctions et Triggers**
- Fichier: `database/functions_triggers.sql`
- Nouvelle requête → Copier/Coller → Run
- ⏱️ ~15 secondes
- ✅ Crée 15+ fonctions et triggers

**Étape 4: Politiques de Sécurité**
- Fichier: `database/rls_policies.sql`
- Nouvelle requête → Copier/Coller → Run
- ⏱️ ~20 secondes
- ✅ Configure 60+ politiques RLS

**Étape 5: Configuration Real-Time**
- Fichier: `database/realtime_config.sql`
- Nouvelle requête → Copier/Coller → Run
- ⏱️ ~10 secondes
- ✅ Active Real-Time pour tables critiques

#### 3️⃣ Activer la Réplication Real-Time

1. Dans votre Dashboard, aller à: **Database** → **Replication**
2. Activer la réplication pour ces tables :

```
✅ modules
✅ cultivation_cycles
✅ stock_movements
✅ farmer_deliveries
✅ site_transfers
✅ incidents
✅ farmers
✅ employees
✅ service_providers
✅ periodic_tests
✅ pest_observations
✅ farmer_credits
✅ repayments
✅ monthly_payments
✅ gallery_photos
✅ message_logs
✅ sites
✅ zones
✅ seaweed_types
✅ user_presence
```

#### 4️⃣ Vérifier l'Installation

Dans SQL Editor, exécutez :

```sql
-- Vérifier que les tables existent
SELECT COUNT(*) FROM information_schema.tables 
WHERE table_schema = 'public';
-- Résultat attendu : 30+

-- Vérifier les rôles
SELECT * FROM roles;
-- Résultat attendu : 5 rôles

-- Vérifier l'utilisateur admin
SELECT email, first_name, last_name FROM users;
-- Résultat attendu : admin@seafarm.com
```

### Option 2 : Script de Déploiement Interactif

```bash
# Exécuter le script de déploiement
./deploy_supabase.sh
```

Le script vous guidera étape par étape avec des instructions détaillées.

## 🔐 Connexion Admin

Une fois le déploiement terminé, vous pourrez vous connecter avec :

```
📧 Email: admin@seafarm.com
🔑 Mot de passe: password
```

⚠️ **IMPORTANT** : Changez ce mot de passe immédiatement après la première connexion !

## 🧪 Tester la Connexion dans l'Application

### 1. Démarrer l'Application

```bash
# Installer les dépendances (si pas déjà fait)
npm install

# Démarrer en mode développement
npm run dev
```

### 2. Tester la Connexion Supabase

Créez un fichier de test `test_supabase.ts` :

```typescript
import { supabase } from './services/supabaseClient';

// Test de connexion basique
async function testConnection() {
  console.log('🔍 Test de connexion Supabase...');
  
  // Test 1: Vérifier la connexion
  const { data, error } = await supabase
    .from('sites')
    .select('count');
  
  if (error) {
    console.error('❌ Erreur de connexion:', error);
  } else {
    console.log('✅ Connexion réussie!');
    console.log('Données:', data);
  }
  
  // Test 2: Vérifier les rôles
  const { data: roles } = await supabase
    .from('roles')
    .select('*');
  
  console.log('✅ Rôles disponibles:', roles?.length);
  
  // Test 3: Test Real-Time
  const channel = supabase
    .channel('test-channel')
    .on('postgres_changes', 
      { event: '*', schema: 'public', table: 'sites' },
      (payload) => {
        console.log('📡 Real-Time fonctionne!', payload);
      }
    )
    .subscribe();
  
  console.log('✅ Real-Time souscrit!');
}

testConnection();
```

## 📊 État du Déploiement

### ✅ Complété

- [x] Configuration des identifiants Supabase
- [x] Création du fichier .env.local
- [x] Mise à jour du client Supabase
- [x] Schéma de base de données créé
- [x] Politiques RLS définies
- [x] Configuration Real-Time préparée
- [x] Fonctions et triggers créés
- [x] Hooks React développés
- [x] Documentation complète
- [x] Script de déploiement créé

### ⏳ À Faire

- [ ] Exécuter les scripts SQL sur Supabase
- [ ] Activer la réplication Real-Time
- [ ] Tester la connexion
- [ ] Changer le mot de passe admin
- [ ] Intégrer les hooks dans l'application

## 🎨 Utiliser Real-Time dans l'Application

### Exemple 1 : Liste de Modules en Temps Réel

```typescript
import { useRealtimeQuery } from './hooks/useRealtime';

function ModulesList({ siteId }) {
  const { data: modules, loading, error } = useRealtimeQuery({
    table: 'modules',
    filter: { site_id: siteId },
    orderBy: { column: 'code', ascending: true },
    realtime: true // ⚡ Mises à jour automatiques !
  });

  if (loading) return <div>Chargement...</div>;
  if (error) return <div>Erreur: {error.message}</div>;

  return (
    <div>
      <h2>Modules (Live)</h2>
      {modules.map(module => (
        <div key={module.id}>{module.code}</div>
      ))}
    </div>
  );
}
```

### Exemple 2 : Alertes d'Incidents en Temps Réel

```typescript
import { useRealtimeSubscription } from './hooks/useRealtime';

function IncidentAlerts() {
  useRealtimeSubscription({
    table: 'incidents',
    event: 'INSERT',
    onInsert: (payload) => {
      const incident = payload.new;
      if (incident.severity === 'CRITICAL') {
        // Afficher une alerte
        alert(`🚨 INCIDENT CRITIQUE: ${incident.description}`);
      }
    }
  });

  return <div>Écoute des incidents...</div>;
}
```

### Exemple 3 : Utilisateurs en Ligne

```typescript
import { usePresence } from './hooks/useRealtime';

function OnlineUsers() {
  const { onlineUsers, updatePresence } = usePresence('dashboard');

  useEffect(() => {
    updatePresence({
      user_id: currentUser.id,
      page: 'dashboard'
    });
  }, []);

  return (
    <div>
      👥 Utilisateurs en ligne : {Object.keys(onlineUsers).length}
    </div>
  );
}
```

## 📚 Ressources Utiles

### Documentation
- 📖 [Guide de Déploiement Complet](database/DEPLOYMENT_GUIDE.md)
- 📖 [Documentation Base de Données](database/README.md)
- 💻 [Exemples d'Utilisation](examples/RealtimeExamples.tsx)
- 📝 [Résumé Complet](SUPABASE_SETUP_SUMMARY.md)

### Liens Supabase
- 🌐 [Dashboard Supabase](https://kxujxjcuyfbvmzahyzcv.supabase.co/project/kxujxjcuyfbvmzahyzcv)
- 📝 [SQL Editor](https://kxujxjcuyfbvmzahyzcv.supabase.co/project/kxujxjcuyfbvmzahyzcv/sql/new)
- 📊 [Table Editor](https://kxujxjcuyfbvmzahyzcv.supabase.co/project/kxujxjcuyfbvmzahyzcv/editor)
- ⚡ [Replication](https://kxujxjcuyfbvmzahyzcv.supabase.co/project/kxujxjcuyfbvmzahyzcv/database/replication)
- 📈 [Logs](https://kxujxjcuyfbvmzahyzcv.supabase.co/project/kxujxjcuyfbvmzahyzcv/logs/explorer)

### Support
- 📚 [Docs Supabase](https://supabase.com/docs)
- 🔴 [Supabase Real-Time](https://supabase.com/docs/guides/realtime)
- 🔐 [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)

## 🔧 Dépannage

### Erreur: "relation does not exist"
➡️ Les tables n'ont pas été créées. Exécutez `schema.sql` d'abord.

### Erreur: "permission denied"
➡️ Les politiques RLS bloquent l'accès. Vérifiez `rls_policies.sql`.

### Real-Time ne fonctionne pas
➡️ Activez la réplication dans Database → Replication.

### Variables d'environnement non détectées
➡️ Redémarrez le serveur de développement (`npm run dev`).

## ✨ Prochaine Étape

👉 **[Ouvrir le SQL Editor et Commencer le Déploiement](https://kxujxjcuyfbvmzahyzcv.supabase.co/project/kxujxjcuyfbvmzahyzcv/sql/new)**

Suivez les étapes ci-dessus et exécutez les 5 scripts SQL dans l'ordre !

---

💡 **Besoin d'aide ?** Consultez le guide détaillé dans `database/DEPLOYMENT_GUIDE.md`

🎉 **Bonne chance avec votre déploiement !**
