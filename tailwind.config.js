/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class', // Strict Light Mode only - .dark is never applied (NO dark mode components allowed)
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        canvas: "#F8FAF7", // Soft Off-White / Cream background
        card: "#FFFFFF",   // Pure White Elevated Cards
        primary: {
          DEFAULT: "#1B4D3E", // Deep Forest Green accent
          hover: "#153d31",
          subtle: "#EBF3EF",
        },
        secondary: {
          DEFAULT: "#2E7D5F", // Medium Forest Green
          hover: "#25674e",
          subtle: "#EDF6F2",
        },
        border: {
          DEFAULT: "#E5E9E4", // Light Grey Accent Border
          subtle: "#F0F3EF",
        },
        slateText: {
          main: "#1A201C",   // Dark Slate Charcoal
          muted: "#65736B",  // Soft Sage Grey
          light: "#8C9B92",
        },
        escrow: {
          DEFAULT: "#10B981", // Emerald Green
          subtle: "#ECFDF5",
        },
        alert: {
          DEFAULT: "#EF4444", // Muted Crimson
          subtle: "#FEF2F2",
        },
      },
      fontFamily: {
        sans: ["Inter", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "sans-serif"],
        mono: ["ui-monospace", "SFMono-Regular", "Menlo", "Monaco", "Consolas", "monospace"],
      },
      boxShadow: {
        soft: "0 2px 10px rgba(27, 77, 62, 0.04), 0 1px 3px rgba(0, 0, 0, 0.02)",
        card: "0 4px 20px -2px rgba(27, 77, 62, 0.05), 0 2px 6px -1px rgba(0, 0, 0, 0.02)",
        elevated: "0 10px 25px -5px rgba(27, 77, 62, 0.08), 0 8px 10px -6px rgba(0, 0, 0, 0.03)",
      },
    },
  },
  plugins: [],
};

