// Stockfish running in the browser in a web worker.
// Vite copies both files into assets/ with a hash in their names.
import engineUrl from "stockfish/bin/stockfish-19-lite-single.js?url";
import wasmUrl from "stockfish/bin/stockfish-19-lite-single.wasm?url";

const maxMillis = 3000;

let worker = null;
let listener = null;
let searching = false;
let queue = Promise.resolve();

const getWorker = () => {
  if (!worker) {
    // the engine reads where its .wasm file is from the part after the #
    const wasmHref = new URL(wasmUrl, window.location.href).href;
    worker = new Worker(`${engineUrl}#${encodeURIComponent(wasmHref)}`);
    worker.onmessage = (event) => listener?.(event.data);
    worker.onerror = (event) => {
      console.error("Stockfish worker error", event.message);
      resetWorker();
    };
  }
  return worker;
};

const resetWorker = () => {
  worker?.terminate();
  worker = null;
};

// start downloading the engine before anyone needs it
export const preloadLocalEngine = () => {
  getWorker();
};

const search = (fen, depth) =>
  new Promise((resolve, reject) => {
    const engine = getWorker();
    searching = true;

    const finish = () => {
      clearTimeout(giveUp);
      listener = null;
      searching = false;
    };

    // a crash inside the worker doesn't always fire onerror, so don't wait forever
    const giveUp = setTimeout(() => {
      finish();
      resetWorker();
      reject(new Error(`Stockfish gave no move after ${maxMillis + 2000} ms`));
    }, maxMillis + 2000);

    listener = (line) => {
      // 'bestmove g1f3 ponder g8f6'
      if (typeof line === "string" && line.startsWith("bestmove")) {
        finish();
        resolve(line.split(/ +/)[1]);
      }
    };

    engine.postMessage("ucinewgame");
    engine.postMessage(`position fen ${fen}`);
    // stops at whichever comes first: the depth or the time limit
    engine.postMessage(`go depth ${depth} movetime ${maxMillis}`);
  });

// returns a move like 'e2e4' or 'a7a8q', or '(none)' if there are no legal moves
export const getLocalBestMove = (fen, depth = 16) => {
  // one search at a time, and a newer request makes the old one finish early
  if (searching) {
    worker?.postMessage("stop");
  }
  const result = queue.then(() => search(fen, depth));
  queue = result.catch(() => {});
  return result;
};
