/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/renderer/src/**/*.{js,ts,jsx,tsx}', './src/renderer/index.html'],
  theme: {
    extend: {
      colors: {
        wii: {
          bg: '#F8F8F8',
          surface: '#FFFFFF',
          accent: '#4EBCFF',
          'accent-dark': '#3AA0E0',
          border: '#E8E8E8',
          text: '#333333',
          muted: '#999999',
          green: '#4CD964',
          red: '#FF3B30',
          orange: '#FF9500',
        }
      },
      fontFamily: {
        sans: ['Nunito', '"Helvetica Neue"', 'Arial', 'sans-serif'],
        mono: ['"SF Mono"', '"Fira Code"', '"JetBrains Mono"', 'Menlo', 'monospace'],
      },
      borderRadius: {
        'wii': '12px',
        'wii-lg': '16px',
        'wii-xl': '20px',
      },
      boxShadow: {
        'wii': '0 2px 8px rgba(0,0,0,0.08)',
        'wii-hover': '0 4px 16px rgba(0,0,0,0.12)',
        'wii-active': '0 1px 4px rgba(0,0,0,0.06)',
      },
    }
  },
  plugins: []
}
