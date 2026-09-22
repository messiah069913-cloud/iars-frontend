"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, ShieldCheck, CheckCircle2, Lock, FileCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { getMinistries, type Ministry } from "@/lib/api";

export default function HomePage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [ministry, setMinistry] = useState<string>("");
  const [ministries, setMinistries] = useState<Ministry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getMinistries()
      .then(setMinistries)
      .catch(() => setError("Impossible de charger les ministères"));
  }, []);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const params = new URLSearchParams();
    if (search.trim()) params.set("search", search.trim());
    if (ministry) params.set("ministry", ministry);

    router.push(`/search?${params.toString()}`);
  }

  return (
    <div className="flex flex-col">
      {/* Hero section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-white to-slate-50 py-16 sm:py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 bg-[#1e3a5f]/10 text-[#1e3a5f] rounded-full px-4 py-1.5 text-xs font-medium mb-6">
            <ShieldCheck className="h-3.5 w-3.5" />
            Registre officiel de vérification
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-slate-900 leading-tight">
            Vérifiez une institution
            <span className="block text-[#1e3a5f]">en toute confiance</span>
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Confirmez en quelques secondes si une institution est officiellement
            autorisée à opérer par le ministère compétent.
          </p>

          {/* Search card */}
          <Card className="mt-10 p-4 sm:p-6 bg-white shadow-lg border-slate-200 max-w-3xl mx-auto text-left">
            <form onSubmit={handleSearch} className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    type="text"
                    placeholder="Nom de l'institution..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-10 h-12 text-base"
                  />
                </div>

                <Select value={ministry} onValueChange={setMinistry}>
                  <SelectTrigger className="h-12 w-full sm:w-64 text-base">
                    <SelectValue placeholder="Tous les ministères" />
                  </SelectTrigger>
                  <SelectContent>
                    {ministries.map((m) => (
                      <SelectItem key={m.id} value={m.id}>
                        {m.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-12 bg-[#1e3a5f] hover:bg-[#152c48] text-base font-medium"
              >
                {loading ? "Recherche..." : "Rechercher une institution"}
              </Button>

              {error && (
                <p className="text-xs text-amber-600 text-center">{error}</p>
              )}
            </form>
          </Card>

          <p className="mt-4 text-xs text-slate-400">
            Aucune inscription requise — Accès libre et gratuit
          </p>
        </div>
      </section>

      {/* How it works */}
      <section className="py-16 bg-white border-t border-slate-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
              Comment ça marche
            </h2>
            <p className="mt-3 text-slate-600">
              Trois étapes pour vérifier une institution
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <FeatureCard
              icon={<Search className="h-6 w-6" />}
              title="1. Recherchez"
              description="Entrez le nom de l'institution ou sélectionnez un ministère pour filtrer les résultats."
            />
            <FeatureCard
              icon={<FileCheck className="h-6 w-6" />}
              title="2. Consultez le statut"
              description="Visualisez immédiatement si l'institution est autorisée, suspendue ou non reconnue."
            />
            <FeatureCard
              icon={<Lock className="h-6 w-6" />}
              title="3. Décidez en confiance"
              description="Utilisez ces informations officielles pour prendre une décision éclairée."
            />
          </div>
        </div>
      </section>

      {/* Trust indicators */}
      <section className="py-16 bg-slate-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-2xl bg-[#1e3a5f] text-white p-8 sm:p-12">
            <div className="flex items-start gap-4">
              <div className="hidden sm:flex h-12 w-12 items-center justify-center rounded-full bg-white/10 shrink-0">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-xl sm:text-2xl font-semibold mb-3">
                  Une source officielle
                </h3>
                <p className="text-white/80 leading-relaxed">
                  Les données affichées sur Autorise proviennent directement
                  des ministères compétents. Nous ne délivrons ni ne modifions
                  aucune autorisation. Le ministère reste l'unique autorité
                  décisionnelle.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <Card className="p-6 bg-white border-slate-200 hover:shadow-md transition-shadow">
      <div className="h-10 w-10 rounded-lg bg-[#1e3a5f]/10 text-[#1e3a5f] flex items-center justify-center mb-4">
        {icon}
      </div>
      <h3 className="font-semibold text-slate-900 mb-2">{title}</h3>
      <p className="text-sm text-slate-600 leading-relaxed">{description}</p>
    </Card>
  );
}