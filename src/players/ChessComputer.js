import { getSetting } from "../settings";
import { getLocalBestMove, preloadLocalEngine } from "./localEngine";
import { getServerBestMove } from "./serverEngine";

// "local" runs stockfish in the browser, "server" asks the Lambda.
// ?engine=local or ?engine=server in the page URL wins over app.json.
export const getEngineType = async () =>
  new URLSearchParams(window.location.search).get("engine") ||
  (await getSetting("engine")) ||
  "local";

export const preloadEngine = async () => {
  if ((await getEngineType()) === "local") {
    preloadLocalEngine();
  }
};

const getBestMove = async (fen) => {
  const depth = await getSetting("depth");
  const movesUrl = await getSetting("movesUrl");
  if ((await getEngineType()) === "local") {
    try {
      return await getLocalBestMove(fen, depth);
    } catch (err) {
      if (!movesUrl) {
        throw err;
      }
      console.error("Local engine failed, asking the server instead", err);
    }
  }
  return await getServerBestMove(movesUrl, fen, depth);
};

export default class ChessComputer {
  isHuman() {
    return false;
  }

  async requestMove(fen, retries = 3) {
    try {
      const bestmove = await getBestMove(fen);
      if (bestmove !== "(none)") {
        const source = bestmove.substring(0, 2);
        const target = bestmove.substring(2, 4);
        const promotion = bestmove.substring(4, 5).toLowerCase();
        return { source, target, promotion };
      }
    } catch (err) {
      console.error(err);
      if (retries > 0) {
        // retry the request
        return await this.requestMove(fen, retries - 1);
      }
      throw err;
    }
  }

  choosePromotion(sourceSquare, targetSquare, choices, callback) {
    // this shouldn't happen - throw an error
    throw Error("Unexpected promotion choice.");
  }
}
