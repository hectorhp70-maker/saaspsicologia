import { createFileRoute } from "@tanstack/react-router";
import { AppLayout } from "@/components/AppLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useEvolucaoAI } from "@/hooks/useEvolucaoAI";
import { useAudioRecorder } from "@/hooks/useAudioRecorder";
import { toast } from "sonner";
import { useState, useEffect, useCallback } from "react";
import ReactMarkdown from "react-markdown";
import {
  Plus,
  FileText,
  Loader2,
  Sparkles,
  Mic,
  MicOff,
  Square,
  Wand2,
  FileCheck,
  Save,
  ChevronDown,
  ChevronUp,
  Trash2,
  Eye,
} from "lucide-react";

export const Route = createFileRoute("/_authenticated/evolucoes")({
  component: EvolucoesPage,
});

interface Evolucao {
  id: string;
  paciente_id: string;
  data_sessao: string;
  queixa_principal: string;
  observacoes: string;
  conduta: string;
  conteudo_livre: string;
  transcricao_audio: string;
  resumo_ia: string;
  status: string;
  created_at: string;
}

interface Paciente {
  id: string;
  nombre: string;
  apellido: string;
}

function EvolucoesPage() {
  const { user } = useAuth();
  const [evolucoes, setEvolucoes] = useState<Evolucao[]>([]);
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedEvolucao, setSelectedEvolucao] = useState<Evolucao | null>(null);
  const [filtroStatus, setFiltroStatus] = useState<string>("todos");
  const [filtroPaciente, setFiltroPaciente] = useState<string>("todos");

  const fetchData = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const [evoRes, pacRes] = await Promise.all([
      supabase
        .from("evolucoes")
        .select("*")
        .eq("user_id", user.id)
        .order("data_sessao", { ascending: false }),
      supabase.from("pacientes").select("id, nombre, apellido"),
    ]);
    if (evoRes.data) setEvolucoes(evoRes.data as Evolucao[]);
    if (pacRes.data) setPacientes(pacRes.data);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filtered = evolucoes.filter((e) => {
    if (filtroStatus !== "todos" && e.status !== filtroStatus) return false;
    if (filtroPaciente !== "todos" && e.paciente_id !== filtroPaciente) return false;
    return true;
  });

  const nomePaciente = (id: string) => {
    const p = pacientes.find((p) => p.id === id);
    return p ? `${p.nombre} ${p.apellido}` : "Paciente";
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("evolucoes").delete().eq("id", id);
    if (error) {
      toast.error("Erro ao excluir evolução.");
      return;
    }
    toast.success("Evolução excluída.");
    fetchData();
  };

  return (
    <AppLayout
      title="Evoluções Clínicas"
      subtitle={`${evolucoes.length} evoluções registradas`}
      actions={
        <Button
          className="gap-1.5"
          onClick={() => {
            setSelectedEvolucao(null);
            setDialogOpen(true);
          }}
        >
          <Plus className="h-4 w-4" />
          Nova Evolução
        </Button>
      }
    >
      {/* Filtros */}
      <div className="mb-5 flex flex-wrap gap-3">
        <Select value={filtroStatus} onValueChange={setFiltroStatus}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos</SelectItem>
            <SelectItem value="rascunho">Rascunho</SelectItem>
            <SelectItem value="finalizado">Finalizado</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filtroPaciente} onValueChange={setFiltroPaciente}>
          <SelectTrigger className="w-52">
            <SelectValue placeholder="Paciente" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos os pacientes</SelectItem>
            {pacientes.map((p) => (
              <SelectItem key={p.id} value={p.id}>
                {p.nombre} {p.apellido}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-xl border-2 border-dashed bg-card py-16 text-center">
          <FileText className="mx-auto h-8 w-8 text-muted-foreground/40" />
          <p className="mt-3 text-sm text-muted-foreground">Nenhuma evolução encontrada.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((e) => (
            <EvolucaoCard
              key={e.id}
              evolucao={e}
              nomePaciente={nomePaciente(e.paciente_id)}
              onView={() => {
                setSelectedEvolucao(e);
                setViewDialogOpen(true);
              }}
              onEdit={() => {
                setSelectedEvolucao(e);
                setDialogOpen(true);
              }}
              onDelete={() => handleDelete(e.id)}
            />
          ))}
        </div>
      )}

      {/* Dialog de criação/edição */}
      <EvolucaoFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        evolucao={selectedEvolucao}
        pacientes={pacientes}
        userId={user?.id || ""}
        onSaved={fetchData}
      />

      {/* Dialog de visualização */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Evolução — {selectedEvolucao ? nomePaciente(selectedEvolucao.paciente_id) : ""}
            </DialogTitle>
          </DialogHeader>
          {selectedEvolucao && (
            <div className="space-y-4 text-sm">
              <div className="flex items-center gap-2">
                <Badge variant={selectedEvolucao.status === "finalizado" ? "default" : "secondary"}>
                  {selectedEvolucao.status === "finalizado" ? "Finalizado" : "Rascunho"}
                </Badge>
                <span className="text-muted-foreground">
                  {fmtDate(selectedEvolucao.data_sessao)}
                </span>
              </div>
              {selectedEvolucao.queixa_principal && (
                <Section title="Queixa Principal" content={selectedEvolucao.queixa_principal} />
              )}
              {selectedEvolucao.observacoes && (
                <Section title="Observações Clínicas" content={selectedEvolucao.observacoes} />
              )}
              {selectedEvolucao.conduta && (
                <Section title="Conduta / Plano" content={selectedEvolucao.conduta} />
              )}
              {selectedEvolucao.conteudo_livre && (
                <Section title="Anotações Livres" content={selectedEvolucao.conteudo_livre} />
              )}
              {selectedEvolucao.resumo_ia && (
                <div>
                  <h4 className="font-medium text-foreground flex items-center gap-1.5 mb-1">
                    <Sparkles className="h-3.5 w-3.5 text-primary" />
                    Resumo IA
                  </h4>
                  <div className="rounded-lg bg-primary/5 p-3 text-muted-foreground prose prose-sm max-w-none">
                    <ReactMarkdown>{selectedEvolucao.resumo_ia}</ReactMarkdown>
                  </div>
                </div>
              )}
              {selectedEvolucao.transcricao_audio && (
                <Section
                  title="Transcrição de Áudio"
                  content={selectedEvolucao.transcricao_audio}
                />
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}

function Section({ title, content }: { title: string; content: string }) {
  return (
    <div>
      <h4 className="font-medium text-foreground mb-1">{title}</h4>
      <p className="text-muted-foreground whitespace-pre-wrap">{content}</p>
    </div>
  );
}

function EvolucaoCard({
  evolucao,
  nomePaciente,
  onView,
  onEdit,
  onDelete,
}: {
  evolucao: Evolucao;
  nomePaciente: string;
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div className="rounded-xl border bg-card p-5 transition-shadow hover:shadow-sm">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <p className="text-sm font-semibold text-foreground">{nomePaciente}</p>
          <Badge
            variant={evolucao.status === "finalizado" ? "default" : "secondary"}
            className="text-xs"
          >
            {evolucao.status === "finalizado" ? "Finalizado" : "Rascunho"}
          </Badge>
          {evolucao.resumo_ia && (
            <Badge variant="outline" className="text-xs gap-1">
              <Sparkles className="h-3 w-3" />
              IA
            </Badge>
          )}
        </div>
        <span className="text-xs text-muted-foreground">{fmtDate(evolucao.data_sessao)}</span>
      </div>

      {evolucao.queixa_principal && (
        <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
          <span className="font-medium text-foreground">Queixa: </span>
          {evolucao.queixa_principal}
        </p>
      )}

      {expanded && (
        <div className="space-y-1.5 text-sm mb-3">
          {evolucao.observacoes && (
            <p>
              <span className="font-medium text-foreground">Observações: </span>
              <span className="text-muted-foreground">{evolucao.observacoes}</span>
            </p>
          )}
          {evolucao.conduta && (
            <p>
              <span className="font-medium text-foreground">Conduta: </span>
              <span className="text-muted-foreground">{evolucao.conduta}</span>
            </p>
          )}
        </div>
      )}

      <div className="flex items-center gap-2 mt-2">
        <Button
          variant="ghost"
          size="sm"
          className="gap-1 text-xs"
          onClick={() => setExpanded(!expanded)}
        >
          {expanded ? (
            <ChevronUp className="h-3.5 w-3.5" />
          ) : (
            <ChevronDown className="h-3.5 w-3.5" />
          )}
          {expanded ? "Menos" : "Mais"}
        </Button>
        <Button variant="ghost" size="sm" className="gap-1 text-xs" onClick={onView}>
          <Eye className="h-3.5 w-3.5" />
          Ver
        </Button>
        <Button variant="ghost" size="sm" className="gap-1 text-xs" onClick={onEdit}>
          <FileCheck className="h-3.5 w-3.5" />
          Editar
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="gap-1 text-xs text-destructive hover:text-destructive"
          onClick={onDelete}
        >
          <Trash2 className="h-3.5 w-3.5" />
          Excluir
        </Button>
      </div>
    </div>
  );
}

/* ========== FORM DIALOG ========== */
function EvolucaoFormDialog({
  open,
  onOpenChange,
  evolucao,
  pacientes,
  userId,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  evolucao: Evolucao | null;
  pacientes: Paciente[];
  userId: string;
  onSaved: () => void;
}) {
  const isEdit = !!evolucao;
  const [pacienteId, setPacienteId] = useState(evolucao?.paciente_id || "");
  const [dataSessao, setDataSessao] = useState(
    evolucao?.data_sessao || new Date().toISOString().slice(0, 10),
  );
  const [queixa, setQueixa] = useState(evolucao?.queixa_principal || "");
  const [observacoes, setObservacoes] = useState(evolucao?.observacoes || "");
  const [conduta, setConduta] = useState(evolucao?.conduta || "");
  const [conteudoLivre, setConteudoLivre] = useState(evolucao?.conteudo_livre || "");
  const [transcricao, setTranscricao] = useState(evolucao?.transcricao_audio || "");
  const [resumoIA, setResumoIA] = useState(evolucao?.resumo_ia || "");
  const [status, setStatus] = useState(evolucao?.status || "rascunho");
  const [saving, setSaving] = useState(false);
  const [showAI, setShowAI] = useState(false);

  const ai = useEvolucaoAI();
  const recorder = useAudioRecorder();

  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      setPacienteId(evolucao?.paciente_id || "");
      setDataSessao(evolucao?.data_sessao || new Date().toISOString().slice(0, 10));
      setQueixa(evolucao?.queixa_principal || "");
      setObservacoes(evolucao?.observacoes || "");
      setConduta(evolucao?.conduta || "");
      setConteudoLivre(evolucao?.conteudo_livre || "");
      setTranscricao(evolucao?.transcricao_audio || "");
      setResumoIA(evolucao?.resumo_ia || "");
      setStatus(evolucao?.status || "rascunho");
      setShowAI(false);
    }
  }, [open, evolucao]);

  const handleSave = async () => {
    if (!pacienteId) {
      toast.error("Selecione um paciente.");
      return;
    }
    setSaving(true);

    const payload = {
      user_id: userId,
      paciente_id: pacienteId,
      data_sessao: dataSessao,
      queixa_principal: queixa,
      observacoes,
      conduta,
      conteudo_livre: conteudoLivre,
      transcricao_audio: transcricao,
      resumo_ia: resumoIA,
      status,
    };

    let error;
    if (isEdit) {
      ({ error } = await supabase.from("evolucoes").update(payload).eq("id", evolucao!.id));
    } else {
      ({ error } = await supabase.from("evolucoes").insert(payload));
    }

    setSaving(false);
    if (error) {
      toast.error("Erro ao salvar evolução.");
      console.error(error);
      return;
    }
    toast.success(isEdit ? "Evolução atualizada!" : "Evolução criada!");
    onOpenChange(false);
    onSaved();
  };

  const handleSugestao = async () => {
    if (!conteudoLivre.trim()) {
      toast.error("Escreva notas no campo livre primeiro.");
      return;
    }
    const pac = pacientes.find((p) => p.id === pacienteId);
    const ctx = pac ? `Paciente: ${pac.nombre} ${pac.apellido}` : undefined;
    await ai.gerarSugestao(conteudoLivre, ctx);
  };

  const handleTemplate = async () => {
    if (!conteudoLivre.trim()) {
      toast.error("Escreva notas no campo livre primeiro.");
      return;
    }
    const result = await ai.preencherTemplate(conteudoLivre);
    if (result && typeof result === "object") {
      if (result.queixa_principal) setQueixa(result.queixa_principal);
      if (result.observacoes) setObservacoes(result.observacoes);
      if (result.conduta) setConduta(result.conduta);
      toast.success("Campos preenchidos pela IA!");
    }
  };

  const handleTranscricaoAI = async () => {
    if (!transcricao.trim()) {
      toast.error("Nenhuma transcrição para processar.");
      return;
    }
    const result = await ai.processarTranscricao(transcricao);
    if (result && typeof result === "object") {
      if (result.queixa_principal) setQueixa(result.queixa_principal);
      if (result.observacoes) setObservacoes(result.observacoes);
      if (result.conduta) setConduta(result.conduta);
      if (result.resumo) setResumoIA(result.resumo);
      toast.success("Transcrição processada pela IA!");
    }
  };

  const handleResumo = async () => {
    const texto = [queixa, observacoes, conduta].filter(Boolean).join("\n\n");
    if (!texto.trim()) {
      toast.error("Preencha os campos primeiro.");
      return;
    }
    await ai.gerarResumo(texto);
  };

  // When AI finishes generating, set the resumo
  useEffect(() => {
    if (!ai.gerando && ai.textoGerado) {
      setResumoIA(ai.textoGerado);
    }
  }, [ai.gerando, ai.textoGerado]);

  const handleToggleGravacao = async () => {
    if (recorder.gravando) {
      await recorder.pararGravacao();
      toast.info(
        "Gravação de áudio parada. A transcrição de áudio em tempo real requer integração com serviço de Speech-to-Text. Por enquanto, cole a transcrição manualmente.",
      );
    } else {
      await recorder.iniciarGravacao();
    }
  };

  const fmtDuracao = (s: number) =>
    `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Editar Evolução" : "Nova Evolução Clínica"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Paciente + Data */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Paciente</label>
              <Select value={pacienteId} onValueChange={setPacienteId}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o paciente" />
                </SelectTrigger>
                <SelectContent>
                  {pacientes.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.nombre} {p.apellido}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Data da Sessão</label>
              <Input
                type="date"
                value={dataSessao}
                onChange={(e) => setDataSessao(e.target.value)}
              />
            </div>
          </div>

          {/* Conteúdo livre + IA */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Anotações Livres</label>
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5 text-xs"
                onClick={() => setShowAI(!showAI)}
              >
                <Sparkles className="h-3.5 w-3.5" />
                {showAI ? "Ocultar IA" : "Assistente IA"}
              </Button>
            </div>
            <Textarea
              placeholder="Escreva notas livres, palavras-chave ou observações rápidas da sessão..."
              value={conteudoLivre}
              onChange={(e) => setConteudoLivre(e.target.value)}
              rows={4}
            />
          </div>

          {/* Painel IA */}
          {showAI && (
            <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 space-y-3">
              <h4 className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                <Sparkles className="h-4 w-4 text-primary" />
                Assistente IA
              </h4>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5 text-xs"
                  onClick={handleSugestao}
                  disabled={ai.gerando}
                >
                  <Wand2 className="h-3.5 w-3.5" />
                  Sugerir Texto
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5 text-xs"
                  onClick={handleTemplate}
                  disabled={ai.gerando}
                >
                  <FileCheck className="h-3.5 w-3.5" />
                  Preencher Campos
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5 text-xs"
                  onClick={handleResumo}
                  disabled={ai.gerando}
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  Gerar Resumo
                </Button>
                {transcricao && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1.5 text-xs"
                    onClick={handleTranscricaoAI}
                    disabled={ai.gerando}
                  >
                    <Mic className="h-3.5 w-3.5" />
                    Processar Transcrição
                  </Button>
                )}
                {ai.gerando && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="gap-1.5 text-xs"
                    onClick={ai.cancelar}
                  >
                    <Square className="h-3.5 w-3.5" />
                    Parar
                  </Button>
                )}
              </div>

              {(ai.gerando || ai.textoGerado) && (
                <div className="rounded-lg bg-card p-3 text-sm">
                  <div className="flex items-center gap-1.5 mb-2">
                    {ai.gerando && <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />}
                    <span className="text-xs font-medium text-muted-foreground">
                      {ai.gerando ? "Gerando..." : "Resultado"}
                    </span>
                  </div>
                  <div className="prose prose-sm max-w-none text-foreground">
                    <ReactMarkdown>{ai.textoGerado || ""}</ReactMarkdown>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Campos estruturados */}
          <div className="space-y-3">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Queixa Principal</label>
              <Textarea
                placeholder="Descreva a queixa principal do paciente..."
                value={queixa}
                onChange={(e) => setQueixa(e.target.value)}
                rows={2}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Observações Clínicas</label>
              <Textarea
                placeholder="Observações, humor, comportamento, aspectos relevantes..."
                value={observacoes}
                onChange={(e) => setObservacoes(e.target.value)}
                rows={3}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Conduta / Plano Terapêutico</label>
              <Textarea
                placeholder="Intervenções realizadas, encaminhamentos, próximos passos..."
                value={conduta}
                onChange={(e) => setConduta(e.target.value)}
                rows={3}
              />
            </div>
          </div>

          {/* Áudio */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium flex items-center gap-1.5">
              <Mic className="h-4 w-4" />
              Gravação de Áudio
            </label>
            <div className="flex items-center gap-3">
              <Button
                variant={recorder.gravando ? "destructive" : "outline"}
                size="sm"
                className="gap-1.5"
                onClick={handleToggleGravacao}
              >
                {recorder.gravando ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                {recorder.gravando
                  ? `Parar (${fmtDuracao(recorder.duracaoSegundos)})`
                  : "Gravar Áudio"}
              </Button>
            </div>
            <Textarea
              placeholder="Cole ou digite a transcrição do áudio aqui..."
              value={transcricao}
              onChange={(e) => setTranscricao(e.target.value)}
              rows={3}
            />
          </div>

          {/* Resumo IA */}
          {resumoIA && (
            <div className="space-y-1.5">
              <label className="text-sm font-medium flex items-center gap-1.5">
                <Sparkles className="h-4 w-4 text-primary" />
                Resumo IA
              </label>
              <div className="rounded-lg bg-primary/5 border border-primary/20 p-3 prose prose-sm max-w-none text-sm">
                <ReactMarkdown>{resumoIA}</ReactMarkdown>
              </div>
            </div>
          )}

          {/* Ações */}
          <div className="flex items-center justify-between pt-2 border-t">
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="w-36">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="rascunho">Rascunho</SelectItem>
                <SelectItem value="finalizado">Finalizado</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button className="gap-1.5" onClick={handleSave} disabled={saving}>
                {saving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                {isEdit ? "Atualizar" : "Salvar"}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function fmtDate(d: string) {
  const [y, m, day] = d.split("-");
  return `${day}/${m}/${y}`;
}
