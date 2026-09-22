/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#fbf9f3',
          100: '#f5efe1',
          200: '#ebdcc2',
          300: '#dec29a',
          400: '#cea270',
          500: '#ba854d',
          600: '#9e6d3a',
          700: '#805330',
          800: '#68432b',
          900: '#553725',
          gold: '#9e7938',
          'gold-light': '#b58c42',
          'gold-subtle': '#fdf8ee',
        },
        surface: {
          50: '#faf9f6',
          100: '#f5f4ef',
          200: '#e8e6e0',
          300: '#dcd9cf',
        }
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
        sans: ['"Plus Jakarta Sans"', 'Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      },
      boxShadow: {
        'subtle': '0 1px 3px 0 rgba(0, 0, 0, 0.04), 0 1px 2px -1px rgba(0, 0, 0, 0.04)',
        'premium': '0 4px 20px -2px rgba(28, 25, 23, 0.05), 0 2px 6px -1px rgba(28, 25, 23, 0.03)',
        'float': '0 10px 30px -4px rgba(28, 25, 23, 0.08), 0 4px 10px -2px rgba(28, 25, 23, 0.04)',
      }
    },
  },
  plugins: [],
}
