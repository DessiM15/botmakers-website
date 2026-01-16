import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "BotMakers - The AI Agency | Smart Conversations, Seamless Connections",
  description: "AI-powered voice solutions that enable businesses to save time and money through automated customer interactions, lead qualification, and operational streamlining.",
  keywords: "AI voice agents, chatbots, voice automation, lead qualification, BotMakers",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className={`${inter.variable} antialiased min-h-full bg-gray-50`}>
        {children}
      </body>
    </html>
  );
}
