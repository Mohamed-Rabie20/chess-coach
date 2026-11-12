import sys,time,json
from playwright.sync_api import sync_playwright
P=sys.argv[1]; URL='file://'+P
PGN="1. e4 e5 2. Nf3 d6 3. d4 Bg4 4. dxe5 Bxf3 5. Qxf3 dxe5 6. Bc4 Nf6 7. Qb3 Qe7 8. Nc3 c6 9. Bg5 b5 10. Nxb5 cxb5 11. Bxb5+ Nbd7 12. O-O-O Rd8 13. Rxd7 Rxd7 14. Rd1 Qe6 15. Bxd7+ Nxd7 16. Qb8+ Nxb8 17. Rd8# 1-0"
idx=lambda s:(8-int(s[1]))*8+'abcdefgh'.index(s[0])
PLAY="""([u,cpu])=>{const i=s=>(8-+s[1])*8+('abcdefgh'.indexOf(s[0]));const m=legal(S).find(m=>m.f===i(u.slice(0,2))&&m.t===i(u.slice(2,4)));if(!m)return 'ILLEGAL';play(m,cpu);return 'ok'}"""
fails=[]
def check(name,ok,info=''):
    print(('PASS ' if ok else 'FAIL ')+name+(' | '+str(info) if info!='' else '')); 
    if not ok: fails.append(name)
