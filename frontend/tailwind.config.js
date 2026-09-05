/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        arcade: {
          dark: "#12111A",
          card: "#1E1C2B",
          yellow: "#FFD027",
          pink: "#FF3366",
          cyan: "#00F0FF",
          purple: "#9D4EDD",
          green: "#00FF66",
          orange: "#FF7B00",
          cream: "#FFF9E6",
          diner: "#FF4D4D",
          ticket: "#7928CA",
        }
      },
      boxShadow: {
        'retro': '4px 4px 0px #000000',
        'retro-lg': '6px 6px 0px #000000',
        'retro-xl': '8px 8px 0px #000000',
        'retro-sm': '2px 2px 0px #000000',
        'neon-yellow': '0 0 15px rgba(255, 208, 39, 0.5)',
        'neon-pink': '0 0 15px rgba(255, 51, 102, 0.5)',
        'neon-cyan': '0 0 15px rgba(0, 240, 255, 0.5)',
      },
      fontFamily: {
        arcade: ['"Press Start 2P"', 'monospace'],
        display: ['"Space Grotesk"', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
