import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
    './types/**/*.{js,ts,jsx,tsx,mdx}',
    './data/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          primary: '#0a0b0e',
          secondary: '#0f1117',
          card: 'rgba(18,20,28,0.95)',
          elevated: 'rgba(25,27,38,0.98)',
        },
        accent: {
          orange: '#f5a623',
          blue: '#4a9eff',
          aurora: '#00ff88',
          purple: '#8b5cf6',
          teal: '#06b6d4',
          red: '#ef4444',
          green: '#10b981',
        },
      },
      backgroundImage: {
        'aurora-gradient': 'linear-gradient(135deg, #0a0b0e 0%, #0d1a0f 50%, #0a0b1a 100%)',
        'sun-gradient': 'linear-gradient(90deg, #1a0a00 0%, #7c3300 20%, #f5a623 50%, #7c3300 80%, #1a0a00 100%)',
        'kp-scale': 'linear-gradient(90deg, #3b82f6 0%, #10b981 30%, #f59e0b 60%, #ef4444 100%)',
      },
      boxShadow: {
        card: '0 4px 24px rgba(0,0,0,0.4)',
        glow: '0 0 20px rgba(245,166,35,0.3)',
        'glow-aurora': '0 0 20px rgba(0,255,136,0.3)',
      },
      animation: {
        'pulse-slow': 'pulse 3s ease-in-out infinite',
        'slide-up': 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        'fade-in': 'fadeIn 0.2s ease-out',
      },
      keyframes: {
        slideUp: {
          '0%': { transform: 'translateY(100%)' },
          '100%': { transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}

export default config
