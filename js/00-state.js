const $=id=>document.getElementById(id),up=x=>x[0].toUpperCase()+x.slice(1);
var AL=0,PGNELO=0,PGNEL={w:0,b:0};try{AL=+localStorage.getItem('chessAL')||0}catch(e){}
function alK(){const r=AL||PGNELO||(cfg.vs?(RT+bot().e)/2:1300);return .00368208*Math.max(.55,Math.min(1,.5+(r-600)/3000))}
function setAL(v){AL=+v;try{localStorage.setItem('chessAL',v)}catch(e){}if(RV.some(Boolean)&&!AZ&&ML.length)analyzeAll()}
let ANIM=null,NOAN=0,WASMOK=false,AQ=1;const AQP=[[12,450,.6],[15,1000,1],[19,2200,2],[24,6000,3.5]];try{const q=localStorage.getItem('chessAQ');if(q!==null&&AQP[+q])AQ=+q}catch(e){}
function setAQ(v){AQ=+v;try{localStorage.setItem('chessAQ',v)}catch(e){}}
const G={k:'♚',q:'♛',r:'♜',b:'♝',n:'♞',p:'♟'};
const NM={p:'pawn',n:'knight',b:'bishop',r:'rook',q:'queen',k:'king'};
const V={p:100,n:320,b:330,r:500,q:900,k:0};
/* standard material values (1/3/3/5/9) for the material counter and sacrifice detection */
const VS={p:100,n:300,b:300,r:500,q:900,k:0};
const N=[[1,2],[2,1],[-1,2],[-2,1],[1,-2],[2,-1],[-1,-2],[-2,-1]];
const K=[[1,0],[-1,0],[0,1],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1]];
const sqn=i=>'abcdefgh'[i&7]+(8-(i>>3));
const tok=m=>sqn(m.f)+sqn(m.t)+(m.pr||''),fromTok=(s,x)=>{const m=legal(s).find(q=>sqn(q.f)+sqn(q.t)===x.slice(0,4));return m?(x[4]?{...m,pr:x[4]}:m):null};
const init=()=>({b:'rnbqkbnr'.split('').concat(Array(8).fill('p'),Array(32).fill(''),Array(8).fill('P'),'RNBQKBNR'.split('')),t:'w',c:{K:1,Q:1,k:1,q:1},ep:-1,hm:0});
let S=init(),H=[],ML=[],sel=-1,hint=null,flip=false,LC=[],over=false,cfg={vs:0,lv:5,me:'w',tc:0};
const cpuSide=()=>cfg.me==='w'?'b':'w';
const OP=['e2e4|King’s Pawn Opening','d2d4|Queen’s Pawn Opening','c2c4|English Opening','g1f3|Réti Opening','e2e4 e7e5|Open Game','e2e4 e7e5 g1f3 g8f6|Petrov’s Defense','e2e4 e7e5 g1f3 b8c6 f1b5|Ruy Lopez','e2e4 e7e5 g1f3 b8c6 f1c4|Italian Game','e2e4 e7e5 f2f4|King’s Gambit','e2e4 c7c5|Sicilian Defense','e2e4 e7e6|French Defense','e2e4 c7c6|Caro-Kann Defense','e2e4 d7d5|Scandinavian Defense','d2d4 d7d5|Closed Game','d2d4 d7d5 c2c4|Queen’s Gambit','d2d4 g8f6|Indian Defense','d2d4 g8f6 c2c4 g7g6|King’s Indian Defense','e2e4 e7e5 g1f3 b8c6 d2d4|Scotch Game','e2e4 e7e5 g1f3 b8c6 b1c3 g8f6|Four Knights Game','e2e4 e7e5 b1c3|Vienna Game','e2e4 e7e5 g1f3 d7d6|Philidor Defense','e2e4 e7e5 g1f3 b8c6 f1c4 f8c5|Giuoco Piano','e2e4 e7e5 g1f3 b8c6 f1c4 g8f6|Two Knights Defense','e2e4 e7e5 g1f3 b8c6 f1b5 a7a6|Ruy Lopez: Morphy Defense','e2e4 c7c5 g1f3 d7d6 d2d4 c5d4 f3d4 g8f6 b1c3 a7a6|Sicilian: Najdorf','e2e4 c7c5 g1f3 d7d6 d2d4 c5d4 f3d4 g8f6 b1c3 g7g6|Sicilian: Dragon','e2e4 c7c5 g1f3 b8c6 d2d4 c5d4 f3d4|Sicilian: Open','e2e4 c7c5 b1c3|Sicilian: Closed','e2e4 d7d6 d2d4 g8f6|Pirc Defense','e2e4 g8f6|Alekhine Defense','e2e4 e7e6 d2d4 d7d5 e4e5|French: Advance','e2e4 e7e6 d2d4 d7d5 b1c3|French: Classical','e2e4 c7c6 d2d4 d7d5 e4e5|Caro-Kann: Advance','e2e4 c7c6 d2d4 d7d5 b1c3 d5e4|Caro-Kann: Classical','e2e4 d7d5 e4d5 d8d5|Scandinavian: Main Line','d2d4 d7d5 c2c4 c7c6|Slav Defense','d2d4 d7d5 c2c4 e7e6|Queen’s Gambit Declined','d2d4 d7d5 c2c4 d5c4|Queen’s Gambit Accepted','d2d4 d7d5 c1f4|London System','d2d4 g8f6 c1f4|London System','d2d4 g8f6 c2c4 e7e6 b1c3 f8b4|Nimzo-Indian Defense','d2d4 g8f6 c2c4 e7e6 g1f3 b7b6|Queen’s Indian Defense','d2d4 g8f6 c2c4 g7g6 b1c3 d7d5|Grünfeld Defense','d2d4 g8f6 c2c4 e7e6 g2g3|Catalan Opening','d2d4 f7f5|Dutch Defense','f2f4|Bird’s Opening','g1f3 d7d5|Réti: Main Line','c2c4 e7e5|English: Reversed Sicilian','b2b3|Nimzo-Larsen Attack','g2g3|King’s Fianchetto Opening','b1c3|Van Geet Opening'].map(x=>x.split('|'));
function opn(){const M=vi<0?ML:ML.slice(0,vi);let b='',n=0;for(const[k,nm]of OP){const t=k.split(' ');if(t.length>=n&&t.length<=M.length&&t.every((x,i)=>M[i]===x)){b=nm;n=t.length}}return b}

