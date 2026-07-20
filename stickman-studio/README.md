# Stickman Studio 🕺

Gerador e animador de bonecos **stickman** em **SVG paramétrico** para os vídeos
do canal **Surto Financeiro** (mascote *Anderson Patrimônio Armando Pecunia*).

Roda 100% local, sem backend. Stack: **Vite + JavaScript puro** + **JSZip**.
Exporta **SVG**, **sequência de PNGs (.zip)** e **vídeo .webm** (MediaRecorder).

## Vídeos de exemplo

Em `examples/` há três `.webm` gerados pelo próprio app (export via
MediaRecorder), 400×500: `exemplo-aceno.webm`, `exemplo-caminhada.webm` e
`exemplo-susto-financeiro.webm`. Para gerar os seus: carregue uma animação
pronta, ajuste o FPS e clique em **Vídeo .webm**.

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

- **Editor de personagem**: troque as proporções (raio da cabeça, coluna, braço,
  antebraço, coxa, canela, espessura do traço, tamanho das mãos/pés) e a cor, com
  preview ao vivo. Presets prontos (`Anderson`, `Magrelo`, `Forte`, `Mascote
  mini`) + criar/salvar personagens customizados (localStorage) e importar/
  exportar JSON. As poses valem para qualquer personagem.
- **Editor de pose**: sliders para cada ângulo (ombro E/D, cotovelo E/D, quadril
  E/D, joelho E/D e inclinação da coluna) com preview SVG ao vivo.
- **Expressões faciais**: seletor de rosto (neutro, feliz, triste, bravo,
  surpreso, preocupado, tonto). O rosto acompanha a inclinação da cabeça e pode
  ser desligado no personagem (checkbox "Mostrar rosto"). A expressão é salva
  junto com a pose.
- **Biblioteca de poses**: poses base prontas (`idle`, `wave`, `walk`, `run`,
  `jump`, `point`, `shrug`, `sit`, `think`) + criar/salvar poses customizadas
  com nome (persistidas no `localStorage`).
- **Animação por quadros-chave (timeline)**: monte uma pose no editor e clique em
  **+ Adicionar quadro-chave** quantas vezes quiser. Cada trecho entre quadros
  consecutivos é interpolado linearmente (com o número de quadros ajustável por
  trecho). Pré-visualização com FPS e loop. Cada trecho usa a expressão do seu
  quadro-chave inicial.
- **Animações prontas**: presets que preenchem a timeline com um clique
  (respiração parada, aceno, caminhada e corrida em loop, comemoração, susto
  financeiro, pensar/dar de ombros). Dá para salvar a timeline atual como uma
  animação nova (localStorage) e importar/exportar em JSON.
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
  expression: 'preocupado',  // opcional (padrão: 'neutro')
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

## Múltiplos personagens

Já implementado. As proporções ficam em `defaultCharacter` (`src/skeleton.js`):
`headRadius`, `spineLength`, `upperArm`, `foreArm`, `thigh`, `shin`, `lineWidth`,
`jointRadius`, `color`. Como uma pose guarda só ângulos, o mesmo conjunto de
poses serve para qualquer personagem.

### Pela interface

No painel **Personagem**: escolha um preset no seletor, ajuste os campos
numéricos (preview ao vivo), dê um nome e clique **Salvar** para persistir no
`localStorage`. Use **Restaurar** para voltar às proporções do preset,
**Excluir** para remover um custom, e **Exportar/Importar (JSON)** para levar
seus personagens entre máquinas.

### Presets fixos no código

Edite `src/characters.js` e adicione um objeto no array `defaultCharacters`:

```js
{
  id: 'careca-forte',
  nome: 'Careca forte',
  headRadius: 42, spineLength: 78,
  upperArm: 42, foreArm: 40,
  thigh: 52, shin: 50,
  lineWidth: 12, jointRadius: 9,
  color: '#111111',
}
```

## Estrutura

```
stickman-studio/
├── index.html
├── src/
│   ├── main.js         # orquestra UI, biblioteca, animação e export
│   ├── skeleton.js     # esqueleto paramétrico + geração de SVG
│   ├── characters.js   # personagens base + campos editáveis
│   ├── poses.js        # biblioteca de poses base (JSON)
│   ├── animations.js   # animações prontas (timelines nomeadas)
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
