import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Providers } from "@/components/Providers";

export const metadata: Metadata = {
  title: "RepIQ | AI-Powered Pharmaceutical Sales Training",
  description: "Master physician conversations with AI-powered roleplay simulations. Practice with challenging personas modeled on real physician behaviors. Built for New England's pharmaceutical sales teams.",
  keywords: ["pharmaceutical sales training", "AI roleplay", "physician simulation", "sales coaching", "medical sales", "New England", "Boston", "pharma training"],
  authors: [{ name: "Michael Palmer" }],
  openGraph: {
    title: "RepIQ | AI-Powered Pharmaceutical Sales Training",
    description: "Master physician conversations with AI-powered roleplay simulations.",
    type: "website",
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: '#1B4D7A',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
