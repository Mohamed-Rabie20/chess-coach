/* ---- install as an app (PWA) ---- */
let DIP=null;window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();DIP=e;$('ib').style.display=''});
window.addEventListener('appinstalled',()=>{$('ib').style.display='none'});
function doInstall(){if(DIP){DIP.prompt();DIP=null;$('ib').style.display='none'}}
if(/iphone|ipad|ipod/i.test(navigator.userAgent)&&!navigator.standalone&&/^https?:/.test(location.protocol))$('ih').style.display='';
initSF();
load();cfg.tc=cfg.tc||0;if(!CK.w&&!CK.b)resetCk();LT=Date.now();{let k='green';try{k=localStorage.getItem('chessTh')||'green'}catch(e){}$('th').value=k;setTh(k)}$('tc').value=cfg.tc;$('set').open=innerWidth>=980||!ML.length;SO=VOL>0;$('vb').textContent=VOL===1?'🔊':VOL===.5?'🔉':'🔇';lastBar();$('vs').value=cfg.vs;if(!BOTS[cfg.lv])cfg.lv=5;$('lv').innerHTML=BOTS.map((b,i)=>'<option value="'+i+'">'+b.a+' '+b.n+' ('+b.e+')</option>').join('');$('lv').value=cfg.lv;$('me').value=cfg.me;flip=!!cfg.vs&&cfg.me==='b';upd();maybeCpu();
