"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Building2,
  CheckCircle2,
  PauseCircle,
  XCircle,
  Plus,
  LogOut,
  ShieldCheck,
  ArrowRight,
  Archive,
  RotateCcw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { api } from "@/lib/api";
import {
  getUser,
  getToken,
  clearSession,
  type AdminUser,
} from "@/lib/admin-auth";

interface AdminInstitution {
  id: string;
  name: string;
  registrationNumber: string | null;
  location: string | null;
  status:
    | "authorized"
    | "revoked"
    | "suspended"
    | "archived"
    | "pending_renewal"
    | "expired";
  isActive: boolean;
  lastVerifiedAt: string;
  expiresAt: string | null;
  ministry: { id: string; name: string };
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<AdminUser | null>(null);
  const [institutions, setInstitutions] = useState<AdminInstitution[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showArchived, setShowArchived] = useState(false);

  function reload() {
    setLoading(true);
    setError(null);
    api
      .get("/api/admin/institutions")
      .then((res) => {
        setInstitutions(res.data.results || []);
      })
      .catch(() => {
        setError("Unable to load institutions. Please try again.");
      })
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    const token = getToken();
    if (!token) {
      router.replace("/admin/login");
      return;
    }

    const currentUser = getUser();
    setUser(currentUser);
    reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

  function handleSignOut() {
    clearSession();
    router.replace("/admin/login");
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100">
        <p className="text-slate-500">Loading...</p>
      </div>
    );
  }

  const activeInstitutions = institutions.filter((i) => i.isActive);
  const archivedInstitutions = institutions.filter((i) => !i.isActive);

  const authorized = activeInstitutions.filter(
    (i) => i.status === "authorized"
  ).length;
  const suspended = activeInstitutions.filter(
    (i) => i.status === "suspended"
  ).length;
  const revoked = activeInstitutions.filter(
    (i) => i.status === "revoked"
  ).length;

  const displayed = showArchived ? archivedInstitutions : activeInstitutions;

