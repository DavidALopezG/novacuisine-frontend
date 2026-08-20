/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  // Prefijo para que las utilidades de Tailwind nunca choquen con las clases
  // internas de PrimeNG (p-*, .p-component, etc.)
  prefix: 'tw-',
  important: false,
  theme: {
    extend: {
      colors: {
        nova: {
          black: '#1a1a1a',
          gold: '#b8860b',
          'gold-light': '#d9a441',
          silver: '#cccccc',
          white: '#f6f5f7',
        },
      },
      fontFamily: {
        display: ['"Playfair Display"', 'serif'],
        body: ['Roboto', 'sans-serif'],
      },
      boxShadow: {
        card: '0 2px 10px rgba(26, 26, 26, 0.08)',
        'card-hover': '0 6px 18px rgba(26, 26, 26, 0.12)',
      },
      borderRadius: {
        card: '14px',
      },
    },
  },
  plugins: [],
  corePlugins: {
    preflight: false, // evita que Tailwind resetee estilos base que PrimeNG/estilos actuales ya definen
  },
};
