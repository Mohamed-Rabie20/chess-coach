/* v13: backup / restore of everything the app keeps on this device (games, rating, mistakes, settings) */
(()=>{
 const $=id=>document.getElementById(id);
 const ar=()=>{try{return localStorage.getItem('chessLang')==='ar'}catch(e){return false}},L=(e,a)=>ar()?a:e;
 const more=document.querySelector('.sec[data-s=more]');if(!more)return;
 const dump=()=>{const o={};for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);o[k]=localStorage.getItem(k)}return JSON.stringify({app:'chess-coach-backup',v:1,date:new Date().toISOString(),data:o})};
 const c=document.createElement('div');c.className='cd';
 c.innerHTML='<b></b><div class="mu" id="bkd" style="margin-bottom:6px"></div><div class="rw"><button id="bkc" type="button" style="flex:1"></button><button id="bkr" type="button" style="flex:1"></button></div><textarea id="bkt" rows="4" style="display:none;width:100%;box-sizing:border-box;margin:6px 0;font-size:12px"></textarea><button id="bkg" type="button" style="display:none;width:100%"></button><div class="mu" id="bkm" style="margin-top:6px"></div>';
 const apps=[...more.querySelectorAll('.cd')];const last=apps[apps.length-1];last?more.insertBefore(c,last):more.appendChild(c);
 const t=c.querySelector('b'),d=$('bkd'),bc=$('bkc'),br=$('bkr'),ta=$('bkt'),bg=$('bkg'),m=$('bkm');
 const lab=()=>{t.textContent='💾 '+L('Backup','نسخة احتياطية');d.textContent=L('Keep your games, rating and mistakes safe before reinstalling the app.','احفظ جيماتك وتقييمك وأخطاءك قبل ما تعيد تثبيت التطبيق.');bc.textContent='📋 '+L('Copy backup','انسخ النسخة');br.textContent='♻️ '+L('Restore','استرجاع');bg.textContent=L('Restore now','استرجع الآن');ta.placeholder=L('Paste the backup text here','الصق نص النسخة هنا')};
 lab();
 bc.onclick=async()=>{const s=dump();ta.value=s;try{await navigator.clipboard.writeText(s);m.textContent='✅ '+L('Copied. Paste it somewhere safe (Notes, WhatsApp to yourself).','اتنسخت. الصقها في مكان آمن (الملاحظات أو واتساب لنفسك).')}catch(e){ta.style.display='block';ta.select();m.textContent=L('Select the text above and copy it manually.','حدد النص اللي فوق وانسخه يدوياً.')}};
 br.onclick=()=>{ta.style.display='block';bg.style.display='block';ta.value='';m.textContent=L('Paste the backup text, then tap Restore now.','الصق نص النسخة وبعدها اضغط استرجع الآن.');ta.focus()};
 bg.onclick=()=>{let o;try{o=JSON.parse(ta.value.trim())}catch(e){}
  if(!o||o.app!=='chess-coach-backup'||!o.data||typeof o.data!=='object'){m.textContent='⚠️ '+L('That is not a valid backup.','دي مش نسخة احتياطية صالحة.');return}
  try{const keep=localStorage.getItem('chessLang');Object.keys(o.data).forEach(k=>{if(typeof o.data[k]==='string')localStorage.setItem(k,o.data[k])})}catch(e){m.textContent='⚠️ '+L('Could not restore (storage is full?).','تعذر الاسترجاع (التخزين ممتلئ؟).');return}
  m.textContent='✅ '+L('Restored. Reloading…','اتسترجعت. بيعيد التحميل…');setTimeout(()=>location.reload(),700)};
 {const _t=UI.tab;UI.tab=function(n){const r=_t.apply(this,arguments);try{lab()}catch(e){}return r}}
})();
