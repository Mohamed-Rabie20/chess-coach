/* ---- local rating (Elo vs the bots) and finished-games archive ---- */
function finishGame(){if(GD||!ML.length)return;GD=true;
 const lose=END?(/resigned|lost/.test(END)?END.startsWith('White')?'w':'b':null):(!LC.length&&inChk(S)?S.t:null);
 let res=lose?(lose===cfg.me?0:1):.5;const rec={d:Date.now(),pgn:pgn(),vs:cfg.vs,bot:cfg.vs?bot().n+' ('+bot().e+')':'Both sides',n:ML.length,res:cfg.vs?res:null};
 if(cfg.vs){const ex=1/(1+Math.pow(10,(bot().e-RT)/400)),dr=Math.round(32*(res-ex)),old=RT;RT=Math.max(100,RT+dr);rec.dr=dr;RDm='Rating '+old+' → '+RT+' ('+(dr>=0?'+':'')+dr+')';try{localStorage.setItem('chessRating',RT)}catch(e){}}
 ARCH.unshift(rec);ARCH.length=Math.min(ARCH.length,100);try{localStorage.setItem('chessArch',JSON.stringify(ARCH))}catch(e){}save();bars()}
let ARCHPREV=null;
function resetArch(){if(!confirm('Delete ALL games saved in My games? This cannot be undone.'))return;ARCH.length=0;try{localStorage.setItem('chessArch','[]')}catch(e){}ARCHPREV=null;showArch(true);try{bars()}catch(e){}}
function showArch(force){const hn=$('rpt');if(!force&&hn.querySelector('[data-arch]')){hn.innerHTML=ARCHPREV!=null?ARCHPREV:'';ARCHPREV=null;return}if(!hn.querySelector('[data-arch]'))ARCHPREV=hn.innerHTML;const v=ARCH.filter(g=>g.vs),c=x=>v.filter(g=>g.res===x).length;
 $('rpt').innerHTML='<div data-arch="1" style="display:flex;justify-content:space-between;align-items:center;gap:8px"><b>📚 My games</b>'+(ARCH.length?'<button onclick="resetArch()">🗑 Reset</button>':'')+'</div><div class="mu" style="margin:4px 0 8px">Rating '+RT+' · vs computer: '+c(1)+' wins, '+c(.5)+' draws, '+c(0)+' losses</div>'+(ARCH.length?'<div class=\"gl\">'+ARCH.map((g,i)=>'<div style="display:flex;justify-content:space-between;gap:8px;align-items:center;padding:6px 0;border-top:1px solid rgba(128,128,128,.25)"><span>'+(g.res===1?'✅':g.res===0?'❌':g.res===.5?'🤝':'♟')+' '+g.bot+' <span class="mu">'+new Date(g.d).toLocaleDateString()+' · '+g.n+' plies'+(g.dr!=null?' · '+(g.dr>=0?'+':'')+g.dr:'')+'</span></span><button onclick="openGame('+i+')">Review</button></div>').join('')+'</div>':'<div class="mu">No finished games yet.</div>')}
function openGame(i){const g=ARCH[i];if(!g)return;if(ML.length&&!over&&!GD&&!confirm('Replace the current game?'))return;$('px').value=g.pgn;loadPGN()}
{const _u=upd;upd=function(){_u();if(over&&vi<0)finishGame()}}
{const _d=undo;undo=function(){if(GD&&over&&cfg.vs){$('hn').textContent='This game is finished — tap New game to play again.';return}_d()}}
