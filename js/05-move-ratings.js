/* ---------- move ratings: Brilliant, Great, Best, Excellent, Good, Book, Inaccuracy, Mistake, Miss, Blunder ---------- */
let BD=null;
const RTG={brilliant:['!!','Brilliant','#1baca6','A great piece sacrifice that still works out.'],great:['!','Great move','#5c8bb0','Hard to find: the other moves are much worse.'],best:['★','Best move','#96bc4b','The engine’s top choice.'],excellent:['👍','Excellent','#96bc4b','Almost as good as the best move.'],good:['✓','Good','#8aa66a','A solid move.'],book:['📖','Book','#a88865','Known opening theory.'],forced:['□','Forced','#888','The only legal move.'],inacc:['?!','Inaccuracy','#d9a21b','Slightly weakens your position.'],mistake:['?','Mistake','#e58f2a','This gives away a lot.'],miss:['✖','Miss','#ff7769','You missed a big chance.'],blunder:['??','Blunder','#ca3431','A serious error.']};
const _isBookPre=l=>OP.some(([k])=>{const t=k.split(' ');return t.length>=l.length&&l.every((x,i)=>t[i]===x)});
const hangP=(s,side)=>{const o=side==='w'?'b':'w',r=[];for(let i=0;i<64;i++){const p=s.b[i];if(!p||(p<'a')!==(side==='w'))continue;const l=p.toLowerCase();if(l==='k')continue;const la=lowAtt(s.b,i,o);if(att(s.b,i,o)&&(!att(s.b,i,side)||la<V[l]))r.push({i,l,la})}return r};
let BKP=null;
const bkKey=st=>fen(st).split(' ').slice(0,3).join(' ');
const bkMv=x=>({f:(8-+x[1])*8+(x.charCodeAt(0)-97),t:(8-+x[3])*8+(x.charCodeAt(2)-97),pr:x[4]||undefined});
function bookPos(){if(BKP&&BKP.n===OP.length)return BKP.s;const set=new Set(),cache=new Map();for(const[k]of OP){const t=k.split(' ');let st=init(),p='';for(let i=0;i<t.length;i++){p+=(i?' ':'')+t[i];let nx=cache.get(p);if(!nx){nx=apply(st,bkMv(t[i]));cache.set(p,nx);set.add(bkKey(nx))}st=nx}}BKP={n:OP.length,s:set};return set}
/* book = known position (chess.com style): transpositions count too */
const isBook=l=>{if(_isBookPre(l))return true;try{let st=init();for(const x of l)st=apply(st,bkMv(x));return bookPos().has(bkKey(st))}catch(e){return false}};
function lowAtt(b,sq,by){const r=sq>>3,c=sq&7,w=by==='w',g=(rr,cc)=>rr>=0&&rr<8&&cc>=0&&cc<8?b[rr*8+cc]:'',T=ch=>w?ch.toUpperCase():ch;let m=999;
 const pr=w?r+1:r-1;if(g(pr,c-1)===T('p')||g(pr,c+1)===T('p'))return 100;
 for(const[a,d]of N)if(g(r+a,c+d)===T('n'))m=Math.min(m,320);
 for(const[a,d]of K){let rr=r+a,cc=c+d,first=true;while(rr>=0&&rr<8&&cc>=0&&cc<8){const p=b[rr*8+cc];if(p){if((p<'a')===w){const l=p.toLowerCase(),dg=a&&d;if(l==='q')m=Math.min(m,900);else if(dg&&l==='b')m=Math.min(m,330);else if(!dg&&l==='r')m=Math.min(m,500);else if(first&&l==='k')m=Math.min(m,1000)}break}first=false;rr+=a;cc+=d}}
 return m}

function play(m,cpu){const pr=S;H.push(S);ML.push(tok(m));const bk=isBook(ML);S=apply(S,m);sel=-1;hint=null;BD=null;save();upd();if(!cpu)setTimeout(()=>maybeCpu(()=>review(pr,m,bk)),40)}
function maybeCpu(after){if(!cfg.vs||over||S.t!==cpuSide()){if(after)after();return}$('st').textContent='🤖 Computer is thinking...';setTimeout(async()=>{const m=await pick();if(m)play(m,true);if(after)setTimeout(after,50)},60)}
