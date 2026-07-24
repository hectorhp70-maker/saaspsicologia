# Skills do Claude Code neste projeto

Este projeto absorve o plugin **genjutsu** — skills de creative coding para Claude Code
(motion design, micro-interações, direção de arte e sistemas visuais), do repositório
[`AThevon/genjutsu`](https://github.com/AThevon/genjutsu).

## Como está configurado

O `settings.json` deste diretório registra o marketplace `genjutsu` e habilita o plugin.
Quem abrir este repositório no Claude Code (e confiar na pasta) recebe o plugin
automaticamente. Em sessões cloud/web, o `enabledPlugins` já ativa o plugin sem o menu `/plugin`.

Se o plugin não aparecer, rode:

```
/plugin marketplace add AThevon/genjutsu
/plugin install genjutsu@genjutsu
/reload-plugins
```

## Skills disponíveis

- `/genjutsu:cast` — **O Ilusionista**. Pega um pedido de motion/interação, escaneia a stack,
  propõe uma tese de interação e implementa (parallax, scroll-driven, micro-interações...).
- `/genjutsu:paint` — **O Pintor**. Constrói um universo visual completo do zero (brainstorm
  primeiro, implementação depois).

Sub-skills carregadas sob demanda cobrem GSAP, Framer Motion, CSS nativo, Three.js/R3F,
canvas generativo, princípios de motion, design-audit (performance/acessibilidade) e mais.
Esta stack é web (React 19 + Vite + Tailwind), então as sub-skills web se aplicam diretamente.
