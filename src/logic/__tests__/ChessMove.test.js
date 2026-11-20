import ChessMove from "../ChessMove";

const defaultMove = {
  boardSize: { width: 8, height: 8 },
};

test("Move pawn forward 1 space as white", () => {
  const chessMove = new ChessMove({
    ...defaultMove,
    source: { rowNumber: 6, columnNumber: 4 },
    target: { rowNumber: 5, columnNumber: 4 },
    piece: "p",
  });
  expect(chessMove.toPGN()).toBe("e3");
});

test("Move pawn forward 2 spaces as white", () => {
  const chessMove = new ChessMove({
    ...defaultMove,
    source: { rowNumber: 6, columnNumber: 4 },
    target: { rowNumber: 4, columnNumber: 4 },
    piece: "p",
  });
  expect(chessMove.toPGN()).toBe("e4");
});

test("Move pawn forward 1 space as black", () => {
  const chessMove = new ChessMove({
    ...defaultMove,
    source: { rowNumber: 1, columnNumber: 4 },
    target: { rowNumber: 2, columnNumber: 4 },
    piece: "P",
  });
  expect(chessMove.toPGN()).toBe("e6");
});

test("Move pawn forward 2 spaces as black", () => {
  const chessMove = new ChessMove({
    ...defaultMove,
    source: { rowNumber: 1, columnNumber: 4 },
    target: { rowNumber: 3, columnNumber: 4 },
    piece: "P",
  });
  expect(chessMove.toPGN()).toBe("e5");
});

test("Pawn capturing", () => {
  const chessMove = new ChessMove({
    ...defaultMove,
    source: { rowNumber: 1, columnNumber: 4 },
    target: { rowNumber: 2, columnNumber: 3 },
    piece: "P",
    capture: "q",
  });
  expect(chessMove.toPGN()).toBe("exd6");
});

test("Pawn en passant", () => {
  const chessMove = new ChessMove({
    ...defaultMove,
    source: { rowNumber: 1, columnNumber: 4 },
    target: { rowNumber: 2, columnNumber: 3 },
    piece: "P",
    capture: "q",
    enPassant: { rowNumber: 2, columnNumber: 4 },
  });
  expect(chessMove.toPGN()).toBe("exd6 e.p.");
});

test("Pawn promotion", () => {
  const chessMove = new ChessMove({
    ...defaultMove,
    source: { rowNumber: 6, columnNumber: 4 },
    target: { rowNumber: 7, columnNumber: 4 },
    piece: "P",
    promotion: "R",
  });
  expect(chessMove.toPGN()).toBe("e1=R");
});

test("Pawn capture & promotion", () => {
  const chessMove = new ChessMove({
    ...defaultMove,
    source: { rowNumber: 6, columnNumber: 3 },
    target: { rowNumber: 7, columnNumber: 4 },
    piece: "P",
    capture: "q",
    promotion: "R",
  });
  expect(chessMove.toPGN()).toBe("dxe1=R");
});

test("Queen move", () => {
  const chessMove = new ChessMove({
    ...defaultMove,
    source: { rowNumber: 6, columnNumber: 3 },
    target: { rowNumber: 4, columnNumber: 5 },
    piece: "Q",
  });
  expect(chessMove.toPGN()).toBe("Qd2f4");
});

test("Queen move, unique row", () => {
  const chessMove = new ChessMove({
    ...defaultMove,
    source: { rowNumber: 6, columnNumber: 3 },
    target: { rowNumber: 4, columnNumber: 5 },
    piece: "Q",
    rowUnique: true,
  });
  expect(chessMove.toPGN()).toBe("Qdf4");
});

test("Queen move, unique column", () => {
  const chessMove = new ChessMove({
    ...defaultMove,
    source: { rowNumber: 6, columnNumber: 3 },
    target: { rowNumber: 4, columnNumber: 5 },
    piece: "Q",
    columnUnique: true,
  });
  expect(chessMove.toPGN()).toBe("Q2f4");
});

test("Queen move, unique row and column", () => {
  const chessMove = new ChessMove({
    ...defaultMove,
    source: { rowNumber: 6, columnNumber: 3 },
    target: { rowNumber: 4, columnNumber: 5 },
    piece: "Q",
    rowUnique: true,
    columnUnique: true,
  });
  expect(chessMove.toPGN()).toBe("Qf4");
});

test("Queen move, check", () => {
  const chessMove = new ChessMove({
    ...defaultMove,
    source: { rowNumber: 6, columnNumber: 3 },
    target: { rowNumber: 4, columnNumber: 5 },
    piece: "Q",
    check: true,
  });
  expect(chessMove.toPGN()).toBe("Qd2f4+");
});

test("Queen move, checkmate", () => {
  const chessMove = new ChessMove({
    ...defaultMove,
    source: { rowNumber: 6, columnNumber: 3 },
    target: { rowNumber: 4, columnNumber: 5 },
    piece: "Q",
    check: true,
    finalMove: true,
  });
  expect(chessMove.toPGN()).toBe("Qd2f4#");
});

test("Castle king-side", () => {
  const chessMove = new ChessMove({
    ...defaultMove,
    source: { rowNumber: 0, columnNumber: 4 },
    target: { rowNumber: 0, columnNumber: 6 },
    piece: "K",
    castle: "K",
  });
  expect(chessMove.toPGN()).toBe("O-O");
});

test("Castle queen-side", () => {
  const chessMove = new ChessMove({
    ...defaultMove,
    source: { rowNumber: 0, columnNumber: 4 },
    target: { rowNumber: 0, columnNumber: 2 },
    piece: "K",
    castle: "Q",
  });
  expect(chessMove.toPGN()).toBe("O-O-O");
});
