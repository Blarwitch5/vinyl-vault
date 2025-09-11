/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        // Palette Spotify/Neon/Vercel inspirée
        neutral: {
          50: '#fafafa', // Blanc cassé très clair
          100: '#f5f5f5', // Gris très clair
          200: '#e5e5e5', // Gris clair
          300: '#d4d4d4', // Gris medium clair
          400: '#a3a3a3', // Gris medium
          500: '#737373', // Gris medium foncé
          600: '#525252', // Gris foncé
          700: '#404040', // Gris très foncé
          800: '#262626', // Gris anthracite
          900: '#171717', // Gris presque noir
          950: '#0a0a0a', // Noir profond
        },
        zinc: {
          50: '#fafafa',
          100: '#f4f4f5',
          200: '#e4e4e7',
          300: '#d4d4d8',
          400: '#a1a1aa',
          500: '#71717a',
          600: '#52525b',
          700: '#3f3f46',
          800: '#27272a',
          900: '#18181b',
          950: '#09090b',
        },
        sand: {
          50: '#fafaf9',
          100: '#f5f5f4',
          200: '#e7e5e4',
          300: '#d6d3d1',
          400: '#a8a29e',
          500: '#78716c',
          600: '#57534e',
          700: '#44403c',
          800: '#292524',
          900: '#1c1917',
          950: '#0c0a09',
        },
        // Couleurs Emerald modernes
        emerald: {
          50: '#ecfdf5',
          100: '#d1fae5',
          200: '#a7f3d0',
          300: '#6ee7b7',
          400: '#34d399',
          500: '#10b981', // Emerald principal
          600: '#059669',
          700: '#047857',
          800: '#065f46',
          900: '#064e3b',
          950: '#022c22',
        },
        // Couleurs Teal modernes
        teal: {
          50: '#f0fdfa',
          100: '#ccfbf1',
          200: '#99f6e4',
          300: '#5eead4',
          400: '#2dd4bf',
          500: '#14b8a6', // Teal principal
          600: '#0d9488',
          700: '#0f766e',
          800: '#115e59',
          900: '#134e4a',
          950: '#042f2e',
        },
        // Couleurs gradient modernes
        gradient: {
          emerald: '#10b981',
          teal: '#14b8a6',
          emeraldLight: '#34d399',
          tealLight: '#2dd4bf',
        },
        // Système de couleurs moderne Emerald/Teal
        dark: {
          background: '#0a0a0a', // Noir profond (zinc-950)
          surface: '#171717', // Gris très foncé (neutral-900)
          surfaceHover: '#262626', // Gris foncé (neutral-800)
          border: '#404040', // Gris medium (neutral-700)
          text: '#fafafa', // Blanc cassé (neutral-50)
          textSecondary: '#a3a3a3', // Gris clair (neutral-400)
          accent: '#10b981', // Emerald principal
          accentHover: '#14b8a6', // Teal hover
          accentSecondary: '#34d399', // Emerald light secondaire
        },
        light: {
          background: '#fafafa', // Blanc cassé (neutral-50)
          surface: '#ffffff', // Blanc pur
          surfaceHover: '#f5f5f5', // Gris très clair (neutral-100)
          border: '#e5e5e5', // Gris clair (neutral-200)
          text: '#171717', // Gris très foncé (neutral-900)
          textSecondary: '#737373', // Gris medium (neutral-500)
          accent: '#14b8a6', // Teal principal
          accentHover: '#10b981', // Emerald hover
          accentSecondary: '#2dd4bf', // Teal light secondaire
        },
      },
      fontFamily: {
        sans: [
          'Poppins',
          'system-ui',
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'Roboto',
          '"Helvetica Neue"',
          'Arial',
          'sans-serif',
        ],
        display: [
          'Poppins',
          'system-ui',
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'Roboto',
          'sans-serif',
        ],
        mono: [
          '"JetBrains Mono"',
          'ui-monospace',
          'SFMono-Regular',
          '"SF Mono"',
          'Monaco',
          'Consolas',
          '"Liberation Mono"',
          '"Courier New"',
          'monospace',
        ],
      },
      spacing: {
        18: '4.5rem',
        88: '22rem',
        128: '32rem',
      },
      borderRadius: {
        DEFAULT: '0.5rem', // 8px - border-radius par défaut
        sm: '0.25rem', // 4px - éléments très petits
        md: '0.5rem', // 8px - boutons, inputs (même que DEFAULT)
        lg: '0.75rem', // 12px - cartes, modales
        xl: '1rem', // 16px - conteneurs principaux
        '2xl': '1.5rem', // 24px - grandes cartes
        '3xl': '2rem', // 32px - sections hero
        full: '9999px', // badges, avatars
      },
      boxShadow: {
        vinyl:
          '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        'vinyl-lg':
          '0 20px 40px -10px rgba(0, 0, 0, 0.15), 0 10px 20px -5px rgba(0, 0, 0, 0.08)',
        glow: '0 0 20px rgba(59, 130, 246, 0.15)',
        'glow-purple': '0 0 20px rgba(168, 85, 247, 0.15)',
        // Ombres subtiles pour dark mode
        'white-sm': '0 1px 2px rgba(255, 255, 255, 0.05)',
        white: '0 1px 3px rgba(255, 255, 255, 0.08)',
        'white-md': '0 2px 4px rgba(255, 255, 255, 0.06)',
        'white-lg': '0 4px 6px rgba(255, 255, 255, 0.05)',
        'white-xl': '0 6px 8px rgba(255, 255, 255, 0.04)',
        'white-2xl': '0 8px 12px rgba(255, 255, 255, 0.03)',
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
        'gradient-conic':
          'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'gradient-emerald':
          'linear-gradient(135deg, #10b981 0%, #14b8a6 50%, #34d399 100%)',
        'gradient-emerald-subtle':
          'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(20, 184, 166, 0.1) 100%)',
        'gradient-emerald-glow':
          'linear-gradient(135deg, rgba(16, 185, 129, 0.2) 0%, rgba(20, 184, 166, 0.2) 100%)',
        'gradient-emerald-border':
          'linear-gradient(95.19deg, rgba(16, 185, 129, 0) 65.7%, rgba(20, 184, 166, 0.2) 86.63%, rgba(52, 211, 153, 0.3) 99.73%)',
        'gradient-emerald-full':
          'linear-gradient(135deg, #10b981 0%, #14b8a6 50%, #34d399 100%)',
        'gradient-emerald-soft':
          'linear-gradient(135deg, rgba(16, 185, 129, 0.05) 0%, rgba(20, 184, 166, 0.05) 100%)',
        'gradient-teal':
          'linear-gradient(135deg, #14b8a6 0%, #10b981 50%, #2dd4bf 100%)',
        'gradient-teal-subtle':
          'linear-gradient(135deg, rgba(20, 184, 166, 0.1) 0%, rgba(16, 185, 129, 0.1) 100%)',
        'gradient-teal-glow':
          'linear-gradient(135deg, rgba(20, 184, 166, 0.2) 0%, rgba(16, 185, 129, 0.2) 100%)',
        'gradient-dark': 'linear-gradient(135deg, #171717 0%, #262626 100%)',
        'gradient-light': 'linear-gradient(135deg, #ffffff 0%, #f5f5f5 100%)',
        'gradient-emerald-dark':
          'linear-gradient(135deg, #064e3b 0%, #065f46 100%)',
        'gradient-emerald-light':
          'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)',
        'gradient-teal-dark':
          'linear-gradient(135deg, #134e4a 0%, #115e59 100%)',
        'gradient-teal-light':
          'linear-gradient(135deg, #f0fdfa 0%, #ccfbf1 100%)',
        'vinyl-pattern':
          'url(\'data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23f1f5f9" fill-opacity="0.4"%3E%3Ccircle cx="30" cy="30" r="25"%3E%3C/circle%3E%3Ccircle cx="30" cy="30" r="20"%3E%3C/circle%3E%3Ccircle cx="30" cy="30" r="15"%3E%3C/circle%3E%3Ccircle cx="30" cy="30" r="10"%3E%3C/circle%3E%3Ccircle cx="30" cy="30" r="5"%3E%3C/circle%3E%3C/g%3E%3C/g%3E%3C/svg%3E\')',
      },
    },
  },
  plugins: [
    // Plugins Tailwind officiels
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),

    // Plugin pour les aspects ratio
    function ({ addUtilities }) {
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
    function ({ addUtilities }) {
      addUtilities({
        '.glass': {
          backgroundColor: 'rgba(255, 255, 255, 0.02)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          boxShadow:
            '0 8px 32px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
        },
        '.glass-dark': {
          backgroundColor: 'rgba(0, 0, 0, 0.1)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          boxShadow:
            '0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.05)',
        },
        '.glass-emerald': {
          backgroundColor: 'rgba(16, 185, 129, 0.12)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          border: '1px solid rgba(16, 185, 129, 0.25)',
          boxShadow: '0 8px 32px rgba(16, 185, 129, 0.15)',
        },
        '.glass-emerald-subtle': {
          backgroundColor: 'rgba(16, 185, 129, 0.06)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(16, 185, 129, 0.15)',
          boxShadow: '0 4px 24px rgba(16, 185, 129, 0.08)',
        },
        '.glass-teal': {
          backgroundColor: 'rgba(20, 184, 166, 0.12)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          border: '1px solid rgba(20, 184, 166, 0.25)',
          boxShadow: '0 8px 32px rgba(20, 184, 166, 0.15)',
        },
        '.glass-teal-subtle': {
          backgroundColor: 'rgba(20, 184, 166, 0.06)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(20, 184, 166, 0.15)',
          boxShadow: '0 4px 24px rgba(20, 184, 166, 0.08)',
        },
        '.glass-card': {
          backgroundColor: 'rgba(255, 255, 255, 0.04)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          boxShadow: '0 4px 24px rgba(0, 0, 0, 0.05)',
        },
        '.glass-emerald-border': {
          backgroundColor: 'rgba(255, 255, 255, 0.04)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          backgroundImage:
            'linear-gradient(95.19deg, rgba(16, 185, 129, 0) 65.7%, rgba(20, 184, 166, 0.2) 86.63%, rgba(52, 211, 153, 0.3) 99.73%)',
          border: '1px solid transparent',
          backgroundOrigin: 'border-box',
          backgroundClip: 'padding-box, border-box',
          boxShadow: '0 4px 24px rgba(16, 185, 129, 0.1)',
        },
        '.glass-emerald-border-dark': {
          backgroundColor: 'rgba(0, 0, 0, 0.2)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          backgroundImage:
            'linear-gradient(95.19deg, rgba(16, 185, 129, 0) 65.7%, rgba(20, 184, 166, 0.2) 86.63%, rgba(52, 211, 153, 0.3) 99.73%)',
          border: '1px solid transparent',
          backgroundOrigin: 'border-box',
          backgroundClip: 'padding-box, border-box',
          boxShadow: '0 4px 24px rgba(16, 185, 129, 0.2)',
        },
        '.glass-teal-border': {
          backgroundColor: 'rgba(255, 255, 255, 0.04)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          backgroundImage:
            'linear-gradient(95.19deg, rgba(20, 184, 166, 0) 65.7%, rgba(16, 185, 129, 0.2) 86.63%, rgba(45, 212, 191, 0.3) 99.73%)',
          border: '1px solid transparent',
          backgroundOrigin: 'border-box',
          backgroundClip: 'padding-box, border-box',
          boxShadow: '0 4px 24px rgba(20, 184, 166, 0.1)',
        },
        '.glass-teal-border-dark': {
          backgroundColor: 'rgba(0, 0, 0, 0.2)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          backgroundImage:
            'linear-gradient(95.19deg, rgba(20, 184, 166, 0) 65.7%, rgba(16, 185, 129, 0.2) 86.63%, rgba(45, 212, 191, 0.3) 99.73%)',
          border: '1px solid transparent',
          backgroundOrigin: 'border-box',
          backgroundClip: 'padding-box, border-box',
          boxShadow: '0 4px 24px rgba(20, 184, 166, 0.2)',
        },
      })
    },
    // Plugin pour les line-clamp (si pas disponible dans votre version)
    function ({ addUtilities }) {
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
    // Plugin pour les états de hover personnalisés modernes
    function ({ addUtilities }) {
      addUtilities({
        '.hover-lift': {
          transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow:
              '0 10px 25px -5px rgba(0, 0, 0, 0.15), 0 10px 10px -5px rgba(0, 0, 0, 0.08)',
          },
        },
        '.hover-glow': {
          transition: 'box-shadow 0.2s ease-in-out',
          '&:hover': {
            boxShadow: '0 0 20px rgba(59, 130, 246, 0.3)',
          },
        },
        '.hover-glow-emerald': {
          transition: 'box-shadow 0.2s ease-in-out',
          '&:hover': {
            boxShadow: '0 0 20px rgba(16, 185, 129, 0.4)',
          },
        },
        '.hover-glow-teal': {
          transition: 'box-shadow 0.2s ease-in-out',
          '&:hover': {
            boxShadow: '0 0 20px rgba(20, 184, 166, 0.4)',
          },
        },
        '.hover-glow-emerald-light': {
          transition: 'box-shadow 0.2s ease-in-out',
          '&:hover': {
            boxShadow: '0 0 20px rgba(52, 211, 153, 0.4)',
          },
        },
        '.hover-glow-teal-light': {
          transition: 'box-shadow 0.2s ease-in-out',
          '&:hover': {
            boxShadow: '0 0 20px rgba(45, 212, 191, 0.4)',
          },
        },
        '.card-modern': {
          backgroundColor: 'rgba(255, 255, 255, 0.02)',
          border: '1px solid rgba(255, 255, 255, 0.05)',
          borderRadius: '12px',
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            backgroundColor: 'rgba(255, 255, 255, 0.04)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            transform: 'translateY(-1px)',
          },
        },
        '.card-modern-light': {
          backgroundColor: 'rgba(255, 255, 255, 0.8)',
          border: '1px solid rgba(0, 0, 0, 0.05)',
          borderRadius: '12px',
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            border: '1px solid rgba(0, 0, 0, 0.1)',
            transform: 'translateY(-1px)',
          },
        },
        '.glass-kombai-dark': {
          backgroundColor: 'rgba(0, 0, 0, 0.2)',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          borderRadius: '12px',
          boxShadow:
            '0 4px 20px rgba(255, 255, 255, 0.05), 0 1px 3px rgba(255, 255, 255, 0.1)',
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            backgroundColor: 'rgba(0, 0, 0, 0.3)',
            border: '1px solid rgba(255, 255, 255, 0.16)',
            boxShadow:
              '0 8px 32px rgba(255, 255, 255, 0.08), 0 2px 8px rgba(255, 255, 255, 0.12)',
            transform: 'translateY(-1px)',
          },
        },
      })
    },
  ],
  // Configuration pour le dark mode
  darkMode: 'class',
}
