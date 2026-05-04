import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const createPatientSchema = z.object({
  nome_completo: z.string().trim().min(2, "Nome é obrigatório").max(255),
  cpf: z.string().trim().max(20).optional(),
  email: z.string().trim().email("E-mail inválido").max(255).optional().or(z.literal("")),
  telefone: z.string().trim().max(30).optional(),
  data_nascimento: z.string().optional().or(z.literal("")),
  genero: z.string().max(50).optional(),
  profissao: z.string().max(255).optional(),
  estado_civil: z.string().max(50).optional(),
  endereco: z.string().max(500).optional(),
  contato_emergencia: z.string().max(255).optional(),
  contato_emergencia_telefone: z.string().max(30).optional(),
  motivo_consulta: z.string().max(2000).optional(),
  abordagem_terapeutica: z.string().max(255).optional(),
  observacoes: z.string().max(2000).optional(),
});

async function getUserOrgId(
  supabase: { from: (table: string) => unknown },
  userId: string,
): Promise<string> {
  const { data: membership, error } = await supabase
    .from("organization_memberships")
    .select("organization_id")
    .eq("user_id", userId)
    .eq("status", "active")
    .limit(1)
    .single();

  if (error || !membership) {
    throw new Error("Você não pertence a nenhuma organização ativa.");
  }
  return membership.organization_id;
}

export const createPatient = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => createPatientSchema.parse(data))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const orgId = await getUserOrgId(supabase, userId);

    const { data: patient, error } = await supabase
      .from("patients")
      .insert({
        organization_id: orgId,
        created_by_user_id: userId,
        nome_completo: data.nome_completo,
        cpf: data.cpf || null,
        email: data.email || null,
        telefone: data.telefone || null,
        data_nascimento: data.data_nascimento || null,
        genero: data.genero || null,
        profissao: data.profissao || null,
        estado_civil: data.estado_civil || null,
        endereco: data.endereco || null,
        contato_emergencia: data.contato_emergencia || null,
        contato_emergencia_telefone: data.contato_emergencia_telefone || null,
        motivo_consulta: data.motivo_consulta || null,
        abordagem_terapeutica: data.abordagem_terapeutica || null,
        observacoes: data.observacoes || null,
        status: "ativo",
      })
      .select("id")
      .single();

    if (error) {
      console.error("[createPatient]", error);
      throw new Error("Erro ao cadastrar paciente. Tente novamente.");
    }

    return { id: patient.id };
  });

export const listPatients = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const orgId = await getUserOrgId(supabase, userId);

    const { data: patients, error } = await supabase
      .from("patients")
      .select(
        "id, nome_completo, cpf, email, telefone, status, abordagem_terapeutica, profissao, data_nascimento, motivo_consulta, created_at",
      )
      .eq("organization_id", orgId)
      .order("nome_completo");

    if (error) {
      console.error("[listPatients]", error);
      throw new Error("Erro ao carregar pacientes.");
    }

    return patients ?? [];
  });
