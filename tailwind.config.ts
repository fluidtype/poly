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
        surface: "var(--surface)",
        surface2: "var(--surface-2)",
        primary: "var(--primary)",
        primary600: "var(--primary-600)",
        accent: "var(--accent)",
        success: "var(--success)",
        text: "var(--text)",
        muted: "var(--muted)",
        border: "var(--border)",
      },
      fontFamily: {
        sans: ["Poppins", "sans-serif"],
      },
      boxShadow: {
        soft: "0 30px 60px -30px rgba(9, 11, 17, 0.55)",
      },
      backgroundImage: {
        "surface-gradient":
          "linear-gradient(135deg, rgba(22,24,28,0.95) 0%, rgba(27,30,36,0.85) 100%)",
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
        ".card": {
          "@apply rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-[0_8px_30px_rgba(0,0,0,0.25)] p-4": {},
        },
        ".surface-pill": {
          "@apply bg-gradient-to-b from-[var(--surface-2)] to-[var(--surface)] ring-inset ring-1 ring-white/5 shadow-md": {},
        },
      });
    }),
  ],
};

export default config;
