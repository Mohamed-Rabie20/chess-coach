import sys,json
from playwright.sync_api import sync_playwright
URL='file://'+sys.argv[1]
fails=[]
def check(n,ok,info=''):
    print(('PASS ' if ok else 'FAIL ')+n+(' | '+str(info) if info!='' else ''))
    if not ok: fails.append(n)
with sync_playwright() as p:
    b=p.chromium.launch(); ctx=b.new_context(viewport={'width':392,'height':848},is_mobile=True,has_touch=True,permissions=['clipboard-read','clipboard-write'])
    pg=ctx.new_page(); errs=[]; pg.on('pageerror',lambda e:errs.append(str(e)))
    pg.goto(URL); pg.wait_for_timeout(2000)
    pg.evaluate("()=>{localStorage.clear();localStorage.setItem('chessRating','{\"r\":1234}');localStorage.setItem('chessMist','[{\"f\":\"x\"}]');localStorage.setItem('chessArch','[{\"pgn\":\"1. e4 e5\"}]');location.reload()}"); pg.wait_for_timeout(2000)
    pg.evaluate("()=>UI.tab('more')"); pg.wait_for_timeout(300)
    check('backup card is in More',pg.evaluate("()=>!!document.getElementById('bkc')&&getComputedStyle(document.getElementById('bkc')).display!=='none'"))
    pg.click('#bkc'); pg.wait_for_timeout(500)
    clip=pg.evaluate("()=>navigator.clipboard.readText()")
    ok=False
    try:
        o=json.loads(clip); ok=o['app']=='chess-coach-backup' and o['data'].get('chessRating')=='{"r":1234}' and 'chessMist' in o['data'] and 'chessArch' in o['data']
    except Exception as e: pass
    check('Copy backup puts all app data on the clipboard',ok)
    pg.evaluate("()=>{localStorage.clear()}")
    check('data is gone',pg.evaluate("()=>localStorage.getItem('chessRating')")is None)
    pg.click('#bkr'); pg.fill('#bkt',clip); pg.click('#bkg'); pg.wait_for_timeout(1500)
    check('Restore brings everything back',pg.evaluate("()=>localStorage.getItem('chessRating')==='{\"r\":1234}'&&localStorage.getItem('chessMist')==='[{\"f\":\"x\"}]'&&localStorage.getItem('chessArch')!==null"))
    pg.evaluate("()=>UI.tab('more')"); pg.click('#bkr'); pg.fill('#bkt','not a backup'); pg.click('#bkg'); pg.wait_for_timeout(300)
    check('invalid text is rejected without touching data',pg.evaluate("()=>localStorage.getItem('chessRating')==='{\"r\":1234}'")and 'valid' in pg.inner_text('#bkm').lower() or 'صالحة' in pg.inner_text('#bkm'))
    check('no JS errors',not errs,errs)
    b.close()
print('\nALL PASS' if not fails else 'FAILED: '+', '.join(fails)); sys.exit(1 if fails else 0)
