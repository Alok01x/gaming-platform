import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/navbar";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-heading",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "GamerNotFound | Scale & Dominance",
  description: "Advanced esports tournament orchestration and talent discovery.",
};

import { ThemeProvider } from "@/components/providers/theme-provider";
import { SignalProvider } from "@/app/providers/signal-provider";
import { ToastProvider } from "@/components/providers/toast-provider";
import { Background } from "@/components/layout/background";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${spaceGrotesk.variable} antialiased min-h-screen bg-background text-foreground transition-colors duration-500`}>
        <ThemeProvider>
          <ToastProvider>
            <SignalProvider>
              <Background />
              <Navbar />
              {children}
            </SignalProvider>
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
