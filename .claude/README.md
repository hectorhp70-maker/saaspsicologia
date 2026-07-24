# Skills do Claude Code neste projeto

Este projeto **embute** o plugin **genjutsu** — skills de creative coding para Claude Code
(motion design, micro-interações, direção de arte e sistemas visuais). Origem:
[`AThevon/genjutsu`](https://github.com/AThevon/genjutsu) (v3.0.3, licença MIT).

## Como está configurado

Os arquivos do plugin ficam versionados em `.claude/plugins/genjutsu/` (self-contained,
funciona offline). O `settings.json` deste diretório registra esse caminho como um
**marketplace local** e habilita o plugin:

```json
{
  "extraKnownMarketplaces": {
    "genjutsu": { "source": { "source": "directory", "path": "./.claude/plugins/genjutsu" } }
  },
  "enabledPlugins": { "genjutsu@genjutsu": true }
}
```

Quem abrir este repositório no Claude Code (e confiar na pasta) recebe o plugin a partir
dos arquivos locais — sem clonar nada da internet. Se o plugin não aparecer, rode:

```
/plugin marketplace add ./.claude/plugins/genjutsu
/plugin install genjutsu@genjutsu
/reload-plugins
```

## Skills disponíveis

- `/genjutsu:cast` — **O Ilusionista**. Pega um pedido de motion/interação, escaneia a stack,
  propõe uma tese de interação e implementa (parallax, scroll-driven, micro-interações...).
- `/genjutsu:paint` — **O Pintor**. Constrói um universo visual completo do zero (brainstorm
  primeiro, implementação depois).

Sub-skills carregadas sob demanda (em `.claude/plugins/genjutsu/skills/_jutsu/`) cobrem GSAP,
Framer Motion, CSS nativo, Three.js/R3F, canvas generativo, princípios de motion, design-audit
(performance/acessibilidade) e mais. Esta stack é web (React 19 + Vite + Tailwind), então as
sub-skills web se aplicam diretamente.

## Atualizar o plugin

Como os arquivos estão embutidos, para atualizar basta substituir o conteúdo de
`.claude/plugins/genjutsu/` por uma versão mais nova do repositório de origem e commitar.
