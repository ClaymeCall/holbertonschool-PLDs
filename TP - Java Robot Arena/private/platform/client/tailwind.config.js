/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        slag: {
          950: "#0b0d10",
          900: "#12151a",
          800: "#1a1f27",
          700: "#242b36",
          600: "#2f3846",
          500: "#3d4757",
        },
        ember: {
          400: "#fb923c",
          500: "#f97316",
          600: "#ea580c",
          700: "#c2410c",
        },
        signal: {
          green: "#22c55e",
          amber: "#f59e0b",
          red: "#ef4444",
          cyan: "#22d3ee",
        },
      },
      fontFamily: {
        display: ['"Rajdhani"', "system-ui", "sans-serif"],
        mono: ['"IBM Plex Mono"', "ui-monospace", "monospace"],
        body: ['"IBM Plex Sans"', "system-ui", "sans-serif"],
      },
      boxShadow: {
        panel: "inset 0 1px 0 rgba(255,255,255,0.04), 0 8px 24px rgba(0,0,0,0.45)",
        glow: "0 0 24px rgba(249, 115, 22, 0.25)",
      },
      backgroundImage: {
        "metal-grid":
          "linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)",
        "hatch":
          "repeating-linear-gradient(-45deg, rgba(255,255,255,0.015) 0 2px, transparent 2px 6px)",
      },
    },
  },
  plugins: [],
};
