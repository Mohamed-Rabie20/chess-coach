/* ---------- v3: draws, promotion choice, eval bar, summary, review, PGN/FEN, arrows, sound ---------- */
let RV=[],EV=[],vi=-1,PM=null,PSC=null,SO=true,AC=null,SCk='',SCa=[];
const TC=[[0,0],[60,0],[180,0],[300,0],[600,0],[900,10]],tcs=()=>TC[cfg.tc||0];
let RT=800,ARCH=[],GD=false,RDm='';try{RT=+localStorage.getItem('chessRating')||800;ARCH=JSON.parse(localStorage.getItem('chessArch')||'[]')}catch(e){}
var TS=null,TL=null,TA=null,TST=[],TTK=0,TTO=null;let PRE=null,CK={w:0,b:0},END='',LT=Date.now(),DG=null,SUP=0;
const BOTS=[{n:'Pip',e:250,a:'🐣',q:'I just learned how the pieces move!'},{n:'Tobi',e:400,a:'🧸',q:'I love capturing stuff. Good luck!'},{n:'Lina',e:600,a:'🌱',q:'I know a few opening ideas.'},{n:'Omar',e:800,a:'🐢',q:'Slow and steady wins the race.'},{n:'Sara',e:1000,a:'🎈',q:'Let’s have a friendly game.'},{n:'Karim',e:1200,a:'🦊',q:'I watch out for tactics.'},{n:'Nora',e:1400,a:'🦉',q:'I calculate a few moves ahead.'},{n:'Yusuf',e:1600,a:'🐺',q:'Don’t leave pieces hanging!'},{n:'Hana',e:1800,a:'🦅',q:'I punish every mistake.'},{n:'Viktor',e:2000,a:'🐻',q:'Prepare for a long fight.'},{n:'Elena',e:2200,a:'🐉',q:'Master level. Show me your best.'},{n:'Atlas',e:2500,a:'🦾',q:'Grandmaster strength.'},{n:'Max',e:3000,a:'🤖',q:'Full-strength engine. Good luck.'}];
const bot=()=>BOTS[cfg.lv]||BOTS[5],botTxt=()=>{const b=bot();return b.a+' '+b.n+' ('+b.e+'): “'+b.q+'”'};
let CH=true,HC=null,LS=0;
const resetCk=()=>{const x=tcs()[0]*1000;CK={w:x,b:x}};
const TH={green:['#eeeed2','#769656'],brown:['#f0d9b5','#b58863'],blue:['#dee3e6','#8ca2ad'],gray:['#e0e0e0','#9a9a9a']};
function setTh(k){const c=TH[k]||TH.green,s=document.documentElement.style;s.setProperty('--lt',c[0]);s.setProperty('--dk',c[1]);try{localStorage.setItem('chessTh',k)}catch(e){}}
const PRM=()=>!!cfg.vs&&!over&&vi<0&&S.t===cpuSide();
function runPre(){const p=PRE;PRE=null;if(!p||over||S.t!==cfg.me)return;const mv=legal(S).find(m=>m.f===p.f&&m.t===p.t);if(mv)play(p.pr?{...mv,pr:p.pr}:mv)}
function endGame(x){END=x;snd(endK());save();upd();setTimeout(showSum,0)}
function resign(){if(over||END||!ML.length)return;if(!confirm('Resign this game?'))return;const s=cfg.vs?cfg.me:S.t;endGame((s==='w'?'White':'Black')+' resigned — '+(s==='w'?'Black':'White')+' wins')}
async function offerDraw(){if(over||END||ML.length<2)return;if(!cfg.vs){if(confirm('Both players agree to a draw?'))endGame('Draw by agreement');return}
 $('hn').textContent='Draw offered…';const r=await eng(S,500,6),cs=S.t===cfg.me?-r.sc:r.sc;if(cs<=40)endGame('Draw by agreement');else $('hn').textContent='🤖 The computer declined your draw offer.'}
/* threefold repetition, chess.com style: same pieces on the same squares, same side to move, same castling rights, same en passant possibility; the 3 occurrences do not have to be consecutive. The game ends automatically on the 3rd. An en passant square only counts when a pawn can really capture there. */
function repKey(s){let b='';for(let i=0;i<64;i++)b+=s.b[i]||'.';let ep=-1;if(s.ep>=0&&legal(s).some(m=>m.t===s.ep&&s.b[m.f]&&s.b[m.f].toLowerCase()==='p'&&(m.f&7)!==(m.t&7)))ep=s.ep;return b+'|'+s.t+s.c.K+s.c.Q+s.c.k+s.c.q+ep}
function drawWhy(){window.REP3=0;const s=S;if((s.hm||0)>=100)return 'Draw (50-move rule)';
 const k=repKey(s);let n=1;for(const h of H)if(repKey(h)===k)n++;window.REP3=n;if(n>=3)return 'Draw (threefold repetition)';
 const pc=s.b.filter(x=>x&&x.toLowerCase()!=='k');
 if(!pc.length||(pc.length===1&&'nb'.includes(pc[0].toLowerCase())))return 'Draw (insufficient material)';
 if(pc.length===2&&pc.every(x=>x.toLowerCase()==='b')&&(pc[0]<'a')!==(pc[1]<'a')){const c=s.b.map((x,i)=>x&&x.toLowerCase()==='b'?((i>>3)+(i&7))%2:-1).filter(x=>x>=0);if(c[0]===c[1])return 'Draw (insufficient material)'}return ''}
