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
  const audio = $('#musica'), somBtn = $('#som');
  let mutedByUser = false;
  audio.volume = .45;
  function setSomUI() {
    const on = !mutedByUser;
    somBtn.setAttribute('aria-pressed', String(on));
    somBtn.title = on ? 'Desligar música' : 'Ligar música';
  }
  function tocar() {
    if (mutedByUser) return;
    const p = audio.play();
    if (p && p.catch) p.catch(() => {});
  }
  somBtn.addEventListener('click', () => {
    mutedByUser = !mutedByUser;
    if (mutedByUser) audio.pause(); else tocar();
    setSomUI();
  });
  setSomUI();
  tocar();   // navegadores só liberam áudio após um gesto: tenta de novo no primeiro toque/tecla
  ['pointerdown', 'keydown', 'touchstart'].forEach(ev =>
    addEventListener(ev, function once() {
      if (!audio.paused) { removeEventListener(ev, once, true); return; }
      tocar();
    }, true));

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
  const names = ['Introdução', 'Mercado', '3 motivos', 'Contato'];
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
      img.src = 'P0/09-complementos/04-ilustracoes/foguete-direita.png'; img.alt = '';
      el.append(img); cena.append(el);
      el.addEventListener('animationend', () => el.remove());
      vindo = !vindo;
      timer = setTimeout(lanca, 5500 + Math.random() * 3000);
    };
    timer = setTimeout(lanca, 800);
    return () => { vivo = false; clearTimeout(timer); $$('.bg-rocket', cena).forEach(e => e.remove()); };
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
      stops.push(RocketKit.floatScene($('#mercado'), opt));
      stops.push(RocketKit.coins($('#mercado'), opt));
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

  /* ---------- foguete (4 s, bloqueia o botão até sumir) ---------- */
  RocketKit.rocket($('#foguete'), { status: $('#foguete-status'), force: true });

  start();
})();
