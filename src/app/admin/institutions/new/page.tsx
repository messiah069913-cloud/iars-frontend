"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Save,
  ShieldCheck,
  Loader2,
  Image as ImageIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { api } from "@/lib/api";
import { getToken, getUser } from "@/lib/admin-auth";

export default function NewInstitutionPage() {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [registrationNumber, setRegistrationNumber] = useState("");
  const [location, setLocation] = useState("");
  const [status, setStatus] = useState<
    "authorized" | "suspended" | "revoked"
  >("authorized");
  const [authorizedAt, setAuthorizedAt] = useState("");
  const [expiresAt, setExpiresAt] = useState("");

  useEffect(() => {
    if (!getToken()) {
      router.replace("/admin/login");
      return;
    }
    setAuthorized(true);
  }, [router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await api.post("/api/admin/institutions", {
        name: name.trim(),
        registrationNumber: registrationNumber.trim() || null,
        location: location.trim() || null,
        status,
        authorizedAt: authorizedAt || null,
        expiresAt: expiresAt || null,                              // ← ADD
      });

      router.push("/admin");
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { error?: string } } })?.response?.data
          ?.error || "Unable to create institution. Please try again.";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  if (!authorized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100">
        <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
      </div>
    );
  }

  const user = getUser();

  return (
    <div className="min-h-screen bg-slate-100">
      {/* Top bar */}
      <header className="bg-[#1e3a5f] text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold">
            <ShieldCheck className="h-5 w-5" />
            <span className="tracking-tight">AUTORISE</span>
            <span className="text-white/50 font-normal text-sm ml-2">
              Admin Portal
            </span>
          </div>
          <span className="text-sm text-white/80 hidden sm:inline">
            {user?.name}
          </span>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link
          href="/admin"
          className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-[#1e3a5f] mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to institutions
        </Link>

        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900">
            Add new institution
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            {user?.ministry?.name || "All ministries"}
          </p>
        </div>

        <Card className="p-6 sm:p-8 bg-white border-slate-200">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Institution name <span className="text-red-500">*</span>
              </label>
              <Input
                type="text"
                required
                minLength={3}
                placeholder="e.g. University of Douala"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-11"
              />
            </div>

            {/* Registration number */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Registration number
              </label>
              <Input
                type="text"
                placeholder="e.g. MINESUP/2024/00123"
                value={registrationNumber}
                onChange={(e) => setRegistrationNumber(e.target.value)}
                className="h-11 font-mono"
              />
              <p className="mt-1 text-xs text-slate-500">
                Optional. Must be unique across all institutions.
              </p>
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Location
              </label>
              <Input
                type="text"
                placeholder="e.g. Douala, Littoral Region"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="h-11"
              />
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Status
              </label>
              <select
                value={status}
                onChange={(e) =>
                  setStatus(
                    e.target.value as "authorized" | "suspended" | "revoked"
                  )
                }
                className="h-11 w-full rounded-lg border border-slate-300 bg-white px-4 text-sm outline-none focus:border-[#1e3a5f] focus:ring-2 focus:ring-[#1e3a5f]/20 cursor-pointer"
              >
                <option value="authorized">Authorized</option>
                <option value="suspended">Suspended</option>
                <option value="revoked">Revoked</option>
              </select>
            </div>

            {/* Authorized date */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Authorized date
              </label>
              <Input
                type="date"
                value={authorizedAt}
                onChange={(e) => setAuthorizedAt(e.target.value)}
                className="h-11"
              />
              <p className="mt-1 text-xs text-slate-500">
                Optional. The date the ministry granted authorization.
              </p>
            </div>

            {/* Expiry date */}
<div>
  <label className="block text-sm font-medium text-slate-700 mb-1.5">
    Authorization expires on
  </label>
  <Input
    type="date"
    value={expiresAt}
    onChange={(e) => setExpiresAt(e.target.value)}
    className="h-11"
  />
  <p className="mt-1 text-xs text-slate-500">
    Optional. Leave empty if the authorization has no expiry.
  </p>
</div>

            {/* Logo placeholder (Supabase Storage integration next) */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Logo
              </label>
              <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center bg-slate-50">
                <ImageIcon className="h-8 w-8 text-slate-400 mx-auto mb-2" />
                <p className="text-sm text-slate-500">
                  Logo upload coming soon
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  (Will be enabled with Supabase Storage)
                </p>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">
                {error}
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Link href="/admin" className="flex-1">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full h-11 border-slate-300"
                >
                  Cancel
                </Button>
              </Link>
              <Button
                type="submit"
                disabled={loading}
                className="flex-1 h-11 bg-[#1e3a5f] hover:bg-[#152c48] text-white"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Create institution
                  </>
                )}
              </Button>
            </div>
          </form>
        </Card>
      </main>
    </div>
  );
}