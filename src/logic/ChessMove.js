// immutable class
export default class ChessMove {
  constructor({
    // absolutely necessary information
    source, // source square
    target, // target square
    promotion = null, // piece to promote to
    // information that can be derived if the game state is known
    // or is otherwise really helpful and reduces required computation
    piece, // the piece that was moved
    capture = null, // the piece that was captured
    enPassant = null, // square of the en passant
    castle = null, // side of the castle: k or q or K or Q
    rowUnique = false, // whether it's the only piece who could move to this row
    columnUnique = false, // whether it's the only piece who could move to this column
    check = false, // opponent in check?
    finalMove = false, // game over?
    boardSize, // board size object
    // not used here, but used elsewhere
    player, // which player
    secondaryMove = null, // secondary move, used for rook when castling
  }) {
    this.source = source;
    this.target = target;
    this.piece = piece;
    this.boardSize = boardSize;
    this.player = player;
    this.promotion = promotion;
    this.capture = capture;
    this.enPassant = enPassant;
    this.castle = castle;
    this.rowUnique = rowUnique;
    this.columnUnique = columnUnique;
    this.check = check;
    this.finalMove = finalMove;
    this.secondaryMove = secondaryMove;
  }

  toPGN() {
    // PGN algabraic notation

    // castle
    if (this.castle) {
      return this.castle.toUpperCase() === "K" ? "O-O" : "O-O-O";
    }

    let move = "";

    // source (...algabraic notation is really annoying)
    const piece = this.piece.toUpperCase();
    if (piece === "P") {
      // NEVER specify letter
      // NEVER specify a row
      // SOMETIMES specify column, but only if changing columns
      if (this.source.columnNumber !== this.target.columnNumber) {
        move += this.getColumn(this.source.columnNumber);
      }
    } else {
      const column = this.getColumn(this.source.columnNumber);
      const row = this.getRow(this.source.rowNumber);
      if (this.rowUnique && this.columnUnique) {
        // this is a unique piece... no need for source
        move += piece;
      } else if (this.rowUnique) {
        // the row is unique but the column is not... we need to specify the column
        move += piece + column;
      } else if (this.columnUnique) {
        // the column is unique but the row is not... we need to specify the row
        move += piece + row;
      } else {
        move += piece + column + row;
      }
    }

    // capture
    if (this.capture) {
      move += "x";
    }

    // target
    move += this.getColumn(this.target.columnNumber);
    move += this.getRow(this.target.rowNumber);

    // promotion
    if (this.promotion) {
      move += "=" + this.promotion.toUpperCase();
    }

    if (this.enPassant) {
      move += " e.p.";
    }

    // check and checkmate
    if (this.check) {
      if (this.finalMove) {
        move += "#";
      } else {
        move += "+";
      }
    }

    return move;
  }

  getRow(rowNumber) {
    return String.fromCharCode(
      "1".charCodeAt(0) + (this.boardSize.height - rowNumber - 1)
    );
  }

  getColumn(columnNumber) {
    return String.fromCharCode("a".charCodeAt(0) + columnNumber);
  }
}
