/* Test-only UCI engine: uses the app's own rules/search for moves, simulates search time and per-depth info lines (stable vs unstable positions). */
importScripts('../js/00-state.js','../js/01-rules-engine.js');
const MQ=new URLSearchParams(self.location.search);const DELAY=+(MQ.get('delay')||250);
let pos=null,timers=[],cur=null;
function parseFEN(f){const p=f.split(' '),b=[];for(const ch of p[0].replace(/\//g,'')){if(/\d/.test(ch))for(let i=0;i<+ch;i++)b.push('');else b.push(ch)}
 const cs=p[2]||'-';let ep=-1;if(p[3]&&p[3]!=='-')ep=(8-+p[3][1])*8+'abcdefgh'.indexOf(p[3][0]);
 return{b,t:p[1]==='b'?'b':'w',c:{K:cs.includes('K')?1:0,Q:cs.includes('Q')?1:0,k:cs.includes('k')?1:0,q:cs.includes('q')?1:0},ep,hm:0}}
const hash=s=>{let h=0;for(const ch of s)h=(h*31+ch.charCodeAt(0))>>>0;return h};
function uci(m){return sqn(m.f)+sqn(m.t)+(m.pr||'')}
function finish(){timers.forEach(clearTimeout);timers=[];if(!cur)return;const c=cur;cur=null;postMessage('bestmove '+c.mv)}
onmessage=e=>{const c=String(e.data);
 if(c==='uci')postMessage('uciok');else if(c==='isready')postMessage('readyok');
 else if(c.startsWith('position fen '))pos=parseFEN(c.slice(13));
 else if(c==='stop')finish();
 else if(c.startsWith('go')){
  const dm=c.match(/depth (\d+)/),dc=dm?+dm[1]:12,key=c.length;const s=pos;TT.clear();const r=think(s,60000,3);
  const mv=r&&r.m?uci(r.m):null;if(!mv){postMessage('bestmove 0000');return}
  const unstable=hash(JSON.stringify(s.b)+s.t)%2===1,base=Math.max(-900,Math.min(900,Math.round(r.sc)));
  cur={mv};
  for(let d=1;d<=dc;d++)timers.push(setTimeout(()=>{if(!cur)return;const sc=unstable&&d>4?base+((d%2)?45:-45)*(d%3+1):base;postMessage('info depth '+d+' seldepth '+d+' score cp '+sc+' nodes '+d*1000+' pv '+mv)},Math.round(d*DELAY/dc)));
  timers.push(setTimeout(finish,DELAY))}};
