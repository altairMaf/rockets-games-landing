'use strict';
const byId=id=>document.getElementById(id);
const kit=window.RocketKit;
byId('motion-note').textContent=kit.reduced()?'Seu sistema pede movimento reduzido. Por isso, os efeitos automáticos estão pausados. Os botões de teste abaixo ativam voluntariamente cada efeito.':'Os botões abaixo reproduzem cada componente. Use Pausar movimentos para interromper os efeitos contínuos.';
let stopOpening=()=>{},stopCoins=()=>{},stopCursor=()=>{};
let coinsOn=false,cursorOn=false;
let stopFloat=kit.floatScene(byId('intro-stage'));
let stopReveal=kit.reveal(document.querySelectorAll('[data-rg-reveal]'));
byId('all-motion-test').onclick=()=>{document.documentElement.classList.add('rg-explicit-motion');stopFloat();stopFloat=kit.floatScene(byId('intro-stage'),{force:true});stopReveal();stopReveal=kit.reveal(document.querySelectorAll('[data-rg-reveal]'),{force:true});byId('motion-note').textContent='Prévias de flutuação, hover e zoom ativadas por você. Role até o fim para ver o bloco de zoom. Use Pausar movimentos para retornar à preferência do sistema.';};
byId('opening-test').onclick=()=>{stopOpening();stopOpening=kit.opening(byId('logo'),{force:true,button:byId('transition-test')});};
async function testTransition(duration){
  const buttons=[byId('transition-test'),byId('slow-test')];buttons.forEach(b=>b.disabled=true);
  byId('transition-status').textContent='Preparando a passagem…';
  try{await kit.transition({force:true,duration,onCovered:()=>{byId('transition-status').textContent='Tela coberta: este é o momento de mostrar a introdução.';}});byId('transition-status').textContent='Transição concluída. Neste catálogo, nenhum conteúdo de landing foi montado.';}
  catch(error){byId('transition-status').textContent='Não foi possível reproduzir a transição.';}
  finally{buttons.forEach(b=>b.disabled=false);}
}
byId('transition-test').onclick=()=>testTransition(1400);
byId('slow-test').onclick=()=>testTransition(4500);
byId('coins-test').onclick=()=>{stopCoins();coinsOn=!coinsOn;if(coinsOn)stopCoins=kit.coins(byId('coin-stage'),{force:true});byId('coins-test').textContent=coinsOn?'Parar moedas':'Testar moedas';byId('coins-test').setAttribute('aria-pressed',String(coinsOn));};
byId('cursor-test').onclick=()=>{stopCursor();cursorOn=!cursorOn;if(cursorOn)stopCursor=kit.cursor({force:true});const active=document.documentElement.classList.contains('rg-cursor-on');cursorOn=active;byId('cursor-test').textContent=active?'Voltar ao cursor padrão':'Testar cursor animado';byId('cursor-test').setAttribute('aria-pressed',String(active));byId('cursor-status').textContent=active?'Cursor animado ativo. Experimente o botão e o campo de texto.':'Cursor padrão ativo. O teste exige mouse preciso com hover.';};
byId('pause-test').onclick=()=>{stopOpening();stopCoins();stopFloat();stopCursor();stopReveal();document.documentElement.classList.remove('rg-explicit-motion');coinsOn=cursorOn=false;byId('coins-test').textContent='Testar moedas';byId('coins-test').setAttribute('aria-pressed','false');byId('cursor-test').textContent='Testar cursor animado';byId('cursor-test').setAttribute('aria-pressed','false');byId('cursor-status').textContent='Cursor padrão ativo. O teste é opcional.';byId('intro-stage').dataset.rgPaused='true';byId('motion-note').textContent='Movimentos contínuos pausados. Os botões de teste podem ser usados novamente.';};
kit.rocket(byId('rocket-test'),{status:byId('rocket-status'),force:true});
