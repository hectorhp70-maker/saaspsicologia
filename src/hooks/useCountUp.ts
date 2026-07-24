import { useEffect, useRef, useState } from "react";

const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  typeof window.matchMedia === "function" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// ease-out cubic — desacelera no fim, dando a sensação de "chegada" do valor
const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

/**
 * Anima um número de 0 até `target` com ease-out.
 * SSR-safe (inicia em 0 nos dois lados) e respeita prefers-reduced-motion.
 */
export function useCountUp(target: number, duration = 900, startDelay = 0) {
  const [value, setValue] = useState(0);
  const frame = useRef<number | null>(null);
  const startTime = useRef<number | null>(null);

  useEffect(() => {
    if (prefersReducedMotion()) {
      setValue(target);
      return;
    }

    startTime.current = null;
    const tick = (now: number) => {
      if (startTime.current === null) startTime.current = now;
      const t = Math.min((now - startTime.current) / duration, 1);
      setValue(target * easeOutCubic(t));
      if (t < 1) {
        frame.current = requestAnimationFrame(tick);
      } else {
        setValue(target);
      }
    };

    const delayId = setTimeout(() => {
      frame.current = requestAnimationFrame(tick);
    }, startDelay);

    return () => {
      clearTimeout(delayId);
      if (frame.current !== null) cancelAnimationFrame(frame.current);
    };
  }, [target, duration, startDelay]);

  return value;
}
