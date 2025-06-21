/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',  // Enable dark mode with class strategy
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        whatsLight: {
          bg: '#ffffff',           // Light mode background
          primary: '#075e54',      // WhatsApp green
          secondary: '#25d366',    // WhatsApp light green
          text: '#000000',         // Black text
        },
        whatsDark: {
          bg: '#121b22',           // WhatsApp dark bg
          primary: '#075e54',      // WhatsApp green stays same
          secondary: '#25d366',    // WhatsApp light green stays same
          text: '#e9edef',         // Light text
        }
      }
    },
  },
  plugins: [],
}
