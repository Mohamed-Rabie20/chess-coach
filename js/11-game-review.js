/* ---------- v3: chess.com-style Game Review + deep check (fixes "blunder shown as Best") ---------- */
const RORD=['brilliant','great','best','excellent','good','book','inacc','mistake','miss','blunder'];
const isDeep=()=>ML.length>0&&RV.length>=ML.length&&RV.slice(0,ML.length).every(x=>x&&x.dp);
function recheck(){const OK=['brilliant','great','best','excellent','good'];
 for(let i=0;i<RV.length-1;i++){const a=RV[i],b=RV[i+1];if(!a||!b||a.bs==null||b.bs==null||!OK.includes(a.k)||!H[i+1])continue;
  if(a.bm&&ML[i]&&String(a.bm).slice(0,4)===String(ML[i]).slice(0,4))continue;
  const wd=WP(a.bs)-WP(-b.bs);if(wd<12)continue;
  const k=wd<=20?'mistake':'blunder',t=RTG[k],rm=b.bm?fromTok(H[i+1],b.bm):null,rs=rm?san(H[i+1],rm):'';
  a.k=k;a.acc=Math.min(Math.max(0,103.1668*Math.exp(-0.04354*wd)-3.1669),k==='blunder'?28:52);a.ba=null;
  a.h=`<span style="background:${t[2]};color:#fff;padding:2px 9px;border-radius:12px;font-weight:700">${t[0]} ${t[1]}</span> ${t[3]}<div class="mu" style="margin-top:6px">Deep check: this gives up about ${wd.toFixed(0)}% of your winning chances${rs?' — the opponent’s reply <b>'+rs+'</b> punishes it':''}.</div>`;
  EV[i]=(a.s==='w'?1:-1)*(-b.bs)}}
async function analyzeAll(){if(AZ||!ML.length)return;AZ=1;const n=ML.length,oq=AQ;AQ=1;
 try{if(SFok&&SF)SF.postMessage('ucinewgame')}catch(e){}
 RV=[];EV=[];vi=0;
 try{try{await ANX.open();await ANX.prefetch([...H.slice(0,n),S],'Deep analysis')}catch(e){}
 for(let i=0;i<n;i++){if(H.length!==n||!H[i])break;const m=fromTok(H[i],ML[i]);if(!m)break;
  $('st').textContent='🔍 Deep analysis '+(i+1)+' / '+n;
  $('rpt').innerHTML='<div class="gr"><h3>🔍 Analyzing game…</h3><div class="gbar"><i style="width:'+Math.round(i/n*100)+'%"></i></div><div class="mu">Move '+(i+1)+' of '+n+'</div></div>';
  await review(H[i],m,isBook(ML.slice(0,i+1)),i)}
  if(WASMOK&&SFok&&H.length===n){const K=[];RV.forEach((x,i)=>{if(x&&['inacc','mistake','miss','blunder','brilliant','great'].includes(x.k))K.push(i)});K.length=Math.min(K.length,18);AQ=Math.max(2,oq);try{await ANX.prefetch(K.flatMap(i=>[H[i],i+1<n?H[i+1]:S]),'Verifying key moves')}catch(e){}let j=0;for(const i of K){if(H.length!==n||!H[i])break;const m=fromTok(H[i],ML[i]);if(!m)break;$('st').textContent='Verifying key moves '+(++j)+' / '+K.length;$('rpt').innerHTML='<div class="gr"><h3>Verifying key moves...</h3><div class="gbar"><i style="width:'+Math.round(j/K.length*100)+'%"></i></div><div class="mu">'+j+' of '+K.length+'</div></div>';await review(H[i],m,isBook(ML.slice(0,i+1)),i)}}
   if(H.length===n){recheck();RV.forEach(x=>x&&(x.dp=1))}}
 finally{try{ANX.close()}catch(e){}AQ=oq;AZ=0;vi=-1;save()}
 if(H.length===n){lastBar();upd();showSum()}}
