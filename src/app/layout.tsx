import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { PublicHeader, PublicFooter } from "@/components/ConditionalChrome";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Autorise — Verify an institution in Cameroon",
  description:
    "Instantly verify whether an institution is authorized to operate in Cameroon. A trusted public service.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-slate-50 text-slate-900 font-sans">
        <PublicHeader />
        <main className="flex-1">{children}</main>
        <PublicFooter />
      </body>
    </html>
  );
}