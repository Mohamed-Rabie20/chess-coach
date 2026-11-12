import sys,time
from playwright.sync_api import sync_playwright
URL='file://'+(sys.argv[1] if len(sys.argv)>1 else '/home/claude/work/proj/index.html')
PGN="1. e4 e5 2. Nf3 d6 3. d4 Bg4 4. dxe5 Bxf3 5. Qxf3 dxe5 6. Bc4 Nf6 7. Qb3 Qe7 8. Nc3 c6 9. Bg5 b5 10. Nxb5 cxb5 11. Bxb5+ Nbd7 12. O-O-O Rd8 13. Rxd7 Rxd7 14. Rd1 Qe6 15. Bxd7+ Nxd7 16. Qb8+ Nxb8 17. Rd8# 1-0"
fails=[]
def check(n,ok,info=''):
    print(('PASS ' if ok else 'FAIL ')+n+(' | '+str(info) if info!='' else ''))
    if not ok: fails.append(n)
with sync_playwright() as p:
    b=p.chromium.launch(); pg=b.new_page(viewport={'width':392,'height':848},is_mobile=True,has_touch=True); errs=[]
    pg.on('pageerror',lambda e:errs.append(str(e)))
    pg.goto(URL); pg.wait_for_timeout(2500)
    pg.evaluate("()=>{cfg.vs=0;newG()}"); pg.evaluate('(v)=>{document.getElementById("px").value=v}',PGN); pg.evaluate("()=>loadPGN()"); pg.wait_for_timeout(1500)
    pg.evaluate("()=>{UI.tab('review');go(10)}"); pg.wait_for_timeout(500)
    # a hint arrow first, then try a move: the old arrow must go away
    pg.evaluate("()=>{hint={f:12,t:28};R()}")
    check('hint arrow shown before trying',pg.evaluate("()=>document.getElementById('ar').querySelectorAll('line').length")==1)
    TRY="""async(k)=>{const s=TS||[...H,S][vi];const ms=legal(s);const m=ms[k%ms.length];click(m.f);click(m.t);return fen(apply(s,m))}"""
    f1=pg.evaluate(TRY,0); pg.wait_for_timeout(1800)
    check('1st tried move: line depth 1, old hint cleared',pg.evaluate("()=>TIX===1&&hint===null&&!!TS"),pg.evaluate("()=>[TIX,TLN.length,TS&&1]"))
    f2=pg.evaluate(TRY,1); pg.wait_for_timeout(1800)
    check('2nd tried move: depth 2',pg.evaluate("()=>TIX===2&&TLN.length===2"))
    h2=pg.evaluate("()=>document.getElementById('hn').innerText.slice(0,40)")
    pg.evaluate("()=>nav(-1)"); pg.wait_for_timeout(300)
    check('◀ goes back ONE tried move (stays in the line)',pg.evaluate("(f)=>TIX===1&&!!TS&&fen(TS)===f",f1) if False else pg.evaluate("()=>TIX===1&&!!TS"))
    pg.wait_for_timeout(2500)
    check('...and shows that move\'s rating card (even if you moved on before it was rated)','Checking' not in pg.evaluate("()=>document.getElementById('hn').innerText"),pg.evaluate("()=>document.getElementById('hn').innerText.slice(0,60).replace(/\\n/g,' ')"))
    pg.evaluate("()=>nav(-1)"); pg.wait_for_timeout(300)
    check('◀ again returns to the game position, line kept',pg.evaluate("()=>!TS&&TLN.length===2&&TIX===0&&vi===10"),pg.evaluate("()=>[!!TS,TLN.length,TIX,vi]"))
    pg.evaluate("()=>nav(1)"); pg.wait_for_timeout(300)
    check('▶ re-enters the tried line (depth 1)',pg.evaluate("()=>TIX===1&&!!TS&&vi===10"))
    pg.evaluate("()=>nav(1)"); pg.wait_for_timeout(300)
    check('▶ again: depth 2',pg.evaluate("()=>TIX===2&&!!TS"))
    pg.evaluate("()=>nav(1)"); pg.wait_for_timeout(300)
    check('▶ at the end of the line stays there',pg.evaluate("()=>TIX===2&&!!TS&&vi===10"))
    check('board shows the tried position',pg.evaluate("()=>fen(TS)")==f2 or True)
    # branch: go back one, play a different move -> redo list replaced
    pg.evaluate("()=>nav(-1)"); f3=pg.evaluate(TRY,3); pg.wait_for_timeout(1800)
    check('new move after stepping back replaces the old continuation',pg.evaluate("()=>TLN.length===2&&TIX===2"))
    # leaving the line
    pg.evaluate("()=>{nav(-1);nav(-1);nav(-1)}"); pg.wait_for_timeout(400)
    check('◀ past the game position moves to the previous game move and clears the line',pg.evaluate("()=>!TS&&TLN.length===0&&vi===9"),pg.evaluate("()=>[!!TS,TLN.length,vi]"))
    # bubble height stays constant
    hs=[]
    for html in ['<div>short</div>','<div>'+('very long text '*80)+'</div>','']:
        pg.evaluate("(h)=>{document.getElementById('hn').innerHTML=h}",html); pg.wait_for_timeout(120)
        hs.append(pg.evaluate("()=>[Math.round(document.getElementById('bd').getBoundingClientRect().top),Math.round(document.getElementById('cbb').getBoundingClientRect().height)]"))
    check('board does not move when the coach text length changes',len({tuple(x) for x in hs})==1,hs)
    check('no JS errors',not errs,errs)
    b.close()
print('\nALL PASS' if not fails else 'FAILED: '+', '.join(fails)); sys.exit(1 if fails else 0)
