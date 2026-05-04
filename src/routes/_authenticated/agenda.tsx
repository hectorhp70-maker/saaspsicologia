import { createFileRoute } from "@tanstack/react-router";
import { AppLayout } from "@/components/AppLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { sessoes, nomePaciente, pacientes } from "@/lib/mock-data";
import { plataformaLabels, plataformaColors } from "@/lib/types";
import { NovaSessaoDialog } from "@/components/NovaSessaoDialog";
import { Video, MapPin, ChevronLeft, ChevronRight, ExternalLink } from "lucide-react";

export const Route = createFileRoute("/_authenticated/agenda")({
  component: AgendaPage,
});

const diasSemana = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta"];
const datasWeek = ["2026-05-04", "2026-05-05", "2026-05-06", "2026-05-07", "2026-05-08"];

function AgendaPage() {
  return (
    <AppLayout
      title="Agenda"
      subtitle="Semana de 04 a 08 de maio de 2026"
      actions={<NovaSessaoDialog />}
    >
      <div className="mb-4 flex items-center gap-2">
        <Button variant="outline" size="icon" className="h-8 w-8">
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <span className="text-sm font-medium text-foreground">Maio 2026</span>
        <Button variant="outline" size="icon" className="h-8 w-8">
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
      <div className="grid gap-4 md:grid-cols-5">
        {diasSemana.map((dia, i) => {
          const dataDia = datasWeek[i];
          const sessDia = sessoes
            .filter((s) => s.data === dataDia)
            .sort((a, b) => a.horario.localeCompare(b.horario));
          const isHoje = dataDia === "2026-05-04";
          return (
            <div
              key={dia}
              className={`rounded-xl border bg-card ${isHoje ? "ring-2 ring-primary/30" : ""}`}
            >
              <div className={`border-b px-3 py-2.5 text-center ${isHoje ? "bg-primary/5" : ""}`}>
                <p className="text-xs font-medium text-muted-foreground">{dia}</p>
                <p
                  className={`text-lg font-semibold ${isHoje ? "text-primary" : "text-foreground"}`}
                >
                  {dataDia.split("-")[2]}
                </p>
              </div>
              <div className="space-y-1.5 p-2">
                {sessDia.length === 0 ? (
                  <p className="py-4 text-center text-xs text-muted-foreground">Sem sessões</p>
                ) : (
                  sessDia.map((s) => {
                    const stMap: Record<string, string> = {
                      agendada: "border-l-muted-foreground",
                      confirmada: "border-l-info",
                      realizada: "border-l-success",
                      falta: "border-l-destructive",
                    };
                    const plataforma = s.plataformaOnline;
                    return (
                      <div
                        key={s.id}
                        className={`rounded-lg border-l-[3px] bg-muted/40 p-2 ${stMap[s.status] ?? "border-l-muted"}`}
                      >
                        <p className="text-xs font-semibold text-foreground">{s.horario}</p>
                        <p className="text-xs text-foreground truncate">
                          {nomePaciente(s.pacienteId)}
                        </p>
                        <div className="mt-1 flex items-center gap-1">
                          {s.tipo === "online" ? (
                            <Video className="h-3 w-3 text-info" />
                          ) : (
                            <MapPin className="h-3 w-3 text-primary" />
                          )}
                          <span className="text-[10px] text-muted-foreground capitalize">
                            {s.tipo}
                          </span>
                        </div>
                        {s.tipo === "online" && plataforma && (
                          <div className="mt-1">
                            <Badge
                              variant="secondary"
                              className={`text-[9px] px-1.5 py-0 font-medium ${plataformaColors[plataforma]}`}
                            >
                              {plataformaLabels[plataforma]}
                            </Badge>
                          </div>
                        )}
                        {s.tipo === "online" && s.linkOnline && (
                          <a
                            href={s.linkOnline}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-1 inline-flex items-center gap-0.5 text-[9px] text-info hover:underline"
                          >
                            <ExternalLink className="h-2.5 w-2.5" />
                            Entrar
                          </a>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>
    </AppLayout>
  );
}
