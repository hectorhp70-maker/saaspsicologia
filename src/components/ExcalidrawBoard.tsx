import { lazy, Suspense } from "react";
import type { ExcalidrawElement } from "@excalidraw/excalidraw/element/types";
import type { AppState, BinaryFiles } from "@excalidraw/excalidraw/types";

const Excalidraw = lazy(async () => {
  const { Excalidraw } = await import("@excalidraw/excalidraw");
  return { default: Excalidraw };
});

interface ExcalidrawBoardProps {
  initialData?: {
    elements?: readonly ExcalidrawElement[];
    appState?: Partial<AppState>;
    files?: BinaryFiles;
  };
  onChange?: (elements: readonly ExcalidrawElement[], appState: AppState, files: BinaryFiles) => void;
}

export function ExcalidrawBoard({ initialData, onChange }: ExcalidrawBoardProps) {
  return (
    <div className="h-full w-full">
      <Suspense
        fallback={
          <div className="flex h-full w-full items-center justify-center text-sm text-muted-foreground">
            Carregando quadro…
          </div>
        }
      >
        <Excalidraw
          initialData={initialData}
          onChange={onChange}
          langCode="pt-BR"
          UIOptions={{
            canvasActions: {
              saveAsImage: true,
              export: { saveFileToDisk: true },
            },
          }}
        />
      </Suspense>
    </div>
  );
}
