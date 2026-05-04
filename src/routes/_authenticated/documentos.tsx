import { createFileRoute } from "@tanstack/react-router";
import { AppLayout } from "@/components/AppLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { documentos, nomePaciente } from "@/lib/mock-data";
import { Plus, FolderOpen, FileText, FileCheck, FileWarning } from "lucide-react";

export const Route = createFileRoute("/_authenticated/documentos")({
  component: DocumentosPage,
});

const tipoIcons: Record<string, typeof FileText> = {
  anamnese: FileText,
  consentimento: FileCheck,
  triagem: FileWarning,
  relatorio: FileText,
  encaminhamento: FileText,
  anexo: FolderOpen,
};

function DocumentosPage() {
  const sorted = [...documentos].sort((a, b) => b.criadoEm.localeCompare(a.criadoEm));
  return (
    <AppLayout
      title="Documentos"
      subtitle={`${documentos.length} documentos`}
      actions={
        <Button className="gap-1.5">
          <Plus className="h-4 w-4" />
          Novo Documento
        </Button>
      }
    >
      <div className="space-y-2">
        {sorted.map((d) => {
          const Icon = tipoIcons[d.tipo] ?? FileText;
          return (
            <div key={d.id} className="flex items-center gap-3 rounded-xl border bg-card px-4 py-3">
              <Icon className="h-4 w-4 text-muted-foreground shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{d.titulo}</p>
                <p className="text-xs text-muted-foreground">
                  {nomePaciente(d.pacienteId)} · {d.tipo} · {fmtDate(d.criadoEm)}
                </p>
              </div>
              <Badge
                variant="outline"
                className={`text-xs capitalize ${d.status === "finalizado" ? "text-success" : "text-warning-foreground"}`}
              >
                {d.status}
              </Badge>
            </div>
          );
        })}
      </div>
    </AppLayout>
  );
}

function fmtDate(d: string) {
  const [y, m, day] = d.split("-");
  return `${day}/${m}/${y}`;
}
