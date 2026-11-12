/* v9: "Why?" mode - explains the reason behind each move rating (English / العربية) */
(()=>{
const isAr=()=>{try{return localStorage.getItem('chessLang')==='ar'}catch(e){return false}};
const L=(e,a)=>isAr()?a:e;
const PNa={p:'بيدق',n:'حصان',b:'فيل',r:'قلعة',q:'وزير',k:'ملك'};
const nm=x=>isAr()?PNa[x.toLowerCase()]:NM[x.toLowerCase()];
const AN={100:['pawn','بيدق'],320:['knight','حصان'],330:['bishop','فيل'],500:['rook','قلعة'],900:['queen','وزير'],999:['king','ملك'],1000:['king','ملك']};
const an=v=>{const a=AN[v];return a?L(a[0],a[1]):L('piece','قطعة')};
const fmt=v=>Math.abs(v)>90000?(v>0?'M':'-M'):(v>=0?'+':'')+(v/100).toFixed(1);
const B=s=>'<b>'+s+'</b>';
const rowOf=i=>i>>3,colOf=i=>i&7;
/* my pieces (not king) that the opponent can win: attacked and either unprotected or attacked by something cheaper */
const hang=(s,side)=>{const o=side==='w'?'b':'w',r=[];for(let i=0;i<64;i++){const p=s.b[i];if(!p||(p<'a')!==(side==='w'))continue;const l=p.toLowerCase();if(l==='k')continue;const la=lowAtt(s.b,i,o);if(att(s.b,i,o)&&(!att(s.b,i,side)||la<V[l]))r.push({i,l,la})}return r};
const capOf=(s,m)=>s.b[m.t]||(s.b[m.f].toLowerCase()==='p'&&m.t===s.ep?'p':'');
const mate=(s,m)=>{const n=apply(s,m);return !legal(n).length&&inChk(n)};
/* ---- positional (non-tactical) reasons ---- */
const kingSq=(s,side)=>s.b.indexOf(side==='w'?'K':'k');
const rights=(s,side)=>side==='w'?(s.c.K?1:0)+(s.c.Q?1:0):(s.c.k?1:0)+(s.c.q?1:0);
const shield=(s,side)=>{const k=kingSq(s,side);if(k<0)return 0;const r=rowOf(k),c=colOf(k),dir=side==='w'?-1:1,P=side==='w'?'P':'p';let n=0;for(const dr of[1,2])for(const dc of[-1,0,1]){const rr=r+dir*dr,cc=c+dc;if(rr>=0&&rr<8&&cc>=0&&cc<8&&s.b[rr*8+cc]===P)n++}return n};
const pawnFacts=(s,side)=>{const P=side==='w'?'P':'p',cnt=Array(8).fill(0);for(let i=0;i<64;i++)if(s.b[i]===P)cnt[colOf(i)]++;let d=0,iso=0;for(let c=0;c<8;c++){if(cnt[c]>1)d+=cnt[c]-1;if(cnt[c]&&!(c>0&&cnt[c-1])&&!(c<7&&cnt[c+1]))iso+=cnt[c]}return{d,iso}};
function strat(pr,m,n,pk,me,ix){
 const R=[],castle=pk==='k'&&Math.abs(m.t-m.f)===2,back=me==='w'?7:0;
 const r0=rights(pr,me),r1=rights(n,me);
 if(!castle&&r1<r0)R.push(pk==='k'?L('Moving the king gives up your right to castle.','تحريك الملك بيضيّع حقك في التبييت.'):L('Moving this rook gives up castling on that side.','تحريك القلعة دي بيضيّع التبييت من الناحية دي.'));
 if(pk==='n'&&(colOf(m.t)===0||colOf(m.t)===7)&&colOf(m.f)!==0&&colOf(m.f)!==7)R.push(L('A knight on the edge controls fewer squares, so it is weaker there.','الحصان على حرف الرقعة بيتحكم في مربعات أقل فبيبقى أضعف.'));
 if(pk==='p'){
  const k=kingSq(n,me);
  if(k>=0&&rowOf(k)===back&&colOf(k)!==3&&colOf(k)!==4&&shield(n,me)<shield(pr,me))R.push(L('This pawn move weakens the pawn shield in front of your king.','حركة البيدق دي بتضعف البيادق اللي حامية ملكك.'));
  const a=pawnFacts(pr,me),b=pawnFacts(n,me);
  if(b.d>a.d)R.push(L('It creates doubled pawns, which are harder to defend and move.','بتعمل بيادق مضاعفة وده بيصعّب الدفاع عنها وتحريكها.'));
  else if(b.iso>a.iso)R.push(L('It leaves an isolated pawn with no friendly pawns next to it.','بتسيب بيدق معزول من غير بيادق صديقة جنبه.'));
 }
 if(ix!=null&&ML[ix]){
  const mine=ML.slice(0,ix+1).filter((x,i)=>i%2===ix%2),prev=mine[mine.length-2];
  if(pk==='q'&&ix<8&&!capOf(pr,m))R.push(L('Bringing the queen out early lets the opponent chase it with developing moves.','إخراج الوزير بدري بيخلّي الخصم يطارده وهو بيطوّر.'));
  else if(pk!=='p'&&pk!=='k'&&ix<14&&prev&&prev.slice(2,4)===sqn(m.f)&&!capOf(pr,m))R.push(L('You moved the same piece twice in the opening instead of developing a new one.','حرّكت نفس القطعة مرتين في الافتتاحية بدل ما تطوّر قطعة جديدة.'));
  if((pk==='n'||pk==='b')&&rowOf(m.t)===back&&rowOf(m.f)!==back&&ix>=8)R.push(L('It pulls a developed piece back to the first rank, so it loses activity.','بترجّع قطعة متطورة للصف الأول فبتفقد نشاطها.'));
  if(ix>=14&&pk!=='k'&&kingSq(n,me)===(me==='w'?60:4)&&r1>0)R.push(L('Your king is still in the centre; castling soon would make it safer.','ملكك لسه في النص، والتبييت قريب هيأمّنه.'));
 }
 return R.slice(0,3)}

/* ---- line-based explanation: follow the engine's best continuation instead of judging one move in isolation ---- */
const uciMv=(s,u)=>{const m=legal(s).find(q=>sqn(q.f)+sqn(q.t)===u.slice(0,4));return m?(u[4]?{...m,pr:u[4]}:m):null};
const matBal=(s,side)=>{let v=0;for(const p of s.b)if(p){const l=p.toLowerCase();if(l!=='k')v+=((p<'a')===(side==='w')?1:-1)*VS[l]}return v};
function mkLine(s0,moves){let s=s0;const sans=[],caps=[],tos=[],bals=[],b0=matBal(s0,s0.t);for(const q of moves){const c=capOf(s,q);sans.push(san(s,q));caps.push(c?c.toLowerCase():'');tos.push(q.t);s=apply(s,q);bals.push(matBal(s,s0.t)-b0)}
 return{sans,caps,tos,bals,net:bals.length?bals[bals.length-1]:0,mate:!legal(s).length&&inChk(s),n:moves.length}}
/* a sacrifice = the line drops at least 2 pawns of material and does not win it straight back */
window.SACLINE=async(pr,m)=>{const me=pr.t,op=me==='w'?'b':'w',n=apply(pr,m);if(!legal(n).length)return null;if(!hang(n,me).length&&!att(n.b,m.t,op))return null;
 let Ln=null;try{Ln=await lineFrom(pr,m,4)}catch(e){return null}const b=Ln.bals,dip=Math.min(...b.slice(0,2));return{sac:dip<=-200&&(b.length<3||b[2]<=-150),dip,end:Ln.net,line:Ln.sans.join(' ')}};
window.LINEFROMTOKS=(pos,toks)=>{const mv=[];let s=pos;for(const t of toks){const q=fromTok(s,t);if(!q)break;mv.push(q);s=apply(s,q)}return mkLine(pos,mv)};
async function lineFrom(s0,first,maxPl){
 const mv=[first];let s=apply(s0,first),lc=!!capOf(s0,first),guard=0;
 while(guard++<4&&legal(s).length&&(mv.length<maxPl||(lc&&mv.length<maxPl+3))){
  let r=null;try{r=await engC(s,700,12)}catch(e){}
  if(!r||!r.m)break;
  const take=r.pv?r.pv.split(' '):[sqn(r.m.f)+sqn(r.m.t)+(r.m.pr||'')];let any=false;
  for(const u of take){if(mv.length>=maxPl+3||(mv.length>=maxPl&&!lc))break;const q=uciMv(s,u);if(!q)break;lc=!!capOf(s,q);mv.push(q);s=apply(s,q);any=true}
  if(!any)break}
 return mkLine(s0,mv)}
const lt=l=>B(l.sans.slice(0,6).join(' ')+(l.sans.length>6?' …':'')),pw=v=>String(Math.round(Math.abs(v)/10)/10);

async function report(pr,m,k,bm,bs,loss,opt){
 opt=opt||{};const T0=Date.now();
 const me=pr.t,op=me==='w'?'b':'w',n=apply(pr,m),pk=pr.b[m.f].toLowerCase(),
  weak=['inacc','mistake','miss','blunder'].includes(k),
  same=!!bm&&bm.f===m.f&&bm.t===m.t&&(m.pr||'q')===(bm.pr||'q'),
  P=[],G=[],M=[],W=[],hb=hang(pr,me);
 /* 1) follow the game forward from the played move */
 let rr=null;if(!opt.Lm&&legal(n).length){try{rr=await engC(n,700,12)}catch(e){}}
 let Lm=opt.Lm;if(!Lm){try{Lm=legal(n).length?await lineFrom(pr,m,6):mkLine(pr,[m])}catch(e){Lm=mkLine(pr,[m])}}
 if(weak){
  if(rr&&rr.sc>90000)P.push(L('It allows a forced checkmate (mate in '+Math.max(1,99999-rr.sc)+' for the opponent).','النقلة دي بتسمح بكش مات إجباري (مات في '+Math.max(1,99999-rr.sc)+' للخصم).'));
  else if(Lm.net<=-100){
   let j=-1;for(let q=1;q<Lm.caps.length;q+=2)if(Lm.caps[q]){j=q;break}
   P.push(L('The likely continuation is '+lt(Lm)+', and you end up about '+pw(Lm.net)+' pawns down'+(j>=0?' (you lose your '+nm(Lm.caps[j])+' on '+B(sqn(Lm.tos[j]))+')':'')+'.',
            'التكملة المتوقعة '+lt(Lm)+' وبتنتهي وإنت ناقص حوالي '+pw(Lm.net)+' بيدق'+(j>=0?' (بتخسر ال'+nm(Lm.caps[j])+' على '+B(sqn(Lm.tos[j]))+')':'')+'.'))}
  else if(Lm.mate&&Lm.sans.length%2===0)P.push(L('The line '+lt(Lm)+' ends in checkmate against you.','الخط '+lt(Lm)+' بينتهي بكش مات ضدك.'))}
 else{
  if(Lm.mate&&Lm.sans.length%2===1)G.push(L('The line '+lt(Lm)+' ends in '+B('checkmate')+'.','الخط '+lt(Lm)+' بينتهي بـ'+B('كش مات')+'.'));
  else if(Lm.net>=100)G.push(L('It wins material: '+lt(Lm)+' leaves you about '+pw(Lm.net)+' pawns up.','بتكسب مادة: '+lt(Lm)+' بتسيبك متقدم حوالي '+pw(Lm.net)+' بيدق.'));
  else if(Lm.caps.some(Boolean)&&Lm.sans.length>1)G.push(L('Expected continuation: '+lt(Lm)+'. Material stays roughly equal.','التكملة المتوقعة: '+lt(Lm)+'. المادة بتفضل تقريباً متعادلة.'))}
 /* 2) positional reasons (only when the move was a bit worse than the best one) */
 if(!opt.puz&&(weak||(k==='good'&&!same))){strat(pr,m,apply(pr,m),pk,me,opt.ix).forEach(x=>(weak?P:W).push(x))}
 /* 3) what you missed: follow the best move forward too */
 if(bm&&!same){
  const bsn=san(pr,bm);
  if(mate(pr,bm))M.push(L('You had '+B('checkmate')+' with '+B(bsn)+'.','كان عندك '+B('كش مات')+' بنقلة '+B(bsn)+'.'));
  else if(bs!=null&&bs>90000)M.push(L('You had a forced checkmate here; '+B(bsn)+' started it.','كان عندك كش مات إجباري هنا، و'+B(bsn)+' كانت بدايته.'));
  else{
   let Lb=opt.Lb;if(!Lb&&Date.now()-T0<3500){try{Lb=await lineFrom(pr,bm,6)}catch(e){Lb=null}}
   if(Lb&&Lb.net>=100&&Lb.net-Lm.net>=100)M.push(L((weak?'Better was ':'Slightly better was ')+B(bsn)+'. Main line: '+lt(Lb)+' (wins about '+pw(Lb.net)+' pawns).',(weak?'الأفضل كانت ':'أحسن شوية كانت ')+B(bsn)+'. الخط الأساسي: '+lt(Lb)+' (بتكسب حوالي '+pw(Lb.net)+' بيدق).'));
   else{
    const bn=apply(pr,bm),hb2=hang(bn,me),sv=hb.filter(x=>{const q=x.i===bm.f?bm.t:x.i;return !hb2.some(y=>y.i===q)});
    if(sv.length&&weak)M.push(L('Your '+nm(sv[0].l)+' on '+B(sqn(sv[0].i))+' was under attack — '+B(bsn)+' deals with it.','ال'+nm(sv[0].l)+' بتاعك على '+B(sqn(sv[0].i))+' كان متهاجَم — '+B(bsn)+' بتحل المشكلة.'));
    else if(weak||k==='good'){const w0=why(pr,bm)[0];M.push(L('The engine prefers '+B(bsn)+': '+w0.charAt(0).toLowerCase()+w0.slice(1)+'.','المحرك بيفضّل '+B(bsn)+': '+w0.charAt(0).toLowerCase()+w0.slice(1)+'.'))}}}
 }
 /* 4) why a good move is good */
 if(!weak){
  {const ws=why(pr,m),gen=/^Improves your piece/;(ws.length>1||G.length?ws.filter(x=>!gen.test(x)):ws).forEach(x=>G.push(x))}
  if(!mate(pr,m)){
   const ho=hang(n,op),hp=hang(pr,op),nw=ho.filter(y=>!hp.some(z=>z.i===y.i));
   if(nw.length)G.push(L('It now threatens the opponent’s '+nm(nw[0].l)+' on '+B(sqn(nw[0].i))+'.','دلوقتي بتهدد ال'+nm(nw[0].l)+' بتاع الخصم على '+B(sqn(nw[0].i))+'.'))}
  if(k==='brilliant')G.push(L('You give up material, but the engine shows the position is better afterwards.','بتضحّي بمادة بس المحرك بيوضّح إن موقفك أحسن بعدها.'));
  if(k==='great')G.push(L('It is the one move that keeps your position; most others are clearly worse.','دي النقلة الوحيدة اللي بتحافظ على موقفك، ومعظم غيرها أسوأ بوضوح.'));
  if(k==='book')G.push(L('It follows known opening theory, so it is a safe, well-tested choice.','بتتبع نظرية افتتاحية معروفة، يعني اختيار آمن ومجرَّب.'));
  if(k==='forced')G.push(L('It is the only legal move.','دي النقلة القانونية الوحيدة.'));
  if(G.length>1){const gi=G.findIndex(x=>/^Improves your piece/.test(x));if(gi>=0)G.splice(gi,1)}
 }
 if(weak&&!P.length)P.push(opt.puz
  ?L('This move does not reach the key idea of the puzzle.','النقلة دي مش بتوصل لفكرة اللغز الأساسية.')
  :L('No piece is lost in the main line, but the evaluation drops: the opponent gets an easier game and more options.','مفيش قطعة بتضيع في الخط الأساسي بس التقييم بينزل: الخصم بياخد لعب أسهل وخيارات أكتر.'));
 let E='';
 if(bs!=null&&loss>=0&&(weak||loss>=10))E=L('Evaluation for you: ','التقييم لصالحك: ')+B(fmt(bs))+' → '+B(fmt(bs-loss));
 else if(loss>=30)E=L('Cost: about '+(loss/100).toFixed(1)+' pawns','الخسارة: حوالي '+(loss/100).toFixed(1)+' بيدق');
 const t=RTG[k],sec=(ic,a)=>a.map(x=>'<li style="margin:5px 0">'+ic+' '+x+'</li>').join(''),
  title=opt.title||(opt.puz&&weak?L('Why not this move?','ليه مش النقلة دي؟'):L('Why','ليه')+': '+t[0]+' '+t[1]);
 return '<b>💡 '+title+'</b><ul style="list-style:none;padding:0;margin:8px 0">'+sec('❌',P)+sec('⚠️',W)+sec('✅',G)+sec('🎯',M)+sec('🎯',opt.extra||[])+(E?'<li style="margin:5px 0">📈 '+E+'</li>':'')+'</ul>'}
window.WHYR=report;


/* puzzle explanation: why the solution works */
window.WHYPZ=async(pos,toks)=>{
 const m=fromTok(pos,toks[0]);if(!m)return'';
 return report(pos,m,'best',m,null,0,{puz:1,Lm:LINEFROMTOKS(pos,toks),title:L('Why this works','ليه النقلة دي شغالة')})};

let PREV='',K=0;
window.TW=null;
window.whyBtn=i=>RV[i]&&H[i]&&ML[i]?'<div class="bt" style="margin-top:8px"><button onclick="WHY('+i+')">💡 '+L('Why?','ليه؟')+'</button></div>':'';
const show=async f=>{const id=++K;try{$('cbb').classList.add('big')}catch(e){}PREV=$('hn').innerHTML;$('hn').innerHTML='<div class="mu">'+L('Working out why…','بحلل السبب…')+'</div>';
 let h;try{h=await f()}catch(e){h='<div class="mu">'+L('Could not explain this move.','معرفتش أشرح النقلة دي.')+'</div>'}
 if(id!==K)return;$('hn').innerHTML=h+'<div class="bt"><button onclick="WHYB()">← '+L('Back','رجوع')+'</button></div>'};
window.WHY=i=>{const pr=H[i],e=RV[i],m=pr&&fromTok(pr,ML[i]);if(!m||!e)return;
 const sg=pr.t==='w'?1:-1,loss=e.bs!=null&&EV[i]!=null?Math.max(0,e.bs-sg*EV[i]):0,bm=e.bm?fromTok(pr,e.bm):null;
 show(()=>report(pr,m,e.k,bm,e.bs,loss,{ix:i}))};
window.WHYT=()=>{const w=window.TW;if(!w)return;show(()=>report(w.b,w.m,w.k,w.bm,w.bs,w.loss||0))};
window.WHYB=()=>{K++;try{$('cbb').classList.remove('big')}catch(e){}$('hn').innerHTML=PREV};
const g0=go;go=function(t){K++;try{$('cbb').classList.remove('big')}catch(e){}return g0(t)};
})();

