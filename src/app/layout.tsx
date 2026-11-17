import type { Metadata, Viewport } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ServiceWorkerRegister from "@/components/ServiceWorkerRegister";
import CookieBanner from "@/components/CookieBanner";
import { LanguageProvider } from "@/context/LanguageContext";
import { AuthProvider } from "@/context/AuthContext";

export const metadata: Metadata = {
  title: "Lost & Found Registry | Secure Community Property Registry",
  description: "Decentralized, privacy-first lost & found registry with zero-trust document masking, QR verification, and MoMo micro-escrow.",
  manifest: "/manifest.json",
  icons: {
    icon: "/icons/icon-192.png",
    apple: "/icons/icon-192.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#1B4D3E",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Lost & Found" />
      </head>
      <body className="h-full flex flex-col bg-[#F8FAF7] text-[#1A201C] antialiased selection:bg-[#EBF3EF] selection:text-[#1B4D3E]">
        <LanguageProvider>
          <AuthProvider>
            {/* PWA Service Worker & Install Handler */}
            <ServiceWorkerRegister />

            {/* Global Navigation Header */}
            <Navbar />

            {/* Main Application Shell */}
            <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
              {children}
            </main>

            {/* Global Footer */}
            <Footer />

            {/* Essential Cookie & Local Storage Consent */}
            <CookieBanner />
          </AuthProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}

