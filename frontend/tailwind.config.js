/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#0B0D12",
        charcoal: "#11141B",
        panel: "#171B23",
        line: "rgba(255,255,255,0.10)",
        accent: {
          50: "#FFF3EE",
          100: "#FFE1D6",
          200: "#FFC3AE",
          300: "#FFA17E",
          400: "#FF8A5B",
          500: "#E76F51",
          600: "#C7512E",
          700: "#A84425"
        }
      },
      boxShadow: {
        premium: "0 20px 60px rgba(0,0,0,0.32)",
        glow: "0 0 36px rgba(231,111,81,0.16)"
      }
    }
  },
  plugins: []
};
