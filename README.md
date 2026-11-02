# FieldNorth — Terraplenagem e Máquinas

Revisão brasileira do conceito fictício de Miguel Ramos, implementada a partir do briefing de sete páginas de 2 de novembro de 2026. Página em pt-BR para terraplenagem e máquinas com operador, com Cascavel/Toledo como referências ilustrativas. React/TypeScript/CSS no projeto gerenciado existente. Sem banco de dados de produto, autenticação ou envio de solicitações. Preview para aprovação; nenhuma publicação automática.

## Reproduce the web-only build

Package manager: **Bun 1.4.4** (the runtime actually used and recorded in the root `packageManager`), with committed `bun.lock`. The web workspace is **`@template/web`**, located at **`packages/web`**. Run from the project root:

```sh
bun install --filter @template/web --frozen-lockfile
bun run build:web
```

`build:web` invokes only the web workspace’s build: frontend/config TypeScript checks followed by `vite build`. It does not build Expo or Electron. Production output is **`packages/web/dist/`**. Vite uses `base: "/"`; deploy the contents of this directory to a **domain root**, not a subdirectory. No API server, database, environment secrets or Runable account session is needed to use the built page or its interactions.

Alternatively, from `packages/web`, run `bun run build`. Do **not** run the root `bun run build` for this deployment: that template command builds every workspace.

## Preview the static output

After building, from the root:

```sh
python3 -m http.server 8080 --bind 127.0.0.1 --directory packages/web/dist
```

Open `http://127.0.0.1:8080/`. This serves files only and proves the site does not depend on the template API. A modern browser and HTTP hosting are required; opening `index.html` with `file://` is not supported for module scripts.

For video seeking/replay QA, use `python3 tests/serve-static-range.py` and open `http://127.0.0.1:4503/`. The basic Python server above lacks byte-range support; use range-capable HTTP hosting for native video seeking.

For editing in Runable, `bun run dev` starts the managed web service on its assigned port **4200**, as defined in `__ports.cjs` / `.runable/ports.json`. Never change that port. Deployment controls in Runable remain platform-managed.

## Implementation

- Âncoras: `inicio`, `servicos`, `maquinas`, `aplicacoes`, `planejamento`, `como-funciona`, `duvidas`, `orcamento`.
- Serviços com seleção por teclado; duas máquinas; pré-seleções preservadas no planejador.
- Três aplicações ilustrativas, lightboxes e menu móvel com Escape, contenção de foco e retorno de foco.
- Foto/planejamento: mesma fotografia com anotações de área de trabalho/acesso. Alternância por botões nativos, toque e teclado; sem antes/depois.
- Planejador: múltiplos serviços, máquina opcional, cidade, condições locais, resumo/cópia/edição/reinício. Sem nome, e-mail, CPF, preços ou reserva.
- Dados do pedido apenas na memória do componente; recarregar limpa tudo. Um marcador não pessoal de abertura em `sessionStorage` controla somente a versão curta da animação na mesma sessão.
- Abertura de quatro segundos sem esconder texto/CTAs; retorno de 800ms; revelações únicas de 700ms. Hero desktop com vídeo local de miniescavadeira trabalhando (7,208s, 720p, 24fps, sem áudio, 1,363MB na fonte / 0,722MB no build). Carregamento após conteúdo primário; pausa/reprodução e replay com scroll/reset. Mobile/touch, reduced-motion e save-data mantêm fotografia sem baixar vídeo.
- Metadados pt-BR, `noindex,follow`, imagens locais e favicon. Sem avaliações, depoimentos, clientes ou obras fictícias apresentados como reais.

Conteúdo atual: `src/web/components/br-content.ts`; página: `br-site.tsx`; planejador: `br-planner.tsx`; estilo: `src/web/br.css` (caminhos relativos a `packages/web`). Os arquivos antigos permanecem como histórico, mas não são importados pela página atual. `design.md`, `ASSETS.md` e `fieldnorth-br.report/content.md` registram direção, licenças e testes.

## Remaining platform dependencies

O selo Runable permanece removido. O plugin de analytics obrigatório foi preservado e injeta **`/runable.js`**, que pode enviar pageviews genéricos para **`https://r.lilstts.com/events`**. O coletor da plataforma não é um backend do planejador. Testes de requisições não encontraram os dados de exemplo do pedido nos payloads; isso não é uma promessa de ausência total de telemetria da plataforma.

The template QueryClient provider and backend scaffolding remain intact but are not called by this frontend. Development-only AgentFeedback is preserved for the Runable preview; it is absent from production when built in production mode. A source export without provisioned environment values uses the public `fieldnorth-portfolio` identifier only to avoid the template’s localhost diagnostics overlay; the real platform application identifier takes precedence. There is no telemetry-free claim for the platform itself.

## Verification

Correção atual do hero: `fieldnorth-hero-video.report/content.md`, `tests/results/hero-video/acceptance.json` e `tests/results/hero-video-preview/acceptance-preview.json` (36/36 cada); regressão completa `tests/results/br-video-regression.json` (292/292). Para repetir: inicie o servidor range acima e execute `TEST_URL=http://127.0.0.1:4503/ python3 tests/hero-video.py`. No preview: `TEST_URL=http://localhost:4200/ TEST_OUT=tests/results/hero-video-preview python3 tests/hero-video.py`.

Revisão brasileira anterior: `fieldnorth-br.report/content.md`, `tests/results/br-acceptance.json`, `br-clean-acceptance.json` e seis arquivos `br-lh-{mobile,desktop}-{1,2,3}.json`. Esses Lighthouse e os ZIPs anteriores não incluem o vídeo atual; não representam seu desempenho ou export. Regressão de interações:

```sh
python3 -m http.server 4500 --bind 127.0.0.1 --directory packages/web/dist
# In another terminal (requires Python playwright + Google Chrome):
python3 tests/brazil.py
```

O arquivo de código brasileiro exclui credenciais, dependências e caches. O ZIP estático brasileiro usa o build sem `.env` e inclui apenas os recursos atuais necessários (e analytics/fontes). É para o diretório raiz do domínio. Preparar esses arquivos não atualiza Runable ou Hostinger; publicar somente após a revisão de Miguel.
