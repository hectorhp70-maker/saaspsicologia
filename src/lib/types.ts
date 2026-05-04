export type PlataformaOnline =
  | "google_meet"
  | "zoom"
  | "microsoft_teams"
  | "whatsapp_video"
  | "outra";

export const plataformaLabels: Record<PlataformaOnline, string> = {
  google_meet: "Google Meet",
  zoom: "Zoom",
  microsoft_teams: "Microsoft Teams",
  whatsapp_video: "WhatsApp Vídeo",
  outra: "Outra",
};

export const plataformaColors: Record<PlataformaOnline, string> = {
  google_meet: "bg-blue-100 text-blue-700",
  zoom: "bg-indigo-100 text-indigo-700",
  microsoft_teams: "bg-violet-100 text-violet-700",
  whatsapp_video: "bg-emerald-100 text-emerald-700",
  outra: "bg-muted text-muted-foreground",
};

export interface Paciente {
  id: string;
  nomeCompleto: string;
  dataNascimento: string;
  idade: number;
  cpf: string;
  telefone: string;
  email: string;
  endereco: string;
  profissao: string;
  convenio: string;
  responsavel: string;
  telefoneResponsavel: string;
  contatoEmergencia: string;
  observacoes: string;
  abordagemTerapeutica: string;
  status: "ativo" | "inativo" | "alta";
  tags: string[];
  criadoEm: string;
  modalidade: "presencial" | "online" | "hibrido";
  plataformaOnline?: PlataformaOnline;
}

export interface CasoClinico {
  id: string;
  pacienteId: string;
  abordagem: string;
  queixaPrincipal: string;
  hipoteseClinica: string;
  cid: string;
  nivelRisco: "baixo" | "medio" | "alto" | "critico";
  objetivos: string[];
  planoTerapeutico: string;
  status: "em_andamento" | "encerrado" | "pausado";
  dataInicio: string;
  dataEncerramento: string | null;
}

export interface Sessao {
  id: string;
  pacienteId: string;
  casoId: string;
  data: string;
  horario: string;
  duracao: number;
  tipo: "presencial" | "online";
  plataformaOnline?: PlataformaOnline;
  status: "agendada" | "confirmada" | "realizada" | "falta" | "cancelada" | "reagendada";
  linkOnline: string | null;
  observacoes: string;
}

export interface Evolucao {
  id: string;
  pacienteId: string;
  sessaoId: string;
  casoId: string;
  terapeutaId: string;
  data: string;
  queixa: string;
  intervencoes: string;
  observacoesClinicas: string;
  avaliacaoRisco: string;
  encaminhamentos: string;
  planoTerapeutico: string;
  evolucaoLivre: string;
  humor: string;
  proximosPassos: string;
}

export interface Cobranca {
  id: string;
  pacienteId: string;
  sessaoId: string;
  valor: number;
  status: "pago" | "pendente" | "atrasado" | "cancelado";
  metodoPagamento: string;
  dataVencimento: string;
  dataPagamento: string | null;
  observacoes: string;
}

export interface Tarefa {
  id: string;
  titulo: string;
  descricao: string;
  tipo: "retorno" | "pendencia_clinica" | "pendencia_administrativa" | "tarefa";
  prioridade: "baixa" | "media" | "alta" | "urgente";
  dataLimite: string;
  responsavel: string;
  status: "pendente" | "em_andamento" | "concluida";
  pacienteId: string | null;
}

export interface Documento {
  id: string;
  pacienteId: string;
  tipo: "anamnese" | "consentimento" | "triagem" | "relatorio" | "encaminhamento" | "anexo";
  titulo: string;
  criadoEm: string;
  status: "rascunho" | "finalizado";
}

export interface Usuario {
  id: string;
  nome: string;
  email: string;
  cargo: "psicologo" | "recepcao" | "supervisor" | "administrador";
  crp: string;
  avatar: string;
}
