# Proposta Online — Carga IMO com Ecofrete

SPA em React + TypeScript com a jornada de cotação **Carga IMO** da Mercosul Line. Não há backend: os dados são mockados e o estado fica em memória.
As fontes de verdade são o [`SPEC.md`](SPEC.md) e o Figma [ML-CC](https://www.figma.com/design/GFZ6IR7gOYRvtUgfLVSEOM/ML-CC). As decisões fora dessas duas fontes estão em [`DECISIONS.md`](DECISIONS.md).

## Como rodar

```bash
npm install
npm run dev          # http://localhost:5173/cotacao
```

| Script | O que faz |
|---|---|
| `npm run build` | Typecheck e build de produção (`dist/`) |
| `npm run check:tokens` | Falha se houver hex, `rgb()`/`hsl()`, `px` ou `font-family` fora de `src/styles/tokens.css` |
| `npm run check:behavior` | 27 checks de comportamento em Playwright (SPEC §4–§9). Precisa do `npm run dev` rodando |
| `npm run capture:states` | Reproduz os 12 estados da página Flows (01 → 12) em `screenshots/` |
| `npm run capture:responsive` | Screenshots em tablet (1024px) e mobile (390px) e medição de overflow horizontal |

> Os scripts de Playwright usam o Chromium headless: `npx playwright install chromium-headless-shell`.

## Estrutura

```
src/
├── styles/
│   ├── tokens.css        ← TODOS os tokens: primitivos, semânticos, estilos de texto,
│   │                       sombras, dimensões, z-index, motion e breakpoints
│   └── global.css        ← reset, foco visível e .visually-hidden (só tokens)
├── assets/
│   ├── icons/            ← SVGs exportados do Figma (cor por currentColor → --color-icon-*)
│   └── images/           ← logos Mercosul Line e Ecofrete exportados do Figma
├── components/           ← um componente React por componente do Figma
│   ├── Button/ Icon/ IconBadge/ Tooltip/
│   ├── HeaderDesktop/ SideMenu/ (SideMenu + SideMenuItem) ContractorPanel/
│   ├── CargoTypeSelector/ RadioCard/
│   ├── FormField/ (anatomia compartilhada) FormInput/ FormDropdown/ (+ DropdownMenu, DropdownItem)
│   ├── FormTextArea/ FormRadio/ FormRadioGroup/ RouteRow/
│   ├── UploadDropzone/ UploadFileItem/ TermsCheckbox/ ModalQuotationSuccess/
│   └── layout/           ← frames nomeados por papel no Figma (Card, Field Row, Titulo, "Dados da Carga"…)
├── shell/AppShell.tsx    ← header + side menu + conteúdo + painel do contratante
├── pages/                ← CargoDataPage (/cotacao) e ImoFormPage (/cotacao/imo)
├── state/                ← store (Context + reducer), modelo/validação, máscaras, mocks e mensagens
└── hooks/useMediaQuery.ts
scripts/                  ← check-tokens, check-behavior, capture-states, capture-responsive
```

**Tokens.** O arquivo `src/styles/tokens.css` foi gerado das coleções `Primitives` e `Semantic` (modo Light), com os nomes do code syntax WEB (`color/text/heading` → `--color-text-heading`). A UI usa **só os semânticos**. Os estilos de texto do Figma viram tokens de `font` (`--text-body-md`…) e os de efeito viram `--shadow-small` e `--shadow-medium`. A opacidade é convertida de 0–100 para 0–1 (`--opacity-disabled: 0.5`).

**Componentes.** As props espelham as propriedades do Figma: `variant`, `size`, `direction`, `label`, `errorMessage`, `showDescription`, `showEcofreteSeal`, `type`, `state`… Estados como Hover, Active e Pressed ficam no CSS. Error, Disabled, Loading, Selected e Off vêm das props. As páginas são montadas só com esses componentes e os frames de `layout/`.

## Verificação

- **12 estados (Flows 01 → 12):** reproduzidos com `capture:states` e comparados com o `get_screenshot` de cada frame. Divergências corrigidas no processo: rótulos do menu visíveis quando recolhido, glifo do WhatsApp, largura do conteúdo, altura da Text Area e cor do Loading no hover. Os estados 05–12 foram conferidos também pela estrutura dos frames (variantes e textos de cada instância), porque o screenshot do Figma corta o formulário em 960px.
- **Comportamento:** `check:behavior` com 27/27 checks passando.
- **Valores soltos:** `check:tokens` sem ocorrências (82 arquivos). Nenhum primitivo (`--color-blue-*`, `--font-size-*`…) é usado fora de `tokens.css`.
- **Responsivo:** 0px de overflow horizontal em 1024px e 390px, nas duas telas.

## Critérios de aceite (SPEC §12)

- [x] **Nenhuma cor, espaçamento, raio ou fonte com valor solto.** O `check:tokens` falha em qualquer hex, rgb/hsl, px ou font-family fora de `tokens.css`. A UI só referencia tokens semânticos. Dimensões fixas e breakpoints também são tokens (DECISIONS #3, #6).
- [x] **Jornada completa 01 → 02 → 04 → 05/06 → 10 → 11/12, igual ao protótipo.** Percorrida de ponta a ponta pelo `capture:states` e comparada com os frames do Flows.
- [x] **Seletor funciona como accordion, só o IMO é selecionável, as demais mostram "Em breve".** Tem `aria-expanded`, "Avançar cotação" desabilitado sem seleção, opções Off com `aria-disabled` e tooltip após ~300 ms no hover e no focus (checks 5–9).
- [x] **Campos condicionais aparecem e somem, e os valores ocultos são limpos.** Peação, "Coletado em" (embarcador e destinatário) e ajudantes/numerário (coleta e entrega). Os valores e o estado de "tocado" são limpos no reducer (check "conditional fields").
- [x] **Modalidade controla a rota, "+ Adicionar trecho" vai até 5, com remoção.** Sem Modalidade, 4 campos Disabled. Com Modalidade, os 2 aplicáveis. A troca limpa o que deixou de valer. No limite de 5 o botão some. O Trecho 1 não é removível e os trechos são renumerados.
- [x] **Máscaras da seção 7.1.** CNPJ `00.000.000/0000-00` (com dígito verificador), `R$ 0.000,00`, `kg`, `°C` com negativo, `± °C`, inteiros (ajudantes limitado a 1–20).
- [x] **Upload aceita e rejeita pelas regras da 7.3, com lista, progresso e remoção.** PDF/JPG/PNG até 10 MB, várias por vez, arrastar e soltar ou "Busque no seu computador". Uploading com progresso simulado de 1–2 s → Done. Error com as mensagens do SPEC. Dropzone em Drag Over e Error.
- [x] **Validação no blur e no envio, com rolagem e foco no primeiro erro e as mensagens da seção 8.** O teste confirma o foco no primeiro campo inválido na ordem do DOM e que ele está dentro do viewport. Os campos têm `aria-invalid` e `aria-describedby`.
- [x] **Botão desabilitado sem aceite, Loading no envio e modal com o selo condicionado ao Ecofrete.** Loading de ~1,5 s ("Enviando…", `aria-busy`, ignora novo clique). O selo aparece só com Ecofrete = Sim.
- [x] **Modal: Esc fecha, overlay não fecha, foco preso, "Nova cotação" reinicia, "Visualizar propostas" fecha.** Foco inicial no botão primário e `role="dialog"` com `aria-modal`.
- [x] **Shell: Side Menu com hover-expand e Sustentabilidade ativa, painel recolhível, WhatsApp em nova aba.** O menu vai de 72 para 270px sobrepondo o conteúdo (o teste confere que o `main` não se move). O painel abre em `/cotacao` e fica recolhido em `/cotacao/imo`, e a aba "»" alterna nas duas telas.
- [x] **Acessibilidade conforme a seção 9 e responsividade conforme a seção 11.**
  - Acessibilidade: labels associados em todos os controles, Radio Groups em `fieldset`/`legend`, foco visível em `border/focus`, dropdown como combobox (Enter/Espaço, setas, Esc), opções do seletor em radiogroup (setas + Espaço), Dropzone acionável por Enter e `prefers-reduced-motion`.
  - Responsividade: de 768 a 1279px o painel vira drawer e as linhas de 4 campos passam a 2 colunas. Abaixo de 768px o menu vira drawer pelo botão do header, o header fica compacto, tudo fica em 1 coluna, os botões dos cards descem, o seletor fica em 1 coluna e o modal usa `100% − 2 × space/16`.

**Pendências:** nenhuma funcional. Dois pontos, registrados em DECISIONS:
- **Ícone do menu mobile:** o hambúrguer é desenhado em CSS porque o Figma não tem esse ícone (#12).
- **Rótulo "Contêiner Padrão Alimentício":** quebra em duas linhas em larguras menores que o frame do Figma (#26).
