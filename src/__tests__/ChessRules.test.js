import ChessState from "../ChessState";
import { getGameStatus, performMove } from "../ChessRules";
import ChessMove from "../ChessMove";

const boardSize = { height: 8, width: 8 };

test("getGameStatus for initial game state", () => {
  const status = getGameStatus(ChessState.starting());
  expect(status).toStrictEqual({
    gameOver: false,
    legalMoves: [
      new ChessMove({
        boardSize,
        columnUnique: true,
        piece: "P",
        player: "w",
        rowUnique: true,
        source: { columnNumber: 0, rowNumber: 6 },
        target: { columnNumber: 0, rowNumber: 5 },
      }),
      new ChessMove({
        boardSize,
        columnUnique: true,
        piece: "P",
        player: "w",
        rowUnique: true,
        source: { columnNumber: 0, rowNumber: 6 },
        target: { columnNumber: 0, rowNumber: 4 },
      }),
      new ChessMove({
        boardSize,
        columnUnique: true,
        piece: "P",
        player: "w",
        rowUnique: true,
        source: { columnNumber: 1, rowNumber: 6 },
        target: { columnNumber: 1, rowNumber: 5 },
      }),
      new ChessMove({
        boardSize,
        columnUnique: true,
        piece: "P",
        player: "w",
        rowUnique: true,
        source: { columnNumber: 1, rowNumber: 6 },
        target: { columnNumber: 1, rowNumber: 4 },
      }),
      new ChessMove({
        boardSize,
        columnUnique: true,
        piece: "P",
        player: "w",
        rowUnique: true,
        source: { columnNumber: 2, rowNumber: 6 },
        target: { columnNumber: 2, rowNumber: 5 },
      }),
      new ChessMove({
        boardSize,
        columnUnique: true,
        piece: "P",
        player: "w",
        rowUnique: true,
        source: { columnNumber: 2, rowNumber: 6 },
        target: { columnNumber: 2, rowNumber: 4 },
      }),
      new ChessMove({
        boardSize,
        columnUnique: true,
        piece: "P",
        player: "w",
        rowUnique: true,
        source: { columnNumber: 3, rowNumber: 6 },
        target: { columnNumber: 3, rowNumber: 5 },
      }),
      new ChessMove({
        boardSize,
        columnUnique: true,
        piece: "P",
        player: "w",
        rowUnique: true,
        source: { columnNumber: 3, rowNumber: 6 },
        target: { columnNumber: 3, rowNumber: 4 },
      }),
      new ChessMove({
        boardSize,
        columnUnique: true,
        piece: "P",
        player: "w",
        rowUnique: true,
        source: { columnNumber: 4, rowNumber: 6 },
        target: { columnNumber: 4, rowNumber: 5 },
      }),
      new ChessMove({
        boardSize,
        columnUnique: true,
        piece: "P",
        player: "w",
        rowUnique: true,
        source: { columnNumber: 4, rowNumber: 6 },
        target: { columnNumber: 4, rowNumber: 4 },
      }),
      new ChessMove({
        boardSize,
        columnUnique: true,
        piece: "P",
        player: "w",
        rowUnique: true,
        source: { columnNumber: 5, rowNumber: 6 },
        target: { columnNumber: 5, rowNumber: 5 },
      }),
      new ChessMove({
        boardSize,
        columnUnique: true,
        piece: "P",
        player: "w",
        rowUnique: true,
        source: { columnNumber: 5, rowNumber: 6 },
        target: { columnNumber: 5, rowNumber: 4 },
      }),
      new ChessMove({
        boardSize,
        columnUnique: true,
        piece: "P",
        player: "w",
        rowUnique: true,
        source: { columnNumber: 6, rowNumber: 6 },
        target: { columnNumber: 6, rowNumber: 5 },
      }),
      new ChessMove({
        boardSize,
        columnUnique: true,
        piece: "P",
        player: "w",
        rowUnique: true,
        source: { columnNumber: 6, rowNumber: 6 },
        target: { columnNumber: 6, rowNumber: 4 },
      }),
      new ChessMove({
        boardSize,
        columnUnique: true,
        piece: "P",
        player: "w",
        rowUnique: true,
        source: { columnNumber: 7, rowNumber: 6 },
        target: { columnNumber: 7, rowNumber: 5 },
      }),
      new ChessMove({
        boardSize,
        columnUnique: true,
        piece: "P",
        player: "w",
        rowUnique: true,
        source: { columnNumber: 7, rowNumber: 6 },
        target: { columnNumber: 7, rowNumber: 4 },
      }),
      new ChessMove({
        boardSize,
        columnUnique: true,
        piece: "N",
        player: "w",
        rowUnique: true,
        source: { columnNumber: 1, rowNumber: 7 },
        target: { columnNumber: 0, rowNumber: 5 },
      }),
      new ChessMove({
        boardSize,
        columnUnique: true,
        piece: "N",
        player: "w",
        rowUnique: true,
        source: { columnNumber: 1, rowNumber: 7 },
        target: { columnNumber: 2, rowNumber: 5 },
      }),
      new ChessMove({
        boardSize,
        columnUnique: true,
        piece: "N",
        player: "w",
        rowUnique: true,
        source: { columnNumber: 6, rowNumber: 7 },
        target: { columnNumber: 5, rowNumber: 5 },
      }),
      new ChessMove({
        boardSize,
        columnUnique: true,
        piece: "N",
        player: "w",
        rowUnique: true,
        source: { columnNumber: 6, rowNumber: 7 },
        target: { columnNumber: 7, rowNumber: 5 },
      }),
    ],
    message: "White to move",
    reason: null,
    winner: null,
  });
});

