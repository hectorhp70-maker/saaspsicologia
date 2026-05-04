import { createFileRoute } from "@tanstack/react-router";
import { AppLayout } from "@/components/AppLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { tarefas, nomePaciente } from "@/lib/mock-data";
import { Plus, CheckSquare } from "lucide-react";

export const Route = createFileRoute("/_authenticated/tarefas")({
  component: TarefasPage,
});

function TarefasPage() {
  const pendentes = tarefas.filter((t) => t.status !== "concluida");
  const concluidas = tarefas.filter((t) => t.status === "concluida");
  const prioColors: Record<string, string> = {
    urgente: "bg-destructive",
    alta: "bg-warning",
    media: "bg-info",
    baixa: "bg-muted-foreground/40",
  };
  const tipoLabels: Record<string, string> = {
    retorno: "Retorno",
    pendencia_clinica: "Pendência clínica",
    pendencia_administrativa: "Administrativa",
    tarefa: "Tarefa",
  };

  return (
    <AppLayout
      title="Tarefas"
      subtitle={`${pendentes.length} pendentes`}
      actions={
        <Button className="gap-1.5">
          <Plus className="h-4 w-4" />
          Nova Tarefa
        </Button>
      }
    >
      <div className="space-y-2">
        {pendentes.map((t) => (
          <div key={t.id} className="flex items-start gap-3 rounded-xl border bg-card px-4 py-3">
            <div
              className={`mt-1.5 h-2.5 w-2.5 rounded-full shrink-0 ${prioColors[t.prioridade] ?? prioColors.media}`}
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground">{t.titulo}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{t.descricao}</p>
              <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                <span>{t.responsavel}</span>
                <span>·</span>
                <span>Até {fmtDate(t.dataLimite)}</span>
                {t.pacienteId && (
                  <>
                    <span>·</span>
                    <span>{nomePaciente(t.pacienteId)}</span>
                  </>
                )}
              </div>
            </div>
            <div className="flex flex-col items-end gap-1 shrink-0">
              <Badge variant="outline" className="text-[10px] capitalize">
                {tipoLabels[t.tipo] ?? t.tipo}
              </Badge>
              <Badge variant="outline" className="text-[10px] capitalize">
                {t.prioridade}
              </Badge>
            </div>
          </div>
        ))}
      </div>
      {concluidas.length > 0 && (
        <div className="mt-6">
          <h2 className="mb-3 text-sm font-semibold text-muted-foreground flex items-center gap-2">
            <CheckSquare className="h-4 w-4" />
            Concluídas
          </h2>
          <div className="space-y-2 opacity-60">
            {concluidas.map((t) => (
              <div
                key={t.id}
                className="flex items-center gap-3 rounded-xl border bg-card px-4 py-3 line-through"
              >
                <p className="text-sm text-foreground">{t.titulo}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </AppLayout>
  );
}

function fmtDate(d: string) {
  const [y, m, day] = d.split("-");
  return `${day}/${m}/${y}`;
}
