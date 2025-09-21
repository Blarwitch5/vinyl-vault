# Guide d'Accessibilité VinylVault

Ce guide décrit les fonctionnalités d'accessibilité implémentées dans VinylVault pour garantir une expérience utilisateur inclusive.

## 🎯 Fonctionnalités Implémentées

### 1. Navigation au Clavier

#### Skip to Content

- **Composant** : `SkipToContent.astro`
- **Utilisation** : Automatiquement inclus dans `BaseLayout.astro`
- **Fonctionnement** :
  - Visible uniquement au focus (Tab)
  - Permet de passer directement au contenu principal
  - Navigation fluide avec défilement automatique

#### Navigation des Cartes

- **Touches supportées** : `Tab`, `Enter`, `Espace`
- **Focus visible** : Anneau bleu avec `focus:ring-2`
- **Actions** : Clic et navigation clavier identiques

#### Modales

- **Ouverture** : Focus automatique sur le premier élément focusable
- **Navigation** : Trap du focus dans la modale
- **Fermeture** : `Échap` pour fermer, restauration du focus précédent

### 2. Support des Lecteurs d'Écran

#### Labels ARIA

```astro
<!-- Exemple de bouton avec label descriptif -->
<button
  aria-label="Ajouter Dark Side of the Moon par Pink Floyd à votre collection"
  title="Ajouter à la collection"
>
  <!-- Icône -->
</button>
```

#### Rôles et États

- **Cartes de vinyles** : `role="button"`, `tabindex="0"`
- **Modales** : `role="dialog"`, `aria-modal="true"`
- **Contenu masqué** : `aria-hidden="true"` pour le contenu principal quand une modale est ouverte

#### Live Regions

- Annonces automatiques pour les actions importantes
- Messages de succès/erreur annoncés aux lecteurs d'écran

### 3. Gestion du Focus

#### Focus Trap

```typescript
// Exemple d'utilisation du FocusTrap
const trap = new FocusTrap(modalElement)
trap.activate() // Active le trap
trap.deactivate() // Désactive et restaure le focus précédent
```

#### Focus Visible

- Tous les éléments interactifs ont un indicateur de focus visible
- Couleurs cohérentes : bleu pour navigation, vert pour actions positives, rouge pour actions destructives

## 🛠️ Utilisation des Utilitaires

### AccessibleModalManager

```typescript
import { AccessibleModalManager } from '../utils/accessibility-helpers'

const manager = AccessibleModalManager.getInstance()

// Ouvrir une modale accessible
manager.openModal(modalElement)

// Fermer (géré automatiquement par Échap)
manager.closeActiveModal()
```

### Amélioration des Boutons

```typescript
import { enhanceButtonAccessibility } from '../utils/accessibility-helpers'

enhanceButtonAccessibility(button, {
  label: "Description complète de l'action",
  describedBy: 'help-text-id',
  expanded: false, // Pour les boutons de menu
  controls: 'menu-id', // Pour les boutons qui contrôlent d'autres éléments
})
```

### Amélioration des Formulaires

```typescript
import { enhanceFormAccessibility } from '../utils/accessibility-helpers'

// Associe automatiquement labels, erreurs et attributs requis
enhanceFormAccessibility(formElement)
```

## 📋 Checklist d'Accessibilité

### Pour chaque nouveau composant :

- [ ] **Navigation clavier** : Tab, Enter, Espace fonctionnent
- [ ] **Focus visible** : Indicateur de focus clair et contrasté
- [ ] **Labels ARIA** : Descriptions complètes pour les lecteurs d'écran
- [ ] **Rôles sémantiques** : `button`, `dialog`, `main`, etc.
- [ ] **États ARIA** : `aria-expanded`, `aria-selected`, `aria-disabled`
- [ ] **Contraste** : Minimum 4.5:1 pour le texte normal, 3:1 pour le texte large
- [ ] **Responsive** : Fonctionne sur tous les appareils et orientations

### Pour les modales :

- [ ] **Focus trap** : Navigation limitée à la modale
- [ ] **Échap pour fermer** : Fermeture intuitive
- [ ] **Restauration du focus** : Retour à l'élément déclencheur
- [ ] **Masquage du contenu** : `aria-hidden="true"` sur le contenu principal
- [ ] **Annonces** : Messages pour les lecteurs d'écran

### Pour les formulaires :

- [ ] **Labels associés** : Chaque champ a un label explicite
- [ ] **Messages d'erreur** : Liés avec `aria-describedby`
- [ ] **Champs requis** : Marqués avec `aria-required="true"`
- [ ] **Instructions** : Fournies avant les champs complexes
- [ ] **Validation** : Messages d'erreur clairs et constructifs

## 🧪 Tests d'Accessibilité

### Tests Manuels

1. **Navigation clavier** : Tab à travers tous les éléments
2. **Lecteur d'écran** : Tester avec NVDA (Windows), VoiceOver (Mac), ou ORCA (Linux)
3. **Zoom** : Tester jusqu'à 200% de zoom
4. **Contraste** : Vérifier avec les outils de développement du navigateur

### Tests Automatisés

```bash
# Installer axe-core pour les tests automatisés
npm install --save-dev @axe-core/playwright

# Lancer les tests d'accessibilité
npm run test:a11y
```

### Outils Recommandés

- **axe DevTools** : Extension de navigateur pour tests automatisés
- **WAVE** : Évaluation d'accessibilité web
- **Color Contrast Analyzer** : Vérification du contraste des couleurs
- **Lighthouse** : Audit d'accessibilité intégré

## 🎨 Classes CSS d'Accessibilité

### Classes Utilitaires

```css
/* Masquer visuellement mais garder accessible */
.sr-only {
  position: absolute !important;
  width: 1px !important;
  height: 1px !important;
  padding: 0 !important;
  margin: -1px !important;
  overflow: hidden !important;
  clip: rect(0, 0, 0, 0) !important;
  white-space: nowrap !important;
  border: 0 !important;
}

/* Focus visible cohérent */
.focus-visible {
  @apply focus:outline-none focus:ring-2 focus:ring-blue-300 focus:ring-offset-2;
}
```

### Classes de Focus

- `focus:ring-blue-300` : Navigation générale
- `focus:ring-emerald-300` : Actions positives (ajouter, confirmer)
- `focus:ring-red-300` : Actions destructives (supprimer)
- `focus:ring-amber-300` : Actions d'attention (modifier, avertir)

## 📚 Ressources

- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [MDN Accessibility](https://developer.mozilla.org/en-US/docs/Web/Accessibility)
- [A11y Project Checklist](https://www.a11yproject.com/checklist/)
- [WebAIM Screen Reader Testing](https://webaim.org/articles/screenreader_testing/)

## 🔄 Maintenance

### Vérifications Régulières

1. **Tests automatisés** : Intégrer axe-core dans les tests CI/CD
2. **Audit manuel** : Tests mensuels avec lecteurs d'écran
3. **Feedback utilisateurs** : Canal dédié pour retours d'accessibilité
4. **Mise à jour** : Suivre les évolutions des standards WCAG

### Amélioration Continue

- Collecter les retours des utilisateurs avec handicaps
- Mettre à jour les tests en fonction des nouvelles fonctionnalités
- Former l'équipe aux bonnes pratiques d'accessibilité
- Documenter les patterns d'accessibilité spécifiques au projet
