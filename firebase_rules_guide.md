# 🔐 Configuration des Règles Firebase Realtime Database

## ⚠️ PROBLÈME ACTUEL

L'application ne peut pas se connecter à Firebase car **les règles de sécurité bloquent l'accès**.

Erreur dans les logs :
```
Permission denied
```

## ✅ SOLUTION : Mettre à jour les règles Firebase

### 📋 Étapes à suivre :

1. **Accédez à la console Firebase** :
   - URL : https://console.firebase.google.com/project/seafarm-mntr/database/seafarm-mntr-default-rtdb/rules
   - Connectez-vous avec votre compte Google

2. **Cliquez sur l'onglet "Rules" (Règles)**

3. **Remplacez les règles existantes par celles-ci** :

```json
{
  "rules": {
    ".read": true,
    ".write": true
  }
}
```

4. **Cliquez sur "Publish" (Publier)**

---

## 🔒 RÈGLES DE SÉCURITÉ RECOMMANDÉES (Production)

Une fois que l'application fonctionne, remplacez par des règles sécurisées :

```json
{
  "rules": {
    "users": {
      "$uid": {
        ".read": "auth != null",
        ".write": "auth != null && (auth.uid === $uid || root.child('users').child(auth.uid).child('roleId').val() === 'admin-role-id')"
      }
    },
    "sites": {
      ".read": "auth != null",
      "$siteId": {
        ".write": "auth != null && (
          root.child('users').child(auth.uid).child('roleId').val() === 'admin-role-id' ||
          root.child('sites').child($siteId).child('managerId').val() === auth.uid
        )"
      }
    },
    "employees": {
      ".read": "auth != null",
      ".write": "auth != null && root.child('users').child(auth.uid).child('roleId').val() === 'admin-role-id'"
    },
    "farmers": {
      ".read": "auth != null",
      ".write": "auth != null"
    },
    "modules": {
      ".read": "auth != null",
      ".write": "auth != null"
    },
    "cultivation_cycles": {
      ".read": "auth != null",
      ".write": "auth != null"
    },
    "farmer_credits": {
      ".read": "auth != null",
      ".write": "auth != null"
    },
    "incidents": {
      ".read": "auth != null",
      ".write": "auth != null"
    },
    "credit_types": {
      ".read": "auth != null",
      ".write": "auth != null && root.child('users').child(auth.uid).child('roleId').val() === 'admin-role-id'"
    },
    "seaweed_types": {
      ".read": "auth != null",
      ".write": "auth != null && root.child('users').child(auth.uid).child('roleId').val() === 'admin-role-id'"
    },
    "service_providers": {
      ".read": "auth != null",
      ".write": "auth != null"
    },
    "zones": {
      ".read": "auth != null",
      ".write": "auth != null"
    },
    "roles": {
      ".read": "auth != null",
      ".write": "auth != null && root.child('users').child(auth.uid).child('roleId').val() === 'admin-role-id'"
    },
    "incident_types": {
      ".read": "auth != null",
      ".write": "auth != null && root.child('users').child(auth.uid).child('roleId').val() === 'admin-role-id'"
    },
    "incident_severities": {
      ".read": "auth != null",
      ".write": "auth != null && root.child('users').child(auth.uid).child('roleId').val() === 'admin-role-id'"
    },
    "app_settings": {
      ".read": "auth != null",
      ".write": "auth != null && root.child('users').child(auth.uid).child('roleId').val() === 'admin-role-id'"
    },
    "seaweed_price_history": {
      ".read": "auth != null",
      ".write": "auth != null"
    },
    "export_containers": {
      ".read": "auth != null",
      ".write": "auth != null"
    },
    "user_presence": {
      "$userId": {
        ".read": "auth != null",
        ".write": "auth != null && auth.uid === $userId"
      }
    },
    "repayments": {
      ".read": "auth != null",
      ".write": "auth != null"
    },
    "monthly_payments": {
      ".read": "auth != null",
      ".write": "auth != null"
    },
    "farmer_deliveries": {
      ".read": "auth != null",
      ".write": "auth != null"
    },
    "stock_movements": {
      ".read": "auth != null",
      ".write": "auth != null"
    },
    "pressing_slips": {
      ".read": "auth != null",
      ".write": "auth != null"
    },
    "pressed_stock_movements": {
      ".read": "auth != null",
      ".write": "auth != null"
    },
    "cutting_operations": {
      ".read": "auth != null",
      ".write": "auth != null"
    },
    "export_documents": {
      ".read": "auth != null",
      ".write": "auth != null"
    },
    "site_transfers": {
      ".read": "auth != null",
      ".write": "auth != null"
    },
    "periodic_tests": {
      ".read": "auth != null",
      ".write": "auth != null"
    },
    "pest_observations": {
      ".read": "auth != null",
      ".write": "auth != null"
    },
    "invitations": {
      ".read": "auth != null",
      ".write": "auth != null && root.child('users').child(auth.uid).child('roleId').val() === 'admin-role-id'"
    },
    "message_logs": {
      ".read": "auth != null",
      ".write": "auth != null"
    },
    "gallery_photos": {
      ".read": "auth != null",
      ".write": "auth != null"
    }
  }
}
```

