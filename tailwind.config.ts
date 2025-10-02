import type { Config } from "tailwindcss";
import animate from "tailwindcss-animate";
import plugin from "tailwindcss/plugin";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/app/**/*.{ts,tsx,mdx}",
    "./src/components/**/*.{ts,tsx,mdx}",
    "./src/features/**/*.{ts,tsx,mdx}",
    "./src/lib/**/*.{ts,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: "rgb(var(--brand) / <alpha-value>)",
        tertiary: "rgb(var(--tertiary) / <alpha-value>)",
        frame: "rgb(var(--frame) / <alpha-value>)",
        bg: "rgb(var(--bg) / <alpha-value>)",
        surface: "rgb(var(--surface) / <alpha-value>)",
        surface2: "rgb(var(--surface2) / <alpha-value>)",
        surface3: "rgb(var(--surface3) / <alpha-value>)",
        borderc: "rgb(var(--borderc) / <alpha-value>)",
        text: "rgb(var(--text) / <alpha-value>)",
        muted: "rgb(var(--muted) / <alpha-value>)",
        panel: "rgb(var(--surface) / <alpha-value>)",
        card: "rgb(var(--surface2) / <alpha-value>)",
        fg: "rgb(var(--text) / <alpha-value>)",
        border: "rgb(var(--borderc) / <alpha-value>)",
        accent: "rgb(var(--brand) / <alpha-value>)",
        "accent-light": "rgb(var(--accent-light) / <alpha-value>)",
        "accent-dark": "rgb(var(--accent-dark) / <alpha-value>)",
        violet: "rgb(var(--tertiary) / <alpha-value>)",
        "violet-light": "rgb(var(--violet-light) / <alpha-value>)",
        "violet-dark": "rgb(var(--violet-dark) / <alpha-value>)",
        primary: "rgb(var(--primary) / <alpha-value>)",
        "primary-600": "rgb(var(--primary-600) / <alpha-value>)",
      },
      fontFamily: {
        sans: ["Poppins", "sans-serif"],
      },
      boxShadow: {
        elev: "0 10px 30px rgba(0,0,0,.35)",
        soft: "0 6px 18px rgba(0,0,0,.25)",
        ring: "inset 0 1px 0 rgba(255,255,255,.06), 0 10px 30px rgba(0,0,0,.35)",
        glow: "0 20px 60px rgba(0,0,0,0.35)",
      },
      borderRadius: { xl2: "1.25rem" },
      backgroundImage: {
        "glow-red": "var(--grad-red)",
        "glow-violet": "var(--grad-violet)",
      },
    },
  },
  plugins: [
    animate,
    plugin(({ addUtilities }) => {
      addUtilities({
        ".h1": {
          "@apply text-2xl md:text-3xl font-semibold tracking-tight": {},
        },
      });
    }),
  ],
};

export default config;
