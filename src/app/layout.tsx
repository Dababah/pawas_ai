import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import BottomNav from "@/components/BottomNav";
import SplashScreen from "@/components/SplashScreen";
import AuthWrapper from "@/components/AuthWrapper";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "Pawas.ai | Your Neural Assistant",
  description: "Personal assistant for IT students, gadget entrepreneurs, and traders.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} antialiased pb-24`}>
        <AuthWrapper>
          <SplashScreen />
          <main className="min-h-screen px-4 pt-8 max-w-lg mx-auto">
            {children}
          </main>
          <BottomNav />
        </AuthWrapper>
      </body>
    </html>
  );
}
