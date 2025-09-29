# 🎵 VinylVault Monorepo

Application moderne de gestion de collection de vinyles avec API Discogs intégrée.

## 📁 Structure du Projet

```
VinylVault/
├── landing/              # Site marketing (domain.com)
│   ├── src/pages/       # Pages Landing
│   └── package.json     # Dépendances minimales
├── app/                  # Application VinylVault (app.domain.com)
│   ├── src/pages/       # Dashboard, Collections, Vinyl management
│   ├── prisma/          # Schema base de données
│   └── package.json     # Full stack (Prisma, Clerk, Auth)
├── package.json          # Monorepo workspace
└── DEPLOYMENT_GUIDE.md  # Instructions déploiement
```

## 🚀 Démarrage Rapide

### **Développement complet (Landing + App)**
```bash
npm run dev
```

### **Projets séparés**
```bash
npm run dev:landing     # → http://localhost:4321 (Marketing)
npm run dev:app        # → http://localhost:4322 (Application)
```

### **Build complet**
```bash
npm run build
```

## ⚡ Technologies 

**Landing Marketing :**
- [x] Astro minimal
- [x] Tailwind CSS
- [x] Glass-morphism modern design

**Application VinylVault :**
- [x] Astro SSR + Vercel
- [x] Prisma + PostgreSQL (Neon)
- [x] Clerk Auth integration  
- [x] Discogs API
- [x] Dashboard gestion collections

## 🎯 Fonctionnalités

- 📱 **Landing** → Présentation + Call-to-Action → redirect app
- 🎵 **App** → Gestion complète collections vinyles
- 🔍 Scan codes-barres → import API Discogs 
- 📊 Analyse et statistiques collection
- 🏷️ Organisation collections multiples

## 📋 Déploiement

Voir [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) pour instructions complètes Vercel.

---

**VinylVault par BluRwitch** 🎵 | © 2024