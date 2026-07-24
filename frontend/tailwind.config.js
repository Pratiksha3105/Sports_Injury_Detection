/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Deep navy base — "night training session" backdrop
        midnight: {
          950: '#060B18',
          900: '#0B1120',
          800: '#121B31',
          700: '#1B2743',
        },
        // Primary accent — motion-capture teal
        pulse: {
          400: '#2DD4BF',
          500: '#14B8A6',
          600: '#0D9488',
        },
        // Secondary accent — injury-risk coral
        alert: {
          400: '#FB7185',
          500: '#F43F5E',
        },
        // Tertiary accent — AI/analytics violet
        neural: {
          400: '#A5B4FC',
          500: '#818CF8',
          600: '#6366F1',
        },
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'sans-serif'],
        body: ['"Inter"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      backgroundImage: {
        'grid-pattern':
          'linear-gradient(rgba(45,212,191,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(45,212,191,0.06) 1px, transparent 1px)',
        'hero-gradient':
          'radial-gradient(circle at 20% 20%, rgba(129,140,248,0.25), transparent 45%), radial-gradient(circle at 80% 30%, rgba(45,212,191,0.25), transparent 45%), radial-gradient(circle at 50% 90%, rgba(244,63,94,0.15), transparent 45%)',
      },
      boxShadow: {
        glass: '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
        glow: '0 0 40px rgba(45, 212, 191, 0.25)',
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        float: 'float 6s ease-in-out infinite',
        'spin-slow': 'spin 12s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-16px)' },
        },
      },
    },
  },
  plugins: [],
}
