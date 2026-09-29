# DECISIONS

Decisões que nem o `SPEC.md` nem o Figma (ML-CC) cobriam, ou em que os dois divergiam. Em cada uma escolhi a opção mais simples que é coerente com o design.

## Stack e organização

| # | Decisão | Por quê |
|---|---|---|
| 1 | **Vite 5 + React 18 + TypeScript**, **CSS Modules**, **react-router-dom 6**, **vite-plugin-svgr** | É a stack mais enxuta para uma SPA sem backend. O CSS Modules consome os tokens em CSS puro, sem camada extra. O svgr deixa os SVGs inline, e isso permite colorir por `currentColor`. |
| 2 | Estado em **Context + `useReducer`** (`src/state/QuotationContext.tsx`), sem biblioteca de formulário | O SPEC pede estado só em memória, compartilhado entre as duas rotas. As regras (limpeza de campos ocultos, Modalidade, upload) ficam num único reducer. |
| 3 | Breakpoints como `@custom-media` no `tokens.css` (via `postcss-custom-media` e `postcss-global-data`). Para o JS, o mesmo valor em `--bp-desktop-min` | `@media` não aceita `var()`. Assim nenhum `px` fica fora do arquivo de tokens, e CSS e JS usam a mesma fonte. |

## Tokens

| # | Decisão | Por quê |
|---|---|---|
| 4 | Estilos de texto do Figma viram tokens de `font` shorthand (`--text-body-md`, `--text-heading-h2`…), compostos só de primitivos `font/*` | Um token por estilo de texto, e nenhum `font-family` escrito à mão nos componentes. `Caption/Overline` recebe `text-transform: uppercase` no componente, como no estilo do Figma. |
| 5 | Estilos de efeito viram `--shadow-small` (0 1 2) e `--shadow-medium` (0 5 5), com cor `--color-shadow-default` | Espelha `Shadow/Small` e `Shadow/Medium`. |
| 6 | Dimensões fixas dos componentes (altura de controle 40, ícones 16–48, header 85, menu 72/270, painel 500, modal 620…) ficam como tokens `--size-*` no `tokens.css`, junto com `--z-*` e `--duration-*` | O Figma não tem variáveis de tamanho. Deixar esses números nos componentes violaria a regra de "nenhum px fora dos tokens". |
| 7 | O Side Menu Expanded tem no Figma uma sombra não ligada a token (0, 60, blur 50). Uso `--shadow-medium` | Só tokens são permitidos, e `Shadow/Medium` é o estilo de cards e painéis. |
| 8 | A instância do Check Circle no modal usa um verde cru. Mapeei para `--color-icon-success`, que tem o mesmo valor | Mantém a regra "cor de ícone só via `color/icon/*`". |
| 9 | Padding esquerdo do conteúdo: `space/32`. O Figma usa 30 | 30 não está na escala 4/8. |

## Ícones e imagens

| # | Decisão | Por quê |
|---|---|---|
| 10 | SVGs exportados do Figma (`src/assets/icons`). Tirei o `<rect>` de fundo `#F5F5F5` que o export insere e troquei as cores: primária → `currentColor`, acento → classe `.icon-accent`, glifo interno do Check Circle → `.icon-on-brand`. O componente `Icon` pinta cada uma com `--color-icon-*` | A cor vem sempre de `--color-icon-*` e nenhum hex fica nos assets. |
| 11 | WhatsApp, a aba "»" do painel e o glifo do card de cargas especiais foram extraídos só dos vetores. O círculo verde, o fundo da aba e o círculo `bg/info` são desenhados em CSS com tokens | No Figma esses elementos não são componentes, e o export do nó trazia os ancestrais junto. |
| 12 | **Botão de menu (hambúrguer) no mobile desenhado em CSS**, com três barras `--color-icon-primary` | O SPEC pede um botão de menu no header abaixo de 768px, mas o Figma não tem ícone de menu e bibliotecas de ícones estão proibidas. |
| 13 | Logos exportados como PNG @3x (`mercosul-logo`, `mercosul-logo-icon`, `ecofrete-logo`, `ecofrete-seal`) | No Figma as fontes são imagens raster. |

## Shell

