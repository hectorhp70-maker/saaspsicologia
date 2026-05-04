import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { plataformaLabels, plataformaColors, type PlataformaOnline } from "@/lib/types";
import { createSession, getOrgPatients } from "@/actions/sessions.functions";
import { Plus, Video, MapPin, ExternalLink, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface OrgPatient {
  id: string;
  nome_completo: string;
  status: string;
}

export function NovaSessaoDialog({ onCreated }: { onCreated?: () => void }) {
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [patients, setPatients] = useState<OrgPatient[]>([]);
  const [loadingPatients, setLoadingPatients] = useState(false);

  const [tipo, setTipo] = useState<"presencial" | "online">("presencial");
  const [plataforma, setPlataforma] = useState<PlataformaOnline | "">("");
  const [linkOnline, setLinkOnline] = useState("");
  const [pacienteId, setPacienteId] = useState("");
  const [data, setData] = useState("");
  const [horario, setHorario] = useState("");
  const [duracao, setDuracao] = useState("50");
  const [observacoes, setObservacoes] = useState("");

  const isOnline = tipo === "online";

  const resetForm = () => {
    setTipo("presencial");
    setPlataforma("");
    setLinkOnline("");
    setPacienteId("");
    setData("");
    setHorario("");
    setDuracao("50");
    setObservacoes("");
  };

  const loadPatients = async () => {
    setLoadingPatients(true);
    try {
      const result = await getOrgPatients();
      setPatients(result as OrgPatient[]);
    } catch {
      toast.error("Erro ao carregar pacientes.");
    } finally {
      setLoadingPatients(false);
    }
  };

  useEffect(() => {
    if (open) {
      loadPatients();
    }
  }, [open]);

  const handleTipoChange = (value: "presencial" | "online") => {
    setTipo(value);
    if (value === "presencial") {
      setPlataforma("");
      setLinkOnline("");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!pacienteId || !data || !horario) {
      toast.error("Preencha todos os campos obrigatórios.");
      return;
    }

    const scheduledAt = `${data}T${horario}:00`;

    setSubmitting(true);
    try {
      await createSession({
        data: {
          patientId: pacienteId,
          scheduledAt,
          durationMinutes: Number(duracao),
          sessionType: tipo,
          plataformaOnline: isOnline && plataforma ? plataforma : null,
          linkOnline: isOnline && linkOnline ? linkOnline : null,
          observacoes: observacoes || undefined,
        },
      });
      toast.success("Sessão agendada com sucesso!");
      resetForm();
      setOpen(false);
      onCreated?.();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Erro ao agendar sessão.";
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        if (!v) resetForm();
      }}
    >
      <DialogTrigger asChild>
        <Button className="gap-1.5">
          <Plus className="h-4 w-4" />
          Nova Sessão
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Nova Sessão</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Paciente */}
          <div className="space-y-1.5">
            <Label>Paciente</Label>
            <Select value={pacienteId} onValueChange={setPacienteId}>
              <SelectTrigger>
                <SelectValue
                  placeholder={loadingPatients ? "Carregando..." : "Selecione o paciente"}
                />
              </SelectTrigger>
              <SelectContent>
                {patients.length === 0 && !loadingPatients && (
                  <p className="px-3 py-2 text-sm text-muted-foreground">
                    Nenhum paciente encontrado
                  </p>
                )}
                {patients.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.nome_completo}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Data e Horário */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Data</Label>
              <Input type="date" value={data} onChange={(e) => setData(e.target.value)} required />
            </div>
            <div className="space-y-1.5">
              <Label>Horário</Label>
              <Input
                type="time"
                value={horario}
                onChange={(e) => setHorario(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Duração */}
          <div className="space-y-1.5">
            <Label>Duração (minutos)</Label>
            <Input
              type="number"
              min={10}
              max={120}
              value={duracao}
              onChange={(e) => setDuracao(e.target.value)}
            />
          </div>

          {/* Tipo de sessão */}
          <div className="space-y-1.5">
            <Label>Modalidade</Label>
            <Select value={tipo} onValueChange={handleTipoChange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="presencial">
                  <span className="inline-flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 text-primary" />
                    Presencial
                  </span>
                </SelectItem>
                <SelectItem value="online">
                  <span className="inline-flex items-center gap-1.5">
                    <Video className="h-3.5 w-3.5 text-info" />
                    Online
                  </span>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Campos condicionais — só aparecem quando online */}
          {isOnline && (
            <>
              <div className="space-y-1.5">
                <Label>Plataforma</Label>
                <Select
                  value={plataforma}
                  onValueChange={(v) => setPlataforma(v as PlataformaOnline)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a plataforma" />
                  </SelectTrigger>
                  <SelectContent>
                    {(Object.keys(plataformaLabels) as PlataformaOnline[]).map((key) => (
                      <SelectItem key={key} value={key}>
                        {plataformaLabels[key]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {plataforma && (
                  <Badge
                    variant="secondary"
                    className={`mt-1 text-xs ${plataformaColors[plataforma]}`}
                  >
                    {plataformaLabels[plataforma]}
                  </Badge>
                )}
              </div>

              <div className="space-y-1.5">
                <Label>Link da sessão online</Label>
                <Input
                  type="url"
                  placeholder="https://meet.google.com/..."
                  value={linkOnline}
                  onChange={(e) => setLinkOnline(e.target.value)}
                />
                {linkOnline && (
                  <a
                    href={linkOnline}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-1 inline-flex items-center gap-1 text-xs text-info hover:underline"
                  >
                    <ExternalLink className="h-3 w-3" />
                    Entrar na sessão
                  </a>
                )}
              </div>
            </>
          )}

          {/* Observações */}
          <div className="space-y-1.5">
            <Label>Observações</Label>
            <Textarea
              placeholder="Observações sobre a sessão..."
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              rows={2}
            />
          </div>

          <Button type="submit" className="w-full" disabled={submitting}>
            {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
            {submitting ? "Agendando..." : "Agendar Sessão"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
