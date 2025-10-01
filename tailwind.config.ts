import type { Config } from "tailwindcss";
import animate from "tailwindcss-animate";

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
        "surface-2": "var(--surface-2)",
        primary: "var(--primary)",
        "primary-600": "var(--primary-600)",
        accent: "var(--accent)",
        success: "var(--success)",
        text: "var(--text)",
        muted: "var(--muted)",
        border: "var(--border)",
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
  plugins: [animate],
};

export default config;
