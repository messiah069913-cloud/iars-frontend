import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Link from "next/link";
import "./globals.css";
import { ShieldCheck } from "lucide-react";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Autorise — Vérifiez une institution au Cameroun",
  description:
    "Vérifiez instantanément si une institution est autorisée à opérer au Cameroun. Un service public de confiance.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-slate-50 text-slate-900 font-sans">
        {/* Top navigation */}
        <header className="border-b border-slate-200 bg-white">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex h-16 items-center justify-between">
              <Link
                href="/"
                className="flex items-center gap-2 font-bold text-lg text-[#1e3a5f]"
              >
                <ShieldCheck className="h-6 w-6" />
                <span className="tracking-tight">AUTORISE</span>
              </Link>
<header className="border-b border-slate-200 bg-white">
  <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
    <div className="flex h-16 items-center justify-between">
      <Link
        href="/"
        className="flex items-center gap-2 font-bold text-lg text-[#1e3a5f]"
      >
        <ShieldCheck className="h-6 w-6" />
        <span className="tracking-tight">AUTORISE</span>
      </Link>

      {/* Language toggle placeholder — we'll build this properly next */}
      <div className="flex items-center gap-2 text-sm">
        <button className="px-2 py-1 rounded font-medium text-[#1e3a5f] bg-[#1e3a5f]/10">
          FR
        </button>
        <button className="px-2 py-1 rounded text-slate-500 hover:text-slate-900">
          EN
        </button>
      </div>
    </div>
  </div>
</header>
            
            </div>
          </div>
        </header>

        {/* Main content */}
        <main className="flex-1">{children}</main>

        {/* Footer */}
        <footer className="border-t border-slate-200 bg-white mt-16">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-sm text-slate-500">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <p className="leading-relaxed">
                <strong className="text-slate-700">Avertissement :</strong>{" "}
                Autorise reflète les autorisations délivrées par les ministères
                compétents. Le ministère reste l'autorité finale.
              </p>
              <p className="text-xs whitespace-nowrap">
                © {new Date().getFullYear()} Autorise
              </p>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}