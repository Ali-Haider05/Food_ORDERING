/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        theme: {
          // Midnight Palette
          dark: '#0B0F19',           // Midnight canvas main background
          midnight: {
            DEFAULT: '#0B0F19',      // Deep Midnight Canvas
            canvas: '#0B0F19',
            card: '#131A2B',        // Midnight surface for cards & sidebar
            surface: '#182238',     // Midnight elevated surface
            input: '#0E1424',       // Midnight inputs
            border: '#232F48',
          },
          // Backwards-compatible aliases mapping to Midnight
          purple: {
            DEFAULT: '#131A2B',     // Cards & sidebar (Midnight)
            light: '#182238',       // Elevated surface
            dark: '#0E1424',        // Deep input/card base
            surface: '#182238',
          },
          // Action & Button color
          violet: {
            DEFAULT: '#8B5CF6',     // Lavender-violet action button
            hover: '#7C3AED',
            light: '#A78BFA',
            glow: '#C4B5FD',
          },
          // Pale Lavender Highlights & Icons
          lavender: {
            DEFAULT: '#DDD6FE',     // Elegant Pale Lavender
            pale: '#EDE9FE',
            accent: '#C4B5FD',
            subtle: '#E0D7FF',
            tint: 'rgba(221, 214, 254, 0.12)',
          },
          // 100% Crisp, Ultra-Readable Text
          white: {
            DEFAULT: '#FFFFFF',     // Pure razor-sharp white
            pure: '#FFFFFF',
            soft: '#F8FAFC',
            muted: '#CBD5E1',       // High-contrast clean slate
          }
        },
        cinema: {
          950: '#070A12',
          900: '#0B0F19',          // Deep Midnight
          850: '#131A2B',          // Midnight card
          800: '#182238',          // Elevated midnight
          750: '#0E1424',          // Input
          700: '#232F48',          // Clean border
        },
        pakistan: {
          green: '#115E59',        // Sophisticated emerald green
          accent: '#10B981',
          gold: '#F59E0B',
        }
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
        display: ['"Outfit"', '"Plus Jakarta Sans"', 'sans-serif'],
      },
      boxShadow: {
        // Subtle, elegant, non-glow professional shadows
        'midnight-card': '0 10px 30px -5px rgba(0, 0, 0, 0.7), 0 0 1px 1px rgba(221, 214, 254, 0.08)',
        'midnight-card-hover': '0 18px 38px -8px rgba(0, 0, 0, 0.85), 0 0 1px 1px rgba(221, 214, 254, 0.22)',
        'subtle-lavender': '0 2px 12px rgba(221, 214, 254, 0.12)',
        'violet-glow': '0 4px 16px -2px rgba(139, 92, 246, 0.3)', // Clean, restrained shadow (no blinding neon glow)
        'lavender-glow': '0 4px 14px -2px rgba(221, 214, 254, 0.2)',
        'purple-card': '0 10px 30px -5px rgba(0, 0, 0, 0.7), 0 0 1px 1px rgba(221, 214, 254, 0.08)',
        'purple-card-hover': '0 18px 38px -8px rgba(0, 0, 0, 0.85), 0 0 1px 1px rgba(221, 214, 254, 0.22)',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out forwards',
        'slide-up': 'slideUp 0.35s ease-out forwards',
        'scale-in': 'scaleIn 0.25s ease-out forwards',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(4px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.97)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      }
    },
  },
  plugins: [],
}
