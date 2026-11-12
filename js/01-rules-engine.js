/* ---------- engine ---------- */
function ev(s){const b=s.b,pf=[Array(8).fill(0),Array(8).fill(0)],bc=[0,0];let v=0,mt=0;
 for(let i=0;i<64;i++){const p=b[i];if(!p)continue;const l=p.toLowerCase();if(l==='p')pf[p<'a'?0:1][i&7]++;else if(l!=='k')mt+=V[l]}
 const eg=mt<2600;
 for(let i=0;i<64;i++){const p=b[i];if(!p)continue;const l=p.toLowerCase(),w=p<'a',r=i>>3,c=i&7,sd=w?0:1,cen=4-(Math.abs(c-3.5)+Math.abs(r-3.5));let x=V[l];
  if(l==='n')x+=6*cen;else if(l==='b'){x+=4*cen;bc[sd]++}
  else if(l==='p'){const adv=w?6-r:r-1;x+=3*cen+(eg?8:4)*adv;if([c-1,c,c+1].every(f=>f<0||f>7||!pf[1-sd][f]))x+=15+6*adv;if(pf[sd][c]>1)x-=12}
  else if(l==='r'&&!pf[sd][c])x+=pf[1-sd][c]?8:16;
  else if(l==='k'){if(eg)x+=8*cen;else{x-=3*cen;for(const dc of[-1,0,1]){const cc=c+dc,rr=r+(w?-1:1);if(cc>=0&&cc<8&&rr>=0&&rr<8&&b[rr*8+cc]===(w?'P':'p'))x+=10}}}
  v+=w?x:-x}
 if(bc[0]>1)v+=30;if(bc[1]>1)v-=30;
 return(s.t==='w'?v:-v)+8}
const TT=new Map(),HI=new Int32Array(4096);let DL=0,AB=false,nodes=0;
const key=s=>s.b.map(x=>x||'.').join('')+s.t+s.c.K+s.c.Q+s.c.k+s.c.q+s.ep;
function order(s,ms,tm){return ms.map(m=>({m,k:(tm&&m.f===tm.f&&m.t===tm.t?1e6:0)+(s.b[m.t]?V[s.b[m.t].toLowerCase()]*10-V[s.b[m.f].toLowerCase()]+1000:HI[m.f*64+m.t])+(m.pr?800:0)})).sort((a,b)=>b.k-a.k).map(x=>x.m)}
function qs(s,a,b,q){const ck=inChk(s),w=s.t==='w',x=w?'b':'w';let ms=gen(s),n=0;
 if(!ck){const st=ev(s);if(st>=b||q>=6)return st;if(st>a)a=st;ms=ms.filter(m=>s.b[m.t]||m.pr||(m.t===s.ep&&s.b[m.f].toLowerCase()==='p'))}
 for(const m of order(s,ms)){const ns=apply(s,m);if(att(ns.b,kp(ns.b,w),x))continue;n++;const v=-qs(ns,-b,-a,q+1);if(v>=b)return v;if(v>a)a=v}
 return ck&&!n?-99999:a}
function search(s,d,a,b){
 if((++nodes&255)===0&&Date.now()>DL)AB=true;if(AB)return 0;
 if(d<=0)return qs(s,a,b,0);
 const k=key(s),e=TT.get(k),a0=a;
 if(e&&e.d>=d){if(e.f===0)return e.v;if(e.f===1&&e.v>a)a=e.v;else if(e.f===2&&e.v<b)b=e.v;if(a>=b)return e.v}
 const ms=legal(s);if(!ms.length)return inChk(s)?-99999-d:0;
 let bv=-Infinity,bm=null;
 for(const m of order(s,ms,e&&e.m)){const v=-search(apply(s,m),d-1,-b,-a);if(AB)return 0;if(v>bv){bv=v;bm=m}if(v>a)a=v;if(a>=b){if(!s.b[m.t])HI[m.f*64+m.t]+=d*d;break}}
 TT.set(k,{d,v:bv,f:bv<=a0?2:bv>=b?1:0,m:bm});return bv}
function think(s,T,maxD){const root=legal(s);if(!root.length)return null;
 DL=Date.now()+T;AB=false;nodes=0;HI.fill(0);if(TT.size>300000)TT.clear();
 let list=order(s,root),bm=list[0],bs=0,bd=0;
 for(let d=1;d<=maxD;d++){let cb=null,cs=-Infinity,a=-Infinity;
  for(const m of list){const v=-search(apply(s,m),d-1,-Infinity,-a);if(AB)break;if(v>cs){cs=v;cb=m}if(v>a)a=v}
  if(cb){bm=cb;bs=cs;if(!AB)bd=d;list=[cb,...list.filter(x=>x!==cb)]}
  if(AB||Math.abs(bs)>90000)break}
 return{m:bm,sc:bs,d:Math.max(bd,1)}}
function scoreAll(s,D){DL=Infinity;AB=false;return legal(s).map(m=>({m,v:-search(apply(s,m),D-1,-Infinity,Infinity)}))}