async function startRev(){if(!isDeep())await analyzeAll();go(0)}
function gSv(e){const r=e.currentTarget.getBoundingClientRect(),n=ML.length;go(Math.max(1,Math.min(n,Math.round((e.clientX-r.left)/r.width*(n-1))+1)))}
const GRT=[[30,250],[45,400],[55,600],[62,800],[68,1000],[75,1300],[80,1500],[85,1750],[90,2050],[94,2400],[97,2750],[100,3100]];
function gRate(a){if(a<=30)return 250;for(let i=1;i<GRT.length;i++)if(a<=GRT[i][0]){const[x0,y0]=GRT[i-1],[x1,y1]=GRT[i];return y0+(y1-y0)*(a-x0)/(x1-x0)}return 3100}
const npm=s=>{let v=0;for(const p of s.b)if(p){const l=p.toLowerCase();if(l!=='p'&&l!=='k')v+=V[l]}return v};
function phases(s){const o={o:[],t:[],s:[],e:[]};RV.forEach((x,i)=>{if(!x||x.s!==s||x.k==='forced'||!H[i])return;const p=H[i];let ph;if(i<20)ph='o';else if(npm(p)<=2600)ph='e';else{const sh=q=>{if(!q)return false;if(p.b[q.t]||q.pr)return true;const pc=p.b[q.f];if(pc&&pc.toLowerCase()==='p'&&(q.f&7)!==(q.t&7))return true;return inChk(apply(p,q))};ph=sh(fromTok(p,ML[i]))||sh(x.bm?fromTok(p,x.bm):null)?'t':'s'}o[ph].push(x.acc)});const f=a=>a.length?a.reduce((p,q)=>p+q,0)/a.length:null;return{o:f(o.o),t:f(o.t),s:f(o.s),e:f(o.e)}}
function extraHTML(){if(!RV.some(Boolean))return'';const A=s=>RV.some(x=>x&&x.s===s)?accOf(s):null,gr=(s,a)=>{if(a==null)return'?';const p=(GD&&PGNEL[s])?PGNEL[s]:(cfg.vs&&!GD?(s===cfg.me?RT:bot().e):null);let v=p!=null?Math.max(p-500,Math.min(p+500,p+11*(a-78))):1300+.5*(gRate(a)-1300);return String(Math.round(Math.max(100,Math.min(3200,v))/50)*50)},P={w:phases('w'),b:phases('b')},cls=a=>a>=93?'best':a>=85?'excellent':a>=72?'good':a>=58?'inacc':a>=45?'mistake':'blunder',cell=a=>a==null?'<div class="n z">-</div>':'<div class="n" style="color:'+RTG[cls(a)][2]+'">'+Math.round(a*10)+'</div>';
 let h='<hr><div class="l">Game Rating</div><div class="ac w">'+gr('w',A('w'))+'</div><div></div><div class="ac b">'+gr('b',A('b'))+'</div><hr><div style="grid-column:1/-1;font-weight:800;font-size:18px;margin:2px 0 4px">Advanced Stats</div>';
 for(const[k,l]of[['o','Opening'],['t','Tactics'],['s','Strategy'],['e','Endgame']])h+='<div class="l">'+l+'</div>'+cell(P.w[k])+'<div></div>'+cell(P.b[k]);
 return h+'<div class="mu" style="grid-column:1/-1;font-size:11px;margin-top:6px">Game Rating is an estimate from accuracy and known ratings; Advanced Stats come from the analysed moves. Neither is chess.com\'s own number. Scores are out of 1000.</div>'}
