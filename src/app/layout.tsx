import type { Metadata } from "next";
import { Poppins } from "next/font/google";

import { cn } from "@/lib/utils";
import "./globals.css";
import TopBar from "@/components/TopBar";
import { AppQueryProvider } from "./query-client-provider";

const poppins = Poppins({
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "600", "700"],
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
      <body
        className={cn(
          "min-h-screen bg-[var(--bg)] text-[var(--text)] antialiased",
          poppins.className,
        )}
      >
        <AppQueryProvider>
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
            <main className="main-wrap mx-auto w-full max-w-[1440px] flex-1 px-5 pb-10">
              {children}
            </main>
            <footer className="border-t border-border/70 bg-surface/60">
              <div className="mx-auto flex h-16 w-full max-w-none items-center justify-between px-5 text-xs text-muted">
                <span>&copy; {new Date().getFullYear()} Poly UI</span>
                <span>Built with Next.js 14 · Tailwind CSS · shadcn/ui</span>
              </div>
            </footer>
          </div>
        </AppQueryProvider>
      </body>
    </html>
  );
}
