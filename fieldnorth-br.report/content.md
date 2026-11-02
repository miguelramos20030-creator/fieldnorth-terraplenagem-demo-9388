# FieldNorth Brasil — revisão e testes

**Preview pronto para revisão de Miguel. Nada foi publicado no Runable ou na Hostinger.** A revisão do briefing de sete páginas foi aplicada ao projeto existente, com conteúdo em pt-BR, novas fotografias locais, máquinas, aplicações e simulação de orçamento. Os testes de produção passaram; os resultados de laboratório atendem aos orçamentos medidos. Notebook e celular físicos ainda precisam de validação com Miguel.

## O que mudou

- FieldNorth com o descritor **Terraplenagem e Máquinas**. Cascavel e Toledo são apenas referências do conceito fictício. Florida, condados, ZIP e serviços de manejo florestal não aparecem na página atual.
- Textos fornecidos em português preservados, incluindo descrições, FAQ, avisos e rodapé. `lang="pt-BR"`, título, descrição, compartilhamento, alternativas de imagem, controles e validações localizados.
- Visual verde-floresta/marfim/âmbar, títulos grandes, fotografia assimétrica e alternância de superfícies. Referência LaMomentum inspecionada; não foram copiadas provas comerciais, avaliações ou estatísticas.
- Três serviços com seleção por teclado; duas máquinas com grandes imagens e usos, sem inventar modelos, especificações, disponibilidade ou reserva.
- Três aplicações ilustrativas, ampliação em lightbox, Escape, contenção de foco e retorno ao botão original.
- Planejamento sobre **a mesma fotografia**, alternando foto e anotações de área de trabalho/acesso. Não é antes/depois. Botões nativos funcionam com toque e teclado.
- Planejador local com múltiplos serviços, máquina opcional, cidade, localidade/área/acesso opcionais, descrição, exemplo, edição, retorno, cópia e reinício. Não exige dados pessoais; não envia, precifica ou reserva nada. Pré-seleções de serviços/máquinas se somam às escolhas existentes e preservam as condições preenchidas.
- Selo Runable permanece ausente. Plugin de analytics e estrutura gerenciada preservados. Sem novos serviços pagos, API de produto, banco, cadastro ou pagamento.

## Movimento e escolha de mídia

**Fotografia, sem vídeo.** Foram usadas cenas de stock ilustrativas locais, em vez de adicionar um clipe cuja plausibilidade, loop e desempenho não foram comprovados. Não houve geração ou contratação de vídeo, nem deformação da máquina para simular movimento.

- Primeira visita na sessão: enquadramento de **4.000 ms**, movimento curto da marca/linha âmbar, detalhe gráfico, marcas de composição e indicador de rolagem. Título, texto, navegação e CTAs não são escondidos por animações.
- Retorno na mesma sessão: **800 ms**. “Rever abertura” reinicia apenas os efeitos leves; navegar ou editar o orçamento não reinicia a abertura.
- Um marcador `fieldnorth-opening=seen` em `sessionStorage` guarda somente a preferência de abertura, **não o pedido**. Uma nova sessão pode receber a abertura completa novamente.
- Revelações únicas via IntersectionObserver: **22 px / 700 ms**, pequeno escalonamento e zoom discreto de fotografia em hover/foco. Efeitos do hero pausam fora da tela e com a aba oculta.
- Reduced motion e save-data detectável desabilitam efeitos decorativos. Nenhuma URL/player de vídeo existe, inclusive no celular. Pausa/autoplay/codec/limite de vídeo são, portanto, **não aplicáveis**.
- Falha do hero testada: o fundo escuro, texto e botões permanecem disponíveis.

## Testes concluídos

| Verificação | Resultado |
|---|---|
| Projeto principal: `bun run lint && bun run build:web` | Passou, sem erros de lint/TypeScript/build |
| Produção gerenciada, servidor somente de arquivos, sem login | **292/292 verificações** |
| Build de reprodução sem `.env`, servidor somente de arquivos | Build passou; **292/292 verificações** |
| 320, 390, 768 e 1440 px | Sem overflow horizontal observado; capturas e interações verificadas |
| Menu/âncoras do topo, meio e fim | Todos os seis destinos de navegação/orçamento passaram em cada largura |
| Menu fecha antes de navegar | Fechamento síncrono, âncora nativa e `scroll-margin-top`; sem offsets acumulados |
| Links diretos com fragmento | Alinhamento abaixo do cabeçalho verificado |
| Abertura, retorno e replay | Durações 4.000/800/4.000 ms verificadas; CTAs utilizáveis durante a abertura |
| Reduced motion, save-data e falha de imagem | Conteúdo e controles preservados; sem vídeo; efeitos desligados nos dois primeiros |
| Teclado | Serviços com setas/Home/End; menu/lightbox com Escape, foco contido e restaurado; alternância do planejamento |
| Toque emulado | Planejamento e controles testados em contexto móvel com toque |
| Planejador | Multisseleção, pré-seleção, exemplo, validações pt-BR, volta/edição, unidades m²/ha, resumo, clipboard e reset passaram |
| Memória/privacidade do pedido | Recarregar limpa os campos; payloads observados não continham os dados de teste do pedido |
| FAQ e idioma | Cinco respostas fornecidas; metadados pt-BR; nenhuma alternativa de imagem vazia ou texto legado inglês detectado |
| Imagens | Hero eager/high priority; imagens abaixo da dobra lazy; dimensões/aspectos reservados; sem hotlink |
| Preview em execução, 390/1440 | Sem erros JavaScript; fluxo exemplo → resumo passou |
| ZIP estático mínimo | Integridade do ZIP, caminhos de todas as fotos, exemplo/resumo e lightbox passaram com rede externa bloqueada; sem erros JS/HTTP |

