# 🔑 Guide : Régénérer la Clé API Supabase

## ⚠️ Problème Actuel
La clé API actuelle retourne "Invalid API key". Il faut la régénérer.

## 📍 Étapes pour Régénérer la Clé

### Étape 1: Accéder aux Settings API
👉 **Ouvrez ce lien dans votre navigateur** :
```
https://kxujxjcuyfbvmzahyzcv.supabase.co/project/kxujxjcuyfbvmzahyzcv/settings/api
```

Ou manuellement :
1. Aller sur https://kxujxjcuyfbvmzahyzcv.supabase.co
2. Cliquer sur "Settings" dans la sidebar gauche
3. Cliquer sur "API" dans le sous-menu

### Étape 2: Trouver la Clé "anon public"
Sur la page API, vous verrez une section **"Project API keys"** avec deux clés :
- **anon public** : C'est celle-ci qu'il faut copier ✅
- **service_role** : Ne PAS utiliser celle-ci (trop de permissions) ❌

### Étape 3: Copier la Clé
1. Cliquez sur l'icône 📋 (copy) à côté de la clé **anon public**
2. La clé ressemble à : `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3M...` (très longue)

### Étape 4: Mettre à Jour .env.local

#### Option A : Sur votre machine locale
```bash
# Ouvrir le fichier .env.local
nano .env.local
# ou
code .env.local
```

Remplacer la ligne :
```env
VITE_SUPABASE_ANON_KEY=<ancienne-clé>
```

Par :
```env
VITE_SUPABASE_ANON_KEY=<nouvelle-clé-copiée>
```

#### Option B : Dans ce terminal (pour test)
Si vous voulez que je le fasse ici, copiez-collez la nouvelle clé et je la mettrai dans le fichier.

### Étape 5: Redémarrer le Serveur
```bash
# Arrêter le serveur (Ctrl+C si en cours)
# Puis relancer
npm run dev
```

## 📋 Checklist
- [ ] Accéder à https://kxujxjcuyfbvmzahyzcv.supabase.co/project/kxujxjcuyfbvmzahyzcv/settings/api
- [ ] Copier la clé "anon public" (PAS service_role)
- [ ] Mettre à jour .env.local avec VITE_SUPABASE_ANON_KEY=<nouvelle-clé>
- [ ] Redémarrer npm run dev
- [ ] Tester la connexion

## ⚡ Note Importante
**NE JAMAIS** partager ou committer la clé API dans Git !  
Le fichier `.env.local` doit être dans `.gitignore`.

## 🔗 Liens Utiles
- **API Settings** : https://kxujxjcuyfbvmzahyzcv.supabase.co/project/kxujxjcuyfbvmzahyzcv/settings/api
- **Dashboard** : https://kxujxjcuyfbvmzahyzcv.supabase.co
- **Documentation** : https://supabase.com/docs/guides/api/api-keys

---

**Une fois la clé mise à jour, passez à l'étape suivante : Relancer npm run dev**
