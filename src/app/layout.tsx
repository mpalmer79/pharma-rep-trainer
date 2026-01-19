import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "RepIQ | AI-Powered Pharmaceutical Sales Training",
  description: "Master physician conversations with AI-powered roleplay simulations. Practice with challenging personas modeled on real physician behaviors in the New England medical corridor.",
  keywords: ["pharmaceutical sales training", "AI roleplay", "physician simulation", "sales coaching", "medical sales", "New England", "Boston"],
  authors: [{ name: "RepIQ" }],
  openGraph: {
    title: "RepIQ | AI-Powered Pharmaceutical Sales Training",
    description: "Master physician conversations with AI-powered roleplay simulations.",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "RepIQ | AI-Powered Pharmaceutical Sales Training",
    description: "Master physician conversations with AI-powered roleplay simulations.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link 
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Space+Grotesk:wght@400;500;600;700&display=swap" 
          rel="stylesheet" 
        />
        <meta name="theme-color" content="#020617" />
      </head>
      <body className="antialiased bg-slate-950 text-white">
        {children}
      </body>
    </html>
  );
}
