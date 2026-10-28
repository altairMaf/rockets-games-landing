# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Visão geral

Landing page estática e fictícia (fins didáticos) da loja "Rocket's Games". HTML/CSS/JS puros, sem build, sem dependências, sem testes automatizados. Todo o texto, nomes de arquivos e comentários estão em português — mantenha assim.

Para ver: abra `index.html` no navegador ou sirva a pasta com qualquer servidor estático (ex.: `python -m http.server`). Caminhos são todos relativos à raiz; o nome do áudio (`P0/10-Sons/Som de Fundo.mp3`) tem espaços.

## Arquitetura

O site em si são só três arquivos na raiz: `index.html`, `site.css`, `site.js`. Tudo em `P0/` é um **kit de assets e componentes** entregue pronto (imagens, fontes, SVGs, demos, guias `.txt`) que o site consome por caminho relativo. Trate `P0/` como fonte: prefira não editar os originais; ajustes de layout vão em `site.css`.

### Fluxo da página
1. `#abertura` — tela cheia fixa (`body.locked` impede rolagem) com logo 3D, elementos flutuantes e foguetes de fundo. O botão `#conheca` dispara a transição.
2. `RocketKit.transition` cobre a tela com chamas (1400 ms); no meio (`onCovered`) `showSite()` esconde a abertura, mostra `<main id="site">`, remove `locked`, foca `#t-intro` e chama `start()` de novo.
3. `<main>` tem 4 seções `.screen` (intro, mercado, motivos, contato) separadas por `.rg-divisor` (arte SVG com altura zero, irmã das seções — não pode ficar dentro de elemento com `overflow:hidden`).

### `site.js`
- `start()` sempre executa as funções de limpeza em `stops` antes de montar os efeitos da fase atual (abertura vs. site). Ao adicionar um efeito, empurre a função de limpeza que ele retorna em `stops`.
- `frame()` (via `requestAnimationFrame` no scroll) aplica zoom/opacidade no primeiro filho de cada `.screen` e desliza as divisórias horizontalmente; também atualiza a navegação por pontos (`nav.dots`, criada em JS — a lista `names` deve acompanhar a ordem das `.screen`).
- Música de fundo: navegadores bloqueiam autoplay, então qualquer gesto tenta tocar até começar; o botão `#som` reflete o estado real do `<audio>`.
- Todos os efeitos são chamados com `{force: true}`: o movimento é intencionalmente sempre ativo, mesmo com `prefers-reduced-motion` (a classe `rg-explicit-motion` no `<html>` sinaliza isso ao CSS).

### `RocketKit` (`P0/09-complementos/05-movimentos/componentes.js` + `.css`)
Objeto global sem dependências: `opening`, `floatScene`, `coins`, `reveal`, `rocket`, `transition`, `cursor`, `reduced`. Quase todo método retorna uma função de limpeza; não monte duas instâncias no mesmo elemento. Os assets internos são resolvidos relativos à URL do próprio script, então a estrutura de pastas de `P0/` não pode mudar. Convenções esperadas pelo kit (detalhes em `P0/09-complementos/05-movimentos/COMO-USAR.txt`):
- `.rg-float-scene` > `.rg-float` (wrapper recebe o deslocamento do mouse) > `img` (flutua com `--rg-drift`).
- `[data-rg-reveal]` para entrada no scroll; o card com hover (`.rg-card`) fica aninhado dentro do wrapper de revelação, nunca no mesmo elemento.
- `rocket()` exige botão real + elemento `role="status"`; bloqueia o botão por 4000 ms.

### Estilo
- Paleta em `:root` de `site.css` (`--ink`, `--lime`, `--yellow`, `--cyan`, `--red`, `--panel`), vinda do kit.
- Botões usam PNGs de `P0/02-botoes/` como fundo (`.btn-img` + `.btn-amarelo|azul|vermelho`); texto do botão é sempre HTML real (`.rotulo`), nunca embutido em imagem.
- Fonte: Montserrat local (`P0/06-tipografia/fontes.css`), peso 900 em títulos.
- Breakpoints: 860px (layout) e 700px (divisórias mobile via `<picture>`).

## Referências no kit
- `P0/COMECE-AQUI.html`, `P0/GALERIA.html`, `P0/09-complementos/ABRA-O-CATALOGO.html`: catálogos/demos dos assets.
- `P0/09-complementos/01-textos/`: textos-fonte da página.
- `P0/11-divisores-de-secao/COMO-USAR.txt`: regras de posicionamento das divisórias (reservar ~70–90 px livres de cada lado da emenda no desktop, 50 px no celular).
- `rascunhos/` é local e não versionado.
