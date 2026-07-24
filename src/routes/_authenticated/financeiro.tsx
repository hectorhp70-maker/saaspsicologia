import { createFileRoute } from "@tanstack/react-router";
import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { AppLayout } from "@/components/AppLayout";
import { Badge } from "@/components/ui/badge";
import { cobrancas, nomePaciente } from "@/lib/mock-data";
import { DollarSign, TrendingUp, Clock, AlertTriangle } from "lucide-react";

gsap.registerPlugin(useGSAP);

const fmtBRL = (n: number) =>
  `R$ ${n.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

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

  const container = useRef<HTMLDivElement>(null);

  // Motion via GSAP (sub-skill genjutsu:gsap).
  // useGSAP roda em useLayoutEffect (sem flash de hidratação) e faz cleanup/revert.
  // gsap.matchMedia => tudo dentro só corre quando o usuário permite motion;
  // com reduced-motion, os elementos ficam no estado natural (visíveis, valor final).
  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const tl = gsap.timeline({ defaults: { ease: "power2.out" } });

        // 1. Entrada dos stat cards — recipe "Kowalski" (SaaS/dashboard) via GSAP
        tl.from(".stat-card", {
          autoAlpha: 0,
          y: 6,
          duration: 0.4,
          stagger: 0.05,
        });

        // 2. Count-up — momento de assinatura do "surto".
        //    Anima um proxy e escreve no DOM via onUpdate (nunca setState → sem re-render 60x).
        gsap.utils.toArray<HTMLElement>(".stat-value").forEach((el) => {
          const target = Number(el.dataset.value ?? 0);
          const obj = { val: 0 };
          el.textContent = fmtBRL(0);
          tl.to(
            obj,
            {
              val: target,
              duration: 0.85,
              ease: "power2.out",
              onUpdate: () => {
                el.textContent = fmtBRL(obj.val);
              },
            },
            0.15,
          );
        });

        // 3. Sheen de luz sobe uma vez pelo card de crescimento (transform + opacity only)
        tl.set(".surge-sheen", { xPercent: -130, autoAlpha: 0 }, 0);
        tl.to(
          ".surge-sheen",
          {
            keyframes: [
              { xPercent: 40, autoAlpha: 0.6, duration: 0.35 },
              { xPercent: 230, autoAlpha: 0, duration: 0.8 },
            ],
            ease: "power1.inOut",
          },
          0.35,
        );

        // 4. Linhas de cobrança — cascata (stagger 40ms)
        tl.from(
          ".bill-row",
          {
            autoAlpha: 0,
            y: 6,
            duration: 0.35,
            stagger: 0.04,
          },
          0.15,
        );
      });
    },
    { scope: container },
  );

  return (
    <AppLayout title="Financeiro" subtitle="Controle de cobranças e pagamentos">
      <div ref={container}>
        <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <StatCard
            icon={TrendingUp}
            label="Total recebido"
            amount={totalRecebido}
            color="text-success"
            surge
          />
          <StatCard icon={Clock} label="Pendente" amount={totalPendente} color="text-warning" />
          <StatCard
            icon={AlertTriangle}
            label="Atrasado"
            amount={totalAtrasado}
            color="text-destructive"
          />
        </div>
        <div className="space-y-2">
          {sorted.map((c) => {
            const cs = stMap[c.status] ?? stMap.pendente;
            return (
              <div
                key={c.id}
                className="bill-row flex items-center gap-3 rounded-xl border bg-card px-4 py-3"
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
      </div>
    </AppLayout>
  );
}

function StatCard({
  icon: Icon,
  label,
  amount,
  color,
  surge = false,
}: {
  icon: typeof DollarSign;
  label: string;
  amount: number;
  color: string;
  surge?: boolean;
}) {
  return (
    <div className={`stat-card relative overflow-hidden rounded-xl border bg-card p-4`}>
      {surge && (
        <span
          aria-hidden
          className="surge-sheen pointer-events-none absolute inset-y-0 -left-1/4 -right-1/4 -skew-x-12 opacity-0"
          style={{
            background:
              "linear-gradient(100deg, transparent 20%, color-mix(in oklch, var(--success) 32%, transparent) 50%, transparent 80%)",
          }}
        />
      )}
      <div className="relative flex items-center gap-2">
        <Icon className={`h-4 w-4 ${color}`} />
        <span className="text-xs font-medium text-muted-foreground">{label}</span>
      </div>
      <p
        className="stat-value relative mt-2 text-xl font-bold text-foreground tabular-nums"
        data-value={amount}
      >
        {fmtBRL(amount)}
      </p>
    </div>
  );
}

function fmtDate(d: string) {
  const [y, m, day] = d.split("-");
  return `${day}/${m}/${y}`;
}
