"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Search,
  MapPin,
  CheckCircle2,
  XCircle,
  PauseCircle,
  ArrowLeft,
  FileWarning,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  getInstitutions,
  getMinistries,
  type Institution,
  type Ministry,
} from "@/lib/api";

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center">Loading...</div>}>
      <SearchContent />
    </Suspense>
  );
}

function SearchContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const initialSearch = searchParams.get("search") || "";
  const initialMinistry = searchParams.get("ministry") || "";

  const [search, setSearch] = useState(initialSearch);
  const [ministry, setMinistry] = useState<string | null>(
    initialMinistry || null
  );
  const [ministries, setMinistries] = useState<Ministry[]>([]);
  const [results, setResults] = useState<Institution[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load ministries for the filter dropdown
  useEffect(() => {
    getMinistries()
      .then(setMinistries)
      .catch(() => {});
  }, []);

  // Load search results whenever search params change
  const [suggestedResults, setSuggestedResults] = useState<Institution[]>([]);
const [suggestedMinistry, setSuggestedMinistry] = useState<string | null>(null);

useEffect(() => {
  setLoading(true);
  setError(null);
  setSuggestedResults([]);
  setSuggestedMinistry(null);

  getInstitutions({
    search: initialSearch || undefined,
    ministry: initialMinistry || undefined,
    limit: 50,
  })
    .then(async (res) => {
      setResults(res.results);
      setTotal(res.total);

      // If a ministry filter was applied and returned 0 results,
      // check if the same search matches anything in other ministries.
      if (res.total === 0 && initialMinistry && initialSearch) {
        try {
          const fallback = await getInstitutions({
            search: initialSearch,
            limit: 50,
          });

          if (fallback.total > 0) {
            setSuggestedResults(fallback.results);

            // Find the distinct ministries in the fallback results
            const uniqueMinistries = Array.from(
              new Set(fallback.results.map((r) => r.ministry.name))
            );
            setSuggestedMinistry(uniqueMinistries.join(", "));
          }
        } catch {
          // Silently ignore — we already have a valid empty state
        }
      }
    })
    .catch(() => {
      setError("Unable to reach the server. Please try again in a moment.");
      setResults([]);
      setTotal(0);
    })
    .finally(() => setLoading(false));
}, [initialSearch, initialMinistry]);

  function handleNewSearch(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (search.trim()) params.set("search", search.trim());
    if (ministry) params.set("ministry", ministry);
    router.push(`/search?${params.toString()}`);
  }

  const selectedMinistryName = ministries.find(
    (m) => m.id === initialMinistry
  )?.name;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Back link */}
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-[#1e3a5f] mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to search
      </Link>

      {/* Search summary */}
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
          {loading
            ? "Searching..."
            : `${total} institution${total === 1 ? "" : "s"} found`}
        </h1>
        <p className="mt-2 text-slate-600">
          {initialSearch && (
            <>
              for &ldquo;<strong>{initialSearch}</strong>&rdquo;
            </>
          )}
          {selectedMinistryName && (
            <>
              {" "}
              in <strong>{selectedMinistryName}</strong>
            </>
          )}
          {!initialSearch && !selectedMinistryName && "across all ministries"}
        </p>
      </div>

      {/* Refine search bar */}
      <Card className="p-4 mb-8 bg-white border-slate-200">
        <form onSubmit={handleNewSearch} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or registration number..."
              className="pl-10 h-11"
            />
          </div>
          <select
            value={ministry ?? ""}
            onChange={(e) => setMinistry(e.target.value || null)}
            className="h-11 rounded-lg border border-slate-300 bg-white px-4 text-sm outline-none focus:border-[#1e3a5f] focus:ring-2 focus:ring-[#1e3a5f]/20 cursor-pointer sm:w-56"
          >
            <option value="">All ministries</option>
            {ministries.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </select>
          <Button
            type="submit"
            className="h-11 bg-[#1e3a5f] hover:bg-[#152c48] px-6"
          >
            Search
          </Button>
        </form>
      </Card>

      {/* Results */}
      {loading ? (
        <LoadingSkeleton />
      ) : error ? (
        <ErrorState message={error} />
    ) : results.length === 0 ? (
  suggestedResults.length > 0 ? (
    <SuggestedMinistriesState
          searchTerm={initialSearch}
          currentMinistry={selectedMinistryName || ""}
          suggestedMinistry={suggestedMinistry || ""}
          results={suggestedResults}
        />
  ) : (
    <EmptyState searchTerm={initialSearch} />
  )
) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {results.map((inst) => (
            <InstitutionCard key={inst.id} institution={inst} />
          ))}
        </div>
      )}
    </div>
  );
}

// ---------- Status Badge ----------

function StatusBadge({
  status,
}: {
  status: "authorized" | "revoked" | "suspended" | "archived";
}) {
  if (status === "authorized") {
    return (
      <Badge className="bg-green-100 text-green-800 border border-green-200 hover:bg-green-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide">
        <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
        Authorized
      </Badge>
    );
  }
  if (status === "suspended") {
    return (
      <Badge className="bg-amber-100 text-amber-800 border border-amber-200 hover:bg-amber-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide">
        <PauseCircle className="h-3.5 w-3.5 mr-1" />
        Suspended
      </Badge>
    );
  }
  return (
    <Badge className="bg-red-100 text-red-800 border border-red-200 hover:bg-red-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide">
      <XCircle className="h-3.5 w-3.5 mr-1" />
      Revoked
    </Badge>
  );
}

