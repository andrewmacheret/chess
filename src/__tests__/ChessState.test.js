import ChessState from "../ChessState";

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
