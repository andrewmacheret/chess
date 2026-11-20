import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { getGameStatus, performMove, ChessState } from "../logic";

import ChessSquare from "./ChessSquare";
import ChessPiece from "./ChessPiece";

// the shortest time a computer move takes, so the 500ms move animation can finish
const minComputerMoveMillis = 1000;

// a press that moves less than this many pixels is a click, not a drag
const dragThresholdPixels = 5;

const squaresMatch = (a, b) =>
  a.rowNumber === b.rowNumber && a.columnNumber === b.columnNumber;

export default function ChessBoard({
  players, // 2-length array containing player classes
  newGame, // function to reset
}) {
  const [chessState, setChessState] = useState(() => ChessState.starting());
  const [futureChessStates, setFutureChessStates] = useState([]);
  const [paused, setPaused] = useState(false);
  const [thinking, setThinking] = useState(false);
  // square of the piece picked by clicking it
  const [selected, setSelected] = useState(null);
  // { source, x, y, over } while a piece is being dragged
  const [drag, setDrag] = useState(null);
  // the pointer currently pressed on the board
  const pressRef = useRef(null);
  const squaresRef = useRef(null);

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
    setSelected(null);
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
    setSelected(null);
  }, [futureChessStates]);

  // find the square under a point on the screen, or null if it's off the board
  const getSquareAt = useCallback(
    (clientX, clientY) => {
      const element = squaresRef.current;
      const rect = element.getBoundingClientRect();
      const x = clientX - rect.left - element.clientLeft;
      const y = clientY - rect.top - element.clientTop;
      const columnNumber = Math.floor((x / element.clientWidth) * width);
      const rowNumber = Math.floor((y / element.clientHeight) * height);
      if (
        !(columnNumber >= 0 && columnNumber < width) ||
        !(rowNumber >= 0 && rowNumber < height)
      ) {
        return null;
      }
      return getSquareRef(rowNumber, columnNumber);
    },
    [width, height, getSquareRef]
  );

  // ignore a selection left over from a turn that's no longer playable
  const selectedSquare = selected && canMove(selected) ? selected : null;

  const clickSquare = useCallback(
    (square) => {
      if (selectedSquare && canMove(selectedSquare, square)) {
        setSelected(null);
        doMove(selectedSquare, square);
      } else if (square !== selectedSquare && canMove(square)) {
        setSelected(square);
      } else {
        setSelected(null);
      }
    },
    [selectedSquare, canMove, doMove]
  );

  // mouse, touch and pen all come through these pointer events
  const onPointerDown = useCallback(
    (event) => {
      // one press at a time, a second finger is ignored
      const press = pressRef.current;
      if ((press && press.pointerId !== event.pointerId) || event.button !== 0) {
        return;
      }
      const squareElement = event.target.closest("[data-square]");
      if (!squareElement) {
        return;
      }
      const square = squareElement.dataset.square;
      pressRef.current = {
        pointerId: event.pointerId,
        square,
        canDrag: canMove(square),
        dragging: false,
        startX: event.clientX,
        startY: event.clientY,
      };
      // keep getting move and up events even if the pointer leaves the board
      event.currentTarget.setPointerCapture(event.pointerId);
    },
    [canMove]
  );

  const onPointerMove = useCallback(
    (event) => {
      const press = pressRef.current;
      if (!press || press.pointerId !== event.pointerId) {
        return;
      }
      const x = event.clientX - press.startX;
      const y = event.clientY - press.startY;
      if (!press.dragging) {
        if (!press.canDrag || Math.hypot(x, y) < dragThresholdPixels) {
          return;
        }
        press.dragging = true;
      }
      setDrag({
        source: press.square,
        x,
        y,
        over: getSquareAt(event.clientX, event.clientY),
      });
    },
    [getSquareAt]
  );

  const onPointerUp = useCallback(
    (event) => {
      const press = pressRef.current;
      if (!press || press.pointerId !== event.pointerId) {
        return;
      }
      pressRef.current = null;
      const x = event.clientX - press.startX;
      const y = event.clientY - press.startY;
      if (press.dragging) {
        setDrag(null);
        setSelected(null);
        const target = getSquareAt(event.clientX, event.clientY);
        if (target && canMove(press.square, target)) {
          doMove(press.square, target);
        }
      } else if (Math.hypot(x, y) < dragThresholdPixels) {
        clickSquare(press.square);
      }
    },
    [getSquareAt, canMove, doMove, clickSquare]
  );

  const cancelPress = useCallback((event) => {
    const press = pressRef.current;
    if (!press || press.pointerId !== event.pointerId) {
      return;
    }
    pressRef.current = null;
    setDrag(null);
  }, []);

  // ask the computer for a move whenever the current player / state changes
  // (humans move by dragging or clicking instead)
  useEffect(() => {
    if (gameStatus.gameOver || paused || currentPlayer.isHuman()) {
      return;
    }
    let cancelled = false;
    const startMillis = Date.now();
    setThinking(true);
    currentPlayer
      .requestMove(fen)
      .then(async ({ source, target, promotion }) => {
        // give the last move's animation time to finish before moving again
        const waitMillis = minComputerMoveMillis - (Date.now() - startMillis);
        if (waitMillis > 0) {
          await new Promise((resolve) => setTimeout(resolve, waitMillis));
        }
        // skip the move if the game changed while we waited (undo, pause, etc)
        if (source && !cancelled) {
          doMove(source, target, promotion);
        }
      })
      .catch((err) => {
        console.error(err);
      })
      .finally(() => {
        if (!cancelled) {
          setThinking(false);
        }
      });
    return () => {
      cancelled = true;
      setThinking(false);
    };
  }, [currentPlayer, fen, gameStatus.gameOver, doMove, paused]);

  const pause = useCallback(() => {
    setPaused(true);
  }, []);
  const resume = useCallback(() => {
    setPaused(false);
  }, []);

  // only animate moves the computer made, a human already moved the piece there
  const lastPlayer = players[chessState.getPlayer() === "w" ? "b" : "w"];
  const animateLastMove = !lastPlayer.isHuman();
  const hasComputer = Object.values(players).some((player) => !player.isHuman());

  // the piece whose legal moves are shown
  const activeSource = drag ? drag.source : selectedSquare;

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
            animate={animateLastMove}
            move={move}
            key={pieceLetter}
            pieceLetter={pieceLetter}
            draggable={canMove(ref)}
            dragOffset={drag && drag.source === ref ? drag : null}
          />
        );

        if (move && move.capture) {
          pieces.push(
            <ChessPiece
              animate={animateLastMove}
              capture={true}
              key={"x" + pieceLetter}
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
            animate={animateLastMove}
            move={lastMove}
            key={"x" + pieceLetter}
            pieceLetter={lastMove.capture}
          />
        );
      }

      squares.push(
        <ChessSquare
          name={ref}
          key={ref}
          rowNumber={rowNumber}
          columnNumber={columnNumber}
          boardSize={{ width, height }}
          droppable={Boolean(activeSource) && canMove(activeSource, ref)}
          over={Boolean(drag) && drag.over === ref}
          selected={!drag && selectedSquare === ref}
          occupied={Boolean(pieceLetter)}
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
    <div className="board-wrapper">
      <div className="board">
        <div
          className="squares"
          ref={squaresRef}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={cancelPress}
          onLostPointerCapture={cancelPress}
        >
          {squares}
        </div>
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
        <div className="button-group game-buttons">
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
          {hasComputer && (
            <div>
              {paused ? (
                <button className="resume" onClick={resume}>
                  Resume
                </button>
              ) : (
                <button className="pause" onClick={pause}>
                  Pause
                </button>
              )}
              {/* always rendered so the buttons don't shift when it shows */}
              <div className={`thinking${thinking ? "" : " thinking-hidden"}`} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