/* v10: Elo from PGN, accuracy trend, annotated PGN export */
(()=>{
const isAr=()=>{try{return localStorage.getItem('chessLang')==='ar'}catch(e){return false}};
const L=(e,a)=>isAr()?a:e;
const LS=(k,d)=>{try{return JSON.parse(localStorage.getItem(k))||d}catch(e){return d}},SV=(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}};
const hash=s=>{let h=5381;for(let i=0;i<s.length;i++)h=((h<<5)+h+s.charCodeAt(i))|0;return(h>>>0).toString(36)};
/* new game clears the level taken from a loaded PGN */
window.setPgnLevel=(w,b)=>{PGNEL={w:w||0,b:b||0};PGNELO=w&&b?Math.round((w+b)/2):(w||b||0);
 try{$('al').options[0].textContent=PGNELO?L('Level: Auto ('+PGNELO+' from PGN)','المستوى: تلقائي ('+PGNELO+' من الـPGN)'):L('Level: Auto','المستوى: تلقائي')}catch(e){}};
{const n0=newG;newG=function(){setPgnLevel(0,0);return n0.apply(this,arguments)}}
/* accuracy history, one record per analysed game (updated when analysis finishes) */
function saveAcc(){
 if(ML.length<10||(!cfg.vs&&!GD))return;
 const side=cfg.vs&&!GD?cfg.me:(flip?'b':'w'),n=RV.filter(x=>x&&x.s===side).length;if(n<5)return;
 const full=RV.filter(Boolean).length>=ML.length-1,ph=phases(side),r1=v=>v==null?null:Math.round(v),
  rec={id:hash(ML.join(' ')+side),d:Date.now(),s:side,a:Math.round(accOf(side)*10)/10,n,full,ph:{o:r1(ph.o),t:r1(ph.t),s:r1(ph.s),e:r1(ph.e)}},
  A=LS('chessAcc',[]),i=A.findIndex(x=>x.id===rec.id);
 if(i>=0){if(A[i].full&&!rec.full)return;rec.d=A[i].d;A[i]=rec}else A.push(rec);
 while(A.length>60)A.shift();SV('chessAcc',A)}
/* phases by lichess's Divider rules (opening / middlegame / endgame, without the mixedness term) */
function division(){
 const P=[...H,S];let mid=-1,end=-1;
 for(let i=0;i<P.length;i++){
  const b=P[i].b;let mm=0,wb=0,bb=0;
  for(let q=0;q<64;q++){const p=b[q];if(!p)continue;const l=p.toLowerCase();if(l!=='p'&&l!=='k')mm++;if(q>=56&&p<'a')wb++;if(q<8&&p>='a')bb++}
  if(mid<0&&(mm<=10||wb<4||bb<4))mid=i;
  if(mid>=0&&end<0&&mm<=6){end=i;break}}
 return{mid,end}}
phases=function(s){const o={o:[],t:[],s:[],e:[]},dv=division();
 RV.forEach((x,i)=>{if(!x||x.s!==s||x.k==='forced'||!H[i])return;const p=H[i];let ph;
  if(dv.mid<0||i<dv.mid)ph='o';else if(dv.end>=0&&i>=dv.end)ph='e';
  else{const sh=q=>{if(!q)return false;if(p.b[q.t]||q.pr)return true;const pc=p.b[q.f];if(pc&&pc.toLowerCase()==='p'&&(q.f&7)!==(q.t&7))return true;return inChk(apply(p,q))};
   ph=sh(fromTok(p,ML[i]))||sh(x.bm?fromTok(p,x.bm):null)?'t':'s'}
  o[ph].push(x.acc)});
 const f=a=>a.length?a.reduce((p,q)=>p+q,0)/a.length:null;return{o:f(o.o),t:f(o.t),s:f(o.s),e:f(o.e)}};

/* ---- new Game Review layout: ring gauges, stacked quality bars, radar of the four areas, key moments ---- */
{const st=document.createElement('style');st.textContent=`
.rp{display:flex;flex-direction:column;gap:12px}
.rp h3{margin:0;font-size:18px}
.rp .rg{display:grid;grid-template-columns:1fr 1fr;gap:10px}
.rp .rq{border-radius:16px;padding:10px 8px 12px;text-align:center;background:rgba(128,128,128,.12);border:1px solid var(--ln,#2a3550)}
.rp .rq .rn{font-size:13px;font-weight:700;margin-bottom:2px;display:flex;align-items:center;justify-content:center;gap:6px}
.rp .rd{width:11px;height:11px;border-radius:50%;display:inline-block;border:1px solid #888}
.rp .rt{font-size:12px;opacity:.9}
.rp .rbar{display:flex;height:12px;border-radius:7px;overflow:hidden;background:rgba(128,128,128,.25);margin-top:6px}
.rp .rcs{display:flex;flex-wrap:wrap;gap:4px;margin-top:6px;justify-content:center}
.rp .rc{font-size:12px;font-weight:800;padding:1px 8px;border-radius:999px;color:#10151f}
.rp .rx{border-radius:16px;padding:10px;background:rgba(128,128,128,.10);border:1px solid var(--ln,#2a3550)}
.rp .rx>b{display:block;margin-bottom:6px}
.rp .rk{display:flex;flex-wrap:wrap;gap:6px}
.rp .rk button{flex:0 1 auto;font-size:12px;padding:6px 10px}
.rp table{width:100%;border-collapse:collapse;font-size:13px;margin-top:4px}
.rp td{padding:2px 4px;text-align:center}.rp td:first-child{text-align:start}
`;document.head.appendChild(st)}
const ACC=a=>a>=90?'#2f9e5b':a>=75?'#8cbf3f':a>=60?'#e0a82e':'#ca3431';
const ring=a=>{const c=2*Math.PI*30,v=a==null?0:Math.max(0,Math.min(100,a));return'<svg viewBox="0 0 80 80" width="88" height="88"><circle cx="40" cy="40" r="30" fill="none" stroke="rgba(128,128,128,.3)" stroke-width="8"/><circle cx="40" cy="40" r="30" fill="none" stroke="'+(a==null?'#888':ACC(a))+'" stroke-width="8" stroke-linecap="round" stroke-dasharray="'+(c*v/100).toFixed(1)+' '+c.toFixed(1)+'" transform="rotate(-90 40 40)"/><text x="40" y="46" text-anchor="middle" font-size="19" font-weight="800" fill="currentColor">'+(a==null?'–':a.toFixed(0))+'</text></svg>'};
const est=(s,a)=>{if(a==null)return null;const p=(GD&&PGNEL[s])?PGNEL[s]:(cfg.vs&&!GD?(s===cfg.me?RT:bot().e):null);const v=p!=null?Math.max(p-500,Math.min(p+500,p+11*(a-78))):1300+.5*(gRate(a)-1300);return Math.round(Math.max(100,Math.min(3200,v))/50)*50};
const pname=s=>cfg.vs&&!GD?(s===cfg.me?L('You','إنت'):bot().n):(s==='w'?L('White','الأبيض'):L('Black','الأسود'))+(GD&&PGNEL[s]?' ('+PGNEL[s]+')':'');
const radar=(pw,pb)=>{const cx=80,cy=80,R=58,ang={o:-90,t:0,s:90,e:180},pt=(k,v)=>{const a=ang[k]*Math.PI/180,r=R*Math.max(0,Math.min(100,v||0))/100;return(cx+r*Math.cos(a)).toFixed(1)+','+(cy+r*Math.sin(a)).toFixed(1)},ks=['o','t','s','e'],
  grid=[25,50,75,100].map(v=>'<polygon points="'+ks.map(k=>pt(k,v)).join(' ')+'" fill="none" stroke="rgba(128,128,128,.35)" stroke-width=".6"/>').join(''),
  lab={o:[80,14,L('Opening','الافتتاحية')],t:[146,84,L('Tactics','التكتيك')],s:[80,156,L('Strategy','الاستراتيجية')],e:[14,84,L('Endgame','النهاية')]};
 return'<svg viewBox="-16 0 192 170" style="width:100%;max-width:320px;display:block;margin:0 auto">'+grid+ks.map(k=>'<line x1="'+cx+'" y1="'+cy+'" x2="'+pt(k,100).split(',')[0]+'" y2="'+pt(k,100).split(',')[1]+'" stroke="rgba(128,128,128,.35)" stroke-width=".6"/>').join('')
  +'<polygon points="'+ks.map(k=>pt(k,pw[k])).join(' ')+'" fill="currentColor" fill-opacity=".16" stroke="currentColor" stroke-width="1.6"/><polygon points="'+ks.map(k=>pt(k,pb[k])).join(' ')+'" fill="rgba(91,140,255,.28)" stroke="#5b8cff" stroke-width="1.6"/>'
  +ks.map(k=>'<text x="'+lab[k][0]+'" y="'+lab[k][1]+'" text-anchor="middle" font-size="8.5" fill="currentColor" opacity=".85">'+lab[k][2]+'</text>').join('')+'</svg>'};

/* coach summary: where each side lost the most, with one concrete tip */
function coachSum(km,pname,rated){
 const ph=i=>i<20?0:i<60?1:2,nm=[L('the opening','الافتتاحية'),L('the middlegame','الوسط'),L('the endgame','النهاية')];
 const rows=['w','b'].map(s=>{const r=rated(s);if(!r.length)return'';
  const c=k=>r.filter(x=>x.k===k).length,bl=c('blunder'),ms=c('miss'),mi=c('mistake'),ia=c('inacc'),ser=bl+ms+mi;
  const lp=[0,0,0];km.forEach(o=>{if(o.x.s===s&&['inacc','mistake','miss','blunder'].includes(o.x.k))lp[ph(o.i)]+=Math.min(o.loss,1500)});
  const wp=lp.indexOf(Math.max(...lp)),worst=lp[wp]>0;
  let tip;
  if(bl>=2)tip=L('Before every move, ask: what does my opponent threaten now, and is any of my pieces hanging?','قبل كل نقلة اسأل: الخصم بيهددني بإيه، وفي قطعة من قطعي معلّقة؟');
  else if(ms>=2)tip=L('After your opponent errs, look at checks and captures first - that is where the free material is.','بعد غلطة الخصم دوّر على الكشات والأخذ الأول، هناك المكسب.');
  else if(mi>=2)tip=L('Slow down in quiet positions and compare two candidate moves before playing.','اهدى في المراكز الهادية وقارن نقلتين قبل ما تلعب.');
  else if(ia>=3)tip=L('Your play is steady. Small inaccuracies add up, so look for the most active square for each piece.','لعبك ثابت. الهفوات الصغيرة بتتراكم، فدوّر على أنشط مكان لكل قطعة.');
  else if(ser===1)tip=L('One big error cost you the most. Open it in the review and find what you missed.','غلطة واحدة كبيرة هي اللي كلفتك. افتحها في المراجعة وشوف إيه اللي فاتك.');
  else tip=L('Clean game. Keep checking your opponent threats every move.','جيم نضيف. كمّل وراجع تهديدات الخصم في كل نقلة.');
  return'<div class="mu" style="margin:4px 0"><b>'+pname(s).split(' (')[0]+'</b>: '+(ser?L('serious errors','أخطاء كبيرة')+': '+ser+(worst?' · '+L('most lost in','أكتر خسارة في')+' '+nm[wp]:''):L('no serious errors','مفيش أخطاء كبيرة'))+'<br>💡 '+tip+'</div>'}).join('');
 return rows?'<div class="rx"><b>🧠 '+L('Coach summary','ملخص المدرب')+'</b>'+rows+'</div>':''}
window.copyAnn=function(){
 try{const nag={brilliant:'$3',great:'$1',inacc:'$6',mistake:'$2',blunder:'$4'},lab={brilliant:'Brilliant',great:'Great',best:'Best',excellent:'Excellent',good:'Good',book:'Book',inacc:'Inaccuracy',mistake:'Mistake',miss:'Miss',blunder:'Blunder',forced:'Forced'},sn=sans();
  let out='[Event "Chess Coach game"]\n[Result "'+(typeof RDm==='string'&&/1-0|0-1|1\/2/.test(RDm)?RDm.match(/1-0|0-1|1\/2-1\/2/)[0]:'*')+'"]\n\n',mv='';
  for(let i=0;i<ML.length;i++){const x=RV[i];if(i%2===0)mv+=((i>>1)+1)+'. ';mv+=sn[i]+(x&&nag[x.k]?' '+nag[x.k]:'');
   if(x){let c=lab[x.k]||'';if(x.bm&&H[i]&&['inacc','mistake','miss','blunder'].includes(x.k)){try{const b=legal(H[i]).find(q=>tok(q)===x.bm||tok(q).slice(0,4)===String(x.bm).slice(0,4));if(b)c+='. Best: '+san(H[i],b)}catch(e){}}
    if(c&&x.k!=='book')mv+=' {'+c+'}'}
   mv+=' '}
  out+=mv.trim()+'\n';
  const done=()=>{const e=$('hn').querySelector('.rp');if(e){const m=document.createElement('div');m.className='mu';m.textContent=L('Annotated PGN copied.','اتنسخ الـ PGN بالتعليقات.');e.appendChild(m)}};
  if(navigator.clipboard&&navigator.clipboard.writeText)navigator.clipboard.writeText(out).then(done,()=>{window.prompt('Copy this PGN',out)});else window.prompt('Copy this PGN',out)}catch(e){}};
function renderReport(){
 const n=ML.length,has=RV.some(Boolean),A=s=>RV.some(x=>x&&x.s===s)?accOf(s):null,rated=s=>RV.filter(x=>x&&x.s===s),
  pl=s=>{const a=A(s),r=rated(s),tot=r.length||1,e=est(s,a);
   const segs=RORD.map(k=>{const c=r.filter(x=>x.k===k).length;return c?'<div style="width:'+(100*c/tot).toFixed(1)+'%;background:'+RTG[k][2]+'"></div>':''}).join(''),
    chips=RORD.map(k=>{const c=r.filter(x=>x.k===k).length;return c?'<span class="rc" style="background:'+RTG[k][2]+'" title="'+RTG[k][1]+'">'+RTG[k][0]+' '+c+'</span>':''}).join('');
   return'<div class="rq"><div class="rn"><span class="rd" style="background:'+(s==='w'?'#f1f1f1':'#222')+'"></span>'+pname(s)+'</div>'+ring(a)+'<div class="rt">'+(e?L('Performance','الأداء')+' ≈ <b>'+e+'</b>':L('Not analysed yet','لسه ما اتحللش'))+'</div>'+(r.length?'<div class="rbar">'+segs+'</div><div class="rcs">'+chips+'</div>':'')+'</div>'},
  P={w:phases('w'),b:phases('b')},nm4={o:L('Opening','الافتتاحية'),t:L('Tactics','التكتيك'),s:L('Strategy','الاستراتيجية'),e:L('Endgame','النهاية')},
  v=x=>x==null?'–':Math.round(x),
  rad=has?'<div class="rx"><b>'+L('Strengths by phase','القوة حسب مرحلة اللعبة')+'</b>'+radar(P.w,P.b)+'<table><tr><td></td><td><span class="rd" style="background:#f1f1f1"></span> '+pname('w').split(' (')[0]+'</td><td><span class="rd" style="background:#5b8cff"></span> '+pname('b').split(' (')[0]+'</td></tr>'+['o','t','s','e'].map(k=>'<tr><td>'+nm4[k]+'</td><td>'+v(P.w[k])+'</td><td>'+v(P.b[k])+'</td></tr>').join('')+'</table></div>':'',
  sn=sans();
 /* key moments: biggest drops and the best finds */
 const km=[];RV.forEach((x,i)=>{if(!x||!H[i])return;const sg=H[i].t==='w'?1:-1,loss=x.bs!=null&&EV[i]!=null?x.bs-sg*EV[i]:0;km.push({i,x,loss})});
 const bad=km.filter(o=>o.loss>=100&&['inacc','mistake','miss','blunder'].includes(o.x.k)).sort((a,b)=>Math.min(b.loss,1500)-Math.min(a.loss,1500)).slice(0,4),good=km.filter(o=>['brilliant','great'].includes(o.x.k)).slice(0,3),
  chip=(o,c)=>'<button onclick="go('+(o.i+1)+')" style="border-color:'+RTG[o.x.k][2]+'">'+((o.i>>1)+1)+(o.i%2?'…':'.')+' '+sn[o.i]+' '+RTG[o.x.k][0]+(c?(o.loss>5000?' −#':' −'+(o.loss/100).toFixed(1)):'')+'</button>',
  kmh=has?'<div class="rx"><b>🔑 '+L('Key moments','اللحظات الحاسمة')+'</b>'+(bad.length||good.length?'<div class="rk">'+bad.map(o=>chip(o,1)).join('')+good.map(o=>chip(o,0)).join('')+'</div>':'<div class="mu">'+L('No big swings in this game.','مفيش تحولات كبيرة في الجيم ده.')+'</div>')+'</div>':'',
  pts=EV.map((q,i)=>q==null?null:[i,q]).filter(Boolean),X=i=>(i/Math.max(n-1,1)*300).toFixed(1),Y=q=>(35-31*Math.tanh(q/500)).toFixed(1);
 let g='';const cs=has?coachSum(km,pname,rated):'';
 if(pts.length>1)g='<div class="rx"><b>📉 '+L('Evaluation','التقييم')+'</b><svg viewBox="0 0 300 70" onclick="gSv(event)" style="width:100%;height:70px;border-radius:10px;background:rgba(128,128,128,.18);cursor:pointer"><defs><linearGradient id="eg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5b8cff" stop-opacity=".55"/><stop offset="1" stop-color="#5b8cff" stop-opacity=".05"/></linearGradient></defs><polygon fill="url(#eg)" points="'+X(pts[0][0])+',70 '+pts.map(([i,q])=>X(i)+','+Y(q)).join(' ')+' '+X(pts[pts.length-1][0])+',70"/><polyline fill="none" stroke="#5b8cff" stroke-width="1.6" points="'+pts.map(([i,q])=>X(i)+','+Y(q)).join(' ')+'"/><line x1="0" y1="35" x2="300" y2="35" stroke="#888" stroke-width=".5" stroke-dasharray="3 3"/>'
  +RV.map((x,i)=>x&&EV[i]!=null&&['mistake','blunder','miss','brilliant','great'].includes(x.k)?'<circle cx="'+X(i)+'" cy="'+Y(EV[i])+'" r="2.8" fill="'+RTG[x.k][2]+'" stroke="#fff" stroke-width=".6"/>':'').join('')+'</svg><div class="mu" style="font-size:11px;margin-top:3px">'+L('Tap the graph to jump to a move.','اضغط على الرسم عشان تروح لنقلة.')+'</div></div>';
 $('rpt').innerHTML='<div class="rp"><h3>📋 '+L('Game report','تقرير الجيم')+'</h3>'+(RDm?'<div class="mu">'+RDm+'</div>':'')+(n?'<div class="rg">'+pl('w')+pl('b')+'</div>'+kmh+cs+rad+g
  +(has?'<button onclick="copyAnn()" style="margin:6px 0">📋 '+L('Copy annotated PGN','انسخ PGN بالتعليقات')+'</button>':'')
  +'<button class="gbtn" onclick="startRev()">'+(isDeep()?'▶ '+L('Start review','ابدأ المراجعة'):'🔍 '+L('Analyze & start review','حلّل وابدأ المراجعة'))+'</button>'
  +(has&&!isDeep()?'<div class="mu" style="font-size:12px">'+L('Live ratings are quick. Analyze runs a deeper engine check on every move for both sides.','التقييم اللحظي سريع. التحليل بيعمل فحص أعمق لكل نقلة للاعبين.')+'</div>':'')
  +'<div class="mu" style="font-size:11px">'+L('Performance and phase scores are estimates from the analysed moves, not official ratings.','الأداء ودرجات المراحل تقديرات من النقلات المحلَّلة، مش تقييمات رسمية.')+'</div>':'<div class="mu">'+L('No moves yet.','مفيش نقلات لسه.')+'</div>')+'</div>'}

showSum=function(){try{saveAcc()}catch(e){}renderReport()};
window.TRENDHTML=()=>{
 const A=LS('chessAcc',[]);
 if(!A.length)return'<div class="mu" style="margin-bottom:10px">'+L('Your accuracy trend will appear here after you finish or analyse a game (vs the computer or a loaded game).','اتجاه دقتك هيظهر هنا بعد ما تخلّص أو تحلّل جيم (ضد الكمبيوتر أو جيم محمّل).')+'</div>';
 const P=A.slice(-30),X=i=>(P.length>1?i/(P.length-1)*290+5:150).toFixed(1),Y=v=>(66-60*Math.max(0,Math.min(100,v))/100).toFixed(1),
  svg='<svg viewBox="0 0 300 72" style="width:100%;height:72px;background:rgba(128,128,128,.15);border-radius:8px"><line x1="0" y1="'+Y(50)+'" x2="300" y2="'+Y(50)+'" stroke="#888" stroke-width=".4" stroke-dasharray="3 3"/>'+(P.length>1?'<polyline fill="none" stroke="#2f9e5b" stroke-width="2" points="'+P.map((x,i)=>X(i)+','+Y(x.a)).join(' ')+'"/>':'')+P.map((x,i)=>'<circle cx="'+X(i)+'" cy="'+Y(x.a)+'" r="2.4" fill="#2f9e5b"/>').join('')+'</svg>',
  avg=a=>a.reduce((p,q)=>p+q.a,0)/a.length,last=A.slice(-5),prev=A.slice(-10,-5);
 let d='';if(prev.length){const df=avg(last)-avg(prev);d=' · '+(df>=0?'▲ +':'▼ ')+df.toFixed(1)+' '+L('vs the 5 games before','عن آخر 5 جيمات قبلها')}
 const names={o:L('Opening','الافتتاحية'),t:L('Tactics','التكتيك'),s:L('Strategy','الاستراتيجية'),e:L('Endgame','النهاية')},rows=[];
 for(const k of['o','t','s','e']){const v=A.slice(-15).map(x=>x.ph&&x.ph[k]).filter(x=>x!=null);rows.push({k,v:v.length?v.reduce((p,q)=>p+q,0)/v.length:null,n:v.length})}
 const have=rows.filter(r=>r.v!=null),weak=have.length>1?have.reduce((p,q)=>q.v<p.v?q:p):null,
  bars=rows.map(r=>'<div style="display:grid;grid-template-columns:86px 1fr 38px;gap:6px;align-items:center;margin:3px 0;font-size:13px"><span>'+names[r.k]+'</span><div style="height:9px;border-radius:5px;background:rgba(128,128,128,.25);overflow:hidden"><div style="height:100%;width:'+(r.v==null?0:Math.round(r.v))+'%;background:'+(weak&&r===weak?'#ca3431':'#2f9e5b')+'"></div></div><b>'+(r.v==null?'–':Math.round(r.v)+'%')+'</b></div>').join('');
 return'<div style="margin-bottom:12px"><b>📈 '+L('Accuracy trend','اتجاه الدقة')+'</b><div class="mu" style="margin:3px 0 6px">'+A.length+' '+L('analysed games','جيم محلَّل')+' · '+L('last 5 average','متوسط آخر 5')+' <b>'+avg(last).toFixed(1)+'%</b>'+d+'</div>'+svg
  +'<div style="margin-top:10px"><b>'+L('Strengths and weaknesses','نقاط القوة والضعف')+'</b>'+bars+(weak?'<div class="mu">⚠ '+L('Your weakest area is','أضعف منطقة عندك هي')+' <b>'+names[weak.k]+'</b>.</div>':'')+'</div></div>'};
/* annotated PGN (eval comments + move marks, readable by lichess / chess.com analysis boards) */
/* ---- result card when a game ends ---- */
function showResult(){
 try{const old=document.getElementById('rsm');if(old)old.remove()}catch(e){}
 const lose=END?(/resigned|lost/.test(END)?END.startsWith('White')?'w':'b':null):(!LC.length&&inChk(S)?S.t:null),why=$('st').textContent||END||'';
 let title,emoji,col;
 if(cfg.vs){const res=lose?(lose===cfg.me?0:1):.5;title=res===1?L('You win!','كسبت!'):res===0?L('You lose','خسرت'):L('Draw','تعادل');emoji=res===1?'🏆':res===0?'😔':'🤝';col=res===1?'#7fb83b':res===0?'#ca3431':'#9aa0a6'}
 else{title=lose?(lose==='w'?L('Black wins','الأسود كسب'):L('White wins','الأبيض كسب')):L('Draw','تعادل');emoji=lose?'🏆':'🤝';col=lose?'#7fb83b':'#9aa0a6'}
 const d=document.createElement('div');d.id='rsm';d.style.cssText='position:fixed;inset:0;background:rgba(0,0,0,.62);z-index:9999;display:flex;align-items:center;justify-content:center;padding:16px';
 d.onclick=e=>{if(e.target===d)d.remove()};
 d.innerHTML='<div style="width:min(88vw,340px);background:#262421;color:#fff;border-radius:18px;padding:22px 18px 18px;text-align:center;box-shadow:0 12px 40px rgba(0,0,0,.5);position:relative">'
  +'<button onclick="document.getElementById(\'rsm\').remove()" style="position:absolute;top:8px;inset-inline-end:10px;background:none;border:0;color:#bbb;font-size:22px;width:auto;padding:4px 8px">✕</button>'
  +'<div style="font-size:46px;line-height:1">'+emoji+'</div><div style="font-size:28px;font-weight:800;margin:8px 0 2px;color:'+col+'">'+title+'</div>'
  +'<div style="opacity:.85;font-size:14px;margin-bottom:6px">'+why+'</div>'+(cfg.vs&&RDm?'<div style="font-size:13px;opacity:.8;margin-bottom:8px">'+RDm+'</div>':'')
  +'<div style="display:flex;flex-direction:column;gap:8px;margin-top:12px"><button onclick="document.getElementById(\'rsm\').remove();newG()" style="background:#7fb83b;color:#fff;font-weight:800;font-size:18px;padding:12px;border-radius:12px;border:0">'+L('New game','جيم جديد')+'</button>'
  +'<button onclick="document.getElementById(\'rsm\').remove();try{UI.rep()}catch(e){}" style="padding:10px;border-radius:12px">📋 '+L('Game report','تقرير الجيم')+'</button></div></div>';
 document.body.appendChild(d)}
{const fg0=finishGame;finishGame=function(){const first=!GD&&ML.length>0;fg0();if(first)setTimeout(showResult,450)}}
/* ---- analysis log: lets you send me the engine's numbers for every move, to tune the ratings ---- */
window.logPGN=function(){
 const sn=sans(),mv=[];
 for(let i=0;i<ML.length;i++){const x=RV[i];let bs=null;if(x&&x.bm&&H[i]){const b=fromTok(H[i],x.bm);bs=b?san(H[i],b):null}
  mv.push({ply:i+1,san:sn[i],side:i%2?'b':'w',class:x?x.k:null,acc:x&&x.acc!=null?Math.round(x.acc*10)/10:null,best:bs,evalAfterWhiteCp:EV[i]!=null?Math.round(EV[i]):null,bestEvalMoverCp:x&&x.bs!=null?Math.round(x.bs):null,dbg:x&&x.dbg||null})}
 const o={app:'Chess Coach',engine:(window.SFNEW&&SFNEW.name)||(SFok?'Stockfish (default)':'built-in'),quality:AQ,level:AL||PGNELO||'auto',pgn:pgn().replace(/\n+/g,' '),moves:mv};
 $('px').style.display='block';$('pb2').style.display='flex';$('px').value=JSON.stringify(o);$('px').select();
 $('hn').textContent=L('Analysis log ready: tap Copy and send it to me, with the labels chess.com gave for the same game.','سجل التحليل جاهز: اضغط Copy وابعتهولي مع التصنيفات اللي chess.com عملها لنفس الجيم.')};
const NAG={brilliant:'$3',great:'$1',inacc:'$6',mistake:'$2',miss:'$9',blunder:'$4'};
window.annPGN=function(){
 const base=pgn(),res=base.trim().split(' ').pop(),hd=base.split('\n\n')[0]+(!cfg.vs&&(PGNEL.w||PGNEL.b)?'\n[WhiteElo "'+(PGNEL.w||'?')+'"]\n[BlackElo "'+(PGNEL.b||'?')+'"]':'')+'\n[Annotator "Chess Coach"]',sn=sans();let out='',prevC=false;
 for(let i=0;i<sn.length;i++){
  const x=RV[i],w=i%2===0;
  out+=(w?(i>>1)+1+'. ':(prevC?(i>>1)+1+'... ':''))+sn[i]+(x&&NAG[x.k]?' '+NAG[x.k]:'');
  let c='';
  if(x){
   if(EV[i]!=null&&Math.abs(EV[i])<90000)c+='[%eval '+(EV[i]/100).toFixed(2)+'] ';
   else if(EV[i]!=null)c+=(EV[i]>0?'White':'Black')+' has a forced mate. ';
   if(!['best','book','forced'].includes(x.k))c+=RTG[x.k][1]+'.';
   if(['good','inacc','mistake','miss','blunder'].includes(x.k)&&x.bm&&H[i]){const b=fromTok(H[i],x.bm);if(b)c+=' Best was '+san(H[i],b)+'.'}
  }
  c=c.trim();prevC=!!c;out+=c?' {'+c.replace(/[{}]/g,'')+'} ':' '}
 const txt=hd+'\n\n'+out.trim()+' '+res;
 $('px').style.display='block';$('pb2').style.display='flex';$('px').value=txt;$('px').select();
 $('hn').textContent=RV.some(Boolean)?L('Annotated PGN is ready. Tap Copy or Download.','الـPGN بالشروحات جاهز. اضغط Copy أو Download.'):L('No ratings yet, so this PGN has no comments. Tap 🔍 Analyze first, then Annotated again.','لسه مفيش تقييمات فالـPGN من غير شروحات. اضغط 🔍 Analyze الأول وبعدين Annotated تاني.')};
window.dlPGN=async function(){
 const t=$('px').value||pgn(),name='chess-coach-'+new Date().toISOString().slice(0,10)+'.pgn';
 try{const f=new File([t],name,{type:'application/x-chess-pgn'});if(navigator.canShare&&navigator.canShare({files:[f]})){await navigator.share({files:[f],title:name});return}}catch(e){if(e&&e.name==='AbortError')return}
 try{const u=URL.createObjectURL(new Blob([t],{type:'application/x-chess-pgn'})),a=document.createElement('a');a.href=u;a.download=name;document.body.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(u);a.remove()},1500);
  $('hn').textContent=L('Download started. If nothing was saved on your phone, use Copy and paste the text into lichess.org/paste or an analysis board.','بدأ التحميل. لو مفيش ملف اتحفظ على موبايلك استخدم Copy والصق النص في lichess.org/paste أو لوحة تحليل.')}
 catch(e){$('hn').textContent=L('Could not download. Use Copy instead.','معرفتش أحمّل. استخدم Copy بدلها.')}};
})();
