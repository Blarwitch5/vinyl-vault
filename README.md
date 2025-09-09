# 🎵 VinylVault

**VinylVault** est une application web moderne pour gérer et organiser votre collection de vinyles. Intégrée avec l'API Discogs, elle vous permet de cataloguer facilement vos disques, suivre leur valeur et découvrir de nouveaux vinyles.

## ✨ Fonctionnalités

### 🎯 Fonctionnalités principales

- **Gestion de collections** : Créez et organisez plusieurs collections personnalisées
- **Intégration Discogs** : Recherchez dans la base de données Discogs et ajoutez automatiquement les informations complètes
- **Authentification sécurisée** : Système d'inscription/connexion avec JWT
- **Interface moderne** : Design responsive avec Tailwind CSS
- **Statistiques détaillées** : Suivez la valeur de votre collection et vos tendances

### 🔍 Recherche et découverte

- Recherche avancée dans la base Discogs
- Filtres par genre, format, année, condition
- Suggestions et recommandations
- Navigation intuitive avec pagination

### 📊 Gestion avancée

- Suivi des conditions et prix d'achat
- Estimation de valeur
- Notes personnelles sur chaque vinyle
- Import/export de collections
- Partage de collections publiques

## 🚀 Installation

### Prérequis

- Node.js 18+
- npm ou pnpm
- Base de données PostgreSQL (Supabase recommandé)
- Token API Discogs

### Configuration rapide

1. **Clonez le projet**

```bash
git clone https://github.com/votre-username/vinyl-vault.git
cd vinyl-vault
```

2. **Installez les dépendances**

```bash
npm install
# ou
pnpm install
```

3. **Configuration de l'environnement**

```bash
# Le fichier .env est déjà configuré avec vos clés Discogs !
# Vérifiez la configuration
pnpm validate-config
```

**✅ Vos clés API Discogs sont déjà configurées :**

- `DISCOGS_CONSUMER_KEY="hOzKNJdosmmCLJFATkNV"`
- `DISCOGS_CONSUMER_SECRET="oSxbEfkEwRCrJjvJrcKPmWXvnreklfET"`

Pour une configuration avancée, consultez [ENVIRONMENT_SETUP.md](./ENVIRONMENT_SETUP.md)

4. **Configurez la base de données**

Créez les tables nécessaires (script SQL fourni dans `/docs/database.sql`) :

```sql
-- Utilisateurs
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(100),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Collections
CREATE TABLE collections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  is_public BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Éléments de collection
CREATE TABLE collection_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  collection_id UUID REFERENCES collections(id) ON DELETE CASCADE,
  discogs_id VARCHAR(50),
  title VARCHAR(255) NOT NULL,
  artist VARCHAR(255) NOT NULL,
  year INTEGER,
  format VARCHAR(50),
  condition VARCHAR(50),
  cover_image TEXT,
  note TEXT,
  purchase_price DECIMAL(10,2),
  purchase_date DATE,
  estimated_value DECIMAL(10,2),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

5. **Lancez le serveur de développement**

```bash
npm run dev
# ou
pnpm dev
```

L'application sera accessible sur `http://localhost:4321`

## 🏗️ Architecture du projet

```
vinyl-vault/
├── public/                     # Fichiers statiques
├── src/
│   ├── components/             # Composants Astro réutilisables
│   │   ├── Navbar.astro
│   │   ├── Footer.astro
│   │   ├── SearchBar.astro
│   │   └── VinylCard.astro
│   │
│   ├── layouts/                # Layouts globaux
│   │   └── BaseLayout.astro
│   │
│   ├── pages/                  # Pages publiques
│   │   ├── index.astro         # Page d'accueil
│   │   ├── login.astro         # Connexion
│   │   ├── register.astro      # Inscription
│   │   ├── dashboard.astro     # Tableau de bord
│   │   ├── search.astro        # Recherche vinyles
│   │   └── collection/[id].astro # Vue collection
│   │
│   ├── lib/                    # Fonctions utilitaires
│   │   ├── auth.ts             # Gestion authentification
│   │   ├── db.ts               # Connexion base de données
│   │   └── discogs.ts          # Wrapper API Discogs
│   │
│   ├── server/                 # API endpoints
│   │   ├── auth/
│   │   │   ├── login.ts
│   │   │   └── register.ts
│   │   ├── collections/
│   │   │   ├── add.ts
│   │   │   ├── list.ts
│   │   │   └── remove.ts
│   │   └── discogs/
│   │       └── search.ts
│   │
│   └── styles/
│       └── global.css
│
├── astro.config.mjs
├── tailwind.config.js
├── package.json
└── README.md
```

