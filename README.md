# Poly UI Starter

A Next.js 14 App Router starter configured with Tailwind CSS, shadcn/ui, and a modern dark design system.

## Features

- ✅ Next.js 14 with the `app/` router organized under `src/`
- 🎨 Tailwind CSS with CSS variables for background, surface, and accent tokens
- 🧱 shadcn/ui configuration plus utility helpers (`components.json`, `cn`)
- 🧰 Installed libraries: lucide-react, framer-motion, Recharts, @tanstack/react-query, Zustand
- 📦 Preconfigured layout with sticky header and max-width container

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the starter. Update the content in `src/app/page.tsx` to begin building your experience.

## Project Structure

```
src/
  app/
    layout.tsx   # Root layout with sticky header and footer
    page.tsx     # Sample landing page showcasing theme tokens
    globals.css  # Tailwind layers and CSS variable design tokens
  lib/
    utils.ts     # cn helper for shadcn/ui components
```

Tailwind configuration lives in `tailwind.config.ts` and is shared across the project.