  return (
    <div className="min-h-screen bg-slate-100">
      {/* Top bar */}
      <header className="bg-[#1e3a5f] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold">
            <ShieldCheck className="h-5 w-5" />
            <span className="tracking-tight">AUTORISE</span>
            <span className="text-white/50 font-normal text-sm ml-2">
              Admin Portal
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-white/80 hidden sm:inline">
              {user.name}
            </span>
            <button
              onClick={handleSignOut}
              className="flex items-center gap-2 text-sm text-white/80 hover:text-white transition"
            >
              <LogOut className="h-4 w-4" />
              Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Institutions
            </h1>
            <p className="mt-1 text-sm text-slate-600">
              {user.ministry?.name || "All ministries"}
              {user.role === "super_admin" && (
                <span className="ml-2 text-xs bg-slate-200 text-slate-700 px-2 py-0.5 rounded">
                  Super Admin
                </span>
              )}
            </p>
          </div>
          <div className="flex items-center gap-4">
  {user.role === "super_admin" && (
    <Link
      href="/super-admin"
      className="text-sm text-white/80 hover:text-white transition hidden sm:inline"
    >
      ← Super Admin
    </Link>
  )}
  <span className="text-sm text-white/80 hidden sm:inline">
    {user.name}
  </span>
  <button
    onClick={handleSignOut}
    className="flex items-center gap-2 text-sm text-white/80 hover:text-white transition"
  >
    <LogOut className="h-4 w-4" />
    Sign out
  </button>
</div>
          <Link href="/admin/institutions/new">
            <Button className="bg-[#1e3a5f] hover:bg-[#152c48] text-white">
              <Plus className="h-4 w-4 mr-2" />
              Add institution
            </Button>
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <StatCard
            icon={<CheckCircle2 className="h-5 w-5" />}
            label="Authorized"
            value={authorized}
            color="green"
          />
          <StatCard
            icon={<PauseCircle className="h-5 w-5" />}
            label="Suspended"
            value={suspended}
            color="amber"
          />
          <StatCard
            icon={<XCircle className="h-5 w-5" />}
            label="Revoked"
            value={revoked}
            color="red"
          />
        </div>

        {/* Filter chips */}
        <div className="flex items-center gap-2 mb-4">
          <button
            onClick={() => setShowArchived(false)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition ${
              !showArchived
                ? "bg-[#1e3a5f] text-white"
                : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
            }`}
          >
            Active ({activeInstitutions.length})
          </button>
          <button
            onClick={() => setShowArchived(true)}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-medium transition ${
              showArchived
                ? "bg-[#1e3a5f] text-white"
                : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
            }`}
          >
            <Archive className="h-3.5 w-3.5" />
            Archived ({archivedInstitutions.length})
          </button>
        </div>

        {/* Institutions table */}
        <Card className="bg-white border-slate-200 overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-slate-500">
              Loading institutions...
            </div>
          ) : error ? (
            <div className="p-12 text-center text-red-600">{error}</div>
          ) : displayed.length === 0 ? (
            <div className="p-12 text-center">
              <Building2 className="h-12 w-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-600 font-medium mb-1">
                {showArchived
                  ? "No archived institutions"
                  : "No institutions yet"}
              </p>
              <p className="text-sm text-slate-500 mb-4">
                {showArchived
                  ? "Deactivated institutions will appear here."
                  : "Add your first institution to get started."}
              </p>
              {!showArchived && (
                <Link href="/admin/institutions/new">
                  <Button
                    variant="outline"
                    className="border-slate-300"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add institution
                  </Button>
                </Link>
              )}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50 hover:bg-slate-50">
                  <TableHead>Name</TableHead>
                  <TableHead className="hidden md:table-cell">
                    Registration
                  </TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="hidden lg:table-cell">
                    Location
                  </TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {displayed.map((inst) => (
                  <TableRow key={inst.id} className="hover:bg-slate-50">
                    <TableCell className="font-medium text-slate-900">
  <div>{inst.name}</div>
  {inst.expiresAt && (
    <div
      className={`text-xs mt-0.5 ${
        isExpiringSoon(inst.expiresAt)
          ? "text-amber-600 font-medium"
          : "text-slate-400"
      }`}
    >
      Expires {formatExpiry(inst.expiresAt)}
    </div>
  )}
</TableCell>
                    <TableCell className="hidden md:table-cell text-sm font-mono text-slate-500">
                      {inst.registrationNumber || "—"}
                    </TableCell>
                    <TableCell>
                      <StatusPill
                        status={inst.status}
                        isActive={inst.isActive}
                      />
                    </TableCell>
                    <TableCell className="hidden lg:table-cell text-sm text-slate-600">
                      {inst.location || "—"}
                    </TableCell>
                    <TableCell className="text-right">
                      {inst.isActive ? (
                        <Link href={`/admin/institutions/${inst.id}`}>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-[#1e3a5f] hover:bg-[#1e3a5f]/10"
                          >
                            Edit
                            <ArrowRight className="h-3 w-3 ml-1" />
                          </Button>
                        </Link>
                      ) : (
                        <RestoreButton id={inst.id} onRestored={reload} />
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </Card>
      </main>
    </div>
  );
}

// ---------- Stat Card ----------

function StatCard({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  color: "green" | "amber" | "red";
}) {
  const colors = {
    green: "bg-green-50 text-green-700 border-green-200",
    amber: "bg-amber-50 text-amber-700 border-amber-200",
    red: "bg-red-50 text-red-700 border-red-200",
  };

  return (
    <Card className={`p-5 border ${colors[color]}`}>
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm font-medium opacity-80">{label}</div>
          <div className="text-3xl font-bold mt-1">{value}</div>
        </div>
        <div className="h-10 w-10 rounded-lg bg-white/60 flex items-center justify-center">
          {icon}
        </div>
      </div>
    </Card>
  );
}

// ---------- Status Pill ----------

function StatusPill({
  status,
  isActive,
}: {
  status:
    | "authorized"
    | "revoked"
    | "suspended"
    | "archived"
    | "pending_renewal"
    | "expired";
  isActive: boolean;
}) {

  if (!isActive || status === "archived") {
    return (
      <Badge className="bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-100">
        Archived
      </Badge>
    );
  }
  if (status === "authorized") {
    return (
      <Badge className="bg-green-100 text-green-800 border-green-200 hover:bg-green-100">
        Authorized
      </Badge>
    );
  }
  if (status === "suspended") {
    return (
      <Badge className="bg-amber-100 text-amber-800 border-amber-200 hover:bg-amber-100">
        Suspended
      </Badge>
    );
  }
  if (status === "pending_renewal") {
  return (
    <Badge className="bg-amber-100 text-amber-800 border-amber-200 hover:bg-amber-100">
      Pending Renewal
    </Badge>
  );
}

if (status === "expired") {
  return (
    <Badge className="bg-red-100 text-red-800 border-red-200 hover:bg-red-100">
      Expired
    </Badge>
  );
}
  return (
    <Badge className="bg-red-100 text-red-800 border-red-200 hover:bg-red-100">
      Revoked
    </Badge>
  );
}

// ---------- Restore Button ----------

function RestoreButton({
  id,
  onRestored,
}: {
  id: string;
  onRestored: () => void;
}) {
  const [loading, setLoading] = useState(false);

  async function handleRestore() {
    setLoading(true);
    try {
      await api.patch(`/api/admin/institutions/${id}`, {
        status: "authorized",
        isActive: true,
      });
      onRestored();
    } catch {
      alert("Unable to restore. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleRestore}
      disabled={loading}
      className="text-green-700 hover:bg-green-50"
    >
      <RotateCcw className="h-3 w-3 mr-1" />
      {loading ? "Restoring..." : "Restore"}
    </Button>
  );
}

// ---------- Expiry helpers ----------

function isExpiringSoon(dateString: string): boolean {
  const now = new Date();
  const expiry = new Date(dateString);
  const diffDays = Math.ceil(
    (expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
  );
  return diffDays <= 30 && diffDays >= 0;
}

function formatExpiry(dateString: string): string {
  const expiry = new Date(dateString);
  const now = new Date();
  const diffDays = Math.ceil(
    (expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (diffDays < 0) return `${Math.abs(diffDays)} days ago`;
  if (diffDays === 0) return "today";
  if (diffDays <= 30) return `in ${diffDays} days`;
  return expiry.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}