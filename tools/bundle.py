#!/usr/bin/env python3
"""Inline css/ and js/ into ONE index.html (dist/index.html) - handy for a quick test or for the old single-file workflow.
   usage: python3 tools/bundle.py"""
import re,os,sys
root=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
html=open(os.path.join(root,'index.html'),encoding='utf-8').read()
def css(m):
    return '<style>\n'+open(os.path.join(root,m.group(1)),encoding='utf-8').read()+'</style>'
def js(m):
    s=open(os.path.join(root,m.group(1)),encoding='utf-8').read().replace('</script','<\\/script')
    return '<script>\n'+s+'</script>'
html=re.sub(r'<link rel="stylesheet" href="(css/[^"]+)">',css,html)
html=re.sub(r'<script src="(js/[^"]+)"></script>',js,html)
os.makedirs(os.path.join(root,'dist'),exist_ok=True)
out=os.path.join(root,'dist','index.html')
open(out,'w',encoding='utf-8').write(html)
print('wrote',out,len(html),'bytes')
