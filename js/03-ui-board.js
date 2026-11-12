/* ---------- UI ---------- */
let MT={k:'',t:0},CT={k:'',t:0};
function R0(){const bd=$('bd');bd.innerHTML='';const lm=sel>=0?(PRM()?gen({...S,t:cfg.me,ep:-1}):LC).filter(m=>m.f===sel):[],od=[...Array(64).keys()];if(flip)od.reverse();
 const ck=inChk(S)?kp(S.b,S.t==='w'):-1,mt=ck>=0&&LC.length===0;if(mt){const mk=fen(S);if(MT.k!==mk)MT={k:mk,t:Date.now()}}else MT.k='';if(ck>=0&&!mt){const k2=fen(S);if(CT.k!==k2)CT={k:k2,t:Date.now()}}else CT.k='';const cd=ck>=0&&!mt?'-'+Math.min(Date.now()-CT.t,1700)+'ms':'0s';
 const md=mt?'-'+Math.min(Date.now()-MT.t,1500)+'ms':'0s',tk=TS?TL:ML[(vi<0?ML.length:vi)-1],sqi=x=>'abcdefgh'.indexOf(x[0])+(8-+x[1])*8,L1=tk?sqi(tk.slice(0,2)):-9,L2=tk?sqi(tk.slice(2,4)):-9;
 od.forEach((i,j)=>{const d=document.createElement('div'),p=S.b[i];
  d.className='sq '+(((i>>3)+(i&7))%2?'dk':'lt')+(i===sel?' sel':'')+(hint&&(i===hint.f||i===hint.t)?' hint':'')+(i===ck&&!mt?' chkA':'')+(i===L1||i===L2?' lm':'')+(PRE&&vi<0&&(i===PRE.f||i===PRE.t)?' pre':'');
  if(p){if(mt&&i===ck){const k=document.createElement('span');k.className='mk';k.textContent=G.k+'\uFE0E';d.appendChild(k)}else d.textContent=G[p.toLowerCase()]+'\uFE0E';d.classList.add(p<'a'?'pw':'pb')}
  if(i===ck&&!mt)d.style.setProperty('--cd',cd);
  if(mt&&i===ck){d.classList.add('mate');d.style.setProperty('--md',md);const lb=document.createElement('span');lb.className='mlab '+(j<8?'dn':'up');lb.textContent=(()=>{try{return localStorage.getItem('chessLang')==='ar'?'كش مات':'Checkmate'}catch(e){return'Checkmate'}})();d.appendChild(lb);const bg=document.createElement('span');bg.className='mbd';bg.innerHTML='<span style="display:inline-block;transform:rotate(86deg) scale(.85)">'+G.k+'\uFE0E</span>';d.appendChild(bg)}
  if(mt&&i===kp(S.b,S.t!=='w')){d.classList.add('win');d.style.setProperty('--md',md);const wl=document.createElement('span');wl.className='wlab '+(j<8?'dn':'up');wl.textContent=(()=>{try{return localStorage.getItem('chessLang')==='ar'?'الفائز':'Winner'}catch(e){return'Winner'}})();d.appendChild(wl);const wb=document.createElement('span');wb.className='wbd';wb.textContent=G.q+'\uFE0E';d.appendChild(wb)}
  if(lm.some(m=>m.t===i))d.classList.add(p?'cap':'mv');
  if(j%8===0){const s=document.createElement('span');s.className='co r';s.textContent=sqn(i)[1];d.appendChild(s)}
  if(j>=56){const s=document.createElement('span');s.className='co f';s.textContent=sqn(i)[0];d.appendChild(s)}
  if(BD&&i===BD.sq){const s=document.createElement('span');s.className='bdg';s.textContent=BD.sym;s.style.background=BD.col;d.appendChild(s)}
  d.dataset.i=i;d.onclick=()=>click(i);bd.appendChild(d)})}
