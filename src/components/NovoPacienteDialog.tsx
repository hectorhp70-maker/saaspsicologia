import { useState } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import { Plus, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { createPatient } from "@/actions/patients.functions";

interface NovoPacienteDialogProps {
  onCreated: () => void;
}

export function NovoPacienteDialog({ onCreated }: NovoPacienteDialogProps) {
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [telefone, setTelefone] = useState("");
  const [cpf, setCpf] = useState("");
  const [dataNascimento, setDataNascimento] = useState("");
  const [profissao, setProfissao] = useState("");
  const [motivoConsulta, setMotivoConsulta] = useState("");
  const [abordagem, setAbordagem] = useState("");

  const resetForm = () => {
    setNome("");
    setEmail("");
    setTelefone("");
    setCpf("");
    setDataNascimento("");
    setProfissao("");
    setMotivoConsulta("");
    setAbordagem("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome.trim()) {
      toast.error("Nome é obrigatório.");
      return;
    }
    setSubmitting(true);
    try {
      await createPatient({
        data: {
          nome_completo: nome.trim(),
          email: email.trim() || undefined,
          telefone: telefone.trim() || undefined,
          cpf: cpf.trim() || undefined,
          data_nascimento: dataNascimento || undefined,
          profissao: profissao.trim() || undefined,
          motivo_consulta: motivoConsulta.trim() || undefined,
          abordagem_terapeutica: abordagem.trim() || undefined,
        },
      });
      toast.success("Paciente cadastrado com sucesso!");
      resetForm();
      setOpen(false);
      onCreated();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao cadastrar paciente.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-1.5">
          <Plus className="h-4 w-4" />
          Novo Paciente
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Cadastrar Paciente</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-1.5">
            <Label>Nome completo *</Label>
            <Input
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Nome do paciente"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>E-mail</Label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@exemplo.com"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Telefone</Label>
              <Input
                value={telefone}
                onChange={(e) => setTelefone(e.target.value)}
                placeholder="(00) 00000-0000"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>CPF</Label>
              <Input
                value={cpf}
                onChange={(e) => setCpf(e.target.value)}
                placeholder="000.000.000-00"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Data de nascimento</Label>
              <Input
                type="date"
                value={dataNascimento}
                onChange={(e) => setDataNascimento(e.target.value)}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Profissão</Label>
              <Input
                value={profissao}
                onChange={(e) => setProfissao(e.target.value)}
                placeholder="Ex: Engenheiro"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Abordagem terapêutica</Label>
              <Input
                value={abordagem}
                onChange={(e) => setAbordagem(e.target.value)}
                placeholder="Ex: TCC, Psicanálise"
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Motivo da consulta</Label>
            <Textarea
              value={motivoConsulta}
              onChange={(e) => setMotivoConsulta(e.target.value)}
              placeholder="Queixa principal ou motivo do encaminhamento"
              rows={3}
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Cadastrar
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
