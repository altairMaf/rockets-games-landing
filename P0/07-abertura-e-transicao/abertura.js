const intro=document.getElementById('intro'),content=document.getElementById('conteudo'),wipe=document.getElementById('wipe'),enter=document.getElementById('enter'),status=document.getElementById('status'),motion=document.getElementById('motion'),motionNote=document.getElementById('motion-note'),testOpening=document.getElementById('test-opening'),testTransition=document.getElementById('test-transition');
const reduce=matchMedia('(prefers-reduced-motion: reduce)');
let busy=false,pause=reduce.matches,swapTimer,finishTimer;
function restartLogo(){const logo=document.querySelector('.logo-motion');logo.style.animation='none';void logo.offsetWidth;logo.style.animation=''}
function syncMotion(){
 document.body.classList.toggle('motion-off',pause);
 document.body.classList.toggle('motion-enabled',!pause);
 motion.setAttribute('aria-pressed',String(!pause));
 motion.textContent=pause?'Ativar animações':'Pausar animações';
 motionNote.textContent=pause?'Animações pausadas'+(reduce.matches?' pela preferência de movimento reduzido.':'.')+' Use os testes abaixo para visualizar os efeitos.':'Animações ativadas. Clique em ENTRAR para ver a transição ou teste em câmera lenta abaixo.';
}
syncMotion();
motion.onclick=()=>{if(busy)return;pause=!pause;syncMotion();if(!pause)restartLogo()};
reduce.addEventListener('change',()=>{pause=reduce.matches;syncMotion()});
function showStore(){intro.hidden=true;content.hidden=false;document.body.classList.add('in-store');window.scrollTo(0,0)}
function setBusy(value){busy=value;[enter,testOpening,testTransition,motion].forEach(button=>button.disabled=value)}
function finishTransition(){
 if(!busy)return;
 clearTimeout(swapTimer);clearTimeout(finishTimer);showStore();
 wipe.hidden=true;wipe.style.animation='none';setBusy(false);
 status.textContent="Bem-vindo à Rocket's Games. Conteúdo disponível.";
 content.focus({preventScroll:true});
}
function go({animate=true,force=false,duration=1400}={}){
 if(busy)return;setBusy(true);
 if(!animate||(pause&&!force)){finishTransition();return}
 status.textContent='Exibindo transição de chamas.';
 wipe.style.animation='none';wipe.hidden=false;void wipe.offsetWidth;
 wipe.style.animation='flame-pass '+duration+'ms linear both';
 swapTimer=setTimeout(showStore,duration*.5);
 finishTimer=setTimeout(finishTransition,duration+200);
}
wipe.addEventListener('animationend',event=>{if(event.target===wipe&&event.animationName==='flame-pass')finishTransition()});
enter.onclick=()=>go();
testOpening.onclick=()=>{pause=false;syncMotion();restartLogo();status.textContent='Exibindo abertura animada.'};
testTransition.onclick=()=>go({force:true,duration:4500});
document.getElementById('skip').onclick=event=>{event.preventDefault();go({animate:false})};
document.getElementById('replay').onclick=()=>{if(busy)return;content.hidden=true;intro.hidden=false;document.body.classList.remove('in-store');restartLogo();window.scrollTo(0,0);testTransition.focus({preventScroll:true});status.textContent='Abertura reiniciada. Os testes estão disponíveis abaixo do botão Entrar.'};

