/* v4: dry wooden "thock" move sounds (original synthesis, chess-board style); end/low-time sounds keep the old synth */
{const _o=snd,KEYS=['m','mo','x','xo','c','+','p','pm','s'];
snd=function(k){if(!SO||VOL<=0)return;if(!KEYS.includes(k))return _o(k);
 try{AC=AC||new(window.AudioContext||window.webkitAudioContext)();if(AC.state==='suspended'&&AC.resume)AC.resume().catch(()=>{});
 const T=AC.currentTime+.005,SR=AC.sampleRate,out=AC.createGain(),lp=AC.createBiquadFilter();out.gain.value=.65*VOL;lp.type='lowpass';lp.frequency.value=6500;out.connect(lp);lp.connect(AC.destination);
 const noise=(t,len,fc,q,v)=>{const n=Math.floor(SR*len),b=AC.createBuffer(1,n,SR),d=b.getChannelData(0);for(let i=0;i<n;i++)d[i]=(Math.random()*2-1)*Math.pow(1-i/n,3);const s=AC.createBufferSource(),f=AC.createBiquadFilter(),g=AC.createGain();s.buffer=b;f.type='bandpass';f.frequency.value=fc;f.Q.value=q;g.gain.value=v;s.connect(f);f.connect(g);g.connect(out);s.start(t)};
 const body=(t,f0,f1,dec,v)=>{const o=AC.createOscillator(),g=AC.createGain();o.type='sine';o.frequency.setValueAtTime(f0,t);o.frequency.exponentialRampToValueAtTime(f1,t+dec*.8);g.gain.setValueAtTime(v,t);g.gain.exponentialRampToValueAtTime(.0001,t+dec);o.connect(g);g.connect(out);o.start(t);o.stop(t+dec+.02)};
 const hit=(t,p,v,d)=>{const j=1+(Math.random()-.5)*.04;body(t,p*1.5*j,p*j,.07*d,v);body(t,p*2.7*j,p*2.2*j,.035*d,v*.35);noise(t,.025*d,2800,1.2,v*1.1)};
 if(k==='m')hit(T,170,.7,1);else if(k==='mo')hit(T,150,.6,1);
 else if(k==='x'){hit(T,125,.95,1.4);hit(T+.035,170,.5,.8)}else if(k==='xo'){hit(T,115,.9,1.4);hit(T+.035,155,.45,.8)}
 else if(k==='+'){hit(T,170,.7,1);noise(T+.02,.05,4200,2,.5);body(T+.03,1250,1250,.12,.07)}
 else if(k==='c'){hit(T,150,.6,1);hit(T+.11,180,.6,1)}
 else if(k==='p'){hit(T,170,.6,1);[660,880].forEach((f,i)=>body(T+.08+i*.07,f,f,.12,.14))}
 else if(k==='pm')hit(T,230,.3,.6);else hit(T,150,.5,1);
 try{navigator.vibrate&&navigator.vibrate(k==='x'||k==='xo'?14:8)}catch(e){}
 }catch(e){return _o(k)}}}