function att(b,sq,by){const r=sq>>3,c=sq&7,w=by==='w';
 const at=(rr,cc,ch)=>rr>=0&&rr<8&&cc>=0&&cc<8&&b[rr*8+cc]===(w?ch.toUpperCase():ch);
 const pr=w?r+1:r-1;if(at(pr,c-1,'p')||at(pr,c+1,'p'))return true;
 for(const[a,d]of N)if(at(r+a,c+d,'n'))return true;
 for(const[a,d]of K)if(at(r+a,c+d,'k'))return true;
 for(const[a,d]of K){let rr=r+a,cc=c+d;while(rr>=0&&rr<8&&cc>=0&&cc<8){const p=b[rr*8+cc];if(p){const l=p.toLowerCase();if((p<'a')===w&&(l==='q'||(a&&d?l==='b':l==='r')))return true;break}rr+=a;cc+=d}}
 return false}
function gen(s){const b=s.b,w=s.t==='w',o=[],add=(f,t,pr)=>o.push({f,t,pr});
 for(let f=0;f<64;f++){const p=b[f];if(!p||(p<'a')!==w)continue;const l=p.toLowerCase(),r=f>>3,c=f&7,en=q=>q&&(q<'a')!==w;
  if(l==='p'){const d=w?-1:1,r1=r+d,pr=r1===(w?0:7)?'q':undefined;
   if(r1>=0&&r1<8){if(!b[r1*8+c]){add(f,r1*8+c,pr);if(r===(w?6:1)&&!b[(r+2*d)*8+c])add(f,(r+2*d)*8+c)}
    for(const dc of[-1,1]){const cc=c+dc;if(cc<0||cc>7)continue;const t=r1*8+cc;if(en(b[t])||t===s.ep)add(f,t,pr)}}
  }else if(l==='n'||l==='k'){
   for(const[a,d]of l==='n'?N:K){const rr=r+a,cc=c+d;if(rr<0||rr>7||cc<0||cc>7)continue;const t=rr*8+cc;if(!b[t]||en(b[t]))add(f,t)}
   if(l==='k'){const e=w?60:4,x=w?'b':'w';
    if(f===e&&!att(b,e,x)){
     if(s.c[w?'K':'k']&&!b[e+1]&&!b[e+2]&&b[e+3]===(w?'R':'r')&&!att(b,e+1,x)&&!att(b,e+2,x))add(f,e+2);
     if(s.c[w?'Q':'q']&&!b[e-1]&&!b[e-2]&&!b[e-3]&&b[e-4]===(w?'R':'r')&&!att(b,e-1,x)&&!att(b,e-2,x))add(f,e-2)}}
  }else{for(const[a,d]of K){if(l==='b'&&!(a&&d))continue;if(l==='r'&&a&&d)continue;let rr=r+a,cc=c+d;
   while(rr>=0&&rr<8&&cc>=0&&cc<8){const t=rr*8+cc;if(!b[t])add(f,t);else{if(en(b[t]))add(f,t);break}rr+=a;cc+=d}}}
 }return o}
function apply(s,m){const b=s.b.slice(),p=b[m.f],w=p<'a',l=p.toLowerCase(),c={...s.c};let ep=-1;
 if(l==='p'&&m.t===s.ep&&!b[m.t])b[m.t+(w?8:-8)]='';
 if(l==='p'&&Math.abs(m.t-m.f)===16)ep=(m.f+m.t)>>1;
 if(l==='k'&&Math.abs(m.t-m.f)===2){const h=m.t>m.f;b[h?m.t-1:m.t+1]=b[h?m.t+1:m.t-2];b[h?m.t+1:m.t-2]=''}
 b[m.t]=m.pr?(w?m.pr.toUpperCase():m.pr):p;b[m.f]='';
 if(l==='k'){if(w){c.K=c.Q=0}else{c.k=c.q=0}}
 for(const q of[m.f,m.t]){if(q===63)c.K=0;if(q===56)c.Q=0;if(q===7)c.k=0;if(q===0)c.q=0}
 return{b,t:w?'b':'w',c,ep,hm:(l==='p'||s.b[m.t])?0:(s.hm||0)+1}}
const kp=(b,w)=>b.indexOf(w?'K':'k');
const inChk=s=>att(s.b,kp(s.b,s.t==='w'),s.t==='w'?'b':'w');
const legal=s=>gen(s).filter(m=>{const n=apply(s,m);return!att(n.b,kp(n.b,s.t==='w'),s.t==='w'?'b':'w')});
