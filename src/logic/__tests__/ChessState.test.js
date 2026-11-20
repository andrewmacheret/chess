import ChessState from "../ChessState";
import { getGameStatus, performMove } from "../ChessRules";

test("ChessState is creatable from start state", () => {
  const chessState = ChessState.starting();
  expect(chessState.toFen()).toBe(
    "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"
  );
});

test("ChessState is copyable", () => {
  const chessState = ChessState.copy(ChessState.starting());
  expect(chessState.toFen()).toBe(
    "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"
  );
});

[
  "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
  "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1",
  "rnbqkbnr/pp1ppppp/8/2p5/4P3/8/PPPP1PPP/RNBQKBNR w KQkq c6 0 2",
  "rnbqkbnr/pp1ppppp/8/2p5/4P3/5N2/PPPP1PPP/RNBQKB1R b KQkq - 1 2",
  "8/4npk1/5p1p/1Q5P/1p4P1/4r3/7q/3K1R2 b - - 1 49",
  "5r1k/6pp/4Qpb1/p7/8/6PP/P4PK1/3q4 b - - 4 37",
  "8/8/2P5/4B3/1Q6/4K3/6P1/3k4 w - - 5 67",
  "r2q1rk1/pp2ppbp/2p2np1/6B1/3PP1b1/Q1P2N2/P4PPP/3RKB1R b K - 0 13",
  "8/5k2/3p4/1p1Pp2p/pP2Pp1P/P4P1K/8/8 b - - 99 50",
].forEach((fen) => {
  test(`Round trip test: ${fen}`, () => {
    expect(ChessState.fromFen(fen).toFen()).toBe(fen);
  });
  test(`Round trip copy test: ${fen}`, () => {
    expect(ChessState.copy(ChessState.fromFen(fen)).toFen()).toBe(fen);
  });
});

test("FEN en passant square is the square the pawn skipped", () => {
  const { legalMoves } = getGameStatus(ChessState.starting());
  const e2e4 = legalMoves.find(
    ({ source, target }) =>
      source.rowNumber === 6 &&
      source.columnNumber === 4 &&
      target.rowNumber === 4
  );
  expect(performMove(ChessState.starting(), e2e4).toFen()).toBe(
    "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1"
  );
});

test("en passant capture is legal after loading a FEN", () => {
  // black just played d7d5 next to the white pawn on e5
  const chessState = ChessState.fromFen(
    "rnbqkbnr/ppp1pppp/8/3pP3/8/8/PPPP1PPP/RNBQKBNR w KQkq d6 0 2"
  );
  const { legalMoves } = getGameStatus(chessState);
  const exd6 = legalMoves.find((move) => move.enPassant);
  expect(exd6.toPGN()).toBe("exd6 e.p.");
  expect(performMove(chessState, exd6).toFen()).toBe(
    "rnbqkbnr/ppp1pppp/3P4/8/8/8/PPPP1PPP/RNBQKBNR b KQkq - 0 2"
  );
});
