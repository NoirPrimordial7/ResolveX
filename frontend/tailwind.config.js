/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#0B0B0A",
        charcoal: "#0D0D0D",
        panel: "#171717",
        elevated: "#202020",
        line: "rgba(255,255,255,0.12)",
        accent: {
          50: "#FFF2EE",
          100: "#FFE0D6",
          200: "#FFBEAA",
          300: "#FF9678",
          400: "#FF714B",
          500: "#FF4B24",
          600: "#D93618",
          700: "#A92812"
        }
      },
      boxShadow: {
        premium: "0 20px 70px rgba(0,0,0,0.42)",
        glow: "0 0 0 1px rgba(255,75,36,0.26), 0 18px 44px rgba(255,75,36,0.12)"
      }
    }
  },
  plugins: []
};
