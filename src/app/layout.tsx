import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
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
      <body className={`${inter.variable} antialiased bg-black`}>
        <AuthWrapper>
          <SplashScreen />
          <Sidebar />
          <main className="min-h-screen md:ml-64 px-6 pt-12 max-w-4xl mx-auto pb-24 md:pb-12">
            {children}
          </main>
        </AuthWrapper>
      </body>
    </html>
  );
}
