/* ---------- Stockfish (full strength, loads from CDN when the page is allowed to) ---------- */
let SF=null,SFok=false,SFcb=null,Q=Promise.resolve(),SFpend=0,SFfail=0;
async function initSF(){const en=$('en');try{
 let w=null,lbl='';
 if(window.SFNEW&&window.Worker){try{w=new Worker(window.SFNEW.file);await new Promise((ok,no)=>{const t=setTimeout(()=>no(0),30000);w.onerror=()=>{clearTimeout(t);no(0)};w.onmessage=e=>{if(String(e.data)==='readyok'){clearTimeout(t);ok()}};w.postMessage('uci');w.postMessage('isready')});WASMOK=true;lbl='Engine: '+window.SFNEW.name+' \u2713 (fast, full strength)'}catch(_){try{w&&w.terminate()}catch(__){}w=null;WASMOK=false}}
 if(!w){let tx='';try{const r0=await fetch('stockfish.js');if(r0.ok)tx=await r0.text()}catch(_){}
  if(tx.length<50000){const r=await fetch('https://cdnjs.cloudflare.com/ajax/libs/stockfish.js/10.0.2/stockfish.js');if(!r.ok)throw 0;tx=await r.text()}
  w=new Worker(URL.createObjectURL(new Blob([tx],{type:'text/javascript'})));
  await new Promise((ok,no)=>{const t=setTimeout(no,20000);w.onmessage=e=>{if(String(e.data)==='readyok'){clearTimeout(t);ok()}};w.postMessage('uci');w.postMessage('isready')});
  lbl='Engine: Stockfish 10 \u2713 (full strength)'}
 SF=w;SF.onmessage=e=>{const l=String(e.data);if(SFpend>0&&l.startsWith('bestmove')){SFpend--;return}SFcb&&SFcb(l)};if(WASMOK){SF.postMessage('setoption name Hash value 32');SF.postMessage('setoption name Threads value 1')}
 SFok=true;en.textContent=lbl}
 catch(e){SF=null;en.textContent='Engine: built-in (Stockfish can only load when you open the downloaded file with internet)'}}
function fen(s,fm){let f='';for(let r=0;r<8;r++){let e=0;for(let c=0;c<8;c++){const p=s.b[r*8+c];if(!p)e++;else{if(e){f+=e;e=0}f+=p}}if(e)f+=e;if(r<7)f+='/'}
 return f+' '+s.t+' '+((s.c.K?'K':'')+(s.c.Q?'Q':'')+(s.c.k?'k':'')+(s.c.q?'q':'')||'-')+' '+(s.ep>=0?sqn(s.ep):'-')+' '+(s.hm||0)+' '+(fm||1)}
/* early stop: when the best move and score stay the same for 4 depths in a row there is no need to keep searching */
function mkES(minD){const h={};return(d,mv,sc)=>{h[d]={mv,sc};if(d<minD)return false;const x=[h[d],h[d-1],h[d-2],h[d-3]];if(x.some(e=>!e)||x.some(e=>e.mv!==x[0].mv))return false;const v=x.map(e=>e.sc);return Math.max(...v)-Math.min(...v)<=15}}
function sfGo(s,T,skill,only,dc,es){return new Promise(res=>{let sc=0,d=0,pv='',stopped=false;SFcb=l=>{
 if(l.startsWith('info')&&l.includes(' score ')&&!l.includes('bound')){const mm=l.match(/depth ([0-9]+).* score (cp|mate) (-?[0-9]+)/);if(mm){d=+mm[1];const n=+mm[3];sc=mm[2]==='cp'?n:(n>0?1:-1)*(99999-Math.abs(n));const pm=l.match(/ pv (.+)$/);if(pm)pv=pm[1].trim();if(es&&!stopped&&pv&&es(d,pv.split(' ')[0],sc)){stopped=true;try{SF.postMessage('stop')}catch(_){}}}}
 else if(l.startsWith('bestmove')){SFcb=null;const u=l.split(' ')[1],ms=legal(s),m=ms.find(q=>sqn(q.f)+sqn(q.t)===u.slice(0,4));res({m:m?(u[4]?{...m,pr:u[4]}:m):ms[0],sc,d:Math.max(d,1),pv})}};
 SF.postMessage('setoption name Skill Level value '+skill);SF.postMessage('position fen '+fen(s));SF.postMessage('go '+(WASMOK&&dc?'depth '+dc+' ':'')+'movetime '+T+(only?' searchmoves '+only:''))})}
