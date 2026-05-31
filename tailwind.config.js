/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          950: '#03050F',
          900: '#060C1A',
          800: '#0B1225',
          700: '#111d42',
        },
        electric: {
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
        },
        neon: {
          purple: '#a855f7',
          blue: '#3b82f6',
          green: '#4ade80',
          pink: '#f472b6',
          teal: '#2dd4bf',
        },
        cosmic: { green: '#4ade80', teal: '#2dd4bf' },
        solar: { orange: '#fb923c', yellow: '#facc15' },
      },
      fontFamily: {
        display: ['Orbitron', 'sans-serif'],
        body: ['Nunito', 'sans-serif'],
        mono: ['Space Mono', 'monospace'],
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'twinkle': 'twinkle 3s ease-in-out infinite',
        'aurora': 'aurora 8s ease-in-out infinite',
        'spin-slow': 'spin-slow 25s linear infinite',
        'pulse-glow': 'pulseGlow 2.5s ease-in-out infinite',
        'bounce-gentle': 'bounce-gentle 3s ease-in-out infinite',
        'glow-pulse': 'glow-pulse 2s ease-in-out infinite',
        'slide-up': 'slideUpFade 0.7s ease-out forwards',
      },
      keyframes: {
        float: {
          '0%,100%': { transform: 'translateY(0px) rotate(0deg)' },
          '33%': { transform: 'translateY(-18px) rotate(2deg)' },
          '66%': { transform: 'translateY(-8px) rotate(-2deg)' },
        },
        twinkle: {
          '0%,100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.15', transform: 'scale(0.8)' },
        },
        aurora: {
          '0%,100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        pulseGlow: {
          '0%,100%': { boxShadow: '0 0 20px rgba(56,189,248,0.5), 0 0 40px rgba(168,85,247,0.2)' },
          '50%': { boxShadow: '0 0 60px rgba(56,189,248,1), 0 0 120px rgba(168,85,247,0.5), 0 0 200px rgba(56,189,248,0.3)' },
        },
        'bounce-gentle': {
          '0%,100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        'glow-pulse': {
          '0%,100%': { opacity: '0.6' },
          '50%': { opacity: '1' },
        },
        slideUpFade: {
          from: { opacity: '0', transform: 'translateY(30px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'spin-slow': {
          from: { transform: 'rotate(0deg)' },
          to: { transform: 'rotate(360deg)' },
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'space-gradient': 'linear-gradient(135deg, #03050F 0%, #060C1A 50%, #0B1225 100%)',
      },
      transitionDuration: {
        '400': '400ms',
      },
    },
  },
  plugins: [],
}
