"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { ShieldCheck } from "lucide-react";

export function PublicHeader() {
  const pathname = usePathname();
  if (pathname?.startsWith("/admin")) return null;

  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center">
          <Link
            href="/"
            className="flex items-center gap-2 font-bold text-lg text-[#1e3a5f]"
          >
            <ShieldCheck className="h-6 w-6" />
            <span className="tracking-tight">AUTORISE</span>
          </Link>
        </div>
      </div>
    </header>
  );
}

export function PublicFooter() {
  const pathname = usePathname();
  if (pathname?.startsWith("/admin")) return null;

  return (
    <footer className="border-t border-slate-200 bg-white mt-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-sm text-slate-500">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <p className="leading-relaxed">
            <strong className="text-slate-700">Disclaimer:</strong>{" "}
            Autorise reflects authorizations issued by the competent
            ministries. The ministry remains the sole decision-making
            authority.
          </p>
          <p className="text-xs whitespace-nowrap">
            © {new Date().getFullYear()} Autorise
          </p>
        </div>
      </div>
    </footer>
  );
}