# SPEC — Cotação online Carga IMO (Ecofrete)

Especificação de frontend para a jornada de cotação de **Carga IMO** da Mercosul Line, com a opção **Ecofrete** (compensação de CO₂).
Este documento e o arquivo Figma são as duas fontes de verdade:

- **Este SPEC** define comportamento, regras de UI, dados mockados e critérios de aceite.
- **O Figma** define o visual, os componentes e os estados.

Em caso de conflito, o comportamento vale o que está aqui e o visual vale o que está no Figma.

- Figma: https://www.figma.com/design/GFZ6IR7gOYRvtUgfLVSEOM/ML-CC (fileKey `GFZ6IR7gOYRvtUgfLVSEOM`)
- Idioma da UI: **PT-BR**. Nomes de componentes e tokens: inglês.

---

## 1. Escopo

**Dentro do escopo**

- SPA em **React + TypeScript**. A estilização e as bibliotecas ficam a critério de quem implementa, respeitando a seção 3.
- Jornada: **Dados da Carga → escolher Carga IMO → formulário IMO → envio → modal de sucesso**.
- Todo o comportamento de tela descrito aqui: accordion, campos condicionais, máscaras, validação, upload simulado, trechos dinâmicos, loading e modal.
- Desktop conforme o design. Tablet e mobile adaptados por quem implementa, dentro dos guardrails da seção 11.

**Fora do escopo**

- Backend, APIs, integrações, persistência e autenticação. O usuário já está logado, com dados mockados.
- Fluxo "Outros tipos de cargas", porque o botão é inerte.
- Tipos OOG, SOC, Serviços Especiais, Reefer e Contêiner Padrão, que ficam desabilitados.
- Destinos do menu lateral, do seletor de empresa, do menu do usuário e de "Visualizar propostas".
- Seção "Dados da proposta" do painel lateral.

---

## 2. Mapa do Figma

| Página | ID | Conteúdo |
|---|---|---|
| Cover | `16:1004` | README do arquivo |
| Foundations | `15:1004` | Documentação visual dos tokens |
| Componentes | `4:998` | Todos os componentes locais |
| Ecofrete | `0:1` | Telas-base **anotadas** (Dev Mode → Annotations) |
| Flows | `28:2` | 12 estados de tela ligados por protótipo (início do fluxo: 01) |

**Telas-base (anotadas)**

- `1:715` WEB QUOTATION / Cotação Online (etapa 1)
- `1:733` WEB QUOTATION / Carga IMO (etapa 2)

**Estados (página Flows)**

| # | Nó | Estado |
|---|---|---|
| 01 | `28:5` | Dados da Carga — inicial |
| 02 | `28:24` | Seletor de carga aberto (sem seleção) |
| 03 | `28:327` | Opção indisponível com tooltip "Em breve" |
| 04 | `28:489` | Carga IMO selecionada |
| 05 | `28:1730` | Formulário IMO — inicial (vazio) |
| 06 | `28:794` | Formulário IMO — preenchido (Modalidade Porta a Porto) |
| 07 | `28:2419` | Validação — envio com obrigatórios vazios |
| 08 | `28:3268` | Upload FISPQ — lista de arquivos |
| 09 | `28:3468` | Trecho adicional |
| 10 | `28:3768` | Enviando (botão em Loading) |
| 11 | `28:4380` | Sucesso — Ecofrete **Sim** (com selo) |
| 12 | `28:5017` | Sucesso — Ecofrete **Não** (sem selo) |

**Componentes principais**

