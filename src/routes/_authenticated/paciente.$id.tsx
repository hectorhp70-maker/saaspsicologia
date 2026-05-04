import { createFileRoute, Link } from "@tanstack/react-router";
import { AppLayout } from "@/components/AppLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  pacientes,
  casosClinicas,
  sessoes,
  evolucoes,
  cobrancas,
  documentos,
  nomePaciente,
} from "@/lib/mock-data";
import { plataformaLabels } from "@/lib/types";
import {
  ArrowLeft,
  Phone,
  Mail,
  MapPin,
  Briefcase,
  Heart,
  AlertTriangle,
  FileText,
  Calendar,
  DollarSign,
  FolderOpen,
  Video,
  MapPinIcon,
  Clock,
  Brain,
  Monitor,
  Download,
} from "lucide-react";
import { gerarProntuarioPDF } from "@/components/ProntuarioPDF";
import { usuarioAtual } from "@/lib/mock-data";

export const Route = createFileRoute("/_authenticated/paciente/$id")({
  component: PacientePerfilPage,
});

function PacientePerfilPage() {
  const { id } = Route.useParams();
  const paciente = pacientes.find((p) => p.id === id);

  if (!paciente) {
    return (
      <AppLayout title="Paciente não encontrado">
        <p className="text-muted-foreground">O paciente solicitado não foi encontrado.</p>
        <Link to="/pacientes" className="mt-4 inline-block text-sm text-primary hover:underline">
          ← Voltar para pacientes
        </Link>
      </AppLayout>
    );
  }

  const casos = casosClinicas.filter((c) => c.pacienteId === id);
  const sessPaciente = sessoes
    .filter((s) => s.pacienteId === id)
    .sort((a, b) => b.data.localeCompare(a.data));
  const evolPaciente = evolucoes
    .filter((e) => e.pacienteId === id)
    .sort((a, b) => b.data.localeCompare(a.data));
  const cobPaciente = cobrancas.filter((c) => c.pacienteId === id);
  const docPaciente = documentos.filter((d) => d.pacienteId === id);

  const statusMap: Record<string, { label: string; className: string }> = {
    ativo: { label: "Ativo", className: "bg-success/15 text-success" },
    inativo: { label: "Inativo", className: "bg-muted text-muted-foreground" },
    alta: { label: "Alta", className: "bg-accent text-accent-foreground" },
  };
  const st = statusMap[paciente.status] ?? statusMap.ativo;

  return (
    <AppLayout>
      {/* Header */}
      <div className="mb-6">
        <Link
          to="/pacientes"
          className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Voltar para pacientes
        </Link>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-lg font-semibold text-primary">
              {paciente.nomeCompleto
                .split(" ")
                .slice(0, 2)
                .map((n) => n[0])
                .join("")}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-semibold text-foreground">{paciente.nomeCompleto}</h1>
                <Badge variant="secondary" className={st.className}>
                  {st.label}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                {paciente.idade} anos · {paciente.profissao} · {paciente.convenio}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="gap-1.5">
              <Phone className="h-3.5 w-3.5" />
              Ligar
            </Button>
            <Button variant="outline" size="sm" className="gap-1.5">
              <Mail className="h-3.5 w-3.5" />
              E-mail
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5"
              onClick={() =>
                gerarProntuarioPDF({
                  paciente,
                  casos,
                  sessoes: sessPaciente,
                  evolucoes: evolPaciente,
                  cobrancas: cobPaciente,
                  terapeuta: usuarioAtual.nome,
                })
              }
            >
              <Download className="h-3.5 w-3.5" />
              Prontuário PDF
            </Button>
            <Button size="sm" className="gap-1.5">
              <Calendar className="h-3.5 w-3.5" />
              Agendar sessão
            </Button>
          </div>
        </div>
      </div>

      <Tabs defaultValue="dados" className="w-full">
        <TabsList className="mb-4 flex flex-wrap gap-1 h-auto bg-transparent p-0">
          {[
            { value: "dados", label: "Dados cadastrais" },
            { value: "caso", label: "Caso clínico" },
            { value: "sessoes", label: "Sessões" },
            { value: "evolucoes", label: "Evoluções" },
            { value: "documentos", label: "Documentos" },
            { value: "financeiro", label: "Financeiro" },
          ].map((t) => (
            <TabsTrigger
              key={t.value}
              value={t.value}
              className="rounded-lg border border-transparent bg-transparent px-3 py-1.5 text-sm data-[state=active]:border-border data-[state=active]:bg-card data-[state=active]:shadow-sm"
            >
              {t.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {/* Dados cadastrais */}
        <TabsContent value="dados">
          <div className="grid gap-4 md:grid-cols-2">
            <InfoCard
              title="Informações Pessoais"
              items={[
                { icon: Briefcase, label: "Profissão", value: paciente.profissao },
                {
                  icon: Calendar,
                  label: "Data de nascimento",
                  value: formatDateBR(paciente.dataNascimento),
                },
                { icon: FileText, label: "CPF", value: paciente.cpf },
                { icon: Phone, label: "Telefone", value: paciente.telefone },
                { icon: Mail, label: "E-mail", value: paciente.email || "—" },
                { icon: MapPin, label: "Endereço", value: paciente.endereco },
                {
                  icon: Brain,
                  label: "Abordagem terapêutica",
                  value: paciente.abordagemTerapeutica || "—",
                },
                {
                  icon:
                    paciente.modalidade === "online"
                      ? Video
                      : paciente.modalidade === "hibrido"
                        ? Monitor
                        : MapPin,
                  label: "Modalidade",
                  value:
                    paciente.modalidade === "online"
                      ? "Online"
                      : paciente.modalidade === "hibrido"
                        ? "Híbrido"
                        : "Presencial",
                },
                ...(paciente.plataformaOnline
                  ? [
                      {
                        icon: Video,
                        label: "Plataforma online",
                        value: plataformaLabels[paciente.plataformaOnline],
                      },
                    ]
                  : []),
              ]}
            />
            <InfoCard
              title="Contatos e Convênio"
              items={[
                { icon: Heart, label: "Convênio / Plano", value: paciente.convenio },
                { icon: Phone, label: "Responsável", value: paciente.responsavel || "—" },
                {
                  icon: Phone,
                  label: "Tel. Responsável",
                  value: paciente.telefoneResponsavel || "—",
                },
                {
                  icon: AlertTriangle,
                  label: "Contato emergência",
                  value: paciente.contatoEmergencia,
                },
              ]}
            />
            {paciente.observacoes && (
              <div className="md:col-span-2 rounded-xl border bg-card p-5">
                <h3 className="mb-2 text-sm font-semibold text-foreground">Observações Iniciais</h3>
                <p className="text-sm text-muted-foreground">{paciente.observacoes}</p>
              </div>
            )}
            <div className="md:col-span-2">
              <h3 className="mb-2 text-sm font-semibold text-foreground">Tags</h3>
              <div className="flex flex-wrap gap-1.5">
                {paciente.tags.map((tag) => (
                  <Badge key={tag} variant="outline" className="capitalize">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Caso clínico */}
        <TabsContent value="caso">
          {casos.length === 0 ? (
            <EmptyTab icon={AlertTriangle} message="Nenhum caso clínico registrado." />
          ) : (
            <div className="space-y-4">
              {casos.map((c) => {
                const riscoColors: Record<string, string> = {
                  baixo: "bg-success/15 text-success",
                  medio: "bg-warning/15 text-warning-foreground",
                  alto: "bg-destructive/15 text-destructive",
                  critico: "bg-destructive text-destructive-foreground",
                };
                return (
                  <div key={c.id} className="rounded-xl border bg-card p-5">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-sm font-semibold text-foreground">{c.abordagem}</h3>
                        <p className="mt-1 text-sm text-muted-foreground">{c.queixaPrincipal}</p>
                      </div>
                      <Badge variant="secondary" className={riscoColors[c.nivelRisco] ?? ""}>
                        Risco: {c.nivelRisco}
                      </Badge>
                    </div>
                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                      <div>
                        <p className="text-xs font-medium text-muted-foreground">
                          Hipótese clínica
                        </p>
                        <p className="text-sm text-foreground">{c.hipoteseClinica}</p>
                      </div>
                      {c.cid && (
                        <div>
                          <p className="text-xs font-medium text-muted-foreground">CID</p>
                          <p className="text-sm text-foreground">{c.cid}</p>
                        </div>
                      )}
                      <div className="sm:col-span-2">
                        <p className="text-xs font-medium text-muted-foreground">
                          Plano terapêutico
                        </p>
                        <p className="text-sm text-foreground">{c.planoTerapeutico}</p>
                      </div>
                      <div className="sm:col-span-2">
                        <p className="text-xs font-medium text-muted-foreground mb-1">
                          Objetivos terapêuticos
                        </p>
                        <ul className="list-disc list-inside text-sm text-foreground space-y-0.5">
                          {c.objetivos.map((o, i) => (
                            <li key={i}>{o}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                    <div className="mt-3 flex gap-4 text-xs text-muted-foreground">
                      <span>Início: {formatDateBR(c.dataInicio)}</span>
                      <Badge variant="outline" className="text-[10px] capitalize">
                        {c.status.replace("_", " ")}
                      </Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </TabsContent>

        {/* Sessões */}
        <TabsContent value="sessoes">
          {sessPaciente.length === 0 ? (
            <EmptyTab icon={Calendar} message="Nenhuma sessão registrada." />
          ) : (
            <div className="space-y-2">
              {sessPaciente.map((s) => (
                <div
                  key={s.id}
                  className="flex items-center gap-3 rounded-xl border bg-card px-4 py-3"
                >
                  <div className="w-20 text-center">
                    <p className="text-sm font-semibold text-foreground">{formatDateBR(s.data)}</p>
                    <p className="text-xs text-muted-foreground">{s.horario}</p>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      {s.tipo === "online" ? (
                        <Video className="h-3.5 w-3.5 text-info" />
                      ) : (
                        <MapPinIcon className="h-3.5 w-3.5 text-primary" />
                      )}
                      <span className="text-sm text-foreground capitalize">{s.tipo}</span>
                      <span className="text-xs text-muted-foreground">· {s.duracao} min</span>
                    </div>
                  </div>
                  <SessaoStatusBadge status={s.status} />
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Evoluções */}
        <TabsContent value="evolucoes">
          {evolPaciente.length === 0 ? (
            <EmptyTab icon={FileText} message="Nenhuma evolução registrada." />
          ) : (
            <div className="space-y-3">
              {evolPaciente.map((e) => (
                <div key={e.id} className="rounded-xl border bg-card p-5">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-sm font-semibold text-foreground">{formatDateBR(e.data)}</p>
                    <Badge variant="outline" className="text-xs">
                      {e.humor}
                    </Badge>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="font-medium text-foreground">Queixa: </span>
                      <span className="text-muted-foreground">{e.queixa}</span>
                    </div>
                    <div>
                      <span className="font-medium text-foreground">Intervenções: </span>
                      <span className="text-muted-foreground">{e.intervencoes}</span>
                    </div>
                    <div>
                      <span className="font-medium text-foreground">Próximos passos: </span>
                      <span className="text-muted-foreground">{e.proximosPassos}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Documentos */}
        <TabsContent value="documentos">
          {docPaciente.length === 0 ? (
            <EmptyTab icon={FolderOpen} message="Nenhum documento registrado." />
          ) : (
            <div className="space-y-2">
              {docPaciente.map((d) => (
                <div
                  key={d.id}
                  className="flex items-center gap-3 rounded-xl border bg-card px-4 py-3"
                >
                  <FolderOpen className="h-4 w-4 text-muted-foreground" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">{d.titulo}</p>
                    <p className="text-xs text-muted-foreground capitalize">
                      {d.tipo} · {formatDateBR(d.criadoEm)}
                    </p>
                  </div>
                  <Badge variant="outline" className="text-xs capitalize">
                    {d.status}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Financeiro */}
        <TabsContent value="financeiro">
          {cobPaciente.length === 0 ? (
            <EmptyTab icon={DollarSign} message="Nenhuma cobrança registrada." />
          ) : (
            <div className="space-y-2">
              {cobPaciente.map((c) => {
                const stMap: Record<string, { label: string; className: string }> = {
                  pago: { label: "Pago", className: "bg-success/15 text-success" },
                  pendente: {
                    label: "Pendente",
                    className: "bg-warning/15 text-warning-foreground",
                  },
                  atrasado: { label: "Atrasado", className: "bg-destructive/15 text-destructive" },
                  cancelado: { label: "Cancelado", className: "bg-muted text-muted-foreground" },
                };
                const cs = stMap[c.status] ?? stMap.pendente;
                return (
                  <div
                    key={c.id}
                    className="flex items-center gap-3 rounded-xl border bg-card px-4 py-3"
                  >
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground">
                        R$ {c.valor.toFixed(2).replace(".", ",")}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {c.metodoPagamento} · Vencimento: {formatDateBR(c.dataVencimento)}
                      </p>
                    </div>
                    <Badge variant="secondary" className={`text-xs ${cs.className}`}>
                      {cs.label}
                    </Badge>
                  </div>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </AppLayout>
  );
}

function InfoCard({
  title,
  items,
}: {
  title: string;
  items: { icon: typeof Phone; label: string; value: string }[];
}) {
  return (
    <div className="rounded-xl border bg-card p-5">
      <h3 className="mb-3 text-sm font-semibold text-foreground">{title}</h3>
      <div className="space-y-2.5">
        {items.map((item) => (
          <div key={item.label} className="flex items-start gap-2.5">
            <item.icon className="mt-0.5 h-3.5 w-3.5 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">{item.label}</p>
              <p className="text-sm text-foreground">{item.value}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function EmptyTab({ icon: Icon, message }: { icon: typeof FileText; message: string }) {
  return (
    <div className="rounded-xl border-2 border-dashed bg-card py-12 text-center">
      <Icon className="mx-auto h-8 w-8 text-muted-foreground/40" />
      <p className="mt-2 text-sm text-muted-foreground">{message}</p>
    </div>
  );
}

function SessaoStatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; className: string }> = {
    agendada: { label: "Agendada", className: "bg-muted text-muted-foreground" },
    confirmada: { label: "Confirmada", className: "bg-accent text-accent-foreground" },
    realizada: { label: "Realizada", className: "bg-success/15 text-success" },
    falta: { label: "Falta", className: "bg-destructive/15 text-destructive" },
    cancelada: { label: "Cancelada", className: "bg-muted text-muted-foreground" },
    reagendada: { label: "Reagendada", className: "bg-warning/15 text-warning-foreground" },
  };
  const s = map[status] ?? map.agendada;
  return (
    <Badge variant="secondary" className={`text-xs ${s.className}`}>
      {s.label}
    </Badge>
  );
}

function formatDateBR(d: string) {
  const [y, m, day] = d.split("-");
  return `${day}/${m}/${y}`;
}