function bookMove(s,rnd){const i=s===S?ML.length:H.indexOf(s);if(i<0)return null;const pre=ML.slice(0,i),c=[];for(const[k]of OP){const q=k.split(' ');if(q.length>i&&pre.every((x,j)=>q[j]===x)&&!c.includes(q[i]))c.push(q[i])}return c.length?fromTok(s,rnd?c[Math.random()*c.length|0]:c[0]):null}
async function eng0(s,T,maxD,skill=20,only){let dc=0;if(maxD===6){const q=AQP[AQ]||AQP[1];if(WASMOK){dc=q[0];T=q[1]}else T=Math.round(T*q[2])}if(!SFok&&maxD>=10&&!only){const bk=bookMove(s);if(bk)return{m:bk,sc:20,d:1}}if(SFok&&legal(s).length){const es=(maxD===6&&WASMOK&&!only&&dc>=15&&!window.NOES)?mkES(Math.max(12,dc-5)):null;const r=await Promise.race([sfGo(s,T,skill,only,dc,es),new Promise(r=>setTimeout(()=>r(null),T+8000))]);if(r){SFfail=0;return r}SFcb=null;try{SF.postMessage('stop');SFpend++}catch(_){}if(++SFfail>=3){SFok=false;$('en').textContent='Engine: built-in (Stockfish stopped responding)'}}return thinkA(s,T,maxD)}
const eng=(...a)=>(Q=Q.then(()=>eng0(...a)));
function doHint(){const rv=vi>=0;if(over&&!rv)return;$('hn').textContent='🤔 Thinking...';
 const cur=()=>vi>=0?(TS||[...H,S][vi]):S,P=cur(),key=fen(P),vk=vi;
 setTimeout(async()=>{const r=await eng(P,2500,12);if(vi!==vk||fen(cur())!==key)return;if(!r||!r.m){$('hn').textContent='No legal moves in this position.';return}const m=r.m,p=P.b[m.f].toLowerCase();hint=m;sel=-1;R();
  const sc=Math.abs(r.sc)>90000?(r.sc>0?'Forced mate for you 🔥':'A very difficult position'):(r.sc>=0?'You are up about ':'You are down about ')+(Math.abs(r.sc)/100).toFixed(1)+' pawns';
  $('hn').innerHTML='<b>'+up(NM[p])+' '+sqn(m.f)+' → '+sqn(m.t)+'</b><ul>'+why(P,m).map(x=>'<li>'+x+'</li>').join('')+'</ul><div class="mu">Evaluation after it: '+sc+' (searched '+r.d+' moves deep)</div>'},30)}

async function pick(){const lv=cfg.lv;if(SFok)return(await eng(S,[0,150,400,1000,2500][lv],12,[0,0,6,14,20][lv])).m;
 if(lv>=3)return think(S,lv===3?1500:4000,12).m;
 const L=scoreAll(S,lv===1?1:2).sort((a,b)=>b.v-a.v);return lv===1?L[Math.floor(Math.random()*Math.min(4,L.length))].m:L[0].m}
function play(m,cpu){const pr=S;H.push(S);ML.push(tok(m));S=apply(S,m);sel=-1;hint=null;save();upd();if(!cpu)setTimeout(async()=>{await review(pr,m);maybeCpu()},40)}
function maybeCpu(){if(!cfg.vs||over||S.t!==cpuSide())return;$('st').textContent='🤖 Computer is thinking...';setTimeout(async()=>{const m=await pick();if(m)play(m,true)},60)}
