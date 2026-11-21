import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Sky blue — primary brand color
        primary: {
          50:  '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
          950: '#082f49',
        },
        // Purple — accent / gradient end
        secondary: {
          50:  '#faf5ff',
          100: '#f3e8ff',
          200: '#e9d5ff',
          300: '#d8b4fe',
          400: '#c084fc',
          500: '#a855f7',
          600: '#9333ea',
          700: '#7e22ce',
          800: '#6b21a8',
          900: '#581c87',
          950: '#3b0764',
        },
        // Night surface system — charcoal depths
        night: {
          50:  '#EDEEF3',
          100: '#D2D4DE',
          200: '#A5A9BC',
          300: '#787E9B',
          400: '#565C7A',
          500: '#373C59',
          600: '#252837',
          700: '#1A1D28',
          800: '#13151D',
          900: '#0C0D11',
          950: '#070810',
        },
      },
      fontFamily: {
        sans:    ['Inter', 'system-ui', 'sans-serif'],
        display: ['Outfit', 'system-ui', 'sans-serif'],
        mono:    ['"JetBrains Mono"', 'Consolas', 'monospace'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':  'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'dot-grid':        'radial-gradient(circle, #252837 1px, transparent 1px)',
        'scanline':        'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(14,165,233,0.015) 2px, rgba(14,165,233,0.015) 4px)',
      },
      backgroundSize: {
        'dot-24': '24px 24px',
      },
      animation: {
        'fade-in':    'fadeIn 0.4s ease-out',
        'slide-up':   'slideUp 0.4s ease-out',
        'slide-right':'slideRight 0.3s ease-out',
        'flicker':    'flicker 0.1s ease-in-out',
        'pulse-sky':  'pulseSky 2s ease-in-out infinite',
        'scan':       'scan 3s linear infinite',
      },
      keyframes: {
        fadeIn: {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%':   { transform: 'translateY(12px)', opacity: '0' },
          '100%': { transform: 'translateY(0)',     opacity: '1' },
        },
        slideRight: {
          '0%':   { transform: 'translateX(-8px)', opacity: '0' },
          '100%': { transform: 'translateX(0)',     opacity: '1' },
        },
        flicker: {
          '0%, 100%': { opacity: '1' },
          '50%':      { opacity: '0.85' },
        },
        pulseSky: {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(14, 165, 233, 0)' },
          '50%':      { boxShadow: '0 0 0 4px rgba(14, 165, 233, 0.15)' },
        },
        scan: {
          '0%':   { backgroundPosition: '0 0' },
          '100%': { backgroundPosition: '0 100%' },
        },
      },
      boxShadow: {
        'sky-glow': '0 0 20px rgba(14, 165, 233, 0.18), 0 0 40px rgba(14, 165, 233, 0.08)',
        'sky-sm':   '0 0 8px rgba(14, 165, 233, 0.22)',
        'purple-glow': '0 0 20px rgba(168, 85, 247, 0.12)',
        'inner-top': 'inset 0 1px 0 0 rgba(255,255,255,0.06)',
      },
      letterSpacing: {
        'widest-xl':  '0.25em',
        'widest-2xl': '0.35em',
      },
    },
  },
  plugins: [],
}

export default config
