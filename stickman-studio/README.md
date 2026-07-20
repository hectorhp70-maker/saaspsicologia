# Stickman Studio 🕺

Gerador e animador de bonecos **stickman** em **SVG paramétrico** para os vídeos
do canal **Surto Financeiro** (mascote *Anderson Patrimônio Armando Pecunia*).

Roda 100% local, sem backend. Stack: **Vite + JavaScript puro** + **JSZip**.
Exporta **SVG**, **sequência de PNGs (.zip)** e **vídeo .webm** (MediaRecorder).

## Como rodar

```bash
cd stickman-studio
npm install
npm run dev
```

Abra a URL que o Vite mostrar (por padrão `http://localhost:5180`).

Build de produção (opcional):

```bash
npm run build      # gera dist/
npm run preview    # serve o build localmente
```

## O que dá pra fazer

- **Editor de pose**: sliders para cada ângulo (ombro E/D, cotovelo E/D, quadril
  E/D, joelho E/D e inclinação da coluna) com preview SVG ao vivo.
- **Biblioteca de poses**: poses base prontas (`idle`, `wave`, `walk`, `run`,
  `jump`, `point`, `shrug`, `sit`, `think`) + criar/salvar poses customizadas
  com nome (persistidas no `localStorage`).
- **Interpolação**: escolha pose inicial e final + número de quadros e o app gera
  os frames intermediários por interpolação linear dos ângulos. Botão para
  pré-visualizar a animação.
- **Exportação**:
  - SVG único da pose atual;
  - Sequência de PNGs em `.zip` (400×500, fundo branco ou transparente);
  - Vídeo `.webm` da sequência, com FPS ajustável.
- **Importar/exportar** as poses customizadas como arquivo JSON.

## Como o boneco é construído (esqueleto paramétrico)

Nenhuma coordenada de membro é fixa. Tudo é calculado por trigonometria a partir
de um ponto de origem + ângulo + comprimento (`src/skeleton.js`):

- **Cabeça**: círculo (raio fixo do personagem) acima do pescoço.
- **Coluna**: linha quadril → pescoço, com inclinação ajustável (`spineLean`).
- **Braços**: ombro → cotovelo → mão (2 segmentos por lado).
- **Pernas**: quadril → joelho → pé (2 segmentos por lado).

Convenção de ângulos (graus): **0 = para baixo**, 90 = direita, -90 = esquerda,
180 = para cima. Ombros e quadris usam ângulo **absoluto**; cotovelos e joelhos
usam ângulo **relativo** ao segmento anterior (0 = reto).

## Como adicionar novas poses no JSON

Cada pose é só um conjunto de ângulos — independente das proporções do
personagem, então serve para qualquer esqueleto.

### Opção A — pela interface (recomendado)

1. Ajuste os sliders até a pose desejada.
2. Digite um nome em **"Salvar pose atual"** e clique em **Salvar**.
3. A pose fica salva no `localStorage`. Use **"Exportar poses (JSON)"** para
   baixar um arquivo e **"Importar JSON"** para recarregar em outra máquina.

### Opção B — poses fixas no código

Edite `src/poses.js` e adicione um objeto no array `defaultPoses`:

```js
{
  id: 'facepalm',            // id único
  nome: 'Facepalm',          // rótulo exibido
  angles: {
    spineLean: 0,
    shoulderL: -12, elbowL: 8,
    shoulderR: 30,  elbowR: 120,   // mão sobe até o rosto
    hipL: -8, kneeL: 5,
    hipR: 8,  kneeR: 5,
  },
}
```

Os ângulos disponíveis são exatamente as chaves em `ANGLE_KEYS`
(`src/skeleton.js`): `spineLean`, `shoulderL`, `elbowL`, `shoulderR`, `elbowR`,
`hipL`, `kneeL`, `hipR`, `kneeR`.

## Múltiplos personagens (estrutura já aberta)

As proporções ficam em `defaultCharacter` (`src/skeleton.js`): `headRadius`,
`spineLength`, `upperArm`, `foreArm`, `thigh`, `shin`, `lineWidth`,
`jointRadius`. Para um novo personagem, basta clonar esse objeto com outras
proporções — as poses continuam valendo. (A UI de troca de personagem ainda não
foi implementada; a estrutura de dados já suporta.)

## Estrutura

```
stickman-studio/
├── index.html
├── src/
│   ├── main.js         # orquestra UI, biblioteca, animação e export
│   ├── skeleton.js     # esqueleto paramétrico + geração de SVG
│   ├── poses.js        # biblioteca de poses base (JSON)
│   ├── interpolate.js  # interpolação linear entre poses
│   ├── storage.js      # persistência (localStorage) + import/export JSON
│   ├── export.js       # SVG / PNG(zip) / WebM
│   └── styles.css
└── package.json
```

## Notas

- Sem GSAP/Three.js. Animação é feita por interpolação de ângulos + `setInterval`
  no preview e por canvas + MediaRecorder no export `.webm`.
- O export `.webm` depende do `MediaRecorder` do navegador (Chrome/Edge/Firefox
  recentes). Para máxima compatibilidade em editores de vídeo, use a sequência
  de PNGs.