function promo(ch){$('pm').style.display='none';if(PM){const m=PM;PM=null;play({...m,pr:ch})}}
function setBar(v){$('ef').style.width=(50+50*Math.tanh(v/500))+'%';$('et').textContent=Math.abs(v)>90000?(v>0?'M':'-M'):(v>0?'+':'')+(v/100).toFixed(1)}
let VOL=1;try{const q=localStorage.getItem('chessVol');if(q!==null)VOL=+q}catch(e){}
function cycVol(b){VOL=VOL===1?.5:VOL===.5?0:1;SO=VOL>0;b.textContent=VOL===1?'🔊':VOL===.5?'🔉':'🔇';try{localStorage.setItem('chessVol',VOL)}catch(e){}snd('m')}
/* sounds: synthesized wooden board "tock" (damped wood modes + low body thump + contact click); opponent moves are a little lower and softer */
function mvKey(pr,m,post,cpu){const k=inChk(post)?'+':m.pr?'p':(pr.b[m.f].toLowerCase()==='k'&&Math.abs(m.t-m.f)===2)?'c':((pr.b[m.t]||(pr.b[m.f].toLowerCase()==='p'&&m.t===pr.ep))?'x':'m');return(k==='m'||k==='x')&&cpu?k+'o':k}
function reviewSnd(t,n){if(t<1||t>n)return;const pr=H[t-1],x=ML[t-1];if(!pr||!x)return;const m=fromTok(pr,x);if(!m)return;const post=t<n?H[t]:S;snd(mvKey(pr,m,post,!!cfg.vs&&pr.t!==cfg.me))}
function snd(k){if(!SO||VOL<=0)return;try{AC=AC||new(window.AudioContext||window.webkitAudioContext)();if(AC.state==='suspended'&&AC.resume)AC.resume().catch(()=>{});
 const T=AC.currentTime+.005,SR=AC.sampleRate,out=AC.createGain(),cp=AC.createWaveShaper(),cv=new Float32Array(1024);for(let i=0;i<1024;i++)cv[i]=Math.tanh(1.4*(i/512-1));cp.curve=cv;out.gain.value=1.0*VOL;out.connect(cp);cp.connect(AC.destination);
 const nb=(len,dec)=>{const n=Math.floor(SR*len),b=AC.createBuffer(1,n,SR),d=b.getChannelData(0);for(let i=0;i<n;i++)d[i]=(Math.random()*2-1)*Math.exp(-i/(SR*dec));return b};
 const CLK=nb(.02,.0016);
 const tock=(t,f0,v,len)=>{len=len||1;const j=1+(Math.random()-.5)*.05;
  [[1,1,.08],[1.9,.55,.045],[3.1,.32,.028],[5.2,.16,.016]].forEach(([r,a,d])=>{const o=AC.createOscillator(),g=AC.createGain(),dd=d*len;o.type='sine';o.frequency.setValueAtTime(f0*r*j*1.06,t);o.frequency.exponentialRampToValueAtTime(f0*r*j,t+.012);g.gain.setValueAtTime(v*a,t);g.gain.exponentialRampToValueAtTime(.0001,t+dd);o.connect(g);g.connect(out);o.start(t);o.stop(t+dd+.02)});
  {const o=AC.createOscillator(),g=AC.createGain();o.type='sine';o.frequency.setValueAtTime(f0*.9,t);o.frequency.exponentialRampToValueAtTime(f0*.42,t+.045);g.gain.setValueAtTime(v*.8,t);g.gain.exponentialRampToValueAtTime(.0001,t+.06*len);o.connect(g);g.connect(out);o.start(t);o.stop(t+.08*len)}
  {const s=AC.createBufferSource(),bp=AC.createBiquadFilter(),g=AC.createGain();s.buffer=CLK;bp.type='bandpass';bp.frequency.value=Math.min(5200,f0*11);bp.Q.value=.7;g.gain.value=v*.9;s.connect(bp);bp.connect(g);g.connect(out);s.start(t)}};
 const tone=(t,f,d,v,ty)=>{const o=AC.createOscillator(),g=AC.createGain();o.type=ty||'sine';o.frequency.value=f;g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(v,t+.01);g.gain.exponentialRampToValueAtTime(.0001,t+d);o.connect(g);g.connect(out);o.start(t);o.stop(t+d+.02)};
 const vib=p=>{try{navigator.vibrate&&navigator.vibrate(p)}catch(e){}};
 if(k==='m'){tock(T,230,.4);vib(8)}
 else if(k==='mo'){tock(T,205,.32,.9);vib(6)}
 else if(k==='x'){tock(T,190,.5,1.1);tock(T+.02,330,.32,.8);vib(18)}
 else if(k==='xo'){tock(T,175,.44,1.05);tock(T+.02,300,.28,.8);vib(14)}
 else if(k==='c'){tock(T,225,.3);tock(T+.12,250,.3);vib([10,40,10])}
 else if(k==='+'){tock(T,205,.42,1.1);tone(T+.06,988,.28,.16);tone(T+.06,1480,.22,.08);vib([20,40,20])}
 else if(k==='p'){tock(T,230,.32);[523,659,784,1047].forEach((f,i)=>tone(T+.08+i*.07,f,.2,.28,'triangle'));vib(15)}
 else if(k==='pm')tock(T,300,.12,.5);
 else if(k==='s'){tock(T,215,.3);tock(T+.13,245,.3)}
 else if(k==='ew'){[523,659,784,1047].forEach((f,i)=>tone(T+i*.1,f,.35,.4,'triangle'));vib([30,60,30])}
 else if(k==='el'){[392,330,262].forEach((f,i)=>tone(T+i*.16,f,.4,.4,'triangle'));vib([60,40,60])}
 else if(k==='e'){[659,523].forEach((f,i)=>tone(T+i*.14,f,.35,.4,'triangle'));vib(30)}
 else if(k==='w')tone(T,1250,.05,.15,'square')}catch(e){}}
function endK(){let w=null;if(END){if(/resigned|lost/.test(END))w=END.startsWith('White')?'b':'w'}else if(!LC.length&&inChk(S))w=S.t==='w'?'b':'w';return!cfg.vs||!w?'e':w===cfg.me?'ew':'el'}
function san(s,m){const p=s.b[m.f],l=p.toLowerCase(),cp=s.b[m.t]||(l==='p'&&m.t===s.ep);let t;
 if(l==='k'&&Math.abs(m.t-m.f)===2)t=m.t>m.f?'O-O':'O-O-O';
 else{t=l==='p'?(cp?'abcdefgh'[m.f&7]:''):l.toUpperCase();
  if(l!=='p'&&l!=='k'){const o=legal(s).filter(q=>q.t===m.t&&q.f!==m.f&&s.b[q.f]===p);if(o.length){const sf=o.some(q=>(q.f&7)===(m.f&7)),sr=o.some(q=>(q.f>>3)===(m.f>>3));t+=!sf?'abcdefgh'[m.f&7]:!sr?8-(m.f>>3):sqn(m.f)}}
  if(cp)t+='x';t+=sqn(m.t);if(m.pr)t+='='+m.pr.toUpperCase()}
 const n=apply(s,m);if(inChk(n))t+=legal(n).length?'+':'#';return t}
