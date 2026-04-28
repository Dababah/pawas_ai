import type { Metadata, Viewport } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import CommandCenter from "@/components/CommandCenter";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit" });

export const metadata: Metadata = {
  title: "Pawas AI | Neural Workspace Controller",
  description: "AI-powered autonomous workspace for productivity, trading, and business management.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} ${outfit.variable} antialiased bg-[#0a0a0b] selection:bg-[#8c7851]/20`}>
        <Sidebar />
        <div className="flex flex-col md:flex-row min-h-screen">
          <main className="flex-1 w-full md:ml-64 transition-all duration-300">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-32 md:py-12">
              {children}
            </div>
          </main>
        </div>
        <CommandCenter />
      </body>
    </html>
  );
}
