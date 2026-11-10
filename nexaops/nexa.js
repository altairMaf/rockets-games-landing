(() => {
  'use strict';
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const root = document.documentElement;

  const abertura = $('#abertura'), site = $('#site');
  const conheca = $('#conheca');
  const screens = $$('.screen');
  const divisores = $$('.rg-divisor');
  const opt = { force: true };   // animações sempre ativas, sem opção de pausa

  let entered = false, stops = [], raf = 0;

  /* ---------- música de fundo ---------- */
  // O botão sempre reflete o estado real do áudio. Os navegadores bloqueiam o som
  // até o primeiro gesto do usuário; por isso, enquanto não toca, qualquer
  // clique/toque/tecla na página tenta iniciar a música.
  const audio = $('#musica'), somBtn = $('#som');
  let mutedByUser = false;
  audio.volume = .45;
  function setSomUI() {
    const on = !audio.paused;
    somBtn.setAttribute('aria-pressed', String(on));
    somBtn.title = on ? 'Desligar música' : 'Ligar música';
  }
  function tocar() {
    if (mutedByUser || !audio.paused) return;
    const p = audio.play();
    if (p && p.catch) p.catch(() => {});
  }
  audio.addEventListener('play', setSomUI);
  audio.addEventListener('playing', setSomUI);
  audio.addEventListener('pause', setSomUI);
  somBtn.addEventListener('click', () => {
    if (audio.paused) { mutedByUser = false; tocar(); }
    else { mutedByUser = true; audio.pause(); }
    setSomUI();
  });
  setSomUI();
  tocar();   // funciona se o navegador permitir autoplay
  const gestos = ['pointerdown', 'mousedown', 'click', 'touchstart', 'touchend', 'keydown'];
  function porGesto(e) {
    if (somBtn.contains(e.target)) return;   // o botão decide sozinho
    tocar();
  }
  gestos.forEach(ev => addEventListener(ev, porGesto, true));
  audio.addEventListener('playing', () => gestos.forEach(ev => removeEventListener(ev, porGesto, true)));

  /* ---------- zoom entre as partes + divisórias ---------- */
  const smooth = t => t * t * (3 - 2 * t);
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));

  function frame() {
    raf = 0;
    const vh = innerHeight;
    for (const s of screens) {
      const box = s.firstElementChild, r = s.getBoundingClientRect();
      let sc = 1, op = 1;
      if (r.top > 0) {
        const e = smooth(clamp(1 - r.top / (vh * .85)));
        sc = .8 + .2 * e; op = clamp(e * 1.6);
      } else if (r.bottom < vh * .9) {
        const e = smooth(clamp(r.bottom / (vh * .9)));
        sc = 1 + .14 * (1 - e); op = clamp(e * 1.4);
      }
      box.style.transform = sc === 1 ? '' : `scale(${sc.toFixed(4)})`;
      box.style.opacity = op === 1 ? '' : op.toFixed(3);
    }
    // faixas: deslizam na horizontal conforme a rolagem
    for (const d of divisores) {
      const r = d.getBoundingClientRect();
      const p = clamp((r.top - vh / 2) / vh, -1, 1);
      d.firstElementChild.style.translate = `${(p * -1.5).toFixed(2)}vw 0`;
    }
    markDot();
  }
  const queue = () => { if (!raf) raf = requestAnimationFrame(frame); };

  /* ---------- pontos laterais ---------- */
  const dots = document.createElement('nav');
  dots.className = 'dots'; dots.hidden = true; dots.setAttribute('aria-label', 'Seções');
  const names = ['Início', 'Plataforma', 'Como funciona', 'Lista de espera', 'Dúvidas'];
  screens.forEach((s, i) => {
    const a = document.createElement('a');
    a.href = '#' + s.id; a.title = names[i]; a.setAttribute('aria-label', names[i]);
    dots.append(a);
  });
  document.body.append(dots);
  function markDot() {
    let best = 0, bd = 1e9;
    screens.forEach((s, i) => { const d = Math.abs(s.getBoundingClientRect().top); if (d < bd) { bd = d; best = i; } });
    $$('a', dots).forEach((a, i) => a.classList.toggle('on', i === best));
  }

  /* ---------- foguetes cruzando o fundo da abertura (um por vez, sem exagero) ---------- */
  function fundoFoguetes(cena) {
    let timer = 0, vindo = true, vivo = true;
    const lanca = () => {
      if (!vivo) return;
      const el = document.createElement('div');
      el.className = 'bg-rocket' + (vindo ? '' : ' volta');
      el.setAttribute('aria-hidden', 'true');
      const w = Math.round(70 + Math.random() * 50), t = 7 + Math.random() * 3;
      el.style.setProperty('--w', w + 'px');
      el.style.setProperty('--t', t.toFixed(1) + 's');
      el.style.setProperty('--y', (10 + Math.random() * 70).toFixed(0) + '%');
      const img = document.createElement('img');
      img.src = '../P0/09-complementos/04-ilustracoes/foguete-direita.png'; img.alt = '';
      el.append(img); cena.append(el);
      el.addEventListener('animationend', () => el.remove());
      vindo = !vindo;
      timer = setTimeout(lanca, 5500 + Math.random() * 3000);
    };
    timer = setTimeout(lanca, 800);
    return () => { vivo = false; clearTimeout(timer); $$('.bg-rocket', cena).forEach(e => e.remove()); };
  }

  /* ---------- fundo animado das dúvidas (cristais 2x + onda nas bolinhas) ---------- */
  function fundoDuvidas(secao) {
    const fundo = RocketFaqBackground.mount(secao, { speed: 2 });
    // mount() põe a camada como primeiro filho; frame() só pode animar o .screen__in
    secao.append($('.rg-faq-layer', secao));
    fundo.play({ force: true });
    return () => fundo.destroy();
  }

  /* ---------- efeitos ---------- */
  function start() {
    stops.forEach(f => { try { f(); } catch (e) {} });
    root.classList.add('rg-explicit-motion');
    stops = [RocketKit.cursor(opt)];
    if (!entered) {
      stops.push(RocketKit.opening($('.logo-h1'), { force: true, button: conheca }));
      stops.push(RocketKit.floatScene(abertura, opt));
      stops.push(fundoFoguetes(abertura));
    } else {
      stops.push(RocketKit.floatScene($('#cena-intro'), opt));
      stops.push(RocketKit.floatScene($('#plataforma'), opt));
      stops.push(RocketKit.coins($('#plataforma'), opt));
      stops.push(RocketKit.floatScene($('#cena-lista'), opt));
      stops.push(fundoDuvidas($('#duvidas')));
      stops.push(RocketKit.reveal($$('[data-rg-reveal]'), opt));
      queue();
    }
  }

  /* ---------- abertura -> site ---------- */
  function showSite() {
    if (entered) return;
    entered = true;
    abertura.hidden = true;
    site.hidden = false;
    dots.hidden = false;
    document.body.classList.remove('locked');
    window.scrollTo({ top: 0, behavior: 'instant' });
    start();
    const t = $('#t-intro'); if (t) t.focus({ preventScroll: true });
  }

  conheca.addEventListener('click', async () => {
    conheca.disabled = true;
    tocar();
    try { await RocketKit.transition({ force: true, onCovered: showSite }); }
    finally { conheca.disabled = false; }
  });

  addEventListener('scroll', () => { if (entered) queue(); }, { passive: true });
  addEventListener('resize', () => { if (entered) queue(); });

  /* ---------- dúvidas frequentes: cada botão abre/fecha a sua resposta ---------- */
  $$('.faq-btn').forEach(b => b.addEventListener('click', () => {
    const resp = document.getElementById(b.getAttribute('aria-controls'));
    const abrir = resp.hidden;
    resp.hidden = !abrir;
    b.setAttribute('aria-expanded', String(abrir));
  }));

  /* ---------- assistente virtual: Nexa responde sozinha, sempre on-line ---------- */
  const chatJanela = $('#chat-janela'), chatAbrir = $('#chat-abrir'), chatMsgs = $('.chat-msgs');
  const respostas = [
    [/senha|login|segur|oauth|minha conta/, 'Você não entrega sua senha. A autorização acontece na página oficial do Mercado Livre e a NexaOPS recebe só uma chave de acesso da sua loja, que você revoga com um clique.'],
    [/custa|preço|preco|valor|pag|grát|grat|plano/, 'Entrar na lista de espera é gratuito e não pede cartão. Os planos serão apresentados quando o acesso for liberado.'],
    [/funciona|foto|anúnc|anunc/, 'Você autoriza sua loja, manda a foto do produto e a IA monta título, descrição, categoria e atributos. Você confere e o anúncio é publicado na sua conta do Mercado Livre.'],
    [/disponív|disponiv|quando|lança|lanca|pronto/, 'Ainda não está disponível: a NexaOPS está em validação. Quem entra na lista de espera é chamado primeiro.'],
    [/shopee|amazon|magalu|marketplace|canal|canais|mercado/, 'A primeira fase é o Mercado Livre. Shopee, Amazon e Magalu estão no plano das próximas fases.'],
    [/bling|erp/, 'O Bling é o primeiro ERP previsto no roadmap. Outras integrações dependem da demanda dos vendedores.'],
    [/sozinh|humano|pessoa|substitu|revis/, 'A IA cuida do trabalho repetitivo e você supervisiona: confere o anúncio antes de publicar e decide o que pede uma pessoa.'],
    [/jogo|game|xbox|ps4|ps5|playstation|switch|nintendo|mídia|midia/, 'Começamos por jogos de videogame em mídia física: a IA identifica nome do jogo, plataforma, edição e estado de conservação.'],
    [/lista|espera|inscre|entrar|vaga/, 'É só preencher o formulário da seção Lista de espera, aqui na página. Leva menos de um minuto.'],
    [/cadastr/, 'Você autoriza sua loja, manda a foto do produto e a IA monta título, descrição, categoria e atributos. Você confere e o anúncio é publicado na sua conta do Mercado Livre.'],
    [/oi|olá|ola|eae|e aí|bom dia|boa tarde|boa noite/, 'Oi! Pode perguntar sobre o cadastro por foto, segurança da sua conta, marketplaces ou a lista de espera.'],
  ];
  function msg(texto, quem) {
    const li = document.createElement('li');
    li.className = quem; li.textContent = texto;
    chatMsgs.append(li); chatMsgs.scrollTop = chatMsgs.scrollHeight;
    return li;
  }
  function perguntar(texto) {
    texto = texto.trim(); if (!texto) return;
    msg(texto, 'eu');
    const t = texto.toLowerCase();
    const r = respostas.find(([re]) => re.test(t));
    const dig = msg('Nexa está digitando…', 'bot digitando');
    setTimeout(() => {
      dig.remove();
      msg(r ? r[1] : 'Boa pergunta! Ainda não tenho essa resposta. Entre na lista de espera e conte sua dúvida: o time fala com você.', 'bot');
    }, 900);
  }
  function chat(abrir) {
    chatJanela.hidden = !abrir;
    chatAbrir.setAttribute('aria-expanded', String(abrir));
    if (abrir) $('#chat-texto').focus(); else chatAbrir.focus();
  }
  chatAbrir.addEventListener('click', () => chat(chatJanela.hidden));
  $('.chat-fechar').addEventListener('click', () => chat(false));
  $$('.chat-sugestoes button').forEach(b => b.addEventListener('click', () => perguntar(b.textContent)));
  $('.chat-form').addEventListener('submit', e => {
    e.preventDefault();
    const campo = $('#chat-texto');
    perguntar(campo.value); campo.value = '';
  });

  /* ---------- lista de espera: valida e confirma (página estática, nada é enviado) ---------- */
  const form = $('#form-lista'), formStatus = $('#form-status');
  const canais = $('#f-canais');
  form.addEventListener('submit', e => {
    e.preventDefault();
    let primeiro = null;
    $$('input[required],select[required]', form).forEach(c => {
      const ok = c.checkValidity() && c.value.trim() !== '';
      c.setAttribute('aria-invalid', String(!ok));
      if (!ok && !primeiro) primeiro = c;
    });
    const algumCanal = $$('input[name=canais]', form).some(c => c.checked);
    canais.setAttribute('aria-invalid', String(!algumCanal));
    if (!algumCanal && !primeiro) primeiro = $('input[name=canais]', form);
    if (primeiro) {
      formStatus.className = 'status erro';
      formStatus.textContent = 'Confira os campos marcados com * antes de enviar.';
      primeiro.focus();
      return;
    }
    form.classList.add('enviado');
    formStatus.className = 'status ok';
    formStatus.textContent = 'Pronto! Você está na lista. Vamos chamar pelo WhatsApp quando abrir sua vaga.';
  });
  form.addEventListener('input', e => {
    const c = e.target;
    if (c.getAttribute('aria-invalid') === 'true' && c.checkValidity() && c.value.trim()) c.setAttribute('aria-invalid', 'false');
    if (c.name === 'canais') canais.setAttribute('aria-invalid', 'false');
  });

  /* ---------- foguete (4 s, bloqueia o botão até sumir) ---------- */
  RocketKit.rocket($('#foguete'), { status: $('#foguete-status'), force: true });

  start();
})();
