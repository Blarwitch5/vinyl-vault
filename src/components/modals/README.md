# Système de Modales Réutilisables

Ce système fournit des composants modaux flexibles et réutilisables avec gestion d'événements intégrée.

## Composants Disponibles

### 1. Modal de Base (`ui/Modal.astro`)

Le composant de base qui fournit toute la logique commune :

```astro
---
import Modal from '../ui/Modal.astro'
---

<Modal
  id="ma-modal"
  size="md"
  animation="scale"
  closable={true}
  backdrop="blur"
>
  <h2 slot="title">Mon Titre</h2>

  <p>Contenu de ma modal</p>

  <div slot="footer">
    <button onclick="closeModal('ma-modal')">Fermer</button>
  </div>
</Modal>
```

#### Props disponibles :

- `id` (string, requis) : Identifiant unique de la modal
- `size` ('sm' | 'md' | 'lg' | 'xl' | 'full') : Taille de la modal
- `closable` (boolean) : Peut-on fermer la modal ?
- `backdrop` ('blur' | 'dark' | 'none') : Type de fond
- `animation` ('fade' | 'scale' | 'slide') : Animation d'ouverture/fermeture
- `zIndex` (number) : Z-index CSS
- `className` (string) : Classes CSS additionnelles

### 2. Modal de Confirmation (`modals/ConfirmationModal.astro`)

Pour les confirmations d'actions :

```astro
---
import ConfirmationModal from '../modals/ConfirmationModal.astro'
---

<ConfirmationModal
  id="confirm-delete"
  title="Supprimer l'élément"
  message="Êtes-vous sûr de vouloir supprimer cet élément ?"
  type="danger"
  confirmText="Supprimer"
  cancelText="Annuler"
/>

<script>
  // Écouter la confirmation
  document.addEventListener('modal:confirm-delete:confirmed', () => {
    console.log('Action confirmée !')
    // Logique de suppression
  })

  document.addEventListener('modal:confirm-delete:cancelled', () => {
    console.log('Action annulée')
  })

  // Ouvrir la modal
  function deleteItem() {
    openModal('confirm-delete')
  }
</script>
```

### 3. Modal d'Information (`modals/InfoModal.astro`)

Pour afficher des informations :

```astro
---
import InfoModal from '../modals/InfoModal.astro'
---

<InfoModal id="info-success" title="Opération réussie" type="success">
  <p>Votre vinyle a été ajouté avec succès à votre collection !</p>
</InfoModal>

<script>
  function showSuccess() {
    openModal('info-success')
  }
</script>
```

## API JavaScript

### Fonctions Globales

```javascript
// Ouvrir une modal
openModal('modal-id')

// Fermer une modal
closeModal('modal-id')

// Basculer une modal
toggleModal('modal-id')
```

### Gestionnaire de Modales

```javascript
import { modalManager } from '../utils/modal-manager'

// Enregistrer une modal
modalManager.registerModal('modal-id', modalElement)

// Ouvrir/fermer
modalManager.openModal('modal-id')
modalManager.closeModal('modal-id')

// Fermer toutes les modales
modalManager.closeAllModals()

// Obtenir la modal actuellement ouverte
const currentModal = modalManager.getCurrentModal()

// Vérifier si une modal est ouverte
const isOpen = modalManager.isModalOpen()
```

## Événements

Le système émet plusieurs événements personnalisés :

### Événements de Base

```javascript
// Avant l'ouverture
modal.addEventListener('modal:open', (e) => {
  console.log("Modal sur le point de s'ouvrir:", e.detail.modalId)
})

// Après l'ouverture
modal.addEventListener('modal:opened', (e) => {
  console.log('Modal ouverte:', e.detail.modalId)
})

// Avant la fermeture
modal.addEventListener('modal:close', (e) => {
  console.log('Modal sur le point de se fermer:', e.detail.modalId)
})

// Après la fermeture
modal.addEventListener('modal:closed', (e) => {
  console.log('Modal fermée:', e.detail.modalId)
})
```

### Événements Spécifiques

```javascript
// Pour les modales de confirmation
document.addEventListener('modal:confirm-delete:confirmed', (e) => {
  // Action confirmée
})

document.addEventListener('modal:confirm-delete:cancelled', (e) => {
  // Action annulée
})

// Événements personnalisés
document.addEventListener('modal:delete-vinyl:open', (e) => {
  // Ouvrir la modal avec des données
  openDeleteVinylModal(e.detail.vinyl)
})
```

## Exemples d'Utilisation Avancée

### Modal avec Données Dynamiques

```astro
---
import Modal from '../ui/Modal.astro'
---

<Modal id="dynamic-modal" size="lg">
  <div slot="title">
    <span id="dynamic-title">Titre par défaut</span>
  </div>

  <div id="dynamic-content">
    <!-- Contenu dynamique -->
  </div>

  <div slot="footer">
    <button onclick="closeModal('dynamic-modal')">Fermer</button>
  </div>
</Modal>

<script>
  function openDynamicModal(data) {
    // Mettre à jour le contenu
    document.getElementById('dynamic-title').textContent = data.title
    document.getElementById('dynamic-content').innerHTML = data.content

    // Ouvrir la modal
    openModal('dynamic-modal')
  }

  // Utilisation
  openDynamicModal({
    title: 'Détails du Vinyle',
    content: '<p>Informations détaillées...</p>',
  })
</script>
```

### Modal avec Validation

```astro
<Modal id="form-modal" size="md">
  <h2 slot="title">Ajouter un Élément</h2>

  <form id="modal-form">
    <input type="text" id="item-name" placeholder="Nom" required />
    <div id="form-error" class="hidden text-red-600"></div>
  </form>

  <div slot="footer">
    <button onclick="closeModal('form-modal')">Annuler</button>
    <button onclick="submitForm()">Ajouter</button>
  </div>
</Modal>

<script>
  function submitForm() {
    const name = document.getElementById('item-name').value
    const errorDiv = document.getElementById('form-error')

    if (!name.trim()) {
      errorDiv.textContent = 'Le nom est requis'
      errorDiv.classList.remove('hidden')
      return
    }

    // Traitement...
    closeModal('form-modal')
  }
</script>
```

## Bonnes Pratiques

1. **IDs Uniques** : Utilisez des IDs descriptifs et uniques
2. **Événements** : Écoutez les événements pour les actions post-modal
3. **Accessibilité** : Le système gère automatiquement l'accessibilité (Escape, focus trap)
4. **Performance** : Les modales sont enregistrées une seule fois au chargement
5. **Responsive** : Toutes les modales sont responsive par défaut

## Migration depuis les Anciennes Modales

Pour migrer une modal existante :

1. Remplacez la structure HTML par le composant `Modal`
2. Déplacez le titre vers le slot `title`
3. Déplacez les actions vers le slot `footer`
4. Remplacez les appels `document.getElementById().style.display` par `openModal()`/`closeModal()`
5. Utilisez les événements au lieu des callbacks directs
