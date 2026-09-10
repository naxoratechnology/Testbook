export default {content: [
  './index.html',
  './src/**/*.{js,ts,jsx,tsx}'
],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      colors: {
        brand: {
          50: '#EFF8FF',
          100: '#DFF1FF',
          200: '#B9E3FF',
          300: '#7CCBFF',
          400: '#28A9F5',
          500: '#0787D8',
          600: '#0067B8',
          700: '#00539A',
          800: '#06457D',
          900: '#083A68',
        },
        ink: {
          DEFAULT: '#0F172A',
          soft: '#475569',
          muted: '#94A3B8',
        },
        line: '#E7EAF0',
        canvas: '#F7F8FC',
      },
      borderRadius: {
        xl: '0.875rem',
        '2xl': '1.125rem',
        '3xl': '1.5rem',
      },
      boxShadow: {
        soft: '0 1px 2px 0 rgba(15,23,42,0.04), 0 8px 24px -12px rgba(15,23,42,0.10)',
        lift: '0 2px 4px 0 rgba(15,23,42,0.04), 0 18px 40px -18px rgba(15,23,42,0.18)',
      },
      transitionTimingFunction: {
        smooth: 'cubic-bezier(0.23, 1, 0.32, 1)',
      },
    },
  },
}
