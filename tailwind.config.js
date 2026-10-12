/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Dark theme palette
        bg: {
          primary: '#0a0a0f',
          secondary: '#12121a',
          card: '#1a1a27',
          elevated: '#22223a',
        },
        accent: {
          green: '#22c55e',
          blue: '#3b82f6',
          purple: '#a855f7',
          orange: '#f97316',
          red: '#ef4444',
          yellow: '#eab308',
          cyan: '#06b6d4',
        },
        text: {
          primary: '#f0f0f5',
          secondary: '#8888aa',
          muted: '#555570',
        },
        border: {
          DEFAULT: '#2a2a40',
          light: '#3a3a55',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'glow-green': 'radial-gradient(circle at center, rgba(34,197,94,0.15) 0%, transparent 70%)',
        'glow-blue': 'radial-gradient(circle at center, rgba(59,130,246,0.15) 0%, transparent 70%)',
        'glow-purple': 'radial-gradient(circle at center, rgba(168,85,247,0.15) 0%, transparent 70%)',
      },
      animation: {
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'slide-up': 'slide-up 0.3s ease-out',
        'fade-in': 'fade-in 0.2s ease-out',
        'scale-up': 'scale-up 0.2s ease-out',
        'shimmer': 'shimmer 2s linear infinite',
        'level-up': 'level-up 0.6s ease-out',
      },
      keyframes: {
        'pulse-glow': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.6' },
        },
        'slide-up': {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'scale-up': {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        'shimmer': {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'level-up': {
          '0%': { transform: 'scale(1)', opacity: '1' },
          '50%': { transform: 'scale(1.2)', opacity: '0.8' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
      boxShadow: {
        'glow-green': '0 0 20px rgba(34,197,94,0.3)',
        'glow-blue': '0 0 20px rgba(59,130,246,0.3)',
        'glow-purple': '0 0 20px rgba(168,85,247,0.3)',
        'glow-orange': '0 0 20px rgba(249,115,22,0.3)',
        'card': '0 4px 24px rgba(0,0,0,0.4)',
        'card-hover': '0 8px 32px rgba(0,0,0,0.6)',
      },
    },
  },
  plugins: [],
}
