/* ---------- v2 extras: sliding piece animation + audio unlock ---------- */
(function(){const _R0=R0;R0=function(){_R0();if(!ANIM)return;const a=ANIM;ANIM=null;if(vi>=0||!a.p)return;try{
 const bd=$('bd'),to=bd.querySelector('.sq[data-i="'+a.t+'"]');if(!to||!to.animate)return;
 const pos=i=>flip?[7-(i&7),7-(i>>3)]:[i&7,i>>3],[fx,fy]=pos(a.f),[tx,ty]=pos(a.t);
 const g=document.createElement('div');g.textContent=G[a.p.toLowerCase()]+'\uFE0E';g.className='gp '+(a.p<'a'?'pw':'pb');
 g.style.left=tx*12.5+'%';g.style.top=ty*12.5+'%';g.style.fontSize=getComputedStyle(bd).fontSize;
 $('bw').appendChild(g);to.classList.add('ghost');
 const done=()=>{g.remove();to.classList.remove('ghost')};
 const an=g.animate([{transform:'translate('+(fx-tx)*100+'%,'+(fy-ty)*100+'%)'},{transform:'translate(0,0)'}],{duration:170,easing:'cubic-bezier(.2,.8,.3,1)'});
 an.onfinish=done;an.oncancel=done;setTimeout(done,450)}catch(e){}}})();
['pointerdown','touchstart','keydown'].forEach(ev=>document.addEventListener(ev,()=>{try{AC=AC||new(window.AudioContext||window.webkitAudioContext)();if(AC.state==='suspended')AC.resume()}catch(e){}},{once:true,passive:true}));
try{$('aq').value=AQ;$('al').value=AL}catch(e){}
