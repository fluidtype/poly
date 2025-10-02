import Link from "next/link";
import type { Metadata } from "next";
import { Poppins } from "next/font/google";

import { cn } from "@/lib/utils";
import { Toaster } from "@/components/ui/toaster";
import "./globals.css";
import TopBar from "@/components/TopBar";
import { SidePanel } from "@/components/shared/SidePanel";
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
    <html lang="en">
      <body
        className={cn(
          "min-h-screen bg-[color:var(--bg)] text-[color:var(--fg)] antialiased",
          poppins.className,
        )}
      >
        <AppQueryProvider>
          <div className="flex min-h-screen flex-col bg-[color:var(--bg)]">
            <header className="border-b border-[color:var(--border)]/80 bg-[color:var(--panel)]/80 backdrop-blur-lg">
              <div className="container-outer flex h-16 items-center justify-between">
                <span className="text-lg font-semibold tracking-tight">Poly</span>
                <nav className="flex items-center gap-6 text-sm text-[color:var(--muted)]">
                  <Link className="transition hover:text-[color:var(--fg)]" href="/">
                    Overview
                  </Link>
                  <Link className="transition hover:text-[color:var(--fg)]" href="/reports">
                    Reports
                  </Link>
                  <Link className="transition hover:text-[color:var(--fg)]" href="/settings">
                    Settings
                  </Link>
                </nav>
              </div>
            </header>
            <TopBar />
            <main className="flex-1 overflow-hidden">
              <div className="container-outer flex h-full flex-col overflow-hidden py-6">
                {children}
              </div>
            </main>
            <footer className="border-t border-[color:var(--border)]/80 bg-[color:var(--panel)]/60">
              <div className="container-outer flex h-12 items-center justify-between text-xs text-[color:var(--muted)]">
                <span>&copy; {new Date().getFullYear()} Poly UI</span>
                <span>Next.js · Tailwind CSS · shadcn/ui</span>
              </div>
            </footer>
          </div>
          <SidePanel />
          <Toaster />
        </AppQueryProvider>
      </body>
    </html>
  );
}
