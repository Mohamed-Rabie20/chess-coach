/* v11 */
(()=>{
const $=id=>document.getElementById(id);
const ar=()=>{try{return localStorage.getItem('chessLang')==='ar'}catch(e){return false}};
const L=(e,a)=>ar()?a:e;
const hn=$('hn'),bcol=$('bcol'),ml=$('ml'),root=$('trp');
/* ---- coach bubble: the rating card, hints and "Why?" now sit right above the board (like chess.com's coach) ---- */
const cbx=document.createElement('div');cbx.id='cbx';
cbx.innerHTML='<div id="cav" aria-hidden="true">\uD83C\uDF93</div><div id="cbb"><button id="cbt" type="button">\u2304</button></div>';
bcol.insertBefore(cbx,$('pt'));
const cbb=$('cbb'),cbt=$('cbt');cbb.insertBefore(hn,cbt);
const chk=()=>{const big=cbb.classList.contains('big');cbb.classList.toggle('ov',big||hn.scrollHeight>hn.clientHeight+4);cbt.textContent=big?'\u2303':'\u2304'};
new MutationObserver(()=>requestAnimationFrame(chk)).observe(hn,{childList:true,subtree:true,characterData:true});
cbt.onclick=()=>{cbb.classList.toggle('big');chk()};
/* ---- Review-only report area ---- */
const rpt=document.createElement('div');rpt.id='rpt';ml.parentNode.insertBefore(rpt,ml.nextSibling);
UI.rep=function(){UI.tab('review');try{if(ML.length&&RV.filter(Boolean).length<ML.length&&!AZ)analyzeAll();else showSum()}catch(e){}setTimeout(()=>{try{rpt.scrollIntoView({behavior:'smooth',block:'start'})}catch(e){}},80)};
document.querySelectorAll('.sec[data-s=act] button').forEach(b=>{if((b.getAttribute('onclick')||'').includes('showSum')){b.removeAttribute('onclick');b.onclick=()=>UI.rep()}});
{const _n=newG;newG=function(){rpt.innerHTML='';return _n.apply(this,arguments)}}
{const _l=loadPGN;loadPGN=function(){rpt.innerHTML='';return _l.apply(this,arguments)}}
{const _a=analyzeAll;analyzeAll=function(){try{if(document.body.dataset.tab!=='review')UI.tab('review');setTimeout(()=>{try{rpt.scrollIntoView({behavior:'smooth',block:'nearest'})}catch(e){}},60)}catch(e){}return _a.apply(this,arguments)}}
/* ---- moves strip follows the current move ---- */
{const _u=upd;upd=function(){const r=_u.apply(this,arguments);try{const cur=ml.querySelector('span[style*="var(--ac)"]');if(cur&&ml.scrollWidth>ml.clientWidth){const a=cur.getBoundingClientRect(),b=ml.getBoundingClientRect();ml.scrollLeft+=(a.left-b.left)-b.width/2+a.width/2}}catch(e){}return r}}
/* ---- Train drills draw on the main board ---- */
const tOn=()=>{if(document.body.dataset.tab!=='train'||!root||root.style.display!=='block')return null;const T=window.TRG&&TRG();return T&&T.s?T:null};
window.TRSYNC=()=>{document.body.classList.toggle('nobd',document.body.dataset.tab==='train'&&!tOn())};
window.TRMAIN=()=>{try{TRSYNC();R()}catch(e){}};
function trainRender(T){
 const s=T.s,k={S,LC,sel,flip,vi,TS,TL,BD,hint,PRE,vs:cfg.vs};
 try{S=s;LC=legal(s);sel=T.sel;vi=-1;TS=s;TL=null;BD=null;hint=null;PRE=null;cfg.vs=0;flip=(T.tab==='o'||T.tab==='z')?T.user==='b':s.t==='b';R0()}
 finally{S=k.S;LC=k.LC;sel=k.sel;flip=k.flip;vi=k.vi;TS=k.TS;TL=k.TL;BD=k.BD;hint=k.hint;PRE=k.PRE;cfg.vs=k.vs}
 let ar='';const A=T.arr;
 if(A&&A.f!==A.t){const fl=(T.tab==='o'||T.tab==='z')?T.user==='b':s.t==='b',P=i=>{let c=i&7,r=i>>3;if(fl){c=7-c;r=7-r}return[c+.5,r+.5]},[x1,y1]=P(A.f),[x2,y2]=P(A.t),d=Math.hypot(x2-x1,y2-y1)||1,ex=x2-(x2-x1)/d*.3,ey=y2-(y2-y1)/d*.3;
  ar='<defs><marker id="zah" markerWidth="4" markerHeight="4" refX="2.2" refY="2" orient="auto"><path d="M0,0L4,2L0,4z" fill="#f5a623"/></marker></defs><line x1="'+x1+'" y1="'+y1+'" x2="'+ex+'" y2="'+ey+'" stroke="#f5a623" stroke-width=".2" stroke-linecap="round" opacity=".92" marker-end="url(#zah)"/>'}
 $('ar').innerHTML=ar}
{const _R=R;R=function(){const T=tOn();if(!T)return _R.apply(this,arguments);trainRender(T)}}
{const _c=click;click=function(i){const T=tOn();if(T){try{TRN.c(i)}catch(e){}return}return _c.apply(this,arguments)}}
/* ---- auto "Why": in Review the coach adds the key reasons under the rating after a short pause ---- */
const awOn=()=>{try{return localStorage.getItem('chessAutoWhy')!=='0'}catch(e){return true}};
let awT=0,awK=0;
const cur=()=>(vi<0?H.length:vi)-1;
function schedAW(){clearTimeout(awT);const k=++awK;if(document.body.dataset.tab!=='review'||!awOn()||AZ)return;awT=setTimeout(()=>runAW(k),450)}
async function runAW(k){
 const i=cur();if(i<0||TS||AZ||!RV[i]||!H[i]||!ML[i]||!window.WHYR)return;
 const e=RV[i];if(e.k==='forced'||e.k==='book')return;
 if(hn.querySelector('.aw')||hn.querySelector('[onclick="WHYB()"]'))return;
 const pr=H[i],m=fromTok(pr,ML[i]);if(!m)return;
 const sg=pr.t==='w'?1:-1,loss=e.bs!=null&&EV[i]!=null?Math.max(0,e.bs-sg*EV[i]):0,bm=e.bm?fromTok(pr,e.bm):null;
 let h;try{h=await WHYR(pr,m,e.k,bm,e.bs,loss,{ix:i})}catch(x){return}
 if(k!==awK||cur()!==i||TS||hn.querySelector('.aw')||hn.querySelector('[onclick="WHYB()"]'))return;
 const d=document.createElement('div');d.innerHTML=h;const li=[...d.querySelectorAll('li')].slice(0,2);if(!li.length)return;
 const w=document.createElement('div');w.className='aw';w.innerHTML='<ul style="list-style:none;padding:0">'+li.map(x=>'<li style="margin:3px 0">'+x.innerHTML+'</li>').join('')+'</ul>';
 hn.insertBefore(w,hn.querySelector('.bt')||null)}
{const _g=go;go=function(){const r=_g.apply(this,arguments);try{schedAW()}catch(e){}return r}}
{const _t=UI.tab;UI.tab=function(n){const r=_t.apply(this,arguments);try{lblAW();if(n==='review')schedAW()}catch(e){}return r}}
/* toggle lives in More > Look & analysis */
const awb=document.createElement('button');awb.style.cssText='width:100%;margin:5px 0';
function lblAW(){awb.textContent=(awOn()?'\u2705 ':'\u2B1C ')+L('Coach explains each move in Review','\u0627\u0644\u0645\u062F\u0631\u0628 \u064A\u0634\u0631\u062D \u0643\u0644 \u0646\u0642\u0644\u0629 \u0641\u064A \u0627\u0644\u0645\u0631\u0627\u062C\u0639\u0629')}
awb.onclick=()=>{try{localStorage.setItem('chessAutoWhy',awOn()?'0':'1')}catch(e){}lblAW();schedAW()};
{const cds=document.querySelectorAll('.sec[data-s=more] .cd');if(cds[1])cds[1].appendChild(awb)}
lblAW();TRSYNC();

/* ---- Play controls: one row under the board (Undo · Best · Coach · live analysis · ⋯); Flip / New game / Resign / Draw sit behind ⋯ ---- */
{const KEY='chessLiveAn',ar=()=>{try{return localStorage.getItem('chessLang')==='ar'}catch(e){return false}},L=(e,a)=>ar()?a:e;
 try{window.LIVEAN=localStorage.getItem(KEY)==='0'?0:1}catch(e){window.LIVEAN=1}
 const play=document.querySelector('.sec[data-s=play]'),hintSec=document.querySelector('.sec[data-s=hint]');
 const find=(root,k)=>root?[...root.querySelectorAll('button')].find(b=>(b.getAttribute('onclick')||'').includes(k)):null;
 const undoB=find(play,'undo('),bestB=find(hintSec,'doHint'),coachB=find(hintSec,'coachHint');
 const qa=document.createElement('div');qa.className='sec rw';qa.dataset.s='qa';
 const mkb=(id,cls)=>{const b=document.createElement('button');b.type='button';b.id=id;b.className=cls||'';return b};
 const bU=mkb('qu'),bB=mkb('qb','qh'),bC=mkb('qc','qh'),bA=mkb('anb'),bO=mkb('qo');
 bU.onclick=()=>undoB&&undoB.click();bB.onclick=()=>bestB&&bestB.click();bC.onclick=()=>coachB&&coachB.click();
 const msg=()=>L('Analysis is off — play freely. You can analyse the game later in Review.','التحليل متوقف — العب براحتك. تقدر تحلل الجيم بعدين من تبويب المراجعة.');
 const paint=()=>{document.body.classList.toggle('noan',!LIVEAN);
  bU.textContent='↩ '+L('Undo','تراجع');bB.textContent='💡 '+L('Best','الأفضل');bC.textContent='🎓 '+L('Coach','المدرب');
  bA.textContent=(LIVEAN?'🧠 ':'🚫 ')+(LIVEAN?L('On','يعمل'):L('Off','متوقف'));bA.title=L('Live analysis','التحليل المباشر');bA.classList.toggle('p',!!LIVEAN);
  bO.textContent='⋯';bO.title=L('More actions','المزيد')};
 const set=v=>{LIVEAN=v?1:0;try{localStorage.setItem(KEY,v?'1':'0')}catch(e){}paint();if(!LIVEAN)hn.textContent=msg();else if(!ML.length)hn.textContent=L('Live analysis is on — I will rate your moves.','التحليل المباشر يعمل — هقيّم نقلاتك.')};
 bA.onclick=()=>set(!LIVEAN);
 bO.onclick=()=>document.body.classList.toggle('opts');
 [bU,bB,bC,bA,bO].forEach(b=>qa.appendChild(b));
 if(play){play.parentNode.insertBefore(qa,play);play.addEventListener('click',e=>{if(e.target.closest('button'))setTimeout(()=>document.body.classList.remove('opts'),60)})}
 {const _n=newG;newG=function(){const r=_n.apply(this,arguments);if(!LIVEAN)hn.textContent=msg();return r}}
 {const _t=UI.tab;UI.tab=function(n){const r=_t.apply(this,arguments);try{paint();document.body.classList.remove('opts')}catch(e){}return r}}
 paint();if(!LIVEAN&&!ML.length)hn.textContent=msg()}
})();
