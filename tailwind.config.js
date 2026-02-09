/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}"
  ],

  darkMode: "class",

  theme: {
    extend: {
      fontFamily: {
        sans: ["Plus Jakarta Sans", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"]
      },

      colors: {
        vault: {
          950: "#050609",
          900: "#0a0c12",
          800: "#11141d",
          700: "#1c2230",
          accent: "#6366f1",
          secondary: "#10b981",
          gold: "#f59e0b"
        }
      },

      animation: {
        float: "float 6s ease-in-out infinite",
        "pulse-slow": "pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        reveal: "reveal 0.5s cubic-bezier(0.16, 1, 0.3, 1)"
      },

      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" }
        },
        reveal: {
          "0%": {
            opacity: "0",
            transform: "translateY(20px) scale(0.95)"
          },
          "100%": {
            opacity: "1",
            transform: "translateY(0) scale(1)"
          }
        }
      }
    }
  },

  plugins: []
};
