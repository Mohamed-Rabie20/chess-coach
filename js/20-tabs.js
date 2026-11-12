/* v10: split the long page into tabs. Existing elements are MOVED (ids and handlers stay), so no feature changes. */
window.UI=(function(){
 const $=id=>document.getElementById(id),pcol=$('pcol'),hn=$('hn');
 const ar=()=>{try{return localStorage.getItem('chessLang')==='ar'}catch(e){return false}};
 const T={play:['Play','لعب'],review:['Review','مراجعة'],train:['Train','تدريب'],more:['More','المزيد']};
 const mk=(name,cls)=>{const d=document.createElement('div');d.className='sec rw '+(cls||'');d.dataset.s=name;return d};
 const rows=[...pcol.children].filter(e=>e.classList.contains('bt'));
 const r1=rows[0],r2=rows[1];
 const has=(b,k)=>b.tagName==='BUTTON'&&((b.getAttribute('onclick')||'').includes(k)||b.id===k);
 const hint=mk('hint'),play=mk('play'),nav=mk('nav'),act=mk('act');
 let trainBtn=null,langSel=null;const toMore=[];
 [...r1.children].forEach(b=>{if(has(b,'doHint')||has(b,'coachHint'))hint.appendChild(b);else{if(has(b,'newG')){b.removeAttribute('onclick');b.onclick=()=>UI.ng(true)}play.appendChild(b)}});
 [...r2.children].forEach(b=>{
  if(b.tagName==='SELECT'){langSel=b;toMore.push(b)}
  else if(has(b,'go(0)')||has(b,'nav(-1)')||has(b,'nav(1)')||has(b,'go(1e9)'))nav.appendChild(b);
  else if(has(b,'showSum')||has(b,'showArch')||has(b,'analyzeAll'))act.appendChild(b);
  else if(/Train/.test(b.textContent)&&!b.id){trainBtn=b;b.style.display='none';toMore.push(b)}
  else toMore.push(b)});
 pcol.insertBefore(hint,r1);pcol.insertBefore(play,r1);pcol.insertBefore(nav,r1);pcol.insertBefore(act,r1);
 r1.remove();r2.style.display='none';
 /* settings → New game sheet (game setup) and More (tools, look, analysis) */
 const ngb=$('ngb');['vs','lv','me','tc'].forEach(id=>{const e=$(id);if(e)ngb.appendChild(e)});
 const more=document.createElement('div');more.className='sec';more.dataset.s='more';
 const card=(title)=>{const c=document.createElement('div');c.className='cd';c.innerHTML='<b>'+title+'</b>';more.appendChild(c);return c};
 const c1=card('🧰 Tools'),row=document.createElement('div');row.className='rw';row.style.display='flex';
 toMore.forEach(b=>{if(b!==trainBtn)row.appendChild(b)});c1.appendChild(row);
 const px=$('px'),pb2=$('pb2');if(px)c1.appendChild(px);if(pb2)c1.appendChild(pb2);
 const c2=card('🎨 Look & analysis');['th','aq','al'].forEach(id=>{const e=$(id);if(e)c2.appendChild(e)});
 const c3=card('ℹ️ App');const en=$('en');if(en){en.style.margin='0 0 8px';c3.appendChild(en)}
 const ib=$('ib'),ih=$('ih');if(ib)c3.appendChild(ib);if(ih)c3.appendChild(ih);
 const note=[...pcol.children].filter(e=>e.classList.contains('mu')).pop();if(note)c3.appendChild(note);
 pcol.appendChild(more);
 const set=$('set');if(set){set.style.display='none'}
 /* behaviour */
 function lab(){document.querySelectorAll('#tabs button').forEach(b=>{b.querySelector('.tl').textContent=T[b.dataset.t][ar()?1:0]});
  $('ngt').textContent=ar()?'لعبة جديدة':'New game';$('ngst').textContent=ar()?'ابدأ اللعب':'Start game';$('ngcn').textContent=ar()?'إلغاء':'Cancel'}
 function tab(n){
  const rp=$('trp');
  if(n==='train'){if(rp&&rp.style.display!=='block'&&trainBtn)trainBtn.click()}
  else if(rp&&rp.style.display==='block')rp.style.display='none';
  document.body.dataset.tab=n;
  document.querySelectorAll('#tabs button').forEach(b=>b.classList.toggle('on',b.dataset.t===n));
  try{window.scrollTo(0,0)}catch(e){}try{window.TRSYNC&&TRSYNC()}catch(e){}try{R()}catch(e){}}
 function ng(on){$('ngs').classList.toggle('on',!!on);if(on)lab()}
 $('ngs').addEventListener('click',e=>{if(e.target===$('ngs'))ng(false)});
 if(langSel)langSel.addEventListener('change',()=>setTimeout(lab,80));
 /* auto-switch: loading a game or stepping back goes to Review */
 if(typeof loadPGN==='function'){const _lp=loadPGN;loadPGN=function(){const r=_lp.apply(this,arguments);try{tab('review')}catch(e){}return r}}
 
 lab();tab('play');
 return{tab,ng,lab};
})();
