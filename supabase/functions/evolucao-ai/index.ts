import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `Você é um assistente de psicologia clínica para o sistema PSIQWELL.
Sua função é ajudar psicólogos no registro de evoluções clínicas.

Regras:
- Use linguagem técnica e profissional de psicologia
- Mantenha sigilo e ética profissional
- Nunca invente dados — apenas organize e sugira com base no que foi fornecido
- Escreva sempre em português brasileiro
- Use terminologia do CID/DSM quando apropriado
- Seja conciso e objetivo

Quando receber um tipo de tarefa:
- "sugestao": Gere uma sugestão de texto para evolução clínica baseada nas notas/palavras-chave fornecidas
- "template": Preencha os campos estruturados (queixa_principal, observacoes, conduta) a partir do texto livre fornecido
- "transcricao": Organize e formate a transcrição de áudio em uma evolução clínica estruturada
- "resumo": Crie um resumo clínico da evolução`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { tipo, conteudo, contexto_paciente } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    let userPrompt = "";

    switch (tipo) {
      case "sugestao":
        userPrompt = `Com base nas seguintes notas/palavras-chave do psicólogo, gere uma sugestão de texto para evolução clínica:\n\n${conteudo}\n\n${contexto_paciente ? `Contexto do paciente: ${contexto_paciente}` : ""}`;
        break;
      case "template":
        userPrompt = `A partir do seguinte texto livre, extraia e organize nos campos estruturados de uma evolução clínica. Responda EXCLUSIVAMENTE em JSON com as chaves: queixa_principal, observacoes, conduta.\n\nTexto:\n${conteudo}`;
        break;
      case "transcricao":
        userPrompt = `Organize a seguinte transcrição de áudio de sessão em formato de evolução clínica estruturada. Responda EXCLUSIVAMENTE em JSON com as chaves: queixa_principal, observacoes, conduta, resumo.\n\nTranscrição:\n${conteudo}`;
        break;
      case "resumo":
        userPrompt = `Crie um resumo clínico conciso da seguinte evolução:\n\n${conteudo}`;
        break;
      default:
        userPrompt = conteudo;
    }

    const useJson = tipo === "template" || tipo === "transcricao";

    const body: Record<string, unknown> = {
      model: "google/gemini-3-flash-preview",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userPrompt },
      ],
      stream: true,
    };

    if (useJson) {
      // For structured output, don't stream — parse JSON response
      body.stream = false;
      const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        if (response.status === 429) {
          return new Response(
            JSON.stringify({
              error: "Limite de requisições excedido. Tente novamente em alguns instantes.",
            }),
            { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } },
          );
        }
        if (response.status === 402) {
          return new Response(
            JSON.stringify({
              error: "Créditos de IA esgotados. Adicione créditos nas configurações.",
            }),
            { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } },
          );
        }
        const t = await response.text();
        console.error("AI gateway error:", response.status, t);
        return new Response(JSON.stringify({ error: "Erro no serviço de IA" }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content || "";

      // Try to extract JSON from the response
      let parsed = null;
      try {
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          parsed = JSON.parse(jsonMatch[0]);
        }
      } catch {
        // If JSON parsing fails, return raw content
      }

      return new Response(JSON.stringify({ resultado: parsed || content }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Stream for sugestao and resumo
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({
            error: "Limite de requisições excedido. Tente novamente em alguns instantes.",
          }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({
            error: "Créditos de IA esgotados. Adicione créditos nas configurações.",
          }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "Erro no serviço de IA" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("evolucao-ai error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Erro desconhecido" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
