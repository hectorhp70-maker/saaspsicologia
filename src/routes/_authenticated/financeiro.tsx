import { createFileRoute } from "@tanstack/react-router";
import { AppLayout } from "@/components/AppLayout";
import { Badge } from "@/components/ui/badge";
import { cobrancas, nomePaciente } from "@/lib/mock-data";
import { DollarSign, TrendingUp, Clock, AlertTriangle } from "lucide-react";
import { useCountUp } from "@/hooks/useCountUp";

export const Route = createFileRoute("/_authenticated/financeiro")({
  component: FinanceiroPage,
});

function FinanceiroPage() {
  const totalRecebido = cobrancas
    .filter((c) => c.status === "pago")
    .reduce((s, c) => s + c.valor, 0);
  const totalPendente = cobrancas
    .filter((c) => c.status === "pendente")
    .reduce((s, c) => s + c.valor, 0);
  const totalAtrasado = cobrancas
    .filter((c) => c.status === "atrasado")
    .reduce((s, c) => s + c.valor, 0);
  const sorted = [...cobrancas].sort((a, b) => b.dataVencimento.localeCompare(a.dataVencimento));

  const stMap: Record<string, { label: string; className: string }> = {
    pago: { label: "Pago", className: "bg-success/15 text-success" },
    pendente: { label: "Pendente", className: "bg-warning/15 text-warning-foreground" },
    atrasado: { label: "Atrasado", className: "bg-destructive/15 text-destructive" },
    cancelado: { label: "Cancelado", className: "bg-muted text-muted-foreground" },
  };

  return (
    <AppLayout title="Financeiro" subtitle="Controle de cobranças e pagamentos">
      <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <StatCard
          icon={TrendingUp}
          label="Total recebido"
          amount={totalRecebido}
          color="text-success"
          index={0}
          surge
        />
        <StatCard
          icon={Clock}
          label="Pendente"
          amount={totalPendente}
          color="text-warning"
          index={1}
        />
        <StatCard
          icon={AlertTriangle}
          label="Atrasado"
          amount={totalAtrasado}
          color="text-destructive"
          index={2}
        />
      </div>
      <div className="space-y-2">
        {sorted.map((c, i) => {
          const cs = stMap[c.status] ?? stMap.pendente;
          return (
            <div
              key={c.id}
              className="animate-surge-rise flex items-center gap-3 rounded-xl border bg-card px-4 py-3"
              style={{ animationDelay: `${160 + Math.min(i, 12) * 40}ms` }}
            >
              <DollarSign className="h-4 w-4 text-muted-foreground shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground">{nomePaciente(c.pacienteId)}</p>
                <p className="text-xs text-muted-foreground">
                  {c.metodoPagamento} · Vencimento: {fmtDate(c.dataVencimento)}
                  {c.dataPagamento ? ` · Pago: ${fmtDate(c.dataPagamento)}` : ""}
                </p>
              </div>
              <p className="text-sm font-semibold text-foreground shrink-0">
                R$ {c.valor.toFixed(2).replace(".", ",")}
              </p>
              <Badge variant="secondary" className={`text-xs shrink-0 ${cs.className}`}>
                {cs.label}
              </Badge>
            </div>
          );
        })}
      </div>
    </AppLayout>
  );
}

function StatCard({
  icon: Icon,
  label,
  amount,
  color,
  index,
  surge = false,
}: {
  icon: typeof DollarSign;
  label: string;
  amount: number;
  color: string;
  index: number;
  surge?: boolean;
}) {
  // stagger Kowalski (SaaS/dashboard): 50ms entre cards
  const entranceDelay = index * 50;
  // count-up é o "momento de assinatura": começa logo após o card aparecer
  const animated = useCountUp(amount, 850, entranceDelay + 90);

  return (
    <div
      className={`animate-surge-rise rounded-xl border bg-card p-4 ${
        surge ? "surge-sheen" : ""
      }`}
      style={{ animationDelay: `${entranceDelay}ms` }}
    >
      <div className="flex items-center gap-2">
        <Icon className={`h-4 w-4 ${color} ${surge ? "animate-surge-nudge" : ""}`} />
        <span className="text-xs font-medium text-muted-foreground">{label}</span>
      </div>
      <p className="mt-2 text-xl font-bold text-foreground tabular-nums">
        R$ {animated.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
      </p>
    </div>
  );
}

function fmtDate(d: string) {
  const [y, m, day] = d.split("-");
  return `${day}/${m}/${y}`;
}
