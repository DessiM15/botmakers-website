// SPEC: CLAUDE.md > Branding > Font: Inter Tight
import type { Metadata } from "next";
import { Inter_Tight } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const interTight = Inter_Tight({
  variable: "--font-inter-tight",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Botmakers CRM",
  description: "Internal CRM for BotMakers Inc.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${interTight.variable} font-[family-name:var(--font-inter-tight)] antialiased`}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
