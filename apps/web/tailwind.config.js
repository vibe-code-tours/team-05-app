/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#e11d48",
          hover: "#be123c",
          light: "#fff1f2",
        },
        success: "oklch(0.7 0.19 160)",
        warning: "oklch(0.78 0.16 55)",
        muted: {
          DEFAULT: "oklch(0.97 0.004 240)",
          foreground: "oklch(0.55 0.02 240)",
        },
        border: "oklch(0.92 0.006 240)",
        ring: "#e11d48",
      },
      fontFamily: {
        sans: ["Inter", "Outfit", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "ui-monospace", "monospace"],
      },
      borderRadius: {
        "2xl": "16px",
      },
    },
  },
  plugins: [],
};
