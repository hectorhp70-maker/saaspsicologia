import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { exchangeGoogleCode } from "@/actions/google-calendar.functions";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/google-callback")({
  component: GoogleCallbackPage,
});

function GoogleCallbackPage() {
  const navigate = useNavigate();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");
    const error = params.get("error");

    if (error) {
      setStatus("error");
      setMessage("Autorização negada ou cancelada.");
      return;
    }

    if (!code) {
      setStatus("error");
      setMessage("Código de autorização não encontrado.");
      return;
    }

    exchangeGoogleCode({
      data: {
        code,
        redirectUri: `${window.location.origin}/google-callback`,
      },
    })
      .then((result) => {
        setStatus("success");
        setMessage(`Google Agenda conectada: ${result.email}`);
      })
      .catch((err) => {
        setStatus("error");
        setMessage(err instanceof Error ? err.message : "Erro ao conectar.");
      });
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm text-center">
        {status === "loading" && (
          <>
            <Loader2 className="mx-auto h-10 w-10 animate-spin text-primary" />
            <p className="mt-4 text-sm text-muted-foreground">Conectando ao Google Agenda...</p>
          </>
        )}
        {status === "success" && (
          <>
            <CheckCircle2 className="mx-auto h-10 w-10 text-success" />
            <p className="mt-4 text-sm font-medium text-foreground">{message}</p>
            <Button className="mt-6" onClick={() => navigate({ to: "/configuracoes" })}>
              Ir para Configurações
            </Button>
          </>
        )}
        {status === "error" && (
          <>
            <XCircle className="mx-auto h-10 w-10 text-destructive" />
            <p className="mt-4 text-sm font-medium text-foreground">{message}</p>
            <Button
              variant="outline"
              className="mt-6"
              onClick={() => navigate({ to: "/configuracoes" })}
            >
              Voltar para Configurações
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
