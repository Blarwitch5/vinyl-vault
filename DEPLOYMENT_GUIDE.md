# 🚀 Guide de Déploiement VinylVault Monorepo

## 📋 Prérequis

### Comptes & Services
- [✅] Compte **Vercel** ([vercel.com](https://vercel.com))
- [✅] Compte **Neon** ([neon.tech](https://neon.tech)) - PostgreSQL cloud
- [✅] Compte **Clerk** ([clerk.com](https://clerk.com)) - Authentification 
- [✅] Domaine avec accès DNS (OVH, Google Domains, etc.)

### Variables d'environnement 
```env
# Landing : Potentiellement aucun
# App : Required variables

# 1. Neon Database 
DATABASE_URL="postgresql://username:password@ep-something.us-east-1.aws.neon.tech/vinylvault?sslmode=require"

# 2. Clerk Auth
CLERK_PUBLISHABLE_KEY="pk_test_..."
CLERK_SECRET_KEY="sk_test_..."

# 3. Discogs API
DISCOGS_CONSUMER_KEY="hOzKNJdosmmCLJFATkNV"
DISCOGS_CONSUMER_SECRET="oSxbEfkEwRCrJjvJrcKPmWXvnreklfET"
```

---

## 🏗️ Étape par Étape

### **1. Déploiement Vercel Projects**

#### **A. Créer le projet Landing**
1. **Vercel Dashboard** → "New Project"
2. **Import Git Repository** → selection du repo VinylVault
3. **Root Directory** → `landing`
4. **Framework** → `Astro`
5. **Domaine assigné** → `votredomaine.com`

#### **B. Créer le projet App**  
1. **Vercel Dashboard** → "New Project"
2. **Import Git Repository** → même repo
3. **Root Directory** → `app`  
4. **Framework** → `Astro`
5. **Domaine assigné** → `app.votredomaine.com`

---

### **2. Configuration Base de Données (Neon)**

1. **Créer un compte** sur [neon.tech](https://neon.tech)
2. **Créer un project PostgreSQL** nommé `vinylvault`
3. **Copier l'URL de connexion** → `DATABASE_URL`
4. **Dans l'app** → Se connecter au dashboard Vercel
5. **Variables d'environnement de l'app* :
   ```
   DATABASE_URL = [l'URL complète Neon]
   ```

6. **Migrations Prisma** (via Vercel):
   - Deploy de l'app sur Vercel 
   - L'authentification sera configurée

---

### **3. Configuration Auth (Clerk)**

1. **Créer un compte** sur [clerk.com](https://clerk.com)
2. **Créer une application** : nommé "VinylVault"
3. **Configuration du domaine** : `app.votredomaine.com`
4. **Clic auther settings** & ajout des variables :
   ```
   CLERK_PUBLISHABLE_KEY = pk_test_...
   CLERK_SECRET_KEY = sk_test_...
   ```

5. **Configuration de redirection**:
   - **Sign-in URLs** → `/login`  
   - **Sign-up URLs** → `/register`
   - **After sign-in** → `/dashboard`

---

### **4. Configuration DNS**

#### **Option A : Hébergeur de DNS (OVH, CloudFlare, etc.)**
Créer ces records :
```
Type        Name         Value
A           @           [IP_VERCEL_LANDING]
CNAME       app        cname.vercel-dns.com
```

#### **Option B : Vercel inclut un gestionnaire DNS**
Utiliser le DNS fourni par Vercel.

---

### **5. Variables d'environnement Finales**

#### **Projet Landing (VotreDomaine.com)**
```bash
Pas de variables requises → SITE_STATIQUE
```

#### **Projet App (app.VotreDomaine.com)**  
```bash
DATABASE_URL="postgresql://..."
CLERK_PUBLISHABLE_KEY="pk_..."
CLERK_SECRET_KEY="sk_..."
DISCOGS_CONSUMER_KEY="hOzKNJdosmmCLJFATkNV"  
DISCOGS_CONSUMER_SECRET="oSxbEfkEwRCrJjvJrcKPmWXvnreklfET"

JWT_SECRET="[string-hex-longue-et-securisee]"
NODE_ENV="production"  
```

---

### **6. Développement Local**

```bash
# Cloner le repo
git clone [URL_REPB]
cd VinylVault  

# Installer dependances
npm run install:all

# Mode dev avancé (les deux projets)
npm run dev

# Ou individuellement
npm run dev:landing    # Port 4321
npm run dev:app        # Port 4322
```

### **7. Workflow Git → Auto Deploy** 

```bash
# Git push → Vercel déploie automatiquement les deux projets :
git add .
git commit -m "Update VinylVault features"
git push origin main

# Ce qui déclenche :
# 1. Landing rebuild → domain.com déployé
# 2. App rebuild → app.domain.com déployé
# 3. Database migrations appliquées automatiquement
```

### **8. Fonctionnement Final**

**🍃 Landing (domain.com)**
- Pages marketing : gradients glass-effect / gris sombre
- Bouton "Accéder à VinylVault" → redirige vers app.domain.com
- Formulaire de login simple (optionnel)

**⚡ App (app.domain.com)** 
- L’application VinylVault complète :
  - Dashboard utilisateur 
  - Gestion collections
  - Scanner vinyles, API Discogs
  - Statistiques et recherche

---

## 🔧 **Bonus : Commandes Debug**

### **Erreurs de connexion base de données :**
```bash
# Dans Vercel logs de l’APP:
# - Check DATABASE_URL
# - Test de connectivité Neon  
# - Migrations prisma réussies
```

### **Auth Clerk erreurs :**
```bash
# Dans les logs browser console:
# - Check CLERK_KEYS
# - URL de redirection correct
```

### **Déploiements ratés :**
```bash
# Check build logs sur Vercel → Étapes diagnostique
npm run build:landing  # Landmark build local
npm run build:app     # Application build local  
```

✅ **Et voilà ! Ton VinylVault est en monorepo et déployé !** 🎵📱📊

> PS : Pour l’implémentation Clerk → utilisation d’islands React dans les pages Astro
