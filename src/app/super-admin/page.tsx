"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Building2,
  Users,
  Landmark,
  LogOut,
  ShieldCheck,
  Plus,
  Loader2,
  ArrowRight,
  Mail,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { api } from "@/lib/api";
import {
  getUser,
  getToken,
  clearSession,
  type AdminUser,
} from "@/lib/admin-auth";

interface MinistryWithCounts {
  id: string;
  name: string;
  country: { id: string; name: string };
  institutionCount: number;
  adminCount: number;
}

interface AdminListItem {
  id: string;
  name: string;
  email: string;
  role: "admin" | "super_admin";
  ministry: { id: string; name: string } | null;
}

export default function SuperAdminDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<AdminUser | null>(null);
  const [ministries, setMinistries] = useState<MinistryWithCounts[]>([]);
  const [admins, setAdmins] = useState<AdminListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  function reload() {
    setLoading(true);
    setError(null);
    Promise.all([
      api.get("/api/super-admin/ministries"),
      api.get("/api/super-admin/admins"),
    ])
      .then(([mRes, aRes]) => {
        setMinistries(mRes.data.results || []);
        setAdmins(aRes.data.results || []);
      })
      .catch(() => setError("Unable to load data. Please try again."))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    if (!getToken()) {
      router.replace("/admin/login");
      return;
    }
    const currentUser = getUser();
    if (currentUser?.role !== "super_admin") {
      router.replace("/admin");
      return;
    }
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
        <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
      </div>
    );
  }

  const totalInstitutions = ministries.reduce(
    (sum, m) => sum + m.institutionCount,
    0
  );

  return (
    <div className="min-h-screen bg-slate-100">
      {/* Top bar */}
      <header className="bg-[#0f172a] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold">
            <ShieldCheck className="h-5 w-5" />
            <span className="tracking-tight">AUTORISE</span>
            <span className="text-white/50 font-normal text-sm ml-2">
              Super Admin
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
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900">
            Platform Overview
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Manage all ministries, institutions, and administrators
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <StatCard
            icon={<Landmark className="h-5 w-5" />}
            label="Ministries"
            value={ministries.length}
          />
          <StatCard
            icon={<Building2 className="h-5 w-5" />}
            label="Institutions"
            value={totalInstitutions}
          />
          <StatCard
            icon={<Users className="h-5 w-5" />}
            label="Administrators"
            value={admins.length}
          />
        </div>

        {/* Ministries section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-900">
              Ministries
            </h2>
            <Link href="/super-admin/ministries/new">
              <Button className="bg-[#1e3a5f] hover:bg-[#152c48] text-white">
                <Plus className="h-4 w-4 mr-2" />
                Create ministry
              </Button>
            </Link>
          </div>

          {loading ? (
            <LoadingPlaceholder />
          ) : ministries.length === 0 ? (
            <EmptyCard
              title="No ministries yet"
              description="Create your first ministry to get started."
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {ministries.map((m) => (
                <Card
                  key={m.id}
                  className="p-5 bg-white border-slate-200 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <h3 className="font-semibold text-slate-900 leading-snug">
                      {m.name}
                    </h3>
                    <Badge className="bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-100">
                      {m.country.name}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-slate-600 mt-4">
                    <div className="flex items-center gap-1.5">
                      <Building2 className="h-3.5 w-3.5 text-slate-400" />
                      <span>
                        {m.institutionCount}{" "}
                        {m.institutionCount === 1
                          ? "institution"
                          : "institutions"}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Users className="h-3.5 w-3.5 text-slate-400" />
                      <span>
                        {m.adminCount}{" "}
                        {m.adminCount === 1 ? "admin" : "admins"}
                      </span>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Admins section */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-900">
              Administrators
            </h2>
            <Link href="/super-admin/admins/new">
              <Button className="bg-[#1e3a5f] hover:bg-[#152c48] text-white">
                <Plus className="h-4 w-4 mr-2" />
                Create admin
              </Button>
            </Link>
          </div>

          {loading ? (
            <LoadingPlaceholder />
          ) : admins.length === 0 ? (
            <EmptyCard
              title="No administrators yet"
              description="Create an admin to grant ministry access."
            />
          ) : (
            <Card className="bg-white border-slate-200 overflow-hidden">
              <div className="divide-y divide-slate-100">
                {admins.map((a) => (
                  <div
                    key={a.id}
                    className="p-4 flex items-center justify-between gap-4 hover:bg-slate-50"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="h-9 w-9 rounded-full bg-[#1e3a5f]/10 text-[#1e3a5f] flex items-center justify-center shrink-0">
                        <Users className="h-4 w-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="font-medium text-slate-900 truncate">
                          {a.name}
                        </div>
                        <div className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
                          <Mail className="h-3 w-3" />
                          <span className="truncate">{a.email}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      {a.role === "super_admin" ? (
                        <Badge className="bg-purple-100 text-purple-800 border-purple-200 hover:bg-purple-100">
                          Super Admin
                        </Badge>
                      ) : (
                        <div className="text-xs text-slate-600">
                          {a.ministry?.name || "No ministry"}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}

// ---------- Sub-components ----------

function StatCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
}) {
  return (
    <Card className="p-5 bg-white border-slate-200">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm font-medium text-slate-500">{label}</div>
          <div className="text-3xl font-bold mt-1 text-slate-900">
            {value}
          </div>
        </div>
        <div className="h-10 w-10 rounded-lg bg-[#1e3a5f]/10 text-[#1e3a5f] flex items-center justify-center">
          {icon}
        </div>
      </div>
    </Card>
  );
}

function EmptyCard({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <Card className="p-12 text-center bg-white border-slate-200">
      <p className="text-slate-600 font-medium mb-1">{title}</p>
      <p className="text-sm text-slate-500">{description}</p>
    </Card>
  );
}

function LoadingPlaceholder() {
  return (
    <Card className="p-12 text-center bg-white border-slate-200">
      <Loader2 className="h-6 w-6 animate-spin text-slate-400 mx-auto" />
    </Card>
  );
}