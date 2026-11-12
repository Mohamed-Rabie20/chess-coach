/* v12: faster game analysis. Extra Stockfish workers search the game's positions in parallel; the normal rating pass then finds every result in the cache. */
window.DBGGAP=(()=>{try{return localStorage.getItem('chessDbg')==='1'}catch(e){return false}})();
window.ANX=(()=>{
 const $=id=>document.getElementById(id);
 const setting=()=>{try{return localStorage.getItem('chessWorkers')||'auto'}catch(e){return 'auto'}};
 const want=()=>{const v=setting();let hc=2;try{hc=navigator.hardwareConcurrency||2}catch(e){}
  let n=v==='auto'?Math.min(3,Math.max(1,Math.floor(hc/2))):Math.max(1,Math.min(4,+v||1));
  if(window.SFNEW&&/full/i.test(window.SFNEW.name||''))n=Math.min(n,2);return n};
 let ws=[];
 async function mk(){const w=new Worker(window.SFNEW.file);
  await new Promise((ok,no)=>{const t=setTimeout(()=>no(0),30000);w.onerror=()=>{clearTimeout(t);no(0)};w.onmessage=e=>{if(String(e.data)==='readyok'){clearTimeout(t);ok()}};w.postMessage('uci');w.postMessage('isready')}).catch(e=>{try{w.terminate()}catch(_){}throw e});
  w.postMessage('setoption name Hash value 32');w.postMessage('setoption name Threads value 1');w.postMessage('setoption name Skill Level value 20');return w}
 async function open(){close();if(!(window.SFNEW&&window.Worker&&WASMOK&&SFok))return;const n=want()-1;if(n<1)return;try{$('st').textContent='⚡ Starting '+(n+1)+' engines…'}catch(e){}
  const made=await Promise.all(Array.from({length:n},()=>mk().catch(()=>null)));ws=made.filter(Boolean)}
 function close(){for(const w of ws){try{w.postMessage('quit');w.terminate()}catch(e){}}ws=[]}
 function wSearch(w,s,T,dc,es){return new Promise(res=>{let sc=0,d=0,pv='',done=false,stopped=false;
  const fin=r=>{if(done)return;done=true;clearTimeout(to);w.onmessage=null;res(r)};
  const to=setTimeout(()=>{try{w.postMessage('stop')}catch(e){}fin(null)},T+8000);
  w.onmessage=e=>{const l=String(e.data);
   if(l.startsWith('info')&&l.includes(' score ')&&!l.includes('bound')){const mm=l.match(/depth ([0-9]+).* score (cp|mate) (-?[0-9]+)/);if(mm){d=+mm[1];const n=+mm[3];sc=mm[2]==='cp'?n:(n>0?1:-1)*(99999-Math.abs(n));const pm=l.match(/ pv (.+)$/);if(pm)pv=pm[1].trim();
     if(es&&!stopped&&pv&&es(d,pv.split(' ')[0],sc)){stopped=true;try{w.postMessage('stop')}catch(_){}}}}
   else if(l.startsWith('bestmove')){const u=l.split(' ')[1]||'',ms=legal(s),m=ms.find(q=>sqn(q.f)+sqn(q.t)===u.slice(0,4));fin({m:m?(u[4]?{...m,pr:u[4]}:m):ms[0],sc,d:Math.max(d,1),pv})}};
  w.postMessage('position fen '+fen(s));w.postMessage('go '+(dc?'depth '+dc+' ':'')+'movetime '+T)})}
 /* search every distinct position once (main engine + extra workers share one queue) and leave the results in the engine cache */
 async function prefetch(states,label){if(!SFok)return;const q=AQ,P=AQP[q]||AQP[1],dc=P[0],T=P[1];
  const key=s=>fen(s)+'|'+q+'|'+(WASMOK?1:0),seen=new Set(),todo=[];
  for(const s of states){if(!s||!legal(s).length)continue;const k=key(s);if(seen.has(k)||ECache.has(k))continue;seen.add(k);todo.push({s,k})}
  if(!todo.length)return;
  let next=0,done=0;const N=todo.length,es=()=>(WASMOK&&dc>=15&&!window.NOES)?mkES(Math.max(12,dc-5)):null;
  const tick=()=>{try{$('st').textContent='⚡ '+label+' '+done+' / '+N;$('rpt').innerHTML='<div class="gr"><h3>⚡ '+label+'…</h3><div class="gbar"><i style="width:'+Math.round(done/N*100)+'%"></i></div><div class="mu">'+done+' of '+N+(ws.length?' · '+(ws.length+1)+' engines':'')+'</div></div>'}catch(e){}};
  const put=(k,r)=>{if(r&&SFok){ECache.set(k,r);if(ECache.size>900)ECache.delete(ECache.keys().next().value)}};
  const main=async()=>{while(next<todo.length){const it=todo[next++];try{await engC(it.s,1000,6)}catch(e){}done++;tick()}};
  const extra=async w=>{while(next<todo.length){const it=todo[next++];let r=null;try{r=await wSearch(w,it.s,T,dc,es())}catch(e){}if(r)put(it.k,r);else{try{await engC(it.s,1000,6)}catch(e){}}done++;tick()}};
  tick();await Promise.all([main(),...ws.map(extra)])}
 return{open,close,prefetch,want,get n(){return ws.length+1}}
})();
/* More > Look & analysis: number of engines used for game analysis */
{const cds=document.querySelectorAll('.sec[data-s=more] .cd');const c=cds[1];
 if(c){const ar=()=>{try{return localStorage.getItem('chessLang')==='ar'}catch(e){return false}};
  const sel=document.createElement('select');sel.id='aw';sel.style.cssText='width:100%;margin:5px 0';
  const lab=()=>{[...sel.options].forEach(o=>{o.textContent=(o.value==='auto'?(ar()?'تلقائي':'Auto'):o.value)+(ar()?' — محركات التحليل':' analysis engines')});};
  ['auto','1','2','3','4'].forEach(v=>{const o=document.createElement('option');o.value=v;sel.appendChild(o)});
  try{sel.value=localStorage.getItem('chessWorkers')||'auto'}catch(e){}lab();
  sel.onchange=()=>{try{localStorage.setItem('chessWorkers',sel.value)}catch(e){}};c.appendChild(sel)}}
