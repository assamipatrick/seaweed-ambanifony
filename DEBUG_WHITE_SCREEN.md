# 🔍 Guide de Debug - Page Blanche sur Sites

## ⚠️ Problème Persistant

Malgré les corrections appliquées, vous rapportez toujours une page blanche lors du clic sur "Sites".

---

## 🛠️ Étapes de Diagnostic

### Étape 1: Ouvrir la Console du Navigateur

1. **Ouvrir l'application** : https://3000-iw1hbfa3ilo0b15qntvdt-3844e1b6.sandbox.novita.ai
2. **Se connecter** : admin@seafarm.com / password
3. **Ouvrir la console** : Appuyez sur **F12** (ou Cmd+Option+I sur Mac)
4. **Aller dans l'onglet "Console"**

### Étape 2: Naviguer vers Sites

1. Cliquer sur **"Sites & Modules"** → **"Sites"** dans le menu
2. **Observer la console immédiatement**

### Étape 3: Identifier le Type d'Erreur

Cherchez dans la console :

#### Type A: Erreur JavaScript Rouge ❌
```
❌ Error: Cannot read property 'X' of undefined
❌ TypeError: ...
❌ ReferenceError: ...
```
→ **Si vous voyez cela, copiez-collez l'erreur complète**

#### Type B: Avertissement Supabase ⚠️
```
⚠️ [sites] Error loading data: ...
⚠️ [addSite] Supabase sync failed: ...
```
→ **Cela indique un problème de connexion Supabase**

#### Type C: Aucune Erreur Visible ✅
```
✅ [sites] Loaded 1 records from Supabase
✅ [sites] Subscription status: SUBSCRIBED
```
→ **Mais la page est quand même blanche**

---

## 📊 Scénarios et Solutions

### Scénario 1: Erreur JavaScript

**Symptômes:**
- Console affiche une erreur rouge
- Stack trace visible
- Page complètement blanche

**Solution:**
L'ErrorBoundary devrait maintenant capturer cela et afficher un message d'erreur au lieu d'une page blanche.

**Actions:**
1. Recharger la page (Ctrl+R ou Cmd+R)
2. Si l'ErrorBoundary s'affiche :
   - Lisez le message d'erreur
   - Copiez la stack trace
   - Partagez-la avec moi
3. Si la page reste blanche :
   - L'ErrorBoundary ne fonctionne pas
   - Vérifiez le build

### Scénario 2: Problème d'Authentification

**Symptômes:**
- Vous êtes redirigé vers `/login`
- URL change de `#/sites` à `#/login`

**Solution:**
- Le token de session a expiré
- Reconnectez-vous

**Test:**
```javascript
// Tapez ceci dans la console
localStorage.getItem('seafarm_auth_token')
// Si null ou undefined, vous n'êtes pas connecté
```

### Scénario 3: Problème de Permissions

**Symptômes:**
- Vous êtes redirigé vers `/dashboard`
- Message "Insufficient permissions"

**Solution:**
- Votre utilisateur n'a pas la permission `OPERATIONS_VIEW`

**Vérification:**
```javascript
// Dans la console
JSON.parse(localStorage.getItem('seafarm_current_user'))
// Vérifiez le champ 'roleId' et les permissions
```

### Scénario 4: Erreur de Chargement de Données

**Symptômes:**
- Console montre `[sites] Error loading data`
- Page blanche ou partiellement chargée

**Solution:**
- Problème de connexion Supabase
- Vérifiez les variables d'environnement

**Test Supabase:**
```javascript
// Tapez ceci dans la console
import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2').then(({ createClient }) => {
  const supabase = createClient(
    'https://kxujxjcuyfbvmzahyzcv.supabase.co',
    'sb_publishable_ufzODkevI8XjDtRhGkgo7Q_zN6QKORd'
  );
  return supabase.from('sites').select('*');
}).then(({ data, error }) => {
  console.log('Supabase Test Result:', { data, error });
});
```

### Scénario 5: Problème de Rendu React

**Symptômes:**
- Pas d'erreur dans la console
- Page blanche mais HTML présent
- Elements React ne s'affichent pas

**Solution:**
- Conflit CSS
- Problème de style

**Vérification:**
1. Clic droit → "Inspecter l'élément"
2. Regardez dans l'onglet "Elements"
3. Cherchez `<div id="root">` ou similaire
4. Y a-t-il du contenu HTML ?

---

## 🧪 Tests Rapides

### Test 1: Vérifier que l'Application est Accessible
```bash
curl -I https://3000-iw1hbfa3ilo0b15qntvdt-3844e1b6.sandbox.novita.ai
```
Attendu: HTTP 200 OK

