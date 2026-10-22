/* Rocket's Games: componentes independentes. Sem dependências e sem página montada. */
(function (global) {
  'use strict';
  const scriptURL = document.currentScript.src;
  const asset = path => new URL(path, scriptURL).href;
  const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = () => matchMedia('(hover: hover) and (pointer: fine)').matches;
  const noop = () => {};

  function opening(logo, {force = false, button = null} = {}) {
    logo.classList.remove('rg-opening');
    logo.dataset.rgForce = String(force);
    if (reduced() && !force) return noop;
    void logo.offsetWidth;
    logo.classList.add('rg-opening');
    if (button) button.classList.add('rg-breathe');
    return () => { logo.classList.remove('rg-opening'); if(button) button.classList.remove('rg-breathe'); };
  }

  function floatScene(scene, {force=false}={}) {
    if (reduced()&&!force) return noop;
    scene.dataset.rgPaused='false';
    const items = [...scene.querySelectorAll('.rg-float')];
    let x=0, y=0, tx=0, ty=0, frame=0, disposed=false;
    function tick() {
      if(disposed) return;
      x+=(tx-x)*.09; y+=(ty-y)*.09;
      items.forEach((el,i) => { const depth=.45+(i%4)*.18; el.style.setProperty('--rg-x',`${x*depth}px`); el.style.setProperty('--rg-y',`${y*depth}px`); });
      if(Math.abs(tx-x)+Math.abs(ty-y)>.05) frame=requestAnimationFrame(tick); else frame=0;
    }
    function move(event) {
      if(!fine() || event.pointerType==='touch') return;
      const r=scene.getBoundingClientRect();
      tx=((event.clientX-r.left)/r.width-.5)*24; ty=((event.clientY-r.top)/r.height-.5)*24;
      if(!frame) frame=requestAnimationFrame(tick);
    }
    function leave(){tx=ty=0;if(!frame)frame=requestAnimationFrame(tick);}
    function visibility(){scene.dataset.rgPaused=String(document.hidden);}
    function stop(){disposed=true;scene.dataset.rgPaused='true';cancelAnimationFrame(frame);scene.removeEventListener('pointermove',move);scene.removeEventListener('pointerleave',leave);document.removeEventListener('visibilitychange',visibility);media.removeEventListener('change',change);items.forEach(el=>{el.style.removeProperty('--rg-x');el.style.removeProperty('--rg-y');});}
    function change(){if(reduced()&&!force)stop();}
    const media=matchMedia('(prefers-reduced-motion: reduce)');media.addEventListener('change',change);
    scene.addEventListener('pointermove',move);scene.addEventListener('pointerleave',leave);document.addEventListener('visibilitychange',visibility);
    return stop;
  }

  function coins(scene, {force=false, count=8} = {}) {
    if(reduced()&&!force) return noop;
    const layer=document.createElement('div');layer.className='rg-coins';layer.dataset.rgForce=String(force);layer.setAttribute('aria-hidden','true');
    for(let i=0;i<Math.max(1,Math.min(8,count));i++){
      const coin=document.createElement('span');coin.className='rg-coin';coin.style.left=`${6+i*12}%`;
      coin.style.setProperty('--rg-size',`${34+(i%3)*13}px`);coin.style.setProperty('--rg-time',`${3.8+(i%4)*.35}s`);coin.style.setProperty('--rg-delay',`${-i*.69}s`);
      const img=document.createElement('img');img.src=asset('../../03-elementos/moeda-estrela.png');img.alt='';coin.append(img);layer.append(coin);
    }
    scene.append(layer);
    const resize=()=>layer.style.setProperty('--rg-floor',`${Math.max(90,scene.clientHeight+10)}px`);
    resize();const observer=new ResizeObserver(resize);observer.observe(scene);
    const visibility=()=>{layer.dataset.rgPaused=String(document.hidden);};
    document.addEventListener('visibilitychange',visibility);visibility();
    const media=matchMedia('(prefers-reduced-motion: reduce)');const change=()=>{if(media.matches&&!force)stop();};media.addEventListener('change',change);
    function stop(){observer.disconnect();layer.remove();document.removeEventListener('visibilitychange',visibility);media.removeEventListener('change',change);}
    return stop;
  }

  function reveal(elements, {force=false}={}) {
    const targets=[...elements];
    if((reduced()&&!force)||!('IntersectionObserver' in global)) return noop;
    const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{
      if(entry.isIntersecting){entry.target.classList.add('rg-visible');observer.unobserve(entry.target);}
    }),{threshold:.08,rootMargin:'0px 0px -3% 0px'});
    targets.forEach(el=>{el.classList.add('rg-reveal-ready');observer.observe(el);});
    return ()=>{observer.disconnect();targets.forEach(el=>el.classList.remove('rg-reveal-ready','rg-visible'));};
  }

  function rocket(button, {status=null, force=false, src=asset('../04-ilustracoes/foguete-direita.png')} = {}) {
    let busy=false,timer=0,layer=null,disposed=false;
    const label=button.textContent, wasDisabled=button.disabled;
    const preview=new Image();preview.src=src;
    function finish(message='Missão concluída. Pode lançar de novo!'){
      clearTimeout(timer);if(layer){layer.remove();layer=null;}
      busy=false;button.disabled=wasDisabled;button.removeAttribute('aria-busy');button.textContent=label;
      if(status)status.textContent=message;
    }
    function launch(){
      if(busy||disposed||wasDisabled)return;
      busy=true;button.disabled=true;button.setAttribute('aria-busy','true');button.textContent='Foguete em voo…';
      if(status)status.textContent='Foguete em voo por 4 segundos.';
      layer=document.createElement('div');layer.className='rg-rocket-layer';layer.setAttribute('aria-hidden','true');
      const img=document.createElement('img');img.alt='';img.className='rg-rocket'+(reduced()&&!force?' rg-rocket-reduced':'');
      img.onerror=()=>finish('Não foi possível carregar o foguete. Confira o caminho do arquivo.');img.src=src;layer.append(img);document.body.append(layer);
      timer=setTimeout(()=>finish(),4000);
    }
    button.addEventListener('click',launch);
    return ()=>{disposed=true;button.removeEventListener('click',launch);finish('');};
  }

  let transitioning=false;
  function transition({onCovered=noop, force=false, duration=1400}={}) {
    if(transitioning)return Promise.resolve(false);
    if(reduced()&&!force){onCovered();return Promise.resolve(true);}
    transitioning=true;
    return new Promise((resolve,reject)=>{
      const wipe=document.createElement('img');wipe.className='rg-wipe';wipe.alt='';wipe.setAttribute('aria-hidden','true');
      wipe.src=asset('../../07-abertura-e-transicao/transicao-chamas.svg');wipe.style.setProperty('--rg-wipe-time',`${duration}ms`);
      let mid=0,end=0,called=false,done=false;
      const cover=()=>{if(!called){called=true;onCovered();}};
      const finish=(error)=>{if(done)return;done=true;clearTimeout(mid);clearTimeout(end);wipe.remove();transitioning=false;error?reject(error):resolve(true);};
      wipe.onload=()=>{if(done)return;clearTimeout(end);document.body.append(wipe);mid=setTimeout(()=>{try{cover();}catch(e){finish(e);}},duration*.5);end=setTimeout(()=>finish(),duration+80);};
      wipe.onerror=()=>{try{cover();finish();}catch(e){finish(e);}};
      end=setTimeout(()=>{try{cover();finish();}catch(e){finish(e);}},5000);
    });
  }

  function cursor({root=document.documentElement,force=false}={}) {
    if(!fine()||(reduced()&&!force))return noop;
    const halo=document.createElement('div');halo.className='rg-cursor-halo';halo.hidden=true;halo.setAttribute('aria-hidden','true');
    const art=document.createElement('img');art.src=asset('../06-cursor/halo.svg');art.alt='';halo.append(art);document.body.append(halo);halo.dataset.rgForce=String(force);root.classList.add('rg-cursor-on');if(force)root.classList.add('rg-force-cursor');
    let x=0,y=0,tx=0,ty=0,frame=0,seen=false,disposed=false;const bursts=new Set();
    function tick(){if(disposed)return;x+=(tx-x)*.2;y+=(ty-y)*.2;halo.style.transform=`translate3d(${x-24}px,${y-24}px,0)`;if(Math.abs(tx-x)+Math.abs(ty-y)>.1)frame=requestAnimationFrame(tick);else frame=0;}
    function move(e){
      if(e.pointerType==='touch')return;
      const field=e.target.closest('input,textarea,[contenteditable=true]');halo.hidden=!!field;
      tx=e.clientX;ty=e.clientY;if(!seen){x=tx;y=ty;seen=true;}
      halo.dataset.active=String(!!e.target.closest('a,button,[role=button]'));
      if(!frame)frame=requestAnimationFrame(tick);
    }
    function click(e){
      if(e.pointerType==='touch'||e.target.closest('input,textarea,[contenteditable=true]'))return;
      const burst=document.createElement('img');burst.className='rg-cursor-burst';burst.dataset.rgForce=String(force);burst.src=asset('../06-cursor/impacto-clique.svg');burst.alt='';burst.setAttribute('aria-hidden','true');burst.style.left=`${e.clientX-28}px`;burst.style.top=`${e.clientY-28}px`;document.body.append(burst);bursts.add(burst);
      setTimeout(()=>{burst.remove();bursts.delete(burst);},400);
    }
    function leave(){halo.hidden=true;seen=false;}function keyboard(e){if(e.key==='Tab')leave();}
    const media=matchMedia('(prefers-reduced-motion: reduce)'),pointer=matchMedia('(hover: hover) and (pointer: fine)');
    function change(){if((media.matches&&!force)||!pointer.matches)stop();}
    function stop(){disposed=true;cancelAnimationFrame(frame);halo.remove();bursts.forEach(el=>el.remove());root.classList.remove('rg-cursor-on','rg-force-cursor');root.removeEventListener('pointermove',move);root.removeEventListener('pointerdown',click);root.removeEventListener('pointerleave',leave);root.removeEventListener('keydown',keyboard);global.removeEventListener('blur',leave);media.removeEventListener('change',change);pointer.removeEventListener('change',change);}
    root.addEventListener('pointermove',move);root.addEventListener('pointerdown',click);root.addEventListener('pointerleave',leave);root.addEventListener('keydown',keyboard);global.addEventListener('blur',leave);media.addEventListener('change',change);pointer.addEventListener('change',change);
    return stop;
  }
  global.RocketKit={opening,floatScene,coins,reveal,rocket,transition,cursor,reduced};
})(window);
