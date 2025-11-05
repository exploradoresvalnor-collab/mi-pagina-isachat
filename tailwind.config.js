/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./productos.html",
    "./js/**/*.js",
    "./css/**/*.css"
  ],
  theme: {
    extend: {
      colors: {
        // Colores de IsaChat
        'isa-purple': {
          DEFAULT: '#7B2CBF',
          50: '#F5EFFF',
          100: '#E5D4FF',
          200: '#C9A3FF',
          300: '#AD72FF',
          400: '#9441FF',
          500: '#7B2CBF',
          600: '#6B26A8',
          700: '#5B2091',
          800: '#4B1A7A',
          900: '#3B1463',
        },
        'isa-pink': {
          DEFAULT: '#C77DFF',
          50: '#FDF5FF',
          100: '#F9E5FF',
          200: '#F0CCFF',
          300: '#E7B3FF',
          400: '#DE9AFF',
          500: '#C77DFF',
          600: '#B35CFF',
          700: '#9F3BFF',
          800: '#8B1AFF',
          900: '#7700F5',
        },
        'isa-light': '#F8F4FF',
        'isa-dark': '#2D1B4E',
      },
      fontFamily: {
        'poppins': ['Poppins', 'sans-serif'],
        'inter': ['Inter', 'sans-serif'],
      },
      boxShadow: {
        'isa': '0 10px 40px -10px rgba(123, 44, 191, 0.4)',
        'isa-lg': '0 20px 60px -15px rgba(123, 44, 191, 0.5)',
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'pulse-slow': 'pulse 4s ease-in-out infinite',
        'bounce-slow': 'bounce 3s ease-in-out infinite',
        'blob': 'blob 7s infinite',
        'fade-in': 'fadeIn 1s ease-out',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        blob: {
          '0%': {
            transform: 'translate(0px, 0px) scale(1)',
          },
          '33%': {
            transform: 'translate(30px, -50px) scale(1.1)',
          },
          '66%': {
            transform: 'translate(-20px, 20px) scale(0.9)',
          },
          '100%': {
            transform: 'translate(0px, 0px) scale(1)',
          },
        },
        fadeIn: {
          '0%': {
            opacity: '0',
            transform: 'translateY(20px)',
          },
          '100%': {
            opacity: '1',
            transform: 'translateY(0)',
          },
        },
      },
      spacing: {
        '128': '32rem',
        '144': '36rem',
      },
      borderRadius: {
        '4xl': '2rem',
      },
    },
  },
  plugins: [],
}