with sync_playwright() as p:
    b=p.chromium.launch(); ctx=b.new_context(viewport={'width':392,'height':848},is_mobile=True,has_touch=True)
    pg=ctx.new_page(); errs=[]; pg.on('pageerror',lambda e:errs.append(str(e)))
    pg.goto(URL); pg.wait_for_timeout(2500)
    check('loads without JS errors',not errs,errs)
    # repetition
    pg.evaluate("()=>{cfg.vs=0;newG()}")
    r=[pg.evaluate(PLAY,[m,True]) for m in ['g1f3','g8f6','f3g1','f6g8']*2]; pg.wait_for_timeout(1200)
    check('threefold draw at ply 8',pg.inner_text('#st')=='Draw (threefold repetition)',pg.inner_text('#st'))
    check('result card shown',pg.evaluate("()=>!!document.getElementById('rsm')"))
    # tabs / layout
    pg.evaluate("()=>{cfg.vs=0;newG()}")
    for m in ['e2e4','e7e5','g1f3']: pg.evaluate(PLAY,[m,True])
    pg.wait_for_timeout(500)
    check('nav arrows visible in Play',pg.evaluate("()=>getComputedStyle(document.querySelector('.sec[data-s=nav]')).display")=='flex')
    check('coach bubble above board',pg.evaluate("()=>document.getElementById('cbb').getBoundingClientRect().bottom<=document.getElementById('bd').getBoundingClientRect().top"))
    # review + report only in Review
    pg.evaluate("()=>{cfg.vs=0;newG()}"); pg.evaluate('(v)=>{document.getElementById("px").value=v}',PGN); pg.evaluate("()=>loadPGN()"); pg.wait_for_timeout(1500)
    pg.evaluate("()=>analyzeAll()")
    t0=time.time()
    while time.time()-t0<300:
        st=pg.evaluate("()=>[AZ,RV.filter(Boolean).length,ML.length]")
        if st[0]==0 and st[1]==st[2]: break
        pg.wait_for_timeout(2000)
    check('analysis completes',st[0]==0 and st[1]==st[2],(st,round(time.time()-t0,1)))
    vis={n:(pg.evaluate(f"()=>{{UI.tab('{n}');return getComputedStyle(document.getElementById('rpt')).display}}")) for n in ['play','train','more','review']}
    check('report only in Review',vis=={'play':'none','train':'none','more':'none','review':'block'},vis)
    # train on main board
    pg.evaluate("""()=>{const i=25;localStorage.setItem('chessMist',JSON.stringify([{f:fen(H[i]),b:'f6d7',p:ML[i],k:'mistake',n:0,due:0,d:Date.now()}]));localStorage.removeItem('chessMistDone');localStorage.removeItem('chessMistSolved')}""")
    pg.evaluate("()=>UI.tab('train')"); pg.wait_for_timeout(500)
    pg.evaluate("""()=>{const i=25;localStorage.setItem('chessMist',JSON.stringify([{f:fen(H[i]),b:'f6d7',p:ML[i],k:'mistake',n:0,due:0,d:Date.now()}]));localStorage.removeItem('chessMistDone')}""")
    pg.evaluate("()=>TRN.t('m')"); pg.wait_for_timeout(800)
    check('train has no 2nd board',pg.evaluate("()=>document.querySelectorAll('#trp #bdw *').length")==0)
    for sq in ['f6','d7']: pg.evaluate("(i)=>document.querySelector('#bd .sq[data-i=\"'+i+'\"]').click()",idx(sq)); pg.wait_for_timeout(500)
    pg.wait_for_timeout(500)
    check('mistake solved and removed',pg.evaluate("()=>localStorage.getItem('chessMist')")=='[]' and 'Correct' in pg.inner_text('#tm'))
    pg.evaluate("()=>TRN.t('o')"); pg.evaluate("()=>{const s=document.getElementById('of');const o=[...s.options].find(x=>/Sicilian/.test(x.value));s.value=o.value;TRN.ol()}"); pg.wait_for_timeout(900)
    ok=pg.evaluate("()=>{const nav=document.getElementById('tabs').getBoundingClientRect().top;return ['Next move','Back','Practise'].every(t=>{const b=[...document.querySelectorAll('#trp button')].find(b=>b.textContent.includes(t));return b&&b.getBoundingClientRect().bottom<=nav})}")
    check('Learn buttons visible without scrolling',ok)
    check('no JS errors after flows',not errs,errs)
    # perft
    JS="""([fen,d])=>{const p=fen.split(' '),b=[];for(const ch of p[0].replace(/\\//g,'')){if(/\\d/.test(ch))for(let i=0;i<+ch;i++)b.push('');else b.push(ch)}
 const cs=p[2];let ep=-1;if(p[3]&&p[3]!=='-')ep=(8-+p[3][1])*8+'abcdefgh'.indexOf(p[3][0]);
 const s={b,t:p[1]==='b'?'b':'w',c:{K:cs.includes('K')?1:0,Q:cs.includes('Q')?1:0,k:cs.includes('k')?1:0,q:cs.includes('q')?1:0},ep,hm:0};
 const isP=(s,m)=>s.b[m.f]&&s.b[m.f].toLowerCase()==='p'&&((m.t>>3)===0||(m.t>>3)===7);
 const perft=(s,d)=>{let n=0;for(const m of legal(s)){const v=isP(s,m)?['q','r','b','n']:[null];for(const pr of v){if(d===1)n++;else n+=perft(apply(s,pr?{...m,pr}:m),d-1)}}return n};return perft(s,d)}"""
    T=[('start','rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq -',[20,400,8902,197281]),('kiwipete','r3k2r/p1ppqpb1/bn2pnp1/3PN3/1p2P3/2N2Q1p/PPPBBPPP/R3K2R w KQkq -',[48,2039,97862]),('pos3','8/2p5/3p4/KP5r/1R3p1k/8/4P1P1/8 w - -',[14,191,2812,43238]),('pos4','r3k2r/Pppp1ppp/1b3nbN/nP6/BBP1P3/q4N2/Pp1P2PP/R2Q1RK1 w kq -',[6,264,9467]),('pos5','rnbq1k1r/pp1Pbppp/2p5/8/2B5/8/PPP1NnPP/RNBQK2R w KQ -',[44,1486,62379])]
    good=all(pg.evaluate(JS,[f,d])==e for n,f,x in T for d,e in enumerate(x,1))
    check('perft: all 5 standard positions exact',good)
    b.close()
print('\nALL PASS' if not fails else 'FAILED: '+', '.join(fails)); sys.exit(1 if fails else 0)
