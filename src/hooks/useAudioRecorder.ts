import { useState, useRef, useCallback, useEffect } from "react";
import { toast } from "sonner";

interface UseAudioRecorderReturn {
  gravando: boolean;
  duracaoSegundos: number;
  iniciarGravacao: () => Promise<void>;
  pararGravacao: () => Promise<string | null>;
}

export function useAudioRecorder(): UseAudioRecorderReturn {
  const [gravando, setGravando] = useState(false);
  const [duracaoSegundos, setDuracaoSegundos] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const iniciarGravacao = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.start();
      setGravando(true);
      setDuracaoSegundos(0);
      timerRef.current = setInterval(() => setDuracaoSegundos((s) => s + 1), 1000);
    } catch {
      toast.error("Não foi possível acessar o microfone.");
    }
  }, []);

  const pararGravacao = useCallback((): Promise<string | null> => {
    return new Promise((resolve) => {
      const recorder = mediaRecorderRef.current;
      if (!recorder) {
        resolve(null);
        return;
      }

      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }

      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        const url = URL.createObjectURL(blob);
        recorder.stream.getTracks().forEach((t) => t.stop());
        setGravando(false);
        resolve(url);
      };

      recorder.stop();
    });
  }, []);

  return { gravando, duracaoSegundos, iniciarGravacao, pararGravacao };
}