Foi usado Google Chrome 156 no Linux, com Playwright, emulação de larguras/toque e servidores locais HTTP. Os 292 checks são asserções automatizadas, não 292 testes em aparelhos físicos. O lint foi executado no projeto principal; a reprodução usa dependências filtradas do workspace web, sem o executável de lint da raiz instalado. Seu build TypeScript/Vite e a suíte de interface foram verificados separadamente.

Na verificação inicial, foram corrigidos contraste das etapas inativas, correspondência entre nomes acessíveis e textos visíveis, rótulos estáveis dos campos e seleção de serviços por setas. A imagem responsiva ganhou variante de 960 px para reduzir transferências próximas à dobra. Falhas transitórias dos scripts de teste foram corrigidas com espera por atualização de estado/clipboard e navegação real de documento para fragmentos; a suíte completa foi repetida nos dois builds.

## Lighthouse — seis execuções com cache frio

**Lighthouse 13.6.0**, Chrome headless 156/Linux, em processos novos, servidor de arquivos local `127.0.0.1:4500`, build de produção gerenciado. Execuções sequenciais, sem outro benchmark concorrente. Servidor sem compressão HTTP; as transferências abaixo incluem recursos locais carregados durante a auditoria, inclusive imagens próximas à dobra. Sem vídeo excluído da conta.

- Mobile padrão: **412 × 823**, DPR **1,75**, rede/CPU simuladas; RTT 150 ms, throughput 1.638,4 Kbps, CPU 4×.
- Desktop padrão: **1350 × 940**, DPR **1**, rede simulada; RTT 40 ms, throughput 10.240 Kbps, CPU 1×.
- As larguras de aceite 320/390/768/1440 foram inspecionadas à parte; não são as dimensões padrão desses relatórios Lighthouse.

| Métrica | Mobile — três runs | Desktop — três runs |
|---|---|---|
| Performance | 98 / 98 / 99; **mediana 98** | 100 / 100 / 100; **mediana 100** |
| LCP | 0,923 / 0,914 / 0,925 s; **mediana 0,923 s** | 0,253 / 0,248 / 0,245 s; **mediana 0,248 s** |
| TBT | 150 / 149,5 / 102 ms; **mediana 149,5 ms** | 4 / 3 / 10 ms; **mediana 4 ms** |
| CLS | **0** nas três | **0** nas três |
| Transferência auditada | **862.491 bytes — 0,862 MB** | **926.279 bytes — 0,926 MB** |
| Acessibilidade automatizada | 100 / 100 / 100 | 100 / 100 / 100 |
| Boas práticas | 100 / 100 / 100 | 100 / 100 / 100 |

O alvo de Performance ≥90 foi atingido em todas as seis medições. As medianas de LCP e CLS também estão dentro dos alvos de laboratório. **TBT não é INP.** Não foi medida aprovação de INP ≤200 ms nem o percentil 75 de visitas reais. Scores locais, mesmo altos, não garantem o mesmo resultado após publicar, em outra rede ou no notebook de Miguel.

As auditorias ainda indicam oportunidades em bytes JavaScript não usados, cache HTTP e dimensionamento/compressão de algumas imagens secundárias. Não foi removido código gerenciado de analytics para melhorar números. A amostra inicial anterior à otimização transferia aproximadamente 1,1 MB; o build final ficou abaixo de 1 MB nos dois perfis.

### Build medido e orçamentos

