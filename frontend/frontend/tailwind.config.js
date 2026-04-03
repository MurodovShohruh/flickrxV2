export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        neon: {
          pink: '#ff2d78',
          cyan: '#00f5ff',
          purple: '#bf00ff',
          orange: '#ff6b00',
        },
        dark: {
          DEFAULT: '#060608',
          card: '#0d0d12',
          border: '#1a1a24',
          hover: '#141420',
        }
      },
      fontFamily: {
        display: ['"Bebas Neue"', 'cursive'],
        body: ['"DM Sans"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      backgroundImage: {
        'neon-gradient': 'linear-gradient(135deg, #ff2d78, #bf00ff, #00f5ff)',
        'neon-gradient-2': 'linear-gradient(135deg, #ff6b00, #ff2d78, #bf00ff)',
        'card-gradient': 'linear-gradient(135deg, rgba(255,45,120,0.05), rgba(191,0,255,0.05))',
      },
      boxShadow: {
        'neon-pink': '0 0 20px rgba(255,45,120,0.5), 0 0 60px rgba(255,45,120,0.2)',
        'neon-cyan': '0 0 20px rgba(0,245,255,0.5), 0 0 60px rgba(0,245,255,0.2)',
        'neon-purple': '0 0 20px rgba(191,0,255,0.5), 0 0 60px rgba(191,0,255,0.2)',
        'neon-sm': '0 0 10px rgba(255,45,120,0.4)',
      },
      animation: {
        'pulse-neon': 'pulseNeon 2s ease-in-out infinite',
        'float': 'float 3s ease-in-out infinite',
        'scan': 'scan 3s linear infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        pulseNeon: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.6' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        scan: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100vh)' },
        },
        glow: {
          '0%': { textShadow: '0 0 10px #ff2d78, 0 0 20px #ff2d78' },
          '100%': { textShadow: '0 0 20px #bf00ff, 0 0 40px #bf00ff, 0 0 60px #00f5ff' },
        }
      }
    }
  },
  plugins: [],
}
