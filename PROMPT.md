Implemente o frontend da jornada de cotação **Carga IMO com Ecofrete** da Mercosul Line, como uma SPA em **React + TypeScript**. Você decide o bundler, a estilização e as bibliotecas.

Esta tarefa avalia a construção de UI. Não existe backend: todos os dados são mockados e o estado fica em memória.

## Fontes de verdade

1. **`SPEC.md`**, na raiz deste repositório. Define comportamento, regras, dados mockados, rotas e critérios de aceite. Leia o arquivo inteiro antes de escrever código.
2. **O arquivo Figma**, `https://www.figma.com/design/GFZ6IR7gOYRvtUgfLVSEOM/ML-CC` (fileKey `GFZ6IR7gOYRvtUgfLVSEOM`), acessado pelo Figma MCP. Define visual, componentes e estados.

Em caso de conflito, o SPEC decide o comportamento e o Figma decide o visual. Se algo não estiver coberto por nenhum dos dois, escolha a opção mais simples coerente com o design e registre a escolha em `DECISIONS.md`. Não pare para perguntar.

## Como ler o Figma

O mapa de nós completo está na seção 2 do SPEC. Siga esta ordem:

1. **Cover** (`16:1004`): README do arquivo, com convenções de nomes e tokens.
2. **Variáveis e estilos:** use `get_variable_defs` para extrair as coleções `Primitives` e `Semantic` e os estilos de texto e sombra.
3. **Componentes** (página `4:998`): use `get_design_context` e `get_screenshot` em cada componente listado no SPEC. Leia a **descrição** de cada um, que diz o que cada variante e propriedade significa.
4. **Telas-base** (`1:715` e `1:733`, página Ecofrete): elas têm **anotações do Dev Mode** em cada elemento com comportamento. Leia todas.
5. **Flows** (página `28:2`): os 12 estados de tela, de 01 a 12. Use-os como referência visual de cada estado e para conferir o seu resultado.

## Regras obrigatórias

- **Tokens, nunca valores soltos.**
  - Gere variáveis CSS a partir das variáveis do Figma, com os nomes do code syntax (`--color-text-heading`, `--space-16`, `--radius-4`…).
  - Aplique na UI **só os tokens semânticos**. Os primitivos existem apenas para alimentar os semânticos.
  - Opacidade: no Figma é 0–100, no CSS é 0–1.
- **Fontes:** Roboto Condensed e Antonio, pelo Google Fonts, reproduzindo os estilos de texto do Figma.
- **Componentes:** crie um componente React para cada componente do Figma que as telas usam, com props que espelhem as propriedades e variantes dele (`variant`, `size`, `state`/estado derivado, `label`, `errorMessage`…). As telas devem ser montadas só com esses componentes.
- **Ícones:** exporte os ícones do Figma (Chevron, User, Info, Warning, Upload, Check, Close, Check Circle, Spinner e os ícones de 32px do menu). Não substitua por uma biblioteca de ícones. A cor vem sempre de `--color-icon-*`.
- **Imagens:** exporte o logo Ecofrete e o logo do header a partir do Figma.
- **Textos da UI:** em PT-BR, exatamente como no Figma e no SPEC.
- **Escopo:** nada além do SPEC. Não crie telas, integrações nem funcionalidades que não estejam descritas lá. Destinos fora do escopo são inertes.

## O que entregar

- O app rodando, com um comando documentado (por exemplo, `npm install && npm run dev`).
- As rotas `/cotacao` e `/cotacao/imo`, com o comportamento completo das seções 4 a 7 do SPEC:
  - accordion do tipo de carga, com tooltip "Em breve";
  - campos condicionais;
  - Modalidade controlando a rota e os trechos dinâmicos (até 5);
  - máscaras;
  - upload simulado, com validação de tipo e tamanho;
  - validação no blur e no envio, com rolagem e foco no primeiro erro;
  - Loading no envio;
  - modal de sucesso com o selo Ecofrete condicionado à resposta.
- O shell: header, Side Menu com expansão por hover e painel do contratante recolhível.
- Acessibilidade conforme a seção 9 do SPEC e responsividade conforme a seção 11.
- Um `README.md` curto, com como rodar, a estrutura de pastas e onde ficam tokens e componentes.
- Um `DECISIONS.md` com toda decisão que o SPEC e o Figma não cobriam, e o porquê de cada uma.

## Como verificar antes de encerrar

1. **Estados:** rode o app e reproduza os 12 estados da página Flows (01 → 12). Compare cada um com o `get_screenshot` do frame correspondente e corrija as divergências visuais.
2. **Critérios de aceite:** percorra a seção 12 do SPEC item por item e marque cada um como atendido ou não, com uma justificativa curta. Coloque essa lista no fim do `README.md`.
3. **Valores soltos:** procure no código cores hex/rgb, `px` fora dos tokens e `font-family` escrito à mão. Os únicos permitidos são os do arquivo de tokens.

Encerre só quando os 12 estados estiverem reproduzidos e todos os critérios de aceite atendidos, ou com as pendências explicadas no README.
