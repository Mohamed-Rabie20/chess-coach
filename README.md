# Chess Coach

Chess trainer / analyser (HTML + CSS + JavaScript, Stockfish WASM, packaged as an Android APK with Capacitor).

## Layout

```
index.html            page shell: markup + <link>/<script> tags (nothing else)
css/                  00-base · 01-look · 02-tabs · 03-report · 04-coach        (loaded in this order)
js/                   loaded in file-name order (classic scripts sharing one global scope)
  00-state            constants, board state, settings
  01-rules-engine     move generator, rules, built-in search
  02-coaching         short explanations for moves
  03-ui-board         board drawing and clicks
  04-stockfish        Stockfish worker bridge (+ early stop on a stable best move)
  05-move-ratings     rating names / colours
  06-game-flow        play, bots, review (rating each move), PGN/FEN, draw rules
  07-local-rating     Elo against the bots + games archive
  08..14              install prompt, service worker, animations, sounds
  15-data-openings    opening book (data)        16-data-puzzles   puzzles (data)
  17-train            Mistakes / Openings / Puzzles drills (use the main board)
  18-explain-language Arabic / English texts      19-why   "Why?" explanations + game report
  20-tabs             bottom tab bar (Play / Review / Train / More)
  21-coach-ui         coach bubble, live-analysis switch, Train-on-main-board glue
  22-analysis-speed   parallel Stockfish workers for game analysis
engine/config.js      written by the GitHub workflow (which Stockfish build is bundled)
tools/bundle.py       inlines everything into dist/index.html (one file)
tests/                Playwright tests + a mock UCI engine (see below)
.github/workflows/build-apk.yml   builds the APK (copies index.html, css/, js/)
```

Add new code as a new file in `js/` (or edit the matching one) and, if it is a new file, add its `<script>` tag to `index.html`.
**Flat layout (no folders)**: all css/js files can also sit next to `index.html` (the `<script src>` / `<link href>` paths then have no `js/` / `css/` prefix). The workflow copies them from the repo root.
The old single-file layout still builds: if only `index.html` is in the repo (a bundled one) the workflow copies just that.

## Tests (need `pip install playwright && playwright install chromium`)

```
python3 tests/suite.py   $PWD/index.html     # rules (perft), draws, tabs, Train, mistakes, report
python3 tests/toggle.py  $PWD/index.html     # live analysis on/off
python3 tests/trynav.py  $PWD/index.html     # tried moves: ◀ ▶ walk through them, arrows, coach bubble height
python3 tests/playbar.py $PWD/index.html     # Play action row (Undo · Best · Coach · analysis · ⋯), options, tab layouts
python3 tests/speed.py 300                   # analysis speed with a simulated engine (300 ms per search)
python3 tools/bundle.py && python3 tests/suite.py $PWD/dist/index.html
```