| # | Decisão | Por quê |
|---|---|---|
| 14 | Side Menu recolhido: rótulos com `opacity: 0` (continuam na árvore de acessibilidade) e **sem destaque visual do item ativo**. Ativo = `aria-current="page"`. Expandido: seção Sustentabilidade com `bg/subtle` e borda direita `border/danger`, como no Figma | Segue as variantes Collapsed/Expanded do Figma. |
| 15 | O Side Menu também expande no **foco por teclado** (`:focus-within`), além do hover | Sem isso, quem navega por teclado não vê os rótulos. |
| 16 | Subitens de Sustentabilidade: os 3 do SPEC ("Compensação de Emissões de CO₂", "Relatórios", "Emissões e Savings"). Aparecem só com o menu expandido | A variante Expanded do Figma repete "Compensação…" duas vezes e escreve "Co2". O SPEC lista 3 itens. |
| 17 | Painel do contratante recolhido (desktop): só a aba "»" fica visível, na borda direita, com a seta girada 180° | Descrição do componente: "Collapsed mostra só a aba". Nos Flows o painel some, mas o SPEC exige a aba em qualquer etapa. |
| 18 | Abaixo de 1280px o painel é um drawer (`position: fixed`) **fechado por padrão** em qualquer rota | Aberto por padrão, cobriria o conteúdo no tablet e no mobile. |
| 19 | Header de 768 a 1279px: CNPJ e IE empilhados, WhatsApp só com ícone e "Olá, Fernando" só com ícone e chevron. Abaixo de 768px: botão de menu, logo, título e WhatsApp só com ícone. Empresa e usuário ficam ocultos | O header completo não cabe nessas larguras. Abaixo de 768px segue o SPEC §11. |
| 20 | "Olá, Fernando" e o chevron da empresa não são focáveis (não têm destino). Os links do menu são `<a href="#">` com `preventDefault` | São inertes pelo SPEC §5, mas os itens do menu precisam de foco para o hover-expand funcionar por teclado. |
| 21 | Textos do shell exatamente como no Figma: header "CNPJ / CUIT / RUT", painel "CNPJ / CUT / RUIT", header "Nome Empresa LTDA", painel "Nome da Empresa LTDA." | O SPEC §10 diz "CNPJ / CUIT / RUIT", mas o Figma decide o texto visível de cada elemento. |

## Tela 1 — Dados da Carga

| # | Decisão | Por quê |
|---|---|---|
| 22 | O cabeçalho do Cargo Type Selector (ícone + título) é um `<button aria-expanded>`. No estado Collapsed ele sai da ordem de Tab, porque "Selecionar carga" já faz o papel | O SPEC pede que o clique no cabeçalho também recolha, e isso evita duas paradas de Tab iguais. |
| 23 | Radiogroup das opções: as setas percorrem **todas** as opções (inclusive as indisponíveis, para o tooltip aparecer no foco) e selecionam só as habilitadas. Espaço/Enter seleciona | Segue o SPEC §9 (setas + Espaço, tooltip no focus). |
| 24 | O tooltip fica fora do elemento `role="radio"` e é ligado por `aria-describedby` | Assim "Em breve" não entra no nome acessível da opção. |
| 25 | Estado Hover do Radio Card como no componente: fundo `bg/page`, borda `border/brand` e o ponto do radio aparece | Visual do Figma. Nos cards do seletor a borda cobre os 4 lados, como nas instâncias. |
| 26 | Grid do seletor com **2 colunas de 768 a 1279px** (3 no desktop, 1 no mobile). Rótulos longos quebram linha | Três colunas não cabem nessa faixa. No Figma o rótulo "Contêiner Padrão Alimentício" já passa da área útil do card. |
| 27 | Card "Outros tipos de cargas" em Off enquanto o seletor está aberto: fundo `bg/page` (a borda superior `border/strong` já existe) | Anotação do Figma. |
| 27b | Rótulos das opções exatamente como no Figma: "Reefer Porta" e "Contêiner Padrão Alimentício" | O SPEC fala em "Reefer" e "Contêiner Padrão", mas o texto visível vem do Figma. |
| 28 | "Alterar carga" volta com o seletor aberto e IMO marcado | Anotação do nó `1:736`, que complementa o SPEC §4. |

## Tela 2 — Formulário IMO

