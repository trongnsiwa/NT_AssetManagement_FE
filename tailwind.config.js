const defaultTheme = require('tailwindcss/defaultTheme');

let containerScreens = Object.assign({}, defaultTheme.screens);

// Delete the 2xl breakpoint from the object
delete containerScreens['2xl'];

module.exports = {
  mode: 'jit',
  purge: ['./src/**/*.{js,jsx,ts,tsx}', './public/index.html'],
  darkMode: false, // or 'media' or 'class'
  theme: {
    extend: {
      colors: {
        org: {
          light: '#E30C18',
          DEFAULT: '#CF2338',
          dark: '#ad1d2e',
        },
        link: '#80C3F0',
      },
    },
    container: (theme) => ({
      center: true,
      padding: '1rem',
      screens: containerScreens,
    }),
    fontSize: {
      xs: '.75rem',
      sm: '.8rem',
      tiny: '.875rem',
      base: '1rem',
      lg: '1.1rem',
      xl: '1.15rem',
      '2xl': '1.5rem',
      '3xl': '1.875rem',
      '4xl': '2.25rem',
      '5xl': '3rem',
      '6xl': '4rem',
      '7xl': '5rem',
    },
  },
  variants: {
    extend: {
      backgroundColor: ['active'],
      tableLayout: ['hover', 'focus'],
    },
  },
  plugins: [require('@tailwindcss/forms')],
};
