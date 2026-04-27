import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import SplashScreen from "@/components/SplashScreen";
import AuthWrapper from "@/components/AuthWrapper";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit" });

export const metadata: Metadata = {
  title: "Pawas.ai | Your Neural Assistant",
  description: "Personal assistant for IT students, gadget entrepreneurs, and traders.",
  viewport: "width=device-width, initial-scale=1, maximum-scale=1",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} ${outfit.variable} antialiased bg-black selection:bg-white/10`}>
        <AuthWrapper>
          <SplashScreen />
          <Sidebar />
          <div className="flex flex-col md:flex-row min-h-screen">
            <main className="flex-1 w-full md:ml-64 transition-all duration-300">
              <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-32 md:py-12">
                {children}
              </div>
            </main>
          </div>
        </AuthWrapper>
      </body>
    </html>
  );
}

