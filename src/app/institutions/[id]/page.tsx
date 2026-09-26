"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  MapPin,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  PauseCircle,
  Calendar,
  Building2,
  FileText,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getInstitution, type Institution } from "@/lib/api";

export default function InstitutionDetailPage() {
  const params = useParams();
  const id = params?.id as string;

  const [institution, setInstitution] = useState<Institution | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setError(null);

    getInstitution(id)
      .then(setInstitution)
      .catch(() => {
        setError("not_found");
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return <LoadingState />;
  }

  if (error === "not_found" || !institution) {
    return <NotFoundState />;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Link
        href="/search"
        className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-[#1e3a5f] mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to search
      </Link>

      <StatusBanner status={institution.status} />

      {/* Institution name and registration number */}
      <div className="mt-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 leading-tight">
          {institution.name}
        </h1>
        {institution.registrationNumber && (
          <p className="mt-2 text-sm font-mono text-slate-500">
            Registration No: {institution.registrationNumber}
          </p>
        )}
      </div>

      {/* Details grid */}
      <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <DetailItem
          icon={<Building2 className="h-4 w-4" />}
          label="Authorizing Ministry"
          value={institution.ministry.name}
        />
        <DetailItem
          icon={<MapPin className="h-4 w-4" />}
          label="Location"
          value={institution.location || "Not specified"}
        />
        <DetailItem
          icon={<Calendar className="h-4 w-4" />}
          label="Authorized Since"
          value={
            institution.authorizedAt
              ? formatDate(institution.authorizedAt)
              : "Not specified"
          }
        />
        <DetailItem
          icon={<ShieldCheck className="h-4 w-4" />}
          label="Last Verified"
          value={formatDate(institution.lastVerifiedAt)}
        />
      </div>

      {/* Explanation */}
      <Card className="mt-8 p-6 bg-white border-slate-200">
        <div className="flex items-start gap-4">
          <div className="h-10 w-10 rounded-lg bg-[#1e3a5f]/10 text-[#1e3a5f] flex items-center justify-center shrink-0">
            <FileText className="h-5 w-5" />
          </div>
          <div>
            <h2 className="font-semibold text-slate-900 mb-2">
              What this means
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              {statusExplanation(institution.status)}
            </p>
          </div>
        </div>
      </Card>

      {/* Disclaimer */}
      <div className="mt-6 p-4 rounded-lg bg-slate-50 border border-slate-200">
        <p className="text-xs text-slate-500 leading-relaxed">
          <strong className="text-slate-700">Disclaimer:</strong> This
          information is provided directly by {institution.ministry.name}.
          Autorise does not issue or modify authorizations. For any questions
          about this institution&apos;s status, please contact the ministry
          directly.
        </p>
      </div>

      {/* Back CTA */}
      <div className="mt-8">
        <Link href="/">
          <Button
            variant="outline"
            className="border-slate-300 hover:bg-slate-50"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Search another institution
          </Button>
        </Link>
      </div>
    </div>
  );
}

// ---------- Status Banner ----------

function StatusBanner({
  status,
}: {
  status: "authorized" | "revoked" | "suspended" | "archived";
}) {
  if (status === "authorized") {
    return (
      <div className="rounded-2xl bg-green-50 border-2 border-green-200 p-6 sm:p-8">
        <div className="flex items-start gap-4">
          <div className="h-14 w-14 rounded-full bg-green-100 flex items-center justify-center shrink-0">
            <CheckCircle2 className="h-8 w-8 text-green-600" />
          </div>
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-green-700 mb-1">
              Status
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-green-800">
              Authorized
            </div>
            <p className="mt-2 text-sm text-green-800/80 leading-relaxed max-w-2xl">
              This institution is officially authorized by the ministry to
              operate.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (status === "suspended") {
    return (
      <div className="rounded-2xl bg-amber-50 border-2 border-amber-200 p-6 sm:p-8">
        <div className="flex items-start gap-4">
          <div className="h-14 w-14 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
            <PauseCircle className="h-8 w-8 text-amber-600" />
          </div>
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-amber-700 mb-1">
              Status
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-amber-800">
              Suspended
            </div>
            <p className="mt-2 text-sm text-amber-800/80 leading-relaxed max-w-2xl">
              This institution&apos;s authorization is temporarily on hold.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-red-50 border-2 border-red-200 p-6 sm:p-8">
      <div className="flex items-start gap-4">
        <div className="h-14 w-14 rounded-full bg-red-100 flex items-center justify-center shrink-0">
          <XCircle className="h-8 w-8 text-red-600" />
        </div>
        <div>
          <div className="text-xs font-semibold uppercase tracking-wider text-red-700 mb-1">
            Status
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-red-800">
            Revoked
          </div>
          <p className="mt-2 text-sm text-red-800/80 leading-relaxed max-w-2xl">
            This institution&apos;s authorization has been withdrawn by the
            ministry.
          </p>
        </div>
      </div>
    </div>
  );
}

// ---------- Detail Item ----------

function DetailItem({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <Card className="p-4 bg-white border-slate-200">
      <div className="flex items-start gap-3">
        <div className="h-8 w-8 rounded-md bg-slate-100 text-slate-500 flex items-center justify-center shrink-0">
          {icon}
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-xs font-medium text-slate-500 uppercase tracking-wide">
            {label}
          </div>
          <div className="mt-1 font-medium text-slate-900 break-words">
            {value}
          </div>
        </div>
      </div>
    </Card>
  );
}

// ---------- Loading State ----------

function LoadingState() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="h-40 bg-slate-100 rounded-2xl animate-pulse mb-8"></div>
      <div className="h-10 bg-slate-200 rounded w-3/4 animate-pulse mb-3"></div>
      <div className="h-4 bg-slate-100 rounded w-1/3 animate-pulse mb-8"></div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="h-20 bg-slate-100 rounded-lg animate-pulse"
          ></div>
        ))}
      </div>
    </div>
  );
}

// ---------- Not Found State ----------

function NotFoundState() {
  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-amber-50 mb-6">
        <AlertTriangle className="h-8 w-8 text-amber-600" />
      </div>
      <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-3">
        Not recognized
      </h1>
      <p className="text-slate-600 max-w-lg mx-auto leading-relaxed">
        This institution is not registered as authorized in our system. If it
        claims to be authorized, please contact the relevant ministry directly
        to verify.
      </p>
      <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
        <Link href="/">
          <Button className="bg-[#1e3a5f] hover:bg-[#152c48]">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to search
          </Button>
        </Link>
      </div>
    </div>
  );
}

// ---------- Helpers ----------

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function statusExplanation(status: string): string {
  switch (status) {
    case "authorized":
      return "The ministry has confirmed this institution is permitted to operate. You can proceed with confidence.";
    case "suspended":
      return "The ministry has temporarily paused this institution's authorization. This may be under review. Proceed with caution and verify with the ministry directly.";
    case "revoked":
      return "The ministry has withdrawn this institution's authorization. It is not currently permitted to operate.";
    case "archived":
      return "This institution's record has been archived by the ministry. It is no longer actively registered.";
    default:
      return "No additional information is available.";
  }
}