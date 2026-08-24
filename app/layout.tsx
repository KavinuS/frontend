import type { Metadata } from "next";
import { Archivo, Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

/*
 * The storefront's typeface, and the only one the Modernist design system uses:
 * 400 for body copy, 800 for every heading and control label. Loaded here
 * rather than in the shop layout so the weights are in the critical CSS on a
 * cold entry to any route, and so the admin console — which stays on Geist —
 * still resolves the variable if it ever wants it.
 */
const archivo = Archivo({
  variable: "--font-archivo",
  subsets: ["latin"],
  weight: ["400", "600", "800"],
});

export const metadata: Metadata = {
  title: "FlashX — High-Concurrency Flash Sale Engine",
  description:
    "Limited stock, thousands of buyers. FlashX reserves inventory atomically in Redis and persists orders asynchronously, so nothing ever oversells.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${archivo.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
