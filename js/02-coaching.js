/* ---------- coaching ---------- */
function why(s,m){const R=[],p=s.b[m.f],l=p.toLowerCase(),w=s.t==='w',op=w?'b':'w',n=apply(s,m),cp=s.b[m.t]||(l==='p'&&m.t===s.ep?'p':'');
 if(!legal(n).length&&inChk(n))return['Checkmate! 🎉'];
 if(l==='k'&&Math.abs(m.t-m.f)===2)R.push('Castling: protects your king and brings the rook into play');
 if(m.pr)R.push('Promotes the pawn to a queen');
 if(cp)R.push('Captures the '+NM[cp.toLowerCase()]+(att(n.b,m.t,op)?' (the square is attacked, so it is likely a trade)':' and nothing can recapture'));
 if(inChk(n))R.push('Gives check and forces a reply');
 if(!cp&&att(s.b,m.f,op)&&!att(n.b,m.t,op))R.push('Saves your '+NM[l]+' from an attack');
 if(!cp&&(l==='n'||l==='b')&&(m.f>>3)===(w?7:0))R.push('Develops a piece toward the center');
 if(l==='p'&&!cp&&[27,28,35,36].includes(m.t))R.push('Fights for the center');
 if(!R.length)R.push('Improves your piece and prepares a stronger plan');
 return R}
function doHint(){const rv=vi>=0;if(over&&!rv)return;$('hn').textContent='🤔 Thinking...';
 const cur=()=>vi>=0?(TS||[...H,S][vi]):S,P=cur(),key=fen(P),vk=vi;
 setTimeout(async()=>{const r=await eng(P,2500,12);if(vi!==vk||fen(cur())!==key)return;if(!r||!r.m){$('hn').textContent='No legal moves in this position.';return}const m=r.m,p=P.b[m.f].toLowerCase();hint=m;sel=-1;R();
  const sc=Math.abs(r.sc)>90000?(r.sc>0?'Forced mate for you 🔥':'A very difficult position'):(r.sc>=0?'You are up about ':'You are down about ')+(Math.abs(r.sc)/100).toFixed(1)+' pawns';
  $('hn').innerHTML='<b>'+up(NM[p])+' '+sqn(m.f)+' → '+sqn(m.t)+'</b><ul>'+why(P,m).map(x=>'<li>'+x+'</li>').join('')+'</ul><div class="mu">Evaluation after it: '+sc+' (searched '+r.d+' moves deep)</div>'},30)}

function pick(){const lv=cfg.lv;if(lv>=3)return think(S,lv===3?1500:4000,12).m;
 const L=scoreAll(S,lv===1?1:2).sort((a,b)=>b.v-a.v);return lv===1?L[Math.floor(Math.random()*Math.min(4,L.length))].m:L[0].m}
