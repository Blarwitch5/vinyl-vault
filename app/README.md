# VinylVault

VinylVault est une application web moderne pour gérer et organiser votre collection de vinyles. Intégrée avec l'API Discogs, elle vous permet de cataloguer facilement vos disques, suivre leur valeur et découvrir de nouveaux vinyles.

## ✨ Fonctionnalités

### 🎯 Fonctionnalités principales

Gestion de collections : Créez et organisez plusieurs collections personnalisées
Intégration Discogs : Recherchez dans la base de données Discogs et ajoutez automatiquement les informations complètes
Authentification sécurisée : Système d'inscription/connexion avec JWT
Interface moderne : Design responsive avec Tailwind CSS
Statistiques détaillées : Suivez la valeur de votre collection et vos tendances

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
