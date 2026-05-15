import { createFileRoute } from "@tanstack/react-router";
import { AppLayout } from "@/components/AppLayout";
import { ExcalidrawBoard } from "@/components/ExcalidrawBoard";
import { PenLine } from "lucide-react";

export const Route = createFileRoute("/_authenticated/quadro")({
  component: QuadroClinico,
});

function QuadroClinico() {
  return (
    <AppLayout>
      <div className="flex flex-col h-[calc(100vh-4rem)] -mx-4 sm:-mx-6 lg:-mx-8 -mt-6">
        <div className="flex items-center gap-3 px-4 sm:px-6 lg:px-8 py-4 border-b border-border/60 bg-card shrink-0">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/8">
            <PenLine className="h-4 w-4 text-primary" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-foreground">Quadro Clínico</h1>
            <p className="text-[11px] text-muted-foreground">
              Espaço livre para mapas, genogramas e diagramas clínicos
            </p>
          </div>
        </div>
        <div className="flex-1 min-h-0">
          <ExcalidrawBoard />
        </div>
      </div>
    </AppLayout>
  );
}