| # | Decisão | Por quê |
|---|---|---|
| 29 | O menu do dropdown **sobrepõe** o conteúdo (absoluto, 8px abaixo do campo) em vez de empurrá-lo | É o comportamento padrão de select. A variante Open do Figma é só a referência visual. |
| 30 | Item do dropdown ativo por hover ou seta: `bg/page`. Item selecionado: texto `text/brand` em peso medium. Hover do campo: borda `border/muted`, igual ao Input | O Figma não define hover, ativo nem selecionado para o Dropdown / Item. |
| 31 | Clicar no label do dropdown foca o combobox sem abrir | Segue o padrão de um `<select>` nativo. |
| 32 | Sufixos e prefixos (`°C`, `kg`, `±`) aparecem dentro do campo **só quando há valor**, em `text/secondary`. `R$` faz parte do valor mascarado | O campo vazio fica igual ao Figma (placeholder "Digite"), e o formato do SPEC continua visível. |
| 33 | Máscaras: Temperatura aceita `-` e 1 casa decimal. Variação não aceita negativo. Peso é inteiro com separador de milhar. Nº de ajudantes é inteiro, sem zero à esquerda e **limitado a 20** (digitar 35 vira 20). CNTRs/mês é inteiro sem zero à esquerda | "Inteiro de 1 a 20" sem inventar mensagens fora do SPEC §8. |
| 34 | CNPJ vazio mostra "Campo obrigatório.". Incompleto ou com dígito verificador inválido mostra "CNPJ inválido." | No Flow 07 o campo vazio aparece com "CNPJ inválido.", mas o SPEC §8 separa os dois casos, e o SPEC decide o comportamento. |
| 35 | Upload obrigatório sem arquivo Done: "Campo obrigatório." abaixo da lista, com a Dropzone em Error | O SPEC não traz mensagem própria para esse caso. |
| 36 | Validação do arquivo pela **extensão** (pdf, jpg, jpeg, png) e pelo MIME, quando o navegador informa. Abaixo de 1 MB o tamanho aparece em KB ("850 KB") | Não confia só no MIME, que varia entre sistemas. "0,1 MB" seria pouco legível. |
| 37 | A Dropzone volta de Error para Default quando todos os arquivos rejeitados do último lote são removidos | "Error quando o último lote teve algum arquivo rejeitado." Sem os rejeitados na lista, o erro deixa de valer. |
| 38 | Erros aparecem depois do blur ou da primeira tentativa de envio e, a partir daí, se atualizam enquanto a pessoa digita | Validação no blur e no envio, e o erro some assim que o campo é corrigido. |
| 39 | Radio Group valida quando o foco sai do fieldset | Esse é o "blur" de um grupo. |
| 40 | Foco em campo com erro: a borda continua `border/danger` e o foco aparece como outline `border/focus` | O foco precisa ficar visível sem perder o estado de erro. |
| 41 | Cada Route Row é um `role="group"` com o nome "Trecho N" | Os 4 rótulos se repetem entre os trechos. |
| 42 | Removi o traço decorativo vertical ("Shape", 365px) que aparece sob o bloco "Dados da Carga" no frame | Não tem papel no layout e parece resto de edição. Atravessa os cards. |
| 43 | O botão "Ver resumo da cotação", que existe nas variantes do Terms Checkbox, não é renderizado | As instâncias dos Flows o removem e o SPEC não o menciona (escopo). |
| 44 | Checkbox do aceite com borda só no topo e Shadow/Small, como no Figma | Visual do componente. |
| 45 | Largura do formulário: fluida até **1352px** (largura dos cards no Figma) | O SPEC pede conteúdo fluido, e 1352 mantém a proporção do design em telas largas. |
| 46 | `<h1>` visualmente oculto "Cotação de Carga IMO" na tela 2. O título do header não é heading | A tela 2 não tem título visível. O header se repete nas duas telas. |

## Envio e modal

| # | Decisão | Por quê |
|---|---|---|
| 47 | Loading: `aria-busy`, cliques ignorados e cor fixa em `primary/default`, sem hover | A variante Loading do Figma usa a cor default. |
| 48 | Modal: trava o scroll do body, devolve o foco ao elemento anterior ao fechar, Esc é ouvido no documento e o mousedown no overlay é ignorado (o foco não escapa) | Foco preso e overlay que não fecha, conforme o SPEC §7.5. O ícone de fechar está oculto no componente e não é renderizado. |
| 49 | No mobile, os botões do modal empilham ("Visualizar propostas" em cima) e ocupam a largura toda | Largura `100% - 2 × space/16`, conforme o SPEC §11. |
| 50 | "Nova cotação" zera tudo, inclusive uploads e trechos | SPEC §4. |

## Movimento

| # | Decisão | Por quê |
|---|---|---|
| 51 | Campos condicionais, trechos e o painel do accordion entram com fade + 4px em 200ms. `prefers-reduced-motion` desliga as animações | O SPEC pede transição de no máximo 200 ms. |
| 52 | Spinner: rotação linear de 800ms | Descrição do componente `Icon / 24 / Spinner`. |