test("getGameStatus for an upcoming checkmate", () => {
  const chessState = ChessState.fromFen(
    "3b1q1q/1N2PRQ1/rR3KBr/B4PP1/2Pk1r1b/1P4N1/2P1PP2/8 w - -"
  );
  // chessState.addMove(
  //   new Move({
  //     boardSize,
  //     columnUnique: true,
  //     piece: "N",
  //     player: "w",
  //     rowUnique: true,
  //     source: { columnNumber: 6, rowNumber: 7 },
  //     target: { columnNumber: 7, rowNumber: 5 },
  //   })
  // );
  expect(getGameStatus(chessState)).toStrictEqual({
    legalMoves: [
      new ChessMove({
        source: { rowNumber: 1, columnNumber: 1 },
        target: { rowNumber: 2, columnNumber: 3 },
        piece: "N",
        boardSize,
        player: "w",
        enPassant: null,
        rowUnique: true,
        columnUnique: true,
        check: true,
      }),
      new ChessMove({
        source: { rowNumber: 1, columnNumber: 1 },
        target: { rowNumber: 3, columnNumber: 2 },
        piece: "N",
        boardSize,
        player: "w",
        enPassant: null,
        rowUnique: true,
        columnUnique: true,
        check: true,
      }),
      new ChessMove({
        source: { rowNumber: 1, columnNumber: 1 },
        target: { rowNumber: 0, columnNumber: 3 },
        piece: "N",
        boardSize,
        player: "w",
        capture: "b",
        enPassant: null,
        rowUnique: true,
        columnUnique: true,
        check: true,
      }),
      new ChessMove({
        source: { rowNumber: 1, columnNumber: 4 },
        target: { rowNumber: 0, columnNumber: 3 },
        piece: "P",
        boardSize,
        player: "w",
        promotion: "R",
        capture: "b",
        enPassant: null,
        rowUnique: false,
        columnUnique: true,
        check: true,
        finalMove: true,
      }),
      new ChessMove({
        source: { rowNumber: 1, columnNumber: 4 },
        target: { rowNumber: 0, columnNumber: 3 },
        piece: "P",
        boardSize,
        player: "w",
        promotion: "N",
        capture: "b",
        enPassant: null,
        rowUnique: false,
        columnUnique: true,
        check: true,
      }),
      new ChessMove({
        source: { rowNumber: 1, columnNumber: 4 },
        target: { rowNumber: 0, columnNumber: 3 },
        piece: "P",
        boardSize,
        player: "w",
        promotion: "B",
        capture: "b",
        enPassant: null,
        rowUnique: false,
        columnUnique: true,
        check: true,
      }),
      new ChessMove({
        source: { rowNumber: 1, columnNumber: 4 },
        target: { rowNumber: 0, columnNumber: 3 },
        piece: "P",
        boardSize,
        player: "w",
        promotion: "Q",
        capture: "b",
        enPassant: null,
        rowUnique: false,
        columnUnique: true,
        check: true,
        finalMove: true,
      }),
      new ChessMove({
        source: { rowNumber: 1, columnNumber: 5 },
        target: { rowNumber: 0, columnNumber: 5 },
        piece: "R",
        boardSize,
        player: "w",
        capture: "q",
        enPassant: null,
        rowUnique: true,
        columnUnique: true,
        check: true,
      }),
      new ChessMove({
        source: { rowNumber: 1, columnNumber: 6 },
        target: { rowNumber: 0, columnNumber: 7 },
        piece: "Q",
        boardSize,
        player: "w",
        capture: "q",
        enPassant: null,
        rowUnique: true,
        columnUnique: true,
        check: true,
      }),
      new ChessMove({
        source: { rowNumber: 2, columnNumber: 1 },
        target: { rowNumber: 2, columnNumber: 2 },
        piece: "R",
        boardSize,
        player: "w",
        enPassant: null,
        rowUnique: true,
        columnUnique: true,
        check: true,
      }),
      new ChessMove({
        source: { rowNumber: 2, columnNumber: 1 },
        target: { rowNumber: 2, columnNumber: 3 },
        piece: "R",
        boardSize,
        player: "w",
        enPassant: null,
        rowUnique: true,
        columnUnique: true,
        check: true,
        finalMove: true,
      }),
      new ChessMove({
        source: { rowNumber: 2, columnNumber: 1 },
        target: { rowNumber: 2, columnNumber: 4 },
        piece: "R",
        boardSize,
        player: "w",
        enPassant: null,
        rowUnique: true,
        columnUnique: true,
        check: true,
      }),
      new ChessMove({
        source: { rowNumber: 2, columnNumber: 1 },
        target: { rowNumber: 2, columnNumber: 0 },
        piece: "R",
        boardSize,
        player: "w",
        capture: "r",
        enPassant: null,
        rowUnique: true,
        columnUnique: true,
        check: true,
      }),
      new ChessMove({
        source: { rowNumber: 2, columnNumber: 5 },
        target: { rowNumber: 2, columnNumber: 4 },
        piece: "K",
        boardSize,
        player: "w",
        enPassant: null,
        rowUnique: true,
        columnUnique: true,
        check: true,
        finalMove: true,
      }),
      new ChessMove({
        source: { rowNumber: 3, columnNumber: 0 },
        target: { rowNumber: 4, columnNumber: 1 },
        piece: "B",
        boardSize,
        player: "w",
        enPassant: null,
        rowUnique: true,
        columnUnique: true,
        check: true,
      }),
      new ChessMove({
        source: { rowNumber: 3, columnNumber: 0 },
        target: { rowNumber: 5, columnNumber: 2 },
        piece: "B",
        boardSize,
        player: "w",
        enPassant: null,
        rowUnique: true,
        columnUnique: true,
        check: true,
        finalMove: true,
      }),
      new ChessMove({
        source: { rowNumber: 3, columnNumber: 0 },
        target: { rowNumber: 6, columnNumber: 3 },
        piece: "B",
        boardSize,
        player: "w",
        enPassant: null,
        rowUnique: true,
        columnUnique: true,
        check: true,
      }),
      new ChessMove({
        source: { rowNumber: 3, columnNumber: 0 },
        target: { rowNumber: 7, columnNumber: 4 },
        piece: "B",
        boardSize,
        player: "w",
        enPassant: null,
        rowUnique: true,
        columnUnique: true,
        check: true,
      }),
      new ChessMove({
        source: { rowNumber: 3, columnNumber: 6 },
        target: { rowNumber: 2, columnNumber: 5 },
        piece: "P",
        boardSize,
        player: "w",
        capture: "K",
        enPassant: null,
        rowUnique: true,
        columnUnique: true,
        check: false,
      }),
      new ChessMove({
        source: { rowNumber: 4, columnNumber: 2 },
        target: { rowNumber: 3, columnNumber: 2 },
        piece: "P",
        boardSize,
        player: "w",
        enPassant: null,
        rowUnique: true,
        columnUnique: true,
        check: true,
      }),
      new ChessMove({
        source: { rowNumber: 5, columnNumber: 1 },
        target: { rowNumber: 4, columnNumber: 1 },
        piece: "P",
        boardSize,
        player: "w",
        enPassant: null,
        rowUnique: true,
        columnUnique: true,
        check: true,
      }),
      new ChessMove({
        source: { rowNumber: 5, columnNumber: 1 },
        target: { rowNumber: 4, columnNumber: 2 },
        piece: "P",
        boardSize,
        player: "w",
        capture: "P",
        enPassant: null,
        rowUnique: true,
        columnUnique: true,
        check: true,
      }),
      new ChessMove({
        source: { rowNumber: 5, columnNumber: 6 },
        target: { rowNumber: 7, columnNumber: 7 },
        piece: "N",
        boardSize,
        player: "w",
        enPassant: null,
        rowUnique: true,
        columnUnique: true,
        check: true,
      }),
      new ChessMove({
        source: { rowNumber: 5, columnNumber: 6 },
        target: { rowNumber: 7, columnNumber: 5 },
        piece: "N",
        boardSize,
        player: "w",
        enPassant: null,
        rowUnique: true,
        columnUnique: true,
        check: true,
      }),
      new ChessMove({
        source: { rowNumber: 5, columnNumber: 6 },
        target: { rowNumber: 4, columnNumber: 4 },
        piece: "N",
        boardSize,
        player: "w",
        enPassant: null,
        rowUnique: true,
        columnUnique: true,
        check: true,
      }),
      new ChessMove({
        source: { rowNumber: 5, columnNumber: 6 },
        target: { rowNumber: 3, columnNumber: 7 },
        piece: "N",
        boardSize,
        player: "w",
        enPassant: null,
        rowUnique: true,
        columnUnique: true,
        check: true,
      }),
      new ChessMove({
        source: { rowNumber: 6, columnNumber: 2 },
        target: { rowNumber: 5, columnNumber: 2 },
        piece: "P",
        boardSize,
        player: "w",
        enPassant: null,
        rowUnique: true,
        columnUnique: true,
        check: true,
        finalMove: true,
      }),
      new ChessMove({
        source: { rowNumber: 6, columnNumber: 2 },
        target: { rowNumber: 5, columnNumber: 1 },
        piece: "P",
        boardSize,
        player: "w",
        capture: "P",
        enPassant: null,
        rowUnique: true,
        columnUnique: true,
        check: true,
      }),
      new ChessMove({
        source: { rowNumber: 6, columnNumber: 4 },
        target: { rowNumber: 5, columnNumber: 4 },
        piece: "P",
        boardSize,
        player: "w",
        enPassant: null,
        rowUnique: true,
        columnUnique: true,
        check: true,
        finalMove: true,
      }),
      new ChessMove({
        source: { rowNumber: 6, columnNumber: 4 },
        target: { rowNumber: 4, columnNumber: 4 },
        piece: "P",
        boardSize,
        player: "w",
        enPassant: null,
        rowUnique: true,
        columnUnique: true,
        check: true,
      }),
      new ChessMove({
        source: { rowNumber: 6, columnNumber: 5 },
        target: { rowNumber: 5, columnNumber: 5 },
        piece: "P",
        boardSize,
        player: "w",
        enPassant: null,
        rowUnique: true,
        columnUnique: true,
        check: true,
      }),
      new ChessMove({
        source: { rowNumber: 6, columnNumber: 5 },
        target: { rowNumber: 5, columnNumber: 6 },
        piece: "P",
        boardSize,
        player: "w",
        capture: "N",
        enPassant: null,
        rowUnique: true,
        columnUnique: true,
        check: true,
      }),
    ],
    gameOver: false,
    reason: null,
    message: "White to move",
    winner: null,
  });
});

test("performMove and getGameStatus for a checkmate", () => {
  const chessState = ChessState.fromFen(
    "3b1q1q/1N2PRQ1/rR3KBr/B4PP1/2Pk1r1b/1P4N1/2P1PP2/8 w - -"
  );
  const finalChessState = performMove(
    chessState,
    new ChessMove({
      source: { rowNumber: 6, columnNumber: 4 },
      target: { rowNumber: 5, columnNumber: 4 },
      piece: "P",
      boardSize,
      player: "w",
      enPassant: null,
      rowUnique: true,
      columnUnique: true,
      check: true,
      finalMove: true,
    })
  );
  expect(getGameStatus(finalChessState)).toStrictEqual({
    gameOver: true,
    legalMoves: [],
    message: "Checkmate - White wins!",
    reason: "checkmate",
    winner: "w",
  });
});