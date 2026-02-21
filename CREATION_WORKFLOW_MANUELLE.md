# 🚀 CRÉATION MANUELLE DU WORKFLOW GITHUB ACTIONS

## ⚠️ **Pourquoi Cette Étape Est Nécessaire**

GitHub bloque la création de workflows `.github/workflows/*.yml` via push pour des raisons de sécurité.

**Solution** : Créer le fichier manuellement sur GitHub.com (2 minutes)

---

## 📋 **ÉTAPE 1 : Créer le Fichier Workflow (2 min)**

### **1.1 : Créer le dossier `.github/workflows`**

1. Ouvrir : https://github.com/assamipatrick/seaweed-Ambanifony
2. Cliquer sur **"Add file"** → **"Create new file"**
3. Dans le nom du fichier, taper : `.github/workflows/deploy-firebase.yml`
   - ⚠️ **Important** : Taper exactement `.github/workflows/deploy-firebase.yml` (avec les slashes `/`)
   - GitHub créera automatiquement les dossiers

### **1.2 : Copier-coller le contenu du workflow**

Copier **TOUT** ce contenu et coller dans l'éditeur GitHub :

```yaml
name: Deploy to Firebase Hosting

on:
  push:
    branches:
      - main
      - genspark_ai_developer
  workflow_dispatch:

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    
    steps:
      - name: 📥 Checkout code
        uses: actions/checkout@v4
      
      - name: 📦 Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      
      - name: 🔧 Install dependencies
        run: npm ci
      
      - name: 🏗️ Build application
        run: npm run build
      
      - name: 🚀 Deploy to Firebase Hosting
        uses: FirebaseExtended/action-hosting-deploy@v0
        with:
          repoToken: '${{ secrets.GITHUB_TOKEN }}'
          firebaseServiceAccount: '${{ secrets.FIREBASE_SERVICE_ACCOUNT }}'
          channelId: live
          projectId: seafarm-mntr
      
      - name: 📊 Deploy Firebase Database Rules
        uses: w9jds/firebase-action@master
        with:
          args: deploy --only database
        env:
          FIREBASE_TOKEN: ${{ secrets.FIREBASE_TOKEN }}
```

### **1.3 : Commit le fichier**

1. Scroll en bas de la page
2. Message de commit : `feat: Add GitHub Actions deployment workflow`
3. Sélectionner **"Commit directly to the genspark_ai_developer branch"**
4. Cliquer **"Commit new file"**

---

## 🔧 **ÉTAPE 2 : Configurer les Secrets (5 min)**

### **2.1 : Obtenir le Service Account JSON**

1. Ouvrir : https://console.firebase.google.com/project/seafarm-mntr/settings/serviceaccounts/adminsdk
2. Cliquer sur **"Generate new private key"** (Générer une nouvelle clé privée)
3. Confirmer → Un fichier JSON est téléchargé
4. **Ouvrir ce fichier** avec Notepad/TextEdit
5. **Copier TOUT le contenu** (du premier `{` au dernier `}`)

### **2.2 : Obtenir le Firebase Token**

**Sur votre machine locale**, ouvrir un terminal :

```bash
# Installer Firebase CLI (si pas déjà fait)
npm install -g firebase-tools

# Se connecter
firebase login

# Générer le token
firebase login:ci
```

**Copier le token** qui s'affiche (ressemble à `1//0abc...xyz`)

### **2.3 : Ajouter les Secrets sur GitHub**

1. Ouvrir : https://github.com/assamipatrick/seaweed-Ambanifony/settings/secrets/actions

2. **Secret #1** :
   - Cliquer **"New repository secret"**
   - Name : `FIREBASE_SERVICE_ACCOUNT`
   - Value : **Coller tout le JSON** (étape 2.1)
   - Cliquer **"Add secret"**

3. **Secret #2** :
   - Cliquer **"New repository secret"**
   - Name : `FIREBASE_TOKEN`
   - Value : **Coller le token** (étape 2.2)
   - Cliquer **"Add secret"**

