import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Noise from "@/components/bits/Noise";
import { Z } from "@/lib/z";
import "./globals.css";

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" });
const geistMono = Geist_Mono({ subsets: ["latin"], variable: "--font-mono" });

export const metadata: Metadata = {
  title: "Karthik Reddy",
  description: "AI/ML engineer building generative AI, computer vision, and data science systems.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className={`${geist.variable} ${geistMono.variable} font-sans antialiased`}>
        {children}
        <div aria-hidden className="pointer-events-none fixed inset-0" style={{ zIndex: Z.grain }}>
          <Noise patternAlpha={12} />
        </div>
      </body>
    </html>
  );
}
