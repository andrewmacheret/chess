export default class ChessHuman {
  isHuman() {
    return true;
  }

  async requestMove(fen) {
    // do nothing... wait for the human to drag or click a piece
    return {};
  }

  choosePromotion(source, target, choices) {
    // lets do this the easy way for now
    while (true) {
      const choice = prompt(
        `Choose one of the following promotion options:\n${choices.join(", ")}`,
        choices[choices.length - 1]
      );

      // user chose to cancel
      if (!choice) {
        return null;
      }

      // user chose a valid option, we're done, otherwise try again
      if (choices.indexOf(choice) >= 0) {
        return { source, target, promotion: choice };
      }
    }
  }
}
