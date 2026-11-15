# Third-party software and data

Chess Coach uses the following. Each keeps its own license.

| Component | Used for | License |
|---|---|---|
| [Stockfish](https://stockfishchess.org/) (WebAssembly build from [nmrugg/stockfish.js](https://github.com/nmrugg/stockfish.js)) | the chess engine that analyses games and plays the computer opponent | GNU GPL v3 |
| [lichess-org/chess-openings](https://github.com/lichess-org/chess-openings) | opening names and lines (the opening book) | CC0 (public domain) |
| [Capacitor](https://capacitorjs.com/) | packaging the web app as an Android APK | MIT |
| [Lichess puzzle database](https://database.lichess.org/#puzzles) | the Puzzles tab (position, solution, rating and theme) | CC0 (public domain) |
| Optional sound files (`*.mp3`) | move, capture and castle sounds | taken from the Chess.com community; they belong to their owners and are **not** covered by this project's license. The app also has its own built-in sounds and works without these files; remove them if you redistribute the app |

Because Stockfish is licensed under the GPL v3, this repository is public so that its source is available. If you redistribute the app, keep this notice and offer the source code as the GPL requires.

Chess.com, Lichess and Stockfish are trademarks or projects of their owners. This app is not affiliated with any of them.
