import type { Metadata } from "next";
import { Poppins } from "next/font/google";

import { cn } from "@/lib/utils";
import { Toaster } from "@/components/ui/toaster";
import "./globals.css";
import { SidePanel } from "@/components/shared/SidePanel";
import { AppQueryProvider } from "./query-client-provider";

const poppins = Poppins({
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "600", "700"],
});

export const metadata: Metadata = {
  title: "Polymuffin UI",
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
      <body className={cn("bg-[color:var(--bg)] text-[color:var(--fg)] antialiased", poppins.className)}>
        <AppQueryProvider>
          <div className="min-h-screen bg-[color:var(--bg)]">{children}</div>
          <SidePanel />
          <Toaster />
        </AppQueryProvider>
      </body>
    </html>
  );
}
