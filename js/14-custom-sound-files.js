/* custom sound files: mp3 files next to index.html (copied into the app by the build); missing files fall back to the built-in synth. win/lose/draw all play end.mp3 (or stay silent if it is missing) */
{const MAP={m:'move',mo:'move-opponent',x:'capture',xo:'capture','+':'check',c:'castle',p:'promote',pm:'premove',s:'start',w:'lowtime',e:'end',ew:'end',el:'end'},B={};let le=0;
const ctx=()=>{AC=AC||new(window.AudioContext||window.webkitAudioContext)();return AC};
[...new Set(Object.values(MAP))].forEach(f=>{try{fetch('sounds/'+f+'.mp3').then(r=>r.ok?r.arrayBuffer():Promise.reject()).then(ab=>new Promise((res,rej)=>ctx().decodeAudioData(ab,res,rej))).then(b=>{B[f]=b}).catch(()=>{})}catch(e){}});
const _s=snd;snd=function(k){if(!SO||VOL<=0)return;
 if(k==='e'||k==='ew'||k==='el'){const n=Date.now();if(n-le<1500)return;le=n}
 const f=MAP[k],b=B[f]||(k==='mo'?B.move:null);
 if(f&&b){try{const c=ctx();if(c.state==='suspended'&&c.resume)c.resume().catch(()=>{});const s=c.createBufferSource(),g=c.createGain();s.buffer=b;g.gain.value=Math.min(1,VOL);s.connect(g);g.connect(c.destination);s.start();return}catch(e){}}
 if(k==='ew'||k==='el')return;
 return _s(k)}}
