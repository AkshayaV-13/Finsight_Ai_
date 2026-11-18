/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        emerald: {
          dark: "#0B251D",
          primary: "#0F382C",
          light: "#164E3D",
          subtle: "#EAF2EF",
        },
        gold: {
          primary: "#D4AF37",
          muted: "#B8972E",
          subtle: "#FBF8EE",
        },
        ivory: {
          bg: "#F9F8F5",
          sidebar: "#F4F3EE",
        },
        charcoal: {
          dark: "#1A1F1D",
          body: "#333C37",
          muted: "#5E6963",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
    },
  },
  plugins: [],
};