---

## ✅ **ÉTAPE 3 : Déclencher le Déploiement (1 min)**

### **Option A : Déclenchement manuel**

1. Ouvrir : https://github.com/assamipatrick/seaweed-Ambanifony/actions
2. Cliquer sur **"Deploy to Firebase Hosting"** (à gauche)
3. Cliquer sur le bouton **"Run workflow"** (à droite)
4. Sélectionner branch : `genspark_ai_developer`
5. Cliquer **"Run workflow"** (vert)

### **Option B : Push automatique**

Faites n'importe quel changement et push :
```bash
git add .
git commit -m "test: trigger deployment"
git push origin genspark_ai_developer
```

---

## 📊 **ÉTAPE 4 : Suivre le Déploiement (2 min)**

1. Ouvrir : https://github.com/assamipatrick/seaweed-Ambanifony/actions
2. Cliquer sur le workflow en cours (point orange ⚪)
3. Suivre les logs en temps réel

**Étapes visibles** :
```
✅ 📥 Checkout code (5 sec)
✅ 📦 Setup Node.js (10 sec)
✅ 🔧 Install dependencies (30 sec)
✅ 🏗️ Build application (10 sec)
✅ 🚀 Deploy to Firebase Hosting (20 sec)
✅ 📊 Deploy Firebase Database Rules (5 sec)
```

---

## 🎯 **ÉTAPE 5 : Tester l'Application (2 min)**

1. Une fois le workflow terminé (✅ vert), chercher dans les logs :
   ```
   ✔ Deploy complete!
   Hosting URL: https://seafarm-mntr.web.app
   ```

2. Ouvrir : **https://seafarm-mntr.web.app**

3. **Tests** :
   - Ajouter type "Test Production"
   - F5 → Doit rester visible ✅
   - Supprimer → F5 → Doit rester supprimé ✅
   - Vérifier Firebase Console → Changements visibles ✅

---

## 📋 **Checklist Complète**

| Étape | Action | Temps | Statut |
|-------|--------|-------|--------|
| 1 | Créer fichier `.github/workflows/deploy-firebase.yml` sur GitHub.com | 2 min | ⏳ |
| 2.1 | Obtenir Service Account JSON | 2 min | ⏳ |
| 2.2 | Obtenir Firebase Token | 1 min | ⏳ |
| 2.3 | Ajouter 2 secrets sur GitHub | 2 min | ⏳ |
| 3 | Déclencher workflow (manuel ou push) | 1 min | ⏳ |
| 4 | Attendre déploiement | 2 min | ⏳ Auto |
| 5 | Tester sur https://seafarm-mntr.web.app | 2 min | ⏳ |
| **TOTAL** | | **~12 min** | |

---

## 🐛 **Dépannage**

### **Erreur : "FIREBASE_SERVICE_ACCOUNT not found"**
→ Vérifier que le secret est bien créé sur : https://github.com/assamipatrick/seaweed-Ambanifony/settings/secrets/actions

### **Erreur : "Permission denied"**
→ Le Service Account doit avoir le rôle "Firebase Admin SDK Administrator Service Agent"

### **Erreur : "Build failed"**
→ Vérifier les logs dans GitHub Actions, probablement une erreur TypeScript

### **Workflow ne se déclenche pas**
→ Vérifier que le fichier est bien à : `.github/workflows/deploy-firebase.yml`

---

## 💡 **Après le Premier Déploiement Réussi**

**Déploiements futurs** : Automatiques à chaque push !

```bash
# Faire un changement
git add .
git commit -m "Update something"
git push origin genspark_ai_developer

# → Déploiement automatique en ~2 min
# → URL mise à jour : https://seafarm-mntr.web.app
```

---

## 🎉 **Résumé**

✅ **Avant** : Déploiement manuel compliqué  
✅ **Après** : Push → 2 min → App en ligne ! 🚀  

---

**Document créé le** : 2026-02-21  
**Auteur** : GenSpark AI Developer  
**Branche** : genspark_ai_developer