// ---------- Institution Card ----------

function InstitutionCard({ institution }: { institution: Institution }) {
  return (
    <Link href={`/institutions/${institution.id}`} className="block">
      <Card className="p-5 bg-white border-slate-200 hover:border-[#1e3a5f]/40 hover:shadow-md transition-all h-full">
        <div className="flex items-start justify-between gap-3 mb-3">
          <h3 className="font-semibold text-slate-900 leading-snug">
            {institution.name}
          </h3>
          <StatusBadge status={institution.status} />
        </div>

        {institution.registrationNumber && (
          <p className="text-xs font-mono text-slate-500 mb-2">
            {institution.registrationNumber}
          </p>
        )}

        <div className="space-y-1.5 text-sm text-slate-600">
          <div className="flex items-center gap-1.5">
            <span className="font-medium text-slate-700">
              {institution.ministry.name}
            </span>
          </div>
          {institution.location && (
            <div className="flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5 text-slate-400" />
              <span>{institution.location}</span>
            </div>
          )}
        </div>

        <p className="mt-4 text-xs text-slate-400">
          Last verified:{" "}
          {new Date(institution.lastVerifiedAt).toLocaleDateString("en-GB", {
            day: "numeric",
            month: "short",
            year: "numeric",
          })}
        </p>
      </Card>
    </Link>
  );
}

// ---------- Empty State ----------

function EmptyState({ searchTerm }: { searchTerm: string }) {
  return (
    <Card className="p-12 text-center bg-white border-slate-200">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-amber-50 mb-4">
        <FileWarning className="h-8 w-8 text-amber-600" />
      </div>
      <h2 className="text-xl font-semibold text-slate-900 mb-2">
        No institutions found
      </h2>
      <p className="text-slate-600 max-w-md mx-auto leading-relaxed">
        {searchTerm
          ? `No authorized institution matches "${searchTerm}". This institution is not currently registered as authorized.`
          : "No institutions match your search criteria."}
      </p>
      <p className="text-sm text-slate-500 mt-4 max-w-md mx-auto">
        If you believe this institution should be registered, please contact the
        relevant ministry directly.
      </p>
      <Link href="/">
        <Button
          variant="outline"
          className="mt-6 border-slate-300 hover:bg-slate-50"
        >
          Try another search
        </Button>
      </Link>
    </Card>
  );
}

// ---------- Error State ----------

function ErrorState({ message }: { message: string }) {
  return (
    <Card className="p-12 text-center bg-white border-slate-200">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-50 mb-4">
        <XCircle className="h-8 w-8 text-red-600" />
      </div>
      <h2 className="text-xl font-semibold text-slate-900 mb-2">
        Unable to load results
      </h2>
      <p className="text-slate-600 max-w-md mx-auto">{message}</p>
    </Card>
  );
}

// ---------- Loading Skeleton ----------

function LoadingSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {[1, 2, 3, 4].map((i) => (
        <Card
          key={i}
          className="p-5 bg-white border-slate-200 animate-pulse"
        >
          <div className="h-5 bg-slate-200 rounded w-3/4 mb-3"></div>
          <div className="h-3 bg-slate-100 rounded w-1/3 mb-4"></div>
          <div className="h-3 bg-slate-100 rounded w-1/2 mb-2"></div>
          <div className="h-3 bg-slate-100 rounded w-2/3"></div>
        </Card>
      ))}
    </div>
  );
}

// ---------- Suggested Ministries State ----------

function SuggestedMinistriesState({
  searchTerm,
  currentMinistry,
  suggestedMinistry,
  results,
}: {
  searchTerm: string;
  currentMinistry: string;
  suggestedMinistry: string;
  results: Institution[];
}) {
  return (
    <div className="space-y-4">
      {/* Explanation card */}
      <Card className="p-8 bg-amber-50 border-amber-200">
        <div className="flex items-start gap-4">
          <div className="h-12 w-12 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
            <FileWarning className="h-6 w-6 text-amber-600" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-slate-900 mb-2">
              Not found in {currentMinistry}
            </h2>
            <p className="text-slate-700 leading-relaxed">
              We found <strong>{results.length}</strong>{" "}
              {results.length === 1 ? "institution" : "institutions"} matching{" "}
              <strong>&ldquo;{searchTerm}&rdquo;</strong> in other ministries
              instead — including{" "}
              <strong>{suggestedMinistry}</strong>.
            </p>
            <p className="text-sm text-slate-600 mt-3">
              If you were looking for one of these, please change your ministry
              filter above.
            </p>
          </div>
        </div>
      </Card>

      {/* Show the suggested results */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {results.slice(0, 6).map((inst) => (
          <InstitutionCard key={inst.id} institution={inst} />
        ))}
      </div>

      {results.length > 6 && (
        <p className="text-center text-sm text-slate-500 mt-4">
          + {results.length - 6} more results — try searching across all
          ministries to see them all.
        </p>
      )}
    </div>
  );
}