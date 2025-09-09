/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        // Couleurs personnalisées pour VinylVault avec thème dark/light
        vinyl: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
        },
        // Palette "Vinyl Modern" - Inspirée de l'univers des vinyles
        vinyl: {
          50: '#faf7ff',   // Très clair pour les backgrounds
          100: '#f3ebff',  // Fond très léger
          200: '#e4d4ff',  // Accent très clair
          300: '#d1b3ff',  // Accent clair
          400: '#b388ff',  // Accent medium
          500: '#9c27b0',  // Violet principal (accent1 dark)
          600: '#7b1fa2',  // Violet principal (accent1 light)
          700: '#6a1b9a',  // Violet foncé
          800: '#4a148c',  // Très foncé
          900: '#311b92',  // Ultra foncé
        },
        gold: {
          50: '#fffef7',   // Or très clair
          100: '#fefce8',  // Or clair
          200: '#fef9c3',  // Or medium clair
          300: '#fef08a',  // Or medium
          400: '#facc15',  // Or vif (accent2 dark)
          500: '#eab308',  // Or principal (accent2 light)
          600: '#ca8a04',  // Or foncé
          700: '#a16207',  // Or très foncé
          800: '#854d0e',  // Bronze
          900: '#713f12',  // Bronze foncé
        },
        // Système de couleurs "Vinyl Modern"
        dark: {
          background: '#0a0a0b', // Noir profond comme un vinyle
          surface: '#1a1a1b',    // Gris anthracite moderne
          text: '#f5f5f5',       // Blanc cassé pour la lisibilité
          textSecondary: '#a3a3a3', // Gris clair pour les textes secondaires
          accent1: '#9c27b0',     // Violet moderne principal
          accent2: '#facc15',     // Or vibrant pour les accents
          accent3: '#ff6b35',     // Orange chaud pour les éléments spéciaux
        },
        light: {
          background: '#fefefe', // Blanc pur moderne
          surface: '#f8f9fa',    // Gris très clair, presque blanc
          text: '#1a1a1b',       // Noir moderne
          textSecondary: '#6b7280', // Gris moyen pour les textes secondaires
          accent1: '#7b1fa2',     // Violet principal plus foncé en light
          accent2: '#eab308',     // Or principal
          accent3: '#dc2626',     // Rouge moderne pour les alertes
        },
        // Couleurs thématiques vinyles
        vinyl: {
          'record-black': '#1a1a1b',     // Noir vinyle
          'label-gold': '#ffd700',       // Or des labels vintage
          'label-red': '#dc143c',        // Rouge des labels classiques
          'label-blue': '#1e40af',       // Bleu des labels jazz
          'sleeve-cream': '#f5f5dc',     // Beige des pochettes vintage
          'groove-silver': '#c0c0c0',    // Argent des sillons
        },
      },
      fontFamily: {
        sans: [
          'Inter',
          'system-ui',
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'Roboto',
          '"Helvetica Neue"',
          'Arial',
          '"Noto Sans"',
          'sans-serif',
          '"Apple Color Emoji"',
          '"Segoe UI Emoji"',
          '"Segoe UI Symbol"',
          '"Noto Color Emoji"',
        ],
        display: [
          '"Space Grotesk"',
          'Inter',
          'system-ui',
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'Roboto',
          'sans-serif',
        ],
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },
      borderRadius: {
        'DEFAULT': '0.5rem',   // 8px - border-radius par défaut
        'sm': '0.25rem',       // 4px - éléments très petits
        'md': '0.5rem',        // 8px - boutons, inputs (même que DEFAULT)
        'lg': '0.75rem',       // 12px - cartes, modales  
        'xl': '1rem',          // 16px - conteneurs principaux
        '2xl': '1.5rem',       // 24px - grandes cartes
        '3xl': '2rem',         // 32px - sections hero
        'full': '9999px',      // badges, avatars
      },
      boxShadow: {
        'vinyl': '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        'vinyl-lg': '0 20px 40px -10px rgba(0, 0, 0, 0.15), 0 10px 20px -5px rgba(0, 0, 0, 0.08)',
        'glow': '0 0 20px rgba(59, 130, 246, 0.15)',
        'glow-purple': '0 0 20px rgba(168, 85, 247, 0.15)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
        'spin-slow': 'spin 3s linear infinite',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'vinyl-pattern': "url('data:image/svg+xml,%3Csvg width=\"60\" height=\"60\" viewBox=\"0 0 60 60\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cg fill=\"none\" fill-rule=\"evenodd\"%3E%3Cg fill=\"%23f1f5f9\" fill-opacity=\"0.4\"%3E%3Ccircle cx=\"30\" cy=\"30\" r=\"25\"%3E%3C/circle%3E%3Ccircle cx=\"30\" cy=\"30\" r=\"20\"%3E%3C/circle%3E%3Ccircle cx=\"30\" cy=\"30\" r=\"15\"%3E%3C/circle%3E%3Ccircle cx=\"30\" cy=\"30\" r=\"10\"%3E%3C/circle%3E%3Ccircle cx=\"30\" cy=\"30\" r=\"5\"%3E%3C/circle%3E%3C/g%3E%3C/g%3E%3C/svg%3E')",
      },
    },
  },
  plugins: [
    // Plugin pour les aspects ratio
    function({ addUtilities }) {
      addUtilities({
        '.aspect-vinyl': {
          aspectRatio: '1 / 1',
        },
        '.aspect-album': {
          aspectRatio: '1 / 1',
        },
      })
    },
    // Plugin pour les glassmorphism effects
    function({ addUtilities }) {
      addUtilities({
        '.glass': {
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
        },
        '.glass-dark': {
          backgroundColor: 'rgba(0, 0, 0, 0.1)',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
        },
      })
    },
    // Plugin pour les line-clamp (si pas disponible dans votre version)
    function({ addUtilities }) {
      addUtilities({
        '.line-clamp-1': {
          overflow: 'hidden',
          display: '-webkit-box',
          WebkitBoxOrient: 'vertical',
          WebkitLineClamp: '1',
        },
        '.line-clamp-2': {
          overflow: 'hidden',
          display: '-webkit-box',
          WebkitBoxOrient: 'vertical',
          WebkitLineClamp: '2',
        },
        '.line-clamp-3': {
          overflow: 'hidden',
          display: '-webkit-box',
          WebkitBoxOrient: 'vertical',
          WebkitLineClamp: '3',
        },
      })
    },
    // Plugin pour les états de hover personnalisés
    function({ addUtilities }) {
      addUtilities({
        '.hover-lift': {
          transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.15), 0 10px 10px -5px rgba(0, 0, 0, 0.08)',
          },
        },
        '.hover-glow': {
          transition: 'box-shadow 0.2s ease-in-out',
          '&:hover': {
            boxShadow: '0 0 20px rgba(59, 130, 246, 0.3)',
          },
        },
      })
    },
  ],
  // Configuration pour le dark mode
  darkMode: 'class',
};
