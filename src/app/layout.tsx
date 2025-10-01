import type { Metadata } from "next";
import { Inter } from "next/font/google";

import Header from "@/components/Header";
import SearchDock from "@/components/SearchDock";
import { cn } from "@/lib/utils";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Poly UI",
  description: "Starter template with Next.js 14, Tailwind CSS, and shadcn/ui.",
  icons: {
    icon: "/icon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="bg-[color:var(--bg)]">
      <body className={cn("bg-[color:var(--bg)] text-[color:var(--text)] antialiased", inter.className)}>
        <div className="flex min-h-screen flex-col">
          {/* Header sticky, sempre visibile */}
          <header className="sticky top-0 z-50 bg-[color:var(--surface)/0.8] backdrop-blur border-b border-[color:var(--border)]">
            <div className="mx-auto max-w-[1440px] px-3 sm:px-4 md:px-5 h-[var(--header-h)] flex items-center justify-between gap-4">
              {/* Left: logo */}
              {/* Center: SearchBar (solo ≥ md) */}
              {/* Right: actions */}
              <Header />
            </div>
          </header>

          {/* Mobile/Tablet: barra di ricerca in dock separato, sotto l’header */}
          <SearchDock /> {/* questo componente è hidden su ≥ md */}

          {/* Spazio di cortesia sotto l’header: mai far toccare la search al bordo top */}
          <main className="mx-auto max-w-[1440px] px-3 sm:px-4 md:px-5 pt-[var(--header-gap)] pb-8 flex-1 w-full">
            {children}
          </main>

          <footer className="border-t border-[color:var(--border)] bg-[color:var(--surface)/0.6]">
            <div className="mx-auto flex h-16 w-full max-w-[1440px] items-center justify-between px-3 sm:px-4 md:px-5 text-xs text-[color:var(--muted)]">
              <span>&copy; {new Date().getFullYear()} Poly UI</span>
              <span>Built with Next.js 14 · Tailwind CSS · shadcn/ui</span>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
