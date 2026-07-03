/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg:      "#0B0F1A",
        surface: "#131929",
        card:    "#1A2235",
        border:  "#242E42",
        amber:   "#F59E0B",
        danger:  "#EF4444",
        success: "#10B981",
        info:    "#3B82F6",
        muted:   "#64748B",
        subtle:  "#94A3B8",
      },
      fontFamily: {
        grotesk: ["'Space Grotesk'", "Inter", "system-ui", "sans-serif"],
      },
      animation: {
        blink:  "blink 1s infinite",
        pulse2: "pulse2 2s infinite",
      },
      keyframes: {
        blink:  { "0%,100%": { opacity: "1" }, "50%": { opacity: "0" } },
        pulse2: { "0%,100%": { opacity: "1" }, "50%": { opacity: "0.5" } },
      },
    },
  },
  plugins: [],
};