function sans(){const k=ML.join(' ');if(k===SCk)return SCa;let s=init();SCa=ML.map(x=>{const m=fromTok(s,x),t=m?san(s,m):x;if(m)s=apply(s,m);return t});SCk=k;return SCa}
function pgn(){const sn=sans(),r=END?(END.startsWith('Draw')?'1/2-1/2':END.startsWith('White')?'0-1':'1-0'):!LC.length&&inChk(S)?(S.t==='w'?'0-1':'1-0'):over?'1/2-1/2':'*',
 nm=x=>cfg.vs?(x===cfg.me?'You':bot().n+' ('+bot().e+')'):(x==='w'?'White':'Black'),tc=tcs();
 return '[Event "Chess Coach game"]\n[Date "'+new Date().toISOString().slice(0,10).replace(/-/g,'.')+'"]\n[White "'+nm('w')+'"]\n[Black "'+nm('b')+'"]\n'+(cfg.vs?'[WhiteElo "'+(cfg.me==='w'?RT:bot().e)+'"]\n[BlackElo "'+(cfg.me==='w'?bot().e:RT)+'"]\n':'')+'[Result "'+r+'"]\n'+(tc[0]?'[TimeControl "'+tc[0]+(tc[1]?'+'+tc[1]:'')+'"]\n':'')+'\n'+sn.map((x,i)=>(i%2?'':(i>>1)+1+'. ')+x).join(' ')+' '+r}
