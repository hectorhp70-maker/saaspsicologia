import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const createSessionSchema = z.object({
  patientId: z.string().uuid("ID de paciente inválido"),
  scheduledAt: z.string().min(1, "Data e horário são obrigatórios"),
  durationMinutes: z.number().int().min(10).max(120),
  sessionType: z.enum(["presencial", "online"]),
  plataformaOnline: z
    .enum(["google_meet", "zoom", "microsoft_teams", "whatsapp_video", "outra"])
    .nullable()
    .optional(),
  linkOnline: z.string().url("Link inválido").nullable().optional().or(z.literal("")),
  observacoes: z.string().max(2000).optional(),
});

export const createSession = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => createSessionSchema.parse(data))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;

    // Get user's active organization
    const { data: membership, error: memErr } = await supabase
      .from("organization_memberships")
      .select("organization_id")
      .eq("user_id", userId)
      .eq("status", "active")
      .limit(1)
      .single();

    if (memErr || !membership) {
      throw new Error("Você não pertence a nenhuma organização ativa.");
    }

    const orgId = membership.organization_id;

    // Verify patient belongs to this org
    const { data: patient, error: patErr } = await supabase
      .from("patients")
      .select("id")
      .eq("id", data.patientId)
      .eq("organization_id", orgId)
      .single();

    if (patErr || !patient) {
      throw new Error("Paciente não encontrado nesta organização.");
    }

    const { data: session, error } = await supabase
      .from("sessions")
      .insert({
        organization_id: orgId,
        patient_id: data.patientId,
        therapist_user_id: userId,
        scheduled_at: data.scheduledAt,
        duration_minutes: data.durationMinutes,
        session_type: data.sessionType,
        plataforma_online: data.sessionType === "online" ? (data.plataformaOnline ?? null) : null,
        link_online: data.sessionType === "online" ? data.linkOnline || null : null,
        observacoes: data.observacoes || null,
        status: "agendada",
      })
      .select("id")
      .single();

    if (error) {
      console.error("[createSession]", error);
      throw new Error("Erro ao criar sessão. Tente novamente.");
    }

    return { id: session.id };
  });

export const getOrgPatients = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;

    const { data: membership } = await supabase
      .from("organization_memberships")
      .select("organization_id")
      .eq("user_id", userId)
      .eq("status", "active")
      .limit(1)
      .single();

    if (!membership) return [];

    const { data: patients } = await supabase
      .from("patients")
      .select("id, nome_completo, status")
      .eq("organization_id", membership.organization_id)
      .eq("status", "ativo")
      .order("nome_completo");

    return patients ?? [];
  });
