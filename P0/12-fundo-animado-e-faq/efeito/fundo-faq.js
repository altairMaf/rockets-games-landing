/* Rocket's Games — fundo em camadas, sem bibliotecas. */
(function(global){
 'use strict';
 const base=document.currentScript.src;
 const instances=new WeakMap();
 const specs=[
  {name:'lima-grande',left:'-3%',top:'-8%',width:'32%',dx:52,dy:36,seconds:12,phase:.25},
  {name:'lima-fino',left:'11%',top:'-13%',width:'25%',dx:48,dy:34,seconds:14,phase:.57},
  {name:'ciano-esquerda',left:'-10%',top:'17%',width:'29%',dx:61,dy:23,seconds:11,phase:.54},
  {name:'ciano-direita',right:'-7%',top:'-7%',width:'29%',dx:-24,dy:67,seconds:13,phase:.08},
  {name:'amarelo-direita',right:'-10%',bottom:'15%',width:'28%',dx:-53,dy:42,seconds:12.5,phase:.72},
  {name:'laranja-base',right:'-12%',bottom:'-15%',width:'65%',dx:-72,dy:18,seconds:16,phase:.25}
 ];
 function mount(scene,{autoplay=true,speed=1}={}){
  if(instances.has(scene))return instances.get(scene);
  if(!scene)throw new Error('Informe o elemento da seção.');
  const hadClass=scene.classList.contains('rg-faq-scene');scene.classList.add('rg-faq-scene');
  const layer=document.createElement('div');layer.className='rg-faq-layer';layer.setAttribute('aria-hidden','true');
  const canvas=document.createElement('canvas');canvas.className='rg-faq-dots';layer.append(canvas);
  const ctx=canvas.getContext('2d');
  if(!ctx){if(!hadClass)scene.classList.remove('rg-faq-scene');throw new Error('Canvas indisponível; use o fundo estático.');}
  const crystals=specs.map(spec=>{
   const img=document.createElement('img');img.className='rg-faq-crystal';img.dataset.name=spec.name;img.alt='';img.draggable=false;
   img.src=new URL('../cristais/'+spec.name+'.svg',base).href;
   ['left','right','top','bottom'].forEach(key=>{if(spec[key])img.style[key]=spec[key];});
   img.style.setProperty('--rg-width',spec.width);layer.append(img);return {img,...spec};
  });
  scene.prepend(layer);scene.classList.add('rg-faq-ready');
  const media=matchMedia('(prefers-reduced-motion: reduce)');
  let enabled=autoplay&&!media.matches,visible=true,destroyed=false,frame=0,last=0,time=0,width=0,height=0,dpr=1;
  let rate=Math.max(.25,Math.min(2,Number(speed)||1));
  function draw(){
   if(!width||!height)return;
   ctx.clearRect(0,0,width,height);
   const scale=Math.max(.52,Math.min(1,width/1700)),step=36*scale;
   for(let row=0,y=-step;y<height+step;row++,y+=step){
    for(let col=0,x=-step;x<width+step;col++,x+=step){
     const nx=Math.max(0,Math.min(1,x/width)),ny=Math.max(0,Math.min(1,y/height));
     const strength=Math.max((1-nx)*ny,nx*(1-ny),.34*nx*ny);
     const center=Math.min(1,Math.max(0,(Math.hypot((nx-.5)*1.4,(ny-.46)*1.3)-.19)*3));
     const phase=time*1.05-col*.22-row*.29;
     const dx=Math.sin(phase)*8*scale,dy=Math.cos(phase*.92)*11*scale;
     const radius=(1+14*strength*strength)*scale*(1+.065*Math.sin(phase));
     ctx.fillStyle=`rgba(126,127,142,${(.25*strength*center).toFixed(3)})`;
     ctx.beginPath();ctx.arc(x+dx,y+dy,radius,0,Math.PI*2);ctx.fill();
    }
   }
   const motionScale=width<700?.6:1;
   crystals.forEach(crystal=>{
    // Increasing phase always travels toward the tip; reset occurs while fully transparent.
    const phase=(time/crystal.seconds+crystal.phase)%1;
    const progress=(phase-.5)*2;
    crystal.img.style.transform=`translate3d(${(crystal.dx*progress*motionScale).toFixed(2)}px,${(crystal.dy*progress*motionScale).toFixed(2)}px,0)`;
    const envelope=Math.min(1,phase/.13,(1-phase)/.13);
    crystal.img.style.opacity=String(Math.max(0,envelope));
   });
  }
  function resize(){
   const r=scene.getBoundingClientRect();width=Math.max(1,Math.round(r.width));height=Math.max(1,Math.round(r.height));dpr=Math.min(global.devicePixelRatio||1,1.5);
   canvas.width=Math.round(width*dpr);canvas.height=Math.round(height*dpr);ctx.setTransform(dpr,0,0,dpr,0,0);draw();
  }
  function tick(now){
   if(destroyed||!enabled||!visible||document.hidden){frame=0;last=0;return;}
   if(!last)last=now;
   const delta=now-last;
   if(delta>=1000/30){time+=Math.min(delta,100)/1000*rate;last=now;draw();}
   frame=requestAnimationFrame(tick);
  }
  function sync(){
   const running=enabled&&visible&&!document.hidden&&!destroyed;
   scene.dataset.rgFaqState=running?'playing':'paused';
   if(running&&!frame){last=0;frame=requestAnimationFrame(tick);}
   else if(!running){cancelAnimationFrame(frame);frame=0;last=0;}
  }
  const onVisibility=()=>sync();
  const onPreference=()=>{if(media.matches)enabled=false;sync();};
  document.addEventListener('visibilitychange',onVisibility);media.addEventListener('change',onPreference);
  const observer=new ResizeObserver(resize);observer.observe(scene);
  const intersection='IntersectionObserver'in global?new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;sync();},{threshold:0}):null;
  if(intersection)intersection.observe(scene);
  const api={
   play({force=false}={}){if(destroyed)return false;if(media.matches&&!force)return false;enabled=true;sync();return true;},
   pause(){enabled=false;sync();},
   setSpeed(value){rate=Math.max(.25,Math.min(2,Number(value)||1));return rate;},
   getState(){return {enabled,running:enabled&&visible&&!document.hidden&&!destroyed,speed:rate,reducedMotion:media.matches,crystals:crystals.length};},
   destroy(){if(destroyed)return;destroyed=true;enabled=false;sync();observer.disconnect();if(intersection)intersection.disconnect();document.removeEventListener('visibilitychange',onVisibility);media.removeEventListener('change',onPreference);layer.remove();scene.classList.remove('rg-faq-ready');if(!hadClass)scene.classList.remove('rg-faq-scene');delete scene.dataset.rgFaqState;instances.delete(scene);}
  };
  instances.set(scene,api);resize();sync();return api;
 }
 global.RocketFaqBackground={mount};
})(window);
