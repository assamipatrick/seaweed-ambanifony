# 🔄 GUIDE DE RESTAURATION RAPIDE

**Date** : 2026-02-20  
**Problème** : Collections disparues + Menu inaccessible

---

## ⚠️ POURQUOI LES COLLECTIONS DISPARAISSENT ?

### Cause principale :

**Firebase Realtime Database supprime automatiquement les collections vides.**

Quand vous :
1. Supprimez le dernier item d'une collection
2. Supprimez les placeholders
3. Nettoyez la base manuellement dans la console

→ La collection **disparaît immédiatement** de Firebase.

### Exemple :

```javascript
// Avant
{
  "stock_movements": {
    "_placeholder": { ... }
  }
}

// Si vous supprimez _placeholder
{
  // stock_movements n'existe plus !
}
```

---

## 🚀 SOLUTION RAPIDE (3 COMMANDES)

### Méthode 1 : Script automatique (RECOMMANDÉ)

```bash
cd /home/user/webapp
node reset_firebase_complete.mjs
```

Ce script exécute automatiquement :
1. ✅ Initialisation des données (36 collections, 49 items)
2. ✅ Création des collections vides (17 placeholders)
3. ✅ Ajout des mots de passe (3 utilisateurs)

**Temps** : ~10 secondes  
**Résultat** : Base de données 100% restaurée

---

### Méthode 2 : Scripts manuels (si besoin)

```bash
cd /home/user/webapp

# Étape 1 : Créer toutes les données
node init_firebase_all_collections.mjs

# Étape 2 : Créer les collections vides
node create_empty_collections.mjs

# Étape 3 : Ajouter les mots de passe
node add_user_passwords.mjs
```

**Temps** : ~15 secondes  
**Résultat** : Identique à la méthode 1

---

## ✅ VÉRIFICATION

### Après restauration, vérifiez :

1. **Firebase Console** :
   - URL : https://console.firebase.google.com/project/seafarm-mntr/database/seafarm-mntr-default-rtdb/data
   - Devrait afficher **36 collections**

2. **Collections attendues** :

| Catégorie | Collections | Total |
|-----------|-------------|-------|
| **Avec données** | users, roles, sites, zones, employees, farmers, modules, etc. | 19 |
| **Avec placeholders** | stock_movements, pressing_slips, repayments, etc. | 17 |
| **TOTAL** | | **36** |

3. **Permissions ADMIN** :
```bash
# Vérifier via script
node -e "
import('firebase/app').then(({ initializeApp }) => {
  import('firebase/database').then(({ getDatabase, ref, get }) => {
    const config = {
      apiKey: 'AIzaSyB58GKPIQvikVbaEeiyGNZHrtzFPRgb1UE',
      databaseURL: 'https://seafarm-mntr-default-rtdb.europe-west1.firebasedatabase.app',
      projectId: 'seafarm-mntr'
    };
    const app = initializeApp(config);
    const db = getDatabase(app);
    get(ref(db, 'roles')).then(s => {
      const adminRole = Object.values(s.val()).find(r => r.name === 'ADMIN');
      console.log('ADMIN permissions:', adminRole.permissions.length);
      console.log('Has settings:view?', adminRole.permissions.includes('settings:view'));
      process.exit(0);
    });
  });
});
"
```

**Résultat attendu** :
```
ADMIN permissions: 56
Has settings:view? true
```

---

## 🔧 DÉPANNAGE

### Problème 1 : Menu toujours invisible après restauration

**Cause** : Cache localStorage du navigateur

**Solution** :
1. Ouvrir l'application : https://3000-iw1hbfa3ilo0b15qntvdt-3844e1b6.sandbox.novita.ai
2. Appuyer sur **F12** (ouvrir DevTools)
3. Onglet **Application** (ou **Storage**)
4. Cliquer sur **"Clear site data"** (ou **"Effacer les données du site"**)
5. Recharger la page (**Ctrl + F5** ou **Cmd + Shift + R**)
6. Se reconnecter avec admin@seafarm.com / password

### Problème 2 : Erreur "Permission denied" dans les logs

**Cause** : Règles Firebase non configurées

**Solution** :
1. Ouvrir : https://console.firebase.google.com/project/seafarm-mntr/database/seafarm-mntr-default-rtdb/rules
2. Remplacer les règles par :
   ```json
   {
     "rules": {
       ".read": true,
       ".write": true
     }
   }
   ```
3. Cliquer sur **"Publish"**
4. Attendre 10 secondes
5. Recharger l'application

**Voir** : `ACTION_REQUIRED.md` pour le guide complet

