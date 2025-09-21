// Utilitaires pour la gestion des boutons

/**
 * Affiche un état de chargement sur un bouton
 */
export function setButtonLoading(
  button: HTMLButtonElement,
  loadingText = 'Chargement...'
): string {
  const originalText = button.textContent || ''
  button.disabled = true
  button.innerHTML = `
    <div class="flex items-center justify-center gap-2">
      <svg class="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
      </svg>
      <span>${loadingText}</span>
    </div>
  `
  return originalText
}

/**
 * Restaure l'état normal d'un bouton
 */
export function resetButton(
  button: HTMLButtonElement,
  originalText: string
): void {
  button.disabled = false
  button.textContent = originalText
}

/**
 * Crée un bouton avec icône selon les standards du projet
 */
export function createIconButton(config: {
  text: string
  icon?: string
  variant?: 'primary' | 'secondary' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  onClick?: () => void
}): HTMLButtonElement {
  const button = document.createElement('button')

  // Classes de base selon les cursorrules
  const baseClasses =
    'flex items-center justify-center gap-2 transition-colors font-medium rounded-lg'

  // Variants
  const variantClasses = {
    primary: 'bg-gradient-emerald text-white hover:bg-gradient-emerald/80',
    secondary:
      'bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700',
    danger: 'bg-red-600 text-white hover:bg-red-700',
  }

  // Sizes
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  }

  const variant = config.variant || 'primary'
  const size = config.size || 'md'

  button.className = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]}`

  // Contenu avec icône optionnelle
  if (config.icon) {
    button.innerHTML = `
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="${config.icon}"></path>
      </svg>
      <span>${config.text}</span>
    `
  } else {
    button.textContent = config.text
  }

  // Event listener
  if (config.onClick) {
    button.addEventListener('click', config.onClick)
  }

  return button
}

/**
 * Crée un bouton de pagination selon les standards
 */
export function createPaginationButton(config: {
  text: string
  href: string
  isActive?: boolean
}): HTMLAnchorElement {
  const link = document.createElement('a')
  link.href = config.href

  const baseClasses =
    'flex items-center justify-center px-3 py-2 text-sm font-medium rounded-xl border transition-colors'
  const activeClasses =
    'text-white bg-gradient-emerald dark:bg-gradient-emerald border-light-accent1 dark:border-dark-accent1'
  const inactiveClasses =
    'text-neutral-600 dark:text-neutral-400 bg-neutral-50 dark:bg-black/20 border-neutral-200 dark:border-neutral-700 hover:bg-white dark:hover:bg-neutral-900 hover:border-light-accent1 dark:hover:border-dark-accent1'

  link.className = `${baseClasses} ${config.isActive ? activeClasses : inactiveClasses}`
  link.textContent = config.text

  return link
}
