import { jsPDF } from "jspdf";
import type { Paciente, CasoClinico, Sessao, Evolucao, Cobranca } from "@/lib/types";
import { plataformaLabels } from "@/lib/types";

interface ProntuarioData {
  paciente: Paciente;
  casos: CasoClinico[];
  sessoes: Sessao[];
  evolucoes: Evolucao[];
  cobrancas: Cobranca[];
  terapeuta: string;
}

function formatDateBR(d: string) {
  const [y, m, day] = d.split("-");
  return `${day}/${m}/${y}`;
}

export function gerarProntuarioPDF({
  paciente,
  casos,
  sessoes,
  evolucoes,
  cobrancas,
  terapeuta,
}: ProntuarioData) {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const marginLeft = 20;
  const marginRight = 20;
  const contentWidth = pageWidth - marginLeft - marginRight;
  let y = 20;

  const checkPage = (needed: number) => {
    if (y + needed > 270) {
      doc.addPage();
      y = 20;
    }
  };

  const addTitle = (text: string) => {
    checkPage(14);
    doc.setFillColor(30, 70, 90);
    doc.rect(marginLeft, y, contentWidth, 8, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text(text.toUpperCase(), marginLeft + 3, y + 5.5);
    doc.setTextColor(40, 40, 40);
    y += 12;
  };

  const addField = (label: string, value: string) => {
    checkPage(7);
    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(100, 100, 100);
    doc.text(label + ":", marginLeft + 2, y);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(40, 40, 40);
    doc.text(value || "—", marginLeft + 2 + doc.getTextWidth(label + ": "), y);
    y += 5;
  };

  const addWrappedField = (label: string, value: string) => {
    checkPage(12);
    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(100, 100, 100);
    doc.text(label + ":", marginLeft + 2, y);
    y += 4;
    doc.setFont("helvetica", "normal");
    doc.setTextColor(40, 40, 40);
    const lines = doc.splitTextToSize(value || "—", contentWidth - 4);
    checkPage(lines.length * 4);
    doc.text(lines, marginLeft + 2, y);
    y += lines.length * 4 + 2;
  };

  // Header
  doc.setFillColor(30, 70, 90);
  doc.rect(0, 0, pageWidth, 28, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("PRONTUÁRIO CLÍNICO", marginLeft, 14);
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text(
    `Gerado em ${new Date().toLocaleDateString("pt-BR")} às ${new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}`,
    marginLeft,
    22,
  );
  doc.text(
    `Terapeuta: ${terapeuta}`,
    pageWidth - marginRight - doc.getTextWidth(`Terapeuta: ${terapeuta}`),
    22,
  );
  y = 36;

  // Dados do Paciente
  addTitle("Dados do Paciente");
  addField("Nome completo", paciente.nomeCompleto);
  addField(
    "Data de nascimento",
    formatDateBR(paciente.dataNascimento) + ` (${paciente.idade} anos)`,
  );
  addField("CPF", paciente.cpf);
  addField("Telefone", paciente.telefone);
  addField("E-mail", paciente.email || "—");
  addField("Endereço", paciente.endereco);
  addField("Profissão", paciente.profissao);
  addField("Convênio", paciente.convenio);
  addField("Abordagem terapêutica", paciente.abordagemTerapeutica || "—");
  const modalidadeLabel =
    paciente.modalidade === "online"
      ? "Online"
      : paciente.modalidade === "hibrido"
        ? "Híbrido"
        : "Presencial";
  addField(
    "Modalidade",
    modalidadeLabel +
      (paciente.plataformaOnline ? ` (${plataformaLabels[paciente.plataformaOnline]})` : ""),
  );
  addField(
    "Status",
    paciente.status === "ativo" ? "Ativo" : paciente.status === "inativo" ? "Inativo" : "Alta",
  );
  if (paciente.contatoEmergencia) addField("Contato de emergência", paciente.contatoEmergencia);
  if (paciente.responsavel)
    addField("Responsável", `${paciente.responsavel} — ${paciente.telefoneResponsavel}`);
  if (paciente.observacoes) addWrappedField("Observações", paciente.observacoes);
  if (paciente.tags.length > 0) addField("Tags", paciente.tags.join(", "));
  y += 4;

  // Casos Clínicos
  if (casos.length > 0) {
    addTitle("Casos Clínicos");
    casos.forEach((c, i) => {
      checkPage(30);
      doc.setFontSize(9);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(30, 70, 90);
      doc.text(`Caso ${i + 1}: ${c.abordagem}`, marginLeft + 2, y);
      y += 5;
      doc.setTextColor(40, 40, 40);
      addField("Queixa principal", c.queixaPrincipal);
      addField("Hipótese clínica", c.hipoteseClinica);
      if (c.cid) addField("CID", c.cid);
      addField("Nível de risco", c.nivelRisco);
      addField("Status", c.status.replace("_", " "));
      addField("Data de início", formatDateBR(c.dataInicio));
      addWrappedField("Plano terapêutico", c.planoTerapeutico);
      if (c.objetivos.length > 0) {
        addWrappedField(
          "Objetivos terapêuticos",
          c.objetivos.map((o, j) => `${j + 1}. ${o}`).join("\n"),
        );
      }
      y += 3;
    });
  }

  // Sessões
  if (sessoes.length > 0) {
    addTitle(`Sessões (${sessoes.length})`);
    const sortedSessoes = [...sessoes].sort((a, b) => a.data.localeCompare(b.data));
    sortedSessoes.forEach((s) => {
      checkPage(8);
      const statusLabel: Record<string, string> = {
        agendada: "Agendada",
        confirmada: "Confirmada",
        realizada: "Realizada",
        falta: "Falta",
        cancelada: "Cancelada",
        reagendada: "Reagendada",
      };
      const line = `${formatDateBR(s.data)} ${s.horario} — ${s.tipo === "online" ? "Online" : "Presencial"} — ${s.duracao}min — ${statusLabel[s.status] ?? s.status}`;
      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");
      doc.text(line, marginLeft + 2, y);
      y += 5;
    });
    y += 3;
  }

  // Evoluções
  if (evolucoes.length > 0) {
    addTitle(`Evoluções (${evolucoes.length})`);
    const sortedEvol = [...evolucoes].sort((a, b) => a.data.localeCompare(b.data));
    sortedEvol.forEach((e, i) => {
      checkPage(25);
      doc.setFontSize(9);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(30, 70, 90);
      doc.text(`Sessão de ${formatDateBR(e.data)} — Humor: ${e.humor}`, marginLeft + 2, y);
      y += 5;
      doc.setTextColor(40, 40, 40);
      addWrappedField("Queixa", e.queixa);
      addWrappedField("Intervenções", e.intervencoes);
      addWrappedField("Observações clínicas", e.observacoesClinicas);
      if (e.avaliacaoRisco) addField("Avaliação de risco", e.avaliacaoRisco);
      if (e.encaminhamentos) addField("Encaminhamentos", e.encaminhamentos);
      addWrappedField("Próximos passos", e.proximosPassos);
      // separator
      if (i < sortedEvol.length - 1) {
        checkPage(4);
        doc.setDrawColor(200, 200, 200);
        doc.line(marginLeft + 2, y, pageWidth - marginRight - 2, y);
        y += 4;
      }
    });
    y += 3;
  }

  // Financeiro
  if (cobrancas.length > 0) {
    addTitle("Financeiro");
    const sortedCob = [...cobrancas].sort((a, b) =>
      a.dataVencimento.localeCompare(b.dataVencimento),
    );
    const statusLabels: Record<string, string> = {
      pago: "Pago",
      pendente: "Pendente",
      atrasado: "Atrasado",
      cancelado: "Cancelado",
    };
    sortedCob.forEach((c) => {
      checkPage(6);
      const valor = `R$ ${c.valor.toFixed(2).replace(".", ",")}`;
      const line = `${formatDateBR(c.dataVencimento)} — ${valor} — ${c.metodoPagamento} — ${statusLabels[c.status] ?? c.status}`;
      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");
      doc.text(line, marginLeft + 2, y);
      y += 5;
    });
  }

  // Footer on each page
  const totalPages = doc.getNumberOfPages();
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p);
    doc.setFontSize(7);
    doc.setTextColor(150, 150, 150);
    doc.setFont("helvetica", "italic");
    doc.text(
      "Documento confidencial — uso exclusivo do profissional responsável.",
      marginLeft,
      287,
    );
    doc.text(`Página ${p} de ${totalPages}`, pageWidth - marginRight - 20, 287);
  }

  doc.save(`prontuario_${paciente.nomeCompleto.replace(/\s+/g, "_").toLowerCase()}.pdf`);
}