function showSum(){const nm=s=>(s==='w'?'White':'Black')+(cfg.vs&&s===cfg.me?' (You)':''),
 pn=s=>cfg.vs?(s===cfg.me?'🙂 You':bot().a+' '+bot().n):(s==='w'?'⚪':'⚫'),pr=s=>cfg.vs?(s===cfg.me?RT:bot().e):'',
 cnt=(s,k)=>RV.filter(x=>x&&x.s===s&&x.k===k).length,ac=s=>RV.some(x=>x&&x.s===s)?accOf(s).toFixed(1):'–',n=ML.length,
 pts=EV.map((v,i)=>v==null?null:[i,v]).filter(Boolean),X=i=>(i/Math.max(n-1,1)*300).toFixed(1),Y=v=>(35-33*Math.tanh(v/500)).toFixed(1);
 let g='';if(pts.length>1){g='<svg viewBox="0 0 300 70" onclick="gSv(event)" style="width:100%;height:70px;margin-top:14px;border-radius:10px;background:#34373f;cursor:pointer"><polygon fill="#f1f1f1" points="'+X(pts[0][0])+',70 '+pts.map(([i,v])=>X(i)+','+Y(v)).join(' ')+' '+X(pts[pts.length-1][0])+',70"/><line x1="0" y1="35" x2="300" y2="35" stroke="#888" stroke-width=".5"/>'+RV.map((x,i)=>x&&EV[i]!=null&&['mistake','blunder','miss','brilliant','great'].includes(x.k)?'<circle cx="'+X(i)+'" cy="'+Y(EV[i])+'" r="2.6" fill="'+RTG[x.k][2]+'" stroke="#fff" stroke-width=".6"/>':'').join('')+'</svg><div class="mu" style="font-size:11px;margin-top:3px">Tap the graph to jump to a move.</div>'}
 const has=RV.some(Boolean),rows=RORD.map(k=>{const a=cnt('w',k),b=cnt('b',k),t=RTG[k];return `<div class="l">${t[1]}</div><div class="n ${a?'':'z'}" style="color:${t[2]}">${a}</div><div class="gi" style="background:${t[2]}">${t[0]}</div><div class="n ${b?'':'z'}" style="color:${t[2]}">${b}</div>`}).join('');
 $('rpt').innerHTML='<div class="gr"><h3>📊 Game Review</h3>'+(RDm?'<div class="mu" style="margin:-6px 0 8px">'+RDm+'</div>':'')+'<div class="gg"><div class="l">Players</div><div class="gp2"><b>'+pn('w').split(' ')[0]+'</b>'+(cfg.vs?(pn('w').split(' ').slice(1).join(' ')||'')+' '+pr('w'):'White'+(GD&&PGNEL.w?' '+PGNEL.w:''))+'</div><div></div><div class="gp2"><b>'+pn('b').split(' ')[0]+'</b>'+(cfg.vs?(pn('b').split(' ').slice(1).join(' ')||'')+' '+pr('b'):'Black'+(GD&&PGNEL.b?' '+PGNEL.b:''))+'</div><div class="l">Accuracy</div><div class="ac w">'+ac('w')+'</div><div></div><div class="ac b">'+ac('b')+'</div><hr>'+rows+extraHTML()+'</div>'+g+(n?'<button class="gbtn" onclick="startRev()">'+(isDeep()?'▶ Start Review':'🔍 Analyze & Start Review')+'</button>':'<div class="mu">No moves yet.</div>')+(n&&has&&!isDeep()?'<div class="mu" style="margin-top:8px;font-size:12px">Live ratings are quick. Analyze runs a deeper engine check on every move (both sides) and corrects any move that looked best but loses to the opponent’s reply.</div>':'')+'</div>'}
{const _u3=upd;upd=function(){_u3();try{document.querySelectorAll('#ml span').forEach((sp,i)=>{const x=RV[i];if(x&&RTG[x.k]&&['brilliant','great','best','inacc','mistake','miss','blunder'].includes(x.k))sp.insertAdjacentHTML('beforeend','<sup style="color:'+RTG[x.k][2]+'">'+RTG[x.k][0]+'</sup>')})}catch(e){}}}
upd();
