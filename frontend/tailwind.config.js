/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#080808",
        charcoal: "#111111",
        panel: "#111111",
        line: "rgba(255,255,255,0.10)",
        accent: {
          50: "#FFF4E8",
          100: "#FFE4C2",
          400: "#FF9B45",
          500: "#F97316",
          600: "#EA580C"
        }
      },
      boxShadow: {}
    }
  },
  plugins: []
};
