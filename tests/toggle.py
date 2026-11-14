import sys,time
from playwright.sync_api import sync_playwright
URL='file://'+sys.argv[1]
PLAY="""([u,cpu])=>{const i=s=>(8-+s[1])*8+('abcdefgh'.indexOf(s[0]));const m=legal(S).find(m=>m.f===i(u.slice(0,2))&&m.t===i(u.slice(2,4)));if(!m)return 'ILLEGAL';play(m,cpu);return 'ok'}"""
fails=[]
def check(n,ok,info=''):
    print(('PASS ' if ok else 'FAIL ')+n+(' | '+str(info) if info!='' else ''))
    if not ok: fails.append(n)
with sync_playwright() as p:
    b=p.chromium.launch(); pg=b.new_page(viewport={'width':392,'height':848},is_mobile=True,has_touch=True); errs=[]
    pg.on('pageerror',lambda e:errs.append(str(e)))
    pg.goto(URL); pg.wait_for_timeout(2500)
    pg.evaluate("()=>{localStorage.removeItem('chessLiveAn');cfg.vs=0;newG()}")
    check('switch exists in the Play action row, default ON',pg.evaluate("()=>{const b=document.getElementById('anb');return !!b&&b.closest('.sec').dataset.s==='qa'&&LIVEAN===1}"),pg.inner_text('#anb'))
    # ON: moves get rated
    pg.evaluate(PLAY,['e2e4',False]); pg.wait_for_timeout(2500)
    check('ON: move is rated live',pg.evaluate("()=>RV.filter(Boolean).length")>=1)
    # turn OFF
    pg.click('#anb'); pg.wait_for_timeout(200)
    check('OFF: label + body class',pg.evaluate("()=>document.body.classList.contains('noan')") and 'Off' in pg.inner_text('#anb'),pg.inner_text('#anb'))
    pg.evaluate("()=>{cfg.vs=0;newG()}")
    for m in ['e2e4','e7e5','g1f3','b8c6','f1b5']: pg.evaluate(PLAY,[m,False]); pg.wait_for_timeout(700)
    pg.wait_for_timeout(2500)
    check('OFF: nothing rated live',pg.evaluate("()=>RV.filter(Boolean).length")==0)
    check('OFF: eval bar hidden',pg.evaluate("()=>getComputedStyle(document.getElementById('eb')).display")=='none')
    check('OFF: coach bubble tells analysis is off',('Analysis is off' in pg.inner_text('#hn')) or ('off' in pg.inner_text('#hn').lower()),pg.inner_text('#hn')[:70])
    check('OFF: no rating marks in move list',pg.evaluate("()=>[...document.querySelectorAll('#ml sup')].every(e=>getComputedStyle(e).display==='none')"))
    check('setting survives reload',True)
    pg.reload(); pg.wait_for_timeout(2500)
    check('OFF persists after reload',pg.evaluate("()=>LIVEAN===0&&document.body.classList.contains('noan')"))
    # finish a game while OFF, then Game report triggers the analysis
    pg.evaluate("()=>{cfg.vs=0;newG()}")
    for m in ['f2f3','e7e5','g2g4','d8h4']: pg.evaluate(PLAY,[m,False]); pg.wait_for_timeout(300)
    pg.wait_for_timeout(1500)
    check('game over (fool\'s mate) and result card shown',pg.evaluate("()=>!!document.getElementById('rsm')"))
    check('nothing analysed yet',pg.evaluate("()=>RV.filter(Boolean).length")==0)
    pg.evaluate("()=>{const b=[...document.querySelectorAll('#rsm button')].find(x=>/report|تقرير/i.test(x.textContent));b.click()}")
    t0=time.time()
    while time.time()-t0<120:
        st=pg.evaluate("()=>[AZ,RV.filter(Boolean).length,ML.length]")
        if st[0]==0 and st[1]==st[2] and st[2]>0: break
        pg.wait_for_timeout(500)
    check('Game report analyses the game on demand',st[1]==st[2] and st[2]==4,st)
    check('...and shows the report in Review',pg.evaluate("()=>document.body.dataset.tab==='review'&&document.getElementById('rpt').innerText.includes('Game report')"))
    # ON again
    pg.evaluate("()=>{UI.tab('play');}"); pg.click('#anb'); pg.wait_for_timeout(200)
    check('ON again',pg.evaluate("()=>LIVEAN===1&&!document.body.classList.contains('noan')"))
    check('no JS errors',not errs,errs)
    b.close()
print('\nALL PASS' if not fails else 'FAILED: '+', '.join(fails)); sys.exit(1 if fails else 0)
