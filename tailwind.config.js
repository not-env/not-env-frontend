/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'ivory': {
          DEFAULT: '#FEFCF8',
          'light': '#FFFFFF',
          'dark': '#FAF8F3',
        },
        'bone': {
          DEFAULT: '#FEFCF8',
          'light': '#FFFFFF',
          'dark': '#FAF8F3',
        },
        'soft-blue': {
          DEFAULT: '#5B8DB8',
          'hover': '#4A7BA5',
          'light': '#E8F0F7',
          'dark': '#3D6B94',
        },
      },
    },
  },
  plugins: [],
  darkMode: 'class',
}