---

## 🧪 TEST APRÈS MISE À JOUR

1. **Redémarrez l'application** :
   ```bash
   cd /home/user/webapp
   pkill -f vite
   npm run dev
   ```

2. **Testez la connexion** :
   - URL : https://3000-iw1hbfa3ilo0b15qntvdt-3844e1b6.sandbox.novita.ai/#/login
   - Email : admin@seafarm.com
   - Mot de passe : password

3. **Vérifiez les logs** :
   - Ouvrez la console du navigateur (F12)
   - Vous devriez voir : `[Firebase] Received X items from Firebase`
   - Plus d'erreur "Permission denied"

---

## 📊 VÉRIFICATION DES DONNÉES

Après mise à jour des règles, vérifiez que les données sont accessibles :

```bash
# Dans la console Firebase Realtime Database
https://console.firebase.google.com/project/seafarm-mntr/database/seafarm-mntr-default-rtdb/data

# Vous devriez voir :
✓ users (3 items)
✓ sites (2 items)
✓ employees (3 items)
✓ farmers (3 items)
✓ modules (3 items)
✓ cultivation_cycles (2 items)
✓ credit_types (4 items)
✓ seaweed_types (4 items)
... et toutes les autres collections
```

---

## ⚡ DÉPANNAGE

### Si l'application ne charge toujours pas :

1. **Videz le cache du navigateur** :
   - F12 → Application → Storage → "Clear site data"
   - Ou Ctrl + Shift + Delete

2. **Vérifiez que les règles sont bien publiées** :
   - Console Firebase → Database → Rules
   - L'onglet devrait afficher "Published" avec un timestamp récent

3. **Réinitialisez les données** :
   ```bash
   cd /home/user/webapp
   node init_firebase_all_collections.mjs
   node create_empty_collections.mjs
   node add_user_passwords.mjs
   ```

4. **Vérifiez les credentials Firebase** :
   - Les clés API dans `lib/firebaseConfig.ts` doivent correspondre à votre projet Firebase

---

## 📝 RÉSUMÉ

**Problème** : Firebase Realtime Database bloque l'accès (règles par défaut = deny all)

**Solution rapide** : Règles ouvertes (développement uniquement)
```json
{
  "rules": {
    ".read": true,
    ".write": true
  }
}
```

**Solution production** : Règles basées sur l'authentification (voir ci-dessus)

**URL des règles** : https://console.firebase.google.com/project/seafarm-mntr/database/seafarm-mntr-default-rtdb/rules

---

## ✅ CHECKLIST

- [ ] Accéder à la console Firebase
- [ ] Onglet "Rules" (Règles)
- [ ] Copier les règles ouvertes
- [ ] Cliquer sur "Publish"
- [ ] Attendre 5-10 secondes
- [ ] Redémarrer l'application
- [ ] Tester la connexion
- [ ] Vérifier les logs (pas d'erreur "Permission denied")
- [ ] Voir les données chargées dans le Dashboard

---

🎯 **Une fois les règles mises à jour, l'application devrait fonctionner immédiatement !**
