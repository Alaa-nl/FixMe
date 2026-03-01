import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import SessionProvider from "@/components/SessionProvider";
import Navbar from "@/components/layout/Navbar";
import BottomNav from "@/components/layout/BottomNav";
import Footer from "@/components/layout/Footer";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "FixMe - Don't throw it away. Fix it.",
  description: "FixMe - Your trusted repair service platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans antialiased`}>
        <SessionProvider>
          <Navbar />
          <main className="pt-16 pb-20 md:pb-0 min-h-screen flex flex-col">
            {children}
          </main>
          <Footer />
          <BottomNav />
        </SessionProvider>
      </body>
    </html>
  );
}
