"use client";

import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Frontend error:", error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="max-w-md text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-amber-50 mb-6">
          <AlertTriangle className="h-8 w-8 text-amber-600" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900 mb-3">
          Something went wrong
        </h1>
        <p className="text-slate-600 mb-6 leading-relaxed">
          We encountered an unexpected issue. Please try again. If the problem
          persists, contact support.
        </p>
        <Button
          onClick={reset}
          className="bg-[#1e3a5f] hover:bg-[#152c48] text-white"
        >
          Try again
        </Button>
      </div>
    </div>
  );
}