import { createFileRoute } from "@tanstack/react-router";
import { AppLayout } from "@/components/AppLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { User, Shield, Lock, Calendar, Loader2, CheckCircle2, XCircle } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import {
  getGoogleAuthUrl,
  getGoogleCalendarStatus,
  disconnectGoogleCalendar,
} from "@/actions/google-calendar.functions";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/configuracoes")({
  component: ConfiguracoesPage,
});

function ConfiguracoesPage() {
  const { user } = useAuth();
  const displayName = user?.user_metadata?.full_name || user?.email || "";

  const roles = [
    { cargo: "Psicólogo", desc: "Acesso completo a prontuários, evoluções, agenda e financeiro." },
    {
      cargo: "Recepção",
      desc: "Acesso à agenda, dados cadastrais e financeiro. Sem acesso a evoluções clínicas.",
    },
    { cargo: "Supervisor", desc: "Acesso a prontuários e evoluções para supervisão clínica." },
    {
      cargo: "Administrador",
      desc: "Acesso total ao sistema, incluindo configurações e gestão de usuários.",
    },
  ];

  return (
    <AppLayout title="Configurações" subtitle="Gerencie seu perfil e preferências">
      {/* Perfil */}
      <div className="rounded-xl border bg-card p-5 mb-4">
        <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
          <User className="h-4 w-4" />
          Perfil do Profissional
        </h2>
        <div className="grid gap-3 sm:grid-cols-2 text-sm">
          <div>
            <span className="text-muted-foreground">Nome: </span>
            <span className="text-foreground">{displayName}</span>
          </div>
          <div>
            <span className="text-muted-foreground">E-mail: </span>
            <span className="text-foreground">{user?.email}</span>
          </div>
        </div>
      </div>

      {/* Google Calendar */}
      <GoogleCalendarSection />

      {/* Papéis */}
      <div className="rounded-xl border bg-card p-5 mb-4">
        <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
          <Shield className="h-4 w-4" />
          Papéis e Permissões
        </h2>
        <div className="space-y-3">
          {roles.map((r) => (
            <div key={r.cargo} className="flex items-start gap-3 rounded-lg bg-muted/50 p-3">
              <Lock className="mt-0.5 h-4 w-4 text-muted-foreground shrink-0" />
              <div>
                <p className="text-sm font-medium text-foreground">{r.cargo}</p>
                <p className="text-xs text-muted-foreground">{r.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Privacidade */}
      <div className="rounded-xl border border-accent bg-accent/30 p-5">
        <h2 className="mb-2 flex items-center gap-2 text-sm font-semibold text-accent-foreground">
          <Shield className="h-4 w-4" />
          Aviso de Privacidade e Sigilo
        </h2>
        <p className="text-sm text-accent-foreground/80 leading-relaxed">
          Os dados clínicos armazenados neste sistema são sigilosos e protegidos pelo Código de
          Ética Profissional do Psicólogo (Resolução CFP nº 010/2005).
        </p>
      </div>
    </AppLayout>
  );
}

function GoogleCalendarSection() {
  const [status, setStatus] = useState<{ connected: boolean; email: string | null } | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchStatus = useCallback(async () => {
    try {
      const result = await getGoogleCalendarStatus();
      setStatus(result);
    } catch {
      setStatus({ connected: false, email: null });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  const handleConnect = async () => {
    setActionLoading(true);
    try {
      const redirectUri = `${window.location.origin}/google-callback`;
      const result = await getGoogleAuthUrl({ data: { redirectUri } });
      window.location.href = result.url;
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao conectar");
      setActionLoading(false);
    }
  };

  const handleDisconnect = async () => {
    setActionLoading(true);
    try {
      await disconnectGoogleCalendar();
      setStatus({ connected: false, email: null });
      toast.success("Google Agenda desconectada.");
    } catch {
      toast.error("Erro ao desconectar.");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="rounded-xl border bg-card p-5 mb-4">
      <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
        <Calendar className="h-4 w-4" />
        Integração com Google Agenda
      </h2>

      {loading ? (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Verificando conexão...
        </div>
      ) : status?.connected ? (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-success" />
            <span className="text-sm text-foreground">Conectado</span>
            {status.email && (
              <Badge variant="secondary" className="text-xs">
                {status.email}
              </Badge>
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            Seus compromissos do Google Agenda serão exibidos na seção Agenda do PSIQWELL.
          </p>
          <Button variant="outline" size="sm" onClick={handleDisconnect} disabled={actionLoading}>
            {actionLoading && <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />}
            Desconectar
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <XCircle className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Não conectado</span>
          </div>
          <p className="text-xs text-muted-foreground">
            Conecte sua conta Google para sincronizar automaticamente seus compromissos com a agenda
            do PSIQWELL.
          </p>
          <Button size="sm" onClick={handleConnect} disabled={actionLoading} className="gap-2">
            {actionLoading ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <svg className="h-3.5 w-3.5" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
            )}
            Conectar Google Agenda
          </Button>
        </div>
      )}
    </div>
  );
}
