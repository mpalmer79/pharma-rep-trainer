import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PharmaRep Trainer | AI Sales Simulation",
  description: "Practice pharmaceutical sales calls with AI-powered physician simulations",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
