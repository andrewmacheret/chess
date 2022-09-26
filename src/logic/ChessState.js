export default class ChessState {
  #fields = {};

  #lastChessState = null;

  #BOARD_SIZE = { width: 8, height: 8 };

  static #START_FEN =
    "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";

  #VALID_PIECES = "rnbqkpRNBQKP";

  #VALID_CASTLE_SIDES = "KQkq";

  #VALID_PLAYERS = "wb";

  #_a = "a".charCodeAt();
  #_1 = "1".charCodeAt();

  static copy(chessState) {
    return new ChessState().#copy(chessState);
  }

  static starting() {
    return new ChessState().#fromFen(this.#START_FEN);
  }

  static fromFen(fen) {
    return new ChessState().#fromFen(fen);
  }

  #assertSquareInBounds(square) {
    if (!this.inBounds(square)) {
      throw Error(JSON.stringify(square) + " is not in bounds");
    }
  }

  #assertSquareNotEmpty(square) {
    if (!this.#fields.pieces[square.rowNumber][square.columnNumber]) {
      throw Error(JSON.stringify(square) + " is empty");
    }
  }

  #assertPieceValid(piece) {
    if (this.#VALID_PIECES.indexOf(piece) < 0) {
      throw Error(
        "Must add a valid piece (Valid pieces: " +
          JSON.stringify(this.#VALID_PIECES) +
          ")"
      );
    }
  }

  #assertCastleValid(side) {
    if (this.#VALID_CASTLE_SIDES.indexOf(side) < 0) {
      throw Error(
        "Must specify a valid castle side (Valid castle sides: " +
          JSON.stringify(this.#VALID_CASTLE_SIDES) +
          ")"
      );
    }
  }

  #assertPlayerValid(player) {
    if (this.#VALID_PLAYERS.indexOf(player) < 0) {
      throw Error(
        "Must set a valid player (Valid players: " +
          JSON.stringify(this.#VALID_PLAYERS) +
          ")"
      );
    }
  }

  #assertMoveSpecified(move) {
    if (!move) {
      throw Error("move must be specified");
    }
  }

  getPiece(square) {
    this.#assertSquareInBounds(square);

    return this.#fields.pieces[square.rowNumber][square.columnNumber];
  }

  removePiece(square) {
    this.#assertSquareInBounds(square);
    this.#assertSquareNotEmpty(square);

    const oldPiece = this.#fields.pieces[square.rowNumber][square.columnNumber];

    this.#fields.pieces[square.rowNumber][square.columnNumber] = null;

    return oldPiece;
  }

  addPiece(square, piece) {
    this.#assertSquareInBounds(square);
    this.#assertPieceValid(piece);

    this.#fields.pieces[square.rowNumber][square.columnNumber] = piece;
  }

  getCastle(side) {
    this.#assertCastleValid(side);

    return this.#fields.castles[side];
  }

  setCastle(side, allowed) {
    this.#assertCastleValid(side);

    this.#fields.castles[side] = Boolean(allowed);
  }

  getEnPassant() {
    return this.#fields.enPassant;
  }

  setEnPassant(square) {
    this.#assertSquareInBounds(square);

    this.#fields.enPassant = square;
  }

  resetEnPassant() {
    this.#fields.enPassant = null;
  }

  incrementHalfMoves() {
    this.#fields.halfMoves += 1;
  }

  resetHalfMoves() {
    this.#fields.halfMoves = 0;
  }

  incrementMoveNumber() {
    this.#fields.moveNumber += 1;
  }

  resetMoveNumber() {
    this.#fields.moveNumber = 0;
  }

  isPromoting() {
    return this.#fields.promoting;
  }

  setPromoting(promoting) {
    this.#fields.promoting = Boolean(promoting);
  }

  setPlayer(player) {
    this.#assertPlayerValid(player);

    this.#fields.player = player;
  }

  getPlayer() {
    return this.#fields.player;
  }

  getPlayers() {
    return this.#VALID_PLAYERS.split("");
  }

  getMoves(player) {
    this.#assertPlayerValid(player);

    return this.#fields.moves[player];
  }

  addMove(player, move) {
    this.#assertPlayerValid(player);
    this.#assertMoveSpecified(move);

    this.#fields.lastMove = move;
    this.#fields.moves[player].push(move);
  }

  resetMoves() {
    this.#fields.moves = {};
    this.#VALID_PLAYERS.split("").forEach((player) => {
      this.#fields.moves[player] = [];
    });
    this.#fields.lastMove = null;
  }

  getLastMove() {
    return this.#fields.lastMove;
  }

  getCaptured(player) {
    this.#assertPlayerValid(player);

    return this.#fields.captured[player];
  }

  addCaptured(player, piece) {
    this.#assertPlayerValid(player);
    this.#assertPieceValid(piece);

    this.#fields.captured[player].push(piece);
  }

  resetCaptured() {
    this.#fields.captured = {};
    this.#VALID_PLAYERS.split("").forEach((player) => {
      this.#fields.captured[player] = [];
    });
  }

  getBoardSize() {
    return this.#fields.boardSize;
  }

  getHalfMoves() {
    return this.#fields.halfMoves;
  }

  getMoveNumber() {
    return this.#fields.moveNumber;
  }

  inBounds(square) {
    const boardSize = this.#fields.boardSize;
    return (
      square.rowNumber >= 0 &&
      square.rowNumber < boardSize.height &&
      square.columnNumber >= 0 &&
      square.columnNumber < boardSize.width
    );
  }

  #copy(chessState) {
    // clone all fields the easy way
    this.#fields = JSON.parse(JSON.stringify(chessState.#fields));

    // manually clone moves and lastMoves as immutable references
    this.#fields.moves = Object.fromEntries(
      Object.entries(chessState.#fields.moves).map(([p, m]) => [p, [...m]])
    );
    this.#fields.lastMove = chessState.#fields.lastMove;

    this.#lastChessState = chessState;
    return this;
  }

  getLastState() {
    return this.#lastChessState;
  }

  isSamePosition(chessState) {
    const boardSize = this.#fields.boardSize;
    for (let rowNumber = 0; rowNumber < boardSize.height; rowNumber++) {
      for (
        let columnNumber = 0;
        columnNumber < boardSize.width;
        columnNumber++
      ) {
        const source = { rowNumber: rowNumber, columnNumber: columnNumber };
        if (this.getPiece(source) !== chessState.getPiece(source)) {
          return false;
        }
      }
    }
    return true;
  }

  initBasicFields() {
    this.#fields.boardSize = this.#BOARD_SIZE;
    this.setPromoting(false);
    this.resetMoves();
    this.resetCaptured();
  }

  #fromFen(fen) {
    const fenParts = fen.split(" ");

    // init basic fields that are always the same at the start of a game
    this.initBasicFields();

    // init everything given by the fen string
    this.#fields.fen = fen;
    this.#fields.pieces = this.#fromFenPieces(fenParts[0]);
    this.#fields.player = this.#fromFenPlayer(fenParts[1]);
    this.#fields.castles = this.#fromFenCastles(fenParts[2]);
    this.#fields.enPassant = this.#fromFenEnPassant(fenParts[3]);
    this.#fields.halfMoves = this.#fromFenHalfMoves(fenParts[4]);
    this.#fields.moveNumber = this.#fromFenMoveNumber(fenParts[5]);

    return this;
  }

  #fromFenPieces(fenPart) {
    return fenPart.split("/").map((fenRow) =>
      fenRow
        .split("")
        .map((c) => (isNaN(c) ? [c] : Array(Number(c)).fill(null)))
        .flat()
    );
  }

  #fromFenCastles(fenPart) {
    return Object.fromEntries(
      this.#VALID_CASTLE_SIDES
        .split("")
        .map((side) => [side, fenPart.indexOf(side) >= 0])
    );
  }

  #fromFenEnPassant(fenPart) {
    if (fenPart === "-") {
      return null;
    }
    const { height } = this.getBoardSize();
    const rowNumber = height - (fenPart.charCodeAt(1) - this.#_1) - 1;
    const columnNumber = fenPart.charCodeAt(0) - this.#_a;
    return { rowNumber, columnNumber };
  }

  #fromFenPlayer(fenPart) {
    return fenPart;
  }

  #fromFenHalfMoves(fenPart) {
    return Number(fenPart);
  }

  #fromFenMoveNumber(fenPart) {
    return Number(fenPart);
  }

  toFen() {
    return [
      this.toFenPieces(),
      this.toFenPlayer(),
      this.toFenCastles(),
      this.toFenEnPassant(),
      this.toFenHalfMoves(),
      this.toFenMoveNumber(),
    ].join(" ");
  }

  toFenPieces() {
    return this.#fields.pieces
      .map((pieceRow) => {
        const row = [];
        let last = 0;
        pieceRow.forEach((piece) => {
          if (!piece) {
            if (last > 0) {
              row.pop();
            }
            row.push((++last).toString());
          } else {
            row.push(piece);
            last = 0;
          }
        });
        return row.join("");
      })
      .join("/");
  }

  toFenPlayer() {
    return this.getPlayer();
  }

  toFenCastles() {
    return (
      this.#VALID_CASTLE_SIDES
        .split("")
        .filter((side) => this.getCastle(side))
        .join("") || "-"
    );
  }

  toFenEnPassant() {
    const enPassant = this.getEnPassant();
    if (!enPassant) {
      return "-";
    }

    const { height } = this.getBoardSize();
    const row = String.fromCharCode(this.#_a + enPassant.columnNumber);
    const column = String.fromCharCode(
      this.#_1 + (height - enPassant.rowNumber - 1)
    );
    return row + column;
  }

  toFenHalfMoves() {
    return this.getHalfMoves().toString();
  }

  toFenMoveNumber() {
    return this.getMoveNumber().toString();
  }
}
