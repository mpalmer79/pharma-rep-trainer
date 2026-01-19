import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "RepIQ | AI-Powered Pharmaceutical Sales Training",
  description: "Master physician conversations with AI-powered roleplay simulations. Practice with challenging personas modeled on real physician behaviors.",
  keywords: ["pharmaceutical sales training", "AI roleplay", "physician simulation", "sales coaching", "medical sales"],
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: '#ffffff',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased bg-white text-gray-900">
        {children}
      </body>
    </html>
  );
}
