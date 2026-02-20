# 🔥 Guide de Configuration Firebase

## 📋 Étapes de Configuration

### 1. Créer un Projet Firebase

1. Aller sur [Firebase Console](https://console.firebase.google.com/)
2. Cliquer sur **"Add project"** (Ajouter un projet)
3. Nommer le projet : `seafarm-monitor` (ou autre nom)
4. Désactiver Google Analytics (optionnel)
5. Cliquer sur **"Create project"**

### 2. Activer Realtime Database

1. Dans le menu de gauche, cliquer sur **"Realtime Database"**
2. Cliquer sur **"Create Database"**
3. Choisir la région : **`us-central1`** (ou la plus proche de Madagascar)
4. Sélectionner le mode : **"Start in test mode"** (pour commencer)
5. Cliquer sur **"Enable"**

### 3. Récupérer les Credentials

1. Aller dans **Project Settings** (⚙️ en haut à gauche)
2. Aller dans l'onglet **"General"**
3. Descendre jusqu'à **"Your apps"**
4. Cliquer sur **"Web"** (icône `</>`
)
5. Nommer l'app : `SeaFarm Monitor`
6. **Copier les credentials** affichés

### 4. Configurer l'Application

1. Dans le projet, copier `.env.firebase.example` → `.env.local`
   ```bash
   cp .env.firebase.example .env.local
   ```

2. Remplir `.env.local` avec vos credentials Firebase :
   ```env
   VITE_FIREBASE_API_KEY=AIzaSyC...
   VITE_FIREBASE_AUTH_DOMAIN=seafarm-monitor.firebaseapp.com
   VITE_FIREBASE_DATABASE_URL=https://seafarm-monitor-default-rtdb.firebaseio.com
   VITE_FIREBASE_PROJECT_ID=seafarm-monitor
   VITE_FIREBASE_STORAGE_BUCKET=seafarm-monitor.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
   VITE_FIREBASE_APP_ID=1:123456789012:web:abc123
   ```

### 5. Configurer les Règles de Sécurité

Dans Firebase Console → Realtime Database → Rules, remplacer par :

```json
{
  "rules": {
    ".read": "auth != null",
    ".write": "auth != null",
    
    "sites": {
      "$siteId": {
        ".validate": "newData.hasChildren(['id', 'name', 'code'])"
      }
    },
    
    "employees": {
      "$employeeId": {
        ".validate": "newData.hasChildren(['id', 'firstName', 'lastName', 'code'])"
      }
    },
    
    "farmers": {
      "$farmerId": {
        ".validate": "newData.hasChildren(['id', 'firstName', 'lastName', 'code'])"
      }
    },
    
    "seaweed_types": {
      "$typeId": {
        ".validate": "newData.hasChildren(['id', 'name'])"
      }
    },
    
    "modules": {
      "$moduleId": {
        ".validate": "newData.hasChildren(['id', 'code'])"
      }
    },
    
    "credit_types": {
      "$typeId": {
        ".validate": "newData.hasChildren(['id', 'name'])"
      }
    },
    
    "cultivation_cycles": {
      "$cycleId": {
        ".validate": "newData.hasChildren(['id'])"
      }
    },
    
    "service_providers": {
      "$providerId": {
        ".validate": "newData.hasChildren(['id', 'name'])"
      }
    }
  }
}
```

**Pour le développement**, vous pouvez temporairement utiliser (⚠️ **PAS EN PRODUCTION**) :

```json
{
  "rules": {
    ".read": true,
    ".write": true
  }
}
```

### 6. Activer Firebase Authentication

1. Aller dans **Authentication** dans le menu
2. Cliquer sur **"Get started"**
3. Activer **"Email/Password"**
4. Créer un utilisateur test :
   - Email: `admin@seafarm.com`
   - Mot de passe: `password`

### 7. Structure de la Base de Données

Firebase Realtime Database utilisera cette structure :

```
seafarm-monitor-rtdb/
├── sites/
│   ├── uuid-1/
│   │   ├── id: "uuid-1"
│   │   ├── name: "Site Principal"
│   │   ├── code: "SITE-001"
│   │   ├── location: "-18.9333, 47.5167"
│   │   └── managerId: "uuid-manager"
│   └── uuid-2/...
├── employees/
│   ├── uuid-1/
│   │   ├── id: "uuid-1"
│   │   ├── firstName: "Jean"
│   │   ├── lastName: "Dupont"
│   │   ├── code: "EMP-001"
│   │   ├── role: "Manager"
│   │   └── siteId: "uuid-site"
│   └── uuid-2/...
├── farmers/
├── seaweed_types/
├── modules/
├── credit_types/
├── cultivation_cycles/
└── service_providers/
```

### 8. Démarrer l'Application

```bash
# Installer les dépendances
npm install

# Démarrer le serveur de développement
npm run dev

# Build pour production
npm run build
```

### 9. Déployer sur Firebase Hosting

```bash
# Installer Firebase CLI
npm install -g firebase-tools

# Se connecter
firebase login

# Initialiser Firebase dans le projet
firebase init

# Choisir :
# - Hosting
# - Use an existing project
# - Public directory: dist
# - Configure as single-page app: Yes
# - Set up automatic builds: No

# Build l'application
npm run build

# Déployer
firebase deploy
```

---

## 🔐 Sécurité en Production

### Règles Firestore recommandées

```json
{
  "rules": {
    ".read": "auth != null",
    ".write": "auth != null",
    
    "sites": {
      ".indexOn": ["code", "name"],
      "$siteId": {
        ".write": "auth != null && (
          root.child('users').child(auth.uid).child('role').val() == 'admin' ||
          root.child('users').child(auth.uid).child('role').val() == 'manager'
        )"
      }
    },
    
    "employees": {
      ".indexOn": ["code", "siteId"],
      "$employeeId": {
        ".write": "auth != null && (
          root.child('users').child(auth.uid).child('role').val() == 'admin' ||
          root.child('users').child(auth.uid).child('role').val() == 'hr'
        )"
      }
    }
  }
}
```

### Variables d'Environnement en Production

**Ne jamais commit `.env.local` !**

Pour Vercel/Netlify, ajouter les variables dans le dashboard :
- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_DATABASE_URL`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`

---

## 📊 Avantages Firebase Realtime Database

✅ **Synchronisation temps réel native** - Aucune configuration WebSocket  
✅ **Offline support** - Les données restent accessibles hors ligne  
✅ **Scalabilité automatique** - Pas de gestion de serveur  
✅ **Sécurité intégrée** - Règles de sécurité granulaires  
✅ **Gratuit jusqu'à 1 GB** - Puis $5/GB/mois  
✅ **Déploiement facile** - Firebase Hosting inclus  

---

## 🆚 Comparaison Supabase vs Firebase

| Critère | Supabase | Firebase |
|---------|----------|----------|
| Base de données | PostgreSQL (SQL) | NoSQL (JSON) |
| Temps réel | WebSocket (complexe) | Natif (simple) |
| Offline | Non | Oui |
| Setup | Configuration complexe | 5 minutes |
| Coût | Gratuit 500 MB | Gratuit 1 GB |
| Scaling | Manuel | Automatique |

---

## 🔗 Liens Utiles

- [Firebase Console](https://console.firebase.google.com/)
- [Firebase Documentation](https://firebase.google.com/docs)
- [Realtime Database Guide](https://firebase.google.com/docs/database)
- [Firebase Pricing](https://firebase.google.com/pricing)

---

**Date de création** : 2026-02-20  
**Développeur** : GenSpark AI  
**Stack** : React + TypeScript + Firebase Realtime Database
