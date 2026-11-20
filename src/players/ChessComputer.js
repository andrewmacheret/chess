import { getSetting } from "../settings";
import { getLocalBestMove, preloadLocalEngine } from "./localEngine";

export const preloadEngine = preloadLocalEngine;

export default class ChessComputer {
  isHuman() {
    return false;
  }

  async requestMove(fen, retries = 3) {
    try {
      const bestmove = await getLocalBestMove(fen, await getSetting("depth"));
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
