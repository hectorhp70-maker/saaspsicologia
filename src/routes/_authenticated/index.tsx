import { createFileRoute, Link } from "@tanstack/react-router";
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import {
  pacientes,
  sessoes,
  evolucoes,
  cobrancas,
  tarefas,
  nomePaciente,
  casosClinicas,
} from "@/lib/mock-data";
import {
  Users,
  Calendar,
  AlertTriangle,
  DollarSign,
  TrendingUp,
  UserX,
  Plus,
  FileText,
  CreditCard,
  ArrowRight,
  Video,
  MapPin,
  Activity,
  Target,
  Flame,
} from "lucide-react";
import wellnessAbstract from "@/assets/wellness-abstract.png";

export const Route = createFileRoute("/_authenticated/")({
  component: Dashboard,
});

function Dashboard() {
  const { user } = useAuth();
  const firstName =
    (user?.user_metadata?.full_name || user?.email || "").split(" ")[0] || "Profissional";

  const pacientesAtivos = pacientes.filter((p) => p.status === "ativo").length;
  const totalPacientes = pacientes.length;
  const sessoesSemana = sessoes.filter(
    (s) => s.data >= "2026-05-04" && s.data <= "2026-05-08",
  ).length;
  const faltas = sessoes.filter((s) => s.status === "falta").length;
  const totalSessoes = sessoes.length;
  const casosAtencao = casosClinicas.filter(
    (c) => c.nivelRisco === "alto" || c.nivelRisco === "critico",
  ).length;
  const pagPendentes = cobrancas.filter(
    (c) => c.status === "pendente" || c.status === "atrasado",
  ).length;
  const faturamentoMes = cobrancas
    .filter((c) => c.status === "pago")
    .reduce((s, c) => s + c.valor, 0);
  const taxaPresenca =
    totalSessoes > 0 ? Math.round(((totalSessoes - faltas) / totalSessoes) * 100) : 100;

  const sessoesHoje = sessoes.filter((s) => s.data === "2026-05-04");
  const sessoesTerca = sessoes.filter((s) => s.data === "2026-05-05");
  const sessoesQuarta = sessoes.filter((s) => s.data === "2026-05-06");

  const evolRecentesSorted = [...evolucoes]
    .sort((a, b) => b.data.localeCompare(a.data))
    .slice(0, 4);

  const tarefasPendentes = tarefas.filter((t) => t.status !== "concluida");
  const tarefasConcluidas = tarefas.filter((t) => t.status === "concluida").length;

  return (
    <AppLayout>
      {/* Welcome banner — inspired by Kraken's CTA banner */}
      <div className="relative mb-6 overflow-hidden rounded-2xl bg-gradient-to-r from-primary/8 via-accent/10 to-primary/5 p-6 sm:p-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-light text-foreground sm:text-3xl">
              Olá, <span className="font-bold">{firstName}</span>
            </h1>
            <p className="mt-1.5 text-sm text-muted-foreground">
              Acompanhe o progresso do seu consultório
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Link to="/pacientes">
                <Button size="sm" className="gap-1.5 rounded-xl h-9 shadow-sm">
                  <Plus className="h-3.5 w-3.5" />
                  Novo paciente
                </Button>
              </Link>
              <Link to="/agenda">
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5 rounded-xl h-9 bg-card/80 backdrop-blur-sm"
                >
                  <Calendar className="h-3.5 w-3.5" />
                  Agendar sessão
                </Button>
              </Link>
            </div>
          </div>
          <img
            src={wellnessAbstract}
            alt=""
            width={120}
            height={120}
            className="hidden opacity-50 sm:block"
          />
        </div>
      </div>

      {/* Stats grid — clean card style like Kraken */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard
          label="Pacientes"
          value={pacientesAtivos}
          sub={
            <>
              de {totalPacientes} ·{" "}
              <span className="text-primary font-medium">
                {Math.round((pacientesAtivos / totalPacientes) * 100)}% ativos
              </span>
            </>
          }
          icon={<Users className="h-4 w-4" />}
          iconBg="bg-primary/8 text-primary"
          progress={(pacientesAtivos / totalPacientes) * 100}
        />
        <StatCard
          label="Sessões"
          value={sessoesSemana}
          sub="esta semana"
          icon={<Calendar className="h-4 w-4" />}
          iconBg="bg-accent/60 text-accent-foreground"
          badge={
            <>
              <Activity className="h-3 w-3 text-success" />
              <span className="text-xs text-success font-medium">{taxaPresenca}%</span>
            </>
          }
        />
        <StatCard
          label="Faturamento"
          value={`R$ ${faturamentoMes.toLocaleString("pt-BR")}`}
          sub="recebido no período"
          icon={<TrendingUp className="h-4 w-4" />}
          iconBg="bg-success/10 text-success"
          badge={
            <>
              <DollarSign className="h-3 w-3 text-warning" />
              <span className="text-xs text-warning font-medium">{pagPendentes} pendentes</span>
            </>
          }
        />
        <StatCard
          label="Atenção"
          value={casosAtencao}
          sub="casos com risco elevado"
          icon={<AlertTriangle className="h-4 w-4" />}
          iconBg="bg-destructive/10 text-destructive"
          badge={
            <>
              <UserX className="h-3 w-3 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">{faltas} faltas</span>
            </>
          }
        />
      </div>

      {/* Quick actions */}
      <div className="mt-4 flex flex-wrap gap-2">
        <Link to="/evolucoes">
          <Button variant="outline" size="sm" className="gap-1.5 rounded-xl h-9">
            <FileText className="h-3.5 w-3.5" />
            Nova evolução
          </Button>
        </Link>
        <Link to="/financeiro">
          <Button variant="outline" size="sm" className="gap-1.5 rounded-xl h-9">
            <CreditCard className="h-3.5 w-3.5" />
            Nova cobrança
          </Button>
        </Link>
      </div>

      {/* Main grid */}
      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        {/* Agenda */}
        <div className="lg:col-span-2 rounded-2xl border border-border/60 bg-card shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border/60">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/8">
                <Calendar className="h-4 w-4 text-primary" />
              </div>
              <h2 className="text-sm font-bold text-foreground">Agenda da Semana</h2>
            </div>
            <Link
              to="/agenda"
              className="text-xs font-medium text-primary hover:underline flex items-center gap-1"
            >
              Ver completa <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="divide-y divide-border/50">
            {[
              { label: "Hoje — Segunda, 04/05", items: sessoesHoje, isToday: true },
              { label: "Terça, 05/05", items: sessoesTerca, isToday: false },
              { label: "Quarta, 06/05", items: sessoesQuarta, isToday: false },
            ].map(({ label, items, isToday }) => (
              <div key={label} className="px-5 py-3">
                <div className="mb-2 flex items-center gap-2">
                  {isToday && <Flame className="h-3 w-3 text-primary" />}
                  <p
                    className={`text-xs font-bold uppercase tracking-wider ${isToday ? "text-primary" : "text-muted-foreground"}`}
                  >
                    {label}
                  </p>
                </div>
                {items.length === 0 ? (
                  <p className="text-sm text-muted-foreground/50 italic">Sem sessões agendadas</p>
                ) : (
                  <div className="space-y-1.5">
                    {items.map((s) => (
                      <div
                        key={s.id}
                        className="flex items-center gap-3 rounded-xl bg-muted/30 px-3 py-2.5 transition-colors hover:bg-muted/60"
                      >
                        <span className="text-sm font-bold text-foreground w-12 font-mono">
                          {s.horario}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">
                            {nomePaciente(s.pacienteId)}
                          </p>
                        </div>
                        <div className="flex items-center gap-1.5">
                          {s.tipo === "online" ? (
                            <Badge
                              variant="outline"
                              className="text-[10px] gap-1 rounded-lg border-border/60"
                            >
                              <Video className="h-2.5 w-2.5" />
                              Online
                            </Badge>
                          ) : (
                            <Badge
                              variant="outline"
                              className="text-[10px] gap-1 rounded-lg border-border/60"
                            >
                              <MapPin className="h-2.5 w-2.5" />
                              Presencial
                            </Badge>
                          )}
                          <SessaoStatusBadge status={s.status} />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-4">
          {/* Tarefas */}
          <div className="rounded-2xl border border-border/60 bg-card shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-border/60">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-accent/50">
                  <Target className="h-4 w-4 text-accent-foreground" />
                </div>
                <h2 className="text-sm font-bold text-foreground">Tarefas</h2>
              </div>
              <Link to="/tarefas" className="text-xs font-medium text-primary hover:underline">
                Ver todas
              </Link>
            </div>
            <div className="px-5 py-3 border-b border-border/40 bg-muted/20">
              <div className="flex items-center justify-between text-xs text-muted-foreground mb-1.5">
                <span>
                  {tarefasConcluidas} de {tarefas.length} concluídas
                </span>
                <span className="font-bold text-foreground">
                  {Math.round((tarefasConcluidas / tarefas.length) * 100)}%
                </span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-primary transition-all"
                  style={{ width: `${(tarefasConcluidas / tarefas.length) * 100}%` }}
                />
              </div>
            </div>
            <div className="divide-y divide-border/40">
              {tarefasPendentes.slice(0, 4).map((t) => (
                <div key={t.id} className="flex items-center gap-3 px-5 py-2.5">
                  <PrioridadeDot prioridade={t.prioridade} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{t.titulo}</p>
                    <p className="text-[11px] text-muted-foreground">
                      Até {formatDateBR(t.dataLimite)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Evoluções */}
          <div className="rounded-2xl border border-border/60 bg-card shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-border/60">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/8">
                  <FileText className="h-4 w-4 text-primary" />
                </div>
                <h2 className="text-sm font-bold text-foreground">Evoluções</h2>
              </div>
              <Link to="/evolucoes" className="text-xs font-medium text-primary hover:underline">
                Ver todas
              </Link>
            </div>
            <div className="divide-y divide-border/40">
              {evolRecentesSorted.map((e) => (
                <div key={e.id} className="px-5 py-3 hover:bg-muted/20 transition-colors">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-foreground">
                      {nomePaciente(e.pacienteId)}
                    </p>
                    <span className="text-[11px] text-muted-foreground">
                      {formatDateBR(e.data)}
                    </span>
                  </div>
                  <p className="mt-0.5 text-xs text-muted-foreground line-clamp-1">{e.queixa}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

/* ── Sub-components ── */

function StatCard({
  label,
  value,
  sub,
  icon,
  iconBg,
  progress,
  badge,
}: {
  label: string;
  value: string | number;
  sub: React.ReactNode;
  icon: React.ReactNode;
  iconBg: string;
  progress?: number;
  badge?: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-sm transition-all hover:shadow-md hover:border-primary/20">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
          {label}
        </span>
        <div className={`flex h-8 w-8 items-center justify-center rounded-xl ${iconBg}`}>
          {icon}
        </div>
      </div>
      <p className="mt-3 text-3xl font-bold text-foreground">{value}</p>
      <p className="mt-1 text-xs text-muted-foreground">{sub}</p>
      {progress !== undefined && (
        <div className="mt-3 h-1.5 w-full rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-primary transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
      {badge && <div className="mt-3 flex items-center gap-1.5">{badge}</div>}
    </div>
  );
}

function SessaoStatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; className: string }> = {
    agendada: { label: "Agendada", className: "bg-muted text-muted-foreground" },
    confirmada: { label: "Confirmada", className: "bg-accent text-accent-foreground" },
    realizada: { label: "Realizada", className: "bg-success/15 text-success" },
    falta: { label: "Falta", className: "bg-destructive/15 text-destructive" },
    cancelada: { label: "Cancelada", className: "bg-muted text-muted-foreground line-through" },
    reagendada: { label: "Reagendada", className: "bg-warning/15 text-warning-foreground" },
  };
  const s = map[status] ?? map.agendada;
  return (
    <Badge variant="secondary" className={`text-[10px] rounded-lg ${s.className}`}>
      {s.label}
    </Badge>
  );
}

function PrioridadeDot({ prioridade }: { prioridade: string }) {
  const colors: Record<string, string> = {
    urgente: "bg-destructive",
    alta: "bg-warning",
    media: "bg-primary",
    baixa: "bg-muted-foreground/40",
  };
  return (
    <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-lg bg-muted/40">
      <div className={`h-2 w-2 rounded-full ${colors[prioridade] ?? colors.media}`} />
    </div>
  );
}

function formatDateBR(d: string) {
  const [y, m, day] = d.split("-");
  return `${day}/${m}/${y}`;
}