function status(){const w=S.t==='w',c=inChk(S),dr=LC.length?drawWhy():'';over=!LC.length||!!dr||!!END;
 $('st').textContent=END?END:!LC.length?(c?'Checkmate! '+(w?'Black':'White')+' wins':'Draw (stalemate)'):dr?dr:(w?'White':'Black')+' to move'+(c?' — Check!':'');if(vi>=0)$('st').textContent='Reviewing move '+vi+' of '+H.length+' — '+(vi%2?'Black':'White')+' to move (tap a piece to try a move)'}
function upd(){LC=legal(S);status();R();const sn=sans(),cu=vi<0?H.length:vi;$('ml').innerHTML=ML.map((x,i)=>(i%2?'':(i>>1)+1+'. ')+'<span style="cursor:pointer;padding:1px 4px;border-radius:5px'+(cu===i+1?';background:var(--ac);color:#fff':'')+'" onclick="go('+(i+1)+')">'+sn[i]+'</span>').join(' ');const o=opn();$('op').textContent=o?'📖 Opening: '+o:''}
function click(i){if(Date.now()-SUP<120)return;if(PM){PM=null;$('pm').style.display='none'}if(vi>=0){tryClick(i);return}if(PRM()){const p=S.b[i];if(p&&(p<'a')===(cfg.me==='w')){sel=i===sel?-1:i;R();return}
  if(sel>=0){const mv=gen({...S,t:cfg.me,ep:-1}).find(m=>m.f===sel&&m.t===i);if(mv){PRE={f:mv.f,t:mv.t,pr:mv.pr};snd('pm')}sel=-1;R();return}
  PRE=null;R();return}
 if(over)return;const p=S.b[i],mv=LC.find(m=>m.f===sel&&m.t===i);
 if(mv&&mv.pr){PM=mv;$('pm').style.display='flex'}else if(mv)play(mv);else if(p&&(p<'a')===(S.t==='w')){sel=i===sel?-1:i;R()}else{sel=-1;R()}}
function play(m,cpu){const pr=S;H.push(S);ML.push(tok(m));S=apply(S,m);sel=-1;hint=null;save();upd();if(!cpu)setTimeout(()=>{review(pr,m);maybeCpu()},40)}
function maybeCpu(){if(!cfg.vs||over||S.t!==cpuSide())return;$('st').textContent='🤖 Computer is thinking...';setTimeout(()=>{const m=pick();if(m)play(m,true)},60)}
function save(){try{localStorage.setItem('chess1',JSON.stringify({ml:ML,cfg,rv:RV,ev:EV,ck:CK,end:END,gd:GD}))}catch(e){}}
function load(){try{const d=JSON.parse(localStorage.getItem('chess1')||'null');if(!d)return;Object.assign(cfg,d.cfg||{});RV=d.rv||[];EV=d.ev||[];CK=d.ck||CK;END=d.end||'';GD=!!d.gd;for(const x of d.ml||[]){const m=fromTok(S,x);if(!m)break;H.push(S);ML.push(x);S=apply(S,m)}}catch(e){}}
function setCfg(){const ot=cfg.tc;cfg={vs:+$('vs').value,lv:+$('lv').value,me:$('me').value,tc:+$('tc').value};if(ot!==cfg.tc)resetCk();flip=!!cfg.vs&&cfg.me==='b';save();upd();if(cfg.vs&&!ML.length)$('hn').textContent=botTxt();maybeCpu()}
function undo(){if(!H.length)return;S=H.pop();ML.pop();if(cfg.vs&&H.length&&S.t===cpuSide()){S=H.pop();ML.pop()}sel=-1;hint=null;BD=null;save();upd();$('hn').textContent='';maybeCpu()}
function flipB(){flip=!flip;R()}
function newG(){S=init();H=[];ML=[];sel=-1;hint=null;BD=null;flip=!!cfg.vs&&cfg.me==='b';save();$('hn').textContent='New game! Make your move.';upd();maybeCpu()}