## 🎨 Technologies utilisées

- **Framework** : [Astro](https://astro.build/) - Framework web moderne
- **Styling** : [Tailwind CSS](https://tailwindcss.com/) - Framework CSS utilitaire
- **Base de données** : PostgreSQL avec [Supabase](https://supabase.com/)
- **Authentification** : JWT avec bcryptjs
- **API externe** : [Discogs API](https://www.discogs.com/developers)
- **Déploiement** : Compatible Vercel, Netlify, Heroku

## 📋 Utilisation

### Première utilisation

1. **Créez un compte** sur la page d'inscription
2. **Obtenez un token Discogs** :
   - Visitez [Discogs Developers](https://www.discogs.com/settings/developers)
   - Créez une nouvelle application
   - Copiez votre token personnel
3. **Commencez à chercher** des vinyles via la page de recherche
4. **Créez vos collections** et organisez vos vinyles

### Fonctionnalités avancées

- **Recherche avancée** : Utilisez les filtres pour affiner vos résultats
- **Collections multiples** : Organisez vos vinyles par thème, genre, etc.
- **Suivi de valeur** : Ajoutez les prix d'achat et suivez l'évolution
- **Partage** : Rendez vos collections publiques pour les partager

## 🧪 Tests et développement

```bash
# Vérification des types TypeScript
npm run type-check

# Linting du code
npm run lint

# Formatage automatique
npm run format

# Build de production
npm run build

# Prévisualisation du build
npm run preview
```

## 🚀 Déploiement

### Vercel (recommandé)

1. Connectez votre repository GitHub à Vercel
2. Configurez les variables d'environnement dans le dashboard Vercel
3. Déployez automatiquement

### Variables d'environnement requises en production

```env
DISCOGS_TOKEN=votre-token-production
JWT_SECRET=secret-super-securise-production
SUPABASE_URL=votre-url-supabase
SUPABASE_ANON_KEY=votre-key-supabase
NODE_ENV=production
```

## 🤝 Contribution

Les contributions sont les bienvenues ! Voici comment contribuer :

1. Forkez le projet
2. Créez une branche pour votre fonctionnalité (`git checkout -b feature/amazing-feature`)
3. Committez vos changements (`git commit -m 'Add amazing feature'`)
4. Poussez vers la branche (`git push origin feature/amazing-feature`)
5. Ouvrez une Pull Request

### Standards de développement

- Utilisez TypeScript pour tous les nouveaux fichiers
- Suivez les conventions de nommage existantes
- Ajoutez des commentaires pour les fonctions complexes
- Testez vos modifications localement

## 📝 Roadmap

### Version 1.1

- [ ] Mode sombre
- [ ] Export PDF des collections
- [ ] Système de wishlist
- [ ] Notifications push

### Version 1.2

- [ ] Application mobile (React Native)
- [ ] Scan de codes-barres
- [ ] Intégration marketplace
- [ ] Recommandations IA

### Version 2.0

- [ ] Mode collaboratif
- [ ] API publique
- [ ] Plugins tiers
- [ ] Analyse avancée des tendances

## 🐛 Bugs connus et limitations

- La recherche Discogs est limitée à 60 requêtes par minute
- Les images de couverture dépendent de la disponibilité Discogs
- L'authentification nécessite JavaScript activé

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier [LICENSE](LICENSE) pour plus de détails.

## 🆘 Support

- **Documentation** : Consultez le [wiki](https://github.com/votre-username/vinyl-vault/wiki)
- **Issues** : Reportez les bugs sur [GitHub Issues](https://github.com/votre-username/vinyl-vault/issues)
- **Discord** : Rejoignez notre [serveur Discord](https://discord.gg/vinyl-vault)
- **Email** : Contactez-nous à support@vinylvault.com

## 🙏 Remerciements

- [Discogs](https://www.discogs.com/) pour leur API fantastique
- [Astro](https://astro.build/) pour le framework
- [Tailwind CSS](https://tailwindcss.com/) pour le styling
- La communauté open-source pour les nombreuses bibliothèques utilisées

---

**Développé avec ❤️ pour les passionnés de vinyles**
