/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        display: ['Syne', 'sans-serif'],
        body: ['DM Sans', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        brand: {
          50: '#f0fdf4',
          100: '#dcfce7',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          900: '#14532d',
        },
        surface: {
          900: '#0a0f0d',
          800: '#111a14',
          700: '#1a2b1f',
          600: '#243326',
          500: '#2d3e30',
        },
        accent: {
          gold: '#f59e0b',
          blue: '#3b82f6',
          purple: '#8b5cf6',
          red: '#ef4444',
          teal: '#14b8a6',
        },
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'pulse-slow': 'pulse 3s ease-in-out infinite',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: { from: { opacity: 0 }, to: { opacity: 1 } },
        slideUp: { from: { opacity: 0, transform: 'translateY(20px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
        float: { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-10px)' } },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'mesh': 'radial-gradient(at 40% 20%, hsla(140,80%,20%,0.3) 0px, transparent 50%), radial-gradient(at 80% 0%, hsla(160,60%,15%,0.2) 0px, transparent 50%), radial-gradient(at 0% 50%, hsla(120,70%,10%,0.3) 0px, transparent 50%)',
      },
    },
  },
  plugins: [],
}