- JavaScript gerenciado: `index-BeWtNTL3.js`, **487.995 bytes brutos / cerca de 145,2 KB gzip**, conforme Vite. `/runable.js`: 11.987 bytes brutos / cerca de 3,9 KB gzip. Total JS comprimido aproximado **149 KB**, abaixo dos 200 KB solicitados. Isso é tamanho de compressão, não uma afirmação de que o servidor de teste entregou gzip.
- CSS: `index-F9IBHF8H.css`, **41.461 bytes / cerca de 9,4 KB gzip**. HTML: **1.854 bytes**.
- Font: uma família Manrope local, estilos 400/700, WOFF2 **24.532 bytes**, `font-display: swap`.
- Hero WebP: **54.420 / 109.470 / 173.258 bytes**, variantes 640/960/1200 px. A maior fica abaixo do alvo de 180 KB. `srcset/sizes`, preload correspondente e prioridade alta.
- Fotos secundárias, 640/960/1200: miniescavadeira **67.276 / 129.222 / 193.792** bytes; terreno **30.656 / 54.002 / 92.374**; escavação **45.118 / 73.858 / 116.850**. Compartilhamento: `br-social.jpg`, **205.090 bytes**, não requerido pelo render inicial.
- Reprodução sem `.env`: `index-oFhKfgl2.js`, **252,82 KB brutos / 79,06 KB gzip**, mesma interface. Os seis scores apresentados são do build gerenciado maior, não desse build menor.
- SHA-256 do JS medido: `647fcd8be8088bbe524732ce78d473e7591fbd909e81ed967ca8ffaa8ee562d4`. Hash do CSS: `5f46f4ffe20416bf8732c3e1e39ef9086cce67dffa700f67035be64522663fad`.

As seis auditorias foram repetidas após o ajuste final de legibilidade dos avisos/rodapé. A rodada anterior tinha mediana mobile 99; a rodada final acima tem mediana 98. O relatório e os JSONs entregues correspondem ao build final, não à primeira rodada.

## Exportação e recuperação

- Backup pré-revisão: `fieldnorth-before-br.tar.gz`, sem `.env`, dependências ou `.git`.
- Código revisado: `fieldnorth-br-source.zip`, sem credenciais/caches; inclui documentação e evidência de testes da revisão.
- Estático: `fieldnorth-br-static.zip`, build sem `.env`, contendo os arquivos necessários da revisão brasileira. Mantém `/runable.js` e licenças/fontes; omite imagens/vídeos antigos não utilizados.
- Para Hostinger, o conteúdo do estático vai na **raiz do domínio**, não em uma subpasta. Clipboard exige contexto seguro HTTPS na hospedagem; em falha, há texto para copiar manualmente.
- O site funciona sem sessão/conta Runable e sem servidor de aplicação. O coletor opcional de pageviews da plataforma continua uma dependência externa de analytics; o pedido não é conectado a ele.
- Preparar ou entregar o ZIP **não publica nem altera a hospedagem atual**. Publicar/exportar a revisão aprovada somente pelo fluxo combinado após Miguel revisar.

## Pendências e limites

1. **Notebook de Miguel e telefone físico:** ainda não testados. Repetir carregamento frio, rolagem e cliques nesses aparelhos antes de aprovar fluidez final.
2. **INP e CWV de campo:** sem dados de visitas reais/p75; não há aprovação de campo. TBT e LCP simulados são diagnósticos.
3. **Outros navegadores e tecnologia assistiva:** Safari/iOS, Firefox, leitores de tela reais e navegação por voz não testados. Lighthouse 100 não certifica acessibilidade completa.
4. **Hospedagem real:** sem medição de DNS/TLS/CDN, cache, gzip/Brotli ou Lighthouse na Hostinger/publicação final. Nenhum teste de preview por crawler de redes sociais foi feito.
5. **Mídia/licenças:** fotografias Pexels identificadas pelo índice oficial e usadas conforme sua licença; acesso direto ao Pexels recebeu desafio do navegador. Não se alega posse da frota, localização paranaense das fotos, endosso de fabricante, release de propriedade/modelo ou autorização de marca para futura empresa real.
6. **Ferramentas:** permanecem avisos do Vite sobre loader nativo futuro e depreciação Node `module.register()`. Não impediram os builds. O projeto principal passou lint sem erros.

## Evidências e fontes

No código entregue: `tests/brazil.py`; `tests/results/br-acceptance.json`; `br-clean-acceptance.json`; `br-motion-metadata.json`; `br-export-check.json`; `br-performance-summary.json`; seis `br-lh-{mobile,desktop}-{1,2,3}.json`. `ASSETS.md` registra todos os URLs e o status de uso das fotografias/fontes. Arquivos históricos de testes não são evidência desta revisão.

- Fonte de requisitos: **FieldNorth-Demo-Brasil-Revisao-Runable**, sete páginas fornecidas por Miguel, 2 de novembro de 2026.
- Referência visual inspecionada: https://lamomen-yk4bsnk-preview-4200.runable.site/ — acesso em 2 de novembro de 2026.
- Licença e uso comercial Pexels: https://www.pexels.com/license/ e https://help.pexels.com/hc/en-us/articles/360042295214-Can-I-use-the-photos-and-videos-for-a-commercial-project — consulta via índice em 2 de novembro de 2026; URLs de cada foto em `ASSETS.md`.
- Referências técnicas fornecidas no briefing: https://web.dev/articles/defining-core-web-vitals-thresholds ; https://web.dev/learn/performance/video-performance ; https://web.dev/articles/animations-and-performance . Os valores de aceite usados aqui são os do briefing; os resultados são os JSONs locais, não estimativas desses artigos.