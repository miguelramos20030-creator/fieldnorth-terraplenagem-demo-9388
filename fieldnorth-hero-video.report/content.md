# FieldNorth — correção do vídeo no hero

## Resultado

O hero `#inicio` agora usa **filmagem real de uma miniescavadeira escavando, levantando e despejando terra**, não uma foto com zoom. Vídeo local somente no desktop com ponteiro fino/hover. Layout, textos existentes, cores, poster e demais seções preservados; acrescido apenas o controle de pausa/reprodução junto de “Rever abertura”. **Nenhuma publicação realizada.**

Preview e build de produção passaram **36/36 verificações cada**. A regressão das demais interações passou **292/292**. Build web e lint aprovados.

## Arquivo e origem

| Propriedade | Verificado com ffprobe |
|---|---|
| Caminho local | `packages/web/public/videos/br-compact-machine-loop.mp4` |
| Duração | 7,208333 segundos |
| Resolução | 1280 × 720 |
| Quadros | 24 fps constantes; 173 quadros |
| Codec | H264, yuv420p, faststart |
| Áudio | Nenhuma faixa de áudio |
| Tamanho no preview/fonte | 1.362.505 bytes — 1,363 MB |
| Tamanho no build | 721.902 bytes — 0,722 MB |

Fonte: [Pexels 5554470 — People Digging Soil Using a Mini Excavator](https://www.pexels.com/video/people-digging-soil-using-a-mini-excavator-5554470/), **Marc Van den Broeck**. Página oficial e [licença Pexels](https://www.pexels.com/license/) verificadas nesta correção. Uso e edição em websites permitidos pela licença; nenhuma exclusividade, autorização de marca ou endosso é afirmado. Cena ilustrativa: não representa obra, frota ou localização da FieldNorth.

Edição: trecho a partir de seis segundos, espelhamento horizontal para manter a caçamba à direita e dissolução final de 0,5 segundo entre fim/início. O loop retorna sem quadro preto ou corte seco; **o fechamento é uma dissolução visível**, não uma ação originalmente cíclica com poses idênticas. O último quadro da mistura alcança o início antes da continuação. O otimizador gerenciado reduz o tamanho no build sem alterar duração, resolução, fps ou ausência de áudio.

## Comportamento

- Poster, título, botões e navegação disponíveis antes do vídeo. A fonte é montada após `window.load`, duas oportunidades de pintura e 250ms; não há overlay bloqueante. Teste reteve a resposta MP4 e navegou normalmente durante a espera.
- Vídeo nativo `muted`, `playsInline`, `loop`. Revelado apenas ao começar a reprodução. Falha de arquivo conserva a imagem; autoplay recusado oferece “Reproduzir vídeo”.
- “Pausar vídeo” é botão nativo, com área mínima de 44px e foco visível por teclado. Espaço pausa; reproduzir retoma. A pausa manual não é desfeita por sair e voltar ao hero.
- Fora da tela ou com documento oculto, mídia e efeitos param. Retorno retoma apenas se não houver pausa manual.
- “Rever abertura” volta imediatamente ao início, reinicia a entrada de quatro segundos e zera o vídeo, inclusive depois de pausa/scroll e antes da resposta de mídia. A entrada de 800ms em visita de retorno **não impede reprodução**.
- Mobile/touch, `prefers-reduced-motion` e save-data: poster estático, sem elemento de vídeo ou fonte oculta. **Zero requisições MP4** em 320px, 390px, touch/landscape 844px e desktop com reduced-motion/save-data. No mobile normal permanece a entrada CSS leve; reduced-motion remove animações.

## Evidência de máquina em movimento

Durante reprodução contínua no Chrome, `currentTime` avançou de **0,3637s para 1,0064s**, e quadros decodificados de **10 para 28**. Não foi apenas uma verificação de relógio: os screenshots abaixo foram capturados durante reprodução sem saltos e inspecionados visualmente. Mostram a caçamba no solo, levantada com terra e despejando sobre a pilha.

![Caçamba escavando, levantando e despejando terra durante reprodução no navegador](/home/user/fieldnorth/fieldnorth-hero-video.report/machine-motion.jpg)

![Hero durante reprodução](/home/user/fieldnorth/tests/results/hero-video/playing-lifting.png)

Frames decodificados diretamente para canvas em 0,5s e 3,5s também diferiram na região da caçamba: diferença média de **28 níveis de pixel**. Essa comparação exclui o transform/zoom CSS do hero. A travessia natural do fim do loop e os frames da dissolução/retorno foram conferidos; sem imagem preta nas capturas.

Pausa por teclado manteve `currentTime` em **1,1225s** nas duas amostras. Replay a partir da página rolada voltou a `scrollY = 0`; primeira leitura após reset/reinício em **0,0854s**, já reproduzindo. Entrada novamente em 4000ms.

## Testes e arquivos alterados

| Verificação | Resultado / evidência |
|---|---|
| Hero no build estático com byte-range | 36/36 — `tests/results/hero-video/acceptance.json` |
| Hero no preview gerenciado, porta 4200 | 36/36 — `tests/results/hero-video-preview/acceptance-preview.json` |
| Navegação, serviços, planner, lightbox, menu, FAQ e overlay em 320/390/768/1440 | 292/292 — `tests/results/br-video-regression.json` |
| Build web / lint | Aprovados; avisos existentes de configuração Vite/depreciação permanecem |
| Erros JavaScript no teste do hero | Nenhum |

Implementação: `br-site.tsx`, novo hook `br-hero-motion.ts`, regras locais do vídeo em `br.css` e MP4 em `public/videos/`. Documentação atualizada em `design.md`, `ASSETS.md`, `README.md` e `task.md`. A única expectativa obsoleta da regressão foi atualizada: desktop agora contém um vídeo, mobile continua sem vídeo. Nenhuma lógica do planner, conteúdo de serviços ou plumbing gerenciado foi alterada.

Reprodução dos testes:

```sh
bun run build:web
bun run lint
python3 tests/serve-static-range.py
# Outro terminal:
TEST_URL=http://127.0.0.1:4503/ python3 tests/hero-video.py
TEST_URL=http://localhost:4200/ TEST_OUT=tests/results/hero-video-preview python3 tests/hero-video.py
REPORT_NAME=br-video-regression.json python3 tests/brazil.py
```

O teste de regressão acima usa o servidor histórico na porta 4500; iniciar com `python3 -m http.server 4500 --bind 127.0.0.1 --directory packages/web/dist` se necessário. Para buscar posições no vídeo, o servidor de hero suporta `Range`/HTTP 206. O servidor Python simples originalmente usado em QA não suportava faixas e restringia seeks a zero; esse limite do servidor foi identificado e corrigido **no ambiente de teste**, sem editar a infraestrutura gerenciada.

## Limites

Verificado no Chrome Linux, com viewports/touch emulados. Eventos de aba oculta/visível foram simulados; não equivalem a teste físico de gerenciamento de energia. Safari/iOS, Firefox, aparelhos físicos e leitor de tela real não foram testados. Autoplay real depende da política do navegador; caminho de recuperação foi testado com recusa simulada.

Não foram refeitos Lighthouse ou medições de campo. Os antigos 98/100 pertencem à versão **sem vídeo** e não são reutilizados como desempenho desta correção. ZIPs anteriores também não incluem a nova mídia; não foram regenerados. Este resultado é um preview para revisão, não uma atualização publicada.