import type { Metadata } from "next";
import { Inter } from "next/font/google";

import { cn } from "@/lib/utils";
import "./globals.css";
import TopBar from "@/components/TopBar";

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
    <html lang="en" className="bg-bg">
      <body className={cn("min-h-screen bg-bg text-text antialiased", inter.className)}>
        <div className="flex min-h-screen flex-col">
          <header className="sticky top-0 z-50 border-b border-border/70 bg-surface/80 backdrop-blur">
            <div className="mx-auto flex h-[72px] w-full max-w-none items-center justify-between px-5">
              <span className="text-lg font-semibold tracking-tight">Poly</span>
              <nav className="flex items-center gap-6 text-sm text-muted">
                <a className="transition hover:text-text" href="#">
                  Overview
                </a>
                <a className="transition hover:text-text" href="#">
                  Reports
                </a>
                <a className="transition hover:text-text" href="#">
                  Settings
                </a>
              </nav>
            </div>
          </header>
          <TopBar />
          <main className="mx-auto w-full max-w-[1440px] flex-1 px-5 pb-10 pt-[var(--topbar-gap)]">
            {children}
          </main>
          <footer className="border-t border-border/70 bg-surface/60">
            <div className="mx-auto flex h-16 w-full max-w-none items-center justify-between px-5 text-xs text-muted">
              <span>&copy; {new Date().getFullYear()} Poly UI</span>
              <span>Built with Next.js 14 · Tailwind CSS · shadcn/ui</span>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