### Problème 3 : Collections restaurées mais certaines manquent encore

**Solution** :
```bash
cd /home/user/webapp
node create_empty_collections.mjs
```

Ce script crée **uniquement** les collections vides (placeholders).

### Problème 4 : Utilisateurs sans mot de passe

**Solution** :
```bash
cd /home/user/webapp
node add_user_passwords.mjs
```

Ce script ajoute le mot de passe `"password"` aux 3 utilisateurs.

---

## 🛡️ PRÉVENTION

### Comment éviter que les collections disparaissent ?

1. **Ne jamais supprimer manuellement les placeholders** dans Firebase Console

2. **Si vous devez nettoyer une collection** :
   ```javascript
   // ❌ Mauvais : supprime tout
   await remove(ref(database, 'stock_movements'));
   
   // ✅ Bon : garde le placeholder
   const items = await get(ref(database, 'stock_movements'));
   for (const key in items.val()) {
     if (key !== '_placeholder') {
       await remove(ref(database, `stock_movements/${key}`));
     }
   }
   ```

3. **Toujours garder au moins 1 item** dans chaque collection (le placeholder est parfait pour ça)

4. **Utiliser le script de restauration** si des collections disparaissent

---

## 📋 CHECKLIST DE RESTAURATION

Suivez cette checklist après chaque restauration :

- [ ] Exécuter `node reset_firebase_complete.mjs`
- [ ] Vérifier Firebase Console → 36 collections visibles
- [ ] Vérifier permissions ADMIN → 56 permissions avec `settings:view`
- [ ] Vider cache navigateur (F12 → Application → Clear site data)
- [ ] Vérifier règles Firebase (open access pour dev)
- [ ] Recharger application (Ctrl + F5)
- [ ] Se connecter avec admin@seafarm.com / password
- [ ] Vérifier menu visible avec section Paramètres
- [ ] Tester accès aux pages (Dashboard, Sites, Modules, etc.)

---

## 🔗 SCRIPTS DISPONIBLES

| Script | Description | Temps |
|--------|-------------|-------|
| `reset_firebase_complete.mjs` | Restauration complète (tout-en-un) | ~10s |
| `init_firebase_all_collections.mjs` | Créer données (19 collections) | ~5s |
| `create_empty_collections.mjs` | Créer placeholders (17 collections) | ~3s |
| `add_user_passwords.mjs` | Ajouter mots de passe (3 users) | ~1s |

### Usage :

```bash
cd /home/user/webapp

# Restauration complète (RECOMMANDÉ)
node reset_firebase_complete.mjs

# Ou manuellement
node init_firebase_all_collections.mjs && \
node create_empty_collections.mjs && \
node add_user_passwords.mjs
```

---

## 🎯 RÉSULTAT ATTENDU

Après restauration complète :

```
✅ Collections Firebase : 36/36
   - 19 collections avec données (49 items)
   - 17 collections avec placeholders

✅ Utilisateurs : 3/3
   - admin@seafarm.com (ADMIN, 56 permissions)
   - manager@seafarm.com (SITE_MANAGER, 48 permissions)
   - employee@seafarm.com (EMPLOYEE, 24 permissions)

✅ Permissions correctes :
   - Format : 'action:resource' (ex: 'dashboard:view')
   - ADMIN a 'settings:view' → menu Paramètres visible

✅ Application fonctionnelle :
   - Menu visible selon le rôle
   - Toutes les pages accessibles
   - Carte géographique avec zones
   - 0 erreur JavaScript
```

---

## 📞 LIENS UTILES

| Ressource | URL |
|-----------|-----|
| **Application** | https://3000-iw1hbfa3ilo0b15qntvdt-3844e1b6.sandbox.novita.ai/#/login |
| **Firebase Console** | https://console.firebase.google.com/project/seafarm-mntr |
| **Database** | https://console.firebase.google.com/project/seafarm-mntr/database/seafarm-mntr-default-rtdb/data |
| **Rules** | https://console.firebase.google.com/project/seafarm-mntr/database/seafarm-mntr-default-rtdb/rules |
| **GitHub** | https://github.com/assamipatrick/seaweed-Ambanifony |

---

## 💡 ASTUCE

**Créez un alias pour restaurer rapidement** :

```bash
# Ajouter à votre .bashrc ou .zshrc
alias firebase-reset='cd /home/user/webapp && node reset_firebase_complete.mjs'

# Puis simplement :
firebase-reset
```

---

**🔄 En cas de problème, exécutez simplement : `node reset_firebase_complete.mjs`**

**📅 Date** : 2026-02-20  
**✅ Statut** : Guide complet de restauration
