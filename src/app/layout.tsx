import type { Metadata } from "next";
import { Inter_Tight } from "next/font/google";
import "./globals.css";

const interTight = Inter_Tight({
  variable: "--font-inter-tight",
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "Botmakers.ai - Enterprise AI, Custom Built",
  description:
    "We build custom AI-powered software and systems that transform how enterprises operate. From intelligent automation to predictive analytics, we deliver solutions tailored to your business.",
  keywords:
    "enterprise AI, custom software, AI development, systems integration, AI consulting, BotMakers",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body
        className={`${interTight.variable} antialiased min-h-full bg-white`}
        style={{ fontFamily: "var(--font-inter-tight), sans-serif" }}
      >
        {children}
      </body>
    </html>
  );
}
