/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        tamura: {
          red: '#D80000',    // Um vermelho sangue/corrida forte
          black: '#0a0a0a',  // Um preto quase absoluto (muito elegante)
          white: '#ffffff',  // Branco puro
        }
      },
      fontFamily: {
        // Opção extra: Se quiser mudar a fonte depois, mexemos aqui
      }
    },
  },
  plugins: [],
}