| Componente | ID | Uso |
|---|---|---|
| Header / Desktop | `5:1570` | Header global |
| Side Menu / Side Menu Item | `5:1755` / `5:2190` | Menu lateral |
| Quotation / Contractor Panel / Desktop | `5:1652` | Painel do contratante (Expanded/Collapsed) |
| Cargo Type Selector | `1:917` | Accordion de tipo de carga (Collapsed / Open / IMO Selected) |
| Radio Card / Desktop | `5:2682` | Opção do seletor (Default/Hover/Active/**Off**) |
| Tooltip | `25:1642` | "Em breve" |
| Form / Input · Form / Dropdown · Form / Text Area | `5:2300` · `5:2354` · `5:2578` | Campos (inclui Error e Disabled) |
| Form / Radio · Form / Radio Group | `24:1646` · `24:1677` | Perguntas Sim/Não (inclui Error) |
| Route Row | `26:1256` | Trecho de rota (First / Additional) |
| Upload / Dropzone · Upload / File Item | `25:1664` · `25:1719` | Upload FISPQ |
| Quotation / Terms Checkbox / Desktop | `5:2632` | Aceite + "Solicitar cotação" |
| Button | `4:999` | Primary/Danger/Secondary/Link × Medium/Small/Tiny × Default/Hover/Pressed/Disabled/**Loading** |
| Modal / Quotation Success | `22:1108` | Modal de sucesso (`Show Ecofrete Seal`) |

Cada componente tem uma descrição no Figma, e as telas-base têm anotações por elemento. Leia as duas coisas.

---

## 3. Tokens e estilo (obrigatório)

- **Nada de valores soltos.** Cor, espaçamento, raio, borda, opacidade, tipografia e sombra vêm dos tokens do Figma, que estão em Variables (coleções `Primitives` e `Semantic`, modo `Light`) e nos estilos de texto e de efeito.
- **Use os nomes de CSS do code syntax** do Figma. Por exemplo, `color/text/heading` vira `var(--color-text-heading)` e `space/16` vira `var(--space-16)`.
- **Primitivos não são aplicados direto na UI.** Use os semânticos:
  - texto: `color/text/*`
  - fundo: `color/bg/*`
  - ação: `color/action/*`
  - borda: `color/border/*`
  - ícone: `color/icon/*`
  - sombra: `color/shadow/*`
  - opacidade: `opacity/disabled`
- **Espaçamento** em escala 4/8: `0, 2, 4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 72`.
- **Raio:** `radius/4` é o padrão, `radius/8` é o do modal e `radius/full` é o de pílulas e círculos.
- **Opacidade:** no Figma, variáveis de opacidade usam a escala 0–100 (`opacity/50 = 50`). No CSS, converta para 0–1 (`--opacity-disabled: 0.5`).
- **Tipografia:** Roboto Condensed (body) e Antonio (display), pelo Google Fonts. Use os estilos de texto do Figma (`Display/*`, `Heading/*`, `Body/*`, `Caption/*`, `Label/*`, `Component/*`).
- **Sombras:** `Shadow/Small` (0 1 2) e `Shadow/Medium` (0 5 5), com cor `color/shadow/default`.

---

## 4. Rotas e estado

| Rota | Tela | Regra |
|---|---|---|
| `/cotacao` | Dados da Carga | Rota inicial |
| `/cotacao/imo` | Formulário Carga IMO | Acesso direto sem o tipo IMO escolhido → redireciona para `/cotacao` |

- O estado é **só em memória**, compartilhado entre as rotas (tipo escolhido e dados do formulário). Recarregar a página perde tudo.
- "Alterar carga" volta para `/cotacao` **mantendo** os dados do formulário.
- "Nova cotação" (no modal) **zera** o estado e volta para `/cotacao`, com tudo recolhido.

---

## 5. Shell (as duas telas)

**Header** (`Header / Desktop`)

- O botão WhatsApp abre `https://wa.me/5500000000000` em nova aba (número mock).
- O chevron da empresa e o menu "Olá, Fernando" são **inertes**.

**Side Menu**

- Largura de 72px recolhido. **Expande no hover** (variante `Expanded`), **sobrepondo** o conteúdo sem empurrá-lo.
- Item ativo: **Sustentabilidade**. Nenhum subitem fica ativo.
- Ordem dos itens: Comercial, Financeiro, Bookings, VGM, Draft, Track & Trace, Agendamento de Entrega, Sustentabilidade (subitens: Compensação de Emissões de CO₂, Relatórios, Emissões e Savings), Informativos, Usuários, Ajuda.
- Os links não têm destino.

**Painel do contratante** (`Quotation / Contractor Panel / Desktop`)

- Fica aberto em `/cotacao` e **recolhido** em `/cotacao/imo`.
- A aba "»" alterna entre Expanded e Collapsed em qualquer etapa.
- Conteúdo mock (seção 10). `Show Proposal Data` fica desligado.

---

## 6. Tela 1 — Dados da Carga (`/cotacao`)

Tem dois cards.

**Card "Outros tipos de cargas"**

- O botão "Avançar cotação" é **inerte**.
- Enquanto o card de cargas especiais estiver aberto, este card fica com a aparência **Off**: `color/bg/page` e `color/border/strong`.

**Card "Cargas IMO, OOG, SOC, Serviços Especiais, Reefer e Padrão Alimentício"** (`Cargo Type Selector`)

1. **Estado inicial:** `Collapsed`, com o botão "Selecionar carga".
2. **"Selecionar carga"** expande o card no lugar (accordion) para `Open`. Clicar de novo no botão ou no cabeçalho recolhe.
3. **No estado `Open`:**
   - 6 opções em grid 3×2, sem pré-seleção.
   - "Avançar cotação" fica **desabilitado**.
   - **Carga IMO** é a única opção habilitada.
   - As demais ficam em `State=Off`, não clicáveis. Em hover ou focus mostram o `Tooltip` com o texto **"Em breve"**, depois de cerca de 300 ms.
4. **Selecionar Carga IMO:** a opção fica `Active` (estado `IMO Selected`) e "Avançar cotação" é habilitado.
5. **"Avançar cotação"** navega para `/cotacao/imo`.

---

## 7. Tela 2 — Formulário Carga IMO (`/cotacao/imo`)

**Barra do topo:** "Dados da carga: **Carga IMO**" e o botão "Alterar carga" (seção 4).

### 7.1 Campos

**Obrig.** = obrigatório **quando visível**. Campos ocultos nunca são obrigatórios nem validados.

| # | Campo | Componente | Formato / máscara | Obrig. | Visibilidade |
|---|---|---|---|---|---|
| 1 | CNPJ do Pagador do Frete | Form / Input | `00.000.000/0000-00` | Sim | Sempre |
| 2 | Modalidade do transporte | Form / Dropdown | lista (10.1) | Sim | Sempre |
| 3 | Tipo de Mercadoria | Form / Dropdown | lista (10.1) | Sim | Sempre |
| 4 | Temperatura | Form / Input | número em `°C`, aceita negativo | Não | Sempre |
| 5 | Variação | Form / Input | `± °C` | Não | Sempre |
| 6 | Carga Perigosa – IMO (Enviar FISPQ) | Upload / Dropzone + File Item | 7.3 | Sim (≥ 1 arquivo válido) | Sempre |
| 7 | Valor da mercadoria / Contêiner | Form / Input | `R$ 0.000,00` | Sim | Sempre |
| 8 | Peso da mercadoria / Contêiner | Form / Input | número + sufixo `kg` | Sim | Sempre |
| 9 | Tamanho do contêiner | Form / Dropdown | lista (10.1) | Sim | Sempre |
| 10 | Tipo de contêiner | Form / Dropdown | lista (10.1) | Sim | Sempre |
| 11 | CTNR padrão alimento | Form / Input | texto livre | Não | Sempre |
| 12 | Trechos de rota | Route Row | 7.2 | Sim | Sempre |
| 13 | Deseja utilizar o Ecofrete…? | Form / Radio Group (com Description) | Sim / Não | Sim | Sempre |
| 14 | Tipo de embalagem da mercadoria | Form / Dropdown | lista (10.1) | Sim | Sempre |
| 15 | É necessário o envio de material de peação? | Form / Radio Group | Sim / Não | Sim | Sempre |
| 15a | Tipo | Form / Input | texto | Sim | 15 = **Sim** |
| 15b | Medidas | Form / Input | texto, placeholder "C x L x A (cm)" | Sim | 15 = **Sim** |
| 16 | Embarcador possui estrutura para o recebimento de contêiner? | Form / Radio Group | Sim / Não | Sim | Sempre |
| 16a | Coletado em | Form / Radio Group | Carreta / Slider | Sim | 16 = **Não** |
| 17 | Destinatário possui estrutura para o recebimento de contêiner? | Form / Radio Group | Sim / Não | Sim | Sempre |
| 17a | Coletado em | Form / Radio Group | Carreta / Slider | Sim | 17 = **Não** |
| 18 | Ajudantes ou numerário para a ovação na coleta? | Form / Radio Group | Sim / Não | Sim | Sempre |
| 18a | Número de ajudantes | Form / Input | inteiro de 1 a 20 | Sim | 18 = **Sim** |
| 18b | Valor do numerário | Form / Input | `R$` | Sim | 18 = **Sim** |
| 19 | Ajudantes ou numerário para a desova na entrega? | Form / Radio Group | Sim / Não | Sim | Sempre |
| 19a | Número de ajudantes | Form / Input | inteiro de 1 a 20 | Sim | 19 = **Sim** |
| 19b | Valor do numerário | Form / Input | `R$` | Sim | 19 = **Sim** |
| 20 | Quantidade de CNTRs/mês | Form / Input | inteiro | Sim | Sempre |
| 21 | Observações | Form / Text Area | texto livre | Não | Sempre |
| 22 | Aceite + "Solicitar cotação" | Quotation / Terms Checkbox | 7.4 | Sim | Sempre |

**Radios:** todos começam **sem seleção**. Ao revelar os campos condicionais, eles aparecem logo abaixo da pergunta, com uma transição curta (≤ 200 ms). Ao ocultar, os valores dos campos ocultos são limpos.

### 7.2 Modalidade e trechos de rota

- **Modalidade:** Porta a Porta, Porta a Porto, Porto a Porta, Porto a Porto.
  - O 1º termo define a **origem**: Porta → *Cidade de coleta*; Porto → *Porto de origem*.
  - O 2º termo define o **destino**: Porto → *Porto de destino*; Porta → *Cidade de entrega*.
- **Sem Modalidade:** os 4 campos de rota ficam visíveis e em `State=Disabled`.
- **Com Modalidade:** só os 2 campos aplicáveis aparecem, habilitados e obrigatórios. Trocar a Modalidade limpa os campos que deixaram de se aplicar.
- **"+ Adicionar trecho":**
  - adiciona um `Route Row / Type=Additional`, com o título "Trecho N" e o botão "Remover trecho", seguindo a mesma regra de Modalidade;
  - **máximo de 5 trechos**, e no limite o botão fica oculto;
  - o Trecho 1 não pode ser removido.

### 7.3 Upload FISPQ

- **Entrada:** arrastar e soltar na Dropzone ou clicar em "Busque no seu computador". Aceita vários arquivos.
- **Arquivos aceitos:** **PDF, JPG ou PNG**, até **10 MB** cada.
- **Estados da Dropzone:**
  - `Default`
  - `Drag Over`, enquanto há um arquivo sendo arrastado sobre a área
  - `Error`, quando o último lote teve algum arquivo rejeitado
- **Cada arquivo** vira um `Upload / File Item` com nome e tamanho formatado (por exemplo, "2,4 MB"):
  - **Válido:** fica em `Uploading`, com progresso simulado de cerca de 1–2 s, e passa para `Done`.
  - **Inválido:** fica em `Error`, com a mensagem "Formato não suportado. Envie PDF, JPG ou PNG." ou "Arquivo acima de 10 MB.".
  - O **X** remove o arquivo da lista.
- **Obrigatoriedade:** exige pelo menos 1 arquivo em `Done`.

### 7.4 Validação e envio

- **Quando valida:** ao **sair do campo** (blur) e também **no envio**.
- **Erros:**
  - campo em `State=Error` com a mensagem abaixo;
  - no Radio Group, `State=Error` com as opções também em `Error`.
- **Aceite:** "Solicitar cotação" fica **desabilitado** enquanto o aceite não estiver marcado (`Terms Checkbox State=Default`).
- **Envio com erros:** marca todos os campos inválidos, **rola até o primeiro erro** e **dá foco** nele.
- **Envio válido:**
  1. O botão passa para `State=Loading` ("Enviando…", com spinner) por cerca de 1,5 s, sem aceitar novo clique.
  2. Abre o **Modal de sucesso**.

### 7.5 Modal de sucesso (`Modal / Quotation Success`)

- **Título:** "Cotação solicitada com sucesso!"
- **Mensagem:** "Recebemos sua solicitação de cotação para Carga IMO. Você será notificado quando a proposta estiver disponível."
- **Selo Ecofrete:** aparece **só se** a pergunta 13 for **Sim** (`Show Ecofrete Seal`), com o texto "As emissões de CO₂ desta operação serão compensadas pelo Ecofrete.". Não exibe números.
- **Botões:**
  - "Nova cotação" (Secondary) zera o estado e volta para `/cotacao`.
  - "Visualizar propostas" (Primary) **só fecha** o modal e mantém a tela.
- **Fechamento:**
  - fecha pelos botões ou pela tecla **Esc**;
  - **não fecha** clicando no overlay (`color/bg/overlay`).
- **Foco:** ao abrir, vai para o botão primário e fica preso dentro do modal.

---

## 8. Mensagens

| Situação | Texto |
|---|---|
| Campo obrigatório vazio | Campo obrigatório. |
| Radio sem resposta | Selecione uma opção. |
| CNPJ inválido | CNPJ inválido. |
| Upload: formato | Formato não suportado. Envie PDF, JPG ou PNG. |
| Upload: tamanho | Arquivo acima de 10 MB. |
| Tooltip de opção indisponível | Em breve |

---

## 9. Acessibilidade

- Cada campo tem um `<label>` associado. Os Radio Groups usam `fieldset` e `legend`.
- Mensagens de erro ficam ligadas ao campo via `aria-describedby`, e o campo recebe `aria-invalid`.
- Foco visível usando `color/border/focus`. Se o token não existir, use `color/border/brand`.
- Navegação completa por teclado:
  - accordion com `aria-expanded`;
  - opções do seletor como radio group (setas e Espaço);
  - dropdowns abrem com Enter ou Espaço, navegam pelas setas e fecham com Esc;
  - a Dropzone é acionável com Enter.
- As opções desabilitadas ficam com `aria-disabled` e o tooltip também aparece no focus.
- Modal com `role="dialog"`, `aria-modal`, foco inicial e foco preso.
- Contraste conforme os tokens atuais.

---

## 10. Dados mockados

Todos os dados desta seção são **mock**.

**Usuário e empresa**

- Usuário: Fernando
- Empresa: Nome da Empresa LTDA.
- CNPJ / CUIT / RUIT: 0123456789991
- Inscrição Estadual: 098765431
- "O frete será pago pelo contratante"

### 10.1 Opções dos dropdowns (mock)

| Campo | Opções |
|---|---|
| Modalidade do transporte | Porta a Porta · Porta a Porto · Porto a Porta · Porto a Porto |
| Tipo de Mercadoria | Produtos químicos · Tintas e solventes · Combustíveis e derivados · Gases comprimidos · Baterias de lítio · Fertilizantes · Outros |
| Tamanho do contêiner | 20' DC · 40' DC · 40' HC |
| Tipo de contêiner | Dry · Reefer · Open Top · Flat Rack · Tank |
| Cidade de coleta / Cidade de entrega | São Paulo/SP · Campinas/SP · Curitiba/PR · Joinville/SC · Porto Alegre/RS · Manaus/AM · Recife/PE · Salvador/BA · Belo Horizonte/MG · Rio de Janeiro/RJ |
| Porto de origem / Porto de destino | Santos · Paranaguá · Itajaí · Navegantes · Rio Grande · Manaus · Suape · Salvador · Pecém · Vila do Conde |
| Tipo de embalagem da mercadoria | Caixa · Tambor · Bombona · IBC · Pallet · Saco |

Os dropdowns não têm busca. A lista rola quando passa de 5 itens (`Dropdown / Menu`).

---

## 11. Responsividade (guardrails)

O design existe só em desktop. Adapte seguindo estas regras:

| Faixa | Regras |
|---|---|
| **≥ 1280px** | Como o design. Conteúdo fluido entre o Side Menu e o painel. |
| **768–1279px** | Painel do contratante vira drawer, aberto pela aba "»". Linhas de 4 campos passam a 2 colunas. |
| **< 768px** | Side Menu vira drawer, aberto por um botão de menu no header. Header compacto (logo e título; WhatsApp só com o ícone). Todos os campos em 1 coluna. Nos cards de opção, o botão desce para baixo do texto. Grid do seletor em 1 coluna. Modal com largura de `100% - 2 × space/16`. |

---

## 12. Critérios de aceite

- [ ] Nenhuma cor, espaçamento, raio ou fonte com valor solto: tudo via tokens semânticos e estilos.
- [ ] Jornada completa: 01 → 02 → 04 → 05/06 → 10 → 11/12, igual ao protótipo da página Flows.
- [ ] O seletor de carga funciona como accordion. Só o IMO é selecionável, e as demais opções mostram "Em breve".
- [ ] Todos os campos condicionais da tabela 7.1 aparecem e somem conforme a resposta, e os valores ocultos são limpos.
- [ ] A Modalidade controla os campos de rota. "+ Adicionar trecho" funciona até 5 trechos, com remoção.
- [ ] As máscaras da seção 7.1 funcionam.
- [ ] O upload aceita e rejeita arquivos pelas regras da 7.3, com lista, progresso simulado e remoção.
- [ ] A validação acontece no blur e no envio, com rolagem e foco no primeiro erro, usando as mensagens da seção 8.
- [ ] O botão fica desabilitado sem o aceite, passa por Loading no envio e abre o modal com o selo condicionado ao Ecofrete.
- [ ] Modal: Esc fecha, o overlay não fecha, o foco fica preso, "Nova cotação" reinicia e "Visualizar propostas" fecha.
- [ ] Shell: Side Menu com hover-expand e Sustentabilidade ativa; painel recolhível; WhatsApp em nova aba.
- [ ] Acessibilidade conforme a seção 9. Responsividade conforme a seção 11.
