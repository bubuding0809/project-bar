import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#020617", // Slate 950 (OLED Dark Mode)
        foreground: "#f8fafc",
        surface: "#0F172A", // Slate 900
        primary: "#E11D48", // From spec
        secondary: "#FB7185", // From spec
        cta: "#2563EB", // From spec
        neon: {
          violet: "#8B5CF6", // Violet 500
          rose: "#F43F5E", // Rose 500
          emerald: "#10B981", // Emerald 500
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "sans-serif"],
        display: ["var(--font-fredoka)", "sans-serif"],
      },
      boxShadow: {
        'neon-violet': '0 0 10px #8B5CF6, 0 0 20px #8B5CF6',
        'neon-rose': '0 0 10px #F43F5E, 0 0 20px #F43F5E',
        'neon-emerald': '0 0 10px #10B981, 0 0 20px #10B981',
      }
    },
  },
  plugins: [],
};

export default config;
