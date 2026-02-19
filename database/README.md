# Configuration de la Base de Données Supabase Real-Time

Ce dossier contient toute la configuration nécessaire pour déployer et utiliser la base de données Supabase avec fonctionnalités Real-Time pour l'application SeaFarm Monitor.

## 📁 Structure des Fichiers

```
database/
├── schema.sql              # Schéma complet de la base de données (30+ tables)
├── rls_policies.sql        # Politiques de sécurité Row Level Security
├── realtime_config.sql     # Configuration des fonctionnalités Real-Time
├── functions_triggers.sql  # Fonctions et triggers pour la logique métier
├── seed_data.sql          # Données initiales (rôles, types, admin)
├── DEPLOYMENT_GUIDE.md    # Guide de déploiement détaillé
└── README.md              # Ce fichier
```

## 🚀 Démarrage Rapide

### 1. Configuration Supabase

Créez un projet sur [supabase.com](https://supabase.com) et récupérez vos identifiants.

### 2. Configuration de l'Application

Créez un fichier `.env.local` à la racine du projet :

```env
VITE_SUPABASE_URL=https://votre-projet.supabase.co
VITE_SUPABASE_ANON_KEY=votre-cle-anon
GEMINI_API_KEY=votre-cle-gemini
```

### 3. Déploiement du Schéma

Exécutez les scripts SQL dans l'ordre suivant via l'éditeur SQL de Supabase :

1. **schema.sql** - Crée toutes les tables
2. **seed_data.sql** - Insère les données initiales
3. **functions_triggers.sql** - Crée les fonctions et triggers
4. **rls_policies.sql** - Configure les politiques de sécurité
5. **realtime_config.sql** - Active Real-Time

### 4. Activer Real-Time

Dans Supabase Dashboard → Database → Replication :
- Activez la réplication pour les tables critiques (voir liste dans realtime_config.sql)

## 📊 Schéma de la Base de Données

### Tables Principales

#### 🏢 Configuration
- `app_settings` - Paramètres globaux de l'application
- `roles` - Rôles utilisateurs avec permissions
- `users` - Utilisateurs du système
- `incident_types` - Types d'incidents
- `incident_severities` - Niveaux de gravité
- `credit_types` - Types de crédit

#### 📍 Localisation
- `sites` - Sites de production
- `zones` - Zones au sein des sites

#### 👥 Parties Prenantes
- `farmers` - Agriculteurs/Cultivateurs
- `employees` - Employés
- `service_providers` - Prestataires de services

#### 🌊 Opérations
- `modules` - Modules de culture
- `cultivation_cycles` - Cycles de culture
- `cutting_operations` - Opérations de coupe
- `seaweed_types` - Types d'algues
- `seaweed_price_history` - Historique des prix

#### 📦 Inventaire
- `stock_movements` - Mouvements de stock
- `farmer_deliveries` - Livraisons des agriculteurs
- `pressing_slips` - Bordereaux de pressage
- `pressed_stock_movements` - Mouvements de stock pressé
- `export_documents` - Documents d'exportation
- `export_containers` - Conteneurs d'exportation
- `site_transfers` - Transferts entre sites

#### 💰 Finance
- `farmer_credits` - Crédits des agriculteurs
- `repayments` - Remboursements
- `monthly_payments` - Paiements mensuels

#### 📊 Monitoring
- `incidents` - Incidents
- `periodic_tests` - Tests périodiques
- `pest_observations` - Observations de nuisibles

#### 💬 Communication
- `invitations` - Invitations utilisateurs
- `message_logs` - Logs des messages
- `gallery_photos` - Photos de galerie
- `user_presence` - Présence utilisateur en temps réel

## 🔐 Sécurité (RLS)

### Politiques Row Level Security

Toutes les tables ont RLS activé avec des politiques basées sur :
- **Rôles utilisateur** - Permissions spécifiques par rôle
- **Site Management** - Accès basé sur le site géré
- **Propriété des données** - Les utilisateurs peuvent modifier leurs propres données

### Rôles par Défaut

1. **Site Manager (Admin)** - Accès complet
2. **Operations Lead** - Gestion des opérations
3. **Accountant** - Gestion financière
4. **Field Supervisor** - Supervision terrain
5. **Warehouse Manager** - Gestion d'inventaire

### Utilisateur Admin Initial

```
Email: admin@seafarm.com
Password: password
```

⚠️ **À changer immédiatement en production !**

## ⚡ Fonctionnalités Real-Time

### Tables avec Real-Time Activé

- Modules de culture
- Cycles de culture
- Mouvements de stock
- Transferts entre sites
- Incidents
- Agriculteurs/Employés
- Tests périodiques
- Photos de galerie

### Utilisation dans l'Application

```typescript
import { useRealtimeSubscription } from './hooks/useRealtime';

// S'abonner aux changements
useRealtimeSubscription({
  table: 'modules',
  event: '*',
  filter: `site_id=eq.${siteId}`,
  onChange: (payload) => {
    console.log('Module changed:', payload);
  }
});
```

## 🔧 Fonctions et Triggers

### Fonctions Principales

- `calculate_site_stock()` - Calcul du stock par site
- `calculate_pressed_stock()` - Calcul du stock pressé
- `calculate_farmer_balance()` - Calcul du solde agriculteur
- `add_module_status()` - Ajout de statut au module
- `generate_employee_code()` - Génération de code employé
- `generate_farmer_code()` - Génération de code agriculteur
- `generate_module_code()` - Génération de code module

### Triggers Automatiques

- **Stock depuis bagging** - Crée automatiquement un mouvement de stock
- **Stock depuis livraison** - Enregistre les livraisons en stock
- **Pressage** - Gère les mouvements de pressage
- **Transferts** - Gère les transferts entre sites

## 📈 Vues Matérialisées

### Vues Disponibles

- `farmer_balances` - Soldes des agriculteurs
- `active_cycles_view` - Cycles de culture actifs
- `stock_levels_view` - Niveaux de stock par site

## 🛠️ Maintenance

### Sauvegardes

```bash
# Via Supabase CLI
supabase db dump -f backup.sql

# Via pg_dump
pg_dump [connection-string] > backup.sql
```

### Nettoyage de la Présence

Exécuter périodiquement :

```sql
SELECT cleanup_stale_presence();
```

### Monitoring

- Vérifier les logs dans le Dashboard Supabase
- Surveiller les performances des requêtes
- Analyser l'utilisation de Real-Time

## 📚 Ressources

- [Guide de Déploiement Complet](./DEPLOYMENT_GUIDE.md)
- [Documentation Supabase](https://supabase.com/docs)
- [PostgreSQL Docs](https://www.postgresql.org/docs/)
- [Supabase Real-Time](https://supabase.com/docs/guides/realtime)

## 🐛 Dépannage

### Real-Time ne fonctionne pas
1. Vérifier la réplication dans Database > Replication
2. Vérifier les politiques RLS
3. Vérifier la connexion réseau

### Erreurs de Permission
1. Vérifier le rôle utilisateur
2. Vérifier les politiques RLS
3. Vérifier le JWT token

### Problèmes de Performance
1. Analyser les requêtes lentes
2. Vérifier les index
3. Optimiser les politiques RLS

## 📞 Support

Pour plus d'informations, consultez le [Guide de Déploiement](./DEPLOYMENT_GUIDE.md).

---

**Version** : 1.0.0  
**Dernière mise à jour** : 2024-02-19  
**Auteur** : SeaFarm Development Team
