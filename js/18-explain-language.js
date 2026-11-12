/* v8: explanation language (English / العربية) - translates text live, English stays the source */
(()=>{
const PN={pawn:'بيدق',knight:'حصان',bishop:'فيل',rook:'قلعة',queen:'وزير',king:'ملك'};
const RU=[[/(Pawn|Knight|Bishop|Rook|Queen|King) (?=[a-h][1-8])/g,(m,p)=>PN[p.toLowerCase()]+' '],
[/Hint (\d) of 3/g,'تلميح $1 من 3'],[/Analyzing move (\d+) of (\d+)/g,'جارٍ تحليل النقلة $1 من $2'],[/Reviewing move (\d+) of (\d+)/g,'مراجعة النقلة $1 من $2'],
[/(\d+) due of (\d+)/g,'$1 مستحق من $2'],[/\(rating (\d+)/g,'(التقييم $1'],[/Cost: about ([\d.]+) pawns/g,'الخسارة: حوالي $1 بيدق'],
[/\((\d+)% of book lines\)/g,'($1٪ من خطوط الكتاب)'],[/(\d+) puzzles loaded/g,'تم تحميل $1 لغز'],[/Loaded (\d+) puzzles/g,'تم تحميل $1 لغز'],
[/Your move allows checkmate: (\S+)\./g,'نقلتك تسمح بكش مات: $1.'],[/It lets the opponent win your (\w+) with (\S+)\./g,'تسمح للخصم بأخذ $1 عندك بنقلة $2.'],
[/You missed checkmate with (\S+)!/g,'فوّتّ كش مات بنقلة $1!'],[/You missed a chance to win a (\w+): (\S+)\./g,'فوّتّ فرصة لأخذ $1: $2.'],
[/Your (\w+) on ([a-h][1-8]) can now be captured\./g,'يمكن الآن أخذ $1 عندك على $2.'],[/The engine prefers (\S+): /g,'المحرك يفضّل $1: '],
[/Look for a move that (.*)\./g,'ابحث عن نقلة $1.'],[/Look at your (\w+) on ([a-h][1-8])\. Where can it do the most good\?/g,'انظر إلى $1 عندك على $2. أين يفيد أكثر؟'],
[/Find the best move for/g,'ابحث عن أفضل نقلة لـ'],[/(\d+) games\./g,'$1 جيم.']];
const D=[['A great piece sacrifice that still works out.','تضحية رائعة بقطعة وتنجح في النهاية.'],['Hard to find: the other moves are much worse.','صعب إيجادها: باقي النقلات أسوأ بكثير.'],
["The engine's top choice.",'اختيار المحرك الأول.'],['Almost as good as the best move.','تكاد تكون بجودة أفضل نقلة.'],['A solid move.','نقلة سليمة.'],['Known opening theory.','نظرية افتتاحية معروفة.'],
['The only legal move.','النقلة القانونية الوحيدة.'],['Slightly weakens your position.','تضعف موقفك قليلاً.'],['This gives away a lot.','هذه النقلة تخسّرك الكثير.'],['You missed a big chance.','فوّتّ فرصة كبيرة.'],['A serious error.','خطأ فادح.'],
['Better was:','الأفضل كان:'],['(blue arrow)','(السهم الأزرق)'],['Lets the opponent force a mate','تسمح للخصم بإجبارك على كش مات'],
['Chess Coach','مدرب الشطرنج'],['Game Review','مراجعة الجيم'],['Players','اللاعبون'],['Accuracy','الدقة'],['Tap the graph to jump to a move.','اضغط على الرسم للانتقال إلى نقلة.'],['Start Review','ابدأ المراجعة'],['Review','مراجعة'],['Tips: ON','النصائح: شغّال'],['Tips: OFF','النصائح: متوقف'],['Install app','ثبّت التطبيق'],['Draw','تعادل'],['Brilliant','رائعة'],['Great move','نقلة عظيمة'],['Best move','أفضل نقلة'],['Excellent','ممتازة'],['Inaccuracy','عدم دقة'],['Mistake','غلطة'],['Blunder','خطأ فادح'],['Forced','إجبارية'],['Book moves','نقلات الكتاب'],['Book','كتاب'],['Good','جيدة'],['Miss','فرصة ضائعة'],
['Checkmate!','كش مات!'],['Castling: protects your king and brings the rook into play','التبييت: يحمي ملكك ويُدخل القلعة في اللعب'],['Promotes the pawn to a queen','يرقّي البيدق إلى وزير'],
['Captures the','يأخذ'],['(the square is attacked, so it is likely a trade)','(المربع مهاجَم، فغالباً تبادل)'],['and nothing can recapture','ولا يمكن استرجاعه'],['Gives check and forces a reply','يعطي كش ويفرض ردّاً'],
['Saves your','ينقذ'],['from an attack','من هجوم'],['Develops a piece toward the center','يطوّر قطعة نحو المركز'],['Fights for the center','ينافس على المركز'],['Improves your piece and prepares a stronger plan','يحسّن قطعتك ويمهّد لخطة أقوى'],
['Tip: early queen moves can be chased away. Develop knights and bishops first.','نصيحة: الوزير الذي يخرج مبكراً يمكن مطاردته. طوّر الأحصنة والأفيال أولاً.'],
['Tip: you moved the same piece twice in the opening. Try developing a new piece.','نصيحة: حرّكت نفس القطعة مرتين في الافتتاحية. جرّب تطوير قطعة جديدة.'],['Tip: castle soon to tuck your king away safely.','نصيحة: بيّت قريباً لتأمين الملك.'],
['Look for a way to checkmate!','ابحث عن طريقة لكش مات!'],['Think about the safety of your king.','فكّر في أمان ملكك.'],['Tap Coach again for the next hint.','اضغط Coach مرة أخرى للتلميح التالي.'],['Tap Coach again for the move.','اضغط Coach مرة أخرى لترى النقلة.'],
['White to move','الدور على الأبيض'],['Black to move','الدور على الأسود'],['Draw (stalemate)','تعادل (بات)'],['Check!','كش!'],['wins','يفوز'],['Computer is thinking...','الكمبيوتر يفكّر...'],
['New game','لعبة جديدة'],['Resign','استسلام'],['Undo','تراجع'],['Flip','اقلب'],['Coach','المدرب'],['Summary','الملخص'],['Games','الجيمات'],['Analyze','حلّل'],['Settings','الإعدادات'],['Load PGN','حمّل PGN'],['Copy','انسخ'],
['Mistakes','الأخطاء'],['Openings','الافتتاحيات'],['Stats','الإحصائيات'],['Puzzles','ألغاز'],['Train','تدريب'],['Hint','تلميح'],['Show solution','أظهر الحل'],['Show answer','أظهر الإجابة'],['Quiz me','اختبرني'],['Play full solution','شغّل الحل كامل'],['White to play','الأبيض يلعب'],['Black to play','الأسود يلعب'],['Learn','تعلّم'],['Practise','تدرّب'],['Show book move','أظهر نقلة الكتاب'],['Next move','النقلة التالية'],['Back','رجوع'],['Next puzzle','لغز تالٍ'],['New puzzle','لغز جديد'],['Next','التالي'],['Start','ابدأ'],
['All ratings','كل المستويات'],['Easy (up to 1200)','سهل (حتى 1200)'],['Medium (1200-1600)','متوسط (1200-1600)'],['Hard (1600-2000)','صعب (1600-2000)'],['Expert (2000+)','خبير (2000+)'],
['Using 1 built-in sample puzzle.','يستخدم لغزاً تجريبياً واحداً مدمجاً.'],['Load more: choose','لتحميل المزيد اختر'],['Puzzle solved!','تم حل اللغز!'],['Correct. Keep going…','صح. كمّل…'],['Not the move. Try again.','ليست النقلة. حاول مرة أخرى.'],
['Opponent is moving…','الخصم يلعب…'],['Your move.','دورك.'],['Move the piece on','حرّك القطعة على'],['Solution:','الحل:'],['Correct:','صح:'],['Not the best move. Try again.','ليست أفضل نقلة. حاول مرة أخرى.'],
['The best move was','أفضل نقلة كانت'],['Tap a piece, then its target square.','اضغط قطعة ثم المربع المطلوب.'],['Not a book move here.','ليست نقلة من الكتاب هنا.'],['Line complete','انتهى الخط'],['Another line','خط آخر'],
['I play White','ألعب بالأبيض'],['I play Black','ألعب بالأسود'],['Your move','دورك'],['Book moves exist here: find one.','توجد نقلات من الكتاب هنا: ابحث عن واحدة.'],['No saved mistakes yet.','لا توجد أخطاء محفوظة بعد.'],
['Nothing due now.','لا شيء مستحق الآن.'],['Import','استيراد'],['Imported','تم استيراد'],['new games','جيم جديد'],['Opening','الافتتاحية'],['Score','النتيجة'],['White','الأبيض'],['Black','الأسود']];
const esc=s=>s.replace(/[.*+?^${}()|[\]\\]/g,'\\$&').replace(/'/g,"['’]");
D.sort((a,b)=>b[0].length-a[0].length);
const DR=D.map(([e,a])=>{let x=esc(e);const c=e[0];if(/[A-Za-z]/.test(c))x='['+c.toUpperCase()+c.toLowerCase()+']'+x.slice(1);return[new RegExp('(?<![A-Za-z])'+x+'(?![A-Za-z\'’])','g'),a]});
const PR=new RegExp('(?<![A-Za-z\'’])(pawn|knight|bishop|rook|queen|king)(?![A-Za-z\'’])','g');
const tr=s=>{for(const[r,a]of RU)s=s.replace(r,a);for(const[r,a]of DR)s=s.replace(r,a);return s.replace(PR,m=>PN[m])};
let LG='en';try{LG=localStorage.getItem('chessLang')||'en'}catch(e){}
const O=new WeakMap();
function fix(n){const p=n.parentNode;if(!p||/^(SCRIPT|STYLE|TEXTAREA)$/.test(p.nodeName))return;const rec=O.get(n);
 if(LG==='ar'){if(rec&&n.data===rec.t)return;const t=tr(n.data);if(t!==n.data){O.set(n,{o:n.data,t});n.data=t}}else if(rec&&n.data===rec.t){n.data=rec.o;O.delete(n)}}
function walk(r){if(r.nodeType===3)return fix(r);if(r.nodeType!==1)return;const w=document.createTreeWalker(r,NodeFilter.SHOW_TEXT),L=[];let n;while(n=w.nextNode())L.push(n);L.forEach(fix)}
let Q=new Set(),raf=0;const flush=()=>{raf=0;const q=[...Q];Q=new Set();q.forEach(walk)};
new MutationObserver(ms=>{for(const m of ms){if(m.type==='characterData')Q.add(m.target);else m.addedNodes.forEach(n=>Q.add(n))}if(!raf)raf=requestAnimationFrame(flush)}).observe(document.body,{childList:true,subtree:true,characterData:true});
const css=document.createElement('style');css.textContent='#trp #bdw{direction:ltr}';document.head.appendChild(css);
function set(l){LG=l;try{localStorage.setItem('chessLang',l)}catch(e){}document.querySelectorAll('#hn,#st,#trp').forEach(e=>e.dir=l==='ar'?'rtl':'ltr');walk(document.body)}
const tb=Array.from(document.querySelectorAll('button')).find(b=>/Train/.test(b.textContent));
if(tb){const s=document.createElement('select');s.innerHTML='<option value="en">🌐 Explanations: English</option><option value="ar">🌐 لغة الشرح: العربية</option>';s.value=LG;s.onchange=()=>set(s.value);tb.parentNode.appendChild(s)}
window.LANGSET=set;set(LG);
})();
