import React, { useCallback, useEffect, useMemo, useState } from "react";

import { HTML5Backend } from "react-dnd-html5-backend";
import { TouchBackend } from "react-dnd-touch-backend";
import { DndProvider } from "react-dnd";

import { getGameStatus, performMove, ChessState } from "../logic";

import ChessSquare from "./ChessSquare";
import ChessPiece from "./ChessPiece";

// use the right drag & drop backend (mobile vs web)
const DragBackend =
  "ontouchstart" in document.documentElement ? TouchBackend : HTML5Backend;

const squaresMatch = (a, b) =>
  a.rowNumber === b.rowNumber && a.columnNumber === b.columnNumber;

export default function ChessBoard({
  players, // 2-length array containing player classes
  newGame, // function to reset
}) {
  const [chessState, setChessState] = useState(() => ChessState.starting());
  const [futureChessStates, setFutureChessStates] = useState([]);

  const { width, height } = chessState.getBoardSize();

  const gameStatus = useMemo(() => {
    const g = getGameStatus(chessState);
    return g;
  }, [chessState]);

  const fen = useMemo(() => chessState.toFen(), [chessState]);

  const currentPlayer = useMemo(
    () => players[chessState.getPlayer()],
    [players, chessState]
  );

  const getRowColumn = useCallback(
    (squareRef) => {
      if (!squareRef) return null;
      var columnNumber = squareRef.charCodeAt(0) - "a".charCodeAt();
      var rowNumber = height - (squareRef.charCodeAt(1) - "1".charCodeAt()) - 1;
      return { rowNumber, columnNumber };
    },
    [height]
  );

  const getSquareRef = useCallback(
    (rowNumber, columnNumber) => {
      var row = String.fromCharCode("a".charCodeAt() + columnNumber);
      var column = String.fromCharCode(
        "1".charCodeAt() + (height - rowNumber - 1)
      );
      return row + column;
    },
    [height]
  );

  const getLegalMoves = useCallback(
    (sourceRef, targetRef, promotion) => {
      const move = {
        source: getRowColumn(sourceRef),
        target: getRowColumn(targetRef),
      };

      const legalMoves = [];

      for (let m = 0; m < gameStatus.legalMoves.length; m++) {
        const legalMove = gameStatus.legalMoves[m];

        // source must match
        if (!squaresMatch(legalMove.source, move.source)) {
          continue;
        }

        // if target is specified, target must match
        if (move.target && !squaresMatch(legalMove.target, move.target)) {
          continue;
        }

        // if promotion is specified, promotion must match
        if (
          promotion &&
          promotion.toUpperCase() !== (legalMove.promotion || "").toUpperCase()
        ) {
          continue;
        }

        legalMoves.push(legalMove);
      }

      return legalMoves;
    },
    [gameStatus.legalMoves, getRowColumn]
  );

  const canMove = useCallback(
    (sourceRef, targetRef, promotion) => {
      return (
        currentPlayer.isHuman() &&
        getLegalMoves(sourceRef, targetRef, promotion).length !== 0
      );
    },
    [currentPlayer, getLegalMoves]
  );

  const doMove = useCallback(
    (sourceRef, targetRef, promotion) => {
      const legalMoves = getLegalMoves(sourceRef, targetRef, promotion);

      let move;
      if (legalMoves.length === 0) {
        throw Error(`Impossible attempt to move ${sourceRef} -> ${targetRef}`);
      } else if (legalMoves.length === 1) {
        move = legalMoves[0];
      } else {
        // the only way this could happen is if we're promoting and there are choices
        // lets do this the easy way
        const choices = legalMoves.map(({ promotion }) => promotion);
        const choice = currentPlayer.choosePromotion(
          sourceRef,
          targetRef,
          choices
        );
        if (!choice) {
          return;
        }
        move = legalMoves.find(
          ({ promotion }) => promotion === choice.promotion
        );
      }

      // perform the move
      const newChessState = performMove(chessState, move);
      setChessState(newChessState);
      setFutureChessStates([]);
    },
    [currentPlayer, chessState, getLegalMoves]
  );

  const undo = useCallback(() => {
    const lastChessState = chessState.getLastState();
    if (!lastChessState) {
      throw Error(`Cannot undo`);
    }
    const newFutureChessStates = [...futureChessStates, chessState];

    // store the last chess state
    setChessState(lastChessState);
    setFutureChessStates(newFutureChessStates);
  }, [chessState, futureChessStates]);

  const redo = useCallback(() => {
    if (futureChessStates.length === 0) {
      throw Error(`Cannot redo`);
    }
    const newFutureChessStates = [...futureChessStates];
    const nextChessState = newFutureChessStates.pop();

    // store the next chess state
    setChessState(nextChessState);
    setFutureChessStates(newFutureChessStates);
  }, [futureChessStates]);

  // request a move whenever the current player / state changes
  useEffect(() => {
    if (!gameStatus.gameOver) {
      currentPlayer
        .requestMove(fen)
        .then(({ source, target, promotion }) => {
          if (source) {
            doMove(source, target, promotion);
          }
        })
        .catch((err) => {
          console.error(err);
        });
    }
  }, [currentPlayer, fen, gameStatus.gameOver, doMove]);

  // animate if computer, don't animate if human
  const animate = currentPlayer && !currentPlayer.isHuman();

  const squares = [];
  for (let rowNumber = 0; rowNumber < height; rowNumber++) {
    for (let columnNumber = 0; columnNumber < width; columnNumber++) {
      const ref = getSquareRef(rowNumber, columnNumber);

      const lastMove = chessState.getLastMove();

      const pieces = [];
      const pieceLetter = chessState.getPiece({
        rowNumber: rowNumber,
        columnNumber: columnNumber,
      });
      if (pieceLetter) {
        let move = null;
        if (
          lastMove &&
          lastMove.target.rowNumber === rowNumber &&
          lastMove.target.columnNumber === columnNumber
        ) {
          move = lastMove;
        } else if (
          lastMove &&
          lastMove.secondaryMove &&
          lastMove.secondaryMove.target.rowNumber === rowNumber &&
          lastMove.secondaryMove.target.columnNumber === columnNumber
        ) {
          move = lastMove.secondaryMove;
        }

        pieces.push(
          <ChessPiece
            animate={animate}
            move={move}
            key={pieceLetter}
            originSquare={ref}
            pieceLetter={pieceLetter}
            canMove={canMove}
          />
        );

        if (move && move.capture) {
          pieces.push(
            <ChessPiece
              animate={animate}
              capture={true}
              key={"x" + pieceLetter}
              originSquare={ref}
              pieceLetter={move.capture}
            />
          );
        }
      } else if (
        lastMove &&
        lastMove.enPassant &&
        lastMove.enPassant.rowNumber === rowNumber &&
        lastMove.enPassant.columnNumber === columnNumber
      ) {
        pieces.push(
          <ChessPiece
            animate={animate}
            move={lastMove}
            key={"x" + pieceLetter}
            originSquare={ref}
            pieceLetter={lastMove.capture}
          />
        );
      }

      squares.push(
        <ChessSquare
          animate={animate}
          name={ref}
          key={ref}
          rowNumber={rowNumber}
          columnNumber={columnNumber}
          boardSize={{ width, height }}
          canMove={canMove}
          move={doMove}
        >
          {pieces}
        </ChessSquare>
      );
    }
  }

  const captured = chessState.getPlayers().map((player) => (
    <div key={player} className={`captured-${player}`}>
      {chessState.getCaptured(player).map((capture, index) => (
        <ChessPiece key={`${player}-${index}`} pieceLetter={capture} />
      ))}
    </div>
  ));

  const moves = chessState.getPlayers().map((player) => (
    <div key={`${player}`} className={`moves-${player}`}>
      {chessState.getMoves(player).map((move, index) => (
        <div key={`${player}-${index}`} className="move">
          {move.toPGN()}
        </div>
      ))}
    </div>
  ));

  return (
    <DndProvider backend={DragBackend}>
      <div className="board-wrapper">
        <div className="board">
          <div className="squares">{squares}</div>
        </div>
        <div className="captured">{captured}</div>
        <div className="moves">{moves}</div>
        <div className="game-info">
          <div id="game-state">{gameStatus.message}</div>
          <div id="fen">
            <a href="https://wikipedia.org/wiki/Forsyth%E2%80%93Edwards_Notation">
              FEN:
            </a>{" "}
            {fen}
          </div>
          <div className="button-group">
            <button
              className="undo"
              onClick={undo}
              disabled={!chessState.getLastState()}
            >
              Undo
            </button>
            <button
              className="redo"
              onClick={redo}
              disabled={futureChessStates.length === 0}
            >
              Redo
            </button>
            <button className="new-game" onClick={newGame}>
              New Game
            </button>
          </div>
        </div>
      </div>
    </DndProvider>
  );
}