function togglePGN(){const x=$('px'),on=x.style.display==='block';x.style.display=$('pb2').style.display=on?'none':'block';if(!on){x.value=pgn()+'\n\nFEN: '+fen(S,(ML.length>>1)+1);x.select()}}
function copyPGN(){const x=$('px');x.select();try{navigator.clipboard.writeText(x.value)}catch(e){try{document.execCommand('copy')}catch(e2){}}$('hn').textContent='Copied to clipboard.'}
function loadPGN(){let raw=$('px').value;{const f=raw.search(/\[Event\s/);if(f>=0){const n=raw.indexOf('[Event ',f+7);if(n>0)raw=raw.slice(0,n)}}const x=raw.replace(/\$\d+|\be\.p\./g,' ').replace(/\{[^}]*\}|\([^)]*\)|\[[^\]]*\]|;[^\n]*|FEN:.*$/gm,' ').replace(/\d+\.(\.\.)?/g,' ').replace(/1-0|0-1|1\/2-1\/2|\*/g,' '),tk=x.split(/\s+/).filter(Boolean);
 if(!tk.length){$('hn').textContent='Paste a PGN first.';return}
 let s=init();const Hn=[],Mn=[];
 for(let i=0;i<tk.length;i++){const w=tk[i].replace(/[+#!?]/g,'').replace(/0/g,'O'),m=legal(s).find(q=>san(s,q).replace(/[+#]/g,'')===w);
  if(!m){$('hn').textContent='Could not read move '+(i+1)+' ("'+tk[i]+'"). Nothing was loaded.';return}
  Hn.push(s);Mn.push(tok(m));s=apply(s,m)}
 S=s;H=Hn;ML=Mn;RV=[];EV=[];vi=-1;sel=-1;hint=null;BD=null;END='';PRE=null;GD=true;resetCk();setBar(0);save();upd();
 {const eW=+(/\[WhiteElo\s+"(\d+)"/.exec($('px').value)||[])[1]||0,eB=+(/\[BlackElo\s+"(\d+)"/.exec($('px').value)||[])[1]||0;const was=cfg.vs;if(cfg.vs){cfg.vs=0;try{$('vs').value='0'}catch(e){}save();upd()}setPgnLevel(eW,eB);$('hn').textContent='Loaded '+ML.length+' moves. Use ◀ ▶ to browse, or tap 🔍 Analyze to rate them.'+(PGNELO?' Level set from the PGN ratings: '+PGNELO+'.':'')+(was?' (Switched to Play both sides, because this game is loaded.)':'')}}
let AZ=0;
async function analyzeAll(){if(AZ||!ML.length)return;AZ=1;const n=ML.length,ids=[...Array(n).keys()].filter(i=>!RV[i]);
 for(const i of ids){if(H.length!==n||!H[i])break;const m=fromTok(H[i],ML[i]);if(!m)break;$('st').textContent='🔍 Analyzing move '+(i+1)+' of '+n+'…';await review(H[i],m,isBook(ML.slice(0,i+1)),i)}
 AZ=0;if(H.length===n){lastBar();upd();showSum()}}
function arrows(){const a=[],A=(m,c)=>{if(!m||m.f===m.t)return;const p=i=>{let x=i&7,y=i>>3;if(flip){x=7-x;y=7-y}return[x+.5,y+.5]},[x1,y1]=p(m.f),[x2,y2]=p(m.t),dx=x2-x1,dy=y2-y1,L=Math.hypot(dx,dy),ux=dx/L,uy=dy/L,ex=x2-ux*.32,ey=y2-uy*.32;
  a.push(`<line x1="${x1+ux*.25}" y1="${y1+uy*.25}" x2="${ex}" y2="${ey}" stroke="${c}" stroke-width=".16" stroke-linecap="round" opacity=".85"/><polygon points="${x2-ux*.05},${y2-uy*.05} ${ex-uy*.2},${ey+ux*.2} ${ex+uy*.2},${ey-ux*.2}" fill="${c}" opacity=".85"/>`)};
 A(TS?TA:(RV[(vi<0?H.length:vi)-1]||{}).ba,'#3b82f6');A(hint,'#2f9e5b');A(vi<0?PRE:null,'#dd3333');$('ar').innerHTML=a.join('')}
function R(){const keep=S,kl=LC;if(vi>=0){S=TS||[...H,S][vi];LC=legal(S)}try{R0()}finally{S=keep;LC=kl}bars();arrows()}
function mat(s){const v={p:8,n:2,b:2,r:2,q:1},c={};let d=0;for(const p of s.b)if(p){c[p]=(c[p]||0)+1;d+=(p<'a'?1:-1)*VS[p.toLowerCase()]}
 const ln=lo=>'qrbnp'.split('').map(k=>(G[k]+'\uFE0E').repeat(Math.max(0,v[k]-(c[lo?k:k.toUpperCase()]||0)))).join('');
 return{w:ln(true)+(d>0?' +'+d/100:''),b:ln(false)+(d<0?' +'+(-d/100):'')}}
function fmtC(ms){ms=Math.max(0,ms);if(ms<10000)return(ms/1000).toFixed(1);const s=Math.ceil(ms/1000);return Math.floor(s/60)+':'+String(s%60).padStart(2,'0')}
function bars(){const s=vi>=0?(TS||[...H,S][vi]):S,m=mat(s),tc=tcs()[0],nm=x=>cfg.vs?(x===cfg.me?'🙂 You ('+RT+')':bot().a+' '+bot().n+' ('+bot().e+')'):(x==='w'?'⚪ White':'⚫ Black');
 for(const[el,x]of[['pt',flip?'w':'b'],['pbm',flip?'b':'w']]){const run=!over&&ML.length>=2&&S.t===x;
  $(el).innerHTML='<span><b>'+nm(x)+'</b> <span class="mu" style="margin:0 0 0 6px">'+m[x]+'</span></span>'+(tc?'<span class="ck'+(run?' on':'')+(CK[x]<20000?' lo':'')+'">'+fmtC(CK[x])+'</span>':'')}}
setInterval(()=>{const n=Date.now(),dt=n-LT;LT=n;if(!tcs()[0]||over||ML.length<2)return;CK[S.t]-=dt;{const sc=Math.ceil(CK[S.t]/1000);if(CK[S.t]>0&&CK[S.t]<10000&&sc!==LS){LS=sc;snd('w')}}if(CK[S.t]<=0){CK[S.t]=0;endGame((S.t==='w'?'White':'Black')+' lost on time — '+(S.t==='w'?'Black':'White')+' wins');return}bars()},200);
/* drag & drop */
document.addEventListener('pointerdown',e=>{const q=e.target.closest&&e.target.closest('.sq');if(!q||(vi<0&&over)||PM)return;const SH=vi>=0?(TS||[...H,S][vi]):S,i=+q.dataset.i,p=SH.b[i],mine=PRM()?cfg.me:SH.t;if(!p||(p<'a')!==(mine==='w'))return;DG={i,x:e.clientX,y:e.clientY,on:false,g:null}});
document.addEventListener('pointermove',e=>{if(!DG)return;if(!DG.on){if(Math.hypot(e.clientX-DG.x,e.clientY-DG.y)<8)return;DG.on=true;sel=DG.i;R();const o=document.querySelector('.sq[data-i="'+DG.i+'"]');if(o&&o.firstChild&&o.firstChild.nodeType===3)o.firstChild.nodeValue='';const p=(vi>=0?(TS||[...H,S][vi]):S).b[DG.i],g=document.createElement('div');g.textContent=G[p.toLowerCase()]+'\uFE0E';g.className=p<'a'?'pw':'pb';g.style.cssText='position:fixed;pointer-events:none;z-index:9;line-height:1;transform:translate(-50%,-50%) scale(1.15);font-size:'+getComputedStyle($('bd')).fontSize;document.body.appendChild(g);DG.g=g}
 DG.g.style.left=e.clientX+'px';DG.g.style.top=e.clientY+'px'});
const dEnd=e=>{if(!DG)return;const d=DG;DG=null;if(!d.on)return;d.g&&d.g.remove();const el=e.type==='pointerup'?document.elementFromPoint(e.clientX,e.clientY):null,q=el&&el.closest&&el.closest('.sq');if(q&&+q.dataset.i!==d.i){NOAN=1;try{click(+q.dataset.i)}finally{NOAN=0}}else{R()}SUP=Date.now()};
document.addEventListener('pointerup',dEnd);document.addEventListener('pointercancel',dEnd);
function tryClick(i){const b=TS||[...H,S][vi],lm=legal(b),mv=sel>=0?lm.filter(m=>m.f===sel&&m.t===i):[];if(mv.length){tryPlay(b,mv.find(x=>x.pr==='q')||mv[0]);return}const p=b.b[i];if(p&&(p<'a')===(b.t==='w')&&lm.some(m=>m.f===i))sel=sel===i?-1:i;else sel=-1;R()}
async function tryRate(b,m,line){const nn=apply(b,m),nl=legal(b).length,r=nl===1?{m,sc:0}:await engC(b,1000,6),bm=r.m,same=nl===1||(bm.f===m.f&&bm.t===m.t);let loss=0;if(!same){const v=await evAfter(nn);loss=Math.max(0,r.sc+v.sc)}if(!legal(nn).length&&inChk(nn))loss=0;
 const wd=Math.max(0,WP(r.sc)-WP(r.sc-loss)),bk=isBook(line);let k;if(nl===1)k='forced';else if(bk)k='book';else if(same||wd<=.1)k='best';else if(wd<=2)k='excellent';else if(wd<=5)k='good';else if(wd<=10)k='inacc';else if(wd<=20)k='mistake';else k='blunder';return{k,loss,bm,nn,wd,sc:nl===1?null:r.sc}}
async function tryPlay(b,m){try{snd(mvKey(b,m,apply(b,m),false))}catch(e){}const id=++TTK,first=!TST.length,played=first&&ML[vi]?sans()[vi]:'';TST.push({s:TS,l:TL,o:TTO});TTO=(TTO||ML.slice(0,vi)).concat([tok(m)]);sel=-1;TS=apply(b,m);TL=tok(m);TA=null;BD=null;try{snd(b.b[m.t]?'x':'m')}catch(e){}R();$('hn').innerHTML='<div class="mu">Checking your move...</div>';
 const x=await tryRate(b,m,TTO);if(id!==TTK)return;const t=RTG[x.k],bad=['good','inacc','mistake','miss','blunder'].includes(x.k);BD={sq:m.t,sym:t[0],col:t[2]};TA=bad?{f:x.bm.f,t:x.bm.t}:null;
 let h='<span style="background:'+t[2]+';color:#fff;padding:2px 9px;border-radius:12px;font-weight:700">'+t[0]+' '+t[1]+'</span> '+t[3];if(bad)h+='<div style="margin-top:6px">Better was: <b>'+san(b,x.bm)+'</b> <span class="mu">(blue arrow)</span></div>';if(x.loss>=30)h+='<div class="mu">'+(x.loss>5000?'Lets the opponent force a mate':'Cost: about '+(x.loss/100).toFixed(1)+' pawns (win chance -'+x.wd.toFixed(0)+'%)')+'</div>';
 if(!legal(x.nn).length)h+='<div style="margin-top:6px"><b>'+(inChk(x.nn)?'Checkmate!':'Stalemate')+'</b></div>';if(played)h+='<div class="mu" style="margin-top:6px">In the game: <b>'+played+'</b></div>';
 window.TW={b,m,k:x.k,bm:x.bm,loss:x.loss,bs:x.sc};h+='<div class="bt" style="margin-top:8px"><button onclick="WHYT()">💡 Why?</button><button onclick="tryBack()">Take back</button><button onclick="go(1e9)">Back to game</button></div>';$('hn').innerHTML=h;R()}
function tryBack(){const p=TST.pop();if(!p)return;if(!TST.length){go(vi);return}TTK++;TS=p.s;TL=p.l;TTO=p.o;TA=null;BD=null;sel=-1;$('hn').innerHTML='<div class="mu">Move taken back. Try another move.</div><div class="bt"><button onclick="tryBack()">Take back</button><button onclick="go(1e9)">Back to game</button></div>';R()}
function go(t){TS=null;TL=null;TA=null;TST=[];TTO=null;TTK++;const n=H.length;t=Math.max(0,Math.min(n,t));try{if(TS||t!==(vi<0?n:vi))reviewSnd(t,n)}catch(e){}vi=t===n?-1:t;hint=null;sel=-1;$('pm').style.display='none';const e=RV[t-1];BD=e?{sq:e.sq,sym:RTG[e.k][0],col:RTG[e.k][2]}:null;$('hn').innerHTML=e?e.h+(window.whyBtn?whyBtn(t-1):''):t===0?'Start position.':'';setBar(EV[t-1]??0);upd()}
function lastBar(){let v=0;for(let i=EV.length-1;i>=0;i--)if(EV[i]!=null){v=EV[i];break}setBar(v)}
const nav=d=>go((vi<0?H.length:vi)+d);
document.addEventListener('keydown',e=>{if(e.key==='ArrowLeft')nav(-1);if(e.key==='ArrowRight')nav(1)});
const WP=c=>50+50*(2/(1+Math.exp(-alK()*c))-1);
/* accuracy: volatility-weighted mean blended with harmonic mean (punishes blunders; forced moves ignored) */
function accOf(s){const n=ML.length,ws=Math.min(8,Math.max(2,n/10|0)),ar=[50];let l=50;for(let i=0;i<n;i++){if(EV[i]!=null)l=WP(EV[i]);ar.push(l)}
 let sw=0,sa=0,sh=0,c=0;
 for(let i=0;i<n;i++){const x=RV[i];if(!x||x.s!==s||x.k==='forced')continue;const sl=ar.slice(Math.max(0,i+1-(ws>>1)),i+2+(ws>>1)),mu=sl.reduce((p,q)=>p+q,0)/sl.length,sd=Math.sqrt(sl.reduce((p,q)=>p+(q-mu)**2,0)/sl.length),w=['inacc','mistake','miss','blunder'].includes(x.k)?Math.max(4,Math.min(12,sd)):Math.min(12,Math.max(.5,sd)),a=Math.max(x.acc,1);sw+=w;sa+=w*a;sh+=1/a;c++}
 return c?(sa/sw+c/sh)/2:0}
function showSum(){const row=s=>{const a=RV.filter(x=>x&&x.s===s);if(!a.length)return `<div class="mu">${s==='w'?'White':'Black'}${cfg.vs?(s===cfg.me?' (You)':' ('+bot().n+')'):''}: moves not analyzed yet.</div>`;const ac=accOf(s);return `<div style="margin:6px 0"><b>${s==='w'?'White':'Black'}${cfg.vs?(s===cfg.me?' (You)':' ('+bot().n+')'):''}</b> — accuracy <b>${ac.toFixed(0)}%</b><br>`+Object.keys(RTG).map(k=>{const n=a.filter(x=>x.k===k).length;return n?`<span style="color:${RTG[k][2]};font-weight:700;margin-right:8px">${RTG[k][0]} ${RTG[k][1]}: ${n}</span>`:''}).join('')+'</div>'};
 const pts=EV.map((v,i)=>v==null?null:[i,v]).filter(Boolean),n=Math.max(ML.length-1,1);
 const g=pts.length>1?`<svg viewBox="0 0 300 60" style="width:100%;height:60px;margin-top:6px;background:rgba(128,128,128,.15);border-radius:8px"><line x1="0" y1="30" x2="300" y2="30" stroke="#888" stroke-width=".5"/><polyline fill="none" stroke="#2f9e5b" stroke-width="2" points="${pts.map(([i,v])=>(i/n*300).toFixed(1)+','+(30-28*Math.tanh(v/500)).toFixed(1)).join(' ')}"/></svg>`:'';
 $('hn').innerHTML='<b>📊 Game summary</b>'+(RDm?'<div class="mu" style="margin:4px 0">'+RDm+'</div>':'')+(row('w')+row('b')||'<div class="mu">No rated moves yet.</div>')+g+(ML.length&&RV.filter(Boolean).length<ML.length?'<div style="margin-top:8px"><button onclick="analyzeAll()">🔍 Rate all moves</button></div>':'')+'<div class="mu">Graph: evaluation over the game (up = better for White).</div>'}
async function pick(){const lv=cfg.lv;PSC=null;
 if(SFok){const r=await eng(S,[0,150,400,1000,2500][lv],12,[0,0,6,14,20][lv]);if(lv>=3)PSC=r.sc;return r.m}
 if(lv>=3){const r=think(S,lv===3?1500:4000,12);PSC=r.sc;return r.m}
 const L=scoreAll(S,lv===1?1:2).sort((a,b)=>b.v-a.v);return lv===1?L[Math.floor(Math.random()*Math.min(4,L.length))].m:L[0].m}
const ECache=new Map();
async function engC(s,T,maxD){if(!SFok)return eng(s,T,maxD);const k=fen(s)+'|'+AQ+'|'+(WASMOK?1:0),h=ECache.get(k);if(h)return h;const r=await eng(s,T,maxD);if(SFok){ECache.set(k,r);if(ECache.size>700)ECache.delete(ECache.keys().next().value)}return r}
async function evAfter(n){if(!legal(n).length)return{sc:inChk(n)?-99999:0,m:null,d:1};return engC(n,1000,6)}
async function review(pr,m,bk,pi){const nl=legal(pr).length,nn=apply(pr,m);let r;if(SFok&&nl===1){const v0=await evAfter(nn);r={m,sc:-v0.sc,d:1}}else r=await engC(pr,1000,6);const bm=r.m;let loss=0;
 if(!(bm.f===m.f&&bm.t===m.t)){if(SFok){const v=await evAfter(nn);loss=r.sc+v.sc}else{DL=Date.now()+1500;AB=false;const v=-search(apply(pr,m),r.d-1,-Infinity,Infinity);loss=AB?0:r.sc-v}}
 loss=Math.max(0,loss);const op=pr.t==='w'?'b':'w',n=apply(pr,m),pc=pr.b[m.f].toLowerCase(),cv=pr.b[m.t]?V[pr.b[m.t].toLowerCase()]:0;let scA=r.sc-loss;
 let acc;const W=WP;acc=Math.max(0,Math.min(100,103.1668*Math.exp(-0.04354*Math.max(0,W(r.sc)-W(scA)))-3.1669));
 if(!legal(n).length&&inChk(n)){loss=0;scA=r.sc}
 const wd=Math.max(0,W(r.sc)-W(scA));
 /* sacrifice (chess.com style): standard values 1/3/3/5/9, the capture must be LEGAL for the opponent, and answering a check is never a sacrifice */
 let sac=false;if(pc!=='p'&&pc!=='k'&&!inChk(pr)){try{const cvS=pr.b[m.t]?VS[pr.b[m.t].toLowerCase()]:0,capV=sq=>{let q9=9999;for(const q of legal(n)){if(q.t!==sq)continue;const l=n.b[q.f].toLowerCase();q9=Math.min(q9,l==='k'?1000:VS[l])}return q9},la=capV(m.t);
  if(la<9999){if((att(n.b,m.t,pr.t)?Math.max(0,VS[pc]-la):VS[pc])-cvS>=200)sac=true;else if(VS[pc]>=300&&la>=50&&la<=100&&VS[pc]-la-cvS>=100)sac=true}
  /* another piece of yours was already en prise before the move and the move ignores it (e.g. Qc3). A piece that only BECOMES loose after the move is a mistake, not a sacrifice */
  if(!sac){const was=new Set(hangP(pr,pr.t).map(h=>h.i));for(const h of hangP(n,pr.t)){if(h.l==='p'||h.i===m.t||!was.has(h.i))continue;const lh=capV(h.i);if(lh>=9999)continue;const net=att(n.b,h.i,pr.t)?VS[h.l]-Math.min(lh,VS[h.l]):VS[h.l];if(inChk(n)||pr.b[m.t]||net<500)continue;sac=true;break}}}catch(e){}}
 let sacL=null;if(loss<=15&&!bk&&nl>1&&!sac&&window.SACLINE&&Math.abs(r.sc)<800){try{sacL=await window.SACLINE(pr,m)}catch(e){}}
 let mg=0;if(loss<=15&&!bk&&nl>1&&!sac&&!(sacL&&sacL.sac)&&Math.abs(r.sc)<700){const L=(await scoreAllA(pr,2)).sort((a,b)=>b.v-a.v);mg=L[0].v-L[1].v}
 /* data for calibrating Great: how much worse is the best OTHER move (Stockfish, searchmoves)? logged only, not used yet */
 let gap=null;if(window.DBGGAP&&SFok&&loss<=15&&!bk&&nl>1&&bm){try{const ex=legal(pr).filter(q=>!(q.f===bm.f&&q.t===bm.t&&(q.pr||'q')===(bm.pr||'q'))).map(q=>sqn(q.f)+sqn(q.t)+(q.pr||'')).join(' ');if(ex){const r2=await eng(pr,1000,6,20,ex);if(r2&&r2.sc!=null)gap={g:Math.max(-1500,Math.min(1500,r.sc-r2.sc)),gw:+(W(r.sc)-W(r2.sc)).toFixed(1)}}}catch(e){}}
 const bc=pr.b[bm.t]?V[pr.b[bm.t].toLowerCase()]:0,same=bm.f===m.f&&bm.t===m.t&&(m.pr||'q')===(bm.pr||'q'),big=false;let k;
 if(nl===1)k='forced';
 else if(bk&&!big)k='book';
 else if(loss<=15&&!big&&sac&&scA>-100)k='brilliant';
 else if(loss<=15&&!big&&same&&(gap?(!pr.b[m.t]&&((gap.gw>=7.5&&scA>-150&&scA<680)||(scA>90000&&gap.gw>=50&&legal(n).length>0))):(mg>=300&&Math.abs(r.sc)<500)))k='great';
 else if(same||wd<=.1)k='best';
 else if(wd<=2&&!big)k='excellent';else if(wd<=5&&!big)k='good';
 else if(wd>=10&&(r.sc>90000||(bc>=300&&!att(apply(pr,bm).b,bm.t,op)))&&!(pi>0&&RV[pi-1]&&RV[pi-1].dbg&&RV[pi-1].dbg.wd<6))k='miss';
 else if(big)k=loss>=500?'blunder':'mistake';
 else if(wd<=10)k='inacc';else if(wd<=20)k='mistake';else k='blunder';
 /* walking into a forced mate is never just 'good': chess.com calls it at least a mistake, even when the position was already lost (the win-chance curve is flat there) */
 if(scA<-90000&&r.sc>-90000&&(k==='excellent'||k==='good'||k==='inacc'))k=r.sc>-1300?'mistake':'inacc';
 /* Miss (chess.com): the opponent just erred (lost >=6% win chance) and this move throws the chance away (loses >=6% and you are not clearly winning afterwards) */
 if((k==='inacc'||k==='mistake')&&wd>=10&&scA<=100&&pi>0&&RV[pi-1]&&RV[pi-1].dbg&&RV[pi-1].dbg.wd>=10)k='miss';
 /* Miss, second case (chess.com): your opponent's last real move (forced replies skipped) was a mistake or blunder, you were not worse before moving, and your move drops >= 6% win chance, even if you are still ahead afterwards */
 if((k==='inacc'||k==='mistake'||k==='blunder')&&wd>=10&&r.sc>=0&&(r.sc>=150||wd<30)&&pi>0){let oe=false;for(let j=pi-1;j>=Math.max(0,pi-5);j-=2){const x=RV[j];if(!x)break;if(x.k==='forced')continue;oe=x.k==='mistake'||x.k==='blunder';break}if(oe)k='miss'}
 acc=Math.min(acc,{blunder:30,miss:42,mistake:55,inacc:78}[k]||100);if(scA<300&&scA>-300)acc=Math.min(acc,100-Math.min(65,loss/5));
 const t=RTG[k],bad=['good','inacc','mistake','miss','blunder'].includes(k),pn=up(NM[pr.b[bm.f].toLowerCase()])+' '+sqn(bm.f)+' → '+sqn(bm.t),wy=why(pr,bm)[0];
 let h=`<span style="background:${t[2]};color:#fff;padding:2px 9px;border-radius:12px;font-weight:700">${t[0]} ${t[1]}</span> ${t[3]}`;
 if(bad)h+=`<div style="margin-top:6px">Better was: <b>${pn}</b> — ${wy} <span class="mu">(blue arrow)</span></div>`;
 if(loss>=30)h+=`<div class="mu">${loss>5000?'Lets the opponent force a mate':'Cost: about '+(loss/100).toFixed(1)+' pawns (win chance -'+wd.toFixed(0)+'%)'}</div>`;
 if(CH&&!['best','excellent','book','great','brilliant','forced'].includes(k)){const ct=await coachNote(pr,m,bm,k,n,op,pi);if(ct)h+=ct}
 if(H[pi]!==pr)return;
 RV[pi]={s:pr.t,k,acc,sq:m.t,h,ba:bad?{f:bm.f,t:bm.t}:null,bs:r.sc,bm:tok(bm),dbg:{sac:+!!sac,sl:sacL?+!!sacL.sac:null,dip:sacL?sacL.dip:null,mg,g:gap?gap.g:null,gw:gap?gap.gw:null,cap:+!!pr.b[m.t],chk:+inChk(n),wd:+wd.toFixed(1),loss,rs:r.sc,sa:scA}};EV[pi]=(pr.t==='w'?1:-1)*scA;
 if(pi===ML.length-1)setBar(EV[pi]);
 if(vi<0){BD={sq:m.t,sym:t[0],col:t[2]};$('hn').innerHTML=h+(window.whyBtn?whyBtn(pi):'');R()}
 save();if(over)setTimeout(showSum,0)}
function play(m,cpu){vi=-1;const pr=S;ANIM=NOAN?null:{f:m.f,t:m.t,p:pr.b[m.f]};if(tcs()[0]&&ML.length>=2)CK[pr.t]+=tcs()[1]*1000;H.push(S);ML.push(tok(m));const pi=ML.length-1,bk=isBook(ML);S=apply(S,m);sel=-1;hint=null;BD=null;save();upd();
 {const _k=over?endK():inChk(S)?'+':m.pr?'p':(pr.b[m.f].toLowerCase()==='k'&&Math.abs(m.t-m.f)===2)?'c':((pr.b[m.t]||(pr.b[m.f].toLowerCase()==='p'&&m.t===pr.ep))?'x':'m');snd((_k==='m'||_k==='x')&&cpu?_k+'o':_k)}
 if(!cpu)setTimeout(()=>maybeCpu(()=>{if(window.LIVEAN!==0)review(pr,m,bk,pi)}),40)}
function maybeCpu(after){if(!cfg.vs||over||S.t!==cpuSide()){if(after)after();return}$('st').textContent='🤖 Computer is thinking...';
 const s0=S;setTimeout(async()=>{const m=await pick();if(S!==s0)return;if(m){play(m,true);if(PSC!=null)setBar((cpuSide()==='w'?1:-1)*PSC);runPre()}if(after)setTimeout(after,50)},60)}
const _u=undo,_n=newG,_h=doHint;
undo=function(){vi=-1;PRE=null;END='';_u();for(const s of'wb')if(CK[s]<=0&&tcs()[0])CK[s]=15000;RV.length=Math.min(RV.length,ML.length);EV.length=Math.min(EV.length,ML.length);lastBar();save()};
newG=function(){vi=-1;GD=false;RDm='';PRE=null;END='';resetCk();RV.length=0;EV.length=0;BD=null;setBar(0);$('px').style.display=$('pb2').style.display='none';_n();snd('s');if(cfg.vs)$('hn').textContent=botTxt()};
doHint=function(){if(PRM())return;_h()};
async function coachNote(pr,m,bm,k,n,op,pi){const o=[],pk=pr.b[m.f].toLowerCase(),cz=['inacc','mistake','miss','blunder'].includes(k),nmx=x=>NM[x.toLowerCase()];
 if(cz){const rr=(WASMOK&&ECache.get(fen(n)+'|'+AQ+'|1'))||await eng(n,500,5);
  if(rr&&rr.m){const rm=rr.m,rn=apply(n,rm),cp=n.b[rm.t]||(n.b[rm.f].toLowerCase()==='p'&&rm.t===n.ep?'p':'');
   if(!legal(rn).length&&inChk(rn))o.push('Your move allows checkmate: '+san(n,rm)+'.');
   else if(cp&&V[cp.toLowerCase()]-(att(rn.b,rm.t,pr.t)?V[n.b[rm.f].toLowerCase()]:0)>=100)o.push('It lets the opponent win your '+nmx(cp)+' with '+san(n,rm)+'.')}
  const bn=apply(pr,bm),bc=pr.b[bm.t]||(pr.b[bm.f].toLowerCase()==='p'&&bm.t===pr.ep?'p':'');
  if(!legal(bn).length&&inChk(bn))o.push('You missed checkmate with '+san(pr,bm)+'!');
  else if(bc&&bm.t!==m.t)o.push('You missed a chance to win a '+nmx(bc)+': '+san(pr,bm)+'.');
  if(!o.length&&pk!=='k'&&att(n.b,m.t,op)&&(!att(n.b,m.t,pr.t)||lowAtt(n.b,m.t,op)<V[pk]))o.push('Your '+NM[pk]+' on '+sqn(m.t)+' can now be captured.');
  if(!o.length)o.push('The engine prefers '+san(pr,bm)+': '+why(pr,bm)[0].replace(/^./,c=>c.toLowerCase())+'.')}
 const mine=ML.slice(0,pi+1).filter((x,i)=>i%2===pi%2),prev=mine[mine.length-2];
 if(pk==='q'&&pi<8)o.push('Tip: early queen moves can be chased away. Develop knights and bishops first.');
 else if(pk!=='p'&&pi<14&&prev&&prev.slice(2,4)===sqn(m.f)&&!pr.b[m.t])o.push('Tip: you moved the same piece twice in the opening. Try developing a new piece.');
 else if(pi>=14&&pk!=='k'&&!(pr.t==='w'?(n.c.K||n.c.Q):(n.c.k||n.c.q))&&pr.b[pr.t==='w'?60:4]===(pr.t==='w'?'K':'k'))o.push('Tip: castle soon to tuck your king away safely.');
 return o.length?'<div style="margin-top:6px">🎓 '+o.join(' ')+'</div>':''}
async function coachHint(){const rv=vi>=0;if((over&&!rv)||PRM())return;const cur=()=>vi>=0?(TS||[...H,S][vi]):S,P=cur(),key=fen(P),vk=vi;
 if(HC&&HC.k===key)HC.l=Math.min(3,HC.l+1);else{$('hn').textContent='🎓 Let me think…';const r=await eng(P,1500,10);if(vi!==vk||fen(cur())!==key)return;if(!r||!r.m){$('hn').textContent='No legal moves in this position.';return}HC={k:key,l:1,r}}
 const m=HC.r.m,p=P.b[m.f].toLowerCase(),w=why(P,m),x=w[0];hint=null;
 if(HC.l===1)$('hn').innerHTML='🎓 <b>Hint 1 of 3</b><br>'+(x.startsWith('Checkmate')?'Look for a way to checkmate!':x.startsWith('Castling')?'Think about the safety of your king.':'Look for a move that '+x.replace(/^./,c=>c.toLowerCase())+'.')+'<br><span class="mu">Tap Coach again for the next hint.</span>';
 else if(HC.l===2){hint={f:m.f,t:m.f};$('hn').innerHTML='🎓 <b>Hint 2 of 3</b><br>Look at your <b>'+NM[p]+'</b> on '+sqn(m.f)+'. Where can it do the most good?<br><span class="mu">Tap Coach again for the move.</span>'}
 else{hint=m;$('hn').innerHTML='🎓 <b>Hint 3 of 3</b><br><b>'+up(NM[p])+' '+sqn(m.f)+' → '+sqn(m.t)+' ('+san(P,m)+')</b><ul>'+w.map(y=>'<li>'+y+'</li>').join('')+'</ul>'}
 R()}
/* bots: each Elo plays differently (soft-max over move scores for weaker bots, Stockfish skill for stronger ones) */
async function pick(){const e=bot().e;PSC=null;if(!SFok&&ML.length<14){const bk=bookMove(S,true);if(bk&&Math.random()<.9)return bk}
 const soft=(L,T)=>{if(!L.length)return null;const cl=e<800?600:e<1200?1000:3000,mx=Math.min(cl,Math.max(...L.map(x=>x.v))),w=L.map(x=>Math.exp((Math.max(-cl,Math.min(cl,x.v))-mx)/T));let r=Math.random()*w.reduce((p,q)=>p+q,0);for(let i=0;i<L.length;i++){r-=w[i];if(r<=0)return L[i].m}return L[0].m};
 if(e<1400)return soft(await scoreAllA(S,e<700?1:2),Math.max(14,(1500-e)/5));
 const sk=Math.max(0,Math.min(20,Math.round((e-1300)/85))),tm=Math.min(2500,Math.round(120+(e-1300)*1.4));
 if(SFok){const r=await eng(S,tm,12,sk);if(e>=1800)PSC=r.sc;return r.m}
 if(e<1800)return soft(await scoreAllA(S,2),30);
 const r=await thinkA(S,Math.min(4000,600+(e-1700)*2),12);PSC=r.sc;return r.m}
/* built-in engine runs in a Web Worker so the page never freezes while the computer thinks */
let EW=null,EWid=0;const EWp=new Map();
try{const src='const V='+JSON.stringify(V)+',N='+JSON.stringify(N)+',K='+JSON.stringify(K)+';const kp='+kp.toString()+',inChk='+inChk.toString()+',legal='+legal.toString()+',key='+key.toString()+';const TT=new Map(),HI=new Int32Array(4096);let DL=0,AB=false,nodes=0;\n'+[att,gen,apply,ev,order,qs,search,think,scoreAll].map(f=>f.toString()).join('\n')+'\nonmessage=e=>{const d=e.data;let r;try{r=d.op==="think"?think(d.s,d.T,d.maxD):scoreAll(d.s,d.D)}catch(x){r=null}postMessage({id:d.id,r})}';
 EW=new Worker(URL.createObjectURL(new Blob([src])));EW.onmessage=e=>{const f=EWp.get(e.data.id);if(f){EWp.delete(e.data.id);f(e.data.r)}};EW.onerror=()=>{EW=null;for(const f of EWp.values())f(undefined);EWp.clear()}}catch(e){EW=null}
const ewCall=(msg,fb)=>EW?new Promise(res=>{const id=++EWid;EWp.set(id,r=>res(r===undefined?fb():r));EW.postMessage({...msg,id})}):Promise.resolve(fb());
const thinkA=(s,T,maxD)=>ewCall({op:'think',s,T,maxD},()=>think(s,T,maxD)),scoreAllA=(s,D)=>ewCall({op:'score',s,D},()=>scoreAll(s,D));