### Test 2: Vérifier Supabase depuis la Console
```javascript
// Copiez-collez dans la console du navigateur
fetch('https://kxujxjcuyfbvmzahyzcv.supabase.co/rest/v1/sites', {
  headers: {
    'apikey': 'sb_publishable_ufzODkevI8XjDtRhGkgo7Q_zN6QKORd',
    'Authorization': 'Bearer sb_publishable_ufzODkevI8XjDtRhGkgo7Q_zN6QKORd'
  }
})
.then(r => r.json())
.then(d => console.log('Sites from Supabase:', d))
.catch(e => console.error('Supabase error:', e));
```

### Test 3: Vérifier l'Authentification
```javascript
// Dans la console
const user = JSON.parse(localStorage.getItem('seafarm_current_user') || 'null');
console.log('Current User:', user);
console.log('Is Logged In:', !!user);
if (user) {
  console.log('User Role:', user.roleId);
}
```

---

## 📸 Capture d'Écran

Si vous voyez une **page d'erreur stylisée** au lieu d'une page blanche, c'est l'ErrorBoundary qui fonctionne !

L'écran devrait ressembler à :
```
⚠️ Oops! Something went wrong
Une erreur s'est produite lors du chargement de cette page

Error Details:
[Le message d'erreur ici]

[Reload Page] [Go Back]
```

---

## 📋 Checklist de Debug

Cochez ce que vous observez :

- [ ] Page complètement blanche (aucun contenu)
- [ ] Page d'erreur ErrorBoundary affichée
- [ ] Redirigé vers /login
- [ ] Redirigé vers /dashboard
- [ ] Erreur rouge dans la console
- [ ] Avertissement Supabase dans la console
- [ ] Aucune erreur dans la console
- [ ] HTML présent mais non affiché
- [ ] Chargement infini

---

## 🆘 Informations à Fournir

Pour que je puisse vous aider efficacement, j'ai besoin de :

### 1. Copie de la Console (F12)
Copiez **tout** le contenu de la console et envoyez-le moi.

### 2. URL Actuelle
Quelle est l'URL affichée dans la barre d'adresse quand la page est blanche ?

### 3. Comportement
- La page charge-t-elle puis devient blanche ?
- Ou est-elle immédiatement blanche ?
- Y a-t-il un flash de contenu avant de devenir blanche ?

### 4. Navigateur
- Quel navigateur utilisez-vous ? (Chrome, Firefox, Safari, Edge)
- Version du navigateur

### 5. Appareil
- Ordinateur, tablette ou mobile ?
- Système d'exploitation

---

## 🔧 Solutions de Contournement Temporaires

En attendant la résolution :

### Option 1: Accès Direct via URL
Essayez d'accéder directement à :
```
https://3000-iw1hbfa3ilo0b15qntvdt-3844e1b6.sandbox.novita.ai/#/sites
```

### Option 2: Vider le Cache
1. Ouvrir DevTools (F12)
2. Clic droit sur le bouton refresh
3. Sélectionner "Empty Cache and Hard Reload"

### Option 3: Mode Incognito
Testez dans une fenêtre de navigation privée

### Option 4: Autre Navigateur
Essayez avec un navigateur différent

---

## 📝 Log de Debug Structuré

Remplissez et envoyez-moi :

```
=== DEBUG LOG ===
Date: [Date et heure]
URL: https://3000-iw1hbfa3ilo0b15qntvdt-3844e1b6.sandbox.novita.ai
Action: Clic sur "Sites"

Résultat:
- Page blanche: [OUI/NON]
- ErrorBoundary affiché: [OUI/NON]
- Redirigé vers: [URL si redirigé]

Console (F12):
[Copiez-collez TOUTES les lignes de la console ici]

Erreurs visibles:
[Listez toutes les erreurs rouges]

Navigation:
1. Ouvert l'app
2. Connecté avec admin@seafarm.com
3. Cliqué sur [Menu exact]
4. Résultat : [Décrivez ce que vous voyez]

Navigateur: [Chrome/Firefox/Safari/Edge] version [X]
OS: [Windows/Mac/Linux]
Appareil: [Desktop/Mobile/Tablet]
```

---

## 🎯 Actions Immédiates

**Pendant que vous testez, j'ai appliqué ces corrections :**

✅ ErrorBoundary global ajouté
✅ ErrorBoundary sur toutes les routes Operations
✅ Gestion d'erreurs robuste dans Supabase sync
✅ Logs détaillés dans la console
✅ Build vérifié et fonctionnel

**Le serveur est en ligne sur le port 3000**

**Prochaine étape : J'attends vos retours de debug pour identifier le problème exact !**

---

**Lien de test:** https://3000-iw1hbfa3ilo0b15qntvdt-3844e1b6.sandbox.novita.ai
