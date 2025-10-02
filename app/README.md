# VinylVault

VinylVault est une application web moderne pour gérer et organiser votre collection de vinyles. Intégrée avec l'API Discogs, elle vous permet de cataloguer facilement vos disques, suivre leur valeur et découvrir de nouveaux vinyles.

## ✨ Fonctionnalités

### 🎯 Fonctionnalités principales

- Extraits de chansons : Écoutez les extraits de chansons de vos vinyles
- Authentification sécurisée : Système d'inscription/connexion avec JWT
  Interface moderne : Design responsive avec Tailwind CSS
- Connexion avec Discogs : Importez vos vinyles depuis Discogs et ajoutez automatiquement les informations complètes
- Gestion des collections : Créez et organisez plusieurs collections personnalisées
- Filtres avancés : Filtrez vos vinyles par genre, format, année, condition, etc.
- Suggestions et recommandations : Découvrez de nouveaux vinyles en fonction de vos préférences
- Navigation intuitive : Explorez votre collection avec une navigation intuitive et un design moderne
- Statistiques détaillées : Suivez la valeur de votre collection et vos tendances
- Wishlist : Ajoutez des vinyles à votre wishlist pour les suivre
- Dashboard : Accédez à votre tableau de bord pour une vue d'ensemble de votre collection

### 🔍 Recherche et découverte

Recherche avancée dans la base Discogs
Filtres par genre, format, année, condition
Suggestions et recommandations
Navigation intuitive avec pagination

### 📊 Gestion avancée

Suivi des conditions et prix d'achat
Estimation de valeur
Notes personnelles sur chaque vinyle
Import/export de collections
Partage de collections publiques

### Patterns

Factory Pattern : pour gérer plusieurs types d’objets “Vinyl” (collection, wishlist, custom…).

À combiner avec :

- Repository (pour l’accès aux données),
- Adapter (pour unifier les formats),
- Observer (pour réagir aux changements en temps réel).
