/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        canvas: {
          DEFAULT: '#F7F6F1', // Warm off-white
          subtle: '#EFEFEA',
          muted: '#E6E5DE',
        },
        forest: {
          50: '#F0F7F4',
          100: '#DCEEE4',
          200: '#BCDEC9',
          300: '#93C8A7',
          400: '#64AC82',
          500: '#3F8F61',
          600: '#2D724C',
          700: '#23583C',
          800: '#1C4530',
          900: '#173928',
          950: '#0B2016',
        },
        accent: {
          blue: {
            bg: '#EFF6FF',
            border: '#BFDBFE',
            text: '#1E40AF',
          },
          amber: {
            bg: '#FFFBEB',
            border: '#FDE68A',
            text: '#92400E',
          },
          lavender: {
            bg: '#FAF5FF',
            border: '#E9D5FF',
            text: '#6B21A8',
          },
          green: {
            bg: '#F0FDF4',
            border: '#BBF7D0',
            text: '#166534',
          }
        }
      },
      fontFamily: {
        sans: [
          'Inter',
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'Roboto',
          'sans-serif',
        ],
      },
      boxShadow: {
        card: '0 1px 3px rgba(0, 0, 0, 0.05), 0 1px 2px rgba(0, 0, 0, 0.03)',
        hover: '0 4px 12px rgba(23, 57, 40, 0.06), 0 2px 4px rgba(23, 57, 40, 0.03)',
        modal: '0 10px 25px -5px rgba(23, 57, 40, 0.1), 0 8px 10px -6px rgba(23, 57, 40, 0.1)',
      }
    },
  },
  plugins: [],
}
