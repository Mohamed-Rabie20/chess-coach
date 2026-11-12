import sys,os,shutil,subprocess,time,json
from playwright.sync_api import sync_playwright
ROOT=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SITE='/tmp/chess-coach-testsite'
shutil.rmtree(SITE,ignore_errors=True); shutil.copytree(ROOT,SITE,ignore=shutil.ignore_patterns('tests','dist','.git','node_modules'))
os.makedirs(SITE+'/engine',exist_ok=True)
shutil.copy(os.path.join(ROOT,'tests','mock-sf.js'),SITE+'/engine/mock-sf.js')
DELAY=int(sys.argv[1]) if len(sys.argv)>1 else 300
open(SITE+'/engine/config.js','w').write('window.SFNEW={file:"engine/mock-sf.js?delay=%d",name:"Mock Stockfish"};'%DELAY)
srv=subprocess.Popen(['python3','-m','http.server','8123','--directory',SITE],stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL); time.sleep(1)
PGN="1. e4 e5 2. Nf3 d6 3. d4 Bg4 4. dxe5 Bxf3 5. Qxf3 dxe5 6. Bc4 Nf6 7. Qb3 Qe7 8. Nc3 c6 9. Bg5 b5 10. Nxb5 cxb5 11. Bxb5+ Nbd7 12. O-O-O Rd8 13. Rxd7 Rxd7 14. Rd1 Qe6 15. Bxd7+ Nxd7 16. Qb8+ Nxb8 17. Rd8# 1-0"
res={}
try:
  with sync_playwright() as p:
    b=p.chromium.launch(); errs=[]
    for workers in ['1','3']:
      for es in [True,False]:
        pg=b.new_page(viewport={'width':392,'height':848}); pg.on('pageerror',lambda e:errs.append(str(e)))
        pg.goto('http://localhost:8123/index.html'); pg.wait_for_timeout(2500)
        pg.evaluate("(w)=>{localStorage.setItem('chessWorkers',w)}",workers)
        pg.evaluate("(e)=>{window.NOES=!e}",es)
        info=pg.evaluate("()=>[WASMOK,SFok,document.getElementById('en').textContent]")
        pg.evaluate("()=>{cfg.vs=0;newG()}"); pg.evaluate('(v)=>{document.getElementById("px").value=v}',PGN); pg.evaluate("()=>loadPGN()"); pg.wait_for_timeout(1000)
        pg.evaluate("()=>{ECache.clear();RV=[];EV=[]}")
        t0=time.time(); pg.evaluate("()=>analyzeAll()")
        while time.time()-t0<240:
            st=pg.evaluate("()=>[AZ,RV.filter(Boolean).length,ML.length]")
            if st[0]==0 and st[1]==st[2] and st[2]>0: break
            pg.wait_for_timeout(300)
        dt=time.time()-t0
        cls=pg.evaluate("()=>RV.map(x=>x?x.k:null)")
        res[(workers,es)]=(round(dt,1),cls,info)
        print(f"workers={workers} earlystop={es}: {dt:.1f}s engines={pg.evaluate('()=>ANX.n')} state={st} info={info[:2]}")
        pg.close()
    print('JS errors:',errs)
    base=res[('1',False)][1]
    for k,v in res.items(): print(k,'same ratings as sequential:',v[1]==base)
    b.close()
finally: srv.terminate()
