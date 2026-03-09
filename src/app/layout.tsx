import type { Metadata } from "next";
import { DM_Sans, Syne } from "next/font/google";
import "./globals.css";
import SessionProvider from "@/components/SessionProvider";
import Navbar from "@/components/layout/Navbar";
import BottomNav from "@/components/layout/BottomNav";
import Footer from "@/components/layout/Footer";
import { Toaster } from "@/components/ui/sonner";
import { getContentBySection } from "@/lib/siteContent";

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
  metadataBase: new URL('https://fixme.nl'),
  title: {
    default: "FixMe — Don't Throw It Away. Fix It.",
    template: "%s | FixMe — Repair Marketplace",
  },
  description: "Don't throw it away. Fix it. Find local repair people for bikes, phones, appliances and more. Save money, save the planet, support local businesses.",
  keywords: ["repair", "fix", "marketplace", "local repair", "bike repair", "phone repair", "appliance repair", "Netherlands", "Amsterdam", "sustainable"],
  authors: [{ name: "FixMe B.V." }],
  creator: "FixMe B.V.",
  publisher: "FixMe B.V.",
  openGraph: {
    type: "website",
    locale: "nl_NL",
    url: "https://fixme.nl",
    siteName: "FixMe",
    title: "FixMe — Don't Throw It Away. Fix It.",
    description: "Find local repair people for bikes, phones, appliances and more. Save money, save the planet, support local businesses.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "FixMe — Repair Marketplace",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "FixMe — Don't Throw It Away. Fix It.",
    description: "Find local repair people for bikes, phones, appliances and more.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [navbarContent, bottomNavContent] = await Promise.all([
    getContentBySection("navbar"),
    getContentBySection("bottomnav"),
  ]);

  return (
    <html lang="en">
      <head>
        <link
          rel="stylesheet"
          href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
          integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
          crossOrigin=""
        />
      </head>
      <body className={`${dmSans.variable} ${syne.variable} font-sans antialiased`}>
        <SessionProvider>
          <Navbar content={navbarContent} />
          <main className="pt-16 pb-20 md:pb-0 min-h-screen flex flex-col">
            {children}
          </main>
          <Footer />
          <BottomNav content={bottomNavContent} />
          <Toaster />
        </SessionProvider>
      </body>
    </html>
  );
}
