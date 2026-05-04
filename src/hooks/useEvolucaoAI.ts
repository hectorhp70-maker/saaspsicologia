import { useState, useCallback, useRef } from "react";
import { toast } from "sonner";

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/evolucao-ai`;

interface UseEvolucaoAIReturn {
  gerando: boolean;
  textoGerado: string;
  gerarSugestao: (conteudo: string, contextoPaciente?: string) => Promise<void>;
  preencherTemplate: (
    conteudo: string,
  ) => Promise<{ queixa_principal: string; observacoes: string; conduta: string } | null>;
  processarTranscricao: (conteudo: string) => Promise<{
    queixa_principal: string;
    observacoes: string;
    conduta: string;
    resumo: string;
  } | null>;
  gerarResumo: (conteudo: string) => Promise<void>;
  cancelar: () => void;
}

export function useEvolucaoAI(): UseEvolucaoAIReturn {
  const [gerando, setGerando] = useState(false);
  const [textoGerado, setTextoGerado] = useState("");
  const abortRef = useRef<AbortController | null>(null);

  const cancelar = useCallback(() => {
    abortRef.current?.abort();
    setGerando(false);
  }, []);

  const streamRequest = useCallback(
    async (tipo: string, conteudo: string, contextoPaciente?: string) => {
      abortRef.current?.abort();
      abortRef.current = new AbortController();
      setGerando(true);
      setTextoGerado("");

      let accumulated = "";

      try {
        const resp = await fetch(CHAT_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({ tipo, conteudo, contexto_paciente: contextoPaciente }),
          signal: abortRef.current.signal,
        });

        if (resp.status === 429) {
          toast.error("Limite de requisições excedido. Tente novamente em instantes.");
          return;
        }
        if (resp.status === 402) {
          toast.error("Créditos de IA esgotados.");
          return;
        }
        if (!resp.ok || !resp.body) throw new Error("Falha ao iniciar stream");

        const reader = resp.body.getReader();
        const decoder = new TextDecoder();
        let textBuffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          textBuffer += decoder.decode(value, { stream: true });

          let newlineIndex: number;
          while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
            let line = textBuffer.slice(0, newlineIndex);
            textBuffer = textBuffer.slice(newlineIndex + 1);

            if (line.endsWith("\r")) line = line.slice(0, -1);
            if (line.startsWith(":") || line.trim() === "") continue;
            if (!line.startsWith("data: ")) continue;

            const jsonStr = line.slice(6).trim();
            if (jsonStr === "[DONE]") break;

            try {
              const parsed = JSON.parse(jsonStr);
              const content = parsed.choices?.[0]?.delta?.content as string | undefined;
              if (content) {
                accumulated += content;
                setTextoGerado(accumulated);
              }
            } catch {
              textBuffer = line + "\n" + textBuffer;
              break;
            }
          }
        }
      } catch (e: unknown) {
        if (e instanceof Error && e.name === "AbortError") return;
        console.error(e);
        toast.error("Erro ao gerar texto com IA.");
      } finally {
        setGerando(false);
      }
    },
    [],
  );

  const jsonRequest = useCallback(async (tipo: string, conteudo: string) => {
    setGerando(true);
    try {
      const resp = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ tipo, conteudo }),
      });

      if (resp.status === 429) {
        toast.error("Limite de requisições excedido.");
        return null;
      }
      if (resp.status === 402) {
        toast.error("Créditos de IA esgotados.");
        return null;
      }
      if (!resp.ok) throw new Error("Erro na requisição");

      const data = await resp.json();
      return data.resultado;
    } catch (e) {
      console.error(e);
      toast.error("Erro ao processar com IA.");
      return null;
    } finally {
      setGerando(false);
    }
  }, []);

  const gerarSugestao = useCallback(
    (conteudo: string, contextoPaciente?: string) =>
      streamRequest("sugestao", conteudo, contextoPaciente),
    [streamRequest],
  );

  const gerarResumo = useCallback(
    (conteudo: string) => streamRequest("resumo", conteudo),
    [streamRequest],
  );

  const preencherTemplate = useCallback(
    (conteudo: string) => jsonRequest("template", conteudo),
    [jsonRequest],
  );

  const processarTranscricao = useCallback(
    (conteudo: string) => jsonRequest("transcricao", conteudo),
    [jsonRequest],
  );

  return {
    gerando,
    textoGerado,
    gerarSugestao,
    preencherTemplate,
    processarTranscricao,
    gerarResumo,
    cancelar,
  };
}
