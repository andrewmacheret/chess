import { getSetting } from "../settings";

export default class ChessComputer {
  isHuman() {
    return false;
  }

  async requestMove(fen, retries = 3) {
    try {
      const url = await getSetting("chess.movesUrl");
      const data = await fetch(`${url}?${new URLSearchParams({ fen })}`);
      const json = await data.json();
      if (json && json.bestmove !== "(none)") {
        const source = json.bestmove.substring(0, 2);
        const target = json.bestmove.substring(2, 4);
        const promotion = json.bestmove.substring(4, 5).toLowerCase();
        return { source, target, promotion };
      }
    } catch (err) {
      console.error(err);
      //if (window.confirm(`Unexpected error: ${err} - retry?`)) {
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
