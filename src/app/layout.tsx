import type { Metadata } from "next";
import { Poppins } from "next/font/google";

import "./globals.css";
import TopBar from "@/components/TopBar";
import { ReactQueryProvider } from "./react-query-provider";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  display: "swap",
  variable: "--font-poppins",
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
    <html lang="en" className={poppins.variable}>
      <body className={poppins.className}>
        <ReactQueryProvider>
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
            <div className="flex-1 pb-10 pt-[var(--topbar-gap)]">
              <main className="max-w-[1440px] px-5 mx-auto">{children}</main>
            </div>
            <footer className="border-t border-border/70 bg-surface/60">
              <div className="mx-auto flex h-16 w-full max-w-none items-center justify-between px-5 text-xs text-muted">
                <span>&copy; {new Date().getFullYear()} Poly UI</span>
                <span>Built with Next.js 14 · Tailwind CSS · shadcn/ui</span>
              </div>
            </footer>
          </div>
        </ReactQueryProvider>
      </body>
    </html>
  );
}
