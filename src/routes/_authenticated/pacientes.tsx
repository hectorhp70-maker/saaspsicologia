import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useMemo, useEffect, useCallback } from "react";
import { AppLayout } from "@/components/AppLayout";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { NovoPacienteDialog } from "@/components/NovoPacienteDialog";
import { listPatients } from "@/actions/patients.functions";
import { Search, Filter, Loader2 } from "lucide-react";

export const Route = createFileRoute("/_authenticated/pacientes")({
  component: PacientesPage,
});

const statusLabels: Record<string, { label: string; className: string }> = {
  ativo: { label: "Ativo", className: "bg-success/15 text-success" },
  inativo: { label: "Inativo", className: "bg-muted text-muted-foreground" },
  alta: { label: "Alta", className: "bg-accent text-accent-foreground" },
};

interface Patient {
  id: string;
  nome_completo: string;
  cpf: string | null;
  email: string | null;
  telefone: string | null;
  status: string;
  abordagem_terapeutica: string | null;
  profissao: string | null;
  data_nascimento: string | null;
  motivo_consulta: string | null;
  created_at: string;
}

function PacientesPage() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("todos");
  const [sortBy, setSortBy] = useState<"nome" | "recente">("nome");

  const loadPatients = useCallback(async () => {
    try {
      const data = await listPatients();
      setPatients(data as Patient[]);
    } catch {
      // error handled silently
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPatients();
  }, [loadPatients]);

  const filtered = useMemo(() => {
    let list = patients.filter((p) => {
      const matchSearch =
        p.nome_completo.toLowerCase().includes(search.toLowerCase()) ||
        (p.cpf && p.cpf.includes(search)) ||
        (p.email && p.email.toLowerCase().includes(search.toLowerCase()));
      const matchStatus = filterStatus === "todos" || p.status === filterStatus;
      return matchSearch && matchStatus;
    });
    if (sortBy === "nome")
      list = list.sort((a, b) => a.nome_completo.localeCompare(b.nome_completo));
    else list = list.sort((a, b) => b.created_at.localeCompare(a.created_at));
    return list;
  }, [patients, search, filterStatus, sortBy]);

  const ativos = patients.filter((p) => p.status === "ativo").length;

  return (
    <AppLayout
      title="Pacientes"
      subtitle={`${ativos} pacientes ativos`}
      actions={<NovoPacienteDialog onCreated={loadPatients} />}
    >
      {/* Toolbar */}
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome, CPF ou e-mail..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex items-center gap-2">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="h-9 rounded-md border border-input bg-transparent px-3 text-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            <option value="todos">Todos os status</option>
            <option value="ativo">Ativos</option>
            <option value="inativo">Inativos</option>
            <option value="alta">Alta</option>
          </select>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as "nome" | "recente")}
            className="h-9 rounded-md border border-input bg-transparent px-3 text-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            <option value="nome">Ordenar por nome</option>
            <option value="recente">Mais recentes</option>
          </select>
        </div>
      </div>

      {/* Loading */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-xl border-2 border-dashed bg-card py-16 text-center">
          <Filter className="mx-auto h-8 w-8 text-muted-foreground/50" />
          <p className="mt-3 text-sm font-medium text-foreground">Nenhum paciente encontrado</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Tente ajustar os filtros ou adicione um novo paciente.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((p) => {
            const initials = p.nome_completo
              .split(" ")
              .slice(0, 2)
              .map((n) => n[0])
              .join("")
              .toUpperCase();
            const st = statusLabels[p.status] ?? statusLabels.ativo;
            return (
              <Link key={p.id} to={`/paciente/${p.id}`} className="block">
                <div className="group flex items-center gap-4 rounded-xl border bg-card p-4 transition-all hover:shadow-md hover:border-primary/20">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary/8 text-sm font-semibold text-primary">
                    {initials}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="truncate text-sm font-medium text-foreground">
                        {p.nome_completo}
                      </p>
                      <Badge variant="secondary" className={`text-[10px] ${st.className}`}>
                        {st.label}
                      </Badge>
                    </div>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {p.profissao && <>{p.profissao} · </>}
                      {p.abordagem_terapeutica && <>{p.abordagem_terapeutica} · </>}
                      {p.cpf && <>{p.cpf}</>}
                    </p>
                  </div>
                  <div className="hidden shrink-0 text-right lg:block">
                    {p.telefone && <p className="text-xs text-muted-foreground">{p.telefone}</p>}
                    {p.email && <p className="text-[10px] text-muted-foreground/60">{p.email}</p>}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </AppLayout>
  );
}
