import type { Metadata } from "next";
import { DM_Sans, Syne } from "next/font/google";
import "./globals.css";
import SessionProvider from "@/components/SessionProvider";
import Navbar from "@/components/layout/Navbar";
import BottomNav from "@/components/layout/BottomNav";
import Footer from "@/components/layout/Footer";

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  weight: ["400", "500", "700"],
});

const syne = Syne({
  subsets: ["latin"],
  variable: "--font-syne",
  weight: ["400", "600", "700", "800"],
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
      <body className={`${dmSans.variable} ${syne.variable} font-sans antialiased`}>
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
