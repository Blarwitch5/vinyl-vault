/** @type {import('tailwindcss').Config} */

export default {
  // Configuration minimale pour Tailwind v4
  // Les personnalisations de thème sont définies dans src/styles/global.css avec @theme
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  darkMode: 'class',
  safelist: [
    // Classes de display pour l'apparition/disparition d'éléments
    'hidden',
    'block',
    'inline',
    'inline-block',
    'flex',
    'inline-flex',
    'grid',
    'inline-grid',
    'table',
    'table-cell',
    'table-row',
    'contents',
    'list-item',
    // Classes de visibilité
    'visible',
    'invisible',
    // Classes d'opacité pour les transitions
    'opacity-0',
    'opacity-100',
    // Classes de transformation pour les animations
    'transform',
    'scale-0',
    'scale-100',
    'translate-x-0',
    'translate-x-full',
    'translate-y-0',
    'translate-y-full',
  ],
}
