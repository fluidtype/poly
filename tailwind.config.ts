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
        bg: "var(--bg)",
        panel: "var(--panel)",
        card: "var(--card)",
        fg: "var(--fg)",
        muted: "var(--muted)",
        border: "var(--border)",
        accent: "var(--accent)",
        "accent-light": "var(--accent-light)",
        "accent-dark": "var(--accent-dark)",
        violet: "var(--violet)",
        "violet-light": "var(--violet-light)",
        "violet-dark": "var(--violet-dark)",
      },
      fontFamily: {
        sans: ["Poppins", "sans-serif"],
      },
      boxShadow: {
        glow: "0 20px 60px rgba(0,0,0,0.35)",
      },
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
