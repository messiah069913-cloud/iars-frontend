"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Save,
  ShieldCheck,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { api } from "@/lib/api";
import { getToken, getUser } from "@/lib/admin-auth";

export default function NewMinistryPage() {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [countryId, setCountryId] = useState("");
  const [countries, setCountries] = useState<
    { id: string; name: string }[]
  >([]);

  useEffect(() => {
    if (!getToken()) {
      router.replace("/admin/login");
      return;
    }
    const user = getUser();
    if (user?.role !== "super_admin") {
      router.replace("/admin");
      return;
    }
    setAuthorized(true);

    console.log("[NewMinistry] Fetching countries...");

    api
      .get("/api/countries")
      .then((res) => {
        console.log("[NewMinistry] Countries loaded:", res.data);
        const countryList: { id: string; name: string }[] = res.data;
        setCountries(countryList);

        // Auto-select if only one country
        if (countryList.length === 1) {
          setCountryId(countryList[0].id);
          console.log("[NewMinistry] Auto-selected:", countryList[0].id);
        }
      })
      .catch((err) => {
        console.error("[NewMinistry] Failed to load countries:", err);
        setError("Unable to load countries. Please refresh and try again.");
      });
  }, [router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!countryId) {
      setError("Please select a country.");
      return;
    }

    setLoading(true);
    setError(null);

    console.log("[NewMinistry] Submitting:", { name, countryId });

    try {
      await api.post("/api/super-admin/ministries", {
        name: name.trim(),
        countryId,
      });
      router.push("/super-admin");
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { error?: string } } })?.response?.data
          ?.error || "Unable to create ministry. Please try again.";
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

  return (
    <div className="min-h-screen bg-slate-100">
      <header className="bg-[#0f172a] text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center gap-2 font-bold">
          <ShieldCheck className="h-5 w-5" />
          <span className="tracking-tight">AUTORISE</span>
          <span className="text-white/50 font-normal text-sm ml-2">
            Super Admin
          </span>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link
          href="/super-admin"
          className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-[#1e3a5f] mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to overview
        </Link>

        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900">
            Create new ministry
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Add a government ministry to the platform.
          </p>
        </div>

        <Card className="p-6 sm:p-8 bg-white border-slate-200">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Ministry name <span className="text-red-500">*</span>
              </label>
              <Input
                type="text"
                required
                minLength={3}
                placeholder="e.g. Ministry of Public Health (MINSANTE)"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-11"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Country <span className="text-red-500">*</span>
              </label>
              <select
                required
                value={countryId}
                onChange={(e) => setCountryId(e.target.value)}
                className="h-11 w-full rounded-lg border border-slate-300 bg-white px-4 text-sm outline-none focus:border-[#1e3a5f] focus:ring-2 focus:ring-[#1e3a5f]/20 cursor-pointer"
              >
                <option value="">Select a country</option>
                {countries.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {error && (
              <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Link href="/super-admin" className="flex-1">
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
                    Creating...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Create ministry
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