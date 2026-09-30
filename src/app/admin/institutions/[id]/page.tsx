"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Save,
  ShieldCheck,
  Loader2,
  Image as ImageIcon,
  Trash2,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { api } from "@/lib/api";
import { getToken, getUser } from "@/lib/admin-auth";

interface Institution {
  id: string;
  name: string;
  registrationNumber: string | null;
  logoUrl: string | null;
  location: string | null;
  status:
    | "authorized"
    | "revoked"
    | "suspended"
    | "archived"
    | "pending_renewal"
    | "expired";
  isActive: boolean;
  authorizedAt: string | null;
  expiresAt: string | null;
  lastVerifiedAt: string;
  ministry: {
    id: string;
    name: string;
    country?: { name: string };
  };
}

export default function EditInstitutionPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const [authorized, setAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deactivating, setDeactivating] = useState(false);
  const [showDeactivateConfirm, setShowDeactivateConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [registrationNumber, setRegistrationNumber] = useState("");
  const [location, setLocation] = useState("");
  const [status, setStatus] = useState<
  "authorized" | "suspended" | "revoked" | "pending_renewal" | "expired"
>("authorized");
  const [authorizedAt, setAuthorizedAt] = useState("");
  const [expiresAt, setExpiresAt] = useState("");

  useEffect(() => {
    if (!getToken()) {
      router.replace("/admin/login");
      return;
    }
    setAuthorized(true);

    if (!id) return;

    api
      .get(`/api/admin/institutions`)
      .then((res) => {
        const found = (res.data.results as Institution[]).find(
          (i) => i.id === id
        );
        if (!found) {
          setError("Institution not found");
          setLoading(false);
          return;
        }
        setName(found.name);
        setRegistrationNumber(found.registrationNumber || "");
        setLocation(found.location || "");
        setStatus(found.status === "archived" ? "authorized" : found.status);
        setAuthorizedAt(
          found.authorizedAt
            ? new Date(found.authorizedAt).toISOString().split("T")[0]
            : ""
        );
        setExpiresAt(                                                  // ← ADD
  found.expiresAt
    ? new Date(found.expiresAt).toISOString().split("T")[0]
    : ""
);
        setLoading(false);
      })
      .catch(() => {
        setError("Unable to load institution");
        setLoading(false);
      });
  }, [id, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      await api.patch(`/api/admin/institutions/${id}`, {
        name: name.trim(),
        location: location.trim() || null,
        status,
        authorizedAt: authorizedAt || null,
        expiresAt: expiresAt || null,                              // ← ADD
      });
      router.push("/admin");
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { error?: string } } })?.response?.data
          ?.error || "Unable to save changes. Please try again.";
      setError(message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDeactivate() {
    setDeactivating(true);
    try {
      await api.delete(`/api/admin/institutions/${id}`);
      router.push("/admin");
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { error?: string } } })?.response?.data
          ?.error || "Unable to deactivate. Please try again.";
      setError(message);
      setDeactivating(false);
      setShowDeactivateConfirm(false);
    }
  }

  if (!authorized || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100">
        <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
      </div>
    );
  }

  if (error && !name) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100 px-4">
        <Card className="max-w-md p-8 text-center">
          <AlertTriangle className="h-12 w-12 text-amber-500 mx-auto mb-4" />
          <h1 className="text-lg font-semibold mb-2">Not found</h1>
          <p className="text-sm text-slate-600 mb-4">{error}</p>
          <Link href="/admin">
            <Button variant="outline">Back to dashboard</Button>
          </Link>
        </Card>
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
            Edit institution
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
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-11"
              />
            </div>

            {/* Registration (read-only) */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Registration number
              </label>
              <Input
                type="text"
                value={registrationNumber}
                disabled
                className="h-11 font-mono bg-slate-50 text-slate-500"
              />
              <p className="mt-1 text-xs text-slate-500">
                Registration numbers cannot be changed after creation.
              </p>
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Location
              </label>
              <Input
                type="text"
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
      e.target.value as
        | "authorized"
        | "suspended"
        | "revoked"
        | "pending_renewal"
        | "expired"
    )
  }
  className="h-11 w-full rounded-lg border border-slate-300 bg-white px-4 text-sm outline-none focus:border-[#1e3a5f] focus:ring-2 focus:ring-[#1e3a5f]/20 cursor-pointer"
>
  <option value="authorized">Authorized</option>
  <option value="suspended">Suspended</option>
  <option value="revoked">Revoked</option>
  <option value="pending_renewal">Pending Renewal</option>
  <option value="expired">Expired</option>
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
</div>

{/* NEW: Expiry date */}
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

            {/* Logo placeholder */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Logo
              </label>
              <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center bg-slate-50">
                <ImageIcon className="h-8 w-8 text-slate-400 mx-auto mb-2" />
                <p className="text-sm text-slate-500">
                  Logo upload coming soon
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
                disabled={saving}
                className="flex-1 h-11 bg-[#1e3a5f] hover:bg-[#152c48] text-white"
              >
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save changes
                  </>
                )}
              </Button>
            </div>
          </form>

          {/* Danger zone — deactivate */}
          <div className="mt-8 pt-8 border-t border-slate-200">
            <h3 className="text-sm font-semibold text-red-700 mb-2">
              Danger zone
            </h3>
            <p className="text-xs text-slate-600 mb-4">
              Deactivating this institution will hide it from public search.
              The record is kept for audit purposes but marked as archived.
            </p>

            {!showDeactivateConfirm ? (
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowDeactivateConfirm(true)}
                className="border-red-200 text-red-700 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Deactivate institution
              </Button>
            ) : (
              <div className="rounded-lg bg-red-50 border border-red-200 p-4">
                <p className="text-sm text-red-800 mb-3 font-medium">
                  Are you sure? This cannot be undone from the UI.
                </p>
                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowDeactivateConfirm(false)}
                    className="border-slate-300"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    onClick={handleDeactivate}
                    disabled={deactivating}
                    className="bg-red-600 hover:bg-red-700 text-white"
                  >
                    {deactivating ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Deactivating...
                      </>
                    ) : (
                      "Yes, deactivate"
                    )}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </Card>
      </main>
    </div>
  );
}