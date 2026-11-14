import sys,time
from playwright.sync_api import sync_playwright
URL='file://'+sys.argv[1]
PLAY="""([u,cpu])=>{const i=s=>(8-+s[1])*8+('abcdefgh'.indexOf(s[0]));const m=legal(S).find(m=>m.f===i(u.slice(0,2))&&m.t===i(u.slice(2,4)));if(!m)return 'ILLEGAL';play(m,cpu);return 'ok'}"""
fails=[]
def check(n,ok,info=''):
    print(('PASS ' if ok else 'FAIL ')+n+(' | '+str(info) if info!='' else ''))
    if not ok: fails.append(n)
vis=lambda pg,sel:pg.evaluate("(s)=>{const e=document.querySelector(s);if(!e)return false;const r=e.getBoundingClientRect(),cs=getComputedStyle(e);return cs.display!=='none'&&r.width>0&&r.bottom<=document.getElementById('tabs').getBoundingClientRect().top}",sel)
with sync_playwright() as p:
    b=p.chromium.launch(); pg=b.new_page(viewport={'width':392,'height':848},is_mobile=True,has_touch=True); errs=[]
    pg.on('pageerror',lambda e:errs.append(str(e)))
    pg.goto(URL); pg.wait_for_timeout(2000)
    pg.evaluate("()=>{localStorage.clear();location.reload()}"); pg.wait_for_timeout(2000)
    pg.evaluate("()=>{cfg.vs=0;newG()}")
    for m in ['e2e4','e7e5']:
        pg.evaluate(PLAY,[m,False]); pg.wait_for_timeout(1200)
    check('one action row visible under the board (Undo, Best, Coach, analysis, more)',all(vis(pg,s) for s in ['#qu','#qb','#qc','#anb','#qo']))
    check('arrows and moves strip visible without scrolling',vis(pg,'.sec[data-s=nav] button') and vis(pg,'#ml'))
    check('header hidden in Play to save room',pg.evaluate("()=>getComputedStyle(document.querySelector('h1')).display")=='none')
    check('Flip / New game / Resign / Draw hidden until the more button',pg.evaluate("()=>getComputedStyle(document.querySelector('.sec[data-s=play]')).display")=='none')
    pg.click('#qo'); pg.wait_for_timeout(200)
    check('the more button opens them',pg.evaluate("()=>getComputedStyle(document.querySelector('.sec[data-s=play]')).display")!='none')
    n0=pg.evaluate("()=>ML.length"); pg.click('#qu'); pg.wait_for_timeout(300)
    check('Undo button works',pg.evaluate("()=>ML.length")==n0-1,(n0,pg.evaluate("()=>ML.length")))
    pg.evaluate(PLAY,['e7e5',False]); pg.wait_for_timeout(1500); pg.evaluate("()=>{hint=null;R()}")
    pg.click('#qb'); pg.wait_for_timeout(3000)
    check('Best button shows the hint arrow',pg.evaluate("()=>!!hint||document.getElementById('ar').querySelectorAll('line').length>0"))
    pg.evaluate(PLAY,['g1f3',False]); pg.wait_for_timeout(300)
    check('arrow disappears after the next move',pg.evaluate("()=>hint===null&&document.getElementById('ar').querySelectorAll('line').length===0"))
    pg.click('#qo'); pg.wait_for_timeout(150)
    pg.evaluate("()=>[...document.querySelectorAll('.sec[data-s=play] button')].find(b=>/New game|لعبة جديدة/.test(b.textContent)).click()"); pg.wait_for_timeout(500)
    check('choosing an option closes the options row',pg.evaluate("()=>!document.body.classList.contains('opts')"))
    pg.evaluate("()=>{const c=document.getElementById('ngcn');if(c)c.click()}")
    pg.click('#anb'); pg.wait_for_timeout(200)
    check('analysis OFF hides Best and Coach',not pg.evaluate("()=>getComputedStyle(document.getElementById('qb')).display!=='none'||getComputedStyle(document.getElementById('qc')).display!=='none'"))
    pg.evaluate("()=>UI.tab('review')"); pg.wait_for_timeout(300)
    check('Review: Best/Coach section visible, quick row hidden',pg.evaluate("()=>getComputedStyle(document.querySelector('.sec[data-s=hint]')).display!=='none'&&getComputedStyle(document.querySelector('.sec[data-s=qa]')).display==='none'"))
    check('no JS errors',not errs,errs)
    b.close()
print('\nALL PASS' if not fails else 'FAILED: '+', '.join(fails)); sys.exit(1 if fails else 0)
