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
        // ─── Approved Brand Palette ───────────────────────────────────────
        'brand-navy':      '#163B73',
        'brand-navy-dark': '#102D59',

        'brand-cyan':      '#1FA7D8',
        'brand-sky':       '#DCEFF6',

        'brand-green':     '#4F7F32',
        'brand-leaf':      '#72A83A',
        'brand-sage':      '#DDE8D2',
        'brand-sage-section': '#D1DFC4',
        'section-sage':    '#D1DFC4',

        'brand-cream':      '#F7F5EA',
        'brand-warm-white': '#FCFBF6',

        // ─── Text Colors ──────────────────────────────────────────────────
        'text-primary':    '#253129',
        'text-secondary':  '#66706A',
        'text-dark':       '#253129',
        'text-muted':      '#66706A',

        // ─── Borders & Surfaces ───────────────────────────────────────────
        'border-soft':     '#DDE3DA',
        'warm-white':      '#FCFBF6',
        'surface':         '#FCFBF6',
        'surface-warm':    '#F7F5EA',
        'surface-soft':    '#DDE8D2',

        // ─── Youth Accent Colors ──────────────────────────────────────────
        'accent-orange':   '#F39A22',
        'accent-lime':     '#82BD32',
        'accent-pink':     '#E83E78',
        'accent-purple':   '#8053A6',
        'accent-blue':     '#1C92C8',
        'accent-teal':     '#29A98B',

        // ─── Backward-Compatibility Aliases ───────────────────────────────
        'green-900':       '#163B73', // Navy anchor
        'green-800':       '#102D59', // Dark Navy
        'green-700':       '#4F7F32', // Environmental Green
        'green-600':       '#72A83A', // Leaf Green
        'green-400':       '#82BD32', // Lime / Accent
        'green-300':       '#DDE8D2', // Sage
        'green-200':       '#DCEFF6', // Sky
        'green-100':       '#F7F5EA', // Cream
        'forest':          '#163B73',
        'forest-dark':     '#102D59',
        'moss':            '#4F7F32',
        'olive':           '#72A83A',
        'leaf':            '#72A83A',
        'sage':            '#DDE8D2',
        'soft-sage':       '#DDE8D2',
        'pale-sage':       '#DCEFF6',
        'light-sage':      '#F7F5EA',
        'trust-blue':      '#163B73',
        'river-blue':      '#1FA7D8',
        'fresh-cyan':      '#1FA7D8',
        'soft-sky':        '#DCEFF6',
        'clean-white':     '#FCFBF6',
        'ink':             '#253129',
        'ink-muted':       '#66706A',
        'ink-subtle':      '#72A83A',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Inter', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        'xs':   ['0.75rem',  { lineHeight: '1.5' }],
        'sm':   ['0.875rem', { lineHeight: '1.6' }],
        'base': ['1rem',     { lineHeight: '1.7' }],
        'lg':   ['1.125rem', { lineHeight: '1.7' }],
        'xl':   ['1.25rem',  { lineHeight: '1.6' }],
        '2xl':  ['1.5rem',   { lineHeight: '1.4' }],
        '3xl':  ['1.875rem', { lineHeight: '1.3' }],
        '4xl':  ['2.25rem',  { lineHeight: '1.2' }],
        '5xl':  ['3rem',     { lineHeight: '1.1' }],
        '6xl':  ['3.75rem',  { lineHeight: '1.05' }],
        '7xl':  ['4.5rem',   { lineHeight: '1.0' }],
      },
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
        '26': '6.5rem',
        '30': '7.5rem',
        '34': '8.5rem',
      },
      maxWidth: {
        'container': '1280px',
        'prose-lg':  '72ch',
      },
      borderRadius: {
        'xl':  '0.75rem',
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
      boxShadow: {
        'card':       '0 1px 3px 0 rgba(22, 59, 115, 0.04), 0 4px 16px 0 rgba(22, 59, 115, 0.05)',
        'card-hover': '0 4px 6px -1px rgba(22, 59, 115, 0.07), 0 12px 32px -4px rgba(22, 59, 115, 0.10)',
        'nav':        '0 1px 0 0 rgba(22, 59, 115, 0.06), 0 4px 12px -2px rgba(22, 59, 115, 0.03)',
        'xs':         '0 1px 2px 0 rgba(16, 45, 89, 0.05)',
        '2xs':        '0 1px 2px 0 rgba(16, 45, 89, 0.03)',
      },

      backgroundImage: {
        'gradient-hero':   'linear-gradient(135deg, #FCFBF6 0%, #F7F5EA 100%)',
        'gradient-cta':    'linear-gradient(135deg, #163B73 0%, #102D59 100%)',
        'gradient-navy':   'linear-gradient(135deg, #163B73 0%, #102D59 100%)',
        'gradient-green':  'linear-gradient(135deg, #4F7F32 0%, #3d6326 100%)',
        'gradient-sage':   'linear-gradient(135deg, #DDE8D2 0%, #FCFBF6 100%)',
        'gradient-card':   'linear-gradient(180deg, transparent 50%, rgba(22,59,115,0.85) 100%)',
      },
      animation: {
        'fade-up':   'fadeUp 0.5s ease-out both',
        'fade-in':   'fadeIn 0.4s ease-out both',
        'slide-in':  'slideIn 0.4s ease-out both',
      },
      keyframes: {
        fadeUp: {
          '0%':   { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideIn: {
          '0%':   { opacity: '0', transform: 'translateX(-16px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
      },
    },
  },
  plugins: [],
}

export default config
